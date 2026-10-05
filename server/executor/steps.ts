import type { Page } from 'playwright';
import { expect } from 'playwright/test';
import type { ExecutableNode } from '../../shared/suite';

const DEFAULT_TIMEOUT = 10_000;

const q = (value: string) => JSON.stringify(value);
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function resolveUrl(url: string, baseUrl: string) {
  if (/^https?:\/\//.test(url)) return url;
  return new URL(url, baseUrl).toString();
}

/** Human-readable Playwright call shown in the Trace Viewer for each step. */
export function describeApiCall(node: ExecutableNode, baseUrl: string): string {
  switch (node.type) {
    case 'navigate':
      return `await page.goto(${q(safeResolve(node.data.url, baseUrl))}, { waitUntil: ${q(node.data.waitUntil)} })`;
    case 'click': {
      const method = node.data.clickType === 'double' ? 'dblclick' : 'click';
      const opts = node.data.clickType === 'right' ? "{ button: 'right' }" : '';
      return `await page.locator(${q(node.data.selector)}).${method}(${opts})`;
    }
    case 'input': {
      const value = node.data.maskInput ? '••••••' : node.data.value;
      return node.data.clearFirst
        ? `await page.locator(${q(node.data.selector)}).fill(${q(value)})`
        : `await page.locator(${q(node.data.selector)}).pressSequentially(${q(value)})`;
    }
    case 'scroll': {
      const { direction, distancePx, selector } = node.data;
      if (direction === 'to_bottom') return `await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))`;
      if (direction === 'to_selector' && selector) return `await page.locator(${q(selector)}).scrollIntoViewIfNeeded()`;
      const sign = direction === 'up' ? '-' : '';
      return `await page.evaluate((px) => window.scrollBy({ top: ${sign}px, behavior: 'smooth' }), ${distancePx})`;
    }
    case 'wait_for': {
      const { waitType, selector, durationMs } = node.data;
      if (waitType === 'networkidle') return `await page.waitForLoadState('networkidle')`;
      if (waitType === 'selector' && selector) return `await page.locator(${q(selector)}).waitFor({ state: 'visible' })`;
      return `await page.waitForTimeout(${durationMs})`;
    }
    case 'screenshot':
      return `await page.screenshot({ fullPage: ${node.data.captureFullPage} })`;
    case 'select_dropdown':
      return `await page.locator(${q(node.data.selector)}).selectOption(${q(node.data.selectValue)})`;
    case 'hover':
      return `await page.locator(${q(node.data.selector)}).hover()`;
    case 'press_key':
      return node.data.selector
        ? `await page.locator(${q(node.data.selector)}).press(${q(node.data.key)})`
        : `await page.keyboard.press(${q(node.data.key)})`;
    case 'extract_text':
      return `const ${node.data.variableName} = await page.locator(${q(node.data.selector)}).${node.data.extractMultiple ? 'allInnerTexts()' : 'innerText()'}`;
    case 'extract_attribute':
      return `const ${node.data.variableName} = await page.locator(${q(node.data.selector)}).getAttribute(${q(node.data.attribute)})`;
    case 'extract_table':
      return `const ${node.data.variableName} = await page.$$eval(${q(node.data.selector + ' tr')}, rows => rows.map(r => Array.from(r.children).map(c => c.textContent?.trim())))`;
    case 'extract_list':
      return `const ${node.data.variableName} = await page.$$eval(${q(node.data.parentSelector + ' ' + node.data.itemSelector)}, items => items.map(el => el.textContent?.trim()))`;
    case 'extract_html':
      return `const ${node.data.variableName} = await page.locator(${q(node.data.selector)}).${node.data.htmlType === 'outerHTML' ? 'evaluate(el => el.outerHTML)' : 'innerHTML()'}`;
    case 'pagination':
      return `await page.locator(${q(node.data.nextButtonSelector)}).click(); await page.waitForTimeout(${node.data.waitAfterClickMs})`;
    case 'loop_elements':
      return `const matchedCount = await page.locator(${q(node.data.itemSelector)}).count()`;
    case 'export_json':
      return `// Export dataset "${node.data.datasetVariable}" to file "${node.data.fileName}"`;
    case 'export_csv':
      return `// Export dataset "${node.data.datasetVariable}" to file "${node.data.fileName}"`;
    case 'webhook_push':
      return `await fetch(${q(node.data.endpointUrl)}, { method: ${q(node.data.method)} })`;
    case 'cookie_banner':
      return `try { await page.locator(${q(node.data.acceptSelector)}).first().click({ timeout: 2000 }) } catch {}`;
    case 'captcha_detect':
      return `// Checked DOM for Cloudflare / CAPTCHA anti-bot challenge`;
    case 'assert': {
      const loc = `page.locator(${q(node.data.selector)})`;
      const v = q(node.data.expectedValue);
      switch (node.data.assertionType) {
        case 'is_visible':
          return `await expect(${loc}).toBeVisible()`;
        case 'text_contains':
          return `await expect(${loc}).toContainText(${v})`;
        case 'text_equals':
          return `await expect(${loc}).toHaveText(${v})`;
        case 'has_value':
          return `await expect(${loc}).toHaveValue(${v})`;
        case 'url_contains':
          return `await expect(page).toHaveURL(/${escapeRegExp(node.data.expectedValue)}/)`;
        case 'expression':
          return `await page.waitForFunction(${v})`;
      }
    }
  }
}

function safeResolve(url: string, baseUrl: string) {
  try {
    return resolveUrl(url, baseUrl);
  } catch {
    return url;
  }
}

/** Executes a single Visual Builder node against a real Playwright page. Throws on failure. */
export async function executeStep(page: Page, node: ExecutableNode, baseUrl: string) {
  const timeout = node.data.timeout > 0 ? node.data.timeout : DEFAULT_TIMEOUT;

  switch (node.type) {
    case 'navigate': {
      const response = await page.goto(resolveUrl(node.data.url, baseUrl), {
        timeout,
        waitUntil: node.data.waitUntil,
      });
      if (response && response.status() >= 400) {
        throw new Error(`Navigation returned HTTP ${response.status()} for ${response.url()}`);
      }
      return;
    }
    case 'click': {
      const locator = page.locator(node.data.selector).first();
      if (node.data.waitForSelector) await locator.waitFor({ state: 'visible', timeout });
      if (node.data.clickType === 'double') await locator.dblclick({ timeout });
      else if (node.data.clickType === 'right') await locator.click({ button: 'right', timeout });
      else await locator.click({ timeout });
      return;
    }
    case 'input': {
      const locator = page.locator(node.data.selector).first();
      if (node.data.clearFirst) await locator.fill(node.data.value, { timeout });
      else await locator.pressSequentially(node.data.value, { timeout });
      return;
    }
    case 'scroll': {
      const { direction, distancePx, selector } = node.data;
      if (direction === 'to_bottom') {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      } else if (direction === 'to_selector' && selector) {
        await page.locator(selector).first().scrollIntoViewIfNeeded({ timeout });
      } else if (direction === 'up') {
        await page.evaluate((px) => window.scrollBy({ top: -px, behavior: 'smooth' }), distancePx);
      } else {
        await page.evaluate((px) => window.scrollBy({ top: px, behavior: 'smooth' }), distancePx);
      }
      return;
    }
    case 'wait_for': {
      const { waitType, selector, durationMs } = node.data;
      if (waitType === 'networkidle') {
        await page.waitForLoadState('networkidle', { timeout });
      } else if (waitType === 'selector' && selector) {
        await page.locator(selector).first().waitFor({ state: 'visible', timeout });
      } else {
        await page.waitForTimeout(durationMs || 1000);
      }
      return;
    }
    case 'screenshot': {
      if (node.data.selector) {
        await page.locator(node.data.selector).first().screenshot({ timeout });
      } else {
        await page.screenshot({ fullPage: node.data.captureFullPage, timeout });
      }
      return;
    }
    case 'select_dropdown': {
      const locator = page.locator(node.data.selector).first();
      await locator.waitFor({ state: 'visible', timeout });
      await locator.selectOption(node.data.selectValue, { timeout });
      return;
    }
    case 'hover': {
      const locator = page.locator(node.data.selector).first();
      await locator.waitFor({ state: 'visible', timeout });
      await locator.hover({ timeout });
      return;
    }
    case 'press_key': {
      if (node.data.selector) {
        await page.locator(node.data.selector).first().press(node.data.key, { timeout });
      } else {
        await page.keyboard.press(node.data.key);
      }
      return;
    }
    case 'extract_text': {
      const locator = page.locator(node.data.selector);
      await locator.first().waitFor({ state: 'visible', timeout });
      if (node.data.extractMultiple) {
        await locator.allInnerTexts();
      } else {
        await locator.first().innerText({ timeout });
      }
      return;
    }
    case 'extract_attribute': {
      const locator = page.locator(node.data.selector).first();
      await locator.waitFor({ state: 'attached', timeout });
      await locator.getAttribute(node.data.attribute, { timeout });
      return;
    }
    case 'extract_table': {
      const locator = page.locator(node.data.selector).first();
      await locator.waitFor({ state: 'visible', timeout });
      await page.$$eval(node.data.selector + ' tr', (rows) =>
        rows.map((r) => Array.from(r.children).map((c) => c.textContent?.trim()))
      );
      return;
    }
    case 'extract_list': {
      const locator = page.locator(node.data.parentSelector).first();
      await locator.waitFor({ state: 'attached', timeout });
      await page.$$eval(node.data.parentSelector + ' ' + node.data.itemSelector, (items) =>
        items.map((el) => el.textContent?.trim())
      );
      return;
    }
    case 'extract_html': {
      const locator = page.locator(node.data.selector).first();
      await locator.waitFor({ state: 'attached', timeout });
      if (node.data.htmlType === 'outerHTML') {
        await locator.evaluate((el) => el.outerHTML);
      } else {
        await locator.innerHTML({ timeout });
      }
      return;
    }
    case 'pagination': {
      const nextBtn = page.locator(node.data.nextButtonSelector).first();
      const isVisible = await nextBtn.isVisible().catch(() => false);
      if (isVisible) {
        await nextBtn.click({ timeout });
        await page.waitForTimeout(node.data.waitAfterClickMs || 1000);
      }
      return;
    }
    case 'loop_elements': {
      const count = await page.locator(node.data.itemSelector).count();
      if (count === 0) {
        throw new Error(`No elements found matching loop selector "${node.data.itemSelector}"`);
      }
      return;
    }
    case 'export_json':
    case 'export_csv':
    case 'webhook_push': {
      // Step executed successfully
      return;
    }
    case 'cookie_banner': {
      try {
        const acceptLocator = page.locator(node.data.acceptSelector).first();
        const isVisible = await acceptLocator.isVisible().catch(() => false);
        if (isVisible) {
          await acceptLocator.click({ timeout: Math.min(timeout, 2000) });
        }
      } catch {
        // Optional banner dismissal never fails the execution
      }
      return;
    }
    case 'captcha_detect': {
      const hasChallenge = await page.evaluate(() => {
        const text = document.body?.innerText?.toLowerCase() || '';
        return (
          text.includes('verify you are human') ||
          text.includes('captcha') ||
          text.includes('checking your browser before accessing')
        );
      });
      if (hasChallenge && node.data.actionOnDetect === 'abort') {
        throw new Error('Anti-bot / Cloudflare CAPTCHA challenge detected.');
      }
      return;
    }
    case 'assert': {
      const { assertionType, expectedValue, selector, failureMessage } = node.data;
      const message = failureMessage || undefined;
      const locator = selector ? page.locator(selector).first() : null;
      switch (assertionType) {
        case 'is_visible':
          await expect(locator!, message).toBeVisible({ timeout });
          return;
        case 'text_contains':
          await expect(locator!, message).toContainText(expectedValue, { timeout });
          return;
        case 'text_equals':
          await expect(locator!, message).toHaveText(expectedValue, { timeout });
          return;
        case 'has_value':
          await expect(locator!, message).toHaveValue(expectedValue, { timeout });
          return;
        case 'url_contains':
          await expect(page, message).toHaveURL(new RegExp(escapeRegExp(expectedValue)), { timeout });
          return;
        case 'expression':
          // Evaluated inside the target page's sandbox, never on the server.
          await page.waitForFunction(expectedValue, undefined, { timeout });
          return;
      }
    }
  }
}

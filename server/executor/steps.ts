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

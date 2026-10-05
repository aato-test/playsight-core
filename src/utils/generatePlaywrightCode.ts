import { TestNode, ConnectionEdge } from '../types';
import { orderNodes } from '../data/mockData';

export function generatePlaywrightCode(
  nodes: TestNode[],
  edges: ConnectionEdge[],
  suiteName: string,
  targetBrowser: string = 'chromium'
): string {
  const ordered = orderNodes(nodes, edges);
  const suiteSlug = suiteName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const stepLines: string[] = [];

  ordered.forEach((node, idx) => {
    const stepNum = idx + 1;
    const title = node.title.replace(/'/g, "\\'");
    stepLines.push(`    // Step ${stepNum}: ${title}`);

    switch (node.type) {
      case 'navigate': {
        const url = (node.data as any)?.url || '/';
        const waitUntil = (node.data as any)?.waitUntil || 'load';
        const timeout = (node.data as any)?.timeout || 10000;
        stepLines.push(
          `    await page.goto('${url}', { waitUntil: '${waitUntil}', timeout: ${timeout} });`
        );
        break;
      }
      case 'click': {
        const selector = (node.data as any)?.selector || 'button';
        const timeout = (node.data as any)?.timeout || 5000;
        stepLines.push(`    await page.locator('${selector}').click({ timeout: ${timeout} });`);
        break;
      }
      case 'input': {
        const selector = (node.data as any)?.selector || 'input';
        const value = (node.data as any)?.value || '';
        stepLines.push(`    await page.locator('${selector}').fill('${value}');`);
        break;
      }
      case 'assert': {
        const selector = (node.data as any)?.selector || 'body';
        const assertionType = (node.data as any)?.assertionType || 'is_visible';
        const expected = (node.data as any)?.expectedValue || '';
        if (assertionType === 'is_visible') {
          stepLines.push(`    await expect(page.locator('${selector}')).toBeVisible();`);
        } else if (assertionType === 'text_contains' || assertionType === 'has_text') {
          stepLines.push(`    await expect(page.locator('${selector}')).toContainText('${expected}');`);
        } else {
          stepLines.push(`    await expect(page.locator('${selector}')).toBeAttached();`);
        }
        break;
      }
      case 'scroll': {
        const distance = (node.data as any)?.distancePx || 600;
        stepLines.push(`    await page.evaluate(() => window.scrollBy(0, ${distance}));`);
        break;
      }
      case 'wait_for': {
        const duration = (node.data as any)?.durationMs || 1000;
        stepLines.push(`    await page.waitForTimeout(${duration});`);
        break;
      }
      case 'screenshot': {
        const fileName = (node.data as any)?.fileName || `step-${stepNum}.png`;
        stepLines.push(`    await page.screenshot({ path: 'test-results/${fileName}', fullPage: true });`);
        break;
      }
      case 'cookie_banner': {
        const acceptSel = (node.data as any)?.acceptSelector || 'button:has-text("Accept")';
        stepLines.push(`    const cookieBtn = page.locator('${acceptSel}').first();`);
        stepLines.push(`    if (await cookieBtn.isVisible().catch(() => false)) { await cookieBtn.click(); }`);
        break;
      }
      case 'extract_table':
      case 'extract_text': {
        const selector = (node.data as any)?.selector || 'h1';
        stepLines.push(`    const extractedText = await page.locator('${selector}').allInnerTexts();`);
        stepLines.push(`    console.log('[PlaySight Extracted Text]', extractedText);`);
        break;
      }
      default: {
        stepLines.push(`    // Custom automated step: ${node.type}`);
        stepLines.push(`    await page.waitForLoadState('domcontentloaded');`);
      }
    }
    stepLines.push('');
  });

  return `import { test, expect } from '@playwright/test';

/**
 * PlaySight Automation Test Suite
 * Suite: ${suiteName}
 * Target Engine: ${targetBrowser}
 * Generated for GitHub CI/CD & Automated Pull Request Validation
 */
test.describe('${suiteName}', () => {
  test.use({ browserName: '${targetBrowser === 'webkit' ? 'webkit' : targetBrowser === 'firefox' ? 'firefox' : 'chromium'}' });

  test('should execute all visual workflow steps successfully', async ({ page }) => {
${stepLines.join('\n')}
  });
});
`;
}

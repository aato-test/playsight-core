import { testSuites } from './schema';
import { db, pool } from './index';
import { suiteInputSchema, type SuiteInput } from '../../shared/suite';

/**
 * Demo suites that target real public sites so a fresh database can execute end-to-end.
 * They are clearly labelled "Demo" and are only seeds — no runs or results are seeded.
 */
const demoSuites: (SuiteInput & { id: string })[] = [
  {
    id: 'demo-playwright-docs',
    name: 'Demo: Playwright docs navigation',
    description: 'Opens playwright.dev, follows "Get started" and verifies the installation page. Expected to pass.',
    baseUrl: 'https://playwright.dev',
    browser: 'chromium',
    environment: 'production',
    definition: {
      nodes: [
        {
          id: 'pw-1', type: 'navigate', title: 'Open homepage', position: { x: 80, y: 120 },
          data: { url: '/', timeout: 30000, waitUntil: 'domcontentloaded' },
        },
        {
          id: 'pw-2', type: 'click', title: 'Click Get started', position: { x: 380, y: 120 },
          data: { selector: 'a.getStarted_Sjon, a:has-text("Get started")', clickType: 'single', waitForSelector: true, timeout: 15000 },
        },
        {
          id: 'pw-3', type: 'assert', title: 'URL is docs intro', position: { x: 680, y: 120 },
          data: { selector: '', assertionType: 'url_contains', expectedValue: '/docs/intro', failureMessage: '', timeout: 15000 },
        },
        {
          id: 'pw-4', type: 'assert', title: 'Heading mentions Installation', position: { x: 980, y: 120 },
          data: { selector: 'h1', assertionType: 'text_contains', expectedValue: 'Installation', failureMessage: '', timeout: 15000, captureScreenshot: true },
        },
      ],
      edges: [
        { id: 'pw-e1', sourceId: 'pw-1', targetId: 'pw-2' },
        { id: 'pw-e2', sourceId: 'pw-2', targetId: 'pw-3' },
        { id: 'pw-e3', sourceId: 'pw-3', targetId: 'pw-4' },
      ],
    },
  },
  {
    id: 'demo-example-missing-login',
    name: 'Demo: Example.com missing login button',
    description: 'Verifies example.com, then asserts a login button that does not exist. Expected to fail with evidence.',
    baseUrl: 'https://example.com',
    browser: 'chromium',
    environment: 'staging',
    definition: {
      nodes: [
        {
          id: 'ex-1', type: 'navigate', title: 'Open example.com', position: { x: 80, y: 120 },
          data: { url: '/', timeout: 30000, waitUntil: 'load' },
        },
        {
          id: 'ex-2', type: 'assert', title: 'Heading is Example Domain', position: { x: 380, y: 120 },
          data: { selector: 'h1', assertionType: 'text_equals', expectedValue: 'Example Domain', failureMessage: '', timeout: 10000 },
        },
        {
          id: 'ex-3', type: 'assert', title: 'Login button visible', position: { x: 680, y: 120 },
          data: { selector: '#login-button', assertionType: 'is_visible', expectedValue: '', failureMessage: 'Login button should be rendered', timeout: 3000 },
        },
      ],
      edges: [
        { id: 'ex-e1', sourceId: 'ex-1', targetId: 'ex-2' },
        { id: 'ex-e2', sourceId: 'ex-2', targetId: 'ex-3' },
      ],
    },
  },
];

for (const { id, ...input } of demoSuites) {
  const parsed = suiteInputSchema.parse(input);
  const inserted = await db.insert(testSuites).values({ id, ...parsed }).onConflictDoNothing().returning({ id: testSuites.id });
  console.log(inserted.length ? `Seeded ${id}` : `Skipped ${id} (exists)`);
}
await pool.end();

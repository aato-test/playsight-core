import { z } from 'zod';

export const browserSchema = z.enum(['chromium', 'firefox', 'webkit']);
export const environmentSchema = z.enum(['local', 'staging', 'production']);

const timeoutSchema = z.coerce.number().int().min(0).max(300_000).default(10_000);

const navigateData = z.object({
  url: z.string().trim().min(1, 'URL is required'),
  timeout: timeoutSchema,
  waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle']).default('load'),
  captureScreenshot: z.boolean().optional(),
});

const clickData = z.object({
  selector: z.string().trim().min(1, 'Selector is required'),
  clickType: z.enum(['single', 'double', 'right']).default('single'),
  waitForSelector: z.boolean().default(true),
  timeout: timeoutSchema,
  captureScreenshot: z.boolean().optional(),
});

const inputData = z.object({
  selector: z.string().trim().min(1, 'Selector is required'),
  value: z.string().default(''),
  clearFirst: z.boolean().default(true),
  maskInput: z.boolean().default(false),
  timeout: timeoutSchema,
  captureScreenshot: z.boolean().optional(),
});

const assertData = z
  .object({
    selector: z.string().trim().default(''),
    assertionType: z.enum([
      'is_visible',
      'text_contains',
      'text_equals',
      'has_value',
      'url_contains',
      'expression',
    ]),
    expectedValue: z.string().default(''),
    failureMessage: z.string().default(''),
    timeout: timeoutSchema,
    captureScreenshot: z.boolean().optional(),
  })
  .superRefine((d, ctx) => {
    const needsSelector = !['url_contains', 'expression'].includes(d.assertionType);
    if (needsSelector && !d.selector) {
      ctx.addIssue({ code: 'custom', path: ['selector'], message: 'Selector is required' });
    }
    if (d.assertionType !== 'is_visible' && !d.expectedValue) {
      ctx.addIssue({ code: 'custom', path: ['expectedValue'], message: 'Expected value is required' });
    }
  });

const scrollData = z.object({
  direction: z.enum(['down', 'up', 'to_bottom', 'to_selector']).default('down'),
  selector: z.string().trim().default(''),
  distancePx: z.coerce.number().default(600),
  smooth: z.boolean().default(true),
  timeout: timeoutSchema,
  captureScreenshot: z.boolean().optional(),
});

const waitForData = z.object({
  waitType: z.enum(['selector', 'timeout', 'networkidle']).default('timeout'),
  selector: z.string().trim().default(''),
  durationMs: z.coerce.number().default(2000),
  timeout: timeoutSchema,
});

const screenshotData = z.object({
  captureFullPage: z.boolean().default(true),
  selector: z.string().trim().default(''),
  fileName: z.string().trim().default('screenshot.png'),
  timeout: timeoutSchema,
});

const selectDropdownData = z.object({
  selector: z.string().trim().min(1, 'Selector is required'),
  selectValue: z.string().default(''),
  selectBy: z.enum(['value', 'label', 'index']).default('value'),
  timeout: timeoutSchema,
});

const hoverData = z.object({
  selector: z.string().trim().min(1, 'Selector is required'),
  timeout: timeoutSchema,
});

const pressKeyData = z.object({
  key: z.string().trim().default('Enter'),
  selector: z.string().trim().default(''),
  timeout: timeoutSchema,
});

const extractTextData = z.object({
  selector: z.string().trim().min(1, 'Selector is required'),
  variableName: z.string().trim().min(1, 'Variable name is required').default('extractedText'),
  extractMultiple: z.boolean().default(false),
  trimWhitespace: z.boolean().default(true),
  timeout: timeoutSchema,
});

const extractAttributeData = z.object({
  selector: z.string().trim().min(1, 'Selector is required'),
  attribute: z.string().trim().min(1, 'Attribute name is required').default('href'),
  variableName: z.string().trim().min(1, 'Variable name is required').default('extractedAttr'),
  extractMultiple: z.boolean().default(false),
  timeout: timeoutSchema,
});

const extractTableData = z.object({
  selector: z.string().trim().min(1, 'Selector is required').default('table'),
  variableName: z.string().trim().min(1, 'Variable name is required').default('extractedTable'),
  parseHeaders: z.boolean().default(true),
  timeout: timeoutSchema,
});

const extractListData = z.object({
  parentSelector: z.string().trim().min(1, 'Parent/List selector is required'),
  itemSelector: z.string().trim().min(1, 'Item selector is required'),
  variableName: z.string().trim().min(1, 'Variable name is required').default('extractedList'),
  timeout: timeoutSchema,
});

const extractHtmlData = z.object({
  selector: z.string().trim().min(1, 'Selector is required'),
  htmlType: z.enum(['innerHTML', 'outerHTML']).default('innerHTML'),
  variableName: z.string().trim().min(1, 'Variable name is required').default('extractedHtml'),
  timeout: timeoutSchema,
});

const paginationData = z.object({
  nextButtonSelector: z.string().trim().min(1, 'Next button selector is required'),
  maxPages: z.coerce.number().int().min(1).max(100).default(5),
  waitAfterClickMs: z.coerce.number().int().default(1500),
  timeout: timeoutSchema,
});

const loopElementsData = z.object({
  itemSelector: z.string().trim().min(1, 'Item selector is required'),
  maxItems: z.coerce.number().int().min(1).max(500).default(20),
  timeout: timeoutSchema,
});

const exportJsonData = z.object({
  datasetVariable: z.string().trim().default('scrapedData'),
  fileName: z.string().trim().default('scraped_results.json'),
  prettyPrint: z.boolean().default(true),
  timeout: timeoutSchema.default(1000),
});

const exportCsvData = z.object({
  datasetVariable: z.string().trim().default('scrapedData'),
  fileName: z.string().trim().default('scraped_results.csv'),
  delimiter: z.string().default(','),
  timeout: timeoutSchema.default(1000),
});

const webhookPushData = z.object({
  endpointUrl: z.string().trim().min(1, 'Endpoint URL is required'),
  method: z.enum(['POST', 'PUT']).default('POST'),
  authHeader: z.string().default(''),
  timeout: timeoutSchema,
});

const cookieBannerData = z.object({
  acceptSelector: z.string().trim().default('[id*="cookie" i] button, [class*="cookie" i] button, button:has-text("Accept")'),
  dismissSelector: z.string().trim().default(''),
  optional: z.boolean().default(true),
  timeout: timeoutSchema.default(3000),
});

const captchaDetectData = z.object({
  alertOnDetect: z.boolean().default(true),
  actionOnDetect: z.enum(['wait_for_user', 'abort']).default('wait_for_user'),
  timeout: timeoutSchema.default(5000),
});

const nodeBase = {
  id: z.string().min(1),
  title: z.string().default('Untitled step'),
  description: z.string().optional(),
  position: z.object({ x: z.number(), y: z.number() }),
  jiraIssue: z.string().optional(),
  blocking: z.boolean().optional(),
};

export const testNodeSchema = z.discriminatedUnion('type', [
  // Navigation & Browsing
  z.object({ ...nodeBase, type: z.literal('navigate'), data: navigateData }),
  z.object({ ...nodeBase, type: z.literal('scroll'), data: scrollData }),
  z.object({ ...nodeBase, type: z.literal('wait_for'), data: waitForData }),
  z.object({ ...nodeBase, type: z.literal('screenshot'), data: screenshotData }),

  // Interaction
  z.object({ ...nodeBase, type: z.literal('click'), data: clickData }),
  z.object({ ...nodeBase, type: z.literal('input'), data: inputData }),
  z.object({ ...nodeBase, type: z.literal('select_dropdown'), data: selectDropdownData }),
  z.object({ ...nodeBase, type: z.literal('hover'), data: hoverData }),
  z.object({ ...nodeBase, type: z.literal('press_key'), data: pressKeyData }),

  // Data Extraction & Web Scraping
  z.object({ ...nodeBase, type: z.literal('extract_text'), data: extractTextData }),
  z.object({ ...nodeBase, type: z.literal('extract_attribute'), data: extractAttributeData }),
  z.object({ ...nodeBase, type: z.literal('extract_table'), data: extractTableData }),
  z.object({ ...nodeBase, type: z.literal('extract_list'), data: extractListData }),
  z.object({ ...nodeBase, type: z.literal('extract_html'), data: extractHtmlData }),

  // Pagination & Loops
  z.object({ ...nodeBase, type: z.literal('pagination'), data: paginationData }),
  z.object({ ...nodeBase, type: z.literal('loop_elements'), data: loopElementsData }),

  // Data Export & Output
  z.object({ ...nodeBase, type: z.literal('export_json'), data: exportJsonData }),
  z.object({ ...nodeBase, type: z.literal('export_csv'), data: exportCsvData }),
  z.object({ ...nodeBase, type: z.literal('webhook_push'), data: webhookPushData }),

  // Validation & Anti-Bot
  z.object({ ...nodeBase, type: z.literal('assert'), data: assertData }),
  z.object({ ...nodeBase, type: z.literal('cookie_banner'), data: cookieBannerData }),
  z.object({ ...nodeBase, type: z.literal('captcha_detect'), data: captchaDetectData }),
]);

export const edgeSchema = z.object({
  id: z.string().min(1),
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
});

export const suiteDefinitionSchema = z.object({
  nodes: z.array(testNodeSchema).max(200),
  edges: z.array(edgeSchema).max(400),
});

export const triggerTypeSchema = z.enum(['manual', 'push', 'pull_request', 'scheduled']).default('manual');

export const suiteInputSchema = z.object({
  teamId: z.string().default('team-default'),
  repositoryId: z.string().optional(),
  repositoryFullName: z.string().optional(),
  branchName: z.string().optional(),
  name: z.string().trim().min(1).max(200),
  description: z.string().max(2000).default(''),
  baseUrl: z.string().trim().max(2000).default(''),
  browser: browserSchema.default('chromium'),
  environment: environmentSchema.default('staging'),
  jiraIssue: z.string().max(50).optional(),
  triggerType: triggerTypeSchema,
  triggerConfig: z
    .object({
      branches: z.array(z.string()).optional(),
      paths: z.array(z.string()).optional(),
      cronExpression: z.string().optional(),
    })
    .default({}),
  definition: suiteDefinitionSchema,
});

export const stepTypeSchema = z.enum([
  'navigate',
  'scroll',
  'wait_for',
  'screenshot',
  'click',
  'input',
  'select_dropdown',
  'hover',
  'press_key',
  'extract_text',
  'extract_attribute',
  'extract_table',
  'extract_list',
  'extract_html',
  'pagination',
  'loop_elements',
  'export_json',
  'export_csv',
  'webhook_push',
  'assert',
  'cookie_banner',
  'captcha_detect',
]);

export const testCaseInputSchema = z.object({
  teamId: z.string().default('team-default'),
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).default(''),
  stepType: stepTypeSchema,
  definition: testNodeSchema,
  jiraIssueKey: z.string().max(50).optional(),
});

export type ExecutableNode = z.infer<typeof testNodeSchema>;
export type ExecutableEdge = z.infer<typeof edgeSchema>;
export type SuiteDefinition = z.infer<typeof suiteDefinitionSchema>;
export type SuiteInput = z.infer<typeof suiteInputSchema>;
export type TestCaseInput = z.infer<typeof testCaseInputSchema>;

type Orderable = { id: string; position: { x: number; y: number } };
type Linkable = { sourceId: string; targetId: string };

/** Depth-first walk from left-most roots, mirroring the Visual Builder's canvas order. */
export function orderNodes<N extends Orderable>(nodes: N[], edges: Linkable[]): N[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, number>();
  nodes.forEach((n) => {
    outgoing.set(n.id, []);
    incoming.set(n.id, 0);
  });
  edges.forEach((e) => {
    if (!nodeMap.has(e.sourceId) || !nodeMap.has(e.targetId)) return;
    outgoing.get(e.sourceId)!.push(e.targetId);
    incoming.set(e.targetId, (incoming.get(e.targetId) || 0) + 1);
  });

  const ordered: N[] = [];
  const visited = new Set<string>();
  const traverse = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);
    const node = nodeMap.get(id);
    if (node) ordered.push(node);
    const next = (outgoing.get(id) || [])
      .map((t) => nodeMap.get(t))
      .filter((n): n is N => Boolean(n))
      .sort((a, b) => a.position.x - b.position.x);
    next.forEach((n) => traverse(n.id));
  };

  nodes
    .filter((n) => (incoming.get(n.id) || 0) === 0)
    .sort((a, b) => a.position.x - b.position.x)
    .forEach((n) => traverse(n.id));
  nodes
    .filter((n) => !visited.has(n.id))
    .sort((a, b) => a.position.x - b.position.x)
    .forEach((n) => traverse(n.id));
  return ordered;
}

/** Strips runtime-only UI fields (status, errorMessage, ...) so only the definition is persisted. */
export function sanitizeDefinition(raw: { nodes: unknown[]; edges: unknown[] }) {
  return {
    nodes: (raw.nodes as Record<string, unknown>[]).map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      description: n.description,
      position: n.position,
      data: n.data,
      jiraIssue: n.jiraIssue,
      blocking: n.blocking,
    })),
    edges: raw.edges,
  };
}

export interface ValidationIssue {
  nodeId?: string;
  message: string;
}

/** Full pre-execution validation: schema, edges, and navigation resolvability. */
export function validateForExecution(
  definition: unknown,
  baseUrl: string
): { ok: true; definition: SuiteDefinition } | { ok: false; issues: ValidationIssue[] } {
  const parsed = suiteDefinitionSchema.safeParse(definition);
  if (!parsed.success) {
    const nodes = (definition as { nodes?: { id?: string }[] })?.nodes ?? [];
    return {
      ok: false,
      issues: parsed.error.issues.map((i) => {
        const idx = i.path[0] === 'nodes' && typeof i.path[1] === 'number' ? i.path[1] : -1;
        return {
          nodeId: idx >= 0 ? nodes[idx]?.id : undefined,
          message: `${i.path.slice(2).join('.') || i.path.join('.')}: ${i.message}`,
        };
      }),
    };
  }
  const def = parsed.data;
  const issues: ValidationIssue[] = [];
  if (def.nodes.length === 0) issues.push({ message: 'Suite has no steps' });
  const ids = new Set(def.nodes.map((n) => n.id));
  for (const e of def.edges) {
    if (!ids.has(e.sourceId) || !ids.has(e.targetId)) {
      issues.push({ message: `Edge ${e.id} references a missing step` });
    }
  }
  const ordered = orderNodes(def.nodes, def.edges);
  if (ordered[0] && ordered[0].type !== 'navigate') {
    issues.push({ nodeId: ordered[0].id, message: 'The first step must be a navigate step' });
  }
  for (const n of def.nodes) {
    if (n.type !== 'navigate') continue;
    const url = n.data.url;
    if (/^https?:\/\//.test(url)) continue;
    if (url.startsWith('/') && /^https?:\/\//.test(baseUrl)) continue;
    issues.push({
      nodeId: n.id,
      message: url.startsWith('/')
        ? `Relative URL "${url}" requires a suite base URL (http/https)`
        : `Invalid URL "${url}"`,
    });
  }
  return issues.length ? { ok: false, issues } : { ok: true, definition: def };
}

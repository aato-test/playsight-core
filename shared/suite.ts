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

const nodeBase = {
  id: z.string().min(1),
  title: z.string().default('Untitled step'),
  description: z.string().optional(),
  position: z.object({ x: z.number(), y: z.number() }),
  jiraIssue: z.string().optional(),
  blocking: z.boolean().optional(),
};

export const testNodeSchema = z.discriminatedUnion('type', [
  z.object({ ...nodeBase, type: z.literal('navigate'), data: navigateData }),
  z.object({ ...nodeBase, type: z.literal('click'), data: clickData }),
  z.object({ ...nodeBase, type: z.literal('input'), data: inputData }),
  z.object({ ...nodeBase, type: z.literal('assert'), data: assertData }),
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

export const suiteInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().max(2000).default(''),
  baseUrl: z.string().trim().max(2000).default(''),
  browser: browserSchema.default('chromium'),
  environment: environmentSchema.default('staging'),
  jiraIssue: z.string().max(50).optional(),
  definition: suiteDefinitionSchema,
});

export type ExecutableNode = z.infer<typeof testNodeSchema>;
export type ExecutableEdge = z.infer<typeof edgeSchema>;
export type SuiteDefinition = z.infer<typeof suiteDefinitionSchema>;
export type SuiteInput = z.infer<typeof suiteInputSchema>;

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

import fs from 'node:fs';
import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import { sql } from 'drizzle-orm';
import { db, hasDatabase } from '../db';
import { browserSchema, environmentSchema, suiteInputSchema, sanitizeDefinition, validateForExecution } from '../../shared/suite';
import { listAudit } from '../services/audit';
import { artifactAbsolutePath, getArtifact } from '../services/artifacts';
import { createSuite, deleteSuite, getSuite, listSuites, toSuiteDTO, updateSuite } from '../services/suites';
import { cancelRun, createRun, getEvidence, getMetrics, getRunDetail, listRuns, rerun, ValidationError } from '../services/runs';
import { copilotRouter } from './copilot';

type Handler = (req: Request, res: Response) => Promise<unknown>;
const route = (fn: Handler) => (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);

const idParam = z.object({ id: z.string().min(1).max(200) });
const limitSchema = z.coerce.number().int().min(1).max(500).default(50);

const createRunSchema = z.object({
  suiteId: z.string().min(1),
  browsers: z.array(browserSchema).min(1).max(3).optional(),
  environment: environmentSchema.optional(),
  branch: z.string().max(200).optional(),
  commit: z.string().max(100).optional(),
  triggeredBy: z.string().max(100).optional(),
});

/** Accepts the Visual Builder's TestSuite shape and normalizes it into the persisted model. */
const suiteBodySchema = z
  .object({
    id: z.string().max(200).optional(),
    name: z.string(),
    description: z.string().optional(),
    baseUrl: z.string().optional(),
    targetBrowser: z.string().optional(),
    browser: z.string().optional(),
    environment: z.string().optional(),
    jiraIssue: z.string().optional(),
    nodes: z.array(z.unknown()),
    edges: z.array(z.unknown()),
  })
  .transform((b) => ({
    id: b.id,
    input: suiteInputSchema.parse({
      name: b.name,
      description: b.description ?? '',
      baseUrl: b.baseUrl ?? '',
      browser: b.browser ?? b.targetBrowser ?? 'chromium',
      environment: b.environment ?? 'staging',
      jiraIssue: b.jiraIssue,
      definition: sanitizeDefinition({ nodes: b.nodes, edges: b.edges }),
    }),
  }));

export const api = Router();

api.get('/health', route(async (_req, res) => {
  const started = Date.now();
  if (hasDatabase && db) {
    await db.execute(sql`select 1`);
    res.json({ status: 'ok', mode: 'postgres', database: 'connected', latencyMs: Date.now() - started });
  } else {
    res.json({ status: 'ok', mode: 'in-memory', database: 'ready', latencyMs: Date.now() - started });
  }
}));

// Suites
api.get('/suites', route(async (_req, res) => res.json(await listSuites())));

api.get('/suites/:id', route(async (req, res) => {
  const { id } = idParam.parse(req.params);
  const row = await getSuite(id);
  if (!row) return res.status(404).json({ error: 'Suite not found' });
  res.json(toSuiteDTO(row));
}));

api.post('/suites', route(async (req, res) => {
  const { id, input } = suiteBodySchema.parse(req.body);
  if (id && (await getSuite(id))) return res.status(409).json({ error: 'Suite already exists' });
  res.status(201).json(await createSuite(input, id));
}));

api.put('/suites/:id', route(async (req, res) => {
  const { id } = idParam.parse(req.params);
  const { input } = suiteBodySchema.parse(req.body);
  const suite = await updateSuite(id, input);
  if (!suite) return res.status(404).json({ error: 'Suite not found' });
  res.json(suite);
}));

api.delete('/suites/:id', route(async (req, res) => {
  const { id } = idParam.parse(req.params);
  if (!(await deleteSuite(id))) return res.status(404).json({ error: 'Suite not found' });
  res.status(204).end();
}));

api.post('/suites/:id/validate', route(async (req, res) => {
  const { id } = idParam.parse(req.params);
  const row = await getSuite(id);
  if (!row) return res.status(404).json({ error: 'Suite not found' });
  const result = validateForExecution(row.definition, row.baseUrl);
  res.json(result.ok ? { ok: true, issues: [] } : result);
}));

// Runs
api.get('/runs', route(async (req, res) => {
  const query = z
    .object({ suiteId: z.string().optional(), status: z.enum(['queued', 'running', 'passed', 'failed', 'cancelled']).optional(), limit: limitSchema })
    .parse(req.query);
  res.json(await listRuns(query));
}));

api.post('/runs', route(async (req, res) => {
  const body = createRunSchema.parse(req.body);
  const run = await createRun(body);
  if (!run) return res.status(404).json({ error: 'Suite not found' });
  res.status(201).json(run);
}));

api.get('/runs/:id', route(async (req, res) => {
  const { id } = idParam.parse(req.params);
  const run = await getRunDetail(id);
  if (!run) return res.status(404).json({ error: 'Run not found' });
  res.json(run);
}));

api.get('/runs/:id/results', route(async (req, res) => {
  const { id } = idParam.parse(req.params);
  const run = await getRunDetail(id);
  if (!run) return res.status(404).json({ error: 'Run not found' });
  res.json(run.results);
}));

api.get('/runs/:id/evidence', route(async (req, res) => {
  const { id } = idParam.parse(req.params);
  const evidence = await getEvidence(id);
  if (!evidence) return res.status(404).json({ error: 'Run not found' });
  res.json(evidence);
}));

api.post('/runs/:id/rerun', route(async (req, res) => {
  const { id } = idParam.parse(req.params);
  const run = await rerun(id);
  if (!run) return res.status(404).json({ error: 'Run or suite not found' });
  res.status(201).json(run);
}));

api.post('/runs/:id/cancel', route(async (req, res) => {
  const { id } = idParam.parse(req.params);
  const run = await cancelRun(id);
  if (!run) return res.status(404).json({ error: 'Run not found' });
  res.json(run);
}));

// Artifacts (served from server-side storage; ids are unguessable UUIDs)
api.get('/artifacts/:id', route(async (req, res) => {
  const { id } = idParam.parse(req.params);
  const artifact = await getArtifact(id);
  if (!artifact) return res.status(404).json({ error: 'Artifact not found' });
  const file = artifactAbsolutePath(artifact.storagePath);
  if (!fs.existsSync(file)) return res.status(410).json({ error: 'Artifact file is no longer available' });
  res.type(artifact.contentType);
  if (artifact.kind === 'trace') res.attachment(`${artifact.runId}-trace.zip`);
  res.sendFile(file);
}));

// Metrics + audit
api.get('/metrics', route(async (req, res) => {
  const { days } = z.object({ days: z.coerce.number().int().min(1).max(365).default(30) }).parse(req.query);
  res.json(await getMetrics(days));
}));

api.get('/audit', route(async (req, res) => {
  const query = z.object({ runId: z.string().optional(), suiteId: z.string().optional(), limit: limitSchema }).parse(req.query);
  const rows = await listAudit(query);
  res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
}));

api.use('/copilot', copilotRouter);

api.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
api.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ error: 'Invalid request', issues: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) });
  }
  if (error instanceof ValidationError) {
    return res.status(422).json({ error: error.message, issues: error.issues });
  }
  if (error instanceof SyntaxError) return res.status(400).json({ error: 'Malformed JSON body' });
  console.error('[api]', error);
  res.status(500).json({ error: 'Internal server error' });
});

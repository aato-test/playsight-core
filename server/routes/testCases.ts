import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import { testCaseInputSchema } from '../../shared/suite';
import {
  listTestCases,
  getTestCase,
  createTestCase,
  updateTestCase,
  deleteTestCase,
  getTestCasesForSuite,
  setSuiteTestCases,
} from '../services/testCases';

type Handler = (req: Request, res: Response) => Promise<unknown>;
const route = (fn: Handler) => (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);

const idParam = z.object({ id: z.string().min(1).max(200) });
const suiteIdParam = z.object({ suiteId: z.string().min(1).max(200) });

export const testCasesRouter = Router();

/** GET /api/test-cases - List reusable test cases */
testCasesRouter.get(
  '/',
  route(async (req, res) => {
    const teamId = (req.query.teamId as string) || 'team-default';
    const cases = await listTestCases(teamId);
    res.json(cases);
  })
);

/** GET /api/test-cases/:id - Retrieve specific test case */
testCasesRouter.get(
  '/:id',
  route(async (req, res) => {
    const { id } = idParam.parse(req.params);
    const teamId = (req.query.teamId as string) || 'team-default';
    const tc = await getTestCase(id, teamId);
    if (!tc) return res.status(404).json({ error: 'Test case not found' });
    res.json(tc);
  })
);

/** POST /api/test-cases - Create a new reusable test case */
testCasesRouter.post(
  '/',
  route(async (req, res) => {
    const body = z
      .object({
        id: z.string().max(200).optional(),
        teamId: z.string().default('team-default'),
        title: z.string().min(1).max(200),
        description: z.string().default(''),
        stepType: z.string().min(1),
        definition: z.record(z.unknown()),
        jiraIssueKey: z.string().optional(),
      })
      .parse(req.body);

    const input = testCaseInputSchema.parse(body);
    const created = await createTestCase(input, body.id);
    res.status(201).json(created);
  })
);

/** PUT /api/test-cases/:id - Update an existing test case */
testCasesRouter.put(
  '/:id',
  route(async (req, res) => {
    const { id } = idParam.parse(req.params);
    const input = testCaseInputSchema.parse(req.body);
    const updated = await updateTestCase(id, input);
    if (!updated) return res.status(404).json({ error: 'Test case not found' });
    res.json(updated);
  })
);

/** DELETE /api/test-cases/:id - Delete a test case */
testCasesRouter.delete(
  '/:id',
  route(async (req, res) => {
    const { id } = idParam.parse(req.params);
    const success = await deleteTestCase(id);
    if (!success) return res.status(404).json({ error: 'Test case not found' });
    res.status(204).end();
  })
);

export const suiteTestCasesRouter = Router({ mergeParams: true });

/** GET /api/suites/:suiteId/test-cases - Get ordered test cases for a suite */
suiteTestCasesRouter.get(
  '/',
  route(async (req, res) => {
    const { suiteId } = suiteIdParam.parse(req.params);
    const cases = await getTestCasesForSuite(suiteId);
    res.json(cases);
  })
);

/** PUT /api/suites/:suiteId/test-cases - Set ordered test cases for a suite */
suiteTestCasesRouter.put(
  '/',
  route(async (req, res) => {
    const { suiteId } = suiteIdParam.parse(req.params);
    const { testCaseIds } = z.object({ testCaseIds: z.array(z.string()) }).parse(req.body);
    await setSuiteTestCases(suiteId, testCaseIds);
    const updated = await getTestCasesForSuite(suiteId);
    res.json(updated);
  })
);

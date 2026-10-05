import { Router } from 'express';

/**
 * QA Copilot is intentionally not wired to an AI model yet (implementation order step 14).
 * The endpoint exists so the frontend contract is stable; it reports 501 instead of fabricating analysis.
 */
export const copilotRouter = Router();

copilotRouter.post('/analyze', (_req, res) => {
  res.status(501).json({
    error: 'QA Copilot analysis is not implemented yet. Use GET /api/runs/:id/evidence for grounded failure data.',
  });
});

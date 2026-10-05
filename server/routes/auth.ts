import { Router, type Request, type Response } from 'express';
import { z } from 'zod';

export const authRouter = Router();

interface UserSession {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  provider: 'google' | 'local';
  teamId: string;
  role: string;
  googleConnected: boolean;
  googleScopes: string[];
}

let currentSession: UserSession = {
  id: 'usr-prakash-01',
  name: 'Prakash Sivakumar',
  email: 'prakashsivakumar27@gmail.com',
  avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
  provider: 'google',
  teamId: 'team-default',
  role: 'Engineering Lead & QA Architect',
  googleConnected: true,
  googleScopes: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/spreadsheets.readonly',
  ],
};

/** GET /api/auth/me - Current user session */
authRouter.get('/me', (_req: Request, res: Response) => {
  res.json(currentSession);
});

/** POST /api/auth/google - Sign in / exchange Google OAuth credentials */
authRouter.post('/google', (req: Request, res: Response) => {
  const schema = z.object({
    email: z.string().email().default('prakashsivakumar27@gmail.com'),
    name: z.string().default('Prakash Sivakumar'),
    credential: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid Google auth payload' });
  }

  currentSession = {
    id: `usr-${Date.now()}`,
    name: parsed.data.name,
    email: parsed.data.email,
    avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
    provider: 'google',
    teamId: 'team-default',
    role: 'QA Automation Engineer',
    googleConnected: true,
    googleScopes: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/spreadsheets.readonly',
    ],
  };

  res.json({
    success: true,
    user: currentSession,
    message: `Signed in successfully as ${currentSession.email}`,
  });
});

/** POST /api/auth/logout - Sign out */
authRouter.post('/logout', (_req: Request, res: Response) => {
  currentSession = {
    ...currentSession,
    googleConnected: false,
  };
  res.json({ success: true, message: 'Signed out' });
});

/** POST /api/import/google - Import URLs or test cases from Google Sheets / Drive */
authRouter.post('/import/google', (req: Request, res: Response) => {
  const schema = z.object({
    sourceType: z.enum(['sheets', 'drive']),
    sourceUrl: z.string().default(''),
    sampleId: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid Google import request' });
  }

  const { sourceType, sampleId } = parsed.data;

  if (sourceType === 'sheets') {
    // Return structured list of scraped targets from Google Sheet
    let urls: { url: string; label: string; selector?: string }[] = [];

    if (sampleId === 'ecommerce') {
      urls = [
        { url: 'https://news.ycombinator.com', label: 'Tech Catalog Root' },
        { url: 'https://news.ycombinator.com/newest', label: 'Newest Submissions' },
        { url: 'https://news.ycombinator.com/ask', label: 'Q&A Items' },
      ];
    } else if (sampleId === 'saas') {
      urls = [
        { url: '/dashboard', label: 'App Overview' },
        { url: '/settings/integrations', label: 'GitHub & Jira Integrations' },
        { url: '/analytics', label: 'Metrics Grid' },
      ];
    } else {
      urls = [
        { url: 'https://example.com/products/item-1', label: 'Product Target 1' },
        { url: 'https://example.com/products/item-2', label: 'Product Target 2' },
        { url: 'https://example.com/products/item-3', label: 'Product Target 3' },
      ];
    }

    return res.json({
      success: true,
      sourceType: 'sheets',
      importedCount: urls.length,
      targets: urls,
      message: `Successfully imported ${urls.length} targets from Google Sheets`,
    });
  }

  // Drive JSON suite import
  res.json({
    success: true,
    sourceType: 'drive',
    suite: {
      name: 'Google Drive Scraper Workflow',
      description: 'Imported from team shared drive',
      nodesCount: 5,
    },
    message: 'Successfully imported suite template from Google Drive',
  });
});

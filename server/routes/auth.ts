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

/** POST /api/auth/login - Email & password login */
authRouter.post('/login', (req: Request, res: Response) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    workspaceId: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Please enter a valid email address and password' });
  }

  const { email } = parsed.data;
  const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  currentSession = {
    id: `usr-${Date.now()}`,
    name,
    email,
    avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
    provider: 'local',
    teamId: 'team-default',
    role: 'Test Engineer',
    googleConnected: false,
    googleScopes: [],
  };

  res.json({
    success: true,
    user: currentSession,
    workspace: {
      id: 'ws-playsight-corp',
      name: 'PlaySight Core Engineering Workspace',
      role: 'Test Engineer',
    },
    message: `Signed in successfully as ${currentSession.email}`,
  });
});

/** POST /api/auth/signup - Create new account & workspace */
authRouter.post('/signup', (req: Request, res: Response) => {
  const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    organization: z.string().optional(),
    inviteCode: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Please provide valid name, email, and password (min 6 characters)' });
  }

  const { name, email, organization } = parsed.data;

  currentSession = {
    id: `usr-${Date.now()}`,
    name,
    email,
    avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
    provider: 'local',
    teamId: 'team-default',
    role: 'Admin',
    googleConnected: false,
    googleScopes: [],
  };

  res.json({
    success: true,
    user: currentSession,
    workspace: {
      id: `ws-${Date.now().toString(36)}`,
      name: organization ? `${organization} Workspace` : 'Main Team Workspace',
      role: 'Admin',
    },
    message: `Account created for ${currentSession.email}`,
  });
});

/** Workspaces catalog & team invitations memory store */
interface WorkspaceItem {
  id: string;
  name: string;
  organization: string;
  inviteCode: string;
  membersCount: number;
  role: 'Admin' | 'Test Engineer' | 'Viewer';
}

const WORKSPACES_STORE: WorkspaceItem[] = [
  {
    id: 'ws-playsight-core-01',
    name: 'PlaySight Core Engineering Workspace',
    organization: 'PlaySight Core Team',
    inviteCode: 'PLAY-CORP-9481-INVITE',
    membersCount: 4,
    role: 'Admin',
  },
  {
    id: 'ws-qa-staging-02',
    name: 'Acme QA Automation Workspace',
    organization: 'Acme Technologies',
    inviteCode: 'ACME-AUTO-3312-KEY',
    membersCount: 6,
    role: 'Test Engineer',
  },
  {
    id: 'ws-release-gate-03',
    name: 'Staging Pre-Release Hub',
    organization: 'Platform Delivery',
    inviteCode: 'GATE-PROD-7719-KEY',
    membersCount: 3,
    role: 'Viewer',
  },
];

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Test Engineer' | 'Viewer';
  joinedAt: string;
  status: 'active' | 'invited';
}

const TEAM_MEMBERS_STORE: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Prakash Sivakumar',
    email: 'prakashsivakumar27@gmail.com',
    role: 'Admin',
    joinedAt: 'Aug 2024',
    status: 'active',
  },
  {
    id: 'tm-2',
    name: 'Daniel Jones',
    email: 'daniel.j@company.com',
    role: 'Test Engineer',
    joinedAt: 'Sep 2024',
    status: 'active',
  },
  {
    id: 'tm-3',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@company.com',
    role: 'Test Engineer',
    joinedAt: 'Sep 2024',
    status: 'active',
  },
  {
    id: 'tm-4',
    name: 'Mike Thomas',
    email: 'mike.t@company.com',
    role: 'Viewer',
    joinedAt: 'Oct 2024',
    status: 'active',
  },
];

/** GET /api/auth/workspaces - List company workspaces */
authRouter.get('/workspaces', (_req: Request, res: Response) => {
  res.json({
    success: true,
    workspaces: WORKSPACES_STORE,
  });
});

/** GET /api/auth/team - List team members in active workspace */
authRouter.get('/team', (_req: Request, res: Response) => {
  res.json({
    success: true,
    members: TEAM_MEMBERS_STORE,
    workspace: WORKSPACES_STORE[0],
  });
});

/** POST /api/auth/workspaces/invite - Create/regenerate invite code or send email invitation */
authRouter.post('/workspaces/invite', (req: Request, res: Response) => {
  const schema = z.object({
    email: z.string().email().optional(),
    role: z.enum(['Admin', 'Test Engineer', 'Viewer']).default('Test Engineer'),
    workspaceId: z.string().default('ws-playsight-core-01'),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid invitation payload' });
  }

  const { email, role } = parsed.data;
  const inviteCode = `PLAY-INV-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  if (email) {
    const existing = TEAM_MEMBERS_STORE.find((m) => m.email.toLowerCase() === email.toLowerCase());
    if (!existing) {
      TEAM_MEMBERS_STORE.push({
        id: `tm-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role,
        joinedAt: 'Invited just now',
        status: 'invited',
      });
    }
  }

  res.json({
    success: true,
    inviteCode,
    emailSentTo: email || null,
    role,
    message: email
      ? `Invitation sent to ${email} with role ${role}`
      : `Generated workspace invitation code: ${inviteCode}`,
  });
});

/** POST /api/auth/workspaces/join - Join workspace using invite code */
authRouter.post('/workspaces/join', (req: Request, res: Response) => {
  const schema = z.object({
    inviteCode: z.string().min(4),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Please enter a valid invitation code' });
  }

  const code = parsed.data.inviteCode.trim().toUpperCase();
  const foundWs = WORKSPACES_STORE.find((ws) => ws.inviteCode === code || code.startsWith('PLAY-') || code.startsWith('ACME-'));

  if (!foundWs) {
    return res.status(404).json({ error: 'Invalid or expired workspace invitation code' });
  }

  res.json({
    success: true,
    workspace: foundWs,
    message: `Joined workspace "${foundWs.name}" as ${foundWs.role}`,
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

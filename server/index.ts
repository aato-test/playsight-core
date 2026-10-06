import { env } from './env';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { api } from './routes';
import { recoverRuns } from './executor/queue';
import { pool } from './db';

const app = express();
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (env.isProduction) res.setHeader('Strict-Transport-Security', 'max-age=63072000');
  next();
});
app.use(
  express.json({
    limit: '2mb',
    verify: (req, _res, buf) => {
      (req as unknown as { rawBody?: Buffer }).rawBody = buf;
    },
  })
);
app.use('/api', api);
app.use('/artifacts', express.static(env.artifactsDir));

import http from 'node:http';

const server = http.createServer(app);

if (env.isProduction) {
  const dist = path.resolve(process.cwd(), 'dist');
  app.use(express.static(dist, { index: false }));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
} else {
  try {
    // Single dev process: Vite runs as middleware inside Express, sharing one HTTP server & port.
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { server } },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.get(/^(?!\/api).*/, async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } catch (viteErr) {
    console.warn('[vite] Middleware mode failed, falling back to dist static files:', viteErr);
    const dist = path.resolve(process.cwd(), 'dist');
    app.use(express.static(dist, { index: false }));
    app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }
}

// Global error handler to prevent hanging or empty responses
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[server error]', err);
  if (!res.headersSent) {
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
});

server.listen(env.port, '0.0.0.0', () => {
  console.log(`PlaySight Core listening on http://localhost:${env.port}`);
});

await recoverRuns().catch((error) => console.error('[executor] recovery failed', error));

const shutdown = () => {
  server.close();
  if (pool) {
    pool.end().finally(() => process.exit(0));
  } else {
    process.exit(0);
  }
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

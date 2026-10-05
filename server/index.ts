import { env } from './env';
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
app.use(express.json({ limit: '2mb' }));
app.use('/api', api);
app.use('/artifacts', express.static(env.artifactsDir));

if (env.isProduction) {
  const dist = path.resolve(process.cwd(), 'dist');
  app.use(express.static(dist, { index: false }));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
} else {
  // Single dev process: Vite runs as middleware inside Express, so the API and UI share one port.
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
}

const server = app.listen(env.port, '0.0.0.0', () => {
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

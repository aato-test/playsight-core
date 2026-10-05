import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import { db, hasDatabase } from '../db';
import { artifacts, type ArtifactRow } from '../db/schema';
import { env } from '../env';
import { memoryStore } from '../db/memoryStore';

/**
 * Local filesystem artifact store. Files live under ARTIFACTS_DIR/<runId>/<resultId>/;
 * only metadata is written to Postgres/memory. Swap this module for object storage in production.
 */
export async function saveArtifact(input: {
  runId: string;
  resultId: string;
  kind: 'screenshot' | 'trace';
  label: string;
  nodeId?: string;
  fileName: string;
  contentType: string;
  data?: Buffer;
  existingFile?: string;
}): Promise<ArtifactRow> {
  const relative = path.join(input.runId, input.resultId, input.fileName);
  const absolute = path.join(env.artifactsDir, relative);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  if (input.data) await fs.writeFile(absolute, input.data);
  const { size } = await fs.stat(input.existingFile ?? absolute);

  const row: ArtifactRow = {
    id: randomUUID(),
    runId: input.runId,
    resultId: input.resultId,
    kind: input.kind,
    label: input.label,
    nodeId: input.nodeId ?? null,
    storagePath: relative,
    contentType: input.contentType,
    sizeBytes: size,
    createdAt: new Date(),
  };

  if (hasDatabase && db) {
    const [dbRow] = await db.insert(artifacts).values(row).returning();
    return dbRow;
  }

  memoryStore.artifacts.set(row.id, row);
  return row;
}

export function artifactAbsolutePath(storagePath: string) {
  return path.join(env.artifactsDir, storagePath);
}

export function artifactFilePath(runId: string, resultId: string, fileName: string) {
  return path.join(env.artifactsDir, runId, resultId, fileName);
}

export async function getArtifact(id: string) {
  if (hasDatabase && db) {
    const [row] = await db.select().from(artifacts).where(eq(artifacts.id, id));
    return row ?? null;
  }
  return memoryStore.artifacts.get(id) ?? null;
}

export const artifactUrl = (id: string) => `/api/artifacts/${id}`;

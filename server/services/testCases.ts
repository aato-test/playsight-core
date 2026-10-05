import { randomUUID } from 'node:crypto';
import { eq, and, asc } from 'drizzle-orm';
import { db, hasDatabase } from '../db';
import { testCases, suiteTestCases, type TestCaseRow, type SuiteTestCaseRow } from '../db/schema';
import { memoryStore } from '../db/memoryStore';
import type { TestCaseInput } from '../../shared/suite';

export function toTestCaseDTO(row: TestCaseRow) {
  return {
    id: row.id,
    teamId: row.teamId,
    title: row.title,
    description: row.description,
    stepType: row.stepType,
    definition: row.definition,
    jiraIssueKey: row.jiraIssueKey ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Lists all test cases for a team */
export async function listTestCases(teamId: string = 'team-default') {
  if (hasDatabase && db) {
    const rows = await db
      .select()
      .from(testCases)
      .where(eq(testCases.teamId, teamId));
    return rows.map(toTestCaseDTO);
  }

  const list = Array.from(memoryStore.testCases.values()).filter(
    (tc) => tc.teamId === teamId
  );
  return list.map(toTestCaseDTO);
}

/** Retrieves a single test case */
export async function getTestCase(id: string, teamId: string = 'team-default') {
  if (hasDatabase && db) {
    const [row] = await db
      .select()
      .from(testCases)
      .where(and(eq(testCases.id, id), eq(testCases.teamId, teamId)));
    return row ? toTestCaseDTO(row) : null;
  }

  const tc = memoryStore.testCases.get(id);
  if (!tc || tc.teamId !== teamId) return null;
  return toTestCaseDTO(tc);
}

/** Creates a new reusable test case */
export async function createTestCase(input: TestCaseInput, id?: string) {
  const tcId = id ?? `tc-${randomUUID().slice(0, 8)}`;
  const now = new Date();

  const row: TestCaseRow = {
    id: tcId,
    teamId: input.teamId || 'team-default',
    title: input.title,
    description: input.description ?? '',
    stepType: input.stepType,
    definition: input.definition,
    jiraIssueKey: input.jiraIssueKey ?? null,
    createdAt: now,
    updatedAt: now,
  };

  if (hasDatabase && db) {
    const [inserted] = await db.insert(testCases).values(row).returning();
    return toTestCaseDTO(inserted);
  }

  memoryStore.testCases.set(tcId, row);
  return toTestCaseDTO(row);
}

/** Updates an existing test case */
export async function updateTestCase(id: string, input: TestCaseInput) {
  const now = new Date();

  if (hasDatabase && db) {
    const [updated] = await db
      .update(testCases)
      .set({
        title: input.title,
        description: input.description ?? '',
        stepType: input.stepType,
        definition: input.definition,
        jiraIssueKey: input.jiraIssueKey ?? null,
        updatedAt: now,
      })
      .where(eq(testCases.id, id))
      .returning();
    return updated ? toTestCaseDTO(updated) : null;
  }

  const existing = memoryStore.testCases.get(id);
  if (!existing) return null;

  const updated: TestCaseRow = {
    ...existing,
    title: input.title,
    description: input.description ?? '',
    stepType: input.stepType,
    definition: input.definition,
    jiraIssueKey: input.jiraIssueKey ?? null,
    updatedAt: now,
  };

  memoryStore.testCases.set(id, updated);
  return toTestCaseDTO(updated);
}

/** Deletes a test case */
export async function deleteTestCase(id: string): Promise<boolean> {
  if (hasDatabase && db) {
    const [deleted] = await db
      .delete(testCases)
      .where(eq(testCases.id, id))
      .returning();
    return Boolean(deleted);
  }

  return memoryStore.testCases.delete(id);
}

/** Retrieves ordered test cases associated with a suite */
export async function getTestCasesForSuite(suiteId: string) {
  if (hasDatabase && db) {
    const links = await db
      .select()
      .from(suiteTestCases)
      .where(eq(suiteTestCases.suiteId, suiteId))
      .orderBy(asc(suiteTestCases.orderIndex));

    if (!links.length) return [];

    const cases = await db.select().from(testCases);
    const caseMap = new Map(cases.map((c) => [c.id, c]));

    return links
      .map((l) => caseMap.get(l.testCaseId))
      .filter((c): c is TestCaseRow => Boolean(c))
      .map(toTestCaseDTO);
  }

  const links = Array.from(memoryStore.suiteTestCases.values())
    .filter((l) => l.suiteId === suiteId)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return links
    .map((l) => memoryStore.testCases.get(l.testCaseId))
    .filter((c): c is TestCaseRow => Boolean(c))
    .map(toTestCaseDTO);
}

/** Associate an ordered list of test cases with a suite */
export async function setSuiteTestCases(suiteId: string, testCaseIds: string[]) {
  if (hasDatabase && db) {
    await db.delete(suiteTestCases).where(eq(suiteTestCases.suiteId, suiteId));
    if (testCaseIds.length) {
      await db.insert(suiteTestCases).values(
        testCaseIds.map((tcId, index) => ({
          id: `stc-${suiteId}-${tcId}`,
          suiteId,
          testCaseId: tcId,
          orderIndex: index,
        }))
      );
    }
    return;
  }

  for (const [key, link] of memoryStore.suiteTestCases.entries()) {
    if (link.suiteId === suiteId) memoryStore.suiteTestCases.delete(key);
  }

  testCaseIds.forEach((tcId, index) => {
    const id = `stc-${suiteId}-${tcId}`;
    memoryStore.suiteTestCases.set(id, {
      id,
      suiteId,
      testCaseId: tcId,
      orderIndex: index,
      createdAt: new Date(),
    });
  });
}

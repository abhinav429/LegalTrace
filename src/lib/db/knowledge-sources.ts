import { query } from './pg';

export type KnowledgeSourceRow = {
  ingestion_id: string;
  chunk_count: string;
  ingestion_label: string | null;
  ingestion_kind: string | null;
  source: string | null;
  source_file: string | null;
  created_at: Date;
};

export async function listKnowledgeSources(): Promise<KnowledgeSourceRow[]> {
  const { rows } = await query<KnowledgeSourceRow>(
    `
    SELECT
      metadata->>'ingestion_id' AS ingestion_id,
      COUNT(*)::text AS chunk_count,
      MAX(metadata->>'ingestion_label') AS ingestion_label,
      MAX(metadata->>'ingestion_kind') AS ingestion_kind,
      MAX(metadata->>'source') AS source,
      MAX(metadata->>'source_file') AS source_file,
      MIN("createdAt") AS created_at
    FROM oai
    WHERE metadata->>'ingestion_id' IS NOT NULL
      AND metadata->>'ingestion_id' != ''
    GROUP BY metadata->>'ingestion_id'
    ORDER BY MIN("createdAt") DESC
    `,
  );
  return rows;
}

export async function deleteKnowledgeSource(
  ingestionId: string,
): Promise<number> {
  const result = await query(
    `DELETE FROM oai WHERE metadata->>'ingestion_id' = $1`,
    [ingestionId],
  );
  return result.rowCount ?? 0;
}

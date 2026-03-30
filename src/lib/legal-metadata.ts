export const LEGAL_DOCUMENT_TYPES = ['statute', 'case_law', 'regulation'] as const;

export type LegalDocumentType = (typeof LEGAL_DOCUMENT_TYPES)[number];

export type LegalMetadata = {
  document_type?: LegalDocumentType;
  jurisdiction?: string;
  court?: string;
  year?: string;
  act_name?: string;
  section?: string;
  citation?: string;
  source_url?: string;
};

// Keep only known legal metadata fields and trim string values.
export function sanitizeLegalMetadata(input: unknown): LegalMetadata {
  if (!input || typeof input !== 'object') return {};

  const value = input as Record<string, unknown>;
  const rawType = typeof value.document_type === 'string' ? value.document_type : '';
  const documentType = LEGAL_DOCUMENT_TYPES.includes(rawType as LegalDocumentType)
    ? (rawType as LegalDocumentType)
    : undefined;

  const clean = (field: unknown) =>
    typeof field === 'string' && field.trim() ? field.trim() : undefined;

  const metadata: LegalMetadata = {
    document_type: documentType,
    jurisdiction: clean(value.jurisdiction),
    court: clean(value.court),
    year: clean(value.year),
    act_name: clean(value.act_name),
    section: clean(value.section),
    citation: clean(value.citation),
    source_url: clean(value.source_url),
  };

  return Object.fromEntries(
    Object.entries(metadata).filter(([, fieldValue]) => fieldValue !== undefined)
  ) as LegalMetadata;
}

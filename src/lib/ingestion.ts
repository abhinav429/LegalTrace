import { randomUUID } from 'crypto';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function newIngestionId(): string {
  return randomUUID();
}

export function isValidIngestionId(id: string): boolean {
  return UUID_REGEX.test(id);
}

/** Short preview for pasted text sources in the Sources list. */
export function labelFromPastedText(text: string): string {
  const t = text.trim().replace(/\s+/g, ' ');
  if (!t) return 'Pasted text';
  return t.length <= 100 ? t : `${t.slice(0, 100)}…`;
}

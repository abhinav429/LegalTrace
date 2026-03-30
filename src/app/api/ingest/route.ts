import { oaiVectorDB } from '@/lib/db/vector';
import { labelFromPastedText, newIngestionId } from '@/lib/ingestion';
import { sanitizeLegalMetadata } from '@/lib/legal-metadata';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = typeof body.text === 'string' ? body.text : '';
    const chunkingMethod = body.chunkingMethod;
    const legalMetadata = sanitizeLegalMetadata(body.metadata);

    if (!text.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const ingestion_id = newIngestionId();
    const metadata = {
      ...legalMetadata,
      ingestion_id,
      ingestion_label: labelFromPastedText(text),
      ingestion_kind: 'manual_text' as const,
    };

    const result = await oaiVectorDB.addText(text, {
      chunkingMethod:
        chunkingMethod === 'sentence' ||
        chunkingMethod === 'paragraph' ||
        chunkingMethod === 'fixed'
          ? chunkingMethod
          : 'paragraph',
      metadata,
    });

    return NextResponse.json({
      ok: true,
      numChunks: result.count,
      ingestionId: ingestion_id,
    });
  } catch (error) {
    console.error('Ingest API error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to ingest text';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

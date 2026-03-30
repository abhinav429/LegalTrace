import { oaiVectorDB } from '@/lib/db/vector';
import { newIngestionId } from '@/lib/ingestion';
import { extractTextFromPdfBuffer } from '@/lib/pdf-extract';
import { sanitizeLegalMetadata } from '@/lib/legal-metadata';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MiB

function isPdfFile(file: File): boolean {
  const name = file.name?.toLowerCase() ?? '';
  if (name.endsWith('.pdf')) return true;
  return file.type === 'application/pdf';
}

export async function POST(req: Request) {
  try {
    const contentLength = req.headers.get('content-length');
    if (contentLength && Number.parseInt(contentLength, 10) > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large (max ${MAX_BYTES / (1024 * 1024)} MB)` },
        { status: 413 },
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'file is required (multipart field "file")' },
        { status: 400 },
      );
    }

    if (!isPdfFile(file)) {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 },
      );
    }

    const raw = formData.get('metadata');
    let parsedMeta: unknown = {};
    if (typeof raw === 'string' && raw.trim()) {
      try {
        parsedMeta = JSON.parse(raw) as unknown;
      } catch {
        return NextResponse.json(
          { error: 'metadata must be valid JSON' },
          { status: 400 },
        );
      }
    }

    const chunkingRaw = formData.get('chunkingMethod');
    const chunkingMethod =
      chunkingRaw === 'sentence' ||
      chunkingRaw === 'paragraph' ||
      chunkingRaw === 'fixed'
        ? chunkingRaw
        : 'paragraph';

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large (max ${MAX_BYTES / (1024 * 1024)} MB)` },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(arrayBuffer);

    let text: string;
    let numPages: number;
    try {
      const extracted = await extractTextFromPdfBuffer(buffer);
      text = extracted.text;
      numPages = extracted.numPages;
    } catch (err) {
      console.error('PDF extract error:', err);
      const message =
        err instanceof Error ? err.message : 'Failed to parse PDF';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (!text.trim()) {
      return NextResponse.json(
        {
          error:
            'No extractable text found. This may be a scanned PDF; OCR is not supported in v1.',
        },
        { status: 400 },
      );
    }

    const legalMetadata = sanitizeLegalMetadata(parsedMeta);
    const ingestion_id = newIngestionId();
    const safeName = file.name.slice(0, 255);
    const metadata = {
      ...legalMetadata,
      ingestion_id,
      ingestion_label: safeName,
      ingestion_kind: 'pdf_upload' as const,
      source_file: safeName,
      mime_type: 'application/pdf',
      page_count: String(numPages),
      source: 'pdf_upload' as const,
    };

    const result = await oaiVectorDB.addText(text, {
      chunkingMethod,
      metadata,
    });

    return NextResponse.json({
      ok: true,
      numChunks: result.count,
      numPages,
      source_file: safeName,
      ingestionId: ingestion_id,
    });
  } catch (error) {
    console.error('PDF ingest API error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to ingest PDF';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

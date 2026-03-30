import { searchLegalChunks } from '@/lib/actions/search';
import { sanitizeLegalMetadata } from '@/lib/legal-metadata';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = typeof body.query === 'string' ? body.query : '';
    const filter = sanitizeLegalMetadata(body.filters);
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const results = await searchLegalChunks(query, {
      filter: Object.keys(filter).length ? filter : undefined,
    });
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}

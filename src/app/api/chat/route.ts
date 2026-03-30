import { openai } from '@/lib/openai-provider';
import { streamText, StreamData } from 'ai';
import { searchSimilarChunks } from '@/lib/actions/search';

type SearchRow = {
  chunk: string;
  distance: number;
  createdAt?: string | Date;
  metadata?: Record<string, unknown>;
};

type ContextItem = {
  chunk: string;
  metadata: {
    distance: string;
    createdAt: string;
    citation?: string;
    court?: string;
    jurisdiction?: string;
    section?: string;
  };
};

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages?.[messages.length - 1];
  const userText =
    typeof lastMessage?.content === 'string' ? lastMessage.content : '';

  if (!userText.trim()) {
    return new Response(JSON.stringify({ error: 'Message required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = new StreamData();

  let searchResults: SearchRow[] = [];
  let retrievalFailed = false;
  try {
    searchResults = (await searchSimilarChunks(userText)) as SearchRow[];
  } catch (err) {
    retrievalFailed = true;
    console.error('Chat: vector retrieval / embedding failed:', err);
  }
  const getText = (value: unknown) =>
    typeof value === 'string' && value.trim() ? value : undefined;

  const contextDetails: ContextItem[] = searchResults?.length
    ? searchResults.map((r: SearchRow) => ({
        chunk: r.chunk,
        metadata: {
          distance: r.distance.toFixed(3),
          createdAt: r.createdAt
            ? new Date(r.createdAt).toLocaleDateString()
            : 'N/A',
          citation: getText(r.metadata?.citation),
          court: getText(r.metadata?.court),
          jurisdiction: getText(r.metadata?.jurisdiction),
          section: getText(r.metadata?.section),
        },
      }))
    : [];

  data.append({ contextDetails, retrievalFailed });

  const context = contextDetails.length
    ? `Retrieved legal context:\n${contextDetails
        .map(
          (r) =>
            `${r.chunk}\n(Citation: ${r.metadata.citation || 'N/A'}, Court: ${r.metadata.court || 'N/A'}, Jurisdiction: ${r.metadata.jurisdiction || 'N/A'}, Section: ${r.metadata.section || 'N/A'}, Distance: ${r.metadata.distance})`
        )
        .join('\n\n')}\n\n`
    : '';

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages: [
      {
        role: 'system',
        content:
          'You are a legal research assistant. Answer only from the retrieved legal context when present. Format response in this order: 1) Answer, 2) Authorities Cited (bullet list with citation + court + section when available), 3) Confidence (High/Medium/Low), 4) Disclaimer: This is informational and not legal advice. If context is missing, explicitly say the answer is not grounded in retrieved legal sources.',
      },
      ...(retrievalFailed
        ? [
            {
              role: 'system' as const,
              content:
                'Similarity search / embeddings are temporarily unavailable (e.g. API error). State this briefly at the start. Do not invent citations or retrieved sources; give a general informational response.',
            },
          ]
        : []),
      ...(context
        ? [
            {
              role: 'system',
              content: context,
            },
          ]
        : []),
      ...messages,
    ],
    onFinish: () => {
      data.close();
    },
  });

  return result.toDataStreamResponse({ data });
}

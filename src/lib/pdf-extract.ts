import { PDFParse } from 'pdf-parse';

const MAX_PAGES = 100;

export type PdfExtractResult = {
  text: string;
  numPages: number;
};

/**
 * Extract plain text from a PDF buffer (native / text-based PDFs).
 * Scanned PDFs typically yield empty or near-empty text.
 */
export async function extractTextFromPdfBuffer(
  buffer: Buffer,
): Promise<PdfExtractResult> {
  const parser = new PDFParse({ data: buffer });
  try {
    const info = await parser.getInfo();
    if (info.total > MAX_PAGES) {
      throw new Error(`PDF exceeds maximum page count (${MAX_PAGES}).`);
    }
    const textResult = await parser.getText();
    const text = (textResult.text ?? '').trim();
    return { text, numPages: textResult.total };
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

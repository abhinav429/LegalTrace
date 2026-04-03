import pdfParse from "pdf-parse";

const MAX_PAGES = 100;

export type PdfExtractResult = {
	text: string;
	numPages: number;
};

/**
 * Extract plain text from a PDF buffer (native / text-based PDFs).
 * Uses pdf-parse v1 (Node-friendly). Scanned PDFs typically yield empty or near-empty text.
 */
export async function extractTextFromPdfBuffer(
	buffer: Buffer,
): Promise<PdfExtractResult> {
	const data = await pdfParse(buffer, { max: MAX_PAGES });
	const text = (data.text ?? "").trim();
	return { text, numPages: data.numpages };
}

import {
	deleteKnowledgeSource,
	listKnowledgeSources,
} from "@/lib/db/knowledge-sources";
import { isValidIngestionId } from "@/lib/ingestion";
import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function GET() {
	try {
		const rows = await listKnowledgeSources();
		const sources = rows.map((r) => ({
			ingestionId: r.ingestion_id,
			chunkCount: Number.parseInt(r.chunk_count, 10) || 0,
			label: r.ingestion_label || "Untitled source",
			kind: r.ingestion_kind || r.source || "unknown",
			sourceFile: r.source_file,
			createdAt: r.created_at.toISOString(),
		}));
		return NextResponse.json({ sources });
	} catch (error) {
		console.error("List knowledge sources error:", error);
		const message =
			error instanceof Error ? error.message : "Failed to list sources";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}

/** DELETE via query avoids a separate dynamic segment bundle (dev caches can miss vendor chunks for `[id]` routes). */
export async function DELETE(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const ingestionId = searchParams.get("ingestionId") ?? "";

		if (!ingestionId || !isValidIngestionId(ingestionId)) {
			return NextResponse.json(
				{ error: "Invalid ingestion id" },
				{ status: 400 },
			);
		}

		const deleted = await deleteKnowledgeSource(ingestionId);

		if (deleted === 0) {
			return NextResponse.json(
				{ error: "No chunks found for this source" },
				{ status: 404 },
			);
		}

		return NextResponse.json({ ok: true, deletedChunks: deleted });
	} catch (error) {
		console.error("Delete knowledge source error:", error);
		const message =
			error instanceof Error ? error.message : "Failed to delete source";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}

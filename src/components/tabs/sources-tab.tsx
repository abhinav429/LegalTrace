"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Source = {
	ingestionId: string;
	chunkCount: number;
	label: string;
	kind: string;
	sourceFile: string | null;
	createdAt: string;
};

async function readJsonBody(res: Response): Promise<unknown> {
	const text = await res.text();
	const ct = res.headers.get("content-type") ?? "";
	if (!ct.includes("json") && text.trimStart().startsWith("<!")) {
		throw new Error(
			`Server returned HTML (${res.status}) instead of JSON — try dev:clean or redeploy.`,
		);
	}
	try {
		return JSON.parse(text) as unknown;
	} catch {
		throw new Error(text.slice(0, 160) || `Invalid response (${res.status})`);
	}
}

function kindLabel(kind: string): string {
	switch (kind) {
		case "manual_text":
			return "Pasted text";
		case "pdf_upload":
			return "PDF";
		case "inngest":
			return "Background job";
		default:
			return kind;
	}
}

export function SourcesTab() {
	const [sources, setSources] = useState<Source[]>([]);
	const [loading, setLoading] = useState(true);
	const [removingId, setRemovingId] = useState<string | null>(null);
	const [confirmId, setConfirmId] = useState<string | null>(null);

	const loadSources = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/knowledge/sources");
			const data = (await readJsonBody(res)) as {
				sources?: Source[];
				error?: string;
			};
			if (!res.ok) {
				throw new Error(data.error || "Failed to load sources");
			}
			setSources(data.sources ?? []);
		} catch (e) {
			console.error(e);
			toast.error(e instanceof Error ? e.message : "Failed to load sources");
			setSources([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadSources();
	}, [loadSources]);

	const handleConfirmRemove = async (ingestionId: string) => {
		setRemovingId(ingestionId);
		try {
			const q = new URLSearchParams({ ingestionId });
			const res = await fetch(`/api/knowledge/sources?${q.toString()}`, {
				method: "DELETE",
			});
			const data = (await readJsonBody(res)) as {
				deletedChunks?: number;
				error?: string;
			};
			if (!res.ok) {
				throw new Error(data.error || "Remove failed");
			}
			toast.success(`Removed ${data.deletedChunks ?? 0} chunk(s).`);
			setConfirmId(null);
			await loadSources();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Remove failed");
		} finally {
			setRemovingId(null);
		}
	};

	return (
		<Card>
			<CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
				<CardTitle className="text-base font-semibold">Sources</CardTitle>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => void loadSources()}
					disabled={loading}
				>
					Refresh
				</Button>
			</CardHeader>
			<CardContent className="space-y-3 pt-0">
				<p className="text-sm text-muted-foreground">
					Each row is one ingest (pasted text or PDF). Removing a source deletes
					all chunks tied to that ingest.
				</p>

				{loading ? (
					<div className="flex items-center justify-center py-12 text-muted-foreground">
						<Loader2 className="h-6 w-6 animate-spin mr-2" />
						Loading…
					</div>
				) : sources.length === 0 ? (
					<p className="text-sm text-muted-foreground py-8 text-center">
						No sources yet. Ingest text or a PDF to see them here. Older rows
						without an ingestion id are not listed.
					</p>
				) : (
					<ul className="divide-y rounded-md border">
						{sources.map((s) => (
							<li
								key={s.ingestionId}
								className="p-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
							>
								<div className="space-y-1 min-w-0 flex-1">
									<p className="font-medium text-sm leading-snug break-words">
										{s.label}
									</p>
									<p className="text-xs text-muted-foreground">
										<span className="font-medium text-foreground/80">
											{kindLabel(s.kind)}
										</span>
										{s.sourceFile ? ` · ${s.sourceFile}` : ""}
										{" · "}
										{s.chunkCount} chunk{s.chunkCount === 1 ? "" : "s"}
										{" · "}
										{new Date(s.createdAt).toLocaleString()}
									</p>
								</div>
								<div className="flex flex-col items-stretch gap-2 sm:items-end shrink-0">
									{confirmId === s.ingestionId ? (
										<div className="flex flex-col gap-2 rounded-md border bg-muted/40 p-2">
											<p className="text-xs text-muted-foreground max-w-[220px]">
												Delete all {s.chunkCount} chunk
												{s.chunkCount === 1 ? "" : "s"}? This cannot be undone.
											</p>
											<div className="flex gap-2 justify-end">
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => setConfirmId(null)}
													disabled={removingId === s.ingestionId}
												>
													Cancel
												</Button>
												<Button
													type="button"
													variant="destructive"
													size="sm"
													onClick={() =>
														void handleConfirmRemove(s.ingestionId)
													}
													disabled={removingId === s.ingestionId}
												>
													{removingId === s.ingestionId ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : (
														"Delete"
													)}
												</Button>
											</div>
										</div>
									) : (
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="text-destructive hover:text-destructive"
											onClick={() => setConfirmId(s.ingestionId)}
										>
											<Trash2 className="h-4 w-4 mr-1" />
											Remove
										</Button>
									)}
								</div>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}

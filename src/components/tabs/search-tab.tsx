import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LEGAL_DOCUMENT_TYPES, type LegalMetadata } from "@/lib/legal-metadata";
import { useState } from "react";
import { toast } from "sonner";

type SearchResult = {
	chunk: string;
	distance: number;
	metadata?: LegalMetadata;
};

export function SearchTab() {
	const [query, setQuery] = useState("");
	const [loading, setLoading] = useState(false);
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [filters, setFilters] = useState<LegalMetadata>({});

	const updateFilter = (key: keyof LegalMetadata, value: string) => {
		setFilters((current) => ({ ...current, [key]: value || undefined }));
	};

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!query.trim()) {
			toast.error("Please enter a search query");
			return;
		}

		setLoading(true);
		try {
			const response = await fetch("/api/search", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query, filters }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Search failed");
			}

			const results = Array.isArray(data.results) ? data.results : [];
			setSearchResults(results);

			if (results.length === 0) {
				toast.info(
					"No matches. Ingest some text first (Ingest tab), then search again.",
				);
			}
		} catch (error) {
			console.error("Failed to search:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to perform search.",
			);
			setSearchResults([]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base font-semibold">
					Search Knowledge Base
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 pt-0">
				<form onSubmit={handleSearch} className="flex gap-2">
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Enter your search query..."
						className="flex-1"
					/>
					<Button type="submit" disabled={loading}>
						Search
					</Button>
				</form>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
					<select
						value={filters.document_type || ""}
						onChange={(e) => updateFilter("document_type", e.target.value)}
						className="h-9 rounded-md border bg-background px-3 text-sm"
					>
						<option value="">All document types</option>
						{LEGAL_DOCUMENT_TYPES.map((value) => (
							<option key={value} value={value}>
								{value}
							</option>
						))}
					</select>
					<Input
						value={filters.jurisdiction || ""}
						onChange={(e) => updateFilter("jurisdiction", e.target.value)}
						placeholder="Filter by jurisdiction"
					/>
					<Input
						value={filters.court || ""}
						onChange={(e) => updateFilter("court", e.target.value)}
						placeholder="Filter by court"
					/>
					<Input
						value={filters.year || ""}
						onChange={(e) => updateFilter("year", e.target.value)}
						placeholder="Filter by year"
					/>
					<Input
						value={filters.act_name || ""}
						onChange={(e) => updateFilter("act_name", e.target.value)}
						placeholder="Filter by act name"
					/>
					<Input
						value={filters.section || ""}
						onChange={(e) => updateFilter("section", e.target.value)}
						placeholder="Filter by section"
					/>
				</div>

				<ScrollArea className="h-[460px] pr-3">
					{searchResults.length > 0 ? (
						<div className="space-y-4">
							{searchResults.map((result, i) => (
								<Card key={i}>
									<CardContent className="pt-4">
										<div className="text-sm space-y-2">
											<div className="font-mono text-xs text-muted-foreground">
												Similarity: {(1 - result.distance).toFixed(3)}
											</div>
											<div className="bg-muted p-3 rounded-md">
												{result.chunk}
											</div>
											{result.metadata && (
												<div className="text-xs text-muted-foreground">
													{result.metadata.citation
														? `Citation: ${result.metadata.citation} | `
														: ""}
													{result.metadata.court
														? `Court: ${result.metadata.court} | `
														: ""}
													{result.metadata.section
														? `Section: ${result.metadata.section}`
														: ""}
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<div className="text-center text-muted-foreground py-8">
							Search results will appear here
						</div>
					)}
				</ScrollArea>
			</CardContent>
		</Card>
	);
}

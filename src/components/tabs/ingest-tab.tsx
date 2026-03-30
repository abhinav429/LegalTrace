import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { LEGAL_DOCUMENT_TYPES, type LegalMetadata } from "@/lib/legal-metadata";
import { FileUp, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const defaultMetadata = (): LegalMetadata => ({
	document_type: "statute",
	jurisdiction: "India",
});

export function IngestTab() {
	const [mode, setMode] = useState<"text" | "pdf">("text");
	const [text, setText] = useState("");
	const [pdfFile, setPdfFile] = useState<File | null>(null);
	const [dragActive, setDragActive] = useState(false);
	const [loading, setLoading] = useState(false);
	const [metadata, setMetadata] = useState<LegalMetadata>(defaultMetadata);

	const updateMetadata = (key: keyof LegalMetadata, value: string) => {
		setMetadata((current) => ({ ...current, [key]: value || undefined }));
	};

	const setPdfFromFileList = useCallback((files: FileList | null) => {
		const file = files?.[0];
		if (!file) return;
		if (!file.name.toLowerCase().endsWith(".pdf")) {
			toast.error("Please choose a PDF file.");
			return;
		}
		if (file.size > MAX_FILE_BYTES) {
			toast.error(`File must be at most ${MAX_FILE_BYTES / (1024 * 1024)} MB.`);
			return;
		}
		setPdfFile(file);
	}, []);

	const handleEmbedText = async () => {
		if (!text.trim()) {
			toast.error("Please enter some text to embed");
			return;
		}

		setLoading(true);
		const toastId = toast.loading("Processing your text...");

		try {
			const res = await fetch("/api/ingest", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					text,
					chunkingMethod: "paragraph",
					metadata,
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Ingest failed");
			}

			toast.success(
				`Stored ${data.numChunks ?? 0} chunk(s) in the knowledge base.`,
				{ id: toastId },
			);
			setText("");
			setMetadata(defaultMetadata());
		} catch (error) {
			console.error("Failed to process:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to process text.",
				{ id: toastId },
			);
		} finally {
			setLoading(false);
		}
	};

	const handleEmbedPdf = async () => {
		if (!pdfFile) {
			toast.error("Please select a PDF file.");
			return;
		}

		setLoading(true);
		const toastId = toast.loading("Extracting text and embedding...");

		try {
			const formData = new FormData();
			formData.append("file", pdfFile);
			formData.append("chunkingMethod", "paragraph");
			formData.append("metadata", JSON.stringify(metadata));

			const res = await fetch("/api/ingest/pdf", {
				method: "POST",
				body: formData,
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "PDF ingest failed");
			}

			toast.success(
				`Stored ${data.numChunks ?? 0} chunk(s) from ${data.source_file ?? pdfFile.name} (${data.numPages ?? "?"} pages).`,
				{ id: toastId },
			);
			setPdfFile(null);
			setMetadata(defaultMetadata());
		} catch (error) {
			console.error("Failed to ingest PDF:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to ingest PDF.",
				{ id: toastId },
			);
		} finally {
			setLoading(false);
		}
	};

	const metadataFields = (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
			<select
				value={metadata.document_type || ""}
				onChange={(e) => updateMetadata("document_type", e.target.value)}
				className="h-9 rounded-md border bg-background px-3 text-sm"
			>
				{LEGAL_DOCUMENT_TYPES.map((value) => (
					<option key={value} value={value}>
						{value}
					</option>
				))}
			</select>
			<Input
				value={metadata.jurisdiction || ""}
				onChange={(e) => updateMetadata("jurisdiction", e.target.value)}
				placeholder="Jurisdiction (e.g., India)"
			/>
			<Input
				value={metadata.court || ""}
				onChange={(e) => updateMetadata("court", e.target.value)}
				placeholder="Court (e.g., Supreme Court)"
			/>
			<Input
				value={metadata.year || ""}
				onChange={(e) => updateMetadata("year", e.target.value)}
				placeholder="Year (e.g., 1872)"
			/>
			<Input
				value={metadata.act_name || ""}
				onChange={(e) => updateMetadata("act_name", e.target.value)}
				placeholder="Act/Code name"
			/>
			<Input
				value={metadata.section || ""}
				onChange={(e) => updateMetadata("section", e.target.value)}
				placeholder="Section/Article"
			/>
			<Input
				value={metadata.citation || ""}
				onChange={(e) => updateMetadata("citation", e.target.value)}
				placeholder="Citation"
			/>
			<Input
				value={metadata.source_url || ""}
				onChange={(e) => updateMetadata("source_url", e.target.value)}
				placeholder="Source URL"
			/>
		</div>
	);

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base font-semibold">Add Knowledge</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 pt-0">
				<Tabs
					value={mode}
					onValueChange={(v) => setMode(v as "text" | "pdf")}
					className="w-full"
				>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="text">Paste text</TabsTrigger>
						<TabsTrigger value="pdf">Upload PDF</TabsTrigger>
					</TabsList>
					<TabsContent value="text" className="space-y-3 mt-3">
						{metadataFields}
						<Textarea
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder="Paste your text here to add to the knowledge base..."
							className="min-h-[170px] bg-background text-foreground"
						/>
						<Button
							onClick={handleEmbedText}
							disabled={loading}
							className="w-full"
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Processing...
								</>
							) : (
								"Add to Knowledge Base"
							)}
						</Button>
					</TabsContent>
					<TabsContent value="pdf" className="space-y-3 mt-3">
						<p className="text-sm text-muted-foreground">
							Text-based PDFs only. Scanned documents need OCR (not in v1).
						</p>
						{metadataFields}
						<div
							className={`relative flex min-h-[140px] flex-col items-center justify-center rounded-md border border-dashed px-4 py-6 text-center transition-colors ${
								dragActive
									? "border-primary bg-muted/50"
									: "border-muted-foreground/25 bg-muted/20"
							}`}
							onDragEnter={(e) => {
								e.preventDefault();
								e.stopPropagation();
								setDragActive(true);
							}}
							onDragLeave={(e) => {
								e.preventDefault();
								e.stopPropagation();
								setDragActive(false);
							}}
							onDragOver={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
							onDrop={(e) => {
								e.preventDefault();
								e.stopPropagation();
								setDragActive(false);
								setPdfFromFileList(e.dataTransfer.files);
							}}
						>
							<FileUp className="mb-2 h-8 w-8 text-muted-foreground" />
							<p className="text-sm font-medium">
								{pdfFile ? pdfFile.name : "Drop a PDF here"}
							</p>
							{pdfFile ? (
								<p className="mt-1 text-xs text-muted-foreground">
									{(pdfFile.size / 1024).toFixed(1)} KB · max{" "}
									{MAX_FILE_BYTES / (1024 * 1024)} MB
								</p>
							) : (
								<p className="mt-1 text-xs text-muted-foreground">
									One file · max {MAX_FILE_BYTES / (1024 * 1024)} MB · up to 100
									pages
								</p>
							)}
							<label className="mt-3">
								<input
									type="file"
									accept="application/pdf,.pdf"
									className="sr-only"
									onChange={(e) => setPdfFromFileList(e.target.files)}
								/>
								<span className="inline-flex cursor-pointer rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted">
									Browse
								</span>
							</label>
						</div>
						<Button
							onClick={handleEmbedPdf}
							disabled={loading || !pdfFile}
							className="w-full"
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Processing...
								</>
							) : (
								"Ingest PDF"
							)}
						</Button>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}

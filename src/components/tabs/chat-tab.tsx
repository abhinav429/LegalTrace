"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "ai/react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";

function lastChatDataPiece(data: unknown[] | undefined) {
	const piece = data?.[data.length - 1];
	return piece && typeof piece === "object"
		? (piece as Record<string, unknown>)
		: null;
}

function friendlyChatError(error: Error): string {
	const m = error.message || "";
	if (/failed to fetch|network|load failed/i.test(m)) {
		return "Network error — check your connection and try again.";
	}
	if (/aborted|abort/i.test(m)) {
		return "Request was stopped.";
	}
	return m.trim() || "Something went wrong. Try again.";
}

function AssistantLoadingPlaceholder({ longWait }: { longWait: boolean }) {
	return (
		<div
			className="flex flex-col items-start"
			aria-live="polite"
			aria-busy="true"
		>
			<div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted/80 border border-border/60">
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
					<span>Generating reply…</span>
				</div>
				{longWait ? (
					<p className="text-xs text-muted-foreground mt-2">
						Still working — large answers can take a bit.
					</p>
				) : null}
			</div>
		</div>
	);
}

export function ChatTab() {
	const {
		messages,
		input,
		handleInputChange,
		handleSubmit,
		data,
		isLoading,
		error,
		reload,
		stop,
	} = useChat({
		api: "/api/chat",
	});

	const [longWait, setLongWait] = useState(false);
	const endRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isLoading) {
			setLongWait(false);
			return;
		}
		const t = window.setTimeout(() => setLongWait(true), 9000);
		return () => window.clearTimeout(t);
	}, [isLoading]);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
	}, [messages, isLoading, data]);

	const handleChatSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim()) {
			toast.error("Please enter a question");
			return;
		}

		handleSubmit(e);
	};

	const last = messages[messages.length - 1];
	const lastIsUserWhileLoading = isLoading && last?.role === "user";

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base font-semibold">Chat</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				<ScrollArea className="h-[460px] pr-3 mb-3">
					<div className="space-y-4" aria-busy={isLoading}>
						{(() => {
							const d = lastChatDataPiece(data);
							if (!d?.retrievalFailed) return null;
							return (
								<p className="text-sm rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-foreground">
									Knowledge-base search failed (often an embedding API error or
									bad gateway on your LLM host). The reply below may not use
									your ingested documents.
								</p>
							);
						})()}
						{messages.map((m) => {
							const isAssistantStreaming =
								isLoading &&
								m.role === "assistant" &&
								messages[messages.length - 1]?.id === m.id;
							const showPlaceholderInBubble =
								isAssistantStreaming &&
								!(typeof m.content === "string" && m.content.trim());

							return (
								<div
									key={m.id}
									className={`flex flex-col ${
										m.role === "user" ? "items-end" : "items-start"
									}`}
								>
									<div
										className={`max-w-[80%] rounded-lg px-4 py-2 ${
											m.role === "user"
												? "bg-primary text-primary-foreground"
												: "bg-muted"
										}`}
									>
										{m.role === "user" ? (
											m.content
										) : showPlaceholderInBubble ? (
											<AssistantLoadingPlaceholder longWait={longWait} />
										) : (
											<>
												{(() => {
													const d = lastChatDataPiece(data);
													const details = d?.contextDetails;
													if (!Array.isArray(details) || details.length === 0) {
														return null;
													}
													return (
														<div className="mb-4 p-2 border border-dashed rounded-md border-border text-sm">
															<div className="font-semibold mb-1">
																Authorities Used:
															</div>
															{details.map(
																(
																	context: {
																		metadata?: Record<string, unknown>;
																		chunk?: string;
																	},
																	i: number,
																) => (
																	<div key={i} className="mb-2">
																		<div className="font-medium">
																			{String(
																				context.metadata?.citation ||
																					"Unlabeled source",
																			)}
																		</div>
																		<div className="text-xs text-muted-foreground">
																			{context.metadata?.court
																				? `Court: ${String(context.metadata.court)} | `
																				: ""}
																			{context.metadata?.section
																				? `Section: ${String(context.metadata.section)} | `
																				: ""}
																			Distance:{" "}
																			{String(context.metadata?.distance ?? "")}
																		</div>
																		<div className="text-xs mt-1">
																			{context.chunk}
																		</div>
																	</div>
																),
															)}
														</div>
													);
												})()}
												<ReactMarkdown
													components={{
														code({ className, children, ...props }) {
															const match = /language-(\w+)/.exec(
																className || "",
															);
															return match ? (
																<SyntaxHighlighter
																	style={vscDarkPlus}
																	language={match[1]}
																	PreTag="div"
																	{...(props as SyntaxHighlighterProps)}
																>
																	{String(children).replace(/\n$/, "")}
																</SyntaxHighlighter>
															) : (
																<code className={className} {...props}>
																	{children}
																</code>
															);
														},
													}}
													className="prose prose-slate dark:prose-invert max-w-none"
												>
													{m.content}
												</ReactMarkdown>
												{isAssistantStreaming &&
												typeof m.content === "string" &&
												m.content.trim() ? (
													<span
														className="inline-block w-0.5 h-4 ml-0.5 align-middle bg-primary/80 animate-pulse rounded-sm"
														aria-hidden
													/>
												) : null}
											</>
										)}
									</div>
								</div>
							);
						})}
						{lastIsUserWhileLoading ? (
							<AssistantLoadingPlaceholder longWait={longWait} />
						) : null}
						<div ref={endRef} className="h-px w-full shrink-0" aria-hidden />
					</div>
				</ScrollArea>

				{error ? (
					<Alert variant="destructive" className="mb-3">
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>Could not get a reply</AlertTitle>
						<AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<span>{friendlyChatError(error)}</span>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="shrink-0 border-destructive/40 bg-background hover:bg-muted"
								onClick={() => void reload()}
							>
								Retry
							</Button>
						</AlertDescription>
					</Alert>
				) : null}

				<form
					onSubmit={handleChatSubmit}
					className="flex flex-wrap gap-2 items-center"
				>
					<input
						value={input}
						onChange={handleInputChange}
						disabled={isLoading}
						placeholder="Ask a question about the knowledge base..."
						className="flex-1 min-w-[12rem] h-9 px-3 border rounded-md bg-background text-foreground placeholder:text-muted-foreground disabled:opacity-60 disabled:cursor-not-allowed"
						aria-label="Chat message"
					/>
					{isLoading ? (
						<Button type="button" variant="outline" onClick={() => stop()}>
							Stop
						</Button>
					) : (
						<Button type="submit">Send</Button>
					)}
				</form>
			</CardContent>
		</Card>
	);
}

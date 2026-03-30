"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IngestTab } from "@/components/tabs/ingest-tab";
import { SearchTab } from "@/components/tabs/search-tab";
import { ChatTab } from "@/components/tabs/chat-tab";
import { SourcesTab } from "@/components/tabs/sources-tab";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

/** In production, workspace is hidden unless this is set to "true" (e.g. on Vercel for a live demo). */
const workspaceEnabledInProduction =
	process.env.NEXT_PUBLIC_WORKSPACE_IN_PRODUCTION === "true";

const showFullWorkspace =
	process.env.NODE_ENV !== "production" || workspaceEnabledInProduction;

export default function WorkspacePage() {
	if (!showFullWorkspace) {
		return (
			<div className="max-w-6xl mx-auto space-y-8 py-8 px-4">
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>Demo Environment Only</AlertTitle>
					<AlertDescription>
						This workspace is only available in development, or in production
						when{" "}
						<code className="rounded bg-muted px-1 py-0.5 text-xs">
							NEXT_PUBLIC_WORKSPACE_IN_PRODUCTION=true
						</code>{" "}
						is set and the app is redeployed. Run locally with your database
						and API keys, or enable that variable on your host for a public
						demo.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto space-y-6 py-8 px-4">
			<div className="space-y-3">
				<h1 className="text-4xl font-semibold tracking-tight font-serif">
					Legal Workspace
				</h1>
				<p className="text-muted-foreground text-base leading-relaxed">
					Upload legal documents, run citation-aware search, and chat with
					source-grounded answers across statutes, case law, and contracts.
				</p>
			</div>

			<Card className="p-1">
				<Tabs defaultValue="ingest" className="space-y-4">
					<TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 p-1 h-auto gap-1">
						<TabsTrigger value="ingest" className="font-medium">
							Ingest Data
						</TabsTrigger>
						<TabsTrigger value="sources" className="font-medium">
							Sources
						</TabsTrigger>
						<TabsTrigger value="search" className="font-medium">
							Search
						</TabsTrigger>
						<TabsTrigger value="chat" className="font-medium">
							Chat
						</TabsTrigger>
					</TabsList>

					<div className="p-3 min-h-[560px]">
						<TabsContent value="ingest" className="m-0">
							<IngestTab />
						</TabsContent>

						<TabsContent value="sources" className="m-0">
							<SourcesTab />
						</TabsContent>

						<TabsContent value="search" className="m-0">
							<SearchTab />
						</TabsContent>

						<TabsContent value="chat" className="m-0">
							<ChatTab />
						</TabsContent>
					</div>
				</Tabs>
			</Card>
		</div>
	);
}

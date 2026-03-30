import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DotPattern } from "@/components/ui/dot-pattern";
import Link from "next/link";

export default function Home() {
	return (
		<div
			data-legaltrace="page-home"
			className="min-h-[calc(100vh-4rem)] flex flex-col justify-between"
		>
			<Navbar />
			<main
				data-legaltrace="home-main"
				className="flex-1 flex flex-col items-center justify-center gap-8 max-w-4xl mx-auto px-4 py-12"
			>
				<div className="space-y-4 text-center">
					<h1 className="text-4xl sm:text-5xl font-semibold tracking-tight font-serif leading-tight">
						Your Legal Documents <br />
						Answered Precisely.
					</h1>
					<p className="lt-lead text-muted-foreground max-w-[800px] mx-auto">
						AI-powered document retrieval for legal professionals. Chat with
						case files, statutes, and contracts with source-backed answers and
						zero hallucinations.
					</p>
				</div>

				<DotPattern className="absolute inset-0 opacity-35 -z-10 [mask-image:radial-gradient(650px_circle_at_center,white,transparent)]" />

				<div
					data-legaltrace="cta-wrap"
					className="w-full relative z-10 flex justify-center"
				>
					<Card
						data-legaltrace="cta-card"
						className="p-5 border hover:border-primary/40 transition-colors w-full max-w-md"
					>
						<div className="flex flex-col gap-3 h-full">
							<h2 className="font-semibold text-xl font-serif">Start Retrieving</h2>
							<p className="lt-muted text-muted-foreground text-sm leading-relaxed">
								Upload legal documents and ask questions - get cited, traceable
								answers instantly.
							</p>
							<Button variant="default" className="w-full" asChild>
								<Link data-legaltrace="cta-link" href="/workspace">
									Get Started →
								</Link>
							</Button>
						</div>
					</Card>
				</div>
			</main>
		</div>
	);
}

import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";
import { CRITICAL_SHELL_CSS } from "@/lib/critical-shell-css";
import { Toaster } from "sonner";

function safeMetadataBase(): URL {
	const raw =
		process.env.NEXT_PUBLIC_APP_URL ||
		(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
	try {
		return new URL(raw);
	} catch {
		return new URL("http://localhost:3000");
	}
}

export const metadata: Metadata = {
	metadataBase: safeMetadataBase(),
	title: {
		default: "LegalTrace",
		template: "%s · LegalTrace",
	},
	description:
		"Legal document retrieval with source-backed, citation-grounded answers.",
	openGraph: {
		title: "LegalTrace",
		description:
			"Legal document retrieval with source-backed, citation-grounded answers.",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark">
			<head>
				<style
					// Inlined so first paint is styled even if compiled CSS chunks 404 (bad .next / deploy drift)
					dangerouslySetInnerHTML={{ __html: CRITICAL_SHELL_CSS }}
				/>
			</head>
			<body
				className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased min-h-screen bg-background`}
			>
				<Toaster richColors position="top-center" />
				{children}
			</body>
		</html>
	);
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
	{ href: "/", label: "Home" },
	{ href: "/workspace", label: "Workspace" },
];

export function Navbar() {
	const pathname = usePathname();

	return (
		<header
			data-legaltrace="navbar"
			className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
		>
			<div className="w-full flex h-16 items-center justify-between px-6 md:px-8">
				<Link href="/" className="flex items-center space-x-2">
					<span data-brand className="font-mono font-bold text-lg">
						LegalTrace
					</span>
				</Link>
				<div className="flex items-center gap-6">
					<nav className="flex items-center gap-4">
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className={`text-sm transition-colors hover:text-foreground/80 ${
									pathname === item.href
										? "text-foreground font-medium"
										: "text-muted-foreground"
								}`}
							>
								{item.label}
							</Link>
						))}
					</nav>
				</div>
			</div>
		</header>
	);
}

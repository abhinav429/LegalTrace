/**
 * Inlined in <head> so layout still looks correct if /_next/static CSS fails to load
 * (corrupt .next, CDN mismatch, iCloud sync races). Keep tokens aligned with globals.css `.dark`.
 */
export const CRITICAL_SHELL_CSS = `
html.dark {
  --background: 40 38% 95%;
  --foreground: 12 20% 18%;
  --card: 40 30% 98%;
  --muted-foreground: 18 14% 38%;
  --primary: 352 43% 30%;
  --primary-foreground: 40 30% 98%;
  --border: 28 18% 76%;
}
html { color-scheme: light; }
body {
  margin: 0;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
[data-legaltrace="navbar"] {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 4rem;
  padding: 0 clamp(1rem, 3vw, 2rem);
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(40 30% 98% / 0.92);
  position: sticky;
  top: 0;
  z-index: 50;
}
[data-legaltrace="navbar"] nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.25rem;
}
[data-legaltrace="navbar"] a {
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
  text-decoration: none;
}
[data-legaltrace="navbar"] a:hover {
  color: hsl(var(--foreground));
}
[data-legaltrace="navbar"] [data-brand] {
  font-family: ui-monospace, monospace;
  font-weight: 700;
  font-size: 1.125rem;
  color: hsl(var(--foreground));
}
[data-legaltrace="page-home"] {
  min-height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
}
[data-legaltrace="home-main"] {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  max-width: 56rem;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
  position: relative;
}
[data-legaltrace="home-main"] h1 {
  font-size: clamp(1.75rem, 4vw, 3rem);
  font-weight: 600;
  font-family: ui-serif, Georgia, "Times New Roman", serif;
  text-align: center;
  line-height: 1.15;
  margin: 0;
}
[data-legaltrace="home-main"] .lt-lead {
  color: hsl(var(--muted-foreground));
  text-align: center;
  max-width: 50rem;
  margin: 0 auto;
}
[data-legaltrace="cta-wrap"] {
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 1;
}
[data-legaltrace="cta-card"] {
  width: 100%;
  max-width: 28rem;
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  padding: 1.25rem;
  background: hsl(var(--card));
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
[data-legaltrace="cta-card"] h2 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  font-family: ui-serif, Georgia, serif;
}
[data-legaltrace="cta-card"] .lt-muted {
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
  margin: 0 0 1rem;
  line-height: 1.6;
}
[data-legaltrace="cta-card"] a[data-legaltrace="cta-link"] {
  display: block;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
  padding: 0.5rem 1rem;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-radius: 0.375rem;
  font-weight: 500;
  text-decoration: none;
}
[data-legaltrace="cta-card"] a[data-legaltrace="cta-link"]:hover {
  filter: brightness(1.05);
}
`;

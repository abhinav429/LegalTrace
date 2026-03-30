import { Pool, PoolClient, QueryResult } from "pg";

// Global pool for `pg` vector queries (ssl for Neon / Vercel Postgres / most cloud hosts).
// Remote DBs often close idle TCP connections (suspend, firewall, idle timeouts). Stale clients
// in the pool then hit read ETIMEDOUT; `pg` emits `error` on the pool for idle clients — that
// listener is required or Node may log uncaughtException.
const pool = new Pool({
	ssl: {
		rejectUnauthorized: false,
	},
	max: 10,
	// Recycle pooled clients before many hosts drop idle connections (~60s+).
	idleTimeoutMillis: 20_000,
	connectionTimeoutMillis: 15_000,
	keepAlive: true,
	keepAliveInitialDelayMillis: 10_000,
});

pool.on("error", (err) => {
	console.error(
		"[pg] idle client error (connection likely dropped by network or DB):",
		err.message,
	);
});

// Better type for query params
export type QueryParams =
	| string
	| number
	| boolean
	| null
	| undefined
	| Buffer
	| Date
	| QueryParams[];

// Generic query function with better typing
export async function query<T extends Record<string, unknown>>(
	text: string,
	params: QueryParams[] = [],
): Promise<QueryResult<T>> {
	const client = await pool.connect();
	try {
		return await client.query<T>(text, params);
	} catch (error) {
		console.error("Database query error:", error);
		throw error;
	} finally {
		client.release();
	}
}

// Get client with automatic release on error
export async function withClient<T>(
	callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
	const client = await pool.connect();
	try {
		return await callback(client);
	} finally {
		client.release();
	}
}

// Graceful shutdown
export async function end(): Promise<void> {
	await pool.end();
}

// Health check
export async function healthCheck(): Promise<boolean> {
	try {
		await query("SELECT 1");
		return true;
	} catch (error) {
		console.error("Health check failed:", error);
		return false;
	}
}

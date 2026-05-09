import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

function createPrismaClient() {
	const connectionString =
		process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error("DATABASE_URL is required to initialize PrismaClient");
	}

	const schema = process.env.DATABASE_SCHEMA;
	const safeSchema =
		schema && /^[a-zA-Z0-9_]+$/.test(schema) ? schema : undefined;

	const pool = new Pool({
		connectionString,
		connectionTimeoutMillis: 30000,
		...(safeSchema
			? { options: `-c search_path=${safeSchema},public` }
			: undefined),
	});

	const client = new PrismaClient({
		adapter: new PrismaPg(pool),
	});

	// Neon cold starts can exceed Prisma's default 5s transaction timeout.
	// Wrap $transaction to use a 30s timeout globally.
	const original$transaction = client.$transaction.bind(client);
	(client as { $transaction: unknown }).$transaction = (
		fnOrQueries: unknown,
		options?: Record<string, unknown>,
	) => {
		if (typeof fnOrQueries === "function") {
			return original$transaction(
				fnOrQueries as Parameters<typeof original$transaction>[0],
				{
					timeout: 30000,
					maxWait: 15000,
					...options,
				},
			);
		}
		return (original$transaction as (q: unknown, o?: unknown) => unknown)(
			fnOrQueries,
			options,
		);
	};

	return client;
}

declare global {
	// eslint-disable-next-line no-var
	var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalThis.__prisma = prisma;
}

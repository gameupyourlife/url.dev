import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function GET() {
    try {
        await db.execute(sql`SELECT 1`);

        return Response.json(
            { status: "ok", database: "connected" },
            {
                status: 200,
                headers: { "Cache-Control": "no-store" },
            },
        );
    } catch {
        return Response.json(
            { status: "error", database: "disconnected" },
            {
                status: 503,
                headers: { "Cache-Control": "no-store" },
            },
        );
    }
}
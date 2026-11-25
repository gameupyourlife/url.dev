import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

type HealthStatus = "ok" | "error";

export async function GET() {
    const checks = {
        application: { status: "ok" as HealthStatus },
        database: { status: "ok" as HealthStatus },
    };

    try {
        await db.execute(sql`SELECT 1`);
    } catch {
        checks.database.status = "error";
    }

    const isHealthy = Object.values(checks).every(
        (check) => check.status === "ok",
    );

    return Response.json(
        {
            status: isHealthy ? "ok" : "degraded",
            checks,
            timestamp: new Date().toISOString(),
        },
        {
            status: isHealthy ? 200 : 503,
            headers: { "Cache-Control": "no-store" },
        },
    );
}
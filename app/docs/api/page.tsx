import Link from "next/link";
import { generateV1EndpointDocs } from "@/lib/api-docs/v1";
import ApiReferenceClient from "@/app/docs/api/ApiReferenceClient";

export default function ApiReferencePage() {
    const endpoints = generateV1EndpointDocs();
    const operations = endpoints.flatMap((endpoint) => endpoint.operations);
    const generatedAt = new Date().toISOString();

    return (
        <main className="mx-auto max-w-6xl px-6 py-10 md:py-16">
            <header className="mb-8 rounded-2xl border border-border/60 bg-card p-6">
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">API Reference</p>
                <h1 className="text-3xl font-semibold tracking-tight">v1 Auto-Generated Docs</h1>
                <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
                    This reference is generated directly from route handlers in <code>app/api/v1/**/route.ts</code>.
                    Authentication supports either cookie session auth or API keys via <code>x-api-key</code> or <code>Authorization: Bearer ...</code>.
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <span className="rounded-lg border border-border/60 bg-background px-3 py-1.5">
                        Endpoints: <strong>{endpoints.length}</strong>
                    </span>
                    <span className="rounded-lg border border-border/60 bg-background px-3 py-1.5">
                        Operations: <strong>{operations.length}</strong>
                    </span>
                    <span className="rounded-lg border border-border/60 bg-background px-3 py-1.5">
                        Generated: <strong>{generatedAt}</strong>
                    </span>
                    <Link
                        href="/api/v1/openapi"
                        className="rounded-lg border border-border/60 bg-primary px-3 py-1.5 text-primary-foreground hover:opacity-90"
                    >
                        OpenAPI JSON
                    </Link>
                </div>
            </header>

            <ApiReferenceClient operations={operations} />
        </main>
    );
}

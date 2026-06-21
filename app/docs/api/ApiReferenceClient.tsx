"use client";

import { useEffect, useMemo, useState } from "react";
import type { V1OperationDoc } from "@/lib/api-docs/v1";

const methodBadgeClass: Record<string, string> = {
    GET: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    POST: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    PUT: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    PATCH: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
    DELETE: "bg-red-500/15 text-red-700 dark:text-red-300",
    OPTIONS: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
    HEAD: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
};

function operationId(method: string, path: string): string {
    return `${method}-${path}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

interface ApiReferenceClientProps {
    operations: V1OperationDoc[];
}

export default function ApiReferenceClient({ operations }: ApiReferenceClientProps) {
    const [activeId, setActiveId] = useState<string>("");

    const withIds = useMemo(
        () => operations.map((operation) => ({ ...operation, id: operationId(operation.method, operation.path) })),
        [operations]
    );

    useEffect(() => {
        if (!withIds.length) return;

        const onScroll = () => {
            const offset = 140;
            let current = withIds[0].id;

            for (const item of withIds) {
                const el = document.getElementById(item.id);
                if (!el) continue;
                const top = el.getBoundingClientRect().top;
                if (top - offset <= 0) {
                    current = item.id;
                } else {
                    break;
                }
            }

            setActiveId(current);
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, [withIds]);

    const formatJson = (value: unknown) => JSON.stringify(value, null, 2);

    return (
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
                <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-border/60 bg-card p-3">
                    <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">On This Page</p>
                    <nav className="space-y-1">
                        {withIds.map((operation) => {
                            const isActive = activeId === operation.id;
                            return (
                                <a
                                    key={operation.id}
                                    href={`#${operation.id}`}
                                    className={`block rounded-lg border px-2 py-1.5 text-xs transition-colors ${
                                        isActive
                                            ? "border-primary/50 bg-primary/10 text-foreground"
                                            : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/50"
                                    }`}
                                >
                                    <span className="mr-2 font-semibold">{operation.method}</span>
                                    <span className="font-mono">{operation.path}</span>
                                </a>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            <section className="space-y-4">
                {withIds.map((operation) => (
                    <article id={operation.id} key={`${operation.method}-${operation.path}`} className="scroll-mt-24 rounded-2xl border border-border/60 bg-card p-5">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                            <span className={`inline-flex min-w-16 justify-center rounded-md px-2 py-1 text-xs font-semibold ${methodBadgeClass[operation.method]}`}>
                                {operation.method}
                            </span>
                            <h2 className="font-mono text-sm md:text-base">{operation.path}</h2>
                        </div>

                        <p className="text-sm text-muted-foreground">{operation.summary}</p>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">{operation.sourceFile}</p>

                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                            <section className="rounded-xl border border-border/50 bg-background p-4">
                                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Parameters</h3>
                                {operation.parameters.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">None</p>
                                ) : (
                                    <div className="space-y-2">
                                        {operation.parameters.map((param) => (
                                            <div key={`${operation.method}-${operation.path}-${param.in}-${param.name}`} className="rounded-lg border border-border/40 p-2">
                                                <p className="font-mono text-xs">
                                                    {param.name} <span className="text-muted-foreground">({param.in})</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground">required: {String(Boolean(param.required))}</p>
                                                {param.description ? <p className="text-xs text-muted-foreground">{param.description}</p> : null}
                                                {param.schema ? (
                                                    <pre className="mt-1 overflow-x-auto rounded bg-muted/40 p-2 text-[11px]">{formatJson(param.schema)}</pre>
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="rounded-xl border border-border/50 bg-background p-4">
                                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Request Body</h3>
                                {!operation.requestBody ? (
                                    <p className="text-sm text-muted-foreground">None</p>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-xs text-muted-foreground">required: {String(Boolean(operation.requestBody.required))}</p>
                                        {Object.entries(operation.requestBody.content).map(([contentType, content]) => (
                                            <div key={`${operation.method}-${operation.path}-${contentType}`} className="rounded-lg border border-border/40 p-2">
                                                <p className="font-mono text-xs">{contentType}</p>
                                                {content.schema ? (
                                                    <pre className="mt-1 overflow-x-auto rounded bg-muted/40 p-2 text-[11px]">{formatJson(content.schema)}</pre>
                                                ) : null}
                                                {content.example !== undefined ? (
                                                    <pre className="mt-1 overflow-x-auto rounded bg-muted/40 p-2 text-[11px]">{formatJson(content.example)}</pre>
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>

                        <section className="mt-4 rounded-xl border border-border/50 bg-background p-4">
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Responses</h3>
                            <div className="space-y-3">
                                {operation.responses.map((response) => (
                                    <div key={`${operation.method}-${operation.path}-${response.status}`} className="rounded-lg border border-border/40 p-2">
                                        <p className="font-mono text-xs">{response.status} - {response.description}</p>
                                        {!response.content ? null : Object.entries(response.content).map(([contentType, content]) => (
                                            <div key={`${operation.method}-${operation.path}-${response.status}-${contentType}`} className="mt-2">
                                                <p className="font-mono text-[11px] text-muted-foreground">{contentType}</p>
                                                {content.schema ? (
                                                    <pre className="mt-1 overflow-x-auto rounded bg-muted/40 p-2 text-[11px]">{formatJson(content.schema)}</pre>
                                                ) : null}
                                                {content.example !== undefined ? (
                                                    <pre className="mt-1 overflow-x-auto rounded bg-muted/40 p-2 text-[11px]">{formatJson(content.example)}</pre>
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </article>
                ))}
            </section>
        </div>
    );
}

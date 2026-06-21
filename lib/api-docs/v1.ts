import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { ApiOperationSpec, ApiResponseDoc, getV1OperationSpec } from "@/lib/api-docs/v1-operation-spec";

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];

export interface V1EndpointDoc {
    path: string;
    methods: HttpMethod[];
    sourceFile: string;
    operations: V1OperationDoc[];
}

export interface V1OperationDoc {
    path: string;
    method: HttpMethod;
    sourceFile: string;
    summary: string;
    description?: string;
    parameters: NonNullable<ApiOperationSpec["parameters"]>;
    requestBody?: ApiOperationSpec["requestBody"];
    responses: ApiResponseDoc[];
}

function walkRouteFiles(dir: string): string[] {
    const entries = readdirSync(dir);
    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            files.push(...walkRouteFiles(fullPath));
            continue;
        }

        if (entry === "route.ts") {
            files.push(fullPath);
        }
    }

    return files;
}

function extractMethods(fileContent: string): HttpMethod[] {
    const methods: HttpMethod[] = [];
    for (const method of HTTP_METHODS) {
        const methodRegex = new RegExp(`export\\s+async\\s+function\\s+${method}\\b`, "m");
        if (methodRegex.test(fileContent)) {
            methods.push(method);
        }
    }
    return methods;
}

function normalizeEndpointPath(routeFile: string, apiV1Root: string): string {
    const routeDir = relative(apiV1Root, routeFile).replace(/\\/g, "/").replace(/\/route\.ts$/, "");
    const normalized = routeDir
        .split("/")
        .filter(Boolean)
        .map((segment) => {
            if (segment.startsWith("[") && segment.endsWith("]")) {
                return `{${segment.slice(1, -1)}}`;
            }
            return segment;
        })
        .join("/");

    return normalized ? `/api/v1/${normalized}` : "/api/v1";
}

function methodSummary(path: string, method: HttpMethod): string {
    return `${method} ${path}`;
}

function defaultResponsesForMethod(method: HttpMethod): ApiResponseDoc[] {
    if (method === "POST") {
        return [
            { status: 201, description: "Created" },
            { status: 400, description: "Bad Request" },
            { status: 401, description: "Unauthorized" },
            { status: 403, description: "Forbidden" },
            { status: 500, description: "Internal Server Error" },
        ];
    }

    return [
        { status: 200, description: "Success" },
        { status: 400, description: "Bad Request" },
        { status: 401, description: "Unauthorized" },
        { status: 403, description: "Forbidden" },
        { status: 404, description: "Not Found" },
        { status: 500, description: "Internal Server Error" },
    ];
}

export function generateV1EndpointDocs(workspaceRoot = process.cwd()): V1EndpointDoc[] {
    const apiV1Root = join(workspaceRoot, "app", "api", "v1");
    const routeFiles = walkRouteFiles(apiV1Root);

    const endpoints = routeFiles
        .map((filePath) => {
            const content = readFileSync(filePath, "utf8");
            const methods = extractMethods(content);
            const path = normalizeEndpointPath(filePath, apiV1Root);
            const sourceFile = relative(workspaceRoot, filePath).replace(/\\/g, "/");
            const operations = methods.map((method) => {
                const operationSpec = getV1OperationSpec(path, method);
                return {
                    path,
                    method,
                    sourceFile,
                    summary: operationSpec?.summary ?? methodSummary(path, method),
                    description: operationSpec?.description,
                    parameters: operationSpec?.parameters ?? [],
                    requestBody: operationSpec?.requestBody,
                    responses: operationSpec?.responses ?? defaultResponsesForMethod(method),
                };
            });

            return {
                path,
                methods,
                sourceFile,
                operations,
            };
        })
        .filter((endpoint) => endpoint.methods.length > 0)
        .sort((a, b) => a.path.localeCompare(b.path));

    return endpoints;
}

export function generateV1OpenApiDocument(workspaceRoot = process.cwd()) {
    const endpoints = generateV1EndpointDocs(workspaceRoot);

    const paths: Record<string, Record<string, unknown>> = {};

    for (const endpoint of endpoints) {
        const pathItem: Record<string, unknown> = paths[endpoint.path] ?? {};

        for (const operation of endpoint.operations) {
            const responses = operation.responses.reduce<Record<string, unknown>>((acc, response) => {
                acc[String(response.status)] = {
                    description: response.description,
                    ...(response.content
                        ? {
                            content: Object.fromEntries(
                                Object.entries(response.content).map(([contentType, contentDef]) => [
                                    contentType,
                                    {
                                        ...(contentDef.schema ? { schema: contentDef.schema } : {}),
                                        ...(contentDef.example !== undefined ? { example: contentDef.example } : {}),
                                    },
                                ])
                            ),
                        }
                        : {}),
                };
                return acc;
            }, {});

            const requestBody = operation.requestBody
                ? {
                    required: operation.requestBody.required ?? false,
                    description: operation.requestBody.description,
                    content: Object.fromEntries(
                        Object.entries(operation.requestBody.content).map(([contentType, contentDef]) => [
                            contentType,
                            {
                                ...(contentDef.schema ? { schema: contentDef.schema } : {}),
                                ...(contentDef.example !== undefined ? { example: contentDef.example } : {}),
                            },
                        ])
                    ),
                }
                : undefined;

            const parameters = operation.parameters.length
                ? operation.parameters.map((parameter) => ({
                    name: parameter.name,
                    in: parameter.in,
                    required: parameter.required ?? false,
                    description: parameter.description,
                    ...(parameter.schema ? { schema: parameter.schema } : {}),
                    ...(parameter.example !== undefined ? { example: parameter.example } : {}),
                }))
                : undefined;

            pathItem[operation.method.toLowerCase()] = {
                summary: operation.summary,
                ...(operation.description ? { description: operation.description } : {}),
                tags: ["v1"],
                security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
                ...(parameters ? { parameters } : {}),
                ...(requestBody ? { requestBody } : {}),
                responses,
            };
        }

        paths[endpoint.path] = pathItem;
    }

    return {
        openapi: "3.1.0",
        info: {
            title: "url.dev API",
            version: "1.0.0",
            description: "Auto-generated API reference for v1 routes.",
        },
        servers: [{ url: "/" }],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: "apiKey",
                    in: "header",
                    name: "x-api-key",
                },
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "API Key",
                },
            },
        },
        security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
        paths,
        "x-generatedAt": new Date().toISOString(),
        "x-endpointCount": endpoints.length,
    };
}

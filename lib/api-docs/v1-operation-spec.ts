export type ApiParamIn = "path" | "query" | "header";

export interface ApiParameterDoc {
    name: string;
    in: ApiParamIn;
    required?: boolean;
    description?: string;
    schema?: Record<string, unknown>;
    example?: unknown;
}

export interface ApiContentDoc {
    schema?: Record<string, unknown>;
    example?: unknown;
}

export interface ApiRequestBodyDoc {
    required?: boolean;
    description?: string;
    content: Record<string, ApiContentDoc>;
}

export interface ApiResponseDoc {
    status: number;
    description: string;
    content?: Record<string, ApiContentDoc>;
}

export interface ApiOperationSpec {
    summary?: string;
    description?: string;
    parameters?: ApiParameterDoc[];
    requestBody?: ApiRequestBodyDoc;
    responses?: ApiResponseDoc[];
}

const shortUrlSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        slug: { type: "string" },
        originalUrl: { type: "string" },
        title: { type: ["string", "null"] },
        isActive: { type: "boolean" },
        clickCount: { type: "integer" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
    },
};

const clickSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        shortUrlId: { type: "string" },
        clickedAt: { type: "string", format: "date-time" },
        ipAddress: { type: ["string", "null"] },
        countryName: { type: ["string", "null"] },
        deviceType: { type: ["string", "null"] },
        browserName: { type: ["string", "null"] },
        refererDomain: { type: ["string", "null"] },
        refererType: { type: ["string", "null"] },
    },
};

const routeSpecs: Record<string, ApiOperationSpec> = {
    "GET /api/v1/openapi": {
        summary: "Get OpenAPI document",
        responses: [
            {
                status: 200,
                description: "OpenAPI JSON",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                openapi: { type: "string" },
                                info: { type: "object" },
                                paths: { type: "object" },
                            },
                        },
                    },
                },
            },
        ],
    },
    "GET /api/v1/urls": {
        summary: "List URLs",
        parameters: [
            { name: "view", in: "query", description: "all or paginated", schema: { type: "string", enum: ["all", "paginated"] } },
            { name: "page", in: "query", schema: { type: "integer", minimum: 1 }, example: 1 },
            { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1 }, example: 25 },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "sortBy", in: "query", schema: { type: "string", enum: ["createdAt", "updatedAt", "slug", "clickCount"] } },
            { name: "sortDir", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
            { name: "isActive", in: "query", schema: { type: "boolean" } },
        ],
        responses: [
            {
                status: 200,
                description: "List result",
                content: {
                    "application/json": {
                        schema: {
                            oneOf: [
                                { type: "array", items: shortUrlSchema },
                                {
                                    type: "object",
                                    properties: {
                                        data: { type: "array", items: shortUrlSchema },
                                        total: { type: "integer" },
                                        page: { type: "integer" },
                                        pageSize: { type: "integer" },
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        ],
    },
    "POST /api/v1/urls": {
        summary: "Create or upsert URL",
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            slug: { type: "string" },
                            originalUrl: { type: "string" },
                            title: { type: "string" },
                            description: { type: "string" },
                            isActive: { type: "boolean" },
                            metadata: { type: "string", description: "JSON string" },
                        },
                        required: ["slug", "originalUrl"],
                    },
                    example: {
                        slug: "launch",
                        originalUrl: "https://example.com/launch",
                        title: "Launch page",
                        isActive: true,
                    },
                },
            },
        },
        responses: [
            { status: 201, description: "Created", content: { "application/json": { schema: shortUrlSchema } } },
        ],
    },
    "GET /api/v1/urls/{id}": {
        summary: "Get URL by id",
        parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
            { name: "includeAnalytics", in: "query", schema: { type: "boolean" } },
        ],
        responses: [
            { status: 200, description: "URL detail", content: { "application/json": { schema: { type: "object" } } } },
            { status: 404, description: "Not found", content: { "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } } } },
        ],
    },
    "PATCH /api/v1/urls/{id}": {
        summary: "Update URL",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            url: { type: "string" },
                            slug: { type: "string" },
                            title: { type: "string" },
                            isActive: { type: "boolean" },
                        },
                    },
                    example: { title: "Updated title", isActive: false },
                },
            },
        },
        responses: [
            { status: 200, description: "Updated", content: { "application/json": { schema: shortUrlSchema } } },
            { status: 404, description: "Not found", content: { "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } } } },
        ],
    },
    "DELETE /api/v1/urls/{id}": {
        summary: "Delete URL",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: [
            { status: 200, description: "Deleted", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" } } } } } },
        ],
    },
    "POST /api/v1/urls/{id}/toggle-active": {
        summary: "Toggle URL active state",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: [
            { status: 200, description: "Toggled", content: { "application/json": { schema: shortUrlSchema } } },
            { status: 404, description: "Not found", content: { "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } } } },
        ],
    },
    "GET /api/v1/urls/{id}/analytics": {
        summary: "Get URL analytics overview",
        parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
            { name: "days", in: "query", schema: { type: "integer", minimum: 1 }, example: 30 },
            { name: "topLimit", in: "query", schema: { type: "integer", minimum: 1 }, example: 10 },
        ],
        responses: [
            {
                status: 200,
                description: "Analytics overview",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                urlId: { type: "string" },
                                summary: { type: "object" },
                                charts: { type: "object" },
                            },
                        },
                    },
                },
            },
        ],
    },
    "GET /api/v1/urls/{id}/clicks": {
        summary: "Get URL clicks or CSV export",
        parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
            { name: "format", in: "query", schema: { type: "string", enum: ["json", "csv"] }, example: "json" },
            { name: "page", in: "query", schema: { type: "integer", minimum: 1 }, example: 1 },
            { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1 }, example: 50 },
            { name: "startDate", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "endDate", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "country", in: "query", schema: { type: "string" } },
            { name: "device", in: "query", schema: { type: "string" } },
            { name: "limit", in: "query", schema: { type: "integer", minimum: 1 }, description: "CSV mode limit" },
        ],
        responses: [
            {
                status: 200,
                description: "Clicks in JSON or CSV",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                data: { type: "array", items: clickSchema },
                                total: { type: "integer" },
                                page: { type: "integer" },
                                pageSize: { type: "integer" },
                            },
                        },
                    },
                    "text/csv": {
                        schema: { type: "string" },
                    },
                },
            },
        ],
    },
    "GET /api/v1/analytics": {
        summary: "Workspace analytics",
        parameters: [
            {
                name: "type",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    enum: [
                        "overview",
                        "daily",
                        "topUrls",
                        "topCountries",
                        "referrers",
                        "devices",
                        "browsers",
                        "totalClicks",
                        "uniqueVisitors",
                        "topCountry",
                        "deviceDiversity",
                        "clicks",
                        "exportClicks",
                    ],
                },
            },
            { name: "urlId", in: "query", schema: { type: "string" } },
            { name: "days", in: "query", schema: { type: "integer", minimum: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", minimum: 1 } },
            { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
            { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1 } },
            { name: "startDate", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "endDate", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "country", in: "query", schema: { type: "string" } },
            { name: "device", in: "query", schema: { type: "string" } },
        ],
        responses: [
            {
                status: 200,
                description: "Analytics payload (shape depends on type)",
                content: {
                    "application/json": {
                        schema: { type: "object" },
                    },
                    "text/csv": {
                        schema: { type: "string" },
                    },
                },
            },
            {
                status: 400,
                description: "Unknown type or invalid params",
                content: {
                    "application/json": {
                        schema: { type: "object", properties: { error: { type: "string" } } },
                    },
                },
            },
        ],
    },
};

export function getV1OperationSpec(path: string, method: string): ApiOperationSpec | undefined {
    return routeSpecs[`${method.toUpperCase()} ${path}`];
}

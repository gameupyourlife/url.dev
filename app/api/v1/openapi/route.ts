import { NextResponse } from "next/server";
import { generateV1OpenApiDocument } from "@/lib/api-docs/v1";

export async function GET() {
    const document = generateV1OpenApiDocument();
    return NextResponse.json(document);
}

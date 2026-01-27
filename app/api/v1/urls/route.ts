import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shortUrl } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";
import { z } from "zod";
import { eq } from "drizzle-orm";

const createUrlSchema = z.object({
  url: z.string().url("Invalid URL format"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(20, "Slug must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Slug can only contain letters, numbers, hyphens, and underscores")
    .optional(),
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  expiresAt: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = createUrlSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { url, slug, title, description, expiresAt } = validation.data;

    // Generate slug if not provided
    const finalSlug = slug || nanoid(8);

    // Check if slug already exists
    const existing = await db.query.shortUrl.findFirst({
      where: eq(shortUrl.slug, finalSlug),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists. Please choose a different one." },
        { status: 409 }
      );
    }

    // Create shortened URL
    const [newUrl] = await db
      .insert(shortUrl)
      .values({
        id: nanoid(),
        slug: finalSlug,
        originalUrl: url,
        userId: session.user.id,
        title,
        description,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .returning();

    const shortUrl = `${req.nextUrl.origin}/s/${newUrl.slug}`;

    return NextResponse.json(
      {
        id: newUrl.id,
        slug: newUrl.slug,
        originalUrl: newUrl.originalUrl,
        shortUrl,
        title: newUrl.title,
        description: newUrl.description,
        clicks: newUrl.clickCount,
        active: newUrl.isActive,
        expiresAt: newUrl.expiresAt,
        createdAt: newUrl.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating short URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's URLs
    const userUrls = await db.query.shortUrl.findMany({
      where: eq(shortUrl.userId, session.user.id),
      orderBy: (shortUrl, { desc }) => [desc(shortUrl.createdAt)],
    });

    const urlsWithShortUrl = userUrls.map((url) => ({
      ...url,
      shortUrl: `${req.nextUrl.origin}/s/${url.slug}`,
    }));

    return NextResponse.json(urlsWithShortUrl);
  } catch (error) {
    console.error("Error fetching URLs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

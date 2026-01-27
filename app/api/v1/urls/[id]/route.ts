import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shortUrl } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updateUrlSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const url = await db.query.shortUrl.findFirst({
      where: and(
        eq(shortUrl.id, id),
        eq(shortUrl.userId, session.user.id)
      ),
      with: {
        clicks: {
          orderBy: (clicks, { desc }) => [desc(clicks.clickedAt)],
          limit: 100,
        },
      },
    });

    if (!url) {
      return NextResponse.json(
        { error: "URL not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...url,
      shortUrl: `${req.nextUrl.origin}/s/${url.slug}`,
    });
  } catch (error) {
    console.error("Error fetching URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const validation = updateUrlSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { title, description, isActive, expiresAt } = validation.data;

    const [updatedUrl] = await db
      .update(shortUrl)
      .set({
        title,
        description,
        isActive,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : undefined,
      })
      .where(and(
        eq(shortUrl.id, id),
        eq(shortUrl.userId, session.user.id)
      ))
      .returning();

    if (!updatedUrl) {
      return NextResponse.json(
        { error: "URL not found or you don't have permission to update it" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...updatedUrl,
      shortUrl: `${req.nextUrl.origin}/s/${updatedUrl.slug}`,
    });
  } catch (error) {
    console.error("Error updating URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const [deletedUrl] = await db
      .delete(shortUrl)
      .where(and(
        eq(shortUrl.id, id),
        eq(shortUrl.userId, session.user.id)
      ))
      .returning();

    if (!deletedUrl) {
      return NextResponse.json(
        { error: "URL not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "URL deleted successfully",
      id: deletedUrl.id,
    });
  } catch (error) {
    console.error("Error deleting URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

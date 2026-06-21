import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createHash } from "node:crypto";
import { and, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { shortUrl } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

const ANON_CREATE_LIMIT = 1;
const QUICK_CREATE_FINGERPRINT_KEY =
  process.env.QUICK_CREATE_FINGERPRINT_KEY ||
  process.env.BETTER_AUTH_SECRET ||
  "dev-only-quick-create-key";
const FINGERPRINT_METADATA_PREFIX = '"quickCreateFingerprint":"';

type ShortenRequestBody = {
  url?: unknown;
};

function normalizeUrl(value: string) {
  const parsed = new URL(value);
  return parsed.toString();
}

function getBaseUrl(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
  }

  return req.nextUrl.origin;
}

function getClientIp(req: NextRequest) {
  const xForwardedFor = req.headers.get("x-forwarded-for") || "";
  const firstForwardedIp = xForwardedFor.split(",")[0]?.trim();
  return (
    firstForwardedIp ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "unknown-ip"
  );
}

function getAnonymousFingerprint(req: NextRequest) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") || "unknown-agent";
  const language = req.headers.get("accept-language") || "unknown-language";

  return createHash("sha256")
    .update(`${QUICK_CREATE_FINGERPRINT_KEY}|${ip}|${userAgent}|${language}`)
    .digest("hex");
}

async function getAnonymousCreateCount(fingerprint: string) {
  const fingerprintNeedle = `${FINGERPRINT_METADATA_PREFIX}${fingerprint}"`;

  const result = await db
    .select({ total: sql<number>`count(*)` })
    .from(shortUrl)
    .where(
      and(
        isNull(shortUrl.userId),
        isNull(shortUrl.organizationId),
        sql`${shortUrl.metadata} like ${`%${fingerprintNeedle}%`}`,
      ),
    );

  return Number(result[0]?.total ?? 0);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as ShortenRequestBody | null;
    if (!body || typeof body.url !== "string" || !body.url.trim()) {
      return NextResponse.json({ error: "A valid URL is required." }, { status: 400 });
    }

    let normalizedUrl = "";
    try {
      normalizedUrl = normalizeUrl(body.url.trim());
    } catch {
      return NextResponse.json({ error: "Please enter a valid absolute URL." }, { status: 400 });
    }

    const session = await auth.api.getSession({ headers: req.headers });
    const isAnonymous = !session;
    const fingerprint = isAnonymous ? getAnonymousFingerprint(req) : null;

    if (isAnonymous && fingerprint) {
      const count = await getAnonymousCreateCount(fingerprint);
      if (count >= ANON_CREATE_LIMIT) {
        return NextResponse.json(
          {
            error: "You have reached the quick-create limit. Sign up to create more links.",
            code: "signup_required",
            limit: ANON_CREATE_LIMIT,
          },
          { status: 429 },
        );
      }
    }

    let created = null;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const slug = nanoid(7).toLowerCase();

      const rows = await db
        .insert(shortUrl)
        .values({
          id: nanoid(),
          slug,
          originalUrl: normalizedUrl,
          userId: session?.user.id ?? null,
          organizationId: session?.session.activeOrganizationId ?? null,
          metadata: fingerprint
            ? JSON.stringify({
                quickCreate: true,
                quickCreateFingerprint: fingerprint,
              })
            : null,
        })
        .onConflictDoNothing({ target: shortUrl.slug })
        .returning({ id: shortUrl.id, slug: shortUrl.slug, originalUrl: shortUrl.originalUrl });

      if (rows[0]) {
        created = rows[0];
        break;
      }
    }

    if (!created) {
      return NextResponse.json({ error: "Failed to generate a unique short URL." }, { status: 500 });
    }

    const shortLink = `${getBaseUrl(req)}/s/${created.slug}`;
    const response = NextResponse.json({
      id: created.id,
      slug: created.slug,
      originalUrl: created.originalUrl,
      shortUrl: shortLink,
      requiresSignup: isAnonymous,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

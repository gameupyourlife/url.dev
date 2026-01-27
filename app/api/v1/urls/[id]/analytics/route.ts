import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shortUrl, click } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, desc, gte } from "drizzle-orm";

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
    const { searchParams } = req.nextUrl;
    const days = parseInt(searchParams.get("days") || "30");

    // Verify URL ownership
    const url = await db.query.shortUrl.findFirst({
      where: and(
        eq(shortUrl.id, id),
        eq(shortUrl.userId, session.user.id)
      ),
    });

    if (!url) {
      return NextResponse.json(
        { error: "URL not found" },
        { status: 404 }
      );
    }

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Get analytics data
    const analytics = await db.query.click.findMany({
      where: and(
        eq(click.shortUrlId, id),
        gte(click.clickedAt, dateThreshold)
      ),
      orderBy: [desc(click.clickedAt)],
    });

    // Aggregate statistics
    const browserStats = analytics.reduce((acc: Record<string, number>, curr) => {
      const browser = curr.browserName || "Unknown";
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {});

    const osStats = analytics.reduce((acc: Record<string, number>, curr) => {
      const os = curr.osName || "Unknown";
      acc[os] = (acc[os] || 0) + 1;
      return acc;
    }, {});

    const deviceStats = analytics.reduce((acc: Record<string, number>, curr) => {
      const device = curr.deviceType || "Unknown";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    const referrerStats = analytics.reduce((acc: Record<string, number>, curr) => {
      const referrer = curr.refererSource || curr.refererDomain || "Direct";
      acc[referrer] = (acc[referrer] || 0) + 1;
      return acc;
    }, {});

    const countryStats = analytics.reduce((acc: Record<string, number>, curr) => {
      const country = curr.countryName || curr.countryCode || "Unknown";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    const refererTypeStats = analytics.reduce((acc: Record<string, number>, curr) => {
      const type = curr.refererType || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Group by date
    const clicksByDate = analytics.reduce((acc: Record<string, number>, curr) => {
      const date = curr.clickedAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Bot vs Human traffic
    const botStats = {
      bots: analytics.filter(a => a.isBot).length,
      humans: analytics.filter(a => !a.isBot).length,
    };

    return NextResponse.json({
      totalClicks: analytics.length,
      browsers: browserStats,
      operatingSystems: osStats,
      devices: deviceStats,
      referrers: referrerStats,
      countries: countryStats,
      refererTypes: refererTypeStats,
      botStats,
      clicksByDate,
      recentClicks: analytics.slice(0, 50).map(a => ({
        timestamp: a.clickedAt,
        browser: `${a.browserName || "Unknown"} ${a.browserVersion || ""}`.trim(),
        os: `${a.osName || "Unknown"} ${a.osVersion || ""}`.trim(),
        device: a.deviceType,
        referrer: a.referer,
        refererDomain: a.refererDomain,
        refererType: a.refererType,
        country: a.countryName || a.countryCode,
        city: a.city,
        isBot: a.isBot,
        ipAddress: a.ipAddress,
      })),
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

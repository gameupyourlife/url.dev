"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Code2,
  Link2,
  Shield,
  Globe,
  Terminal,
  Sparkles,
  Zap,
  Copy,
  Check,
  CheckCircle2,
  QrCode,
  MousePointerClick,
  Gauge,
  Star,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Illustrations                                                             */
/* -------------------------------------------------------------------------- */

function DashboardPreview() {
  return (
    <div className="relative rounded-2xl border border-border/60 bg-card overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-destructive/40" />
          <span className="h-3 w-3 rounded-full bg-secondary" />
          <span className="h-3 w-3 rounded-full bg-primary/30" />
        </div>
        <div className="mx-auto flex items-center gap-2 rounded-lg bg-background/80 px-3 py-1 text-xs text-muted-foreground font-mono">
          <Link2 className="h-3 w-3" />
          {process.env.NEXT_PUBLIC_BASE_URL}/dashboard
        </div>
      </div>

      {/* Dashboard body */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Stat row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total clicks", value: "1.24M", accent: "text-primary" },
            { label: "Active links", value: "8,402", accent: "text-foreground" },
            { label: "Countries", value: "156", accent: "text-foreground" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border/60 bg-background/60 p-3"
            >
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {s.label}
              </div>
              <div className={`mt-1 text-lg font-bold ${s.accent}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Chart card */}
        <div className="rounded-xl border border-border/60 bg-background/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-medium">Traffic overview</div>
            <Badge variant="secondary" className="text-[10px]">
              Last 30 days
            </Badge>
          </div>
          <AreaChart />
        </div>

        {/* Mini table */}
        <div className="space-y-2">
          {[
            { slug: "/launch", clicks: "12,841", w: "w-[88%]" },
            { slug: "/docs-v2", clicks: "9,204", w: "w-[64%]" },
            { slug: "/pricing", clicks: "5,517", w: "w-[42%]" },
          ].map((r) => (
            <div
              key={r.slug}
              className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/60 px-3 py-2"
            >
              <span className="font-mono text-xs text-primary">{process.env.NEXT_PUBLIC_BASE_URL}{r.slug}</span>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className={`absolute inset-y-0 left-0 ${r.w} rounded-full bg-primary/70`} />
              </div>
              <span className="font-mono text-xs text-muted-foreground">{r.clicks}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AreaChart({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 110"
      className={`h-24 w-full ${className}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="text-primary">
        <path
          d="M0,88 C28,70 48,80 78,55 C108,30 128,62 158,46 C190,28 210,18 240,34 C268,48 296,22 320,18 L320,110 L0,110 Z"
          fill="url(#areaFill)"
        />
        <path
          d="M0,88 C28,70 48,80 78,55 C108,30 128,62 158,46 C190,28 210,18 240,34 C268,48 296,22 320,18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="240" cy="34" r="3.5" fill="currentColor" />
      </g>
    </svg>
  );
}

function GlobeIllustration() {
  const dots = [
    [20, 30], [40, 22], [60, 38], [80, 26], [100, 44], [120, 30],
    [30, 55], [55, 60], [78, 52], [104, 64], [128, 56], [18, 78],
    [44, 84], [70, 76], [96, 88], [122, 80], [142, 46], [142, 70],
  ];
  return (
    <svg viewBox="0 0 160 110" className="h-full w-full text-primary" aria-hidden>
      {dots.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i % 4 === 0 ? 2.6 : 1.6}
          fill="currentColor"
          opacity={i % 3 === 0 ? 0.9 : 0.4}
        />
      ))}
      <path
        d="M40 22 C70 40 100 30 128 56"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="3 4"
        opacity="0.6"
      />
      <path
        d="M18 78 C60 60 90 80 142 46"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="3 4"
        opacity="0.6"
      />
    </svg>
  );
}

function QrIllustration() {
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full text-primary" aria-hidden>
      {/* corners */}
      {[[6, 6], [54, 6], [6, 54]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="20" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
          <rect x={x + 6} y={y + 6} width="8" height="8" rx="2" fill="currentColor" />
        </g>
      ))}
      {/* random modules */}
      {[
        [34, 8], [42, 8], [34, 16], [50, 20], [34, 28], [44, 28],
        [60, 34], [68, 34], [60, 42], [34, 40], [44, 48], [54, 54],
        [62, 54], [54, 62], [68, 62], [40, 60], [40, 68], [62, 70],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="6" height="6" rx="1.5" fill="currentColor" opacity={i % 3 ? 0.85 : 0.5} />
      ))}
    </svg>
  );
}

function CodeIllustration() {
  const lines = [
    { w: "w-10", c: "bg-secondary" },
    { w: "w-24", c: "bg-primary/60" },
    { w: "w-16", c: "bg-muted-foreground/30" },
    { w: "w-28", c: "bg-primary/40" },
    { w: "w-14", c: "bg-secondary" },
    { w: "w-20", c: "bg-muted-foreground/30" },
  ];
  return (
    <div className="space-y-2">
      {lines.map((l, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground/50 w-3">{i + 1}</span>
          <span className={`h-2 rounded-full ${l.w} ${l.c}`} />
        </div>
      ))}
    </div>
  );
}

function GaugeIllustration() {
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" aria-hidden>
      <path
        d="M14 70 A46 46 0 0 1 106 70"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        className="text-muted"
      />
      <path
        d="M14 70 A46 46 0 0 1 92 38"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        className="text-primary"
      />
      <circle cx="60" cy="70" r="5" className="fill-foreground" />
      <line x1="60" y1="70" x2="90" y2="42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-foreground" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function Page() {
  const [url, setUrl] = useState("");
  const [shortened, setShortened] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [signupRequired, setSignupRequired] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof typeof codeExamples>("curl");

  const handleShorten = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl || isSubmitting || signupRequired) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/public/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      const data = (await res.json().catch(() => null)) as
        | {
            shortUrl?: string;
            error?: string;
            code?: string;
            requiresSignup?: boolean;
          }
        | null;

      if (!res.ok) {
        setErrorMessage(data?.error || "Could not shorten this URL. Please try again.");
        if (data?.code === "signup_required") {
          setSignupRequired(true);
        }
        return;
      }

      if (!data?.shortUrl) {
        setErrorMessage("Unexpected response from server.");
        return;
      }

      setShortened(data.shortUrl);
      setUrl("");
      setCopied(false);
      if (data.requiresSignup) {
        setSignupRequired(true);
      }
    } catch {
      setErrorMessage("Network error while shortening URL. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (!shortened) return;
    navigator.clipboard.writeText(shortened);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeExamples = {
    curl: `curl -X POST ${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/urls \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com", "slug": "launch"}'`,
    javascript: `const res = await fetch("${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/urls", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ url: "https://example.com", slug: "launch" }),
});
const data = await res.json();`,
    python: `import requests

res = requests.post(
    f"${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/urls",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={"url": "https://example.com", "slug": "launch"},
)
data = res.json()`,
  } as const;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background layers */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.4] mask-[radial-gradient(ellipse_at_top,black,transparent_70%)]"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, var(--border) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="pointer-events-none fixed -top-40 left-1/2 z-0 h-120 w-170 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none fixed -top-20 right-0 z-0 h-90 w-90 rounded-full bg-secondary/20 blur-[120px]" />

      <div className="relative z-10">
        {/* ---------------------------------------------------------------- */}
        {/* Nav */}
        {/* ---------------------------------------------------------------- */}
        <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Link2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">url.dev</span>
              <Badge variant="secondary" className="ml-1 text-[10px]">
                v2.0
              </Badge>
            </Link>

            <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
              <Link href="#features" className="transition-colors hover:text-foreground">
                Features
              </Link>
              <Link href="#api" className="transition-colors hover:text-foreground">
                API
              </Link>
              <Link href="#pricing" className="transition-colors hover:text-foreground">
                Pricing
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/signin">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button>
                  Get started
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* ---------------------------------------------------------------- */}
        {/* Hero */}
        {/* ---------------------------------------------------------------- */}
        <section className="mx-auto max-w-7xl px-4 pb-12 pt-16 text-center sm:px-6 lg:px-8 lg:pt-24">
          <Link href="#features">
            <Badge
              variant="secondary"
              className="mb-6 gap-1.5 rounded-full px-3 py-1 text-xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Real-time analytics is now live
              <ArrowRight className="h-3 w-3" />
            </Badge>
          </Link>

          <h1 className="mx-auto max-w-4xl text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Short links with{" "}
            <span className="bg-linear-to-br from-primary via-primary to-secondary-foreground bg-clip-text text-transparent">
              superpowers
            </span>{" "}
            for developers
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Shorten URLs, track every click in real time, and ship link
            infrastructure with a clean REST API. Built for scale, designed for
            developers.
          </p>

          {/* Inline try-it demo */}
          <div className="mx-auto mt-8 max-w-xl">
            <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-2 sm:flex-row">
              <Input
                type="url"
                placeholder="Paste a long URL to shorten…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleShorten()}
                disabled={isSubmitting || signupRequired}
                className="h-11 flex-1 border-none bg-transparent shadow-none focus-visible:ring-0"
              />
              <Button
                size="lg"
                onClick={handleShorten}
                disabled={isSubmitting || signupRequired}
                className="h-11 px-6"
              >
                <Zap className="mr-1 h-4 w-4" />
                {isSubmitting ? "Shortening..." : signupRequired ? "Limit reached" : "Shorten"}
              </Button>
            </div>

            {errorMessage && errorMessage != "You have reached the quick-create limit. Sign up to create more links." && (
              <p className="mt-3 text-sm text-destructive">{errorMessage}</p>
            )}

            {shortened && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 animate-in fade-in slide-in-from-bottom-2">
                <span className="truncate font-mono text-sm font-semibold text-primary">
                  {shortened}
                </span>
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="shrink-0">
                  {copied ? (
                    <>
                      <CheckCircle2 className="mr-1 h-4 w-4" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-4 w-4" /> Copy
                    </>
                  )}
                </Button>
              </div>
            )}

            {signupRequired && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 text-left">
                <p className="text-sm text-muted-foreground">
                  You have used your free quick link. Create an account to keep shortening and track analytics.
                </p>
                <Link href="/signup" className="shrink-0">
                  <Button size="sm">
                    Sign up free
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Try one link instantly, then sign up for unlimited creation.
            </p>
          </div>

          {/* Product demo */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="pointer-events-none absolute -inset-x-10 -top-10 -z-10 h-72 bg-linear-to-b from-primary/10 to-transparent blur-2xl" />
            <DashboardPreview />
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Logo strip */}
        {/* ---------------------------------------------------------------- */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by fast-moving teams
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
            {["Vercel", "Linear", "Supabase", "Raycast", "Resend", "Cal.com"].map(
              (name) => (
                <span
                  key={name}
                  className="text-lg font-semibold tracking-tight text-muted-foreground"
                >
                  {name}
                </span>
              )
            )}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Bento grid */}
        {/* ---------------------------------------------------------------- */}
        <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-1 h-3 w-3" />
              Features
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to manage links
            </h2>
            <p className="mt-3 text-muted-foreground">
              A complete toolkit — from real-time analytics to a developer-first
              API, without the bloat.
            </p>
          </div>

          <div className="grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Analytics — large */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-card p-7 lg:col-span-2 lg:row-span-2">
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Real-time analytics</h3>
                <p className="mt-2 max-w-md text-muted-foreground">
                  Track clicks, locations, devices, browsers and referrers as
                  they happen. Insights that actually move the needle.
                </p>
              </div>
              <div className="mt-6 rounded-2xl border border-border/60 bg-background/60 p-5">
                <div className="mb-4 flex items-center gap-6">
                  <div>
                    <div className="text-2xl font-bold text-primary">1.24M</div>
                    <div className="text-xs text-muted-foreground">Clicks</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">156</div>
                    <div className="text-xs text-muted-foreground">Countries</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">99.9%</div>
                    <div className="text-xs text-muted-foreground">Uptime</div>
                  </div>
                </div>
                <AreaChart />
              </div>
            </div>

            {/* Global redirects — wide */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-card p-7 lg:col-span-2">
              <div className="relative z-10 max-w-xs">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Global edge redirects</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sub-50ms redirects from a worldwide CDN, with geo-targeting
                  built in.
                </p>
              </div>
              <div className="pointer-events-none absolute -right-2 top-2 h-40 w-44 opacity-80">
                <GlobeIllustration />
              </div>
            </div>

            {/* Speed */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-card p-7">
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Lightning fast</h3>
              </div>
              <div className="mx-auto my-2 h-20 w-32">
                <GaugeIllustration />
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">43ms</span>
                <span className="ml-1 text-xs text-muted-foreground">avg redirect</span>
              </div>
            </div>

            {/* QR codes */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-card p-7">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Instant QR codes</h3>
              </div>
              <div className="mx-auto my-2 h-20 w-20">
                <QrIllustration />
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Auto-generated for every link
              </p>
            </div>

            {/* API */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-card p-7 lg:col-span-2">
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Code2 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Developer-first API</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  A clean REST API with SDKs, webhooks and rate limiting. Ship
                  link infrastructure in minutes.
                </p>
              </div>
              <div className="mt-6 rounded-2xl border border-border/60 bg-background/60 p-5">
                <CodeIllustration />
              </div>
            </div>

            {/* Security */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-card p-7 lg:col-span-2">
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Enterprise-grade security</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Password protection, expiration dates and encrypted links keep
                  your data safe.
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant="secondary">SOC 2 Type II</Badge>
                <Badge variant="secondary">GDPR</Badge>
                <Badge variant="secondary">SSL encrypted</Badge>
                <Badge variant="secondary">2FA</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* API / code */}
        {/* ---------------------------------------------------------------- */}
        <section id="api" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="secondary" className="mb-4">
                <Terminal className="mr-1 h-3 w-3" />
                Developer API
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Integrate in seconds
              </h2>
              <p className="mt-3 text-muted-foreground">
                Production-ready snippets in your favorite language. Copy, paste,
                ship.
              </p>

              <div className="mt-8 space-y-5">
                {[
                  { icon: Code2, title: "Official SDKs", desc: "JavaScript, Python, Go, Ruby and more" },
                  { icon: Zap, title: "Real-time webhooks", desc: "Get notified on clicks, creates and updates" },
                  { icon: Gauge, title: "Generous rate limits", desc: "Built to handle production traffic" },
                ].map((f) => (
                  <div key={f.title} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <f.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{f.title}</div>
                      <div className="text-sm text-muted-foreground">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code window */}
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-3 py-2">
                <div className="flex gap-1">
                  {(Object.keys(codeExamples) as Array<keyof typeof codeExamples>).map(
                    (lang) => (
                      <Button
                        key={lang}
                        variant={activeTab === lang ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTab(lang)}
                        className="capitalize"
                      >
                        {lang === "curl" ? "cURL" : lang}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => navigator.clipboard.writeText(codeExamples[activeTab])}
                  aria-label="Copy code"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-zinc-950 p-5">
                <pre className="overflow-x-auto text-xs leading-relaxed sm:text-sm">
                  <code className="font-mono text-primary-foreground/90">
                    {codeExamples[activeTab]}
                  </code>
                </pre>
              </div>
              <div className="border-t border-border/60 bg-zinc-950 p-5">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Response
                </div>
                <pre className="overflow-x-auto text-xs leading-relaxed sm:text-sm">
                  <code className="font-mono text-secondary">
                    {`{
  "id": "abc123xyz",
  "shortUrl": "${process.env.NEXT_PUBLIC_BASE_URL}/launch",
  "originalUrl": "https://example.com",
  "clicks": 0,
  "createdAt": "2026-06-20T12:00:00Z",
  "qrCode": "${process.env.NEXT_PUBLIC_BASE_URL}/qr/launch"
}`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Stats band */}
        {/* ---------------------------------------------------------------- */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border/60 bg-border/60 lg:grid-cols-4">
            {[
              { value: "1B+", label: "Requests / month" },
              { value: "99.99%", label: "Uptime SLA" },
              { value: "43ms", label: "Avg redirect" },
              { value: "156", label: "Countries served" },
            ].map((s) => (
              <div key={s.label} className="bg-card p-8 text-center">
                <div className="text-3xl font-bold text-primary sm:text-4xl">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Pricing */}
        {/* ---------------------------------------------------------------- */}
        <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              <MousePointerClick className="mr-1 h-3 w-3" />
              Pricing
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Scale as you grow
            </h2>
            <p className="mt-3 text-muted-foreground">
              Start free, upgrade when you need more.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Free",
                price: "$0",
                suffix: "/mo",
                features: ["1,000 links / month", "Basic analytics", "API access", "QR codes"],
                cta: "Get started",
                variant: "outline" as const,
                featured: false,
              },
              {
                name: "Pro",
                price: "$29",
                suffix: "/mo",
                features: ["50,000 links / month", "Advanced analytics", "Custom domains", "Priority support"],
                cta: "Start free trial",
                variant: "default" as const,
                featured: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                suffix: "",
                features: ["Unlimited links", "White-label", "SLA guarantee", "Dedicated support"],
                cta: "Contact sales",
                variant: "outline" as const,
                featured: false,
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-3xl border bg-card p-7 ${tier.featured ? "border-primary ring-1 ring-primary" : "border-border/60"
                  }`}
              >
                {tier.featured && (
                  <Badge className="absolute right-6 top-6">Most popular</Badge>
                )}
                <h3 className="text-lg font-bold">{tier.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground">{tier.suffix}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-8">
                  <Button className="w-full" variant={tier.variant}>
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Testimonials */}
        {/* ---------------------------------------------------------------- */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Loved by developers
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  "The API is incredibly well-documented. We integrated it into our SaaS in under 30 minutes — analytics are a game changer.",
                name: "Sarah Chen",
                role: "Full-stack engineer",
              },
              {
                quote:
                  "We switched from Bitly and never looked back. The CLI fits perfectly into our CI/CD pipeline. Performance is unmatched.",
                name: "Marcus Rodriguez",
                role: "DevOps engineer",
              },
              {
                quote:
                  "Custom domains, webhooks and real-time analytics out of the box. A developer-first approach worth every penny.",
                name: "Alex Kim",
                role: "Startup founder",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="flex flex-col rounded-3xl border border-border/60 bg-card p-7"
              >
                <div className="mb-4 flex gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="flex-1 text-sm text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* CTA */}
        {/* ---------------------------------------------------------------- */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-primary px-8 py-16 text-center text-primary-foreground sm:px-16">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-secondary/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-background/10 blur-3xl" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                Start shortening smarter today
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
                Join thousands of developers building with url.dev. No credit
                card required.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="px-8">
                    Get started free
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#api">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="px-8 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    <Terminal className="mr-1 h-4 w-4" />
                    Read the docs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Footer */}
        {/* ---------------------------------------------------------------- */}
        <footer className="border-t border-border/60">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Link2 className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold">url.dev</span>
              </Link>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <Link href="#features" className="hover:text-foreground">Features</Link>
                <Link href="#api" className="hover:text-foreground">API</Link>
                <Link href="#pricing" className="hover:text-foreground">Pricing</Link>
                <Link href="/signin" className="hover:text-foreground">Sign in</Link>
              </div>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} url.dev
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

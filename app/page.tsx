"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Zap,
  BarChart3,
  Code2,
  Link2,
  Shield,
  Globe,
  Terminal,
  Sparkles,
  TrendingUp,
  MousePointerClick,
  MapPin,
  Copy,
  CheckCircle2,
  Activity,
  Database,
  Layers,
  Rocket,
  Users,
  Check,
} from "lucide-react";

export default function Page() {
  const [url, setUrl] = useState("");
  const [shortened, setShortened] = useState("");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ clicks: 0, links: 0, users: 0 });
  const [activeTab, setActiveTab] = useState("curl");

  // Animated stats counter
  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        clicks: Math.floor(Math.random() * 1000000) + 5000000,
        links: Math.floor(Math.random() * 100000) + 500000,
        users: Math.floor(Math.random() * 10000) + 50000,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleShorten = () => {
    if (url) {
      setShortened(`url.dev/${Math.random().toString(36).substring(7)}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortened);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeExamples = {
    curl: `curl -X POST https://url.dev/api/v1/urls \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com", "slug": "my-link"}'`,
    javascript: `const response = await fetch('https://url.dev/api/v1/urls', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://example.com',
    slug: 'my-link'
  })
});
const data = await response.json();`,
    python: `import requests

response = requests.post(
    'https://url.dev/api/v1/urls',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={'url': 'https://example.com', 'slug': 'my-link'}
)
data = response.json()`,
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted relative overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-size-[50px_50px] pointer-events-none" />
      <div className="fixed inset-0 bg-linear-to-t from-background via-transparent to-transparent pointer-events-none" />

      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-xl bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Link2 className="w-6 h-6 text-primary" />
                <div className="absolute -inset-1 bg-primary/20 blur-md rounded-full" />
              </div>
              <span className="font-bold text-xl">url.dev</span>
              <Badge variant="secondary" className="ml-2 text-xs">
                v2.0
              </Badge>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <Link
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="#api"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                API
              </Link>
              <Link
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="#docs"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Docs
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <Badge
            variant="secondary"
            className="animate-in fade-in slide-in-from-bottom-4 duration-1000"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Built for developers, by developers
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            The{" "}
            <span className="bg-linear-to-r from-primary via-chart-3 to-chart-1 bg-clip-text text-transparent">
              developer-first
            </span>{" "}
            URL shortener
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            Shorten URLs, track analytics, and integrate with your apps.
            Powerful REST API, real-time insights, and built for scale.
          </p>

          <div className="flex items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <Link href="/signup">
              <Button size="lg" className="group">
                Start for Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                <Terminal className="w-4 h-4 mr-2" />
                View Docs
              </Button>
            </Link>
          </div>

          {/* Live Stats Ticker */}
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground animate-in fade-in duration-1000 delay-700">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="font-mono">{stats.clicks.toLocaleString()}</span>{" "}
              clicks today
            </div>
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-500" />
              <span className="font-mono">{stats.links.toLocaleString()}</span>{" "}
              active links
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="font-mono">{stats.users.toLocaleString()}</span>{" "}
              developers
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-24 relative z-10">
        <Card className="p-8 shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-6">
            <Terminal className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">
              Try it now - No signup required
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://your-super-long-url.com/with/lots/of/parameters"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 h-12 text-base"
                onKeyDown={(e) => e.key === "Enter" && handleShorten()}
              />
              <Button onClick={handleShorten} size="lg" className="px-8">
                <Zap className="w-4 h-4 mr-2" />
                Shorten
              </Button>
            </div>

            {shortened && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">
                      Your shortened URL:
                    </p>
                    <p className="font-mono text-lg text-primary font-semibold">
                      https://{shortened}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="shrink-0"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Clicks</div>
                    <div className="font-semibold font-mono">0</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Created</div>
                    <div className="font-semibold font-mono">Just now</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Status</div>
                    <div className="font-semibold text-green-500">Active</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Code Examples Section - Redesigned */}
      <section
        id="api"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
      >
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Code2 className="w-3 h-3 mr-1" />
            Developer API
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Integrate in seconds</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Production-ready code examples in your favorite language. Just copy, paste, and ship.
          </p>
        </div>

        {/* API Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="p-6 text-center border-primary/20">
            <Database className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold mb-1">10ms</div>
            <div className="text-xs text-muted-foreground">API Latency</div>
          </Card>
          <Card className="p-6 text-center border-green-500/20">
            <Rocket className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-3xl font-bold mb-1">99.99%</div>
            <div className="text-xs text-muted-foreground">Uptime SLA</div>
          </Card>
          <Card className="p-6 text-center border-blue-500/20">
            <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-3xl font-bold mb-1">1B+</div>
            <div className="text-xs text-muted-foreground">Requests/month</div>
          </Card>
          <Card className="p-6 text-center border-purple-500/20">
            <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-3xl font-bold mb-1">256-bit</div>
            <div className="text-xs text-muted-foreground">Encryption</div>
          </Card>
        </div>

        {/* Code Example */}
        <Card className="overflow-hidden border-2 border-primary/20">
          <div className="bg-muted/50 border-b border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {Object.keys(codeExamples).map((lang) => (
                  <Button
                    key={lang}
                    variant={activeTab === lang ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(lang)}
                    className="capitalize"
                  >
                    {lang === "curl" ? "cURL" : lang}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    codeExamples[activeTab as keyof typeof codeExamples]
                  );
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </Button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2">
            <div className="bg-black/95 p-6 border-r border-border/20">
              <div className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Request</div>
              <pre className="overflow-x-auto text-sm">
                <code className="text-green-400 font-mono">
                  {codeExamples[activeTab as keyof typeof codeExamples]}
                </code>
              </pre>
            </div>
            
            <div className="bg-black/95 p-6">
              <div className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Response</div>
              <pre className="overflow-x-auto text-sm">
                <code className="text-cyan-400 font-mono">
                  {`{
  "id": "abc123xyz",
  "shortUrl": "https://url.dev/abc123",
  "originalUrl": "https://example.com",
  "slug": "my-link",
  "clicks": 0,
  "createdAt": "2026-01-27T12:00:00Z",
  "expiresAt": null,
  "qrCode": "https://url.dev/qr/abc123"
}`}
                </code>
              </pre>
            </div>
          </div>
        </Card>
      </section>

      {/* Bento Grid */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
      >
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built for developers who need powerful tools without the bloat
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[280px]">
          {/* API First - Large */}
          <div className="lg:col-span-2 lg:row-span-2 group relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/10 via-chart-3/10 to-chart-1/10 border border-border/50 p-8 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <Code2 className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-3xl font-bold mb-4">API-First Design</h3>
                <p className="text-muted-foreground text-lg">
                  RESTful API with comprehensive documentation. Integrate URL
                  shortening into your workflow with just a few lines of code.
                </p>
              </div>
              <div className="space-y-2 mt-6">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>99.99% uptime SLA</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Rate limiting included</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span>Webhook support</span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>

          {/* Analytics */}
          <div className="lg:col-span-2 group relative overflow-hidden rounded-3xl bg-linear-to-br from-chart-1/20 to-chart-2/20 border border-border/50 p-8 hover:shadow-2xl hover:shadow-chart-1/20 transition-all duration-500">
            <BarChart3 className="w-10 h-10 text-chart-1 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Real-time Analytics</h3>
            <p className="text-muted-foreground">
              Track clicks, locations, devices, and referrers. Get insights
              that matter.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-3xl font-bold text-chart-1">1.2M</div>
                <div className="text-xs text-muted-foreground">
                  Total Clicks
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-chart-2">156</div>
                <div className="text-xs text-muted-foreground">Countries</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-chart-3">99.2%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>

          {/* Lightning Fast */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-yellow-500/10 to-orange-500/10 border border-border/50 p-8 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500 group">
            <Zap className="w-10 h-10 text-yellow-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold mb-3">Lightning Fast</h3>
            <p className="text-muted-foreground">
              Global CDN with &lt;50ms redirect time
            </p>
            <div className="mt-4">
              <div className="text-4xl font-bold text-yellow-500">43ms</div>
              <div className="text-xs text-muted-foreground">
                avg. response time
              </div>
            </div>
          </div>

          {/* Custom Domains */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-500/10 to-cyan-500/10 border border-border/50 p-8 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 group">
            <Globe className="w-10 h-10 text-blue-500 mb-4 group-hover:rotate-180 transition-transform duration-700" />
            <h3 className="text-2xl font-bold mb-3">Custom Domains</h3>
            <p className="text-muted-foreground">
              Use your own branded short links
            </p>
            <div className="mt-4 space-y-1">
              <div className="text-sm font-mono bg-background/50 rounded px-2 py-1">
                go.yoursite.com
              </div>
              <div className="text-sm font-mono bg-background/50 rounded px-2 py-1">
                link.brand.io
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-linear-to-br from-green-500/10 to-emerald-500/10 border border-border/50 p-8 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500">
            <Shield className="w-10 h-10 text-green-500 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Enterprise Security</h3>
            <p className="text-muted-foreground mb-6">
              Password protection, expiration dates, and link encryption. Your
              data is safe with us.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">SOC 2 Type II</Badge>
              <Badge variant="secondary">GDPR Compliant</Badge>
              <Badge variant="secondary">SSL Encrypted</Badge>
            </div>
          </div>

          {/* Click Tracking */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-purple-500/10 to-pink-500/10 border border-border/50 p-8 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
            <MousePointerClick className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Click Events</h3>
            <p className="text-muted-foreground">
              Track every interaction with detailed event logs
            </p>
          </div>

          {/* Geo Targeting */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-red-500/10 to-orange-500/10 border border-border/50 p-8 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-500">
            <MapPin className="w-10 h-10 text-red-500 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Geo Targeting</h3>
            <p className="text-muted-foreground">
              Redirect users based on their location
            </p>
          </div>
        </div>
      </section>

      {/* Terminal Demo Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="secondary" className="mb-4">
              <Terminal className="w-3 h-3 mr-1" />
              Developer Experience
            </Badge>
            <h2 className="text-4xl font-bold mb-6">
              Built for your workflow
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              CLI tools, SDKs, webhooks, and a powerful API. Integrate url.dev
              into your existing stack in minutes.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Official SDKs</h4>
                  <p className="text-sm text-muted-foreground">
                    JavaScript, Python, Go, Ruby, and more
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Real-time Webhooks</h4>
                  <p className="text-sm text-muted-foreground">
                    Get notified on clicks, creates, and updates
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">CLI Tool</h4>
                  <p className="text-sm text-muted-foreground">
                    Manage links from your terminal
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="bg-black/95 border-primary/20 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border/20 bg-muted/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <span className="text-xs text-muted-foreground ml-2">
                terminal
              </span>
            </div>
            <div className="p-6 font-mono text-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-500">→</span>
                <span className="text-muted-foreground">
                  npx url-dev shorten https://example.com
                </span>
              </div>
              <div className="text-primary">✓ Link shortened successfully!</div>
              <div className="pl-4 space-y-1">
                <div className="text-cyan-400">
                  Short URL: https://url.dev/xyz789
                </div>
                <div className="text-muted-foreground">
                  Original: https://example.com
                </div>
                <div className="text-muted-foreground">
                  Created: 2026-01-27 12:00:00
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-green-500">→</span>
                <span className="text-muted-foreground">
                  url-dev analytics xyz789
                </span>
              </div>
              <div className="pl-4 grid grid-cols-2 gap-4 mt-2">
                <div>
                  <div className="text-yellow-500">Clicks: 1,234</div>
                  <div className="text-blue-500">Countries: 42</div>
                </div>
                <div>
                  <div className="text-purple-500">Devices: 3</div>
                  <div className="text-green-500">CTR: 12.4%</div>
                </div>
              </div>
              <div className="mt-4 animate-pulse">
                <span className="text-green-500">→</span>
                <span className="text-muted-foreground">█</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
      >
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <TrendingUp className="w-3 h-3 mr-1" />
            Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Scale as you grow
          </h2>
          <p className="text-muted-foreground text-lg">
            Start free, upgrade when you need more
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 relative overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>1,000 links/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>API access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Custom domains</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                Get Started
              </Button>
            </div>
          </Card>

          <Card className="p-8 relative overflow-hidden border-2 border-primary shadow-2xl shadow-primary/20 hover:shadow-primary/30 transition-shadow">
            <Badge className="absolute top-4 right-4">Popular</Badge>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>50,000 links/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Custom domains</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button className="w-full">Get Started</Button>
            </div>
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent pointer-events-none" />
          </Card>

          <Card className="p-8 relative overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Unlimited links</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>White-label solution</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>SLA guarantee</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Dedicated support</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                Contact Sales
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Trusted by developers worldwide
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 bg-linear-to-br from-card to-muted/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Code2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Sarah Chen</div>
                <div className="text-sm text-muted-foreground">
                  Full Stack Dev
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              &quot;The API is incredibly well-documented. Integrated it into
              our SaaS in under 30 minutes. The analytics are a game-changer
              for our marketing team.&quot;
            </p>
          </Card>

          <Card className="p-6 bg-linear-to-br from-card to-muted/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Marcus Rodriguez</div>
                <div className="text-sm text-muted-foreground">
                  DevOps Engineer
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              &quot;We switched from Bitly and never looked back. The CLI tool
              fits perfectly into our CI/CD pipeline. Performance is
              unmatched.&quot;
            </p>
          </Card>

          <Card className="p-6 bg-linear-to-br from-card to-muted/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Alex Kim</div>
                <div className="text-sm text-muted-foreground">
                  Startup Founder
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              &quot;Love the developer-first approach. Custom domains, webhooks,
              and real-time analytics out of the box. Worth every penny.&quot;
            </p>
          </Card>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-muted/20">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Layers className="w-3 h-3 mr-1" />
            Use Cases
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built for every workflow
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From marketing campaigns to developer tools, url.dev scales with your needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Marketing Campaigns</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Track campaign performance with UTM parameters, A/B testing, and conversion analytics.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Custom branded links</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>UTM parameter support</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Real-time click tracking</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
              <Code2 className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">SaaS Integration</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Embed link shortening directly into your product with our developer-friendly API.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>RESTful API</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Webhook notifications</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Custom domain support</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Social Media</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Optimize your social presence with click analytics and geo-targeting capabilities.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Bio link optimization</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>QR code generation</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Device targeting</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
              <Rocket className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Mobile Apps</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Deep linking and app attribution for iOS and Android applications.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Deep link support</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>App store redirects</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Install attribution</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Analytics Teams</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Export data to your favorite analytics platform for deeper insights.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>CSV/JSON exports</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Google Analytics integration</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Custom reports</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-pink-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">E-commerce</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Track product links, affiliate campaigns, and customer journeys.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Product link tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Affiliate management</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Conversion tracking</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Product Roadmap
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            What&apos;s coming next
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We&apos;re constantly improving. Here&apos;s what we&apos;re working on.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-12">
            {/* Q1 2026 - Shipped */}
            <div className="relative">
              <div className="md:grid md:grid-cols-2 md:gap-12">
                <div className="md:text-right mb-8 md:mb-0">
                  <Badge className="mb-4 bg-green-500 hover:bg-green-500">Shipped</Badge>
                  <h3 className="text-2xl font-bold mb-2">Q1 2026</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex md:justify-end items-center gap-2">
                      <span>Advanced Analytics Dashboard</span>
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex md:justify-end items-center gap-2">
                      <span>Custom Domain Management</span>
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex md:justify-end items-center gap-2">
                      <span>QR Code Generation</span>
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                </div>
                <div className="md:pl-12">
                  <div className="hidden md:block absolute left-1/2 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-green-500 border-4 border-background" />
                </div>
              </div>
            </div>

            {/* Q2 2026 - In Progress */}
            <div className="relative">
              <div className="md:grid md:grid-cols-2 md:gap-12">
                <div className="md:col-start-2 mb-8 md:mb-0">
                  <Badge className="mb-4 bg-blue-500 hover:bg-blue-500">In Progress</Badge>
                  <h3 className="text-2xl font-bold mb-2">Q2 2026</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span>Link Rotation & A/B Testing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span>Bulk Import/Export</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span>Zapier Integration</span>
                    </div>
                  </div>
                </div>
                <div className="md:pr-12 md:text-right">
                  <div className="hidden md:block absolute left-1/2 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500 border-4 border-background" />
                </div>
              </div>
            </div>

            {/* Q3 2026 - Planned */}
            <div className="relative">
              <div className="md:grid md:grid-cols-2 md:gap-12">
                <div className="md:text-right mb-8 md:mb-0">
                  <Badge variant="outline" className="mb-4">Planned</Badge>
                  <h3 className="text-2xl font-bold mb-2">Q3 2026</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex md:justify-end items-center gap-2">
                      <span>Advanced Geo-Targeting Rules</span>
                    </div>
                    <div className="flex md:justify-end items-center gap-2">
                      <span>Link Expiration & Scheduling</span>
                    </div>
                    <div className="flex md:justify-end items-center gap-2">
                      <span>Team Collaboration Features</span>
                    </div>
                  </div>
                </div>
                <div className="md:pl-12">
                  <div className="hidden md:block absolute left-1/2 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-muted border-4 border-background" />
                </div>
              </div>
            </div>

            {/* Q4 2026 - Future */}
            <div className="relative">
              <div className="md:grid md:grid-cols-2 md:gap-12">
                <div className="md:col-start-2">
                  <Badge variant="outline" className="mb-4">Future</Badge>
                  <h3 className="text-2xl font-bold mb-2">Q4 2026</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>White-label Solutions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Advanced Security Features</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Enterprise SSO Integration</span>
                    </div>
                  </div>
                </div>
                <div className="md:pr-12 md:text-right">
                  <div className="hidden md:block absolute left-1/2 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-muted border-4 border-background" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-muted/20">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold mb-2 bg-linear-to-r from-primary to-chart-3 bg-clip-text text-transparent">
              5M+
            </div>
            <div className="text-muted-foreground">Links Shortened</div>
          </div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold mb-2 bg-linear-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
              50K+
            </div>
            <div className="text-muted-foreground">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold mb-2 bg-linear-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              156
            </div>
            <div className="text-muted-foreground">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold mb-2 bg-linear-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              99.99%
            </div>
            <div className="text-muted-foreground">Uptime</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary via-chart-3 to-chart-1 p-12 text-center">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who trust url.dev for their link
              management needs.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="group">
                Create your account
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Guides
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 url.dev. Built with ❤️ for developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Construction } from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "url.dev",
    description: "A developer-first URL shortener. Built for speed, reliability, and simplicity.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={inter.variable}
            suppressHydrationWarning
        >
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {/* Global Banner that this is currently in development and only a preview */}
                    <div>
                        <div className="bg-primary text-primary-foreground text-center text-sm py-1 flex items-center justify-center gap-2">
                            This is a preview of url.dev v2, currently in development. Expect bugs and missing features. Payment is not required nor possible. Please{" "}
                            <a
                                href="https://github.com/gameupyourlife/url.dev/issues"
                                className="underline"
                                target="_blank"
                            >
                                report any issues
                            </a>
                            .
                        </div>
                    </div>
                    {children}
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}

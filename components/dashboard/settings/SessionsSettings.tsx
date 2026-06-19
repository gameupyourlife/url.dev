"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { listSessions, revokeSession, revokeAllSessions } from "@/app/actions/user";
import { Monitor, Smartphone, Globe, Trash2, ShieldAlert, Laptop, Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Session {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
}

function parseUserAgent(userAgent: string | null): {
    browser: string;
    os: string;
    device: "desktop" | "mobile" | "tablet";
} {
    if (!userAgent) return { browser: "Unknown", os: "Unknown", device: "desktop" };

    let browser = "Unknown";
    let os = "Unknown";
    let device: "desktop" | "mobile" | "tablet" = "desktop";

    // Browser detection
    if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";
    else if (userAgent.includes("Opera")) browser = "Opera";

    // OS detection
    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac OS")) os = "macOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iOS") || userAgent.includes("iPhone")) os = "iOS";

    // Device detection
    if (userAgent.includes("Mobile") || userAgent.includes("Android") || userAgent.includes("iPhone")) {
        device = "mobile";
    } else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
        device = "tablet";
    }

    return { browser, os, device };
}

const deviceIcons = {
    desktop: <Monitor className="h-5 w-5" />,
    mobile: <Smartphone className="h-5 w-5" />,
    tablet: <Laptop className="h-5 w-5" />,
};

export function SessionsSettings({ currentSessionToken }: { currentSessionToken?: string }) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    async function fetchSessions() {
        try {
            const result = await listSessions();
            setSessions((result as Session[]) || []);
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchSessions();
    }, []);

    async function handleRevoke(token: string) {
        try {
            await revokeSession(token);
            toast.success("Session revoked");
            fetchSessions();
        } catch (error: any) {
            toast.error(error?.message || "Failed to revoke session");
        }
    }

    async function handleRevokeAll() {
        try {
            await revokeAllSessions();
            toast.success("All other sessions revoked");
            fetchSessions();
        } catch (error: any) {
            toast.error(error?.message || "Failed to revoke sessions");
        }
    }

    return (
        <div className="bg-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5" />
                        Active Sessions
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {sessions.length} active session{sessions.length !== 1 ? "s" : ""}
                    </p>
                </div>
                {sessions.length > 1 && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                                Revoke All Others
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Revoke All Sessions</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will sign you out of all devices except the current one.
                                    You'll need to sign in again on those devices.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleRevokeAll}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Revoke All
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-12">
                    <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <p className="font-medium">No active sessions found</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {sessions.map((session) => {
                        const parsed = parseUserAgent(session.userAgent);
                        const isCurrent = session.token === currentSessionToken;

                        return (
                            <div
                                key={session.id}
                                className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                                    isCurrent
                                        ? "bg-primary/5"
                                        : "bg-muted/30 hover:bg-muted/50"
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                        isCurrent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                    }`}>
                                        {deviceIcons[parsed.device]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm">
                                                {parsed.browser} on {parsed.os}
                                            </p>
                                            {isCurrent && (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-primary/10 text-primary text-xs"
                                                >
                                                    Current
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1">
                                                <Globe className="h-3 w-3" />
                                                {session.ipAddress || "Unknown IP"}
                                            </span>
                                            <span>
                                                Last active {new Date(session.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {!isCurrent && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleRevoke(session.token)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

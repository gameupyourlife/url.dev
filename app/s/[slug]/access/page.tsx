import FullscreenBackground from "@/components/fullscreen-background";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

type AccessReason =
    | "not-found"
    | "inactive"
    | "expired"
    | "limit"
    | "password-required"
    | "password-invalid";

const reasonContent: Record<AccessReason, { title: string; description: string }> = {
    "not-found": {
        title: "Short link not found",
        description: "The short link does not exist or may have been removed.",
    },
    inactive: {
        title: "Link is deactivated",
        description: "This short link is currently disabled by its owner.",
    },
    expired: {
        title: "Link has expired",
        description: "This short link passed its expiration date and is no longer available.",
    },
    limit: {
        title: "Click limit reached",
        description: "This short link reached its maximum number of allowed visits.",
    },
    "password-required": {
        title: "Password required",
        description: "Enter the password to continue to the destination URL.",
    },
    "password-invalid": {
        title: "Invalid password",
        description: "The provided password is incorrect. Please try again.",
    },
};

function getReason(value?: string): AccessReason {
    if (!value) return "password-required";

    if (value in reasonContent) {
        return value as AccessReason;
    }

    return "password-required";
}

export default async function ShortLinkAccessPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ reason?: string }>;
}) {
    const { slug } = await params;
    const query = await searchParams;

    const reason = getReason(query.reason);
    const content = reasonContent[reason];
    const requiresPassword =
        reason === "password-required" || reason === "password-invalid";

    return (
        <FullscreenBackground>
            {/* <div className="max-w-md w-full space-y-8 ">{children}</div> */}

            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-lg md:text-xl">{content.title}</CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                        {content.description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {requiresPassword ? (
                        <form action={`/s/${encodeURIComponent(slug)}`} method="get" className="flex flex-col gap-4">
                            <Label htmlFor="password">
                                Password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoFocus
                                placeholder="Enter password"
                            />
                            <Button
                                className="w-full"
                                type="submit"
                            >
                                Continue
                            </Button>
                        </form>
                    ) : (
                        <div className="">
                            <Link
                                href="/"
                            >
                                Back to homepage
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>

        </FullscreenBackground>
    );
}

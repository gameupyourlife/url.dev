"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth-client";
import { GAMEUP_PROVIDER_ID } from "@/lib/auth/gameup";

export default function SignIn({ callbackFailed }: { callbackFailed: boolean }) {
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(callbackFailed);

    async function signIn() {
        setLoading(true);
        setFailed(false);
        try {
            const { data, error } = await authClient.signIn.social({
                provider: GAMEUP_PROVIDER_ID,
                callbackURL: "/dashboard",
                errorCallbackURL: "/signin",
                disableRedirect: true,
            });

            if (error || !data?.url) {
                setFailed(true);
                setLoading(false);
                return;
            }

            window.location.assign(data.url);
        } catch {
            setFailed(true);
            setLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sign in</CardTitle>
                <CardDescription>Use your GameUp account to get started with url.dev.</CardDescription>
            </CardHeader>
            <CardFooter className="flex-col items-stretch gap-3">
                {failed && (
                    <p role="alert" className="text-sm text-destructive">
                        Could not sign in with GameUp. Please try again.
                    </p>
                )}
                <Button type="button" onClick={signIn} disabled={loading}>
                    {loading && <Loader2 data-icon="inline-start" className="animate-spin" />}
                    Continue with GameUp
                </Button>
            </CardFooter>
        </Card>
    );
}

"use client";

import { authClient } from "@/lib/auth/auth-client";
import { SessionsSettings } from "@/components/dashboard/settings/SessionsSettings";

export default function SecurityPage() {
    const { data: session } = authClient.useSession();

    return <SessionsSettings currentSessionToken={session?.session?.token} />;
}

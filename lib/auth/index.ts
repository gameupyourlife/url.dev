import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db"; // your drizzle instance
import { admin as adminPlugin, genericOAuth, organization } from "better-auth/plugins";
import { creem } from "@creem_io/better-auth";
import { nextCookies } from "better-auth/next-js";
import * as schema from "@/lib/db/schema"; // your drizzle schema
import { ac, admin as adminRole, developer, member, owner } from "./permissions";
import { apiKey } from "@better-auth/api-key";
import { GAMEUP_PROVIDER_ID } from "./gameup";

const gameupClientId = process.env.GAMEUP_CLIENT_ID;
const gameupClientSecret = process.env.GAMEUP_CLIENT_SECRET;

export const auth = betterAuth({
    appName: "url.dev",
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema
    }),

    user: {
        deleteUser: {
            enabled: true
        }
    },

    emailAndPassword: {
        enabled: false,
    },
    account: {
        accountLinking: { enabled: false },
        encryptOAuthTokens: true,
    },
    disabledPaths: [
        "/sign-in/email",
        "/sign-up/email",
        "/change-password",
        "/request-password-reset",
        "/reset-password",
        "/admin/set-user-password",
        "/change-email",
        "/send-verification-email",
        "/verify-email",
        "/link-social",
        "/unlink-account",
    ],

    plugins: [
        genericOAuth({
            config: gameupClientId && gameupClientSecret ? [{
                providerId: GAMEUP_PROVIDER_ID,
                name: "gameup.dev",
                clientId: gameupClientId,
                clientSecret: gameupClientSecret,
                discoveryUrl: "https://accounts.gameup.dev/api/auth/.well-known/openid-configuration",
                requireIdTokenVerification: true,
                tokenEndpointAuth: { method: "client_secret_basic" },
                scopes: ["openid", "profile", "email"],
                pkce: true,
                disableProviderLogout: true,
            }] : [],
        }),
        apiKey(),
        organization({
            ac: ac,
            roles: {
                owner,
                admin: adminRole,
                developer,
                member,
            },
        }),
        adminPlugin(),
        nextCookies(),
        creem({
            apiKey: process.env.CREEM_API_KEY!,
            testMode: true, // Optional, use test mode for development
            defaultSuccessUrl: "/success", // Optional, redirect to this URL after successful payments
            persistSubscriptions: true, // Optional, enable database persistence (default: true)
        }),
    ]
});

export type Session = typeof auth.$Infer.Session;
export type Organization = typeof auth.$Infer.Organization;
export type ActiveOrganization = typeof auth.$Infer.ActiveOrganization;

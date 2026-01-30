import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db"; // your drizzle instance
import { admin as adminPlugin, apiKey, organization } from "better-auth/plugins";
import { creem } from "@creem_io/better-auth";
import { nextCookies } from "better-auth/next-js";
import * as schema from "@/lib/db/schema"; // your drizzle schema
import { ac, admin as adminRole, developer, member, owner } from "./permissions";

export const auth = betterAuth({
    appName: "url.dev",
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema
    }),

    emailAndPassword: {
        enabled: true,

        async sendResetPassword(data, request) {
            // Send an email to the user with a link to reset their password
        },
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
    },

    plugins: [
        apiKey(),
        organization({
            ac: ac,
            roles: {
                owner,
                admin: adminRole,
                developer,
                member,
            }
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

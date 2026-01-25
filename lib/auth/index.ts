import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db"; // your drizzle instance
import { admin, apiKey, organization } from "better-auth/plugins";

export const auth = betterAuth({
    appName: "url.dev",
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
    }),

    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
    },

    plugins: [
        apiKey(),
        organization(),
        admin()
    ]
});
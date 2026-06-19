import {
    apiKeyClient,
    organizationClient,
    adminClient,
} from "better-auth/client/plugins";
import { creemClient } from "@creem_io/better-auth/client";
import { createCreemAuthClient } from "@creem_io/better-auth/create-creem-auth-client";
import {
    ac,
    admin as adminRole,
    developer,
    member,
    owner,
} from "./permissions";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    plugins: [
        apiKeyClient(),
        organizationClient({
            ac: ac,
            roles: {
                owner,
                admin: adminRole,
                developer,
                member,
            },
        }),
        adminClient(),
        creemClient(),
    ],
});


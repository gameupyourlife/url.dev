import {
    organizationClient,
    adminClient,
} from "better-auth/client/plugins";
import { creemClient } from "@creem_io/better-auth/client";
import {
    ac,
    admin as adminRole,
    developer,
    member,
    owner,
} from "./permissions";
import { createAuthClient } from "better-auth/react";
import { apiKeyClient } from "@better-auth/api-key/client";

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


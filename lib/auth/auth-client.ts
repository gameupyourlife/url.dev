import { apiKeyClient, organizationClient, adminClient } from "better-auth/client/plugins";
import { creemClient } from "@creem_io/better-auth/client";
import { createCreemAuthClient } from "@creem_io/better-auth/create-creem-auth-client";
import { ac, admin as adminRole, developer, member, owner } from "./permissions";

export const authClient = createCreemAuthClient({
    plugins: [
        apiKeyClient(),
        organizationClient(),
        adminClient({
            ac: ac,
            roles: {
                owner,
                admin: adminRole,
                developer,
                member,
            }
        }),
        creemClient()
    ]
})
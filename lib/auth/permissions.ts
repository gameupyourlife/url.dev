import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements, memberAc, ownerAc } from "better-auth/plugins/organization/access";

const statement = {
    ...defaultStatements,

    shortUrl: ["read", "write", "delete", "analytics"],
    apiKeys: ["create", "delete"],
    settings: ["customDomain", "branding", "security"],
} as const;

export const ac = createAccessControl(statement);

export const member = ac.newRole({
    ...memberAc.statements,
    shortUrl: ["read", "write", "delete", "analytics"],
});

export const developer = ac.newRole({
    ...memberAc.statements,
    shortUrl: ["read", "write", "delete", "analytics"],
    apiKeys: ["create", "delete"],
});

export const admin = ac.newRole({
    ...adminAc.statements,
    shortUrl: ["read", "write", "delete", "analytics"],
    apiKeys: ["create", "delete"],
    settings: ["customDomain", "branding", "security"],
});

export const owner = ac.newRole({
    ...ownerAc.statements,
    shortUrl: ["read", "write", "delete", "analytics"],
    apiKeys: ["create", "delete"],
    settings: ["customDomain", "branding", "security"],
});
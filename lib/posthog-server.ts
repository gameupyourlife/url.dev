import { PostHog } from "posthog-node";

function createPostHogServerClient() {
    const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (!projectToken || !host) {
        if (process.env.NODE_ENV === "development") {
            const missingVariable = !projectToken
                ? "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN"
                : "NEXT_PUBLIC_POSTHOG_HOST";
            throw new Error(
                `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
            );
        }
        return null;
    }

    return new PostHog(projectToken, {
        host,
        flushAt: 1,
        flushInterval: 0,
        enableExceptionAutocapture: true,
    });
}

export async function captureServerEvent(
    distinctId: string,
    event: string,
    properties: Record<string, unknown> = {},
) {
    const client = createPostHogServerClient();
    if (!client) return;

    try {
        client.capture({ distinctId, event, properties });
        await client.shutdown();
    } catch (error) {
        console.error("Failed to send PostHog event", error);
    }
}

export async function captureServerException(error: unknown, distinctId: string) {
    const client = createPostHogServerClient();
    if (!client) return;

    try {
        client.captureException(error, distinctId);
        await client.shutdown();
    } catch (captureError) {
        console.error("Failed to send PostHog exception", captureError);
    }
}

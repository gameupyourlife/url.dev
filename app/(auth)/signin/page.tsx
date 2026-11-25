import SignIn from "@/components/auth/sign-in";

export default async function SignInPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string | string[] }>;
}) {
    const { error } = await searchParams;
    return <SignIn callbackFailed={Boolean(error)} />;
}

import FullscreenBackground from "@/components/fullscreen-background";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <FullscreenBackground>
            <div className="max-w-md w-full space-y-8 ">{children}</div>
        </FullscreenBackground>
    );
}

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-gradient-to-br from-background via-muted/50 to-primary/5 relative overflow-hidden flex flex-col flex-1 h-screen">
            {/* Decorative background elements */}
            {/* <div className="absolute inset-0 bg-grid-pattern opacity-[0.01]"></div> */}
            {/* <div className="absolute top-10 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div> */}
            {/* <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div> */}
            {/* <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-muted/30 rounded-full blur-2xl"></div> */}

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center p-4 flex-1">
                <div className="max-w-md w-full space-y-8 ">{children}</div>
            </div>
        </div>
    );
}

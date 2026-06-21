"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

export default function UpgradePrompt() {
    return (
        <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="pointer-events-none absolute -inset-x-10 -top-10 z-10 h-72 bg-linear-to-b from-primary/10 to-transparent blur-2xl" />
            {/* <DashboardPreview /> */}
            <Card className="relative z-20">
                <CardHeader>
                    <CardTitle>Upgrade Required</CardTitle>
                    <CardDescription>
                        This feature is not available on your current plan. Please upgrade to access this feature.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
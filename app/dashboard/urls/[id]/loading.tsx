"use client";

import { Card } from "@/components/ui/card";
import { Loader2Icon } from "lucide-react";

export default function LoadingPage() {
    return (
        <div className="container mx-auto p-4 flex items-center justify-center min-h-[40vh]">
            <Card className="p-8 flex flex-col items-center gap-3">
                <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
                <h1 className="text-xl font-bold">Loading…</h1>
                <p className="text-muted-foreground">Please wait while we load the data.</p>
            </Card>
        </div>
    );
}
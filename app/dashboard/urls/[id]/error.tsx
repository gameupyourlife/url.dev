"use client";

import { Card } from "@/components/ui/card";
import { OctagonXIcon } from "lucide-react";

export default function ErrorPage() {
    return (
        <div className="container mx-auto p-4 flex items-center justify-center min-h-[40vh]">
            <Card className="p-8 flex flex-col items-center gap-3">
                <OctagonXIcon className="w-8 h-8 text-destructive" />
                <h1 className="text-xl font-bold">Error</h1>
                <p className="text-muted-foreground">Sorry, an error occurred while processing your request.</p>
            </Card>
        </div>
    );
}
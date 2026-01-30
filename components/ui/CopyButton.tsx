"use client";
import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <button type="button" onClick={handleCopy} className="text-sm text-muted-foreground">
            {copied ? "Copied" : "Copy Link"}
        </button>
    );
}

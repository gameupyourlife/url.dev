"use client";

import { useEffect, useState } from "react";
import MapCountryHeatmap from "@/components/ui/MapCountryHeatmap";
import { Map } from "../ui/map";

export default function MapCountryHeatmapDemo() {
    // Example data (country codes and counts)
    const data = [
        { country: "US", count: 150 },
        { country: "GB", count: 40 },
        { country: "FR", count: 30 },
        { country: "DE", count: 20 },
        { country: "BR", count: 10 },
        { country: "IN", count: 60 },
        { country: "CN", count: 80 },
        { country: "AU", count: 5 },
    ];

    const lightPalette = ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"];
    const darkPalette = ["#041836", "#08304a", "#0a4b6f", "#0d6b9b", "#1c7fb6", "#2b9bd1", "#69c3ff"];

    const [theme, setTheme] = useState<"light" | "dark">(() => {
        if (typeof document === "undefined") return "light";
        if (document.documentElement.classList.contains("dark")) return "dark";
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    });

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const docTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
            setTheme(docTheme as "light" | "dark");
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    const toggleTheme = () => {
        if (document.documentElement.classList.contains("dark")) {
            document.documentElement.classList.remove("dark");
            document.documentElement.classList.add("light");
            setTheme("light");
        } else {
            document.documentElement.classList.add("dark");
            document.documentElement.classList.remove("light");
            setTheme("dark");
        }
    };

    const palette = theme === "dark" ? darkPalette : lightPalette;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="text-sm">
                    <div className="font-medium">Country heatmap demo</div>
                    <div className="text-muted-foreground">Colors represent share of total clicks</div>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="rounded px-3 py-1 border bg-muted/10 hover:bg-muted/20 text-sm"
                    >
                        Toggle {theme === "dark" ? "Light" : "Dark"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {palette.map((c, i) => (
                    <div key={i} className="h-6 w-full rounded-md shadow" style={{ background: c }} />
                ))}
            </div>

            <div className="h-[480px] rounded overflow-hidden border">
                <Map center={[0, 20]} zoom={1.2}>
                    {/* Don't pass colors so the heatmap auto-selects based on theme */}
                    <MapCountryHeatmap data={data} />
                </Map>
            </div>

            <div className="text-sm text-muted-foreground">
                Example data used for demo: <code>US: 150</code>, <code>CN: 80</code>, <code>IN: 60</code>, etc. Click a country to see counts and percentage.
            </div>
        </div>
    );
}

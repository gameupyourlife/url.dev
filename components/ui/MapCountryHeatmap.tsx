"use client";

import { useEffect, useRef, useState } from "react";
import MapLibreGL from "maplibre-gl";
import { useMap } from "@/components/ui/map";

let countriesGeoJsonCache: GeoJSON.FeatureCollection | null = null;

async function fetchCountriesGeoJson(): Promise<GeoJSON.FeatureCollection> {
  if (countriesGeoJsonCache) return countriesGeoJsonCache;
  const res = await fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson");
  if (!res.ok) throw new Error("Failed to fetch countries geojson");
  const json = await res.json();
  countriesGeoJsonCache = json;
  return json;
}

export type CountryCount = {
  country: string; // ISO_A2 or ISO_A3 or common name — we'll try matching against common keys
  count: number;
};

export default function MapCountryHeatmap({
  data,
  matchProperty = "ISO_A2",
  colors,
  onCountryClick,
}: {
  data: CountryCount[];
  matchProperty?: string;
  colors?: string[];
  onCountryClick?: (properties: any, lngLat: { lng: number; lat: number }) => void;
}) {
  const { map, isLoaded } = useMap();
  const popupRef = useRef<MapLibreGL.Popup | null>(null);
  const sourceIdRef = useRef<string | null>(null);
  const fillLayerIdRef = useRef<string | null>(null);
  const lineLayerIdRef = useRef<string | null>(null);

  // Theme detection for dark mode support
  const getDocumentTheme = () => {
    if (typeof document === "undefined") return null;
    if (document.documentElement.classList.contains("dark")) return "dark";
    if (document.documentElement.classList.contains("light")) return "light";
    return null;
  };
  const getSystemTheme = () => (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  function useTheme() {
    const initial = (getDocumentTheme() ?? getSystemTheme()) as "light" | "dark";
    const [theme, setTheme] = useState<"light" | "dark">(initial);

    useEffect(() => {
      const observer = new MutationObserver(() => {
        const docTheme = getDocumentTheme();
        if (docTheme) setTheme(docTheme as "light" | "dark");
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        if (!getDocumentTheme()) setTheme(e.matches ? ("dark" as const) : ("light" as const));
      };
      mq.addEventListener("change", handler);
      return () => {
        observer.disconnect();
        mq.removeEventListener("change", handler);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return theme;
  }

  const theme = useTheme();

  const lightPalette = ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"];
  const darkPalette = ["#041836", "#08304a", "#0a4b6f", "#0d6b9b", "#1c7fb6", "#2b9bd1", "#69c3ff"];

  const palette = colors ?? (theme === "dark" ? darkPalette : lightPalette);

  useEffect(() => {
    if (!isLoaded || !map) return;
    let mounted = true;
    let clickHandler: any;

    // Remove all existing layers and sources to hide the base map (country names, cities, etc.)
    // This will leave only our custom heatmap layers visible
    try {
      const layers = map.getStyle().layers;
      if (layers) {
        // Remove all layers in reverse order (top to bottom)
        for (let i = layers.length - 1; i >= 0; i--) {
          const layer = layers[i];
          try {
            map.removeLayer(layer.id);
          } catch { }
        }
      }
      // Remove all sources except our custom one (which will be added below)
      const sources = map.getStyle().sources;
      for (const sourceId in sources) {
        try {
          map.removeSource(sourceId);
        } catch { }
      }
    } catch { }

    (async () => {
      try {
        const geojson = await fetchCountriesGeoJson();
        if (!mounted) return;

        // ...existing code...
        // (All the original logic for building the heatmap remains unchanged)

        // Build counts map and compute total clicks
        const normalizeKey = (s: unknown) =>
          String(s ?? "")
            .toString()
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "");

        const counts = new Map<string, number>();
        let total = 0;
        data.forEach((d) => {
          const key = normalizeKey(d.country);
          counts.set(key, (counts.get(key) ?? 0) + d.count);
          total += d.count;
        });

        // Determine maximum count (for 0..1 normalization against top country)
        const maxCount = counts.size ? Math.max(...Array.from(counts.values())) : 0;

        // Build separate maps for code-like keys (2-3 chars) and name-like keys
        const isCodeLike = (k: string) => /^[A-Z0-9]{2,3}$/.test(k);
        const countsCode = new Map<string, number>();
        const countsName = new Map<string, number>();
        for (const [k, v] of counts.entries()) {
          if (isCodeLike(k)) countsCode.set(k, v);
          else countsName.set(k, v);
        }

        // Debug helper: print some samples in dev so we can see why matching fails
        if (typeof window !== "undefined" && (window as any).__MAP_HEAT_DEBUG__ === undefined) {
          (window as any).__MAP_HEAT_DEBUG__ = true;
          console.groupCollapsed("MapCountryHeatmap — debug info");
          console.log("counts keys (first 50):", Array.from(counts.keys()).slice(0, 50));
          console.log("counts entries:", Array.from(counts.entries()).slice(0, 50));
          console.log("countsCode entries:", Array.from(countsCode.entries()));
          console.log("countsName entries:", Array.from(countsName.entries()));
          const sampleProps = (geojson.features || []).slice(0, 5).map((f: any) => {
            const keys = Object.keys(f.properties || {}).slice(0, 10);
            return { keys, sample: f.properties ? Object.fromEntries(keys.map((k) => [k, f.properties[k]])) : {} };
          });
          console.log("sample feature props (first 5):", sampleProps);
          const targets = ["US", "CN", "IN", "GB", "FR", "DE", "BR", "AU", "UNITED STATES"];
          const found: any = {};
          for (const t of targets) {
            for (const f of (geojson.features || []) as any[]) {
              const props = f.properties || {};
              for (const k of Object.keys(props)) {
                const val = props[k];
                if (!val) continue;
                if (String(val).toUpperCase().replace(/[^A-Z0-9]/g, "") === String(t).toUpperCase().replace(/[^A-Z0-9]/g, "")) {
                  found[t] = { key: k, value: val, admin: props.ADMIN || props.NAME || props.ADMIN_ENG };
                  break;
                }
              }
              if (found[t]) break;
            }
          }
          console.log("matches for common targets:", found);
          console.groupEnd();
        }

        // helper to find count for a feature's props with safer matching rules
        const matchCountForProps = (props: any) => {
          const codeFields = [
            "ISO3166-1-Alpha-2",
            "ISO3166-1-Alpha-3",
            "ISO_A2",
            "ISO_A3",
            "iso_a2",
            "iso_a3",
            "ADM0_A3",
            "ADM0_A3_IS",
          ];
          for (const f of codeFields) {
            const v = props[f];
            if (!v) continue;
            const vn = normalizeKey(v);
            if (countsCode.has(vn)) return countsCode.get(vn)!;
            if (vn.length === 3 && countsCode.has(vn.slice(0, 2))) return countsCode.get(vn.slice(0, 2))!;
            if (vn.length === 2) {
              for (const k of countsCode.keys()) {
                if (k.length === 3 && k.startsWith(vn)) return countsCode.get(k)!;
              }
            }
          }
          const nameFields = ["ADMIN", "NAME", "NAME_LONG", "ADMIN_ENG", "SOVEREIGN", "name"];
          const candNames = nameFields.map((f) => props[f]).filter(Boolean).map((s: any) => normalizeKey(s));
          for (const cn of candNames) {
            if (countsName.has(cn)) return countsName.get(cn)!;
          }
          for (const [k, v] of countsName.entries()) {
            if (k.length < 4) continue;
            if (candNames.some((cn) => cn.length >= 4 && (cn.includes(k) || k.includes(cn) || cn.startsWith(k) || k.startsWith(cn)))) {
              return v;
            }
          }
          return 0;
        };

        const features = (geojson.features || []).map((f) => {
          const props: any = f.properties ?? {};
          const c = matchCountForProps(props);
          if (typeof window !== "undefined" && (c === 0 && (/UNITED|UNITEDSTATES|CHINA|INDIA|BRAZIL/i.test(String(props.ADMIN || props.NAME || ""))))) {
            console.warn("MapCountryHeatmap — no match for feature:", {
              admin: props.ADMIN || props.NAME || props.ADMIN_ENG,
              propsKeys: Object.keys(props),
            });
          }
          const norm = maxCount > 0 ? c / maxCount : 0;
          const ratio = total > 0 ? c / total : 0;
          return {
            ...f,
            properties: {
              ...props,
              _count: c,
              _ratio: ratio,
              _norm: norm,
            },
          } as GeoJSON.Feature;
        });

        const countryGeo = { type: "FeatureCollection", features } as GeoJSON.FeatureCollection;

        // Unique ids
        const sourceId = `country-heat-${Math.random().toString(36).slice(2)}`;
        const fillLayerId = `country-heat-fill-${sourceId}`;
        const lineLayerId = `country-heat-line-${sourceId}`;

        sourceIdRef.current = sourceId;
        fillLayerIdRef.current = fillLayerId;
        lineLayerIdRef.current = lineLayerId;

        // Add source
        if (map.getSource(sourceId)) {
          try {
            map.removeSource(sourceId);
          } catch { }
        }
        map.addSource(sourceId, {
          type: "geojson",
          data: countryGeo,
        });

        // Color stops (use normalized value relative to the top country 0..1)
        const stops: Array<number> = [];
        const stopColors: string[] = [];
        if (maxCount <= 0) {
          stops.push(0);
          stopColors.push(palette[0]);
        } else {
          for (let i = 0; i < palette.length; i++) {
            const frac = i / (palette.length - 1);
            stops.push(frac);
            stopColors.push(palette[i]);
          }
        }

        // Build expression on _norm (normalized against top country)
        const interpExpr: any[] = ["interpolate", ["linear"], ["get", "_norm"]];
        for (let i = 0; i < stops.length; i++) {
          interpExpr.push(stops[i]);
          interpExpr.push(stopColors[i]);
        }

        // Add fill layer
        map.addLayer(
          {
            id: fillLayerId,
            type: "fill",
            source: sourceId,
            paint: {
              "fill-color": (interpExpr as any),
              "fill-opacity": total === 0 ? 0.15 : 0.8,
            },
          },
          undefined
        );

        // Add border line
        map.addLayer(
          {
            id: lineLayerId,
            type: "line",
            source: sourceId,
            paint: {
              "line-color": "rgba(255,255,255,0.7)",
              "line-width": 0.6,
            },
          },
          undefined
        );

        // Click handler with fallback lookup if feature properties don't contain counts
        clickHandler = (e: MapLibreGL.MapMouseEvent & { features?: any[] }) => {
          const feature = e.features && e.features[0];
          if (!feature) return;
          const props = feature.properties || {};
          const lngLat = e.lngLat;
          try {
            popupRef.current?.remove();
          } catch { }
          const displayName = props.ADMIN || props.NAME || props.name || props.ADMIN_ENG || props.SOVEREIGN || props["ISO3166-1-Alpha-2"] || props["ISO_A2"] || "Unknown";
          let displayedCount = Number(props._count ?? 0);
          let displayedRatio = Number(props._ratio ?? 0);
          let displayedNorm = Number(props._norm ?? 0);
          if (!displayedCount || displayedRatio === 0) {
            displayedCount = matchCountForProps(props);
            displayedRatio = total > 0 ? displayedCount / total : 0;
            displayedNorm = maxCount > 0 ? displayedCount / maxCount : 0;
          }
          const pct = (displayedRatio * 100).toFixed(1);
          const pctOfTop = (displayedNorm * 100).toFixed(1);
          const popup = new MapLibreGL.Popup({ offset: 12 })
            .setLngLat(lngLat)
            .setHTML(`<div class="text-sm"><strong>${displayName}</strong><div>${displayedCount} clicks (${pct}% of total, ${pctOfTop}% of top)</div></div>`)
            .addTo(map);
          popupRef.current = popup;
          onCountryClick?.(props, { lng: lngLat.lng, lat: lngLat.lat });
        };

        map.on("click", fillLayerId, clickHandler);
        map.on("mouseenter", fillLayerId, () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", fillLayerId, () => (map.getCanvas().style.cursor = ""));

        // Cleanup function on unmount
        return () => {
          map.off("click", fillLayerId, clickHandler);
          map.off("mouseenter", fillLayerId, () => (map.getCanvas().style.cursor = "pointer"));
          map.off("mouseleave", fillLayerId, () => (map.getCanvas().style.cursor = ""));
          try {
            if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId);
            if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
            if (map.getSource(sourceId)) map.removeSource(sourceId);
          } catch (err) { }
          try {
            popupRef.current?.remove();
            popupRef.current = null;
          } catch { }
        };
      } catch (err) {
        console.error("MapCountryHeatmap error", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isLoaded, map, JSON.stringify(data), matchProperty, JSON.stringify(colors || []), theme]);

  return null;
}

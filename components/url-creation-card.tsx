"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import {
    ArrowDown,
    ArrowUp,
    BadgeCheck,
    Globe,
    Link2,
    LockIcon,
    PencilLine,
    PlusCircle,
    Sparkles,
    Trash2,
} from "lucide-react";

import { upsertShortUrl } from "@/app/actions/short-urls";
import type { ShortUrl } from "@/lib/db/types";

import { Button } from "./ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./ui/card";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "./ui/field";
import { Input } from "./ui/input";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
    InputGroupTextarea,
} from "./ui/input-group";
import { Textarea } from "./ui/textarea";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "./ui/combobox";

const formSchema = z.object({
    originalUrl: z.string().url("Please enter a valid URL."),
    slug: z
        .preprocess(
            (val) => {
                if (typeof val === "string" && val.trim() === "") {
                    return undefined;
                }
                return val;
            },
            z
                .string()
                .trim()
                .min(3, "Slug must be at least 3 characters.")
                .max(50, "Slug must be at most 50 characters.")
                .regex(
                    /^[a-z0-9-_]+$/,
                    "Slug can only contain lowercase letters, numbers, - and _.",
                )
                .optional(),
        )
        .optional(),
    title: z
        .string()
        .max(100, "Title must be at most 100 characters.")
        .optional(),
    description: z
        .string()
        .max(500, "Description must be at most 500 characters.")
        .optional(),
    expiresAt: z.string().optional(),
    password: z
        .preprocess(
            (val) => {
                if (typeof val === "string" && val.trim() === "") {
                    return undefined;
                }
                return val;
            },
            z
                .string()
                .min(6, "Password must be at least 6 characters.")
                .optional(),
        )
        .optional(),
    maxClicks: z.number().int().positive().optional(),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
    utmTerm: z.string().optional(),
    utmContent: z.string().optional(),
    metadata: z
        .string()
        .optional()
        .refine(
            (val) => {
                if (!val || val.trim() === "") return true;
                try {
                    JSON.parse(val);
                    return true;
                } catch {
                    return false;
                }
            },
            { message: "Metadata must be valid JSON" },
        ),
});

type UrlCreationCardMode = "create" | "edit";

interface UrlCreationCardProps {
    mode?: UrlCreationCardMode;
    initialData?: Partial<ShortUrl>;
}

type CountryRule = {
    countries: string[];
    target: string;
};

function toDateTimeLocal(value?: Date | string | null) {
    if (!value) return "";
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "";

    const tzOffsetMs = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

function parseCountryRules(value?: string | null): CountryRule[] {
    if (!value) return [];

    try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed?.countryRedirects)) {
            return parsed.countryRedirects.map((entry: any) => ({
                countries: (entry.countries || (entry.country ? [entry.country] : []))
                    .map((code: string) => code.toUpperCase())
                    .filter(Boolean),
                target: entry.target || entry.value || "",
            }));
        }

        if (parsed?.countryRedirects && typeof parsed.countryRedirects === "object") {
            return Object.entries(parsed.countryRedirects).map(([key, target]) => ({
                countries: key === "*" || key === "default" ? ["*"] : [key.toUpperCase()],
                target: String(target || ""),
            }));
        }

        return [];
    } catch {
        return [];
    }
}

function serializeCountryRules(rules: CountryRule[]) {
    return JSON.stringify(
        {
            countryRedirects: rules.map((rule) => ({
                countries: rule.countries,
                target: rule.target,
            })),
        },
        null,
        2,
    );
}

function normalizeCountries(countries: string[]) {
    const normalized = Array.from(
        new Set(countries.map((country) => country.trim().toUpperCase()).filter(Boolean)),
    );

    if (normalized.includes("*")) {
        return ["*"];
    }

    return normalized;
}

function getCountryOptionCode(option: string) {
    return option.split(" - ")[0]?.trim().toUpperCase() || "";
}

function isValidCountryCode(code: string) {
    return code === "*" || /^[A-Z]{2}$/.test(code);
}

function isValidTarget(target: string) {
    const value = target.trim();
    if (!value) return false;

    if (value.startsWith("/")) {
        return true;
    }

    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

function CountryRedirectsBuilder({
    value,
    onChange,
    onBlur,
}: {
    value?: string | null;
    onChange: (value: string) => void;
    onBlur?: () => void;
}) {
    const fallbackCountryOptions = useMemo(
        () => [
            "US - United States",
            "CA - Canada",
            "GB - United Kingdom",
            "DE - Germany",
            "FR - France",
            "JP - Japan",
            "AU - Australia",
            "BR - Brazil",
            "IN - India",
            "CN - China",
            "SG - Singapore",
            "NL - Netherlands",
            "SE - Sweden",
            "CH - Switzerland",
            "ES - Spain",
            "IT - Italy",
            "MX - Mexico",
            "AE - United Arab Emirates",
            "SA - Saudi Arabia",
            "ZA - South Africa",
        ],
        [],
    );

    const countryOptions = useMemo(() => {
        try {
            const displayNames = new Intl.DisplayNames(["en"], {
                type: "region",
            });

            const supportedValuesOf = (Intl as unknown as {
                supportedValuesOf?: (key: string) => string[];
            }).supportedValuesOf;

            if (typeof supportedValuesOf !== "function") {
                return ["* - Default (fallback)", ...fallbackCountryOptions];
            }

            const options = supportedValuesOf("region")
                .map((code) => {
                    const label = displayNames.of(code) || code;
                    return `${code} - ${label}`;
                })
                .sort((a, b) => a.localeCompare(b));

            return ["* - Default (fallback)", ...options];
        } catch {
            return ["* - Default (fallback)", ...fallbackCountryOptions];
        }
    }, [fallbackCountryOptions]);

    const [rules, setRules] = useState<CountryRule[]>(() => parseCountryRules(value));
    const [ruleCountryPickers, setRuleCountryPickers] = useState<Record<number, string | null>>({});
    const [rawJson, setRawJson] = useState<string>(value ?? "");
    const [showRawEditor, setShowRawEditor] = useState(false);
    const [jsonError, setJsonError] = useState<string | null>(null);

    const ruleValidation = useMemo(
        () =>
            rules.map((rule) => {
                const normalizedCountries = normalizeCountries(rule.countries);
                return {
                    normalizedCountries,
                    invalidCountries: normalizedCountries.filter(
                        (country) => !isValidCountryCode(country),
                    ),
                    hasInvalidTarget: !isValidTarget(rule.target),
                    isDefault: normalizedCountries.includes("*"),
                };
            }),
        [rules],
    );

    const invalidRuleCount = useMemo(
        () =>
            ruleValidation.filter(
                (rule) =>
                    rule.invalidCountries.length > 0 ||
                    rule.hasInvalidTarget ||
                    rule.normalizedCountries.length === 0,
            ).length,
        [ruleValidation],
    );

    const defaultRuleCount = useMemo(
        () => ruleValidation.filter((rule) => rule.isDefault).length,
        [ruleValidation],
    );

    useEffect(() => {
        setRules(parseCountryRules(value));
        setRawJson(value ?? "");
        setJsonError(null);
    }, [value]);

    useEffect(() => {
        if (rules.length === 0 && !(value && value.trim())) {
            setRawJson("");
            setJsonError(null);
            return;
        }

        const nextValue = serializeCountryRules(rules);
        setRawJson(nextValue);
        setJsonError(null);

        if (nextValue !== (value ?? "")) {
            onChange(nextValue);
        }
    }, [rules, value, onChange]);

    function updateRawJson(text: string) {
        setRawJson(text);
        onChange(text);

        try {
            const nextRules = parseCountryRules(text);
            JSON.parse(text);
            setRules(nextRules);
            setJsonError(null);
        } catch {
            setJsonError("Invalid JSON");
        }
    }

    function addRule() {
        setRules((current) => [...current, { countries: ["US"], target: "" }]);
    }

    function addDefaultRule() {
        setRules((current) => [...current, { countries: ["*"], target: "" }]);
    }

    function updateRule(index: number, patch: Partial<CountryRule>) {
        setRules((current) =>
            current.map((rule, currentIndex) =>
                currentIndex === index ? { ...rule, ...patch } : rule,
            ),
        );
    }

    function addCountryToRule(index: number, countryCode: string) {
        if (!countryCode || !isValidCountryCode(countryCode)) {
            return;
        }

        setRules((current) =>
            current.map((rule, currentIndex) => {
                if (currentIndex !== index) return rule;
                return {
                    ...rule,
                    countries: normalizeCountries([...rule.countries, countryCode]),
                };
            }),
        );
    }

    function removeCountryFromRule(index: number, countryCode: string) {
        setRules((current) =>
            current.map((rule, currentIndex) => {
                if (currentIndex !== index) return rule;
                return {
                    ...rule,
                    countries: rule.countries.filter((country) => country !== countryCode),
                };
            }),
        );
    }

    function removeRule(index: number) {
        setRules((current) => current.filter((_, currentIndex) => currentIndex !== index));
    }

    function moveRule(index: number, direction: "up" | "down") {
        setRules((current) => {
            const next = [...current];
            const targetIndex = direction === "up" ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= next.length) {
                return current;
            }

            const temp = next[index];
            next[index] = next[targetIndex];
            next[targetIndex] = temp;
            return next;
        });
    }

    function insertExample() {
        setRules((current) => [
            ...current,
            { countries: ["US"], target: "https://us.example.com" },
            { countries: ["CA"], target: "https://ca.example.com" },
            { countries: ["*"], target: "https://example.com" },
        ]);
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <FieldLabel>Country Redirects</FieldLabel>
                    <FieldDescription>
                        Match visitors by country code and route them to localized destinations.
                    </FieldDescription>
                </div>
                <div className="flex items-center gap-2 self-start">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={insertExample}
                    >
                        Insert Example
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={addDefaultRule}
                    >
                        Add Default (*)
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-8"
                        onClick={addRule}
                    >
                        <PlusCircle className="mr-1 h-3.5 w-3.5" />
                        Add Rule
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-border/70 bg-muted/30 px-2 py-1">
                    {rules.length} rule{rules.length === 1 ? "" : "s"}
                </span>
                {invalidRuleCount > 0 && (
                    <span className="rounded-full border border-destructive/50 bg-destructive/10 px-2 py-1 text-destructive">
                        {invalidRuleCount} invalid rule{invalidRuleCount === 1 ? "" : "s"}
                    </span>
                )}
                {defaultRuleCount > 1 && (
                    <span className="rounded-full border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-amber-700 dark:text-amber-400">
                        Multiple default rules detected
                    </span>
                )}
            </div>

            {rules.length === 0 && (
                <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-sm text-muted-foreground">
                    No rules yet. Add one or insert the example to get started.
                </div>
            )}

            {rules.map((rule, index) => (
                <div
                    key={index}
                    className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3"
                >
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="rounded-full border border-border/70 bg-background px-2 py-0.5 text-xs font-medium">
                                Rule {index + 1}
                            </span>
                            {ruleValidation[index]?.isDefault && (
                                <span className="rounded-full border border-primary/50 bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                    Default
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => moveRule(index, "up")}
                                aria-label="Move rule up"
                                disabled={index === 0}
                            >
                                <ArrowUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => moveRule(index, "down")}
                                aria-label="Move rule down"
                                disabled={index === rules.length - 1}
                            >
                                <ArrowDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={() => removeRule(index)}
                                aria-label="Remove rule"
                                className="h-7 w-7"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 md:grid-cols-12">
                        <div className="md:col-span-4">
                            <Combobox
                                items={countryOptions}
                                value={ruleCountryPickers[index] ?? null}
                                onValueChange={(nextValue) => {
                                    const selectedOption = String(nextValue || "");
                                    const countryCode = getCountryOptionCode(selectedOption);
                                    if (!countryCode) return;

                                    addCountryToRule(index, countryCode);
                                    setRuleCountryPickers((current) => ({
                                        ...current,
                                        [index]: null,
                                    }));
                                }}
                            >
                                <ComboboxInput
                                    placeholder="Search ISO country code"
                                    onBlur={onBlur}
                                />
                                <ComboboxContent>
                                    <ComboboxEmpty>No country code found.</ComboboxEmpty>
                                    <ComboboxList>
                                        {(item) => (
                                            <ComboboxItem key={item} value={item}>
                                                {item}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {normalizeCountries(rule.countries).map((countryCode) => (
                                    <span
                                        key={countryCode}
                                        className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-2 py-0.5 text-xs"
                                    >
                                        {countryCode}
                                        <button
                                            type="button"
                                            className="text-muted-foreground hover:text-foreground"
                                            onClick={() => removeCountryFromRule(index, countryCode)}
                                            aria-label={`Remove ${countryCode}`}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Pick one or more ISO country codes. Use * as default fallback.
                            </p>
                            {ruleValidation[index]?.invalidCountries.length > 0 && (
                                <p className="mt-1 text-xs text-destructive">
                                    Invalid country code(s): {ruleValidation[index].invalidCountries.join(", ")}
                                </p>
                            )}
                            {ruleValidation[index]?.normalizedCountries.length === 0 && (
                                <p className="mt-1 text-xs text-destructive">
                                    Add at least one country code or *.
                                </p>
                            )}
                        </div>

                        <div className="md:col-span-8">
                            <Input
                                value={rule.target}
                                onChange={(event) =>
                                    updateRule(index, { target: event.target.value })
                                }
                                placeholder="https://country-site.com or /localized-path"
                                onBlur={onBlur}
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Allowed: absolute http(s) URL or internal path starting with /.
                            </p>
                            {ruleValidation[index]?.hasInvalidTarget && (
                                <p className="mt-1 text-xs text-destructive">
                                    Enter a valid target URL or a path like /pricing.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            <div className="space-y-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => setShowRawEditor((current) => !current)}
                >
                    {showRawEditor ? "Hide Raw JSON" : "Show Raw JSON"}
                </Button>

                {showRawEditor && (
                    <>
                        <Textarea
                            value={rawJson}
                            onChange={(event) => updateRawJson(event.target.value)}
                            onBlur={onBlur}
                            rows={8}
                            className="font-mono text-xs"
                        />
                        <div className="flex items-center justify-between">
                            <FieldDescription>
                                Advanced mode: update metadata JSON directly.
                            </FieldDescription>
                            {jsonError && (
                                <p className="text-xs text-destructive">{jsonError}</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export function UrlCreationCard({
    mode = "create",
    initialData,
}: UrlCreationCardProps) {
    const router = useRouter();
    const isEditMode = mode === "edit";

    const defaultValues = useMemo(
        () => ({
            originalUrl: initialData?.originalUrl ?? "",
            slug: initialData?.slug ?? undefined,
            title: initialData?.title ?? undefined,
            description: initialData?.description ?? undefined,
            expiresAt: toDateTimeLocal(initialData?.expiresAt),
            maxClicks: initialData?.maxClicks ?? undefined,
            password: initialData?.password ?? undefined,
            utmSource: initialData?.utmSource ?? undefined,
            utmMedium: initialData?.utmMedium ?? undefined,
            utmCampaign: initialData?.utmCampaign ?? undefined,
            utmTerm: initialData?.utmTerm ?? undefined,
            utmContent: initialData?.utmContent ?? undefined,
            metadata: initialData?.metadata ?? undefined,
        }),
        [initialData],
    );

    const form = useForm({
        defaultValues,
        validators: {
            // @ts-ignore zod validator adapter from current setup
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            const resolvedSlug = value.slug?.trim() || (isEditMode ? initialData?.slug : nanoid(8));

            if (!resolvedSlug) {
                toast.error("Slug is missing. Please provide one.");
                return;
            }

            const payload = {
                ...(isEditMode && initialData?.id ? { id: initialData.id } : {}),
                originalUrl: value.originalUrl,
                slug: resolvedSlug,
                title: value.title?.trim() || undefined,
                description: value.description?.trim() || undefined,
                expiresAt: value.expiresAt ? new Date(value.expiresAt) : undefined,
                maxClicks: value.maxClicks,
                password: value.password?.trim() || undefined,
                utmSource: value.utmSource?.trim() || undefined,
                utmMedium: value.utmMedium?.trim() || undefined,
                utmCampaign: value.utmCampaign?.trim() || undefined,
                utmTerm: value.utmTerm?.trim() || undefined,
                utmContent: value.utmContent?.trim() || undefined,
                metadata: value.metadata?.trim() || undefined,
            };

            toast.promise(upsertShortUrl(payload as any), {
                loading: isEditMode ? "Updating URL..." : "Creating short URL...",
                success: (saved) => {
                    if (isEditMode) {
                        router.push(`/dashboard/urls/${saved.id}`);
                        router.refresh();
                        return "URL updated successfully.";
                    }

                    form.reset();
                    return (
                        <div>
                            Short URL created. {" "}
                            <a
                                href={`/s/${saved.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline"
                            >
                                /s/{saved.slug}
                            </a>
                        </div>
                    );
                },
                error: (error: Error) =>
                    `${isEditMode ? "Error updating URL" : "Error creating short URL"}: ${error.message}`,
            });
        },
    });

    return (
        <Card className="mx-auto w-full border border-border/60 bg-card">
            <CardHeader className="space-y-4 border-b border-border/60 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <CardTitle className="text-2xl tracking-tight">
                            {isEditMode ? "Edit URL" : "Create a Short URL"}
                        </CardTitle>
                        <CardDescription className="mt-1 text-base">
                            {isEditMode
                                ? "Update your destination, targeting and campaign details."
                                : "Build short links with optional targeting and analytics metadata."}
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                            <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                            Smart defaults
                        </div>
                        {isEditMode ? (
                            <div className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                                <PencilLine className="mr-1 inline h-3.5 w-3.5" />
                                Editing existing URL
                            </div>
                        ) : (
                            <div className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                                <BadgeCheck className="mr-1 inline h-3.5 w-3.5" />
                                Ready to publish
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                <form
                    id="create-url-form"
                    autoComplete="off"
                    className="space-y-6"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.handleSubmit();
                    }}
                >
                    <FieldGroup className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <form.Field
                            name="originalUrl"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid;

                                return (
                                    <Field data-invalid={isInvalid} className="lg:col-span-2">
                                        <FieldLabel htmlFor={field.name}>
                                            Destination URL <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <InputGroup>
                                            <InputGroupAddon>
                                                <Globe className="h-4 w-4" />
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(event) =>
                                                    field.handleChange(event.target.value)
                                                }
                                                aria-invalid={isInvalid}
                                                placeholder="https://example.com/very/long/path"
                                                autoFocus={!isEditMode}
                                                autoComplete="url"
                                                type="url"
                                            />
                                        </InputGroup>
                                        <FieldDescription>
                                            The link users will land on after opening your short URL.
                                        </FieldDescription>
                                        {isInvalid && (
                                            <FieldError errors={field.state.meta.errors} />
                                        )}
                                    </Field>
                                );
                            }}
                        />

                        <form.Field
                            name="slug"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid;

                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Custom Slug</FieldLabel>
                                        <InputGroup>
                                            <InputGroupAddon>
                                                <InputGroupText className="text-muted-foreground">
                                                    url.dev/s/
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value ?? ""}
                                                onBlur={field.handleBlur}
                                                onChange={(event) =>
                                                    field.handleChange(
                                                        event.target.value
                                                            .toLowerCase()
                                                            .replace(/[^a-z0-9-_]/g, ""),
                                                    )
                                                }
                                                aria-invalid={isInvalid}
                                                placeholder="my-campaign-link"
                                                autoComplete="off"
                                                maxLength={50}
                                            />
                                            <InputGroupAddon align="inline-end">
                                                <InputGroupText className="tabular-nums text-xs">
                                                    {(field.state.value ?? "").length}/50
                                                </InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                        <FieldDescription>
                                            Leave blank to {isEditMode ? "keep current slug" : "auto-generate"}.
                                        </FieldDescription>
                                        {isInvalid && (
                                            <FieldError errors={field.state.meta.errors} />
                                        )}
                                    </Field>
                                );
                            }}
                        />

                        <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">Preview</p>
                            <p className="mt-1 truncate">
                                <Link2 className="mr-1 inline h-3.5 w-3.5" />
                                url.dev/s/
                                {form.getFieldValue("slug")?.trim() || (isEditMode ? initialData?.slug : "auto-id")}
                            </p>
                        </div>

                        <form.Field
                            name="title"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid;

                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value ?? ""}
                                                onBlur={field.handleBlur}
                                                onChange={(event) =>
                                                    field.handleChange(event.target.value)
                                                }
                                                aria-invalid={isInvalid}
                                                placeholder="Q4 launch landing page"
                                                maxLength={100}
                                            />
                                            <InputGroupAddon align="inline-end">
                                                <InputGroupText className="tabular-nums text-xs">
                                                    {(field.state.value ?? "").length}/100
                                                </InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                        {isInvalid && (
                                            <FieldError errors={field.state.meta.errors} />
                                        )}
                                    </Field>
                                );
                            }}
                        />

                        <form.Field
                            name="description"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid;

                                return (
                                    <Field data-invalid={isInvalid} className="lg:col-span-2">
                                        <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                                        <InputGroup>
                                            <InputGroupTextarea
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value ?? ""}
                                                onBlur={field.handleBlur}
                                                onChange={(event) =>
                                                    field.handleChange(event.target.value)
                                                }
                                                placeholder="Notes for your team, funnel stage, audience..."
                                                rows={3}
                                                className="min-h-20 resize-none"
                                                aria-invalid={isInvalid}
                                                maxLength={500}
                                            />
                                            <InputGroupAddon align="block-end">
                                                <InputGroupText className="tabular-nums text-xs">
                                                    {(field.state.value ?? "").length}/500
                                                </InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                        {isInvalid && (
                                            <FieldError errors={field.state.meta.errors} />
                                        )}
                                    </Field>
                                );
                            }}
                        />
                    </FieldGroup>

                    <FieldGroup className="space-y-3">
                        <details className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                            <summary className="cursor-pointer select-none text-sm font-medium text-foreground/90">
                                Access and Limits
                            </summary>
                            <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                                <form.Field
                                    name="expiresAt"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched && !field.state.meta.isValid;

                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Expiration Date
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    type="datetime-local"
                                                    value={field.state.value || ""}
                                                    onBlur={field.handleBlur}
                                                    onChange={(event) =>
                                                        field.handleChange(event.target.value)
                                                    }
                                                    aria-invalid={isInvalid}
                                                />
                                                <FieldDescription>
                                                    The short URL will stop redirecting after this moment.
                                                </FieldDescription>
                                                {isInvalid && (
                                                    <FieldError errors={field.state.meta.errors} />
                                                )}
                                            </Field>
                                        );
                                    }}
                                />

                                <form.Field
                                    name="maxClicks"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched && !field.state.meta.isValid;

                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Max Clicks</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    type="number"
                                                    min="1"
                                                    value={field.state.value ?? ""}
                                                    onBlur={field.handleBlur}
                                                    onChange={(event) => {
                                                        const next = event.target.value.trim();
                                                        field.handleChange(
                                                            next ? Number(next) : undefined,
                                                        );
                                                    }}
                                                    aria-invalid={isInvalid}
                                                    placeholder="100"
                                                />
                                                <FieldDescription>
                                                    Limit how many times this link can be used.
                                                </FieldDescription>
                                                {isInvalid && (
                                                    <FieldError errors={field.state.meta.errors} />
                                                )}
                                            </Field>
                                        );
                                    }}
                                />

                                <form.Field
                                    name="password"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched && !field.state.meta.isValid;

                                        return (
                                            <Field data-invalid={isInvalid} className="md:col-span-2">
                                                <FieldLabel htmlFor={field.name}>
                                                    Password Protection
                                                </FieldLabel>
                                                <InputGroup>
                                                    <InputGroupAddon>
                                                        <LockIcon className="h-4 w-4" />
                                                    </InputGroupAddon>
                                                    <InputGroupInput
                                                        id={field.name}
                                                        name={field.name}
                                                        type="password"
                                                        value={field.state.value || ""}
                                                        onBlur={field.handleBlur}
                                                        onChange={(event) =>
                                                            field.handleChange(event.target.value)
                                                        }
                                                        aria-invalid={isInvalid}
                                                        placeholder="Set password (6+ chars)"
                                                        autoComplete="new-password"
                                                    />
                                                </InputGroup>
                                                {isInvalid && (
                                                    <FieldError errors={field.state.meta.errors} />
                                                )}
                                            </Field>
                                        );
                                    }}
                                />
                            </div>
                        </details>

                        <details className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                            <summary className="cursor-pointer select-none text-sm font-medium text-foreground/90">
                                UTM Tracking
                            </summary>
                            <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                                <form.Field
                                    name="utmSource"
                                    children={(field) => (
                                        <Field>
                                            <FieldLabel htmlFor={field.name}>UTM Source</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value || ""}
                                                onBlur={field.handleBlur}
                                                onChange={(event) => field.handleChange(event.target.value)}
                                                placeholder="google"
                                            />
                                        </Field>
                                    )}
                                />
                                <form.Field
                                    name="utmMedium"
                                    children={(field) => (
                                        <Field>
                                            <FieldLabel htmlFor={field.name}>UTM Medium</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value || ""}
                                                onBlur={field.handleBlur}
                                                onChange={(event) => field.handleChange(event.target.value)}
                                                placeholder="cpc"
                                            />
                                        </Field>
                                    )}
                                />
                                <form.Field
                                    name="utmCampaign"
                                    children={(field) => (
                                        <Field>
                                            <FieldLabel htmlFor={field.name}>UTM Campaign</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value || ""}
                                                onBlur={field.handleBlur}
                                                onChange={(event) => field.handleChange(event.target.value)}
                                                placeholder="spring-launch"
                                            />
                                        </Field>
                                    )}
                                />
                                <form.Field
                                    name="utmTerm"
                                    children={(field) => (
                                        <Field>
                                            <FieldLabel htmlFor={field.name}>UTM Term</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value || ""}
                                                onBlur={field.handleBlur}
                                                onChange={(event) => field.handleChange(event.target.value)}
                                                placeholder="running-shoes"
                                            />
                                        </Field>
                                    )}
                                />
                                <form.Field
                                    name="utmContent"
                                    children={(field) => (
                                        <Field className="md:col-span-2">
                                            <FieldLabel htmlFor={field.name}>UTM Content</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value || ""}
                                                onBlur={field.handleBlur}
                                                onChange={(event) => field.handleChange(event.target.value)}
                                                placeholder="cta-button-a"
                                            />
                                        </Field>
                                    )}
                                />
                            </div>
                        </details>

                        <details className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                            <summary className="cursor-pointer select-none text-sm font-medium text-foreground/90">
                                Country Redirects and Metadata
                            </summary>
                            <div className="mt-4">
                                <form.Field
                                    name="metadata"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched && !field.state.meta.isValid;

                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <CountryRedirectsBuilder
                                                    value={field.state.value}
                                                    onChange={field.handleChange}
                                                    onBlur={field.handleBlur}
                                                />
                                                {isInvalid && (
                                                    <FieldError errors={field.state.meta.errors} />
                                                )}
                                            </Field>
                                        );
                                    }}
                                />
                            </div>
                        </details>
                    </FieldGroup>
                </form>
            </CardContent>

            <CardFooter className="flex flex-col items-stretch justify-between gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center">
                <div className="text-sm text-muted-foreground">
                    {isEditMode
                        ? "Changes are applied to your existing short URL."
                        : "Your link will be available instantly after creation."}
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => {
                            if (isEditMode && initialData?.id) {
                                router.push(`/dashboard/urls/${initialData.id}`);
                                return;
                            }
                            form.reset();
                        }}
                    >
                        {isEditMode ? "Cancel" : "Reset"}
                    </Button>
                    <Button type="submit" form="create-url-form" className="w-full sm:w-auto">
                        {isEditMode ? "Save Changes" : "Create Short URL"}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

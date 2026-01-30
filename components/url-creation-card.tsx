"use client";;
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
// import { useForm } from '@tanstack/react-form-nextjs';
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { toast } from "sonner";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText, InputGroupTextarea } from "./ui/input-group";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { LinkIcon, LockIcon, PlusCircle, Trash2 } from "lucide-react";
import { upsertShortUrl } from "@/app/actions/short-urls";
import { nanoid } from "nanoid";

const formSchema = z.object({
    originalUrl: z.string().url("Please enter a valid URL."),
    slug: z.string().min(3, "Slug must be at least 3 characters.").max(50, "Slug must be at most 50 characters.").optional(),

    title: z.string().max(100, "Title must be at most 100 characters.").optional(),
    description: z.string().max(500, "Description must be at most 500 characters.").optional(),

    isActive: z.boolean().optional(),
    expiresAt: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters.").optional(),
    maxClicks: z.number().optional(),

    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
    utmTerm: z.string().optional(),
    utmContent: z.string().optional(),
    metadata: z.string().optional().refine((val) => {
        if (!val) return true;
        try { JSON.parse(val); return true; } catch { return false; }
    }, { message: "Metadata must be valid JSON" }),
})

function CountryRedirectsBuilder({ value, onChange, onBlur }: { value?: string | null; onChange: (s: string) => void; onBlur?: () => void }) {
    const [rules, setRules] = useState<Array<{ countries: string[]; target: string }>>([]);
    const [jsonText, setJsonText] = useState<string>(value ?? '');
    const [jsonError, setJsonError] = useState<string | null>(null);

    // initialize from value
    useEffect(() => {
        setJsonText(value ?? '');
        try {
            const parsed = value ? JSON.parse(value) : null;
            let next: Array<{ countries: string[]; target: string }> = [];
            if (parsed) {
                if (Array.isArray(parsed.countryRedirects)) {
                    next = parsed.countryRedirects.map((r: any) => ({
                        countries: (r.countries || (r.country ? [r.country] : [])).map((c: string) => c.toUpperCase()),
                        target: r.target || r.value || r || ''
                    }));
                } else if (parsed.countryRedirects && typeof parsed.countryRedirects === 'object') {
                    next = Object.entries(parsed.countryRedirects).map(([k, v]) => ({
                        countries: k === '*' || k === 'default' ? ['*'] : [k.toUpperCase()],
                        target: v as string
                    }));
                }
            }
            setRules(next);
            setJsonError(null);
        } catch {
            setRules([]);
            setJsonError('Invalid JSON');
        }
    }, [value]);

    // sync rules -> json & notify parent
    useEffect(() => {
        const obj = { countryRedirects: rules.map((r) => ({ countries: r.countries, target: r.target })) };
        const str = JSON.stringify(obj, null, 2);
        setJsonText(str);
        setJsonError(null);
        onChange(str);
    }, [rules]);

    function handleJsonChange(text: string) {
        setJsonText(text);
        onChange(text);
        try {
            const parsed = JSON.parse(text);
            setJsonError(null);
            let next: Array<{ countries: string[]; target: string }> = [];
            if (Array.isArray(parsed.countryRedirects)) {
                next = parsed.countryRedirects.map((r: any) => ({
                    countries: (r.countries || (r.country ? [r.country] : [])).map((c: string) => c.toUpperCase()),
                    target: r.target || r.value || r || ''
                }));
            } else if (parsed.countryRedirects && typeof parsed.countryRedirects === 'object') {
                next = Object.entries(parsed.countryRedirects).map(([k, v]) => ({
                    countries: k === '*' || k === 'default' ? ['*'] : [k.toUpperCase()],
                    target: v as string
                }));
            }
            setRules(next);
        } catch (err) {
            setJsonError('Invalid JSON');
            setRules([]);
        }
    }

    function addRule() {
        setRules((s) => [...s, { countries: ['US'], target: '' }]);
    }

    function updateRule(index: number, patch: Partial<{ countries: string[]; target: string }>) {
        setRules((s) => s.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    }

    function removeRule(index: number) {
        setRules((s) => s.filter((_, i) => i !== index));
    }

    function insertExample() {
        const example = [
            { countries: ['US'], target: 'https://us.example.com' },
            { countries: ['CA'], target: 'https://ca.example.com' },
            { countries: ['*'], target: 'https://example.com' },
        ];
        setRules(example);
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-4">
                <FieldLabel>Country Redirects</FieldLabel>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={insertExample}>Insert example</Button>
                    <Button type="button" variant="ghost" className="flex items-center gap-1 text-sm" onClick={addRule}><PlusCircle size={14} /> Add rule</Button>
                </div>
            </div>

            <div className="mt-3 space-y-3">
                {rules.length === 0 && (
                    <div className="text-sm text-muted-foreground">No rules defined. Use the buttons above to add a rule or insert an example.</div>
                )}

                {rules.map((r, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <input
                            className="col-span-4 input input-sm"
                            value={r.countries.join(', ')}
                            onChange={(e) => updateRule(idx, { countries: e.target.value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean) })}
                            placeholder="Country codes (e.g. US,CA) or *"
                            onBlur={onBlur}
                        />
                        <input
                            className="col-span-7 input input-sm"
                            value={r.target}
                            onChange={(e) => updateRule(idx, { target: e.target.value })}
                            placeholder="Target URL (absolute) or path (e.g. /us)"
                            onBlur={onBlur}
                        />
                        <button type="button" className="col-span-1 inline-flex items-center justify-center text-destructive hover:bg-muted/30 rounded p-1" onClick={() => removeRule(idx)} aria-label="Remove rule">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-4">
                <FieldLabel>Raw JSON (advanced)</FieldLabel>
                <InputGroup>
                    <InputGroupTextarea
                        value={jsonText}
                        onBlur={onBlur}
                        onChange={(e) => handleJsonChange(e.target.value)}
                        rows={6}
                        className="font-mono text-xs"
                    />
                </InputGroup>
                <div className="flex items-center justify-between mt-2">
                    <FieldDescription>JSON is kept in sync with the visual rules. Edit raw JSON to import custom shapes.</FieldDescription>
                    {jsonError && <div className="text-xs text-destructive">{jsonError}</div>}
                </div>
            </div>
        </div>
    );
}

export function UrlCreationCard() {
    const form = useForm({
        defaultValues: {
            originalUrl: "" as string,
            slug: undefined as string | undefined,
            title: undefined as string | undefined,
            description: undefined as string | undefined,
            expiresAt: undefined as string | undefined,
            maxClicks: undefined as number | undefined,
            password: undefined as string | undefined,
            utmSource: undefined as string | undefined,
            utmMedium: undefined as string | undefined,
            utmCampaign: undefined as string | undefined,
            utmTerm: undefined as string | undefined,
            utmContent: undefined as string | undefined,
            metadata: undefined as string | undefined,
        },

        validators: {
            // @ts-ignore
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            console.log("Submitting form with values:", value);
            toast.promise(
                upsertShortUrl({
                    originalUrl: value.originalUrl,
                    slug: value.slug ?? nanoid(8),
                    title: value.title,
                    description: value.description,
                    expiresAt: value.expiresAt ? new Date(value.expiresAt) : undefined,
                    maxClicks: value.maxClicks,
                    password: value.password,
                    utmSource: value.utmSource,
                    utmMedium: value.utmMedium,
                    utmCampaign: value.utmCampaign,
                    utmTerm: value.utmTerm,
                    utmContent: value.utmContent,
                    metadata: value.metadata ? JSON.parse(value.metadata) : undefined,
                })
                , {
                    loading: "Creating short URL...",
                    success: (data) => {
                        console.log("Short URL created:", data);
                        return (
                            <div>
                                Short URL created successfully!{" "}
                                <a href={"/s/" + data.slug} target="_blank" rel="noopener noreferrer" className="underline text-primary">
                                    {"/s/" + data.slug}
                                </a>
                            </div>
                        );
                    },
                    error: (err) => `Error creating short URL: ${err.message}`,
                });

        },
    })

    return (
        <Card className="w-full mx-auto shadow-lg border border-border/60">
            <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold tracking-tight">Create a Short URL</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                    Paste your long link, customize, and track performance. Advanced options are available for power users.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    id="create-url-form"
                    autoComplete="off"
                    className="flex gap-8"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                >
                    <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
                        {/* Destination URL */}
                        <form.Field
                            name="originalUrl"
                            children={(field) => {
                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid} className="col-span-2">
                                        <FieldLabel htmlFor={field.name}>
                                            Destination URL <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <InputGroup>
                                            <InputGroupAddon>
                                                <LinkIcon />
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="https://example.com/your-very-long-url"
                                                autoFocus
                                                autoComplete="url"
                                                type="url"
                                            />
                                        </InputGroup>
                                        <FieldDescription>
                                            Paste the full URL you want to shorten.
                                        </FieldDescription>
                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                );
                            }}
                        />

                        {/* Slug */}
                        <form.Field
                            name="slug"
                            children={(field) => {
                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid} >
                                        <FieldLabel htmlFor={field.name}>
                                            Custom Slug
                                        </FieldLabel>
                                        <InputGroup>
                                            <InputGroupAddon>
                                                <InputGroupText className="text-muted-foreground">url.dev/s/</InputGroupText>
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                                                aria-invalid={isInvalid}
                                                placeholder="my-awesome-link"
                                                autoComplete="off"
                                                maxLength={50}
                                            />
                                            <InputGroupAddon align="inline-end">
                                                <InputGroupText className="tabular-nums text-xs">
                                                    {field.state.value?.length ?? 0}/50
                                                </InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                        <FieldDescription>
                                            Leave blank to auto-generate.
                                        </FieldDescription>
                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                );
                            }}
                        />

                        {/* Title */}
                        <form.Field
                            name="title"
                            children={(field) => {
                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value || ''}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="e.g. Product Launch Campaign"
                                                maxLength={100}
                                            />
                                            <InputGroupAddon align="inline-end">
                                                <InputGroupText className="tabular-nums text-xs">
                                                    {field.state.value?.length ?? 0}/100
                                                </InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                        <FieldDescription>
                                            Optional: Give your link a name for easy reference.
                                        </FieldDescription>
                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                );
                            }}
                        />

                        {/* Description */}
                        <form.Field
                            name="description"
                            children={(field) => {
                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid} className="md:col-span-2">
                                        <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                                        <InputGroup>
                                            <InputGroupTextarea
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value || ''}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="Add context or notes for this link (optional)"
                                                rows={3}
                                                className="min-h-20 resize-none"
                                                aria-invalid={isInvalid}
                                                maxLength={500}
                                            />
                                            <InputGroupAddon align="block-end">
                                                <InputGroupText className="tabular-nums text-xs">
                                                    {(field.state.value?.length ?? 0)}/500
                                                </InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                        <FieldDescription>
                                            Optional: Add details about this link's purpose or audience.
                                        </FieldDescription>
                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                );
                            }}
                        />
                    </FieldGroup>

                    <FieldGroup>
                        {/* Advanced Options (collapsible) */}
                        <details className="rounded-md border bg-muted/40 px-4 py-3 mt-2">
                            <summary className="cursor-pointer font-medium text-sm text-foreground/90 select-none flex items-center gap-2">
                                <span>Advanced Options</span>
                            </summary>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <form.Field
                                    name="expiresAt"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Expiration Date</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    type="datetime-local"
                                                    value={field.state.value || ''}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                />
                                                <FieldDescription>
                                                    This link will stop working after this date/time.
                                                </FieldDescription>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        );
                                    }}
                                />
                                <form.Field
                                    name="maxClicks"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Max Clicks</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    type="number"
                                                    min="1"
                                                    value={field.state.value || ''}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                                    aria-invalid={isInvalid}
                                                    placeholder="e.g. 100"
                                                />
                                                <FieldDescription>
                                                    Disable this link after a set number of uses.
                                                </FieldDescription>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        );
                                    }}
                                />
                                <form.Field
                                    name="password"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Password Protection</FieldLabel>
                                                <InputGroup>
                                                    <InputGroupAddon>
                                                        <LockIcon />
                                                    </InputGroupAddon>
                                                    <InputGroupInput
                                                        id={field.name}
                                                        name={field.name}
                                                        type="password"
                                                        value={field.state.value || ''}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                        placeholder="Set a password (optional)"
                                                        autoComplete="new-password"
                                                    />
                                                </InputGroup>
                                                <FieldDescription>
                                                    Require a password to access this link.
                                                </FieldDescription>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        );
                                    }}
                                />
                            </div>
                        </details>

                        {/* UTM Parameters (collapsible) */}
                        <details className="rounded-md border bg-muted/40 px-4 py-3">
                            <summary className="cursor-pointer font-medium text-sm text-foreground/90 select-none flex items-center gap-2">
                                <span>UTM Tracking Parameters</span>
                            </summary>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <form.Field
                                    name="utmSource"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>UTM Source</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value || ''}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    placeholder="e.g. twitter, google"
                                                />
                                                <FieldDescription className="text-xs">
                                                    Traffic source (e.g. google, twitter)
                                                </FieldDescription>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        );
                                    }}
                                />
                                <form.Field
                                    name="utmMedium"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>UTM Medium</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value || ''}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    placeholder="e.g. cpc, email, social"
                                                />
                                                <FieldDescription className="text-xs">
                                                    Marketing medium (e.g. cpc, email)
                                                </FieldDescription>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        );
                                    }}
                                />
                                <form.Field
                                    name="utmCampaign"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>UTM Campaign</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value || ''}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    placeholder="e.g. spring_sale"
                                                />
                                                <FieldDescription className="text-xs">
                                                    Campaign name
                                                </FieldDescription>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        );
                                    }}
                                />
                                <form.Field
                                    name="utmTerm"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>UTM Term</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value || ''}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    placeholder="e.g. running+shoes"
                                                />
                                                <FieldDescription className="text-xs">
                                                    Paid search keywords
                                                </FieldDescription>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        );
                                    }}
                                />
                                <form.Field
                                    name="utmContent"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>UTM Content</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value || ''}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    placeholder="e.g. logolink"
                                                />
                                                <FieldDescription className="text-xs">
                                                    Differentiate similar content or links
                                                </FieldDescription>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        );
                                    }}
                                />
                            </div>
                        </details>

                        {/* Country Redirects (JSON metadata) - Visual Builder */}
                        <details className="rounded-md border bg-muted/40 px-4 py-3">
                            <summary className="cursor-pointer font-medium text-sm text-foreground/90 select-none flex items-center gap-2">
                                <span>Country Redirects (metadata)</span>
                            </summary>

                            <div className="mt-4">
                                <form.Field
                                    name="metadata"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                                        return (
                                            <Field data-invalid={isInvalid} className="md:col-span-2">
                                                <CountryRedirectsBuilder value={field.state.value} onChange={(s) => field.handleChange(s)} onBlur={() => field.handleBlur()} />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        );
                                    }}
                                />
                            </div>
                        </details>
                    </FieldGroup>

                </form>
            </CardContent>
            <CardFooter>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                        className="w-full sm:w-auto"
                    >
                        Reset
                    </Button>
                    <Button
                        type="submit"
                        form="create-url-form"
                        className="w-full sm:flex-1"
                    >
                        Create Short URL
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}


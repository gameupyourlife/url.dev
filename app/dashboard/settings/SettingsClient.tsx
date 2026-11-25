"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";
import { updateUser } from "@/app/actions/user";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsClient() {
    const { data: session, isPending: sessionLoading } = authClient.useSession();
    const { theme, setTheme } = useTheme();

    // Profile state
    const [name, setName] = useState("");
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Initialize name when session loads
    useEffect(() => {
        if (session?.user?.name) {
            setName(session.user.name);
        }
    }, [session?.user?.name]);

    async function handleUpdateProfile() {
        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        setIsUpdatingProfile(true);
        try {
            await updateUser({ name });
            toast.success("Profile updated successfully");
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to update profile");
        } finally {
            setIsUpdatingProfile(false);
        }
    }

    if (sessionLoading) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* User Profile Card */}
                        <Card className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <Avatar className="h-16 w-16">
                                    {session?.user?.image ? (
                                        <AvatarImage
                                            src={session.user.image}
                                            alt={session.user.name || "User"}
                                        />
                                    ) : null}
                                    <AvatarFallback className="text-xl">
                                        {session?.user?.name?.[0]?.toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold text-lg">
                                        {session?.user?.name || "User"}
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                        {session?.user?.email}
                                    </div>
                                    <Badge variant="secondary" className="mt-1">
                                        {session?.user?.role || "User"}
                                    </Badge>
                                </div>
                            </div>
                            <Separator className="mb-6" />
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleUpdateProfile();
                                }}
                            >
                                <FieldSet>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="name">Display Name</FieldLabel>
                                            <Input
                                                id="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="John Doe"
                                            />
                                            <FieldDescription>
                                                This is how your name appears across the platform.
                                            </FieldDescription>
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="email">Email</FieldLabel>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={session?.user?.email || ""}
                                                disabled
                                                className="bg-muted"
                                            />
                                            <FieldDescription>
                                                Contact support to change your email address.
                                            </FieldDescription>
                                        </Field>
                                        <Field orientation="horizontal">
                                            <Button type="submit" disabled={isUpdatingProfile}>
                                                {isUpdatingProfile ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    "Save Changes"
                                                )}
                                            </Button>
                                        </Field>
                                    </FieldGroup>
                                </FieldSet>
                            </form>
                        </Card>

                        {/* Preferences Card */}
                        <Card className="p-6">
                            <h3 className="font-semibold text-lg mb-4">Preferences</h3>
                            <FieldSet>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="theme">Theme</FieldLabel>
                                        <Select
                                            value={theme}
                                            onValueChange={setTheme}
                                        >
                                            <SelectTrigger id="theme">
                                                <SelectValue placeholder="Select theme" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="system">System</SelectItem>
                                                <SelectItem value="light">Light</SelectItem>
                                                <SelectItem value="dark">Dark</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldDescription>
                                            Choose your preferred color scheme.
                                        </FieldDescription>
                                    </Field>
                                    <Separator className="my-2" />
                                    <Field orientation="horizontal" className="flex items-center justify-between">
                                        <div>
                                            <FieldLabel htmlFor="email-notifications">
                                                Email Notifications
                                            </FieldLabel>
                                            <FieldDescription>
                                                Receive email updates about your links.
                                            </FieldDescription>
                                        </div>
                                        <Switch id="email-notifications" defaultChecked />
                                    </Field>
                                    <Field orientation="horizontal" className="flex items-center justify-between">
                                        <div>
                                            <FieldLabel htmlFor="weekly-digest">
                                                Weekly Digest
                                            </FieldLabel>
                                            <FieldDescription>
                                                Get a weekly summary of your link analytics.
                                            </FieldDescription>
                                        </div>
                                        <Switch id="weekly-digest" />
                                    </Field>
                                </FieldGroup>
                            </FieldSet>
                        </Card>

                    </div>
            </div>
        </div>
    );
}

"use client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";

export default function SettingsClient() {
    const { data: session } = authClient.useSession();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Profile Settings */}
            <Card className="p-6 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        {session?.user?.image ? (
                            <AvatarImage
                                src={session.user.image}
                                alt={session.user.name || "User"}
                            />
                        ) : null}
                        <AvatarFallback>
                            {session?.user?.name ? session.user.name[0] : "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-semibold text-lg">
                            {session?.user?.name || "User"}
                        </div>
                        <div className="text-muted-foreground text-sm">
                            {session?.user?.email}
                        </div>
                    </div>
                </div>
                <Separator />
                <form
                    className="flex flex-col gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        toast.error("Not implemented yet");
                    }}
                >
                    <FieldSet>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="name">Name</FieldLabel>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    defaultValue={session?.user?.name || ""}
                                    placeholder="Max Leiter"
                                />
                                <FieldDescription>
                                    Choose a unique name for your account.
                                </FieldDescription>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={session?.user?.email || ""}
                                    placeholder="Your email"
                                />
                                <FieldDescription>
                                    Your account email address.
                                </FieldDescription>
                            </Field>
                            <Field orientation="horizontal">
                                <Button type="submit">Update Profile</Button>
                                <Button variant="outline" type="button">Cancel</Button>
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                </form>
            </Card>

            {/* Password & Notifications */}
            <Card className="p-6 flex flex-col gap-6">
                <div>
                    <h2 className="text-xl font-semibold mb-2">Password</h2>
                    <form className="flex flex-col gap-4">
                        <FieldSet>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="current-password">Current Password</FieldLabel>
                                    <Input
                                        id="current-password"
                                        name="current-password"
                                        type="password"
                                        autoComplete="current-password"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                                    <Input
                                        id="new-password"
                                        name="new-password"
                                        type="password"
                                        autoComplete="new-password"
                                    />
                                </Field>
                                <Field orientation="horizontal">
                                    <Button type="submit">Change Password</Button>
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                    </form>
                </div>
                <Separator />
                <div>
                    <h2 className="text-xl font-semibold mb-2">
                        Notifications
                    </h2>
                    <FieldSet>
                        <FieldGroup>
                            <Field orientation="horizontal">
                                <FieldLabel htmlFor="email-notifications">Email Notifications</FieldLabel>
                                <Switch id="email-notifications" defaultChecked />
                            </Field>
                            <Field orientation="horizontal">
                                <FieldLabel htmlFor="system-notifications">System Notifications</FieldLabel>
                                <Switch id="system-notifications" />
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                </div>
            </Card>

            {/* System Settings */}
            <Card className="p-6 flex flex-col gap-6 md:col-span-2">
                <h2 className="text-xl font-semibold mb-2">System Settings</h2>
                <form className="flex flex-col gap-4 max-w-xl">
                    <FieldSet>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="theme">Theme</FieldLabel>
                                <Select name="theme" defaultValue="system">
                                    <SelectTrigger id="theme">
                                        <SelectValue placeholder="Select theme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="system">System Default</SelectItem>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
                                <Input
                                    id="timezone"
                                    name="timezone"
                                    placeholder="e.g. UTC, America/New_York"
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="integrations">Integrations</FieldLabel>
                                <Input
                                    id="integrations"
                                    name="integrations"
                                    placeholder="e.g. Slack, Zapier"
                                />
                            </Field>
                            <Field orientation="horizontal">
                                <Button type="submit">Update System Settings</Button>
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                </form>
            </Card>
        </div>
    );
}

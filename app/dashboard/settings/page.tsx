import { Card } from "@/components/ui/card";
import { isAuthenticated } from "@/lib/auth/guards";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field";
import { toast } from "sonner";
import SettingsClient from "./SettingsClient";

export default async function DashboardSettingsPage() {
    const session = await isAuthenticated({ behavior: "redirect" });
    return <SettingsClient />;
}
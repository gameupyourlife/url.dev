import { isAuthenticated } from "@/lib/auth/guards";
import SettingsClient from "@/app/dashboard/settings/SettingsClient";

export default async function DashboardSettingsPage() {
    await isAuthenticated({ behavior: "redirect" });
    return <SettingsClient />;
}
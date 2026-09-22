import { isAuthenticated } from "@/lib/auth/guards";
import SettingsClient from "./SettingsClient";

export default async function DashboardSettingsPage() {
    await isAuthenticated({ behavior: "redirect" });
    return <SettingsClient />;
}
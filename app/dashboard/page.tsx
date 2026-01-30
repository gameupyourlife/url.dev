import { FormTanstackComplex } from "@/components/test";
import { Card } from "@/components/ui/card";
import { Map } from "@/components/ui/map";
import { UrlCreationCard } from "@/components/url-creation-card";
import { isAuthenticated } from "@/lib/auth/guards";

export default async function DashboardPage() {
    const session = await isAuthenticated({ behavior: "redirect" });




    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p>Welcome to your dashboard!</p>

            <UrlCreationCard />
        </div>
    );
}
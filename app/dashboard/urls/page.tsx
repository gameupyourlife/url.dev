import { getShortUrls } from "@/app/actions/short-urls";
import { isAuthenticated } from "@/lib/auth/guards";
import UrlsTable from "@/components/dashboard/UrlsTable";

export default async function DashboardPage() {
    const session = await isAuthenticated({ behavior: "redirect" });


    const urls = await getShortUrls();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">URLs</h1>
            <p className="text-sm text-muted-foreground mb-4">Search, sort, filter and paginate your short URLs</p>

            {/* Client-side TanStack table */}
            <UrlsTable initialUrls={urls} />
        </div>
    );

}
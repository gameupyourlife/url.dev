import { getShortUrlById } from "@/app/actions/short-urls";
import { isAuthenticated } from "@/lib/auth/guards";

export default async function UrlDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await isAuthenticated({ behavior: "redirect" });

    const urlId = (await params).id;

    console.log("Fetching details for URL ID:", urlId);

    if (!urlId || Array.isArray(urlId)) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Invalid URL</h1>
                <p>The provided URL ID is invalid.</p>
            </div>
        );
    }

    const url = await getShortUrlById(urlId);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p>Welcome to your dashboard!</p>

            <div>
                <h2 className="text-xl font-semibold mb-2">URL Details</h2>
                <p><strong>Slug:</strong> {url?.slug}</p>
                <p><strong>Original URL:</strong> {url?.originalUrl}</p>
                <p><strong>Total Clicks:</strong> {url?.clicks?.length}</p>

                { url?.clicks && url.clicks.length > 0 ? (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Click Analytics</h3>
                        <ul>
                            {url.clicks.map((click) => (
                                <li key={click.id} className="mb-1">
                                    <p><strong>Timestamp:</strong> {new Date(click.clickedAt).toLocaleString()}</p>
                                    <p><strong>IP Address:</strong> {click.ipAddress || 'N/A'}</p>
                                    <p><strong>User Agent:</strong> {click.userAgent || 'N/A'}</p>
                                    <p><strong>Country:</strong> {click.countryName || 'N/A'}</p>

                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="mt-4">No clicks recorded for this URL yet.</p>
                )


                }

            </div>
        </div>
    );
}
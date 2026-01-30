import { getShortUrls } from "@/app/actions/short-urls";
import { isAuthenticated } from "@/lib/auth/guards";

export default async function DashboardPage() {
    const session = await isAuthenticated({ behavior: "redirect" });


    const urls = await getShortUrls();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p>Welcome to your dashboard!</p>
            <ul>
                {urls.map((url) => (
                    <li key={url.id}>
                        <a href={`/dashboard/urls/${url.id}`} className="text-blue-500 underline">
                            {url.slug} - {url.originalUrl}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );

}
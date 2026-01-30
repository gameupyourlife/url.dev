import { Card } from "@/components/ui/card";
import Link from "next/link";
import CopyButton from "@/components/ui/CopyButton";
import { getShortUrlById } from "@/app/actions/short-urls";

export default async function UrlHeader({ urlId }: { urlId: string }) {
    const url = await getShortUrlById(urlId);
    if (!url) return null;

    const shortLink = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/s/${url.slug}`;

    return (
        <Card className="p-4 mb-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold">{url.title || url.slug}</h1>
                    <p className="text-sm text-muted-foreground">{url.originalUrl}</p>
                    <div className="mt-2 text-sm">
                        <span className="mr-4"><strong>Slug:</strong> {url.slug}</span>
                        <span className="mr-4"><strong>Clicks:</strong> {url.clickCount}</span>
                        <span className="mr-4"><strong>Last clicked:</strong> {url.lastClickedAt ? new Date(url.lastClickedAt).toLocaleString() : 'Never'}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <Link className="text-indigo-600" href={`/s/${url.slug}`} target="_blank">Open</Link>
                        {/* Client copy button */}
                        {/* @ts-expect-error Server component including client */}
                        <CopyButton text={shortLink} />
                    </div>
                </div>
                <div>
                    {/* Quick actions: edit (link to edit modal/page), delete (server action) */}
                    <div className="flex gap-2">
                        <Link href={`/dashboard/urls/${url.id}`} className="btn">Edit</Link>
                    </div>
                </div>
            </div>
        </Card>
    );
}

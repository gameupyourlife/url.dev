import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon, PencilLine } from "lucide-react";

import { getShortUrlById } from "@/app/actions/short-urls";
import { UrlCreationCard } from "@/components/url-creation-card";
import { Button } from "@/components/ui/button";

export default async function EditUrlPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const url = await getShortUrlById(id);

    if (!url) {
        redirect("/dashboard/urls");
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="ghost" size="sm" asChild className="-ml-2">
                    <Link href={`/dashboard/urls/${id}`}>
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        Back to URL Details
                    </Link>
                </Button>

                <div className="flex items-center text-sm text-muted-foreground">
                    <PencilLine className="mr-2 h-4 w-4" />
                    Editing /s/{url.slug}
                </div>
            </div>

            <UrlCreationCard mode="edit" initialData={url} />
        </div>
    );
}

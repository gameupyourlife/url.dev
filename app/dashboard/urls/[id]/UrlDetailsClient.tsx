"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteShortUrl, toggleShortUrlActiveState, updateShortUrl } from "@/app/actions/short-urls";
import {
    QrCode,
    Pencil,
    Trash2,
    MoreHorizontal,
    Loader2,
    Download,
    Share2,
    Check,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { db } from "@/lib/db";

interface UrlDetailsClientProps {
    urlId: string;
    slug: string;
}

export function UrlDetailsClient({ urlId, slug }: UrlDetailsClientProps) {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showQrDialog, setShowQrDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const shortUrl = `https://url.dev/s/${slug}`;

    async function handleDelete() {
        setIsDeleting(true);
        try {
            await deleteShortUrl(urlId);
            toast.success("URL deleted successfully");
            router.push("/dashboard/urls");
        } catch (error: any) {
            toast.error(error?.message || "Failed to delete URL");
            setIsDeleting(false);
        }
    }

    async function handleShare() {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Short URL: ${slug}`,
                    url: shortUrl,
                });
            } catch (error) {
                // User cancelled share
            }
        } else {
            navigator.clipboard.writeText(shortUrl);
            toast.success("Link copied to clipboard");
        }
    }

    async function handleToggleActive() {
        toast.promise(toggleShortUrlActiveState(urlId),
            {
                loading: "Toggling active state...",
                success: "Active state toggled",
                error: "Failed to toggle active state",
            })
    }

    function downloadQrCode() {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(shortUrl)}`;
        const link = document.createElement("a");
        link.href = qrUrl;
        link.download = `qr-${slug}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("QR code downloaded");
    }

    return (
        <>
            <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => setShowQrDialog(true)}>
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/urls/${urlId}/edit`}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit URL
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleToggleActive}>
                            <Check className="h-4 w-4 mr-2" />
                            Toggle active state
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setShowDeleteDialog(true)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Link
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Link</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the short link <strong>url.dev/s/{slug}</strong>.
                            Anyone with this link will no longer be able to access it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* QR Code Dialog */}
            <AlertDialog open={showQrDialog} onOpenChange={setShowQrDialog}>
                <AlertDialogContent className="max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>QR Code</AlertDialogTitle>
                        <AlertDialogDescription>
                            Scan this code to open {shortUrl}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-center py-4">
                        <div className="bg-white p-4 rounded-xl">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shortUrl)}`}
                                alt={`QR Code for ${slug}`}
                                className="w-48 h-48"
                            />
                        </div>
                    </div>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={downloadQrCode} className="w-full sm:w-auto">
                            <Download className="h-4 w-4 mr-2" />
                            Download PNG
                        </Button>
                        <AlertDialogCancel className="w-full sm:w-auto mt-0">Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

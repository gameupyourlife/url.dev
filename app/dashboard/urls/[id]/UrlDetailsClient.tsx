"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { deleteShortUrl, updateShortUrl } from "@/app/actions/short-urls";
import {
    QrCode,
    Pencil,
    Trash2,
    MoreHorizontal,
    X,
    Check,
    Loader2,
    Download,
    Share2,
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

interface UrlDetailsClientProps {
    urlId: string;
    slug: string;
    destinationUrl: string;
}

export function UrlDetailsClient({ urlId, slug, destinationUrl }: UrlDetailsClientProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editUrl, setEditUrl] = useState(destinationUrl);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showQrDialog, setShowQrDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const shortUrl = `https://url.dev/s/${slug}`;

    async function handleUpdate() {
        if (!editUrl.trim()) {
            toast.error("Destination URL is required");
            return;
        }

        setIsUpdating(true);
        try {
            await updateShortUrl(urlId, { url: editUrl });
            toast.success("URL updated successfully");
            setIsEditing(false);
            router.refresh();
        } catch (error: any) {
            toast.error(error?.message || "Failed to update URL");
        } finally {
            setIsUpdating(false);
        }
    }

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
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <Input
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-64"
                        />
                        <Button size="sm" onClick={handleUpdate} disabled={isUpdating}>
                            {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4" />
                            )}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setIsEditing(false);
                                setEditUrl(destinationUrl);
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <>
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
                                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit Destination
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
                    </>
                )}
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

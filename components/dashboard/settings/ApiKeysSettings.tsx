"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createApiKey, listApiKeys, deleteApiKey } from "@/app/actions/api-keys";
import { Key, Plus, Trash2, AlertTriangle, Loader2, X, Check, Clock, Activity } from "lucide-react";
import CopyButton from "@/components/ui/CopyButton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ApiKey {
    id: string;
    name: string | null;
    start: string | null;
    createdAt: Date;
    expiresAt: Date | null;
    enabled: boolean | null;
    lastRequest: Date | null;
    requestCount: number | null;
}

export function ApiKeysSettings() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

    async function fetchApiKeys() {
        try {
            const keys = await listApiKeys();
            setApiKeys((keys as ApiKey[]) || []);
        } catch (error) {
            console.error("Failed to fetch API keys:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchApiKeys();
    }, []);

    async function handleCreateKey() {
        if (!newKeyName.trim()) {
            toast.error("API key name is required");
            return;
        }

        setIsCreating(true);
        try {
            const result = await createApiKey({ name: newKeyName });
            if (result && "key" in result) {
                setNewlyCreatedKey(result.key as string);
                toast.success("API key created! Save it now - you won't see it again.");
            }
            setNewKeyName("");
            setShowCreateForm(false);
            fetchApiKeys();
        } catch (error: any) {
            toast.error(error?.message || "Failed to create API key");
        } finally {
            setIsCreating(false);
        }
    }

    async function handleDeleteKey(keyId: string) {
        try {
            await deleteApiKey(keyId);
            toast.success("API key deleted");
            fetchApiKeys();
        } catch (error: any) {
            toast.error(error?.message || "Failed to delete API key");
        }
    }

    return (
        <div className="space-y-6">
            {/* Newly Created Key Warning */}
            {newlyCreatedKey && (
                <div className="bg-amber-500/10 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-amber-700 dark:text-amber-400">
                                Save your API key now
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1 mb-3">
                                This is the only time you'll see this key. Copy and store it securely.
                            </p>
                            <div className="flex items-center gap-2 bg-background rounded-lg p-3">
                                <code className="flex-1 text-sm font-mono break-all">
                                    {newlyCreatedKey}
                                </code>
                                <CopyButton value={newlyCreatedKey} />
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-3"
                                onClick={() => setNewlyCreatedKey(null)}
                            >
                                <Check className="h-4 w-4 mr-2" />
                                I've saved my key
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* API Keys Section */}
            <div className="bg-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            API Keys
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {apiKeys.length} key{apiKeys.length !== 1 ? "s" : ""} configured
                        </p>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Key
                    </Button>
                </div>

                {showCreateForm && (
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleCreateKey();
                            }}
                            className="flex flex-col sm:flex-row gap-3"
                        >
                            <Input
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="e.g., Production API Key"
                                className="flex-1 bg-background"
                            />
                            <div className="flex gap-2">
                                <Button type="submit" disabled={isCreating} size="sm">
                                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setNewKeyName("");
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : apiKeys.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                            <Key className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <p className="font-medium">No API keys yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Create an API key to access the URL.DEV API programmatically.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {apiKeys.map((key) => (
                            <div
                                key={key.id}
                                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                        <Key className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm truncate">
                                                {key.name || "Unnamed"}
                                            </p>
                                            <Badge
                                                variant="secondary"
                                                className={
                                                    key.enabled
                                                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                                                }
                                            >
                                                {key.enabled ? "Active" : "Disabled"}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                            <code className="bg-muted px-1.5 py-0.5 rounded">
                                                {key.start}...
                                            </code>
                                            <span className="flex items-center gap-1">
                                                <Activity className="h-3 w-3" />
                                                {key.lastRequest
                                                    ? new Date(key.lastRequest).toLocaleDateString()
                                                    : "Never used"}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(key.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete the API key "{key.name}".
                                                Any applications using this key will stop working.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDeleteKey(key.id)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

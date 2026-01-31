"use client";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function UserNav({
    user,
    isNavigatedTo,
}: {
    user: { name?: string; email?: string; image?: string };
    isNavigatedTo?: boolean;
}) {
    const [open, setOpen] = useState(false);
    return (
        <DropdownMenu
            open={open}
            onOpenChange={setOpen}
        >
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={"relative h-10 w-10 rounded-full p-0"}
                >
                    <Avatar className={"h-10 w-10"}>
                        {user?.image ? (
                            <AvatarImage
                                src={user.image}
                                alt={user.name || "User"}
                            />
                        ) : null}
                        <AvatarFallback
                            className={
                                isNavigatedTo
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-accent"
                            }
                        >
                            {user?.name ? user.name[0] : "U"}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56"
            >
                <DropdownMenuLabel>
                    <div className="flex flex-col">
                        <span className="font-medium">
                            {user?.name || "User"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {user?.email}
                        </span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <form
                        action="/api/auth/signout"
                        method="post"
                    >
                        <button
                            type="submit"
                            className="w-full text-left"
                        >
                            Sign out
                        </button>
                    </form>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

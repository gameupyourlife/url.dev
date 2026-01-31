import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "dark:bg-input/30 h-9 rounded-xl bg-transparent px-3 py-1 text-base transition-colors md:text-sm file:text-foreground placeholder:text-muted-foreground w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 shadow-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none border-none",
        className
      )}
      {...props}
    />
  )
}

export { Input }

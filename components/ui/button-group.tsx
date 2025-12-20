import * as React from "react"

import { cn } from "@/lib/utils"

function ButtonGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="button-group"
      className={cn(
        "inline-flex items-center gap-0 rounded-md border border-input bg-background shadow-none overflow-hidden",
        "[&>button]:rounded-none [&>button]:border-0 [&>button:not(:last-child)]:border-r [&>button:not(:last-child)]:border-input",
        className
      )}
      {...props}
    />
  )
}

export { ButtonGroup }


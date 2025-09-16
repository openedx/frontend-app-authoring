import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "shared/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:tw-bg-primary data-[state=unchecked]:tw-bg-input focus-visible:tw-border-ring focus-visible:tw-ring-ring/50 dark:data-[state=unchecked]:tw-bg-input/80 tw-inline-flex tw-h-[1.15rem] tw-w-8 tw-shrink-0 tw-items-center tw-rounded-full tw-border tw-border-transparent tw-shadow-xs tw-transition-all tw-outline-none focus-visible:tw-ring-[3px] disabled:tw-cursor-not-allowed disabled:tw-opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "tw-bg-background dark:data-[state=unchecked]:tw-bg-foreground dark:data-[state=checked]:tw-bg-primary-foreground tw-pointer-events-none tw-block tw-size-4 tw-rounded-full tw-ring-0 tw-transition-transform data-[state=checked]:tw-translate-x-[calc(100%-2px)] data-[state=unchecked]:tw-translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "../../lib/utils"

const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "relative inline-flex h-6 w-12 items-center rounded-lg bg-gray-300 transition-colors [-webkit-tap-highlight-color:_transparent] data-[state=checked]:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
    ref={ref}>
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none absolute inset-y-0 start-0 m-1 block size-4 rounded-full bg-gray-300 ring-5 ring-inset ring-white dark:ring-black/75 data-[state=checked]:dark:ring-white transition-all data-[state=checked]:start-8 data-[state=checked]:w-2 data-[state=checked]:bg-white data-[state=checked]:ring-transparent"
      )} />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }

"use client";

import * as React from "react";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from "cmdk";
import { cn } from "@/lib/utils";

const CommandWrapper = React.forwardRef<
  React.ElementRef<typeof Command>,
  React.ComponentPropsWithoutRef<typeof Command>
>(({ className, ...props }, ref) => (
  <Command
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    )}
    {...props}
  />
));
CommandWrapper.displayName = "CommandWrapper";

export {
  CommandWrapper as Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
};

"use client";

import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface ComboBoxProps {
  options: Option[];
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
}

export function ComboBox({ options, value, onChange, placeholder }: ComboBoxProps) {
  const [open, setOpen] = React.useState(false);

  const selected = options.find((opt) => opt.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-full flex items-center justify-between rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-left text-white",
            "hover:border-neutral-500"
          )}
        >
          {selected?.label || <span className="text-neutral-400">{placeholder}</span>}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 max-h-60 overflow-y-auto bg-white shadow-lg border border-neutral-200">
        <Command>
          <CommandList>
            {options.length === 0 && <CommandEmpty>결과 없음</CommandEmpty>}
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="cursor-pointer hover:bg-neutral-200 px-3 py-2 text-sm text-black flex items-center justify-start"
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

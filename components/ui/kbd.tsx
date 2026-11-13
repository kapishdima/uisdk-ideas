"use client"

import { cn } from "@/lib/cn"
import { useModKey } from "@/lib/use-undo-shortcut"

/** A key cap. */
export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] bg-well px-1 font-sans text-[11px] leading-none font-medium text-graphite shadow-[inset_0_0_0_1px_var(--hairline),inset_0_-1px_0_var(--hairline)]",
        className,
      )}
    >
      {children}
    </kbd>
  )
}

/** ⌘Z on a Mac, Ctrl Z elsewhere. */
export function UndoKeys({ className }: { className?: string }) {
  const mod = useModKey()
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-hidden="true">
      <Kbd>{mod}</Kbd>
      <Kbd>Z</Kbd>
    </span>
  )
}

"use client"

import { Tooltip, TooltipContent, TooltipShortcut, TooltipTrigger } from "@ui-sdk/react/tooltip"
import { Redo2Icon, Undo2Icon } from "lucide-react"
import { cn } from "@/lib/cn"
import { UndoKeys } from "./kbd"

function HistoryButton({
  label,
  shortcut,
  disabled,
  onClick,
  children,
  keys,
}: {
  label: string
  shortcut: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
  /** Shows the keys on the button itself, not only in the tooltip. */
  keys?: React.ReactNode
}) {
  return (
    <Tooltip shortcut={shortcut} delay={200}>
      <TooltipTrigger
        aria-disabled={disabled || undefined}
        onClick={() => {
          if (!disabled) onClick()
        }}
        className={cn(
          "flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-[9px] px-2 text-ink outline-none transition hover:bg-well focus-visible:ring-4 focus-visible:ring-ink/10",
          disabled && "cursor-default text-pencil/70 hover:bg-transparent",
        )}
      >
        {children}
        {keys ? <span className={cn("hidden sm:inline-flex", disabled && "opacity-50")}>{keys}</span> : null}
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        sideOffset={6}
        className="z-50 flex items-center gap-2 rounded-lg bg-ink py-1 pr-1 pl-2 text-xs text-white shadow-[0_8px_20px_-8px_rgb(10_13_20/0.5)]"
      >
        {label}
        <TooltipShortcut className="rounded-[5px] bg-white/12 px-1.5 py-0.5 font-sans text-[11px] text-white/80" />
      </TooltipContent>
    </Tooltip>
  )
}

/** Undo and redo for the whole page, the person's changes and the agent's alike. */
export function HistoryButtons({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: {
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}) {
  return (
    <div className="flex items-center rounded-[10px]" role="group" aria-label="History">
      <HistoryButton label="Undo" shortcut="mod+z" disabled={!canUndo} onClick={onUndo} keys={<UndoKeys />}>
        <Undo2Icon className="size-4" aria-hidden="true" />
      </HistoryButton>
      <HistoryButton label="Redo" shortcut="mod+shift+z" disabled={!canRedo} onClick={onRedo}>
        <Redo2Icon className="size-4" aria-hidden="true" />
      </HistoryButton>
    </div>
  )
}

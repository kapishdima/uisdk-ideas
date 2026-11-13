import { ChevronLeftIcon } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"
import { cn } from "@/lib/cn"

/**
 * The workspace every demo uses: the agent's column on the gray ground
 * (hidden from the agent), and the app itself on one white sheet.
 */
export function DemoShell({
  index,
  title,
  badge,
  aside,
  asideClassName,
  breadcrumb,
  actions,
  footer,
  footerClassName,
  overlay,
  children,
  mainClassName,
}: {
  index: string
  title: string
  badge?: ReactNode
  aside: ReactNode
  asideClassName?: string
  breadcrumb: [string, string]
  actions?: ReactNode
  footer?: ReactNode
  footerClassName?: string
  /** Floats over the bottom of the sheet, like a progress pill or a toast. */
  overlay?: ReactNode
  children: ReactNode
  mainClassName?: string
}) {
  return (
    <div className="grid min-h-dvh gap-2 p-2 lg:h-dvh lg:grid-cols-[372px_minmax(0,1fr)]">
      <aside
        data-agent-hidden
        className={cn("flex min-h-0 min-w-0 flex-col px-2 pt-3 pb-2 lg:pr-3", asideClassName)}
      >
        <div className="flex h-8 items-center justify-between gap-2">
          <Link
            href="/"
            className="-ml-1 flex items-center gap-1 rounded-md px-1 py-0.5 text-[13px] text-graphite transition hover:text-ink"
          >
            <ChevronLeftIcon className="size-3.5" aria-hidden="true" />
            All ideas
          </Link>
          {badge}
        </div>
        <div className="mt-6">
          <div className="font-mono text-xs text-signal">Idea {index}</div>
          <h1 className="mt-1.5 text-[22px] leading-tight font-semibold tracking-[-0.025em]">{title}</h1>
        </div>
        {aside}
      </aside>

      <main
        className={cn(
          "relative flex min-h-[70dvh] min-w-0 flex-col overflow-hidden rounded-2xl bg-sheet shadow-sheet lg:min-h-0",
          mainClassName,
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-hairline px-5">
          <div className="truncate text-sm text-graphite">
            {breadcrumb[0]}
            <span className="mx-2 text-pencil">/</span>
            <span className="font-medium text-ink">{breadcrumb[1]}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer ? (
          <div
            className={cn(
              "flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-hairline bg-[#fcfcfc] px-5 py-3 transition-colors",
              footerClassName,
            )}
          >
            {footer}
          </div>
        ) : null}
        {overlay}
      </main>
    </div>
  )
}

/** Divider with a mono caption, used to start a section in the agent column. */
export function AsideLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mt-7 mb-3 flex items-center gap-2.5">
      <span className="font-mono text-[11px] text-pencil">{children}</span>
      <span className="h-px flex-1 bg-hairline" />
    </div>
  )
}

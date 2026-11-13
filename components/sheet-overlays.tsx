import type { ReactNode } from "react"

/** Dark pill over the bottom of the app sheet while the agent works on it. */
export function WorkingPill({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="toast-rise pointer-events-none absolute bottom-20 left-1/2 flex h-[30px] items-center gap-2 rounded-full bg-ink pr-3 pl-1.5 text-xs whitespace-nowrap text-white shadow-[0_10px_24px_-8px_rgb(10_13_20/0.4)]"
    >
      <span className="grid size-[18px] place-items-center rounded-full bg-signal">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="#fff" aria-hidden="true">
          <path d="M5 0l1.2 3.8L10 5 6.2 6.2 5 10 3.8 6.2 0 5l3.8-1.2z" />
        </svg>
      </span>
      {children}
    </div>
  )
}

/** A short confirmation over the bottom of the app sheet. */
export function SheetToast({ title, detail }: { title: string; detail?: string }) {
  return (
    <div
      role="status"
      className="toast-rise pointer-events-none absolute bottom-20 left-1/2 flex h-10 items-center gap-2.5 rounded-xl bg-ink px-3.5 text-[13px] whitespace-nowrap text-white shadow-[0_12px_28px_-10px_rgb(10_13_20/0.45)]"
    >
      <span className="font-medium">{title}</span>
      {detail ? <span className="opacity-60">{detail}</span> : null}
    </div>
  )
}

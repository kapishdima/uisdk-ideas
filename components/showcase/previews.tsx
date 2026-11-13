/**
 * Miniature, static renders of each idea for the showcase cards.
 * Drawn after the Doop frame "Showcase — desktop".
 */

import type { ReactNode } from "react"
import { cn } from "@/lib/cn"

function Mini({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-lg bg-white shadow-control", className)}>{children}</div>
}

function MiniLabel({ children }: { children: ReactNode }) {
  return <div className="mb-1 text-[10px] font-medium text-graphite">{children}</div>
}

function MiniField({
  children,
  agent,
  mono,
  chevron,
  muted,
}: {
  children: ReactNode
  agent?: boolean
  mono?: boolean
  chevron?: boolean
  muted?: boolean
}) {
  return (
    <div
      className={cn(
        "flex h-[26px] items-center justify-between rounded-[7px] px-2 text-[11px]",
        agent
          ? "bg-signal-soft shadow-[inset_0_0_0_1px_rgb(240_78_31/0.45)]"
          : "bg-white shadow-[inset_0_0_0_1px_var(--hairline)]",
        mono && "font-mono text-[10px]",
        muted && "text-pencil",
      )}
    >
      <span className="truncate">{children}</span>
      {chevron ? <Chevron /> : null}
    </div>
  )
}

function Chevron() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true" className="shrink-0">
      <path d="M1.5 3 4 5.5 6.5 3" stroke="#5C5C5C" fill="none" strokeWidth="1.2" />
    </svg>
  )
}

function Sparkle({ className, fill = "currentColor" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 10 10" className={className} fill={fill} aria-hidden="true">
      <path d="M5 0l1.2 3.8L10 5 6.2 6.2 5 10 3.8 6.2 0 5l3.8-1.2z" />
    </svg>
  )
}

const line = "h-1.5 rounded-full bg-[#E6E6E6]"

export function FormPreview() {
  return (
    <>
      <Mini className="absolute top-9 left-7 h-[228px] w-[170px] -rotate-3 p-3.5 max-sm:hidden">
        <div className="flex items-start justify-between">
          <div className="text-[9px] font-semibold">Northwind Studio</div>
          <div className="font-mono text-[7px] tracking-[0.15em] text-graphite">INVOICE</div>
        </div>
        <div className={cn(line, "mt-2 w-3/5")} />
        <div className={cn(line, "mt-1.5 w-2/5")} />
        <div className="mt-4 grid gap-[7px]">
          {[55, 48, 60].map((width) => (
            <div key={width} className="flex justify-between">
              <div className={line} style={{ width: `${width}%` }} />
              <div className={cn(line, "w-1/5")} />
            </div>
          ))}
        </div>
        <div className="mt-[18px] flex justify-between border-t border-hairline pt-2 text-[9px] font-semibold">
          <span>Total</span>
          <span className="font-mono">4 860,00 €</span>
        </div>
        <div className={cn(line, "mt-5 w-4/5")} />
        <div className={cn(line, "mt-1.5 w-1/2")} />
      </Mini>

      <Mini className="absolute top-7 right-7 w-[272px] p-3.5 max-sm:left-1/2 max-sm:-translate-x-1/2">
        <div className="mb-2.5 text-[11px] font-semibold">New bill</div>
        <MiniLabel>Vendor name</MiniLabel>
        <MiniField agent>Northwind Studio GmbH</MiniField>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <MiniLabel>Invoice date</MiniLabel>
            <MiniField agent mono>
              2026-11-02
            </MiniField>
          </div>
          <div>
            <MiniLabel>Currency</MiniLabel>
            <MiniField agent chevron>
              EUR
            </MiniField>
          </div>
          <div>
            <MiniLabel>Amount</MiniLabel>
            <MiniField agent mono>
              4,860.00
            </MiniField>
          </div>
          <div>
            <MiniLabel>Category</MiniLabel>
            <MiniField muted>Choose…</MiniField>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <div className="flex h-6 items-center gap-1.5 rounded-[7px] bg-ink px-2.5 text-[10px] font-medium text-white">
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="1.3" aria-hidden="true">
              <rect x="2" y="4.5" width="6" height="4.5" rx="1" />
              <path d="M3.5 4.5V3a1.5 1.5 0 0 1 3 0v1.5" />
            </svg>
            Submit bill
          </div>
        </div>
      </Mini>

      <div className="absolute bottom-6 left-[150px] flex h-[30px] items-center gap-2 rounded-full bg-ink pr-2.5 pl-1.5 text-[11px] text-white shadow-[0_8px_20px_-6px_rgb(10_13_20/0.35)] max-sm:left-1/2 max-sm:-translate-x-1/2">
        <span className="grid size-[18px] place-items-center rounded-full bg-signal">
          <Sparkle className="size-2.5" fill="#fff" />
        </span>
        <span className="font-mono">act</span>
        <span className="opacity-60">10 fields in one call</span>
      </div>
    </>
  )
}

export function ChatPreview() {
  return (
    <>
      <Mini className="absolute top-10 left-7 w-[180px] p-3 max-sm:hidden">
        <div className="mb-2 text-[10px] font-semibold">Project settings</div>
        <MiniLabel>Project name</MiniLabel>
        <MiniField agent>Atlas</MiniField>
        <div className="mt-2">
          <MiniLabel>Region</MiniLabel>
          <MiniField agent chevron>
            Tokyo
          </MiniField>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[10px] font-medium text-graphite">
          Weekly digest
          <span className="flex h-3.5 w-6 justify-end rounded-full bg-signal p-0.5">
            <span className="size-2.5 rounded-full bg-white" />
          </span>
        </div>
        <div className="mt-3 flex h-6 items-center justify-center rounded-[7px] text-[10px] font-medium text-[#C2410C] shadow-[inset_0_0_0_1px_#F6C9BC]">
          Delete project
        </div>
      </Mini>

      <Mini className="absolute top-5 right-6 flex h-[260px] w-[300px] flex-col gap-2 p-3 max-sm:left-1/2 max-sm:-translate-x-1/2">
        <div className="max-w-[84%] self-end rounded-[12px] rounded-br-[4px] bg-ink px-2.5 py-[7px] text-[10.5px] leading-snug text-white">
          Rename it to Atlas and move it to Tokyo
        </div>
        <div className="flex h-[26px] items-center gap-1.5 rounded-lg px-2 text-[10px] shadow-[inset_0_0_0_1px_var(--hairline)]">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="var(--live)" strokeWidth="1.6" aria-hidden="true">
            <path d="M2 5.2 4.2 7.4 8 3" />
          </svg>
          <span className="rounded bg-signal-soft px-1 font-mono text-[9.5px] text-signal">act</span>
          <span className="text-graphite">Region → “Tokyo”</span>
        </div>
        <div className="rounded-[10px] bg-signal-soft px-2.5 py-2 text-[10px] leading-snug shadow-[inset_0_0_0_1px_rgb(240_78_31/0.3)]">
          The agent wants to press <b>Delete project</b>.
          <div className="mt-1.5 flex gap-1.5">
            <span className="flex h-5 items-center rounded-md bg-ink px-2 font-medium text-white">Allow</span>
            <span className="flex h-5 items-center rounded-md bg-white px-2 font-medium shadow-[inset_0_0_0_1px_var(--hairline)]">
              Deny
            </span>
          </div>
        </div>
        <div className="relative mt-auto">
          <div className="absolute bottom-[38px] left-2 w-[150px] rounded-lg bg-white p-1 text-[10px] shadow-[0_0_0_1px_var(--hairline),0_8px_16px_-6px_rgb(10_13_20/0.15)]">
            <div className="flex items-center gap-1.5 rounded-[5px] bg-well px-1.5 py-[5px]">
              <span className="text-signal">@</span>Region
            </div>
            <div className="flex items-center gap-1.5 px-1.5 py-[5px] text-graphite">
              <span className="text-pencil">@</span>Retention
            </div>
          </div>
          <div className="flex h-8 items-center justify-between rounded-[10px] pr-1 pl-2.5 text-[10.5px] shadow-[inset_0_0_0_1px_var(--hairline)]">
            <span>
              @Re
              <span className="ml-px inline-block h-[11px] w-px translate-y-0.5 bg-ink" />
            </span>
            <span className="grid size-6 place-items-center rounded-[7px] bg-ink">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="1.5" aria-hidden="true">
                <path d="M5 8.5v-7M2 4.5l3-3 3 3" />
              </svg>
            </span>
          </div>
        </div>
      </Mini>
    </>
  )
}

export function ReplayPreview() {
  const node = "absolute -top-1 size-2.5 rounded-full bg-white"
  return (
    <div className="px-3.5 pt-[18px]">
      <Mini className="absolute top-3.5 left-[40%] px-[7px] py-1 text-[9.5px] whitespace-nowrap">
        Region = <b>Europe</b>
      </Mini>
      <div className="relative mt-10 h-0.5 rounded-full bg-[#E2E2E2]">
        <div className="absolute inset-y-0 left-0 w-[58%] rounded-full bg-ink" />
        <span className={cn(node, "left-[12%] shadow-[0_0_0_1.5px_var(--ink)]")} />
        <span className={cn(node, "left-[34%] shadow-[0_0_0_1.5px_var(--ink)]")} />
        <span className="absolute -top-[5px] left-[56%] size-3 rounded-full bg-signal shadow-[0_0_0_3px_var(--signal-soft)]" />
        <span className={cn(node, "left-[80%] shadow-[0_0_0_1.5px_#CFCFCF]")} />
      </div>
      <div className="absolute inset-x-3.5 bottom-3.5 flex justify-between font-mono text-[9px] text-pencil">
        <span>00:14</span>
        <span>00:41</span>
      </div>
    </div>
  )
}

export function FiltersPreview() {
  const chip = "rounded-lg bg-signal-soft px-[7px] py-1 text-[9.5px] shadow-[inset_0_0_0_1px_rgb(240_78_31/0.4)]"
  return (
    <div className="px-3.5 pt-4">
      <Mini className="flex h-7 items-center gap-1.5 px-2 text-[10px]">
        <Sparkle className="size-2.5 text-signal" />
        Europe, last quarter, over $10k
      </Mini>
      <div className="mt-3 flex flex-wrap gap-[5px]">
        <span className={chip}>Region: Europe</span>
        <span className={chip}>Jul 1 – Sep 30</span>
        <span className={chip}>Amount ≥ 10,000</span>
      </div>
    </div>
  )
}

export function UndoPreview() {
  const key =
    "grid size-[22px] place-items-center rounded-lg bg-white font-mono text-[11px] shadow-[0_0_0_1px_var(--hairline),0_2px_0_var(--hairline)]"
  return (
    <div className="p-3.5">
      <Mini className="p-1 text-[9.5px]">
        <div className="px-1.5 py-[5px] text-graphite">
          <b className="font-medium text-ink">You</b> set Plan to Pro
        </div>
        <div className="rounded-[5px] bg-signal-soft px-1.5 py-[5px]">
          <b className="font-medium text-signal">Agent</b> set Name to Atlas
        </div>
        <div className="mt-0.5 rounded-[5px] bg-signal-soft px-1.5 py-[5px]">
          <b className="font-medium text-signal">Agent</b> set Region to Tokyo
        </div>
      </Mini>
      <div className="absolute right-3.5 bottom-3 flex gap-1">
        <span className={key}>⌘</span>
        <span className={key}>Z</span>
      </div>
    </div>
  )
}

export function WebMcpPreview() {
  return (
    <div className="p-3.5">
      <Mini className="overflow-hidden">
        <div className="flex h-5 items-center gap-1 border-b border-hairline px-[7px]">
          <span className="size-[5px] rounded-full bg-[#E2E2E2]" />
          <span className="size-[5px] rounded-full bg-[#E2E2E2]" />
          <span className="size-[5px] rounded-full bg-[#E2E2E2]" />
          <span className="ml-1.5 font-mono text-[8.5px] text-pencil">acme.app/settings</span>
        </div>
        <div className="px-[9px] pt-[9px] pb-2.5 font-mono text-[9.5px] leading-relaxed text-graphite">
          <span className="text-signal">registerTools</span>(agent, {"{"}
          <br />
          &nbsp;&nbsp;allow: <span className="text-ink">confirmWithUser</span>
          <br />
          {"})"}
        </div>
      </Mini>
    </div>
  )
}

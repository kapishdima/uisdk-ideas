"use client"

import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@ui-sdk/react/collapsible"
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckIcon,
  ChevronRightIcon,
  InfoIcon,
  LoaderIcon,
  PaperclipIcon,
  Redo2Icon,
  ShieldAlertIcon,
  Undo2Icon,
  UserIcon,
} from "lucide-react"
import { useEffect, useRef, type ReactNode } from "react"
import { Button, cn } from "@/components/ui/fields"
import { describeStep, summarizeToolCall, type ChatItem, type ToolStatus } from "./model"

/** Scrolling message list that sticks to the bottom as items arrive. */
export function ChatThread({
  children,
  className,
  "aria-label": ariaLabel = "Conversation",
}: {
  children: ReactNode
  className?: string
  "aria-label"?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new MutationObserver(() => {
      element.scrollTo({ top: element.scrollHeight, behavior: "smooth" })
    })
    observer.observe(element, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      role="log"
      aria-label={ariaLabel}
      aria-live="polite"
      className={cn("flex flex-col gap-1.5 overflow-y-auto", className)}
    >
      {children}
    </div>
  )
}

/** A person's message is a dark bubble; the agent's reply is plain text. */
export function ChatMessage({
  role,
  children,
  footer,
}: {
  role: "user" | "assistant"
  children: ReactNode
  footer?: ReactNode
}) {
  if (role === "assistant") {
    return (
      <div className="px-0.5 py-1.5 text-[13px] leading-relaxed whitespace-pre-wrap text-ink">
        {children}
      </div>
    )
  }
  return (
    <div className="flex flex-col items-end gap-1 py-1">
      <div className="max-w-[88%] rounded-[14px] rounded-br-[5px] bg-ink px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap text-white">
        {children}
      </div>
      {footer}
    </div>
  )
}

/** The node on the chain's rail: what state the call is in. */
const statusNode: Record<ToolStatus, { className: string; icon: ReactNode; label: string }> = {
  running: {
    className: "bg-sheet shadow-[inset_0_0_0_1.5px_var(--signal)]",
    icon: <LoaderIcon className="size-2.5 animate-spin text-signal" strokeWidth={2.5} />,
    label: "Running",
  },
  done: {
    className: "bg-live-soft shadow-[inset_0_0_0_1px_rgb(31_193_107/0.35)]",
    icon: <CheckIcon className="size-2.5 text-live-ink" strokeWidth={3} />,
    label: "Done",
  },
  error: {
    className: "bg-[#fef3f2] shadow-[inset_0_0_0_1px_rgb(217_45_32/0.3)]",
    icon: <AlertTriangleIcon className="size-2.5 text-danger" strokeWidth={2.5} />,
    label: "Failed",
  },
}

function errorMessage(output: unknown): string | null {
  if (!output) return null
  if (typeof output === "string") return output
  const error = (output as { error?: { message?: string } | string }).error
  if (!error) return null
  return typeof error === "string" ? error : (error.message ?? null)
}

type ToolCall = Extract<ChatItem, { kind: "tool" }>

/**
 * Tool calls in a row, drawn as one chain: a rail with a node per call, like
 * the step lists in agent apps. Each link opens to its input and output.
 */
export function ToolChain({ calls, pending }: { calls: ToolCall[]; pending?: boolean }) {
  const done = calls.filter((call) => call.status === "done").length
  // While the model decides what to do next, the chain ends in an open link.
  const thinking = pending && calls.every((call) => call.status !== "running")
  return (
    <ol aria-label={`Tool calls: ${done} of ${calls.length} done`} className="flex flex-col py-1">
      {calls.map((call, index) => (
        <ToolLink
          key={call.id}
          {...call}
          first={index === 0}
          last={index === calls.length - 1 && !thinking}
        />
      ))}
      {thinking ? <ThinkingLink /> : null}
    </ol>
  )
}

function ThinkingLink() {
  return (
    <li className="relative pl-7">
      <span className="absolute top-0 left-[8.5px] h-2.5 w-px bg-hairline" aria-hidden="true" />
      <span
        className={cn("absolute top-[9px] left-0 grid size-[18px] place-items-center rounded-full", statusNode.running.className)}
        aria-hidden="true"
      >
        {statusNode.running.icon}
      </span>
      <p className="shimmer-text flex h-9 items-center px-1.5 text-[12.5px]">Thinking…</p>
    </li>
  )
}

const VISIBLE_STEPS = 4

function ToolLink({
  name,
  input,
  output,
  status,
  open,
  first,
  last,
}: ToolCall & { first: boolean; last: boolean }) {
  const steps =
    name === "act" ? ((input as { steps?: Parameters<typeof describeStep>[0][] })?.steps ?? []) : []
  const error = status === "error" ? errorMessage(output) : null
  const node = statusNode[status]

  return (
    <li className={cn("relative pl-7", !last && "pb-1.5")}>
      {/* The rail: from the node above down to this one, and on to the next. */}
      {!first ? <span className="absolute top-0 left-[8.5px] h-2.5 w-px bg-hairline" aria-hidden="true" /> : null}
      {!last ? (
        <span className="absolute top-[27px] bottom-0 left-[8.5px] w-px bg-hairline" aria-hidden="true" />
      ) : null}
      <span
        className={cn("absolute top-[9px] left-0 grid size-[18px] place-items-center rounded-full", node.className)}
        aria-hidden="true"
      >
        {node.icon}
      </span>

      <Collapsible defaultOpen={open} className="group/link text-[12.5px]">
        <CollapsibleTrigger className="group flex h-9 w-full items-center gap-2 rounded-lg px-1.5 text-left outline-none transition hover:bg-black/[0.03] focus-visible:ring-4 focus-visible:ring-ink/10">
          <span className="sr-only">{node.label}: </span>
          <code className="shrink-0 font-mono text-[12px] leading-none font-medium text-ink">{name}</code>
          <span className="min-w-0 flex-1 truncate leading-none text-graphite">
            {summarizeToolCall(name, input, output)}
          </span>
          <ChevronRightIcon className="size-3.5 shrink-0 text-pencil opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100 group-data-open:rotate-90 group-data-open:opacity-100" />
        </CollapsibleTrigger>

        {steps.length > 1 ? (
          <ul className="mb-1 flex flex-col pl-1.5 font-mono text-[11px] leading-[1.8] text-graphite">
            {steps.map((step, index) => (
              <li
                key={index}
                className={cn("truncate", index >= VISIBLE_STEPS && "hidden group-data-open/link:list-item")}
              >
                {describeStep(step)}
              </li>
            ))}
            {steps.length > VISIBLE_STEPS ? (
              <li className="text-pencil group-data-open/link:hidden">
                + {steps.length - VISIBLE_STEPS} more
              </li>
            ) : null}
          </ul>
        ) : null}
        {error ? <p className="mb-1 px-1.5 leading-snug text-danger">{error}</p> : null}

        <CollapsiblePanel>
          <div className="grid gap-2 px-1.5 pt-1 pb-2">
            <JsonBlock label="input" value={input} />
            {output !== undefined ? <JsonBlock label="output" value={output} /> : null}
          </div>
        </CollapsiblePanel>
      </Collapsible>
    </li>
  )
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="min-w-0">
      <div className="mb-1 font-mono text-[10px] tracking-wider text-pencil uppercase">{label}</div>
      <pre className="max-h-64 overflow-auto rounded-lg bg-well p-2.5 font-mono text-[11px] leading-relaxed text-graphite">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}

/** The agent asks the person before a control marked with data-agent-confirm. */
export function ConfirmCard({
  text,
  target,
  status,
  onAnswer,
}: {
  text: string
  target: string
  status: "pending" | "approved" | "denied"
  onAnswer: (approved: boolean) => void
}) {
  return (
    <div className="rounded-xl bg-signal-soft p-3 text-[13px] leading-snug shadow-[inset_0_0_0_1px_rgb(240_78_31/0.3)]">
      <div className="flex items-start gap-2">
        <ShieldAlertIcon className="mt-px size-4 shrink-0 text-signal" aria-hidden="true" />
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <p>
            The agent wants to press <strong className="font-semibold">{target}</strong>.{" "}
            <span className="text-graphite">{text}.</span>
          </p>
          {status === "pending" ? (
            <div className="flex gap-1.5">
              <Button size="sm" onClick={() => onAnswer(true)}>
                Allow
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onAnswer(false)}>
                Deny
              </Button>
            </div>
          ) : (
            <p className="text-xs font-medium text-graphite">
              {status === "approved" ? "You allowed it." : "You said no."}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex gap-1 px-1 py-2" aria-label="Agent is working">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="typing-dot size-1.5 rounded-full bg-signal"
          style={{ animationDelay: `${index * 160}ms` }}
        />
      ))}
    </div>
  )
}

/** Something the app tells the person, like the result of an undo. */
export function Notice({
  text,
  title,
  icon = "info",
}: {
  text: string
  title?: string
  icon?: "undo" | "redo" | "info"
}) {
  const Icon = icon === "undo" ? Undo2Icon : icon === "redo" ? Redo2Icon : InfoIcon
  return (
    <div className="flex gap-2 rounded-[10px] bg-sheet px-3 py-2.5 text-[12.5px] leading-normal text-graphite shadow-control">
      <Icon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <p>
        {title ? <strong className="font-medium text-ink">{title} </strong> : null}
        {text}
      </p>
    </div>
  )
}

/** The model request failed. Nothing on the page changed in that turn. */
export function ErrorCard({
  title,
  text,
  onRetry,
}: {
  title: string
  text: string
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className="flex gap-2.5 rounded-xl bg-[#fef3f2] p-3 text-[13px] leading-snug shadow-[inset_0_0_0_1px_rgb(217_45_32/0.22)]"
    >
      <AlertCircleIcon className="mt-px size-4 shrink-0 text-danger" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[#b42318]">{title}</p>
        <p className="mt-0.5 text-[12.5px] text-[#7a271a]">{text}</p>
        {onRetry ? (
          <Button size="sm" variant="secondary" className="mt-2.5" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </div>
    </div>
  )
}

/** A change the person made by hand, passed to the agent with their next message. */
export function ContextChip({ text }: { text: string }) {
  return (
    <div className="flex max-w-[88%] items-center gap-1.5 self-end rounded-lg bg-sheet px-2 py-1 text-[11.5px] text-graphite shadow-control">
      <UserIcon className="size-3 shrink-0" aria-hidden="true" />
      <span className="truncate">
        You changed <code className="font-mono text-[11px] text-ink">{text}</code>
      </span>
    </div>
  )
}

/** Renders a list of chat items with the kit's parts. */
export function ChatItems({
  items,
  onConfirm,
  onRetry,
  working,
}: {
  items: ChatItem[]
  onConfirm?: (id: string, approved: boolean) => void
  onRetry?: () => void
  /** The agent is mid-turn: the last chain shows it thinking, or a typing indicator does. */
  working?: boolean
}) {
  // Tool calls in a row render as one chain, keyed by the first call.
  const blocks: Array<ChatItem | { kind: "chain"; id: string; calls: ToolCall[] }> = []
  for (const item of items) {
    const previous = blocks.at(-1)
    if (item.kind === "tool" && previous?.kind === "chain") previous.calls.push(item)
    else if (item.kind === "tool") blocks.push({ kind: "chain", id: item.id, calls: [item] })
    else blocks.push(item)
  }

  return (
    <>
      {blocks.map((item) => {
        switch (item.kind) {
          case "chain":
            return (
              <ToolChain key={item.id} calls={item.calls} pending={working && item === blocks.at(-1)} />
            )
          case "user":
            return (
              <ChatMessage
                key={item.id}
                role="user"
                footer={
                  item.attachment ? (
                    <span className="flex items-center gap-1 text-[11px] text-pencil">
                      <PaperclipIcon className="size-3" aria-hidden="true" />
                      {item.attachment}
                    </span>
                  ) : null
                }
              >
                {item.text}
              </ChatMessage>
            )
          case "assistant":
            return (
              <ChatMessage key={item.id} role="assistant">
                {item.text}
              </ChatMessage>
            )
          case "confirm":
            return (
              <ConfirmCard
                key={item.id}
                text={item.text}
                target={item.target}
                status={item.status}
                onAnswer={(approved) => onConfirm?.(item.id, approved)}
              />
            )
          case "notice":
            return <Notice key={item.id} text={item.text} title={item.title} icon={item.icon} />
          case "error":
            return (
              <ErrorCard
                key={item.id}
                title={item.title}
                text={item.text}
                onRetry={item.retry ? onRetry : undefined}
              />
            )
          case "context":
            return <ContextChip key={item.id} text={item.text} />
        }
      })}
      {working && blocks.at(-1)?.kind !== "chain" ? <TypingIndicator /> : null}
    </>
  )
}

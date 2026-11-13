import type { AgentEvent } from "@/lib/run-agent"

export type ToolStatus = "running" | "done" | "error"

export type ChatItem =
  | { kind: "user"; id: string; text: string; attachment?: string }
  | { kind: "assistant"; id: string; text: string }
  | {
      kind: "tool"
      id: string
      name: string
      input: unknown
      output?: unknown
      status: ToolStatus
      /** Start expanded, like the card a /snapshot command shows. */
      open?: boolean
    }
  | {
      kind: "confirm"
      id: string
      text: string
      target: string
      status: "pending" | "approved" | "denied"
    }
  | { kind: "notice"; id: string; text: string; title?: string; icon?: "undo" | "redo" | "info" }
  | { kind: "error"; id: string; title: string; text: string; retry?: boolean }
  | { kind: "context"; id: string; text: string }

let counter = 0
export const itemId = (prefix = "item") => `${prefix}_${++counter}`

/** Folds a streamed agent event into the list of chat items. */
export function applyAgentEvent(items: ChatItem[], event: AgentEvent): ChatItem[] {
  switch (event.type) {
    case "text":
      return [...items, { kind: "assistant", id: itemId("msg"), text: event.text }]
    case "tool-call":
      return [
        ...items,
        { kind: "tool", id: event.id, name: event.name, input: event.input, status: "running" },
      ]
    case "tool-result":
      return items.map((item) =>
        item.kind === "tool" && item.id === event.id
          ? { ...item, output: event.output, status: event.isError ? "error" : "done" }
          : item,
      )
  }
}

type ActInput = { steps?: Array<{ ref: string; action: string; args?: unknown[] }> }
type QueryInput = { within?: string; text?: string; kind?: string }

function formatArg(value: unknown) {
  if (typeof value === "string") return `“${value}”`
  return JSON.stringify(value)
}

/** One line describing what a tool call does, for the collapsed card. */
export function summarizeToolCall(name: string, input: unknown, output?: unknown): string {
  if (name === "snapshot") {
    const count = Array.isArray(output) ? output.length : null
    return count === null ? "Reading the page…" : `Read ${count} components`
  }
  if (name === "query") {
    const q = (input ?? {}) as QueryInput
    if (q.within) return `Looked up choices in ${q.within}${q.text ? ` for “${q.text}”` : ""}`
    return `Searched the page for “${q.text ?? q.kind ?? ""}”`
  }
  if (name === "act") {
    const steps = ((input ?? {}) as ActInput).steps ?? []
    const failed = (output as { error?: { step?: number } } | undefined)?.error?.step
    const stopped = typeof failed === "number" ? ` · stopped at step ${failed + 1}` : ""
    if (steps.length === 1) return describeStep(steps[0]) + (stopped ? " · failed" : "")
    return `${steps.length} steps${stopped}`
  }
  return name
}

export function describeStep(step: { ref: string; action: string; args?: unknown[] }) {
  const args = step.args ?? []
  if (step.action === "press") return `Press ${args.length ? formatArg(args[0]) : step.ref}`
  if (step.action.startsWith("set") && args.length) {
    return `${step.ref} → ${formatArg(args[0])}`
  }
  return `${step.action} ${step.ref}${args.length ? ` ${args.map(formatArg).join(", ")}` : ""}`
}

/** The feed's note for one step through the page's history. */
export function historyNotice(
  step: { who: "you" | "agent"; text: string; count: number; kept: string[] },
  direction: "back" | "forward",
): ChatItem {
  const verb = direction === "back" ? "Undid" : "Redid"
  const whose = step.who === "agent" ? "the agent’s run" : "your change"
  const what = step.who === "agent" && step.count > 1 ? `${step.count} changes: ${step.text}` : step.text
  const kept = step.kept.length
    ? ` ${step.kept.join(", ")} stays as it is — it’s secret, so its value can’t be put back.`
    : ""
  return {
    kind: "notice",
    id: itemId("history"),
    icon: direction === "back" ? "undo" : "redo",
    title: `${verb} ${whose}.`,
    text: what + "." + kept,
  }
}

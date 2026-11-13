"use client"

import type { ObservedChange } from "@ui-sdk/react/agent"
import { Trash2Icon, Undo2Icon } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  applyAgentEvent,
  ChatComposer,
  ChatItems,
  ChatThread,
  historyNotice,
  itemId,
  useAgentConfirm,
  type ChatItem,
  type ComposerCommand,
} from "@/components/chat-kit"
import {
  Button,
  NumberField,
  SelectField,
  SwitchField,
  TextField,
} from "@/components/ui/fields"
import { DemoShell } from "@/components/demo-shell"
import { ModelBadge } from "@/components/model-badge"
import { getAgent } from "@/lib/agent"
import {
  describeRunError,
  fetchModelStatus,
  runAgent,
  runScript,
  runTool,
  type AgentEvent,
  type MessageParam,
} from "@/lib/run-agent"
import { cn } from "@/lib/cn"
import { useAgentPage } from "@/lib/use-agent-page"
import { useHistoryShortcuts } from "@/lib/use-undo-shortcut"
import { HistoryButtons } from "@/components/ui/history-buttons"

const regions = [
  { value: "fra", label: "Frankfurt" },
  { value: "iad", label: "Virginia" },
  { value: "hnd", label: "Tokyo" },
  { value: "gru", label: "São Paulo" },
]

const plans = [
  { value: "hobby", label: "Hobby" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
]

const commands: ComposerCommand[] = [
  { value: "undo", description: "Undo the agent's changes" },
  { value: "snapshot", description: "Show what the agent sees" },
  { value: "clear", description: "Clear the conversation" },
]

type Emit = (event: AgentEvent) => void

/** Recorded runs for demo mode: real tool calls, scripted words. */
const suggestions: Array<{ prompt: string; run: (emit: Emit) => Promise<void> }> = [
  {
    prompt: "Rename the project to Atlas and move it to Tokyo",
    run: (emit) =>
      runScript(
        [
          {
            tool: "act",
            input: {
              steps: [
                { ref: "Project name", action: "setValue", args: ["Atlas"] },
                { ref: "Region", action: "setValue", args: ["Tokyo"] },
              ],
            },
          },
          { say: "Done — the project is now Atlas, deployed in Tokyo." },
        ],
        emit,
      ),
  },
  {
    prompt: "Turn on the weekly digest and keep logs for 90 days",
    run: (emit) =>
      runScript(
        [
          {
            tool: "act",
            input: {
              steps: [
                { ref: "Weekly digest", action: "setChecked", args: [true] },
                { ref: "Log retention", action: "setValue", args: ["90 days"] },
              ],
            },
          },
          { say: "Weekly digest is on, and logs are kept for 90 days." },
        ],
        emit,
      ),
  },
  {
    prompt: "Delete this project",
    run: async (emit) => {
      const id = itemId("tool")
      const input = { steps: [{ ref: "Delete project", action: "press" }] }
      emit({ type: "tool-call", id, name: "act", input })
      const { output, isError } = await runTool("act", input)
      emit({ type: "tool-result", id, output, isError })
      emit({
        type: "text",
        text: isError
          ? "Okay, I left the project alone — deleting needs your approval."
          : "The project is deleted. You can restore it from the panel.",
      })
    },
  },
]

export function ChatUiKitDemo() {
  const [status, setStatus] = useState<{ configured: boolean; model: string } | null>(null)
  const [items, setItems] = useState<ChatItem[]>([
    {
      kind: "assistant",
      id: "welcome",
      text: "I can change this project's settings for you. Ask in your own words, mention a control with @, or type / for a command.",
    },
  ])
  const [running, setRunning] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const history = useRef<MessageParam[]>([])
  const humanChanges = useRef<ObservedChange[]>([])
  const {
    regionRef,
    agentChanges,
    undoAgent,
    stepBack,
    stepForward,
    canStepBack,
    canStepForward,
    clearMark,
    showRefs,
    markMentions,
  } = useAgentPage<HTMLDivElement>()
  const lastText = useRef("")
  const onConfirm = useAgentConfirm(setItems)

  useEffect(() => {
    fetchModelStatus().then(setStatus)
  }, [])

  // Collect what the person changes by hand, so the next turn knows about it.
  useEffect(() => {
    return getAgent().subscribe((change) => {
      if (change.source === "agent" || (change.key !== "value" && change.key !== "checked")) return
      // Keep the latest value per control: "Plan → Enterprise", not every step on the way.
      humanChanges.current = [
        ...humanChanges.current.filter((earlier) => earlier.ref !== change.ref || earlier.key !== change.key),
        change,
      ]
    })
  }, [])

  const emit = useCallback(
    (event: AgentEvent) => setItems((current) => applyAgentEvent(current, event)),
    [],
  )
  const push = (item: ChatItem) => setItems((current) => [...current, item])
  const waiting = items.some((item) => item.kind === "confirm" && item.status === "pending")

  /** "Plan → Enterprise": a change the person made, in the words the page shows. */
  function describeChange(change: ObservedChange) {
    const entry = getAgent()
      .snapshot()
      .find((component) => component.ref === change.ref)
    const choice = entry?.items?.find((item) => item.value === change.value)?.label
    const value =
      typeof change.value === "boolean" ? (change.value ? "on" : "off") : (choice ?? String(change.value))
    return `${change.label ?? change.ref} → ${value}`
  }

  const mentions = useCallback((query: string) => {
    const labels = getAgent()
      .snapshot()
      .flatMap((component) => (component.label ? [component.label] : []))
    const q = query.toLowerCase()
    return [...new Set(labels)].filter((label) => label.toLowerCase().includes(q))
  }, [])

  async function runCommand(command: string) {
    if (command === "clear") {
      setItems([])
      history.current = []
      return
    }
    if (command === "undo") {
      const total = agentChanges
      const left = await undoAgent()
      push({
        kind: "notice",
        id: itemId("notice"),
        icon: "undo",
        text: total
          ? left.length
            ? `Undid ${total - left.length} of the agent’s ${total} changes.`
            : `Undid the agent’s ${total} changes. Your own edits stay.`
          : "The agent hasn’t changed anything yet.",
      })
      return
    }
    if (command === "snapshot") {
      const id = itemId("tool")
      push({ kind: "tool", id, name: "snapshot", input: {}, status: "running", open: true })
      const { output, isError } = await runTool("snapshot", {})
      emit({ type: "tool-result", id, output, isError })
      showRefs()
      return
    }
    push({ kind: "notice", id: itemId("notice"), text: `There’s no /${command} command.` })
  }

  /** ⌘Z / ⌘⇧Z: one step through everything that changed, yours or the agent's. */
  async function step(direction: "back" | "forward") {
    const result = direction === "back" ? await stepBack() : await stepForward()
    if (result) push(historyNotice(result, direction))
  }

  const editable = !running && !deleted
  useHistoryShortcuts({
    onUndo: () => step("back"),
    onRedo: () => step("forward"),
    canUndo: editable && canStepBack,
    canRedo: editable && canStepForward,
  })

  /** One agent turn for a message the person sent. */
  async function runTurn(text: string) {
    lastText.current = text
    setRunning(true)
    try {
      if (status?.configured) {
        const changes = humanChanges.current.splice(0)
        const context = changes.length
          ? `(Since your last turn the person changed: ${changes.map(describeChange).join("; ")})\n\n`
          : ""
        history.current = await runAgent({
          demo: "chat",
          messages: [...history.current, { role: "user", content: context + text }],
          onEvent: emit,
        })
      } else {
        const match = suggestions.find((suggestion) => suggestion.prompt === text)
        if (match) await match.run(emit)
        else
          push({
            kind: "notice",
            id: itemId("notice"),
            title: "Demo mode plays recorded runs only.",
            text: "Try a suggestion below, or set ANTHROPIC_API_KEY to chat freely.",
          })
      }
    } catch (error) {
      const { title, text: detail } = describeRunError(error)
      push({ kind: "error", id: itemId("error"), title, text: detail, retry: true })
    } finally {
      setRunning(false)
    }
  }

  async function send(text: string) {
    clearMark("ref")
    const command = text.match(/^\/(\w+)\s*$/)?.[1]
    if (command) {
      await runCommand(command)
      return
    }
    // In live mode the person's own edits go to the model with the message: show them.
    const changes = status?.configured ? humanChanges.current.map(describeChange) : []
    setItems((current) => [
      ...current,
      ...changes.map((change) => ({ kind: "context" as const, id: itemId("ctx"), text: change })),
      { kind: "user", id: itemId("msg"), text },
    ])
    await runTurn(text)
  }

  function retry() {
    setItems((current) => current.filter((item) => item.kind !== "error"))
    void runTurn(lastText.current)
  }

  const aside = (
    <>
      <ChatThread className="-mx-1 mt-5 min-h-0 flex-1 px-1 pb-2">
        <ChatItems items={items} onConfirm={onConfirm} onRetry={retry} working={running && !waiting} />
        {items.length === 1 && items[0].id === "welcome" ? (
          <p className="px-0.5 text-xs leading-relaxed text-pencil">
            The @ list comes from <code className="font-mono text-[11px]">agent.snapshot()</code> — only
            controls the agent can see. The chat itself is{" "}
            <code className="font-mono text-[11px]">data-agent-hidden</code>.
          </p>
        ) : null}
      </ChatThread>
      <div className="flex flex-col gap-2 pt-2">
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.prompt}
              type="button"
              disabled={running}
              onClick={() => send(suggestion.prompt)}
              className="rounded-full bg-sheet px-2.5 py-1 text-xs text-graphite shadow-control transition hover:text-ink disabled:opacity-50"
            >
              {suggestion.prompt}
            </button>
          ))}
        </div>
        <ChatComposer
          onSend={send}
          mentions={mentions}
          onMentions={markMentions}
          commands={commands}
          disabled={running}
        />
      </div>
    </>
  )

  return (
    <DemoShell
      index="02"
      title="Chat UI kit"
      badge={<ModelBadge status={status} />}
      aside={aside}
      asideClassName="max-lg:max-h-[80dvh]"
      breadcrumb={["Workspace", "Project settings"]}
      actions={
        <>
          <HistoryButtons
            canUndo={editable && canStepBack}
            canRedo={editable && canStepForward}
            onUndo={() => step("back")}
            onRedo={() => step("forward")}
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => runCommand("undo")}
            disabled={agentChanges === 0 || running}
          >
            <Undo2Icon className="size-3.5" aria-hidden="true" />
            Undo agent{agentChanges ? ` (${agentChanges})` : ""}
          </Button>
        </>
      }
    >
      <div ref={regionRef} className="mx-auto flex w-full max-w-[560px] flex-col gap-8 px-5 py-9">
        <section className="grid gap-[18px]">
          <SectionTitle>General</SectionTitle>
          <TextField label="Project name" defaultValue="Apollo" />
          <div className="grid gap-[18px] sm:grid-cols-2">
            <SelectField label="Region" items={regions} defaultValue="fra" />
            <SelectField label="Plan" items={plans} defaultValue="pro" />
          </div>
          <NumberField label="Log retention" defaultValue={30} min={1} description="Days to keep request logs." />
        </section>

        <section className="grid gap-2.5">
          <SectionTitle>Notifications</SectionTitle>
          <SwitchField label="Weekly digest" description="A summary of the week, every Monday." />
          <SwitchField label="Deploy notifications" description="Email when a deploy fails." defaultChecked />
        </section>

        <section className="grid gap-2.5">
          <SectionTitle>Danger zone</SectionTitle>
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 rounded-xl px-3.5 py-3 transition",
              waiting
                ? "bg-signal-soft shadow-[inset_0_0_0_1px_rgb(240_78_31/0.45),0_0_0_4px_rgb(240_78_31/0.1)]"
                : "shadow-[inset_0_0_0_1px_rgb(217_45_32/0.22)]",
            )}
          >
            <div>
              <div className="text-[13px] font-medium">Delete project</div>
              <div className="mt-0.5 text-xs text-graphite">
                {waiting
                  ? "The agent is asking to press this — answer in the chat."
                  : "The agent can ask, but only you can approve it."}
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              data-agent-confirm="Permanently deletes the project and its 12 deployments"
              onClick={() => setDeleted(true)}
            >
              <Trash2Icon className="size-3.5" aria-hidden="true" /> Delete project
            </Button>
          </div>
        </section>
      </div>

      {deleted ? (
        <div
          data-agent-hidden
          className="absolute inset-x-0 top-14 bottom-0 grid place-items-center bg-sheet px-5"
        >
          <div className="max-w-[420px] text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-[14px] bg-well shadow-[inset_0_0_0_1px_var(--hairline)]">
              <Trash2Icon className="size-5 text-graphite" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-[22px] font-semibold tracking-[-0.02em]">Project deleted</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-graphite">
              The project and its 12 deployments are gone. You approved it in the chat; the agent
              pressed the button.
            </p>
            <Button className="mt-5" onClick={() => setDeleted(false)}>
              Restore project
            </Button>
            <p className="mt-4 text-xs text-pencil">Not really — this is a demo.</p>
          </div>
        </div>
      ) : null}
    </DemoShell>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="flex items-center gap-2.5 font-mono text-[11px] text-pencil">
      {children}
      <span className="h-px flex-1 bg-hairline" />
    </h2>
  )
}

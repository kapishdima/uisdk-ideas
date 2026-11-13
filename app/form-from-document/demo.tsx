"use client"

import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  ShieldAlertIcon,
  SparklesIcon,
  Undo2Icon,
} from "lucide-react"
import { useEffect, useRef, useState, type FormEvent } from "react"
import {
  applyAgentEvent,
  ChatItems,
  ChatThread,
  historyNotice,
  itemId,
  useAgentConfirm,
  type ChatItem,
} from "@/components/chat-kit"
import {
  Button,
  DateField,
  NumberField,
  SelectField,
  SwitchField,
  TextareaField,
  TextField,
} from "@/components/ui/fields"
import { AsideLabel, DemoShell } from "@/components/demo-shell"
import { ModelBadge } from "@/components/model-badge"
import { SheetToast, WorkingPill } from "@/components/sheet-overlays"
import { cn } from "@/lib/cn"
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
import { useAgentPage } from "@/lib/use-agent-page"
import { useHistoryShortcuts } from "@/lib/use-undo-shortcut"
import { HistoryButtons } from "@/components/ui/history-buttons"
import { DocumentGallery, DocumentPreview } from "./document-preview"
import { documents, documentText, scriptFor, type SampleDocument } from "./documents"

const currencies = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "UAH", label: "Ukrainian Hryvnia (UAH)" },
]

const categories = [
  { value: "software", label: "Software" },
  { value: "hardware", label: "Hardware" },
  { value: "services", label: "Services" },
  { value: "travel", label: "Travel" },
  { value: "office", label: "Office" },
]

/** The user turn: the document as a content block, then the request. */
function buildUserMessage(doc: SampleDocument): MessageParam {
  return {
    role: "user",
    content: [
      {
        type: "document",
        source: { type: "text", media_type: "text/plain", data: documentText(doc) },
        title: doc.file,
      },
      { type: "text", text: "Fill the New bill form from this document." },
    ],
  }
}

type Submission = { data: Record<string, string>; byAgent: boolean; agentFields: number }

type ActInput = { steps?: Array<{ ref: string; action: string }> }
type ActOutput = { error?: { step: number; message: string } }

const labelOf = (items: { value: string; label: string }[], value?: string) =>
  items.find((item) => item.value === value)?.label ?? value ?? "—"

function maskIban(iban = "") {
  const compact = iban.replace(/\s+/g, "")
  if (compact.length < 10) return iban || "—"
  return `${compact.slice(0, 4)} ${compact.slice(4, 8)} •••• •••• ${compact.slice(-4, -2)} ${compact.slice(-2)}`
}

function formatDue(iso?: string) {
  if (!iso) return null
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
}

export function FormFromDocumentDemo() {
  const [status, setStatus] = useState<{ configured: boolean; model: string } | null>(null)
  const [docId, setDocId] = useState(documents[0].id)
  const [showDocument, setShowDocument] = useState(false)
  const [items, setItems] = useState<ChatItem[]>([])
  const [running, setRunning] = useState<false | "fill" | "submit">(false)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [toast, setToast] = useState<{ title: string; detail?: string } | null>(null)
  const {
    regionRef,
    agentChanges,
    undoAgent,
    stepBack,
    stepForward,
    canStepBack,
    canStepForward,
    resetHistory,
    markError,
    clearMark,
  } = useAgentPage<HTMLFormElement>()
  const onConfirm = useAgentConfirm(setItems)
  const toolInputs = useRef(new Map<string, unknown>())
  const agentSubmitting = useRef(false)
  const changesRef = useRef(0)

  useEffect(() => {
    changesRef.current = agentChanges
  }, [agentChanges])

  useEffect(() => {
    fetchModelStatus().then(setStatus)
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  /** Folds events into the feed, and points at the field a failed step was about. */
  const onEvent = (event: AgentEvent) => {
    if (event.type === "tool-call") toolInputs.current.set(event.id, event.input)
    if (event.type === "tool-result" && event.isError) {
      const failure = (event.output as ActOutput | undefined)?.error
      const step = failure
        ? (toolInputs.current.get(event.id) as ActInput | undefined)?.steps?.[failure.step]
        : undefined
      if (failure && step?.action.startsWith("set")) markError(step.ref, failure.message)
    }
    setItems((current) => applyAgentEvent(current, event))
  }
  const push = (item: ChatItem) => setItems((current) => [...current, item])

  const live = Boolean(status?.configured)
  const doc = documents.find((item) => item.id === docId) ?? documents[0]
  const canUndo = agentChanges > 0 && !running && !submission
  const editable = !running && !submission
  const waiting = items.some((item) => item.kind === "confirm" && item.status === "pending")
  const receipt = submission && showReceipt

  async function fill() {
    setRunning("fill")
    setSubmission(null)
    setShowReceipt(false)
    clearMark("error")
    // Each document starts from a blank bill, so nothing carries over from the last one.
    regionRef.current?.reset()
    resetHistory()
    setItems([
      { kind: "user", id: itemId("msg"), text: "Fill the form from this document.", attachment: doc.file },
    ])
    try {
      if (live) {
        await runAgent({ demo: "form", messages: [buildUserMessage(doc)], onEvent })
      } else {
        await runScript(scriptFor(doc), onEvent)
      }
    } catch (error) {
      const { title, text } = describeRunError(error)
      const untouched = changesRef.current === 0
      push({
        kind: "error",
        id: itemId("error"),
        title,
        text: untouched ? `${text} Nothing on the form changed.` : text,
        retry: true,
      })
    } finally {
      setRunning(false)
    }
  }

  async function askToSubmit() {
    setRunning("submit")
    push({ kind: "user", id: itemId("msg"), text: "Looks right — submit it." })
    const id = itemId("tool")
    const input = { steps: [{ ref: "Submit bill", action: "press" }] }
    onEvent({ type: "tool-call", id, name: "act", input })
    agentSubmitting.current = true
    const { output, isError } = await runTool("act", input)
    agentSubmitting.current = false
    onEvent({ type: "tool-result", id, output, isError })

    if (isError) {
      push({
        kind: "assistant",
        id: itemId("msg"),
        text: "Okay, I won’t submit it. The form stays as it is for you to review.",
      })
    } else {
      const data = Object.fromEntries(
        [...new FormData(regionRef.current ?? undefined).entries()].map(([k, v]) => [k, String(v)]),
      )
      const due = formatDue(data.due)
      push({
        kind: "assistant",
        id: itemId("msg"),
        text: `Submitted. The bill for ${Number(data.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} ${data.currency || ""} is with accounts payable${due ? `, due ${due}` : ""}.`,
      })
    }
    setRunning(false)
  }

  async function undo() {
    const total = agentChanges
    const snapshot = getAgent().snapshot()
    const left = await undoAgent()
    const kept = left.map((entry) => snapshot.find((c) => c.ref === entry.ref)?.label ?? entry.ref)
    push({
      kind: "notice",
      id: itemId("notice"),
      icon: "undo",
      text: kept.length
        ? `Undid the agent’s ${total} changes. ${kept.join(", ")} stays filled — it’s secret, so its old value can’t be read back.`
        : "Undid every change the agent made. Your own edits stay.",
    })
    setToast({
      title: "Agent changes undone",
      detail: kept.length ? `${total - kept.length} of ${total} restored` : `${total} restored`,
    })
  }

  /** ⌘Z / ⌘⇧Z: one step through everything that changed, yours or the agent's. */
  async function step(direction: "back" | "forward") {
    const result = direction === "back" ? await stepBack() : await stepForward()
    if (!result) return
    push(historyNotice(result, direction))
    setToast({ title: direction === "back" ? "Undone" : "Redone", detail: result.text })
  }

  useHistoryShortcuts({
    onUndo: () => step("back"),
    onRedo: () => step("forward"),
    canUndo: editable && canStepBack,
    canRedo: editable && canStepForward,
  })

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = Object.fromEntries(
      [...new FormData(event.currentTarget).entries()].map(([key, value]) => [key, String(value)]),
    )
    setSubmission({ data, byAgent: agentSubmitting.current, agentFields: agentChanges })
    setShowReceipt(true)
  }

  function resetForm() {
    regionRef.current?.reset()
    resetHistory()
    setSubmission(null)
    setShowReceipt(false)
    setItems([])
  }

  const aside = (
    <>
      <DocumentGallery
        documents={documents}
        value={doc.id}
        disabled={Boolean(running)}
        onChange={(id) => setDocId(id)}
      />
      <div className="mt-2 flex h-8 items-center justify-between gap-2 pl-1">
        <span className="min-w-0 truncate font-mono text-[11.5px] text-graphite">{doc.file}</span>
        <Button
          size="sm"
          variant="ghost"
          className="shrink-0"
          aria-pressed={showDocument}
          onClick={() => setShowDocument((open) => !open)}
        >
          {showDocument ? (
            <EyeOffIcon className="size-3.5" aria-hidden="true" />
          ) : (
            <EyeIcon className="size-3.5" aria-hidden="true" />
          )}
          {showDocument ? "Hide" : "View"}
        </Button>
      </div>
      {showDocument ? (
        <div className="mt-1">
          <DocumentPreview doc={doc} />
        </div>
      ) : null}

      <Button variant="signal" size="lg" className="mt-2.5 w-full" disabled={Boolean(running)} onClick={fill}>
        <SparklesIcon className="size-4" aria-hidden="true" />
        {running
          ? "Agent is working…"
          : submission
            ? "Fill the form again"
            : "Fill the form from this document"}
      </Button>
      {status ? (
        <p className="mt-2 text-xs leading-relaxed text-pencil">
          {live ? (
            `${status?.model ?? "The model"} reads the document's text and fills the form through the bridge.`
          ) : (
            <>
              Demo mode replays a recorded run for each document against the real form. Set{" "}
              <code className="font-mono text-[11px]">ANTHROPIC_API_KEY</code> to let the model read them.
            </>
          )}
        </p>
      ) : null}

      <AsideLabel>Agent activity</AsideLabel>
      {items.length === 0 ? (
        <p className="text-[13px] leading-relaxed text-graphite">
          Tool calls show up here: <code className="font-mono text-xs text-signal">snapshot</code> reads
          the form, <code className="font-mono text-xs text-signal">query</code> looks up a list’s
          choices, <code className="font-mono text-xs text-signal">act</code> fills every field in one
          call.
        </p>
      ) : (
        <ChatThread className="-mx-1 min-h-0 flex-1 px-1 pb-2" aria-label="Agent activity">
          <ChatItems items={items} onConfirm={onConfirm} onRetry={fill} working={Boolean(running) && !waiting} />
          </ChatThread>
      )}

      <div className="mt-auto flex gap-2 pt-3">
        <Button
          variant="secondary"
          className="flex-1"
          disabled={!canUndo}
          onClick={undo}
        >
          <Undo2Icon className="size-3.5" aria-hidden="true" />
          Undo agent{agentChanges ? ` (${agentChanges})` : ""}
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          disabled={agentChanges === 0 || Boolean(running) || Boolean(submission)}
          onClick={askToSubmit}
        >
          Ask it to submit
        </Button>
      </div>
    </>
  )

  const footer = submission ? (
    <>
      <p className="flex items-center gap-2 text-[12.5px] text-graphite">
        <CheckIcon className="size-3.5 shrink-0 text-live" aria-hidden="true" />
        Submitted for payment
      </p>
      <Button variant="secondary" onClick={() => setShowReceipt(true)}>
        Back to receipt
      </Button>
    </>
  ) : waiting ? (
    <>
      <p className="flex items-center gap-2 text-[12.5px] text-ink">
        <ShieldAlertIcon className="size-3.5 shrink-0 text-signal" aria-hidden="true" />
        The agent is waiting for you to allow “Submit bill” — answer in the activity panel.
      </p>
      <SubmitButton highlighted />
    </>
  ) : (
    <>
      <p className="flex items-center gap-2 text-[12.5px] text-graphite">
        <LockIcon className="size-3.5 shrink-0" aria-hidden="true" />
        <span>
          Submit needs your approval —{" "}
          <code className="font-mono text-[11.5px]">data-agent-confirm</code>
        </span>
      </p>
      <SubmitButton disabled={running === "fill"} />
    </>
  )

  return (
    <DemoShell
      index="01"
      title="Fill a form from a document"
      badge={<ModelBadge status={status} />}
      aside={aside}
      breadcrumb={[
        "Accounts payable",
        receipt ? `Bill ${submission.data.invoice || "submitted"}` : "New bill",
      ]}
      actions={
        receipt ? (
          <Button size="sm" variant="secondary" onClick={resetForm}>
            New bill
          </Button>
        ) : (
          <>
            {agentChanges > 0 ? (
              <span className="hidden items-center gap-1.5 text-xs text-graphite sm:flex">
                <span className="size-1.5 rounded-full bg-signal" aria-hidden="true" />
                Changed by the agent
              </span>
            ) : null}
            <HistoryButtons
              canUndo={editable && canStepBack}
              canRedo={editable && canStepForward}
              onUndo={() => step("back")}
              onRedo={() => step("forward")}
            />
            <Button size="sm" variant="secondary" disabled={Boolean(running)} onClick={resetForm}>
              Reset
            </Button>
          </>
        )
      }
      footer={receipt ? undefined : footer}
      footerClassName={waiting && !submission ? "!bg-signal-soft !border-[rgb(240_78_31/0.25)]" : undefined}
      overlay={
        running === "fill" ? (
          <WorkingPill>
            Agent is filling the form{agentChanges ? ` · ${agentChanges} changed` : ""}
          </WorkingPill>
        ) : toast ? (
          <SheetToast title={toast.title} detail={toast.detail} />
        ) : null
      }
    >
      {receipt ? <Receipt submission={submission} onView={() => setShowReceipt(false)} onNew={resetForm} /> : null}

      <div className={cn("mx-auto w-full max-w-[600px] px-5 py-9", receipt && "hidden")}>
        <form
          id="bill-form"
          ref={regionRef}
          onSubmit={onSubmit}
          className="grid gap-x-4 gap-y-[18px] sm:grid-cols-2"
        >
          <TextField label="Vendor name" name="vendor" placeholder="Company name" className="sm:col-span-2" />
          <TextField label="Vendor email" name="email" type="email" placeholder="billing@…" />
          <TextField label="Invoice number" name="invoice" placeholder="INV-0000" />
          <DateField label="Invoice date" name="issued" />
          <DateField label="Due date" name="due" />
          <SelectField label="Currency" name="currency" items={currencies} placeholder="Choose currency" />
          <NumberField
            label="Amount"
            name="amount"
            placeholder="0.00"
            min={0}
            step={0.01}
            format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
          />
          <SelectField label="Category" name="category" items={categories} placeholder="Choose category" />
          <TextField
            label="IBAN"
            name="iban"
            placeholder="DE00 0000 0000 0000 0000 00"
            fieldProps={{ "data-agent-secret": true }}
            description="Secret: the agent can type it, never read it back."
          />
          <TextareaField label="Notes" name="notes" placeholder="What is this bill for?" className="sm:col-span-2" />
          <SwitchField
            label="Recurring bill"
            name="recurring"
            description="Create the same bill every month."
            className="sm:col-span-2"
          />
        </form>
      </div>
    </DemoShell>
  )
}

function SubmitButton({ disabled, highlighted }: { disabled?: boolean; highlighted?: boolean }) {
  return (
    <Button
      type="submit"
      form="bill-form"
      disabled={disabled}
      className={cn("max-sm:w-full", highlighted && "ring-4 ring-signal/20")}
      data-agent-confirm="Sends the bill to accounts payable for payment"
    >
      Submit bill
    </Button>
  )
}

function Receipt({
  submission,
  onView,
  onNew,
}: {
  submission: Submission
  onView: () => void
  onNew: () => void
}) {
  const { data, byAgent, agentFields } = submission
  const due = formatDue(data.due)
  const amount = data.amount
    ? `${Number(data.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} ${data.currency || ""}`
    : "—"
  const rows: Array<[string, React.ReactNode, boolean?]> = [
    ["Invoice", data.invoice || "—", true],
    ["Amount", amount, true],
    ["Category", labelOf(categories, data.category)],
    ["Pay to", maskIban(data.iban), true],
    [
      "Filled by",
      agentFields > 0 ? (
        <span className="flex items-center gap-1.5 text-graphite">
          <span className="size-1.5 rounded-full bg-signal" aria-hidden="true" />
          Agent · {agentFields} fields, {byAgent ? "approved by you" : "submitted by you"}
        </span>
      ) : (
        "You"
      ),
    ],
  ]
  return (
    <div className="grid min-h-full place-items-center px-5 py-12">
      <div className="w-full max-w-[520px] text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-[14px] bg-live-soft shadow-[inset_0_0_0_1px_rgb(31_193_107/0.3)]">
          <CheckIcon className="size-5 text-live-ink" strokeWidth={2.2} aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-[22px] font-semibold tracking-[-0.02em]">Bill submitted for payment</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-graphite">
          {data.vendor || "The vendor"}
          {due ? ` · due ${due}` : ""}.
          <br />
          {byAgent
            ? "You approved the submit; the agent only filled the form."
            : "You submitted it yourself."}
        </p>
        <dl className="mt-6 rounded-[14px] px-4 py-1.5 text-left text-[13px] shadow-[inset_0_0_0_1px_var(--hairline)]">
          {rows.map(([label, value, mono]) => (
            <div key={label} className="flex justify-between gap-4 border-b border-[#f3f3f3] py-2.5 last:border-0">
              <dt className="text-graphite">{label}</dt>
              <dd className={cn("text-right", mono && "font-mono text-[12.5px]")}>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="secondary" onClick={onView}>
            View the bill
          </Button>
          <Button onClick={onNew}>Enter another bill</Button>
        </div>
      </div>
    </div>
  )
}

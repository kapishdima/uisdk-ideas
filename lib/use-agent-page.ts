"use client"

import { createHistory, describeEntry, type HistoryEntry } from "@ui-sdk/react/history"
import { elementOf } from "@ui-sdk/react/observe"
import { useCallback, useEffect, useRef, useState } from "react"
import { getAgent } from "./agent"

type History = ReturnType<typeof createHistory>

/** Attributes the page puts on fields to show what the agent did or sees. */
const MARKS = {
  /** A step on this field failed; the value is the message. */
  error: "data-agent-error",
  /** A neutral note under the field, like "kept: a secret can't be restored". */
  note: "data-agent-note",
  /** The ref the agent knows the component by, shown after /snapshot. */
  ref: "data-agent-ref",
  /** The person is mentioning this control in the composer. */
  mentioned: "data-agent-mentioned",
} as const

type Mark = keyof typeof MARKS

/** One step back or forward: a single change of yours, or one agent run. */
export type HistoryStep = {
  who: "you" | "agent"
  /** What changed, like "Region: Tokyo → Frankfurt" or "Vendor name, Amount and 8 more". */
  text: string
  /** How many changes the step covered. */
  count: number
  /** Labels of changes that couldn't be put back, like a secret field. */
  kept: string[]
}

/** The visible control for a component: an input, a trigger, a switch. */
function controlOf(element: HTMLElement) {
  return element.matches("input, textarea, button, [data-slot='select-trigger']")
    ? element
    : (element.querySelector<HTMLElement>(
        "[data-slot='select-trigger'], [data-slot='date-picker-input'], [data-slot='number-input-group'], input, textarea, [data-slot='switch']",
      ) ?? element)
}

function elementFor(ref: string) {
  try {
    return elementOf(ref) ?? null
  } catch {
    return null
  }
}

/** A value as the person would read it: a list's label, on/off, or "hidden" for a secret. */
function readable(entry: HistoryEntry, value: unknown) {
  if (entry.redacted) return "hidden"
  if (typeof value === "boolean") return value ? "on" : "off"
  if (value === null || value === undefined || value === "") return "empty"
  const component = getAgent()
    .snapshot()
    .find((item) => item.ref === entry.ref)
  const choice = component?.items?.find((item) => item.value === value)?.label
  if (choice) return choice
  if (typeof value === "number") return value.toLocaleString("en-US")
  return typeof value === "string" ? value : JSON.stringify(value)
}

function describeStep(run: HistoryEntry[], back: boolean): string {
  if (run.length === 1) {
    const [entry] = run
    const [from, to] = back ? [entry.value, entry.previous] : [entry.previous, entry.value]
    return `${entry.label}: ${readable(entry, from)} → ${readable(entry, to)}`
  }
  const labels = [...new Set(run.map((entry) => entry.label))]
  return labels.length > 3
    ? `${labels.slice(0, 2).join(", ")} and ${labels.length - 2} more`
    : labels.join(", ")
}

/**
 * Wires a page region to the agent bridge:
 * - highlights controls the agent changed (`data-agent-touched`),
 * - records a history scoped to the region, so the agent's edits can be undone,
 * - marks fields with errors, notes, refs and mentions.
 */
export function useAgentPage<T extends HTMLElement>() {
  const regionRef = useRef<T>(null)
  const historyRef = useRef<History | null>(null)
  const [entries, setEntries] = useState<string[]>([])
  const [agentChanges, setAgentChanges] = useState(0)
  const [steps, setSteps] = useState({ back: false, forward: false })

  /** The element to mark for a component: its Field when it has one. */
  const fieldElement = useCallback((refOrLabel: string) => {
    const entry = getAgent()
      .snapshot()
      .find((component) => component.ref === refOrLabel || component.label === refOrLabel)
    if (!entry || entry.offPage) return null
    let element: HTMLElement
    try {
      element = elementOf(entry.ref)
    } catch {
      return null
    }
    if (!element || !regionRef.current?.contains(element)) return null
    return element.closest<HTMLElement>("[data-slot='field']") ?? element
  }, [])

  const clearMark = useCallback((mark: Mark) => {
    regionRef.current
      ?.querySelectorAll(`[${MARKS[mark]}]`)
      .forEach((element) => element.removeAttribute(MARKS[mark]))
  }, [])

  const setMark = useCallback(
    (mark: Mark, refOrLabel: string, value: string) => {
      fieldElement(refOrLabel)?.setAttribute(MARKS[mark], value)
    },
    [fieldElement],
  )

  useEffect(() => {
    const agent = getAgent()
    const history = createHistory(agent, { within: () => regionRef.current })
    historyRef.current = history

    const stopHistory = history.subscribe(() => {
      const applied = history.entries().slice(0, history.position())
      setEntries(applied.filter((entry) => !entry.reverted).map(describeEntry))
      setAgentChanges(
        applied.filter((entry) => entry.source === "agent" && !entry.reverted).length,
      )
      const ahead = history.entries().slice(history.position())
      setSteps({
        back: applied.some((entry) => !entry.reverted && !entry.redacted),
        forward: ahead.some((entry) => !entry.reverted && !entry.redacted),
      })
    })

    const stopHighlights = agent.subscribe((change) => {
      if (!change.ref) return
      let element: HTMLElement | null = null
      try {
        element = elementOf(change.ref)
      } catch {
        return
      }
      if (!element || !regionRef.current?.contains(element)) return
      // A new value clears an error or note on that field.
      const field = element.closest("[data-slot='field']") ?? element
      field.removeAttribute(MARKS.error)
      field.removeAttribute(MARKS.note)
      const target = controlOf(element)
      if (change.source === "agent") target.setAttribute("data-agent-touched", "")
      else target.removeAttribute("data-agent-touched")
    })

    return () => {
      stopHistory()
      stopHighlights()
      history.destroy()
      historyRef.current = null
    }
  }, [])

  const clearHighlights = useCallback(() => {
    regionRef.current
      ?.querySelectorAll("[data-agent-touched]")
      .forEach((element) => element.removeAttribute("data-agent-touched"))
  }, [])

  /**
   * Highlights exactly the controls whose current value the agent set. History
   * restores values through the bridge, so after a step the marks are redrawn
   * from the entries instead of from the changes it made.
   */
  const syncHighlights = useCallback(() => {
    const history = historyRef.current
    clearHighlights()
    if (!history) return
    const latest = new Map<string, HistoryEntry>()
    for (const entry of history.entries().slice(0, history.position())) {
      if (!entry.reverted) latest.set(entry.ref, entry)
    }
    for (const [ref, entry] of latest) {
      if (entry.source !== "agent") continue
      const element = elementFor(ref)
      if (element && regionRef.current?.contains(element)) {
        controlOf(element).setAttribute("data-agent-touched", "")
      }
    }
  }, [clearHighlights])

  /**
   * Steps back through everything that changed, whoever changed it: one change
   * of yours, or the agent's whole run, since that's one request.
   */
  const stepBack = useCallback(async (): Promise<HistoryStep | null> => {
    const history = historyRef.current
    if (!history) return null
    const list = history.entries()
    const from = history.position()
    let to = from
    // Already-undone and secret entries can't be stepped over on their own.
    while (to > 0 && (list[to - 1].reverted || list[to - 1].redacted)) to--
    if (to === 0) return null
    const who = list[to - 1].source === "agent" ? "agent" : "you"
    to--
    if (who === "agent") {
      while (to > 0 && (list[to - 1].source === "agent" || list[to - 1].reverted)) to--
    }
    const run = list.slice(to, from).filter((entry) => !entry.reverted)
    const failed = await history.seek(to)
    syncHighlights()
    clearMark("error")
    clearMark("note")
    for (const step of failed) setMark("note", step.ref, "Kept: a secret value can’t be restored.")
    return {
      who,
      text: describeStep(run, true),
      count: run.length,
      kept: failed.map((step) => run.find((entry) => entry.ref === step.ref)?.label ?? step.ref),
    }
  }, [clearMark, setMark, syncHighlights])

  /** Puts back what `stepBack` took away, one step at a time. */
  const stepForward = useCallback(async (): Promise<HistoryStep | null> => {
    const history = historyRef.current
    if (!history) return null
    const list = history.entries()
    const from = history.position()
    let to = from
    while (to < list.length && (list[to].reverted || list[to].redacted)) to++
    if (to === list.length) return null
    const who = list[to].source === "agent" ? "agent" : "you"
    to++
    if (who === "agent") {
      while (to < list.length && (list[to].source === "agent" || list[to].reverted)) to++
    }
    const run = list.slice(from, to).filter((entry) => !entry.reverted)
    await history.seek(to)
    syncHighlights()
    clearMark("note")
    // A secret that stayed when stepping back is already what this step sets.
    return { who, text: describeStep(run, false), count: run.length, kept: [] }
  }, [clearMark, syncHighlights])

  /** Reverts what the agent changed and notes the fields it couldn't put back. */
  const undoAgent = useCallback(async () => {
    const left = (await historyRef.current?.undoSource("agent")) ?? []
    clearHighlights()
    clearMark("error")
    clearMark("note")
    for (const entry of left) {
      setMark("note", entry.ref, "Kept: a secret value can’t be restored.")
    }
    return left
  }, [clearHighlights, clearMark, setMark])

  const resetHistory = useCallback(() => {
    historyRef.current?.clear()
    clearHighlights()
    for (const mark of Object.keys(MARKS) as Mark[]) clearMark(mark)
  }, [clearHighlights, clearMark])

  /** Shows the failed step's message under its field. */
  const markError = useCallback(
    (refOrLabel: string, message: string) => setMark("error", refOrLabel, message),
    [setMark],
  )

  /** Labels each component with the ref the agent reads it by. */
  const showRefs = useCallback(() => {
    clearMark("ref")
    for (const component of getAgent().snapshot()) {
      if (component.offPage || component.component === "more") continue
      setMark("ref", component.ref, component.confirm ? `${component.ref} · confirm` : component.ref)
    }
  }, [clearMark, setMark])

  /** Outlines the controls the person is mentioning with @. */
  const markMentions = useCallback(
    (labels: string[]) => {
      clearMark("mentioned")
      for (const label of labels) setMark("mentioned", label, `@${label}`)
    },
    [clearMark, setMark],
  )

  return {
    regionRef,
    entries,
    agentChanges,
    undoAgent,
    stepBack,
    stepForward,
    canStepBack: steps.back,
    canStepForward: steps.forward,
    resetHistory,
    clearHighlights,
    markError,
    clearMark,
    showRefs,
    markMentions,
  }
}

"use client"

import { createAgent, type AgentAction } from "@ui-sdk/react/agent"

/**
 * One ui-sdk agent bridge for the whole app.
 *
 * The bridge is plain client-side JS: it finds every ui-sdk component on the
 * page and lets a model read (`snapshot`, `query`) and change (`act`) them.
 * Each demo plugs its own confirmation UI in through `setConfirmHandler`.
 */

type ConfirmHandler = (step: AgentAction, signal: AbortSignal) => Promise<boolean>

let confirmHandler: ConfirmHandler | null = null

export function setConfirmHandler(handler: ConfirmHandler | null) {
  confirmHandler = handler
  return () => {
    if (confirmHandler === handler) confirmHandler = null
  }
}

function makeAgent() {
  return createAgent({
    // Steps on controls marked with data-agent-confirm wait for the person.
    // Everything else runs right away.
    allow: (step, { signal }) => {
      if (!step.confirm) return true
      if (!confirmHandler) return false
      return confirmHandler(step, signal)
    },
  })
}

export type Agent = ReturnType<typeof makeAgent>

let instance: Agent | null = null

export function getAgent(): Agent {
  if (typeof window === "undefined") {
    throw new Error("The agent bridge only runs in the browser")
  }
  instance ??= makeAgent()
  return instance
}

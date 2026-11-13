"use client"

import { useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from "react"
import { setConfirmHandler } from "@/lib/agent"
import { itemId, type ChatItem } from "./model"

/**
 * Turns the bridge's confirmation requests (controls marked with
 * data-agent-confirm) into ConfirmCards in the thread, and resolves the
 * step with the person's answer.
 */
export function useAgentConfirm(setItems: Dispatch<SetStateAction<ChatItem[]>>) {
  const pending = useRef(new Map<string, (approved: boolean) => void>())

  useEffect(() => {
    const waiting = pending.current
    const stop = setConfirmHandler((step, signal) => {
      const id = itemId("confirm")
      const target = typeof step.args?.[0] === "string" ? step.args[0] : (step.label ?? step.ref)
      setItems((items) => [
        ...items,
        { kind: "confirm", id, text: step.confirm ?? "", target, status: "pending" },
      ])
      return new Promise<boolean>((resolve) => {
        waiting.set(id, resolve)
        signal.addEventListener("abort", () => {
          waiting.delete(id)
          resolve(false)
        })
      })
    })
    return () => {
      stop()
      waiting.forEach((resolve) => resolve(false))
      waiting.clear()
    }
  }, [setItems])

  return useCallback(
    (id: string, approved: boolean) => {
      pending.current.get(id)?.(approved)
      pending.current.delete(id)
      setItems((items) =>
        items.map((item) =>
          item.kind === "confirm" && item.id === id
            ? { ...item, status: approved ? "approved" : "denied" }
            : item,
        ),
      )
    },
    [setItems],
  )
}

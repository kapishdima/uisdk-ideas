"use client"

import { useEffect, useRef, useSyncExternalStore } from "react"

const noop = () => () => {}

/** "⌘" on Apple devices, "Ctrl" elsewhere. Renders "⌘" on the server, then corrects after hydration. */
export function useModKey() {
  return useSyncExternalStore(
    noop,
    () => (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? "⌘" : "Ctrl"),
    () => "⌘",
  )
}

/** A text field with something in it, where ⌘Z should keep undoing typing. */
function editsText(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return Boolean(target.textContent)
  if (target instanceof HTMLTextAreaElement) return target.value !== ""
  if (target instanceof HTMLInputElement) {
    const textLike = !["checkbox", "radio", "button", "submit", "reset", "file", "range", "color"].includes(target.type)
    return textLike && target.value !== ""
  }
  return false
}

/**
 * ⌘Z / Ctrl+Z steps back, ⌘⇧Z / Ctrl+Y steps forward. Inside a text field
 * that has text, the browser's own undo wins, so typing undoes like it always does.
 */
export function useHistoryShortcuts({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: {
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}) {
  const latest = useRef({ onUndo, onRedo, canUndo, canRedo })
  useEffect(() => {
    latest.current = { onUndo, onRedo, canUndo, canRedo }
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.altKey) return
      if (!(event.metaKey || event.ctrlKey)) return
      const key = event.key.toLowerCase()
      const redo = (key === "z" && event.shiftKey) || (key === "y" && event.ctrlKey && !event.metaKey)
      const undo = key === "z" && !event.shiftKey
      if (!undo && !redo) return
      if (editsText(event.target)) return
      const current = latest.current
      if (undo && !current.canUndo) return
      if (redo && !current.canRedo) return
      event.preventDefault()
      if (undo) current.onUndo()
      else current.onRedo()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])
}

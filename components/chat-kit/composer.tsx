"use client"

import {
  type TriggerDefinition,
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuEmpty,
  TriggerMenuInput,
  TriggerMenuItem,
  TriggerMenuList,
  TriggerMenuStatus,
} from "@ui-sdk/react/trigger-menu"
import { ArrowUpIcon, AtSignIcon } from "lucide-react"
import { useMemo, useRef, useState, type KeyboardEvent } from "react"
import { Button, cn } from "@/components/ui/fields"

export type ComposerCommand = { value: string; description: string }

/**
 * Message box with @-mentions and /-commands, built on ui-sdk's Trigger Menu.
 * `mentions` is called as the person types after "@", so it can read the page.
 */
export function ChatComposer({
  onSend,
  mentions,
  commands = [],
  disabled,
  placeholder = "Ask the agent · @ mention · / command",
  onMentions,
}: {
  onSend: (text: string) => void
  mentions?: (query: string) => string[]
  /** The controls mentioned in the message so far, plus the one highlighted in the @ menu. */
  onMentions?: (labels: string[]) => void
  commands?: ComposerCommand[]
  disabled?: boolean
  placeholder?: string
}) {
  const formRef = useRef<HTMLFormElement>(null)
  /** The menu opens over the whole composer, like the command list in Claude Code. */
  const [anchor, setAnchor] = useState<HTMLFormElement | null>(null)

  const triggers = useMemo<TriggerDefinition[]>(() => {
    const list: TriggerDefinition[] = []
    if (mentions) {
      list.push({
        char: "@",
        type: "mention",
        items: async (query: string) =>
          mentions(query).map((label) => ({ value: label, label })),
      })
    }
    if (commands.length) {
      list.push({
        char: "/",
        type: "command",
        boundary: "start",
        items: commands.map((command) => ({
          value: command.value,
          label: command.value,
          after: "submit" as const,
        })),
      })
    }
    return list
  }, [mentions, commands])

  const describe = useMemo(
    () => new Map(commands.map((command) => [command.value, command.description])),
    [commands],
  )

  /** The control the open @ menu points at, while it's open. */
  const pendingMention = useRef<string | undefined>(undefined)

  /** Reports every @Label in the text, plus the one the open menu points at. */
  function syncMentions() {
    if (!onMentions || !mentions) return
    const pending = pendingMention.current
    const field = formRef.current?.elements.namedItem("message") as HTMLTextAreaElement | null
    const text = field?.value ?? ""
    const labels = mentions("").filter((label) => text.includes(`@${label}`))
    onMentions(pending && !labels.includes(pending) ? [...labels, pending] : labels)
  }

  function submit(event?: { preventDefault(): void }) {
    event?.preventDefault()
    const form = formRef.current
    if (!form || disabled) return
    const text = String(new FormData(form).get("message") ?? "").trim()
    if (!text) return
    onSend(text)
    form.reset()
    onMentions?.([])
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return
    // While the suggestions are open, Enter picks one instead of sending.
    if (event.defaultPrevented || event.currentTarget.getAttribute("aria-controls")) return
    event.preventDefault()
    submit()
  }

  return (
    <form
      ref={(node) => {
        formRef.current = node
        setAnchor(node)
      }}
      onSubmit={submit}
      className="flex items-end gap-2 rounded-[14px] bg-sheet p-1.5 shadow-sheet transition focus-within:shadow-[0_0_0_1px_var(--ink),0_0_0_4px_rgb(23_23_23/0.06)]"
    >
      <TriggerMenu
        triggers={triggers}
        onQueryChange={(query, details) => {
          if (details.trigger !== "@") return
          pendingMention.current = mentions?.(query)[0]
          syncMentions()
        }}
        onOpenChange={(open) => {
          if (open) return
          pendingMention.current = undefined
          setTimeout(() => syncMentions())
        }}
      >
        <TriggerMenuInput
          name="message"
          aria-label="Message"
          placeholder={placeholder}
          rows={1}
          onKeyDown={onKeyDown}
          onInput={() => syncMentions()}
          className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-[13px] outline-none placeholder:text-pencil"
        />
        <div className="sr-only">
          <TriggerMenuStatus />
        </div>
        <TriggerMenuContent
          anchor={anchor ?? undefined}
          side="top"
          align="start"
          sideOffset={6}
          className="w-[var(--anchor-width)]"
        >
          <TriggerMenuEmpty>Nothing matches</TriggerMenuEmpty>
          <TriggerMenuList>
            {(state) =>
              (state.items as TriggerMenuDataItem[]).map((item) => {
                const description = describe.get(String(item.value))
                return state.trigger === "/" ? (
                  <TriggerMenuItem
                    key={String(item.value)}
                    value={item.value}
                    label={item.label}
                    className="group !justify-start !gap-0"
                  >
                    <span className="w-24 shrink-0 font-mono text-[12.5px] text-ink group-data-[highlighted]:text-signal">
                      /{item.label}
                    </span>
                    <span className="min-w-0 truncate text-[12.5px] text-graphite">{description}</span>
                  </TriggerMenuItem>
                ) : (
                  <TriggerMenuItem
                    key={String(item.value)}
                    value={item.value}
                    label={item.label}
                    className="!justify-start"
                  >
                    <AtSignIcon className="size-3.5 shrink-0 text-signal" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </TriggerMenuItem>
                )
              })
            }
          </TriggerMenuList>
        </TriggerMenuContent>
      </TriggerMenu>
      <Button
        type="submit"
        aria-label="Send"
        disabled={disabled}
        size="sm"
        className={cn("size-8 shrink-0 !px-0")}
      >
        <ArrowUpIcon className="size-4" />
      </Button>
    </form>
  )
}

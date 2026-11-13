"use client"

import type Anthropic from "@anthropic-ai/sdk"
import type { DemoId } from "./prompts"
import { getAgent } from "./agent"

export type MessageParam = Anthropic.Beta.BetaMessageParam
type ContentBlock = Anthropic.Beta.BetaContentBlock
type ToolResult = Anthropic.Beta.BetaToolResultBlockParam

export type ToolName = "snapshot" | "act" | "query"

export type AgentEvent =
  | { type: "text"; text: string }
  | { type: "tool-call"; id: string; name: string; input: unknown }
  | { type: "tool-result"; id: string; output: unknown; isError: boolean }

/** Runs one tool call against the page through the ui-sdk bridge. */
export async function runTool(name: string, input: unknown) {
  const agent = getAgent()
  try {
    switch (name) {
      case "snapshot":
        return { output: agent.snapshot(), isError: false }
      case "act": {
        const output = await agent.act(input as Parameters<typeof agent.act>[0])
        return { output, isError: output.ok === false }
      }
      case "query":
        return {
          output: await agent.query(input as Parameters<typeof agent.query>[0]),
          isError: false,
        }
      default:
        return { output: `Unknown tool: ${name}`, isError: true }
    }
  } catch (error) {
    return { output: error instanceof Error ? error.message : String(error), isError: true }
  }
}

/** The model request failed; nothing on the page changed in that turn. */
export class AgentRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "AgentRequestError"
  }

  get title() {
    if (this.status === 429) return "The model is busy right now"
    if (this.status === 503) return "No model is set up"
    if (this.status === 401 || this.status === 403) return "The API key was refused"
    return "The request failed"
  }
}

/** A title and a sentence for any error a run can throw. */
export function describeRunError(error: unknown) {
  if (error instanceof AgentRequestError) return { title: error.title, text: error.message }
  if (error instanceof TypeError) return { title: "Can't reach the server", text: "Check your connection and try again." }
  return { title: "Something went wrong", text: error instanceof Error ? error.message : String(error) }
}

let idCounter = 0
const nextId = () => `local_${++idCounter}`

/**
 * The agent loop, with the model behind /api/agent and the tools in the page.
 * Returns the conversation with Claude's turns and the tool results appended.
 */
export async function runAgent(options: {
  demo: DemoId
  messages: MessageParam[]
  onEvent: (event: AgentEvent) => void
  signal?: AbortSignal
  maxTurns?: number
}): Promise<MessageParam[]> {
  const messages = [...options.messages]

  for (let turn = 0; turn < (options.maxTurns ?? 10); turn++) {
    const response = await fetch("/api/agent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ demo: options.demo, messages }),
      signal: options.signal,
    })
    const data = (await response.json()) as
      | { content: ContentBlock[]; stop_reason: string | null }
      | { error: string }

    if ("error" in data) throw new AgentRequestError(data.error, response.status)

    // Pass Claude's content back unchanged (thinking blocks included).
    messages.push({ role: "assistant", content: data.content } as MessageParam)

    const toolUses = data.content.filter(
      (block): block is Anthropic.Beta.BetaToolUseBlock => block.type === "tool_use",
    )
    for (const block of data.content) {
      if (block.type === "text" && block.text.trim()) {
        options.onEvent({ type: "text", text: block.text })
      }
    }

    if (data.stop_reason === "refusal") throw new Error("The model declined this request.")
    if (data.stop_reason !== "tool_use" || toolUses.length === 0) break

    const results: ToolResult[] = []
    for (const use of toolUses) {
      options.onEvent({ type: "tool-call", id: use.id, name: use.name, input: use.input })
      const { output, isError } = await runTool(use.name, use.input)
      options.onEvent({ type: "tool-result", id: use.id, output, isError })
      results.push({
        type: "tool_result",
        tool_use_id: use.id,
        content: JSON.stringify(output),
        is_error: isError || undefined,
      })
    }
    messages.push({ role: "user", content: results })
  }

  return messages
}

/** A recorded run: real tool calls against the page, with the model's words written ahead of time. */
export type Script = Array<
  { say: string } | { tool: ToolName; input?: unknown }
>

/** Plays a script through the same bridge and events as a live run. */
export async function runScript(
  script: Script,
  onEvent: (event: AgentEvent) => void,
  { delay = 450 }: { delay?: number } = {},
) {
  const wait = () => new Promise((resolve) => setTimeout(resolve, delay))
  for (const step of script) {
    await wait()
    if ("say" in step) {
      onEvent({ type: "text", text: step.say })
      continue
    }
    const id = nextId()
    const input = step.input ?? {}
    onEvent({ type: "tool-call", id, name: step.tool, input })
    const { output, isError } = await runTool(step.tool, input)
    onEvent({ type: "tool-result", id, output, isError })
    if (isError) break
  }
}

export async function fetchModelStatus(): Promise<{ configured: boolean; model: string }> {
  try {
    const response = await fetch("/api/agent")
    return await response.json()
  } catch {
    return { configured: false, model: "" }
  }
}

import Anthropic from "@anthropic-ai/sdk"
import { agentTools } from "@ui-sdk/core/agent"
import { SYSTEM_PROMPTS, type DemoId } from "@/lib/prompts"

/**
 * One model turn of the agent loop.
 *
 * The tools (snapshot / act / query) run in the browser, where the ui-sdk
 * bridge lives. So the browser owns the loop: it posts the conversation here,
 * gets Claude's reply, runs any tool calls against the page and posts again.
 * The API key never leaves the server.
 */

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5"

const tools: Anthropic.Beta.BetaTool[] = agentTools.map((tool) => ({
  name: tool.name,
  description: tool.description,
  input_schema: tool.inputSchema as Anthropic.Beta.BetaTool.InputSchema,
}))

function isConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN)
}

export async function GET() {
  return Response.json({ configured: isConfigured(), model: MODEL })
}

export async function POST(request: Request) {
  if (!isConfigured()) {
    return Response.json(
      { error: "Set ANTHROPIC_API_KEY in .env.local to use a live model." },
      { status: 503 },
    )
  }

  const body = (await request.json()) as {
    demo: DemoId
    messages: Anthropic.Beta.BetaMessageParam[]
  }

  const system = SYSTEM_PROMPTS[body.demo]
  if (!system || !Array.isArray(body.messages)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  const client = new Anthropic()

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system,
      tools,
      messages: body.messages,
      output_config: { effort: "low" },
      // Re-runs a declined request on a fallback model inside the same call.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      // The document is resent on every loop turn; cache the prefix.
      cache_control: { type: "ephemeral" },
    })

    return Response.json({
      content: response.content,
      stop_reason: response.stop_reason,
    })
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "Rate limited, try again in a moment." }, { status: 429 })
    }
    if (error instanceof Anthropic.APIError) {
      return Response.json({ error: error.message }, { status: error.status ?? 500 })
    }
    throw error
  }
}

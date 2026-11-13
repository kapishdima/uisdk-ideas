<p align="center">
  <img src="docs/hero.png" alt="ui-sdk ideas — Ideas for interfaces agents can operate. An agent fills a bill form, its tool calls snapshot, query and act are listed, and it waits for approval before pressing Submit bill." width="100%" />
</p>

<p align="center">
  <a href="https://github.com/kapishdima/uisdk-ideas/stargazers"><img src="https://shieldcn.dev/github/stars/kapishdima/uisdk-ideas.svg?variant=branded&mode=light" alt="GitHub stars" /></a>
  <a href="https://ui-sdk.dev/docs"><img src="https://shieldcn.dev/badge/ui--sdk-0.1.0--beta.1.svg?variant=branded&logo=ri:LuBlocks&mode=light" alt="ui-sdk 0.1.0-beta.1" /></a>
  <a href="https://www.anthropic.com/claude"><img src="https://shieldcn.dev/badge/claude-opus_5.5.svg?variant=branded&logo=claude&mode=light" alt="Claude Opus 5.5" /></a>
  <a href="https://x.com/kapish_dima"><img src="https://shieldcn.dev/badge/follow-@kapish__dima.svg?variant=secondary&logo=x&mode=light" alt="Follow @kapish_dima on X" /></a>
  <br />
  <img src="https://shieldcn.dev/badge/next.js-16.4.svg?variant=branded&logo=nextdotjs&mode=light" alt="Next.js 16.4" />
  <img src="https://shieldcn.dev/badge/react-19.3.svg?variant=branded&logo=react&mode=light" alt="React 19.3" />
  <img src="https://shieldcn.dev/badge/typescript-5.x.svg?variant=branded&logo=typescript&mode=light" alt="TypeScript 5" />
  <img src="https://shieldcn.dev/badge/tailwind_css-4.3.svg?variant=branded&logo=tailwindcss&mode=light" alt="Tailwind CSS 4.3" />
  <img src="https://shieldcn.dev/badge/demo_mode-no_API_key_needed.svg?variant=outline&mode=light" alt="Demo mode: no API key needed" />
</p>

# ui-sdk ideas

Working demos of interfaces an AI agent can operate, built on [ui-sdk](https://ui-sdk.dev/docs).

Every ui-sdk component on the page joins an **agent bridge**. A model reads the UI with `snapshot()`, looks up a list's choices with `query()` and changes it with `act()`. It goes through the components' own APIs, not through DOM clicks or screenshots. So the page always knows what the agent did: it highlights those changes, can undo them, and asks the person before anything that needs approval.

## Demos

### 01 · Fill a form from a document

<img src="docs/form-from-document.png" alt="The form demo: a gallery of four sample documents on the left, the agent's tool calls under it, and a New bill form on the right with the fields the agent filled highlighted." width="100%" />

Pick one of four sample documents and the agent fills a **New bill** form from it in one `act()` call.

- **Four documents in different shapes:** an invoice in EUR, a USD subscription paid by card (no IBAN, recurring), a hotel folio in GBP that's "due on receipt", and a hardware invoice in UAH.
- **Highlights:** every field the agent changed is tinted, and the header says "Changed by the agent".
- **Undo:** `⌘Z` steps back through everything that changed, yours or the agent's. The agent's whole run counts as one step. "Undo agent" reverts only the agent and keeps your edits. A field marked `data-agent-secret` (the IBAN) can be typed by the agent but never read back, so it isn't restored.
- **Approval:** "Submit bill" carries `data-agent-confirm`. When the agent tries to press it, the page asks you first.
- **Failures:** if a step fails, the field shows the bridge's error and the tool call says where it stopped.

### 02 · Chat UI kit

<img src="docs/chat-ui-kit.png" alt="The chat demo: a conversation with the agent on the left, the slash-command menu open over the composer, and a project settings screen on the right where the agent changed the name and region." width="100%" />

A chat kit made of ui-sdk parts, driving the settings screen next to it.

- **Composer:** `@` mentions the controls the agent can see and outlines the one you mean on the page. `/undo`, `/snapshot` and `/clear` open as a command list, like in Claude Code.
- **Tool calls** show as a chain: one link per call, with its steps, and its input and output on click.
- **Approvals:** "Delete project" needs your answer in the chat.
- **Your edits count:** in live mode, controls you changed by hand go to the model as context with your next message.

## Up next

| | Idea |
| --- | --- |
| 03 | **Semantic session replay.** Record "chose Region = Europe", not DOM diffs, and replay it with `act()`. |
| 04 | **Filters in plain words.** One sentence sets the Select, Date Picker and Slider on a dashboard. |
| 05 | **Undo only the agent.** An app-wide history where `⌘Z` reverts the agent and keeps your edits. |
| 06 | **Your site, ready for WebMCP.** One line lets the browser's own agent use your forms; the person brings the model. |

## Run it

```bash
bun install
bun dev
```

Open http://localhost:3000.

Without an API key, the demos run in **demo mode**. The recorded runs make the same real tool calls against the page; only the model's replies are scripted. To talk to a live model, create `.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-...
# optional, defaults to claude-opus-5-5
# ANTHROPIC_MODEL=claude-haiku-5-5
```

## How it fits together

```
browser                                            server
───────                                            ──────
lib/run-agent.ts ───── conversation ───────────▶  app/api/agent/route.ts
       ▲                                           one Claude turn with agentTools
       └──── tool_use: snapshot · query · act ◀──
       │
       ▼
lib/agent.ts          createAgent({ allow })  ──▶  ui-sdk components on the page
                                                   data-agent-confirm → asks the person
lib/use-agent-page.ts createHistory           ──▶  highlights · ⌘Z / ⌘⇧Z · undoSource("agent")
```

- `lib/agent.ts` holds the single `createAgent()` bridge. Its `allow` callback sends steps marked `data-agent-confirm` to the page's approval UI.
- `app/api/agent/route.ts` handles one model turn and passes `agentTools` to Claude. The API key stays on the server.
- `lib/run-agent.ts` runs the loop in the browser: it posts the conversation, runs the returned tool calls on the page through the bridge, and repeats.
- `lib/use-agent-page.ts` scopes `createHistory` to a region. That powers undo and redo, "Undo agent", and the highlights on the controls the agent changed.
- `components/chat-kit/` is the chat kit: thread, tool-call chain, approval card and composer.
- `components/ui/fields.tsx` has styled wrappers over ui-sdk components, shadcn-style.
- `components/demo-shell.tsx` is the layout both demos share: the agent's column on the left, the app on a white sheet.
- `components/showcase/previews.tsx` draws the small previews on the showcase cards.

import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react"
import Link from "next/link"
import type { ComponentType, ReactNode } from "react"
import {
  ChatPreview,
  FiltersPreview,
  FormPreview,
  ReplayPreview,
  UndoPreview,
  WebMcpPreview,
} from "@/components/showcase/previews"

type Idea = {
  index: string
  title: string
  text: string
  preview: ComponentType
}

const live: Array<Idea & { href: string; tags: string[] }> = [
  {
    index: "01",
    href: "/form-from-document",
    title: "Fill a form from a document",
    text: "Pick an invoice, a subscription or a hotel folio. The agent reads it and fills every field in one call — you see what changed, undo it, and approve the submit.",
    tags: ["act()", "data-agent-secret", "undoSource"],
    preview: FormPreview,
  },
  {
    index: "02",
    href: "/chat-ui-kit",
    title: "Chat UI kit",
    text: "A composer with @-mentions and /-commands, tool-call cards and approvals — all ui-sdk parts — driving the settings screen next to it.",
    tags: ["Trigger Menu", "allow()", "subscribe()"],
    preview: ChatPreview,
  },
]

const upNext: Idea[] = [
  {
    index: "03",
    title: "Semantic session replay",
    text: "Record “chose Region = Europe”, not DOM diffs. Replay it with act().",
    preview: ReplayPreview,
  },
  {
    index: "04",
    title: "Filters in plain words",
    text: "One sentence sets the Select, Date Picker and Slider on a dashboard.",
    preview: FiltersPreview,
  },
  {
    index: "05",
    title: "Undo only the agent",
    text: "An app-wide history where ⌘Z reverts the agent and keeps your edits.",
    preview: UndoPreview,
  },
  {
    index: "06",
    title: "Your site, ready for WebMCP",
    text: "One line lets the browser’s own agent use your forms — the person brings the model.",
    preview: WebMcpPreview,
  },
]

function Well({ height, children }: { height: string; children: ReactNode }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-well shadow-[inset_0_0_0_1px_#EFEFEF] ${height}`}
    >
      <div className="dot-grid absolute inset-0 opacity-70" aria-hidden="true" />
      {/* Its own layer above the grid: the absolute grid would otherwise paint over unpositioned content. */}
      <div className="relative h-full">{children}</div>
    </div>
  )
}

/** The "UI" letters of the ui-sdk wordmark, from ui-sdk.dev. */
const uiSdkMark =
  "M7 3.64H22.08V55.724C22.08 67.904 28.692 74.284 40.988 74.284C53.284 74.284 59.896 67.904 59.896 55.724V3.64H74.976V56.188C74.976 76.372 62.448 87.392 40.988 87.392C19.528 87.392 7 76.372 7 56.188V3.64ZM130.894 3.64V16.748H117.67V72.892H131.59V86H88.5544V72.892H102.59V16.748H89.2504V3.64H130.894Z"

/** ui-sdk named inline in text: its mark and name in a pill, linking to the docs site. */
function UiSdkBadge() {
  return (
    <a
      href="https://ui-sdk.dev"
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-6 translate-y-[-1px] items-center gap-1.5 rounded-md bg-sheet py-0.5 pr-2 pl-0.5 align-middle text-[13.5px] leading-none font-semibold text-ink shadow-[inset_0_0_0_1px_var(--hairline),0_1px_2px_rgb(10_13_20/0.05)] transition hover:bg-well"
    >
      <span className="grid size-5 place-items-center rounded-[5px] bg-ink" aria-hidden="true">
        <svg viewBox="5 2 128 87" className="h-[9px] w-auto">
          <path d={uiSdkMark} fill="#fff" />
        </svg>
      </span>
      ui-sdk
    </a>
  )
}

function Status({ live: isLive, small }: { live?: boolean; small?: boolean }) {
  return isLive ? (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-live-soft px-2 text-xs font-medium text-live-ink">
      <span className="size-1.5 rounded-full bg-live" aria-hidden="true" />
      Live demo
    </span>
  ) : (
    <span
      className={`inline-flex items-center rounded-full bg-well px-2 font-medium text-graphite shadow-[inset_0_0_0_1px_var(--hairline)] ${small ? "h-5 text-[11px]" : "h-6 text-xs"}`}
    >
      Soon
    </span>
  )
}

export default function Home() {
  return (
    <div className="relative mx-auto max-w-[1280px] px-4 pb-16 sm:px-[72px] sm:pb-20">
      {/* guide rails */}
      <div className="pointer-events-none absolute inset-y-0 left-12 hidden w-px bg-hairline sm:block" />
      <div className="pointer-events-none absolute inset-y-0 right-12 hidden w-px bg-hairline sm:block" />

      <header className="flex h-20 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid size-7 place-items-center rounded-lg bg-ink shadow-[0_0_0_1px_#000,inset_0_1px_0_rgb(255_255_255/0.18)]">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <rect x="1" y="1" width="5" height="5" rx="1.5" fill="#fff" />
              <rect x="8" y="1" width="5" height="5" rx="1.5" fill="#fff" opacity=".45" />
              <rect x="1" y="8" width="5" height="5" rx="1.5" fill="#fff" opacity=".45" />
              <rect x="8" y="8" width="5" height="5" rx="2.5" fill="var(--signal)" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-[-0.01em]">ui-sdk ideas</span>
        </div>
        <div className="flex gap-2">
          <a
            href="https://ui-sdk.dev/docs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-sheet px-3 text-[13px] font-medium shadow-control transition hover:bg-well"
          >
            Docs <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
          </a>
          <a
            href="https://github.com/kapishdima/uisdk-ideas"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-sheet px-3 text-[13px] font-medium shadow-control transition hover:bg-well"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.87 2.34.67.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.66 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z" />
            </svg>
            GitHub
          </a>
          <a
            href="https://x.com/kapish_dima"
            target="_blank"
            rel="noreferrer"
            aria-label="@kapish_dima on X"
            className="inline-flex size-8 items-center justify-center rounded-[10px] bg-sheet shadow-control transition hover:bg-well"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
            </svg>
          </a>
        </div>
      </header>

      <section className="-mx-4 flex flex-col gap-6 border-t border-hairline px-4 pt-12 pb-10 sm:-mx-6 sm:px-6 sm:pt-14 sm:pb-12 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <div>
          <div className="mb-4 font-mono text-xs text-signal">snapshot() · query() · act()</div>
          <h1 className="max-w-[640px] text-[40px] leading-[1.02] font-semibold tracking-[-0.045em] sm:text-[56px]">
            Ideas for interfaces
            <br />
            agents can operate
            <span
              className="ml-1.5 inline-block h-[34px] w-1 -translate-y-px bg-signal align-[-4px] sm:h-12"
              aria-hidden="true"
            />
          </h1>
        </div>
        <p className="max-w-[340px] pb-1.5 text-[15px] leading-relaxed text-graphite">
          Working demos built on <UiSdkBadge /> — every
          component it renders joins an agent bridge, so a model reads and changes the UI through
          the components’ own APIs.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2" aria-label="Live demos">
        {live.map((idea) => (
          <Link
            key={idea.href}
            href={idea.href}
            className="group rounded-[20px] bg-sheet p-2 shadow-sheet transition duration-200 hover:-translate-y-0.5 hover:shadow-sheet-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/10"
          >
            <Well height="h-[300px]">
              <idea.preview />
            </Well>
            <div className="px-4 pt-5 pb-3.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-pencil">{idea.index}</span>
                <Status live />
              </div>
              <h2 className="mt-2.5 text-xl font-semibold tracking-[-0.02em]">{idea.title}</h2>
              <p className="mt-1.5 max-w-[440px] text-sm leading-relaxed text-graphite">{idea.text}</p>
              <div className="mt-[18px] flex items-center justify-between gap-3">
                <ul className="flex flex-wrap gap-1.5">
                  {idea.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-md bg-well px-1.5 py-[3px] font-mono text-[11px] text-graphite shadow-[inset_0_0_0_1px_var(--hairline)]"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
                <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-ink text-white transition group-hover:bg-signal">
                  <ArrowRightIcon className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <div className="mt-12 mb-4 flex items-center gap-3">
        <span className="font-mono text-xs text-pencil">Up next</span>
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Coming soon">
        {upNext.map((idea) => (
          <article key={idea.index} className="rounded-[20px] bg-sheet p-1.5 shadow-sheet">
            <Well height="h-[132px]">
              <idea.preview />
            </Well>
            <div className="px-2.5 pt-3.5 pb-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-pencil">{idea.index}</span>
                <Status small />
              </div>
              <h3 className="mt-2 text-[15px] font-semibold tracking-[-0.015em]">{idea.title}</h3>
              <p className="mt-1 text-[13px] leading-normal text-graphite">{idea.text}</p>
            </div>
          </article>
        ))}
      </section>

      <div className="mt-14 flex flex-col justify-between gap-2 font-mono text-[11px] text-pencil sm:flex-row">
        <span>
          @ui-sdk/react 0.1.0-beta.1 · by{" "}
          <a
            href="https://x.com/kapish_dima"
            target="_blank"
            rel="noreferrer"
            className="text-graphite underline-offset-2 transition hover:text-ink hover:underline"
          >
            @kapish_dima
          </a>
        </span>
        <span>Demos run without an API key — recorded runs call the real bridge</span>
      </div>
    </div>
  )
}

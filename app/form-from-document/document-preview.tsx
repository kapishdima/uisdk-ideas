import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/cn"
import { money, totalOf, type SampleDocument } from "./documents"

const printedDate = (doc: SampleDocument, iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(doc.locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

/** A paper-looking render of a gallery document. */
export function DocumentPreview({ doc }: { doc: SampleDocument }) {
  return (
    <article
      aria-label={`${doc.kind} ${doc.number}`}
      className="relative overflow-hidden rounded-lg bg-white p-5 font-sans text-[11px] leading-relaxed text-zinc-700 shadow-control"
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: doc.accent }} aria-hidden="true" />
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold tracking-tight text-zinc-900">{doc.vendor}</div>
          {doc.address.map((line) => (
            <div key={line}>{line}</div>
          ))}
          <div>{doc.email}</div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[13px] font-semibold tracking-[0.16em] text-zinc-900 uppercase">{doc.kind}</div>
          <div className="font-mono">{doc.number}</div>
          {doc.stamp ? (
            <div
              className="mt-1.5 inline-block -rotate-3 rounded border px-1.5 text-[9px] font-semibold tracking-wider uppercase"
              style={{ borderColor: doc.accent, color: doc.accent }}
            >
              {doc.stamp}
            </div>
          ) : null}
        </div>
      </header>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] tracking-wider text-zinc-400 uppercase">Bill to</div>
          {doc.billTo.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
        <dl className="grid grid-cols-[auto_1fr] content-start gap-x-3 text-right">
          <dt className="text-zinc-400">Issued</dt>
          <dd className="font-mono">{printedDate(doc, doc.issued)}</dd>
          <dt className="text-zinc-400">Due</dt>
          <dd className="font-mono">{doc.dueText ?? printedDate(doc, doc.due)}</dd>
          {doc.taxId ? (
            <>
              <dt className="text-zinc-400">Tax ID</dt>
              <dd className="font-mono">{doc.taxId}</dd>
            </>
          ) : null}
        </dl>
      </div>

      <table className="mt-4 w-full border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-[10px] tracking-wider text-zinc-400 uppercase">
            <th className="py-1 font-normal">Description</th>
            <th className="py-1 text-right font-normal">Qty</th>
            <th className="py-1 text-right font-normal">Amount</th>
          </tr>
        </thead>
        <tbody>
          {doc.lines.map((line) => (
            <tr key={line.description} className="border-b border-zinc-100">
              <td className="py-1.5 pr-2">{line.description}</td>
              <td className="py-1.5 text-right font-mono">{line.qty}</td>
              <td className="py-1.5 pl-2 text-right whitespace-nowrap tabular-nums">
                {money(doc, line.qty * line.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2 flex justify-end gap-6 text-sm font-semibold text-zinc-900">
        <span>Total due</span>
        <span className="tabular-nums">{money(doc, totalOf(doc))}</span>
      </div>
      <p className="mt-1 text-right text-[10px] text-zinc-400">{doc.taxNote}</p>

      <footer className="mt-4 border-t border-zinc-200 pt-2 text-[10px] text-zinc-500">
        {"iban" in doc.payment ? (
          <>
            Pay to IBAN <span className="font-mono">{doc.payment.iban}</span>.{" "}
          </>
        ) : (
          `${doc.payment.text} `
        )}
        {doc.footnote}
      </footer>
    </article>
  )
}

/** A small sheet of paper with the document's accent, for the gallery. */
function Thumbnail({ doc }: { doc: SampleDocument }) {
  return (
    <div
      className="grid h-[52px] w-10 shrink-0 content-start gap-[3px] rounded-[5px] bg-white px-[5px] py-1.5 shadow-[0_0_0_1px_var(--hairline),0_2px_4px_rgb(10_13_20/0.06)]"
      aria-hidden="true"
    >
      <div className="h-[3px] w-[70%] rounded-full" style={{ background: doc.accent }} />
      <div className="h-0.5 w-1/2 rounded-full bg-[#E2E2E2]" />
      <div className="mt-1 h-0.5 w-[90%] rounded-full bg-[#E2E2E2]" />
      <div className="h-0.5 w-[80%] rounded-full bg-[#E2E2E2]" />
      <div className="h-0.5 w-[85%] rounded-full bg-[#E2E2E2]" />
      <div className="mt-1 h-[3px] w-[45%] justify-self-end rounded-full bg-ink" />
    </div>
  )
}

/** Pick one of the sample documents. A radio group, so arrows move between them. */
export function DocumentGallery({
  documents,
  value,
  onChange,
  disabled,
}: {
  documents: SampleDocument[]
  value: string
  onChange: (id: string) => void
  disabled?: boolean
}) {
  return (
    <fieldset className="mt-5 grid grid-cols-2 gap-2">
      <legend className="sr-only">Document to fill the form from</legend>
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          doc={doc}
          selected={doc.id === value}
          disabled={disabled}
          onSelect={() => onChange(doc.id)}
        />
      ))}
    </fieldset>
  )
}

function DocumentCard({
  doc,
  selected,
  disabled,
  onSelect,
}: {
  doc: SampleDocument
  selected: boolean
  disabled?: boolean
  onSelect: () => void
}) {
  return (
    <label
      className={cn(
        "relative flex min-w-0 cursor-pointer items-center gap-2.5 rounded-xl bg-sheet p-2 shadow-sheet transition",
        "has-[:focus-visible]:shadow-[0_0_0_2px_var(--signal-ring)]",
        selected
          ? "shadow-[0_0_0_1.5px_var(--signal),0_4px_12px_-6px_rgb(240_78_31/0.35)]"
          : "hover:shadow-sheet-hover",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <input
        type="radio"
        name="document"
        value={doc.id}
        checked={selected}
        disabled={disabled}
        onChange={onSelect}
        className="sr-only"
      />
      <span className="relative shrink-0">
        <Thumbnail doc={doc} />
        {selected ? (
          <span className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full bg-signal text-white ring-2 ring-sheet">
            <CheckIcon className="size-2.5" strokeWidth={3} aria-hidden="true" />
          </span>
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] leading-tight font-medium">{doc.vendor}</span>
        <span className="mt-1 block truncate text-[11px] leading-tight text-graphite">{doc.kind}</span>
        <span className="mt-0.5 block truncate text-[11.5px] leading-tight font-medium text-ink tabular-nums">
          {money(doc, totalOf(doc))}
        </span>
      </span>
    </label>
  )
}

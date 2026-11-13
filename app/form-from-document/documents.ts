import type { Script } from "@/lib/run-agent"

type Line = { description: string; qty: number; price: number }

/** A document from the gallery: what's printed on it, and how the bill should end up. */
export type SampleDocument = {
  id: string
  /** What kind of paper it is, printed as its title. */
  kind: string
  file: string
  vendor: string
  address: string[]
  email: string
  taxId?: string
  number: string
  issued: string
  due: string
  /** Printed instead of a due date when the document has its own wording. */
  dueText?: string
  billTo: string[]
  lines: Line[]
  currency: "EUR" | "USD" | "GBP" | "UAH"
  locale: string
  taxNote: string
  /** How it gets paid. With an IBAN the agent can fill it; without one the field stays empty. */
  payment: { iban: string } | { text: string }
  footnote: string
  stamp?: string
  /** Thumbnail accent, so the gallery tells documents apart at a glance. */
  accent: string
  /** What a careful reader would put in the form. */
  bill: { category: string; recurring: boolean; notes: string }
  /** The model's closing message in demo mode. */
  summary: string
}

export const documents: SampleDocument[] = [
  {
    id: "northwind",
    kind: "Invoice",
    file: "invoice-NW-2026-0418.pdf",
    vendor: "Northwind Studio GmbH",
    address: ["Torstraße 112", "10119 Berlin, Germany"],
    email: "billing@northwind.studio",
    taxId: "DE 312 456 789",
    number: "NW-2026-0418",
    issued: "2026-11-02",
    due: "2026-12-02",
    billTo: ["Acme Robotics Ltd.", "Accounts Payable", "London, UK"],
    lines: [
      { description: "Brand refresh — logo system", qty: 1, price: 2400 },
      { description: "Brand guidelines (48 pages)", qty: 1, price: 1650 },
      { description: "Design review sessions", qty: 3, price: 270 },
    ],
    currency: "EUR",
    locale: "de-DE",
    taxNote: "Reverse charge — VAT not included",
    payment: { iban: "DE89 3704 0044 0532 0130 00" },
    footnote: "Phase 2 of the brand refresh. Payment within 30 days.",
    accent: "#F04E1F",
    bill: {
      category: "Services",
      recurring: false,
      notes: "Brand refresh, phase 2: logo system, guidelines, 3 review sessions.",
    },
    summary:
      'Filled 10 fields from invoice NW-2026-0418: Northwind Studio GmbH, 4,860 EUR due 2026-12-02. I picked "Services" as the category and left "Recurring bill" off — the invoice doesn\'t say it repeats.',
  },
  {
    id: "lumen",
    kind: "Subscription invoice",
    file: "lumen-cloud-nov-2026.pdf",
    vendor: "Lumen Cloud, Inc.",
    address: ["548 Market St, Suite 300", "San Francisco, CA 94104"],
    email: "billing@lumen.cloud",
    number: "LC-88214-11",
    issued: "2026-11-01",
    due: "2026-11-15",
    billTo: ["Acme Robotics Ltd.", "Workspace acme-robotics"],
    lines: [
      { description: "Team plan — 12 seats × 1 month", qty: 12, price: 89 },
      { description: "Extra build minutes (6,000)", qty: 1, price: 132 },
      { description: "Priority support add-on", qty: 1, price: 84 },
    ],
    currency: "USD",
    locale: "en-US",
    taxNote: "No sales tax — customer outside the US",
    payment: { text: "Charged automatically to Visa •••• 4242 on Nov 15." },
    footnote: "Billed monthly. Your plan renews on Dec 1, 2026.",
    stamp: "Auto-pay",
    accent: "#4F6BED",
    bill: {
      category: "Software",
      recurring: true,
      notes: "Lumen Cloud Team plan for November: 12 seats, extra build minutes, priority support.",
    },
    summary:
      'Filled 10 fields from Lumen Cloud invoice LC-88214-11: 1,284 USD due 2026-11-15, category "Software". It renews monthly, so I turned "Recurring bill" on. There\'s no IBAN — it\'s charged to a card — so I left that field empty.',
  },
  {
    id: "harbour",
    kind: "Hotel folio",
    file: "harbour-hotel-folio.jpg",
    vendor: "Harbour Hotel Bristol",
    address: ["55 Corn Street", "Bristol BS1 1HT, UK"],
    email: "reservations@harbourbristol.co.uk",
    taxId: "GB 284 9921 07",
    number: "F-20931",
    issued: "2026-10-30",
    due: "2026-10-30",
    dueText: "On receipt",
    billTo: ["Maya Chen", "Acme Robotics Ltd.", "Room 412 · 27–30 Oct"],
    lines: [
      { description: "Deluxe double, 3 nights", qty: 3, price: 168 },
      { description: "Breakfast", qty: 3, price: 18.5 },
      { description: "Meeting room, half day", qty: 1, price: 82 },
    ],
    currency: "GBP",
    locale: "en-GB",
    taxNote: "Prices include VAT at 20%",
    payment: { iban: "GB29 NWBK 6016 1331 9268 19" },
    footnote: "Company account — please quote folio F-20931 with payment.",
    accent: "#1FA67A",
    bill: {
      category: "Travel",
      recurring: false,
      notes: "Bristol trip, 27–30 Oct: 3 nights for Maya Chen, breakfast, half-day meeting room.",
    },
    summary:
      'Filled 10 fields from hotel folio F-20931: Harbour Hotel Bristol, 641.50 GBP. It says "due on receipt", so I set the due date to the issue date, 2026-10-30. Category is "Travel".',
  },
  {
    id: "ostriv",
    kind: "Invoice",
    file: "ostriv-tech-4471.pdf",
    vendor: "Ostriv Tech LLC",
    address: ["vul. Khreshchatyk 22", "01001 Kyiv, Ukraine"],
    email: "sales@ostriv.tech",
    taxId: "UA 4471 0291",
    number: "OT-4471",
    issued: "2026-11-05",
    due: "2026-11-19",
    billTo: ["Acme Robotics Ltd.", "Kyiv office"],
    lines: [
      { description: "Laptop 14″, 32 GB RAM", qty: 4, price: 42600 },
      { description: "USB-C dock", qty: 4, price: 2850 },
      { description: "Setup and delivery", qty: 1, price: 4200 },
    ],
    currency: "UAH",
    locale: "uk-UA",
    taxNote: "Без ПДВ · VAT exempt",
    payment: { iban: "UA21 3223 1300 0002 6007 2335 6600 1" },
    footnote: "Warranty 24 months. Payment within 14 days.",
    accent: "#E8A317",
    bill: {
      category: "Hardware",
      recurring: false,
      notes: "4 laptops with USB-C docks for the Kyiv office, setup and delivery included.",
    },
    summary:
      'Filled 10 fields from Ostriv Tech invoice OT-4471: 186,000 UAH due 2026-11-19, category "Hardware". It\'s a one-off purchase, so "Recurring bill" stays off.',
  },
]

export const totalOf = (doc: SampleDocument) =>
  doc.lines.reduce((sum, line) => sum + line.qty * line.price, 0)

const symbols = { EUR: "€", USD: "$", GBP: "£", UAH: "₴" } as const

/**
 * The amount as the document prints it. The symbol is fixed here rather than
 * left to Intl, whose data differs between Node and browsers (UAH: "грн" vs "₴").
 */
export function money(doc: SampleDocument, value: number) {
  const number = new Intl.NumberFormat(doc.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
  const symbol = symbols[doc.currency]
  return doc.locale.startsWith("en") ? `${symbol}${number}` : `${number} ${symbol}`
}

export const ibanOf = (doc: SampleDocument) => ("iban" in doc.payment ? doc.payment.iban : undefined)

/** The document as plain text, which is what the live model reads. */
export function documentText(doc: SampleDocument) {
  return [
    `${doc.kind.toUpperCase()} ${doc.number}`,
    doc.vendor,
    ...doc.address,
    `Email: ${doc.email}${doc.taxId ? ` · Tax ID: ${doc.taxId}` : ""}`,
    ``,
    `Bill to: ${doc.billTo.join(", ")}`,
    `Issue date: ${doc.issued}`,
    `Due: ${doc.dueText ?? doc.due}`,
    ``,
    ...doc.lines.map(
      (line) => `${line.description} — ${line.qty} × ${line.price.toFixed(2)} ${doc.currency}`,
    ),
    `Total due: ${totalOf(doc).toFixed(2)} ${doc.currency} (${doc.taxNote})`,
    ``,
    "iban" in doc.payment ? `Pay to IBAN ${doc.payment.iban}` : doc.payment.text,
    doc.footnote,
  ].join("\n")
}

/**
 * Demo mode, for when no API key is set: the same three tools, called for
 * real against the page, with the model's part written in advance.
 */
export function scriptFor(doc: SampleDocument): Script {
  const iban = ibanOf(doc)
  const steps = [
    { ref: "Vendor name", action: "setValue", args: [doc.vendor] },
    { ref: "Vendor email", action: "setValue", args: [doc.email] },
    { ref: "Invoice number", action: "setValue", args: [doc.number] },
    { ref: "Invoice date", action: "setValue", args: [doc.issued] },
    { ref: "Due date", action: "setValue", args: [doc.due] },
    { ref: "Currency", action: "setValue", args: [doc.currency] },
    { ref: "Amount", action: "setValue", args: [totalOf(doc)] },
    { ref: "Category", action: "setValue", args: [doc.bill.category] },
    ...(iban ? [{ ref: "IBAN", action: "setValue", args: [iban] }] : []),
    { ref: "Notes", action: "setValue", args: [doc.bill.notes] },
    ...(doc.bill.recurring ? [{ ref: "Recurring bill", action: "setChecked", args: [true] }] : []),
  ]
  return [
    { tool: "snapshot" },
    { tool: "query", input: { within: "Currency", text: doc.currency } },
    { tool: "act", input: { steps } },
    { say: doc.summary },
  ]
}

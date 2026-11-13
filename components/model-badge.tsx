import { cn } from "@/lib/cn"

/** Shows whether the demo talks to a live model or plays a recorded run. */
export function ModelBadge({ status }: { status: { configured: boolean; model: string } | null }) {
  if (!status) return null
  return (
    <span
      title={
        status.configured
          ? `Live: ${status.model} through /api/agent`
          : "No ANTHROPIC_API_KEY: a recorded run plays the same tool calls against the real page"
      }
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-xs font-medium",
        status.configured
          ? "bg-live-soft text-live-ink"
          : "bg-sheet text-graphite shadow-control",
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", status.configured ? "bg-live" : "bg-pencil")}
        aria-hidden="true"
      />
      {status.configured ? status.model : "Demo mode"}
    </span>
  )
}

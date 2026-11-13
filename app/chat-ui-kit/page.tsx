import type { Metadata } from "next"
import { Suspense } from "react"
import { DemoSkeleton } from "@/components/demo-skeleton"
import { ChatUiKitDemo } from "./demo"

export const metadata: Metadata = {
  title: "Chat UI kit · ui-sdk ideas",
  description:
    "Chat parts built on ui-sdk: thread, tool-call cards, approvals and a composer with @-mentions and /-commands.",
}

export default function Page() {
  return (
    <Suspense fallback={<DemoSkeleton />}>
      <ChatUiKitDemo />
    </Suspense>
  )
}

import type { Metadata } from "next"
import { Suspense } from "react"
import { DemoSkeleton } from "@/components/demo-skeleton"
import { FormFromDocumentDemo } from "./demo"

export const metadata: Metadata = {
  title: "Fill a form from a document · ui-sdk ideas",
  description: "Drop an invoice and an agent fills the form through ui-sdk's agent bridge.",
}

export default function Page() {
  return (
    <Suspense fallback={<DemoSkeleton />}>
      <FormFromDocumentDemo />
    </Suspense>
  )
}

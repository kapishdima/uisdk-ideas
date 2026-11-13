/** Placeholder in the shape of DemoShell while a demo with client-only values streams in. */
export function DemoSkeleton() {
  const bar = "animate-pulse rounded-md bg-[#ececec]"
  return (
    <div className="grid min-h-dvh gap-2 p-2 lg:h-dvh lg:grid-cols-[372px_minmax(0,1fr)]" aria-busy="true">
      <div className="flex flex-col gap-3 px-2 pt-4">
        <div className={`${bar} h-3 w-20`} />
        <div className="mt-5 h-2.5 w-14 animate-pulse rounded-md bg-signal-soft" />
        <div className={`${bar} h-5 w-64`} />
        <div className="mt-2 h-[76px] rounded-2xl bg-sheet shadow-sheet" />
        <div className="h-10 animate-pulse rounded-[10px] bg-signal-soft" />
        <div className="mt-5 h-px bg-hairline" />
        <div className={`${bar} h-2.5 w-[90%]`} />
        <div className={`${bar} h-2.5 w-[70%]`} />
      </div>
      <div className="flex min-h-[70dvh] flex-col rounded-2xl bg-sheet shadow-sheet">
        <div className="flex h-14 items-center border-b border-hairline px-5">
          <div className={`${bar} h-3 w-44`} />
        </div>
        <div className="mx-auto grid w-full max-w-[600px] gap-x-4 gap-y-[18px] px-5 py-9 sm:grid-cols-2">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className={index === 0 || index === 7 ? "sm:col-span-2" : undefined}>
              <div className={`${bar} mb-2.5 h-2.5 w-24`} />
              <div className={`rounded-[10px] bg-well ${index === 7 ? "h-[76px]" : "h-10"}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

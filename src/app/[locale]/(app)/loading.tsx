/** Skeleton while a screen loads: shapes of the real layout instead of a blank page. */
export default function Loading() {
  const block = "animate-pulse rounded-3xl bg-[var(--kw-line)]";
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">…</span>
      <div className={`${block} h-10 w-2/3`} />
      <div className={`${block} h-12 w-full rounded-full`} />
      <div className="flex gap-2">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className={`${block} aspect-square flex-1 rounded-full`} />
        ))}
      </div>
      <div className={`${block} aspect-[16/10] w-full`} />
      <div className={`${block} aspect-[16/10] w-full`} />
    </div>
  );
}

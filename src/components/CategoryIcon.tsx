import type { CategorySlug } from "@/domain/types";

/** Simple line icons per category (24×24, stroke = currentColor). Decorative. */
const PATHS: Record<CategorySlug, React.ReactNode> = {
  sports: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7l4 3-1.5 4.5h-5L8 10z" />
      <path d="M12 3v4M21 10.5l-5-.5M18 19l-3.5-4.5M6 19l3.5-4.5M3 10.5l5-.5" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="17.5" cy="16" r="2.5" />
    </>
  ),
  dance: (
    <>
      <circle cx="13" cy="4" r="2" />
      <path d="M13 7l-1 6 4 3v5M12 13l-4 3-2 5M8 9l4-2 5 2" />
    </>
  ),
  arts: (
    <>
      <path d="M12 3a9 9 0 100 18c1.2 0 2-.8 2-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a4 4 0 004-4c0-4.4-4-8-9-8z" />
      <circle cx="7.5" cy="11" r="1.2" />
      <circle cx="10.5" cy="7" r="1.2" />
      <circle cx="15" cy="7.5" r="1.2" />
    </>
  ),
  stem: (
    <>
      <path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 006 21h12a1.7 1.7 0 001.5-2.5L14 9V3" />
      <path d="M7 15h10" />
    </>
  ),
  theatre: (
    <>
      <path d="M3 4h10v6a5 5 0 01-10 0z" />
      <path d="M11 10h10v5a5 5 0 01-10 0" />
      <path d="M6 8h.01M10 8h.01M6 12.5c1 .8 3 .8 4 0M14 13h.01M18 13h.01M14.5 17.5c1-.8 3-.8 4 0" />
    </>
  ),
  museum: (
    <>
      <path d="M3 10l9-6 9 6M4 21h16M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21v0" />
    </>
  ),
  outdoors: (
    <>
      <path d="M12 3l6 9h-3l4 6H5l4-6H6z" />
      <path d="M12 18v3" />
    </>
  ),
  baby: (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="M10 8.5h.01M14 8.5h.01M10.5 11c.8.6 2.2.6 3 0M12 14v3M9 20h6M12 17l-3 3M12 17l3 3" />
    </>
  ),
  holidayCamp: (
    <>
      <path d="M3 20L12 4l9 16z" />
      <path d="M12 4v16M9 20l3-5 3 5M2 20h20" />
    </>
  ),
};

export function CategoryIcon({ category, className = "size-7" }: { category: CategorySlug; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className}>
      {PATHS[category]}
    </svg>
  );
}

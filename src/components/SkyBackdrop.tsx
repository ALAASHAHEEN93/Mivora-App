/** Pale sky with soft cream clouds and two little stars, for the splash and welcome screens. Decorative. */
export function SkyBackdrop({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden bg-[#cfeaf5] ${className}`}>
      <span className="absolute -bottom-16 -left-12 h-40 w-64 rounded-full bg-[#fff1e3]" />
      <span className="absolute -bottom-20 -right-16 h-44 w-72 rounded-full bg-[#ffead4]" />
      <span className="absolute -bottom-24 left-1/3 h-36 w-56 rounded-full bg-[#fffbf2]" />
      <span className="absolute left-[12%] top-[14%] h-7 w-20 rounded-full bg-white/90" />
      <span className="absolute right-[10%] top-[24%] h-6 w-16 rounded-full bg-white/80" />
      <span className="absolute left-[8%] top-[30%] text-2xl text-[#fcb46c]">★</span>
      <span className="absolute right-[18%] top-[9%] text-lg text-[#f09c9c]">★</span>
    </div>
  );
}

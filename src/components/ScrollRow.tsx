"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Horizontal swipe row for phones: swipe with a finger (native scrolling), or drag with the mouse
 * on a laptop. An end-edge fade shows while there is more to scroll and disappears at the end.
 * Works in RTL (scrollLeft is negative there).
 */
export function ScrollRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const [more, setMore] = useState(true);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setMore(Math.abs(el.scrollLeft) + el.clientWidth < el.scrollWidth - 8);
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Mouse only: touch and pen already scroll natively.
  const onPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    const el = ref.current;
    if (e.pointerType !== "mouse" || e.button !== 0 || !el || el.scrollWidth <= el.clientWidth) return;
    drag.current = { x: e.clientX, left: el.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    const el = ref.current;
    const d = drag.current;
    if (!el || !d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 5) return;
    if (!d.moved) {
      d.moved = true;
      setDragging(true);
      el.setPointerCapture(e.pointerId);
    }
    el.scrollLeft = d.left - dx;
  };
  const endDrag = (e: React.PointerEvent<HTMLUListElement>) => {
    if (drag.current?.moved) ref.current?.releasePointerCapture(e.pointerId);
    setDragging(false);
    // Keep `moved` until the click that follows, so a drag never opens a link.
    setTimeout(() => (drag.current = null), 0);
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current?.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="relative -mx-4 md:mx-0">
      <ul
        ref={ref}
        className={`${className} ${dragging ? "cursor-grabbing select-none snap-none!" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(e) => drag.current && e.preventDefault()}
      >
        {children}
      </ul>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 end-0 w-16 bg-gradient-to-l from-bg to-transparent transition-opacity rtl:bg-gradient-to-r md:hidden ${more ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

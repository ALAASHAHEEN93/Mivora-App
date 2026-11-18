"use client";

import { useEffect, useState } from "react";

/**
 * Search field whose placeholder cycles through ideas ("Sport …", "Musik …") to spark curiosity.
 * The visible label stays on the form; with reduced motion the placeholder stays still.
 */
export function SearchHintsInput({ hints, placeholder, ...rest }: { hints: string[]; placeholder: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [i, setI] = useState(-1);

  useEffect(() => {
    if (hints.length === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setI((n) => (n + 1) % hints.length), 2600);
    return () => window.clearInterval(timer);
  }, [hints.length]);

  return <input type="search" {...rest} placeholder={i < 0 ? placeholder : `${hints[i]} …`} />;
}

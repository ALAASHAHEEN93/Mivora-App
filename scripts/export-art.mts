/**
 * Writes the editable copy of the empty-state scenes to design/mivora-empty-states.svg
 * (one named layer per scene, laid out in a 3 × 2 grid) so they can be opened in Illustrator.
 * Run after changing src/components/illustrations/EmptyArt.tsx: pnpm art:export
 */
import { writeFileSync } from "node:fs";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// tsx compiles JSX with the classic runtime (React.createElement), so React must be global
// before the drawing module loads.
Object.assign(globalThis, { React });
const { EMPTY_ART_KINDS, EmptyArtScene } = await import("../src/components/illustrations/EmptyArt");

const W = 200;
const H = 136;
const COLS = 3;

const layers = EMPTY_ART_KINDS.map((kind, i) => {
  const x = (i % COLS) * W;
  const y = Math.floor(i / COLS) * H;
  const inner = renderToStaticMarkup(React.createElement(EmptyArtScene, { kind }))
    // Animation hooks only matter in the app; ids must be unique per file.
    .replace(/ class="[^"]*"/g, "")
    .replace(/ id="([^"]+)"/g, ` id="${kind}-$1"`);
  return `  <g id="${kind}" transform="translate(${x} ${y})">${inner}</g>`;
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W * COLS} ${H * 2}" width="${W * COLS}" height="${H * 2}">
${layers.join("\n")}
</svg>
`;
writeFileSync("design/mivora-empty-states.svg", svg);
console.log("Wrote design/mivora-empty-states.svg");

# ADR-0003: Brand design system: tokens, dark mode, original artwork

- **Status:** Accepted
- **Date:** 2026-11-17 to 2026-11-21 (recorded 2026-11-25)
- **Deciders:** Founder (UX/UI designer)

## Context
Mivora is for parents, but it should feel warm and playful, like a kids' world, while staying calm and readable for tired parents in 9 languages, including Arabic RTL. Several palettes were tried in the commit history (Sunny orange, navy/aqua, pink/indigo/amber…) before the current brand.

## Decision
- **Brand colours:** Coral `#F2A68A`, Sunshine `#F3D077`, Mint `#82C3B8`, Lavender `#AF9FD5`, Cream `#FFF3EA`, Midnight Blue `#263847`.
- **Semantic tokens only** in components (`--kw-*` in `src/app/globals.css` → Tailwind `bg`, `surface`, `ink`, `primary`, `accent`…). Light and dark values come from the same tokens. Contrast and dark-block parity are tested (`domain/contrast.test.ts`).
- **Type:** Fredoka (logo and headings), Nunito (body, Latin + Cyrillic), Noto Sans Arabic. All self-hosted via `next/font`.
- **Artwork:** original SVG illustrations drawn for Mivora (meadow, kids, star mascot), with editable copies in `design/`. No stock illustrations.

## Consequences
- Any new colour pair needs a contrast test entry. Any new drawing needs dark-mode and RTL checks.
- Changing the brand is a token change, not a component rewrite.
- New art must be original or commissioned with rights transferred (see `design/README.md`).

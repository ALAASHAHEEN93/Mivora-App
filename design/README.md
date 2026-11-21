# Mivora design files (for Adobe Illustrator)

Editable copies of the drawings used in the app. Open them in Illustrator; every part
is on its own named layer, and all colours are the real brand colours.

| File | What it is | Layers |
|---|---|---|
| `mivora-logo.svg` | The wordmark | outline · letters · star · swoosh |
| `mivora-mascot-star.svg` | The star mascot (with face) | star · highlight · cheeks · eyes · mouth · sparkle |
| `mivora-meadow.svg` | Home / splash meadow (800 × 400) | sky · clouds · stars · balloon · rainbow-left · rainbow-right · cathedral · hills-far · birds · trees-far · kite · hills-near · stream · ducks (one in sunglasses) · frog · swing · child-with-kite · trees-near · flowers · butterflies · ground · party-snail · worm · bubbles |
| `mivora-welcome-kids.svg` | Welcome screen scene (320 × 220) | sky · clouds · sparkles · rainbow · hill-back · hill-front · flowers · kid-1 … kid-4 |

## Before you start
- **Logo font:** the letters are live text in **Fredoka Bold** (free on Google Fonts).
  Install it first, otherwise Illustrator shows another font. When you are happy,
  select the text and use *Type → Create Outlines*.
- **Brand colours:** Coral `#F2A68A` · Sunshine `#F3D077` · Mint `#82C3B8` ·
  Lavender `#AF9FD5` · Cream `#FFF3EA` · Midnight Blue `#263847`.

## Sending a drawing back to the app
1. Keep each part you want to move on its own layer, with a clear name
   (e.g. `balloon`, `kid-2`, `arm-left`). These names become animation hooks.
2. Avoid effects SVG can’t keep: blurs, mesh gradients, textures, placed photos.
3. *File → Export → Export As… → SVG*:
   Styling **Presentation Attributes**, Font **Convert to Outlines**, Images **Embed**,
   **Object IDs: Layer Names**, **Minify** on, **Responsive** on.
4. Save it in this folder with a new name (e.g. `mivora-meadow-v2.svg`) and tell Claude
   which screen it is for. The app version gets the animations, dark mode and
   right-to-left support added there.

All drawings here are original to Mivora (drawn in code), so there are no third-party
licence questions. Keep it that way for new art: draw it yourself or have it made for
Mivora with the rights transferred to you.

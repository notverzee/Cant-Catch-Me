# Artwork slots

The game runs without artwork and uses its built-in ocean and submarine fallbacks. To use your own art, put the image in this folder and update the matching entry in [`manifest.js`](./manifest.js). Keep the slot key and update `src` if you choose a different filename; the game looks up art by these keys.

| Slot | Suggested filename | Canvas size | Notes |
| --- | --- | ---: | --- |
| Submarine | `submarine.png` | 512 × 320 px | Transparent PNG or WebP; side view, centered, contain-fit |
| Fish by rarity | `fish-<rarity>.png` | 384 × 240 px each | Transparent PNG or WebP; side view facing left, centered, contain-fit |

Fish keys are `trash`, `common`, `uncommon`, `rare`, `epic`, `legendary`, `mythic`, and `treasure`. The pixel sizes are recommended source dimensions, not hard limits. Keep the proportions and transparent padding consistent within each group so images can be swapped without changing layout.

`manifest.js` is the single artwork registry. Each entry has a relative `src`, recommended `width` and `height`, and a CSS `fit` value. Add future image slots there, then reference their keys in `game.js` where they are displayed. Missing images are hidden automatically, leaving the built-in fallback art in place. Avoid editing the game rules to import replacement art.

The browser game is plain HTML, CSS, and JavaScript. Keep gameplay in `game.js`, presentation in `styles.css`, and markup in `index.html`; the browser client needs no build step. Online play uses the separate Node WebSocket relay in `relay/`. Deploy it with the repository's `render.yaml` and set its secure WebSocket URL in `relay-config.js`.

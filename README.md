# Can't Catch Me

A deep-sea submarine game for online co-op, local co-op, or solo play. The Fisher hooks unusual sea life while the Repairer keeps the submarine's systems running.

## Play

Open `index.html` from a static web host such as GitHub Pages. The **Play** menu offers:

- **Online crew:** Host a voyage and share its six-character room code, or join a host's room. Game messages pass through the WebSocket relay; players do not need a direct peer-to-peer connection.
- **Local co-op:** Two players share one device. The Fisher uses WASD and Space; the Repairer uses the arrow keys and mouse.
- **Solo dive:** One player handles both stations using the local controls.

## Deploy the online relay

The browser game is static, so the relay runs as a separate Node service. This repository includes a Render Blueprint in `render.yaml`.

1. In Render, create a **Blueprint** from this repository and deploy the `cant-catch-me-relay` service.
2. The browser is configured for `wss://cant-catch-me-relay.onrender.com/ws` in `relay-config.js`. If Render assigns a different service URL, update that setting to the service's secure WebSocket URL ending in `/ws`.
3. Keep the game page hosted on GitHub Pages or another static host. The relay health endpoint is `/health`.

Room codes and connections are held in memory; redeploying or restarting the relay closes active rooms. Render's free service may take a little time to wake up after inactivity, so the game allows up to 90 seconds for the initial relay connection.

### Controls

- **Local Fisher:** WASD to steer during aim challenges and match rhythm cues; Space casts or reels.
- **Local Repairer:** use the arrow keys for alignment/engine challenges and the mouse or left click for the repair board and tools.
- **Online Fisher:** WASD or arrow keys to steer during aim challenges, mouse to position the aim dot, arrow keys during rhythm challenges, and Space (or the on-screen button) to cast or reel.
- **Online Engineer:** all active repairs appear together on the systems board. Open a repair, then follow its on-screen instructions; alignment uses left/right arrows, pump controls are clickable, and welding requires tracing the seam with a press-and-drag.
- **Solo:** Use the local Fisher and Repairer controls to run both stations.

### Expedition loop

Catch fish and carry them to a 250-meter checkpoint to sell for crew gold. Spend gold on shared hull, harpoon, lure, fuel, and bilge upgrades. Each purchase raises that upgrade's next price by 5%. Missed catches can damage the hull and create new repairs; leaks, water, fuel faults, and a broken harpoon affect the whole crew. A breached hull ends the voyage.

Fish values follow the brainstorming notes: Trash 1, Common 5–10, Uncommon 15–20, Rare 30–40, Epic 45–60, Legendary 80–100, Mythic 120–150, and Treasure 300 gold. Each rarity can contain several species, including sprats, ribbon eels, glassfin, vampire squid, starwhales, and more. The supplied spawn figures (20%, 70%, 50%, 40%, 35%, 10%, 1%, and 0.005%) add up to more than 100%, so the game treats them as relative spawn weights and normalizes them into a valid weighted roll. The lure upgrade improves the odds of higher rarities.

## Artwork and future changes

The game runs with CSS fallback art. To add your own images, follow the dimensions, filenames, and manifest instructions in [`assets/README.md`](assets/README.md). Markup lives in `index.html`, styling in `styles.css`, gameplay and relay client in `game.js`, relay configuration in `relay-config.js`, and replaceable artwork entries in `assets/manifest.js`. The relay server and its tests are in `relay/`; run them with `cd relay && npm install && npm test`.

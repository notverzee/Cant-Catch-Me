# Can't Catch Me

A deep-sea submarine game for online co-op, local co-op, or solo play. The Fisher hooks unusual sea life while the Repairer keeps the submarine's systems running.

## Play

Open `index.html` from a static web host such as GitHub Pages. The **Play** menu offers:

- **Online crew:** Host a voyage and share its six-character room code, or join a host's room. Game messages pass through the WebSocket relay; players do not need a direct peer-to-peer connection.
- **Local co-op:** Two players share one device. The Fisher uses WASD and Space; the Repairer uses the arrow keys and mouse.
- **Solo dive:** One player handles both stations using the local controls.

Every expedition opens with a short family-log cutscene. During the dive, the Fisher can hook fish through aim, rhythm, reel, and shoal encounters; the Repairer handles system faults, including a robotic-arm barnacle scraper. Online crews can send preset quick-chat messages.

## Deploy the online relay

The browser game is static, so the relay runs as a separate Node service. This repository includes a Render Blueprint in `render.yaml`.

1. In Render, create a **Blueprint** from this repository and deploy the `cant-catch-me-relay` service.
2. The browser is configured for `wss://cant-catch-me-relay.onrender.com/ws` in `relay-config.js`. If Render assigns a different service URL, update that setting to the service's secure WebSocket URL ending in `/ws`.
3. Keep the game page hosted on GitHub Pages or another static host. The relay health endpoint is `/health`.

Room codes and connections are held in memory; redeploying or restarting the relay closes active rooms. Render's free service may take a little time to wake up after inactivity, so the game allows up to 90 seconds for the initial relay connection.

### Controls

- **Local Fisher:** WASD to steer during aim and shoal challenges and match rhythm cues; Space casts, reels, or catches a fish under the shoal cursor.
- **Local Repairer:** use the arrow keys for alignment/engine challenges and the mouse or left click for the repair board and tools.
- **Online Fisher:** WASD or arrow keys to steer during aim challenges, mouse to position the aim dot or click shoal fish, arrow keys during rhythm challenges, and Space (or the on-screen button) to cast or reel.
- **Online Engineer:** all active repairs appear together on the systems board. Open a repair, then follow its on-screen instructions; alignment uses left/right arrows, pump controls and barnacle targets are clickable, and welding requires tracing the seam with a press-and-drag. Quick chat is available below the stations.
- **Solo:** Use the local Fisher and Repairer controls to run both stations.

### Expedition loop

Each fishing encounter consumes one bait. Restock ten bait for 5 gold at checkpoints; the price rises slowly over repeated purchases. Catch fish and carry them to a 250-meter checkpoint to sell for crew gold. Spend gold on shared hull, harpoon, lure, fuel, bilge, and bait supplies. Each upgrade purchase raises that upgrade's next price by 5%. Missed catches can damage the hull and create new repairs; critical system faults rapidly drain their associated hull, fuel, or bilge resources until repaired. A breached hull ends the voyage.

The expedition includes the species listed in [`Fish.txt`](./Fish.txt), with each rarity's species priced from cheapest to most expensive in listed order and illustrated with procedural species art. After 1,000 catches without a Legendary, 5,000 without a Mythic, or 12,500 without Treasure, pity guarantees that rarity on the next encounter. The supplied rarity weights are normalized into a weighted roll; the lure upgrade improves the odds of higher rarities.

## Artwork and future changes

The game runs with CSS fallback art. To add your own images, follow the dimensions, filenames, and manifest instructions in [`assets/README.md`](assets/README.md). Markup lives in `index.html`, styling in `styles.css`, gameplay and relay client in `game.js`, relay configuration in `relay-config.js`, and replaceable artwork entries in `assets/manifest.js`. The relay server and its tests are in `relay/`; run them with `cd relay && npm install && npm test`.

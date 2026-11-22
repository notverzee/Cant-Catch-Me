# Can't Catch Me

A deep-sea submarine game for online co-op, local co-op, or solo play. The Fisher hooks unusual sea life while the Engineer keeps the submarine's systems running.

## Play

Open `index.html` from a static web host such as GitHub Pages. The **Play** menu offers:

- **Online crew:** Host a voyage and share its six-character room code, or join a host's room. Game messages pass through the WebSocket relay; players do not need a direct peer-to-peer connection.
- **Local co-op:** Two players share one device and choose Fisher or Engineer before the story begins. Player 1 picks first; Player 2 takes the remaining station. The Fisher uses WASD and Space; the Engineer uses the arrow keys and mouse.
- **Solo dive:** One player handles both stations using the local controls.

Every expedition opens with a short family-log cutscene. During the dive, the Fisher can hook fish through aim, rhythm, reel, and shoal encounters, clean barnacles, and untangle the fishing line; the Engineer handles system faults. Online crews can send preset quick-chat messages and negotiate checkpoint purchases. The Fisher and Engineer see only their own station during online play, while both can use the shared shop.

## Deploy the online relay

The browser game is static, so the relay runs as a separate Node service. This repository includes a Render Blueprint in `render.yaml`.

1. In Render, create a **Blueprint** from this repository and deploy the `cant-catch-me-relay` service.
2. The browser is configured for `wss://cant-catch-me-relay.onrender.com/ws` in `relay-config.js`. If Render assigns a different service URL, update that setting to the service's secure WebSocket URL ending in `/ws`.
3. Keep the game page hosted on GitHub Pages or another static host. The relay health endpoint is `/health`.

Room codes and connections are held in memory; redeploying or restarting the relay closes active rooms. Render's free service may take a little time to wake up after inactivity, so the game allows up to 90 seconds for the initial relay connection.

### Controls

- **Local Fisher:** WASD or mouse to guide the cursor during aim and shoal challenges; click a passing shoal fish directly or overlap it with the cursor and press Space. The aim ring has a forgiving hold zone and brief drift buffer. WASD also matches rhythm cues.
- **Fisher activities:** clean barnacles before they reach 60%; the temporary hull-cleaning screen pauses fishing and requires clicking all eight clusters. At 60% hull damage accelerates, and 100% ends the voyage. If the line tangles, click **Untangle Line** five times. Fish encounters pause during either task, and fish spawn roughly every 4–8 seconds while the line and hull are clear.
- **Local Engineer:** use the arrow keys for alignment/engine challenges and the mouse or left click for the repair board and tools.
- **Online Fisher:** WASD or arrow keys to steer during aim challenges, mouse to position the aim dot or click shoal fish, arrow keys during rhythm challenges, and Space (or the on-screen button) to cast or reel. The aim ring has a wider hold zone and brief drift buffer.
- **Online Engineer:** active repairs appear together on the systems board with larger countdowns. Open a repair and follow its instructions; turn each loose hull bolt three times, alignment uses left/right arrows, pump controls are clickable, and welding requires tracing the seam with a press-and-drag. At 50% fuel, a fuel-line mission appears and opens automatically for the Engineer.
- **Online crew:** Both players choose a station before the story begins. The first accepted choice reserves that station; the other player chooses the remaining one.
- **Solo:** Use the local Fisher and Engineer controls to run both stations.

The main-menu **Credits** section lists the developers, tools, and hosting services. The in-game **Fish collection** records the species caught during the current voyage.

### Expedition loop

Each fishing encounter consumes one bait when it appears, whether it is caught or missed. The Fisher's bait display stays visible during fishing; at zero, no new fish appear until the next checkpoint. The harpoon starts with and holds up to 20 bait; only an empty harpoon can be restocked with 10 bait for 15 gold at a checkpoint, and the price rises slowly after repeated purchases. A checkpoint opens after five catches in a leg or at 150 meters, whichever comes first; catches can therefore bring the crew to a checkpoint early. Sell the haul for crew gold, then spend it on shared hull, harpoon, lure, fuel, and bilge upgrades. At the current rarity weights, five catches average about 159 gold before upgrades, compared with 155 gold for one first-level purchase of each upgrade; actual hauls vary widely. Upgrade prices rise by 5% after each purchase, and every upgrade has a useful maximum level. Hull and bilge upgrades can reduce their related damage or buildup by up to 75%; the engine reduces routine fuel burn by up to 75%; the harpoon cuts reel inputs from 17 to 8; and the lure changes normalized rarity odds (Legendary about 4.4% to 7.9%, Mythic 0.44% to 0.91%, Treasure 0.0022% to 0.0058% from level 0 to 5). Missed catches can damage the hull and create new repairs; critical system faults rapidly drain their associated hull, fuel, or bilge resources until repaired. A breached hull ends the voyage.

The expedition includes the species listed in [`Fish.txt`](./Fish.txt), with each rarity's species priced from cheapest to most expensive in listed order and illustrated with procedural species art. After 1,000 catches without a Legendary, 5,000 without a Mythic, or 12,500 without Treasure, pity guarantees that rarity on the next encounter. The supplied rarity weights are normalized into a weighted roll; the lure upgrade improves the odds of higher rarities.

The menu and dive use the supplied music in `music/`; browser audio starts after the first user interaction. The in-game engine track is filtered to sound muffled underwater, with synthesized sound effects for controls, fishing, catches, repairs, and trading.

## Artwork and future changes

The game runs with CSS fallback art. To add your own images, follow the dimensions, filenames, and manifest instructions in [`assets/README.md`](assets/README.md). Markup lives in `index.html`, styling in `styles.css`, gameplay and relay client in `game.js`, relay configuration in `relay-config.js`, and replaceable artwork entries in `assets/manifest.js`. The relay server and its tests are in `relay/`; run them with `cd relay && npm install && npm test`.

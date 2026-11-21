# Can't Catch Me

A browser-based, online co-op game for two. The Fisher hooks and reels in strange deep-sea catches while the Engineer navigates between submarine rooms to repair failing systems.

## Play

Open `index.html` from a static web host, such as GitHub Pages, and make sure both players use the same hosted page. The Fisher selects **Make a room** and shares the six-character code; the other player enters it under **Join a room**. The Fisher hosts the game and the joining player is the Engineer. An internet connection is required for PeerJS room signaling and the peer-to-peer connection. If joining does not finish, the game now reports a timeout or connection error so the crew can check the code, host room, and network. **Play locally** starts a solo voyage and lets one player switch between both roles without an online room.

### Controls

- **Fisher:** WASD or arrow keys to steer during aim challenges, mouse to position the aim dot, arrow keys during rhythm challenges, and Space (or the on-screen button) to reel.
- **Engineer:** all active repairs appear together on the systems board. Open a repair, then follow its on-screen instructions; alignment uses left/right arrows, pumping uses Space or the pump button, and welding requires tracing the seam with a press-and-drag.

### Expedition loop

Catch fish and carry them to a 250-meter checkpoint to sell for crew gold. Spend gold on shared hull, harpoon, lure, fuel, and bilge upgrades. Each purchase raises that upgrade's next price by 5%. Missed catches can damage the hull and create new repairs; leaks, water, fuel faults, and a broken harpoon affect the whole crew. A breached hull ends the voyage.

Fish values follow the brainstorming notes: Trash 1, Common 5–10, Uncommon 15–20, Rare 30–40, Epic 45–60, Legendary 80–100, Mythic 120–150, and Treasure 300 gold. Each rarity can contain several species, including sprats, ribbon eels, glassfin, vampire squid, starwhales, and more. The supplied spawn figures (20%, 70%, 50%, 40%, 35%, 10%, 1%, and 0.005%) add up to more than 100%, so the game treats them as relative spawn weights and normalizes them into a valid weighted roll. The lure upgrade improves the odds of higher rarities.

## Artwork and future changes

The game runs with CSS fallback art. To add your own images, follow the dimensions, filenames, and manifest instructions in [`assets/README.md`](assets/README.md). Markup lives in `index.html`, styling in `styles.css`, gameplay and networking in `game.js`, and replaceable artwork entries in `assets/manifest.js`. The project has no build step or package install.

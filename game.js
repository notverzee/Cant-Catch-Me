(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const roomByType = {
    sequence: "Bridge",
    alignment: "Bridge",
    engine: "Engine room",
    fuel: "Engine room",
    water: "Pump room",
    valve: "Pump room",
    weld: "Hull",
    bolts: "Hull",
    harpoon: "Harpoon deck"
  };
  const issueInfo = {
    sequence: { name: "Signal relay", description: "Repeat the blinking light sequence.", instructions: "Memorize the short sequence, then tap the same tiles in order." },
    alignment: { name: "Level the submarine", description: "A sudden current has pitched the boat off balance.", instructions: "Turn the submarine toward level. Follow the angle indicator and use the arrows to trim it back to center." },
    engine: { name: "Restart the engine", description: "The engine needs a manual restart.", instructions: "Follow the arrow sequence to bring the engine back online." },
    fuel: { name: "Prime the fuel line", description: "The engine fuel line needs priming.", instructions: "Work the pump until the pressure gauge reaches the green zone and fuel flows again." },
    water: { name: "Pump out the bilge", description: "Water is collecting in the bilge.", instructions: "Build pressure with repeated pump strokes to clear the bilge before it rises further." },
    valve: { name: "Turn the loose valve", description: "A gas valve has come loose.", instructions: "Click the valve repeatedly to tighten it and stop the leak." },
    weld: { name: "Weld the hull", description: "A crack is spreading along the outer hull.", instructions: "Press and carefully drag the torch along the winding seam from START to FINISH." },
    bolts: { name: "Rescrew the bolts", description: "Several hull bolts are working loose.", instructions: "Find and secure all six loose bolts scattered across the hull plate." },
    harpoon: { name: "Replace the harpoon", description: "The harpoon mechanism is damaged.", instructions: "Complete each step to replace and reload the harpoon." }
  };
  const rarityData = [
    { key: "trash", name: "Trash", species: ["Lost Boot", "Crushed Can", "Old Teacup"], weight: 20, min: 1, max: 1, size: 1 },
    { key: "common", name: "Common", species: ["Lanternfish", "Blue Sprat", "Silver Smelt"], weight: 70, min: 5, max: 10, size: 1 },
    { key: "uncommon", name: "Uncommon", species: ["Moon Jelly", "Ribbon Eel", "Glass Shrimp"], weight: 50, min: 15, max: 20, size: 2 },
    { key: "rare", name: "Rare", species: ["Glassfin", "Cobalt Seahorse", "Spotted Fangfish"], weight: 40, min: 30, max: 40, size: 3 },
    { key: "epic", name: "Epic", species: ["Abyssal Ray", "Vampire Squid", "Frostscale Grouper"], weight: 35, min: 45, max: 60, size: 4 },
    { key: "legendary", name: "Legendary", species: ["Gilded Angler", "Crownfin Sturgeon", "Emberback Turtle"], weight: 10, min: 80, max: 100, size: 5 },
    { key: "mythic", name: "Mythic", species: ["Void Leviathan", "Starwhale", "Abyssal Dragonfish"], weight: 1, min: 120, max: 150, size: 6 },
    { key: "treasure", name: "Treasure", species: ["Sunken Treasure"], weight: 0.005, min: 300, max: 300, size: 8 }
  ];
  const arrowKeys = ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"];
  const arrowGlyph = { ArrowUp: "↑", ArrowRight: "→", ArrowDown: "↓", ArrowLeft: "←" };
  const weldPath = [[0, .5], [.1, .2], [.2, .4], [.3, .8], [.4, .58], [.5, .2], [.6, .35], [.7, .78], [.8, .55], [.9, .18], [1, .5]];
  const boltSpots = [[.1, .18], [.32, .22], [.57, .15], [.84, .22], [.18, .72], [.43, .82], [.68, .68], [.89, .78], [.5, .47], [.27, .48]];
  const upgrades = {
    hull: { name: "Reinforced hull", description: "Take less damage from leaks and impacts.", base: 35 },
    harpoon: { name: "Harpoon winch", description: "Reel in catches with fewer pulls.", base: 30 },
    lure: { name: "Rare-fish lure", description: "Improve the odds of higher rarities.", base: 40 },
    fuel: { name: "Efficient engine", description: "Slow the submarine's fuel use.", base: 25 },
    bilge: { name: "Bilge pump", description: "Slow water buildup and pump faster.", base: 25 }
  };
  const rarityByKey = Object.fromEntries(rarityData.map((item) => [item.key, item]));

  const el = {
    lobby: $("#lobby"),
    game: $("#game"),
    connectionLabel: $("#connection-label"),
    connectionMessage: $("#connection-message"),
    hostButton: $("#host-button"),
    roomDisplay: $("#room-display"),
    roomCode: $("#room-code"),
    joinForm: $("#join-form"),
    joinCode: $("#join-code"),
    practiceButton: $("#practice-button"),
    copyCode: $("#copy-code"),
    roleBadge: $("#role-badge"),
    leaveButton: $("#leave-button"),
    depth: $("#depth"),
    gold: $("#gold"),
    caughtCount: $("#caught-count"),
    checkpointDistance: $("#checkpoint-distance"),
    progressMeter: $("#progress-meter"),
    hullValue: $("#hull-value"),
    hullMeter: $("#hull-meter"),
    fuelValue: $("#fuel-value"),
    fuelMeter: $("#fuel-meter"),
    waterValue: $("#water-value"),
    waterMeter: $("#water-meter"),
    systemNote: $("#system-note"),
    subImage: $("#sub-image"),
    subFallback: $(".sub-fallback"),
    fishImage: $("#fish-image"),
    oceanScene: $(".ocean-scene"),
    encounterRarity: $("#encounter-rarity"),
    encounterTitle: $("#encounter-title"),
    encounterCopy: $("#encounter-copy"),
    fishingTaskTitle: $("#fishing-task-title"),
    fishingTaskHelp: $("#fishing-task-help"),
    fishingActions: $("#fishing-actions"),
    fisherOwner: $("#fisher-owner"),
    engineerOwner: $("#engineer-owner"),
    missionList: $("#mission-list"),
    repairPanel: $("#repair-panel"),
    repairRoomLabel: $("#repair-room-label"),
    repairTitle: $("#repair-title"),
    repairInstructions: $("#repair-instructions"),
    repairChallenge: $("#repair-challenge"),
    closeRepair: $("#close-repair"),
    fisherUpgradeSummary: $("#fisher-upgrade-summary"),
    engineerUpgradeSummary: $("#engineer-upgrade-summary"),
    crewMessage: $("#crew-message"),
    shopButton: $("#shop-button"),
    shopPanel: $("#shop-panel"),
    closeShop: $("#close-shop"),
    sellButton: $("#sell-button"),
    inventoryValue: $("#inventory-value"),
    inventoryCopy: $("#inventory-copy"),
    upgradeList: $("#upgrade-list"),
    netStatus: $("#net-status"),
    switchRole: $("#switch-role"),
    toast: $("#toast")
  };

  let gameState;
  let peer;
  let connection;
  let mode = "lobby";
  let localRole = "fisher";
  let selectedIssueId = null;
  let repairSignature = "";
  let hostTimer = null;
  let connectionTimer = null;
  let toastTimer = null;
  let weldPointerDown = false;
  let lastAimSent = 0;
  let lastReelSent = 0;

  function initialState() {
    return {
      depth: 0,
      nextCheckpoint: 250,
      checkpointOpen: false,
      hull: 100,
      fuel: 100,
      water: 0,
      gold: 0,
      caught: 0,
      inventory: [],
      issues: [],
      encounter: null,
      upgrades: { hull: 0, harpoon: 0, lure: 0, fuel: 0, bilge: 0 },
      purchases: { hull: 0, harpoon: 0, lure: 0, fuel: 0, bilge: 0 },
      seconds: 0,
      issueSpawnIn: 15,
      fishSpawnIn: 8,
      ended: false
    };
  }

  function showMessage(message, isError = false) {
    el.connectionMessage.textContent = message;
    el.connectionMessage.style.color = isError ? "var(--red)" : "var(--amber)";
  }

  function toast(message, warning = false) {
    el.toast.textContent = message;
    el.toast.classList.toggle("warning", warning);
    el.toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove("visible"), 2800);
  }

  function setConnectionLabel(message, online = false) {
    el.connectionLabel.textContent = message;
    $(".status-dot").classList.toggle("online", online);
  }

  function setImage(image, fallback, asset) {
    if (!asset || !asset.src) {
      image.hidden = true;
      if (fallback) fallback.hidden = false;
      return;
    }
    if (image.getAttribute("src") === asset.src && image.complete) {
      image.hidden = image.naturalWidth === 0;
      if (fallback) fallback.hidden = image.naturalWidth > 0;
      return;
    }
    image.hidden = true;
    image.style.objectFit = asset.fit || "contain";
    image.onload = () => {
      image.hidden = false;
      if (fallback) fallback.hidden = true;
    };
    image.onerror = () => {
      image.hidden = true;
      if (fallback) fallback.hidden = false;
    };
    image.src = asset.src;
  }

  function setupAimOverlay() {
    const target = document.createElement("div");
    target.className = "aim-target hidden";
    target.setAttribute("aria-hidden", "true");
    const dot = document.createElement("div");
    dot.className = "aim-dot hidden";
    dot.setAttribute("aria-hidden", "true");
    el.oceanScene.append(target, dot);
  }

  function resetRepairPanel() {
    selectedIssueId = null;
    repairSignature = "";
    el.repairPanel.classList.add("hidden");
    el.missionList.classList.remove("hidden");
  }

  function clearConnectionTimer() {
    clearTimeout(connectionTimer);
    connectionTimer = null;
  }

  function failJoin(message) {
    clearConnectionTimer();
    const pendingConnection = connection;
    const pendingPeer = peer;
    connection = null;
    peer = null;
    if (pendingConnection) pendingConnection.close();
    if (pendingPeer) pendingPeer.destroy();
    el.joinForm.querySelector("button").disabled = false;
    setConnectionLabel("Crew not connected");
    showMessage(message, true);
  }

  function enterGame(nextMode, role, state) {
    clearConnectionTimer();
    mode = nextMode;
    localRole = role;
    gameState = state || initialState();
    el.lobby.classList.add("hidden");
    el.game.classList.remove("hidden");
    $(".shell").classList.add("in-game");
    el.roleBadge.textContent = role.toUpperCase();
    el.switchRole.classList.toggle("hidden", mode !== "practice");
    el.netStatus.textContent = mode === "practice" ? "Solo practice · both stations available" : mode === "host" ? "Room open · waiting for your crewmate" : "Online crew connected";
    if (mode === "client") setConnectionLabel("Crew connected", true);
    selectedIssueId = null;
    repairSignature = "";
    if (mode === "host" || mode === "practice") startHostTimer();
    render();
  }

  function returnToLobby() {
    clearInterval(hostTimer);
    clearConnectionTimer();
    hostTimer = null;
    if (connection) {
      connection.close();
      connection = null;
    }
    if (peer) {
      peer.destroy();
      peer = null;
    }
    mode = "lobby";
    gameState = null;
    el.game.classList.add("hidden");
    $(".shell").classList.remove("in-game");
    el.lobby.classList.remove("hidden");
    el.roomDisplay.classList.add("hidden");
    el.hostButton.disabled = false;
    el.joinForm.querySelector("button").disabled = false;
    el.connectionMessage.textContent = "";
    el.roomCode.textContent = "------";
    setConnectionLabel("Crew not connected");
    resetRepairPanel();
  }

  function randomCode() {
    const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
    return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  }

  function startHostRoom() {
    if (!window.Peer) {
      showMessage("The online connection library could not load. Check your internet connection and reload.", true);
      return;
    }
    const code = randomCode();
    el.hostButton.disabled = true;
    showMessage("Opening a room…");
    peer = new window.Peer(`ccm-${code}`);
    peer.on("open", () => {
      el.roomCode.textContent = code;
      el.roomDisplay.classList.remove("hidden");
      showMessage("Room is ready. Keep this page open while your friend joins.");
      setConnectionLabel("Waiting for crew");
    });
    peer.on("connection", (incoming) => {
      if (connection) {
        incoming.close();
        return;
      }
      connection = incoming;
      connection.on("open", () => {
        enterGame("host", "fisher", gameState || initialState());
        setConnectionLabel("Crew connected", true);
        el.netStatus.textContent = "Online crew connected";
        sendState();
        toast("Crew connected. Happy hunting!");
      });
      connection.on("data", (message) => receiveMessage(message, "engineer"));
      connection.on("close", handleConnectionClose);
      connection.on("error", () => toast("The crew connection had a problem.", true));
    });
    peer.on("error", (error) => {
      el.hostButton.disabled = false;
      showMessage(error.type === "unavailable-id" ? "That room code is already in use. Try making another room." : `Could not open the room (${error.type || "network error"}). Check your connection and try again.`, true);
      if (peer) {
        peer.destroy();
        peer = null;
      }
    });
  }

  function joinRoom(code) {
    if (!window.Peer) {
      showMessage("The online connection library could not load. Check your internet connection and reload.", true);
      return;
    }
    const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (normalized.length !== 6) {
      showMessage("Enter the six-character room code.", true);
      return;
    }
    el.joinForm.querySelector("button").disabled = true;
    showMessage("Connecting to your crewmate…");
    setConnectionLabel("Connecting to crew");
    clearConnectionTimer();
    connectionTimer = setTimeout(() => {
      if (mode === "lobby") failJoin("Connection timed out. Check the room code, your internet connection, and that the host is still waiting.");
    }, 15000);
    peer = new window.Peer();
    peer.on("open", () => {
      clearConnectionTimer();
      connectionTimer = setTimeout(() => {
        if (mode === "lobby") failJoin("Connected to the room service, but the game did not respond. Ask the host to reopen the room and try again.");
      }, 15000);
      connection = peer.connect(`ccm-${normalized}`, { reliable: true });
      connection.on("open", () => {
        setConnectionLabel("Syncing crew");
        showMessage("Connected — syncing the voyage…");
      });
      connection.on("data", (message) => receiveMessage(message, "engineer"));
      connection.on("close", handleConnectionClose);
      connection.on("error", () => {
        if (mode === "lobby") failJoin("Could not reach that room. Check the code and try again.");
        else toast("The crew connection had a problem.", true);
      });
    });
    peer.on("error", (error) => {
      const message = error.type === "peer-unavailable" ? "That room is not open. Check the code and ask your friend to reopen it." : `Could not connect (${error.type || "network error"}). Check your connection and try again.`;
      if (mode === "lobby") failJoin(message);
      else toast(message, true);
    });
  }

  function handleConnectionClose() {
    if (mode === "lobby" && !connection && !peer) return;
    connection = null;
    setConnectionLabel("Crew disconnected");
    if (mode === "client") {
      el.netStatus.textContent = "Crew connection lost";
      toast("The connection to the host was lost.", true);
    } else if (mode === "lobby") {
      failJoin("The host closed the connection before the voyage synced. Check the code and try again.");
    } else if (mode === "host") {
      el.netStatus.textContent = "Crew disconnected · waiting for a new connection";
      toast("Your crewmate disconnected.", true);
      connection = null;
    }
  }

  function receiveMessage(message, senderRole) {
    if (!message || typeof message !== "object") return;
    if (message.type === "action" && (mode === "host" || mode === "practice")) {
      applyAction(message.action, message.data || {}, senderRole);
    } else if (message.type === "state" && mode !== "host" && message.state && typeof message.state === "object") {
      clearConnectionTimer();
      if (mode === "lobby") enterGame("client", "engineer", message.state);
      else gameState = message.state;
      render();
    } else if (message.type === "notice" && typeof message.text === "string") {
      toast(message.text, Boolean(message.warning));
    }
  }

  function broadcast(message) {
    if (connection && connection.open) {
      try {
        connection.send(message);
      } catch {
        toast("Could not send game update. The connection may be closed.", true);
      }
    }
  }

  function sendState() {
    if (mode === "host") broadcast({ type: "state", state: gameState });
  }

  function sendNotice(message, warning = false) {
    if (mode === "host") broadcast({ type: "notice", text: message, warning });
    toast(message, warning);
  }

  function sendAction(action, data = {}) {
    if (mode === "practice" || mode === "host") {
      applyAction(action, data, localRole);
    } else if (mode === "client" && connection && connection.open) {
      broadcast({ type: "action", action, data });
    }
  }

  function startHostTimer() {
    clearInterval(hostTimer);
    hostTimer = setInterval(() => {
      if (!gameState || mode === "client" || gameState.checkpointOpen) return;
      tick();
      render();
      sendState();
    }, 1000);
  }

  function pickRarity() {
    const lure = gameState.upgrades.lure;
    const weighted = rarityData.map((item) => ({
      ...item,
      weight: item.weight * (item.key === "trash" ? Math.max(.45, 1 - lure * .08) : item.key === "common" ? 1 : 1 + Math.max(0, item.size - 1) * lure * .08)
    }));
    const total = weighted.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;
    for (const item of weighted) {
      roll -= item.weight;
      if (roll <= 0) return item;
    }
    return weighted[0];
  }

  function spawnEncounter() {
    const rarity = pickRarity();
    const type = ["aim", "rhythm", "reel"][Math.floor(Math.random() * 3)];
    gameState.encounter = {
      id: `${Date.now()}-${Math.random()}`,
      rarity: rarity.key,
      species: rarity.species[Math.floor(Math.random() * rarity.species.length)],
      type,
      stage: "bite",
      timeLeft: 12,
      progress: 0,
      needed: type === "reel" ? Math.max(7, 15 - gameState.upgrades.harpoon * 2) : type === "aim" ? 6 : 5,
      sequence: type === "rhythm" ? Array.from({ length: 5 }, () => arrowKeys[Math.floor(Math.random() * 4)]) : [],
      seqIndex: 0,
      target: { x: .62 + Math.random() * .24, y: .32 + Math.random() * .36 },
      aim: { x: .15, y: .65 }
    };
    gameState.fishSpawnIn = 18 + Math.floor(Math.random() * 9) - gameState.upgrades.lure;
    sendNotice(`Something is on the sonar — ${rarity.name.toLowerCase()} catch!`);
  }

  function makeIssue() {
    if (gameState.issues.length >= 5) return;
    const available = Object.keys(issueInfo).filter((type) => !gameState.issues.some((issue) => issue.type === type));
    if (!available.length) return;
    const type = available[Math.floor(Math.random() * available.length)];
    let direction = Math.floor(Math.random() * 5) - 2;
    if (type === "alignment" && direction === 0) direction = Math.random() < .5 ? -1 : 1;
    const issue = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      room: roomByType[type],
      secondsLeft: 48 + Math.floor(Math.random() * 23),
      step: 0,
      progress: 0,
      angle: type === "alignment" ? Math.sign(direction) * (25 + Math.floor(Math.random() * 36)) : 0,
      pattern: type === "sequence" ? Array.from({ length: 5 }, () => Math.floor(Math.random() * 9)) : type === "engine" ? Array.from({ length: 4 }, () => arrowKeys[Math.floor(Math.random() * 4)]) : [],
      bolts: [],
      boltPositions: type === "bolts" ? randomBoltPositions() : [],
      expired: false
    };
    gameState.issues.push(issue);
    sendNotice(`${issueInfo[type].name} needs attention in the ${issue.room.toLowerCase()}.`, true);
  }

  function tick() {
    if (gameState.ended) return;
    gameState.seconds += 1;
    gameState.depth += gameState.fuel > 0 ? 1 : .2;
    gameState.fuel = Math.max(0, gameState.fuel - .045 * (1 - gameState.upgrades.fuel * .09));
    const hullMitigation = Math.max(.25, 1 - gameState.upgrades.hull * .08);
    for (const issue of gameState.issues) {
      if (issue.secondsLeft > 0) issue.secondsLeft -= 1;
      if (issue.secondsLeft <= 0 && !issue.expired) {
        issue.expired = true;
        sendNotice(`${issueInfo[issue.type].name} is getting worse!`, true);
      }
      const penalty = issue.expired ? 1.8 : 1;
      if (issue.type === "valve") gameState.hull = Math.max(0, gameState.hull - .12 * penalty * hullMitigation);
      if (issue.type === "weld" || issue.type === "bolts") gameState.hull = Math.max(0, gameState.hull - .08 * penalty * hullMitigation);
      if (issue.type === "water") gameState.water = Math.min(100, gameState.water + .18 * (1 - gameState.upgrades.bilge * .1) * penalty);
      if (issue.type === "fuel") gameState.fuel = Math.max(0, gameState.fuel - .4 * penalty);
    }
    if (gameState.water > 78) gameState.hull = Math.max(0, gameState.hull - .08 * hullMitigation);

    if (gameState.encounter) {
      const fish = gameState.encounter;
      if (fish.stage === "bite") {
        fish.timeLeft -= 1;
        if (fish.timeLeft <= 0) loseFish();
      } else {
        fish.timeLeft -= 1;
        if (fish.type === "aim") {
          fish.target.x = Math.min(.9, Math.max(.2, fish.target.x + (Math.random() - .5) * .1));
          fish.target.y = Math.min(.76, Math.max(.23, fish.target.y + (Math.random() - .5) * .1));
          const dx = fish.aim.x - fish.target.x;
          const dy = fish.aim.y - fish.target.y;
          if (Math.hypot(dx, dy) < .17) fish.progress = Math.min(fish.needed, fish.progress + 1);
          else fish.progress = Math.max(0, fish.progress - .35);
          if (fish.progress >= fish.needed) catchFish();
        }
        if (fish.timeLeft <= 0 && gameState.encounter) loseFish();
      }
    } else {
      gameState.fishSpawnIn -= 1;
      if (gameState.fishSpawnIn <= 0 && !gameState.issues.some((issue) => issue.type === "harpoon")) spawnEncounter();
    }

    gameState.issueSpawnIn -= 1;
    if (gameState.issueSpawnIn <= 0) {
      makeIssue();
      gameState.issueSpawnIn = 20 + Math.floor(Math.random() * 17);
    }

    if (gameState.depth >= gameState.nextCheckpoint) {
      gameState.checkpointOpen = true;
      sendNotice("Checkpoint reached! Trade your catch and refit the submarine.");
    }
    if (gameState.hull <= 0) {
      gameState.ended = true;
      sendNotice("Hull breached — this voyage is over. Start a new run to try again.", true);
    }
  }

  function catchFish() {
    if (!gameState.encounter) return;
    const rarity = rarityByKey[gameState.encounter.rarity];
    const value = rarity.min + Math.floor(Math.random() * (rarity.max - rarity.min + 1));
    gameState.inventory.push({ rarity: rarity.key, species: gameState.encounter.species, value });
    gameState.caught += 1;
    gameState.encounter = null;
    sendNotice(`${rarity.name} catch secured! Sell it at the next checkpoint.`);
  }

  function loseFish() {
    if (!gameState.encounter) return;
    const rarity = rarityByKey[gameState.encounter.rarity];
    const damage = Math.max(1, Math.round(rarity.size * 1.5 * (1 - Math.min(.65, gameState.upgrades.hull * .08))));
    gameState.hull = Math.max(0, gameState.hull - damage);
    gameState.encounter = null;
    if (Math.random() < .55) makeIssue();
    sendNotice(`The fish got away and struck the sub! Hull −${damage}%.`, true);
  }

  function issueById(id) {
    return gameState.issues.find((issue) => issue.id === id);
  }

  function finishIssue(issue) {
    gameState.issues = gameState.issues.filter((item) => item.id !== issue.id);
    selectedIssueId = null;
    repairSignature = "";
    sendNotice(`${issueInfo[issue.type].name} fixed. Nice work, engineer.`);
  }

  function applyAction(action, data, role) {
    if (!gameState) return;
    const allowed = role === "fisher" ? ["cast", "reel", "rhythm", "aimMove", "aimPosition", "restart"] : ["repair", "sell", "upgrade", "checkpointContinue", "restart"];
    if (!allowed.includes(action)) return;
    if (gameState.ended && action !== "restart") return;
    if (action === "restart") {
      if (!gameState.ended) return;
      gameState = initialState();
      resetRepairPanel();
      sendNotice("New voyage underway. Good luck, crew!");
    } else if (action === "cast" && role === "fisher") {
      const fish = gameState.encounter;
      if (fish && fish.stage === "bite" && !gameState.issues.some((issue) => issue.type === "harpoon")) {
        fish.stage = "hooked";
        fish.timeLeft = fish.type === "aim" ? 16 : 12;
        sendNotice(`${rarityByKey[fish.rarity].name} on the line!`);
      }
    } else if (action === "reel" && role === "fisher") {
      const fish = gameState.encounter;
      if (fish && fish.stage === "hooked" && fish.type === "reel") {
        fish.progress = Math.min(fish.needed, fish.progress + 1);
        if (fish.progress >= fish.needed) catchFish();
      }
    } else if (action === "rhythm" && role === "fisher") {
      const fish = gameState.encounter;
      if (fish && fish.stage === "hooked" && fish.type === "rhythm") {
        if (fish.sequence[fish.seqIndex] === data.key) {
          fish.seqIndex += 1;
          fish.progress = fish.seqIndex;
          if (fish.seqIndex >= fish.sequence.length) catchFish();
        } else {
          fish.seqIndex = Math.max(0, fish.seqIndex - 1);
        }
      }
    } else if (action === "aimMove" && role === "fisher") {
      const fish = gameState.encounter;
      if (fish && fish.stage === "hooked" && fish.type === "aim") {
        fish.aim.x = Math.min(.98, Math.max(.02, fish.aim.x + data.dx));
        fish.aim.y = Math.min(.95, Math.max(.05, fish.aim.y + data.dy));
      }
    } else if (action === "aimPosition" && role === "fisher") {
      const fish = gameState.encounter;
      if (fish && fish.stage === "hooked" && fish.type === "aim" && Number.isFinite(data.x) && Number.isFinite(data.y)) {
        fish.aim.x = Math.min(1, Math.max(0, data.x));
        fish.aim.y = Math.min(1, Math.max(0, data.y));
      }
    } else if (action === "repair" && role === "engineer") {
      const issue = issueById(data.id);
      if (issue && issue.room === data.room && (mode === "host" && role !== localRole || selectedIssueId === issue.id)) applyRepair(issue, data);
    } else if (action === "sell" && role === "engineer") {
      if (gameState.checkpointOpen && gameState.inventory.length) {
        const total = gameState.inventory.reduce((sum, fish) => sum + fish.value, 0);
        gameState.gold += total;
        gameState.inventory = [];
        sendNotice(`Catch sold for ${total} gold.`);
      }
    } else if (action === "upgrade" && role === "engineer") {
      buyUpgrade(data.key);
    } else if (action === "checkpointContinue" && role === "engineer" && gameState.checkpointOpen) {
      gameState.checkpointOpen = false;
      gameState.nextCheckpoint += 250;
      sendNotice("Back underway. Keep an eye on those systems.");
    }
    render();
    sendState();
  }

  function applyRepair(issue, data) {
    const finish = () => finishIssue(issue);
    if (issue.type === "sequence") {
      if (data.mode !== "sequence" || !Number.isInteger(data.index)) return;
      if (issue.pattern[issue.step] === data.index) {
        issue.step += 1;
        if (issue.step >= issue.pattern.length) finish();
      } else {
        issue.step = 0;
        sendNotice("Wrong tile — try the sequence again.", true);
      }
    } else if (issue.type === "engine") {
      if (data.mode !== "engine" || !arrowKeys.includes(data.key)) return;
      if (issue.pattern[issue.step] === data.key) {
        issue.step += 1;
        if (issue.step >= issue.pattern.length) finish();
      } else {
        issue.step = 0;
        sendNotice("The sequence reset. Try again.", true);
      }
    } else if (issue.type === "alignment") {
      if (data.mode !== "align" || ![-1, 1].includes(data.direction)) return;
      if (Math.abs(issue.angle) <= 15 && Math.sign(issue.angle) === data.direction) {
        issue.angle = 0;
        finish();
      } else {
        issue.angle = Math.max(-90, Math.min(90, issue.angle - data.direction * (Math.sign(issue.angle) === data.direction ? 15 : 10)));
      }
    } else if (issue.type === "valve") {
      if (data.mode !== "turn") return;
      issue.progress = Math.min(8, issue.progress + 1);
      if (issue.progress >= 8) finish();
    } else if (issue.type === "weld") {
      if (data.mode !== "weld" || !Number.isFinite(data.value)) return;
      issue.progress = Math.max(issue.progress, Math.min(issue.progress + .04, Math.min(1, Math.max(0, data.value))));
      if (issue.progress >= .99) finish();
    } else if (issue.type === "bolts") {
      if (data.mode !== "bolt" || !Number.isInteger(data.index) || data.index < 0 || data.index > 5) return;
      if (!issue.bolts.includes(data.index)) issue.bolts.push(data.index);
      if (issue.bolts.length >= 6) finish();
    } else if (issue.type === "harpoon") {
      if (data.mode !== "harpoon" || data.step !== issue.step) return;
      issue.step += 1;
      if (issue.step >= 3) finish();
    } else if (issue.type === "fuel" || issue.type === "water") {
      if (data.mode !== "pump") return;
      issue.progress = Math.min(9, issue.progress + 1 + Math.floor(gameState.upgrades.bilge / 2));
      if (issue.progress >= 9) {
        if (issue.type === "fuel") gameState.fuel = Math.min(100, gameState.fuel + 26);
        else gameState.water = Math.max(0, gameState.water - 32);
        finish();
      }
    }
  }

  function upgradeCost(key) {
    return Math.ceil(upgrades[key].base * Math.pow(1.05, gameState.purchases[key]));
  }

  function buyUpgrade(key) {
    if (!gameState.checkpointOpen || !upgrades[key]) return;
    const cost = upgradeCost(key);
    if (gameState.gold < cost) {
      sendNotice(`Not enough gold — ${upgrades[key].name} costs ${cost}.`, true);
      return;
    }
    gameState.gold -= cost;
    gameState.upgrades[key] += 1;
    gameState.purchases[key] += 1;
    sendNotice(`${upgrades[key].name} upgraded to level ${gameState.upgrades[key]}. Next price rises by 5%.`);
  }

  function progressMarkup(value, max) {
    const percent = Math.max(0, Math.min(100, (value / max) * 100));
    return `<div class="progress-track"><i style="width:${percent}%"></i></div>`;
  }

  function makeButton(text, attributes = {}, className = "mini-button") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = text;
    for (const [key, value] of Object.entries(attributes)) button.dataset[key] = String(value);
    return button;
  }

  function randomBoltPositions() {
    const positions = [...boltSpots];
    for (let index = positions.length - 1; index > 0; index--) {
      const swap = Math.floor(Math.random() * (index + 1));
      [positions[index], positions[swap]] = [positions[swap], positions[index]];
    }
    return positions.slice(0, 6);
  }

  function renderFishing() {
    const fish = gameState.encounter;
    const scene = el.oceanScene;
    const target = scene.querySelector(".aim-target");
    const dot = scene.querySelector(".aim-dot");
    target.classList.add("hidden");
    dot.classList.add("hidden");
    if (!fish) {
      el.encounterRarity.textContent = "SCANNING THE DEEP";
      el.encounterRarity.style.color = "";
      el.encounterTitle.textContent = "The water is quiet";
      el.encounterCopy.textContent = "A new catch could appear at any moment.";
      el.fishingTaskTitle.textContent = "Standing by";
      el.fishingTaskHelp.textContent = "Watch for a bite and follow the on-screen challenge.";
      el.fishingActions.replaceChildren(makeButton("Waiting for a bite", {}, "action-button"));
      el.fishingActions.firstElementChild.disabled = true;
      el.fishImage.hidden = true;
      $(".ocean-silhouette").hidden = false;
      return;
    }

    const rarity = rarityByKey[fish.rarity] || rarityByKey.common;
    el.encounterRarity.textContent = rarity.name.toUpperCase();
    el.encounterRarity.style.color = fish.rarity === "treasure" || fish.rarity === "mythic" ? "var(--amber)" : "";
    el.encounterTitle.textContent = fish.stage === "bite" ? "Something is on the line!" : fish.species || rarity.species[0];
    el.encounterCopy.textContent = fish.stage === "bite" ? "Get ready to hook it before it slips away." : `Keep it on the line · ${Math.max(0, fish.timeLeft)}s`;
    const asset = window.CCM_ASSETS && window.CCM_ASSETS.fish && window.CCM_ASSETS.fish[fish.rarity];
    setImage(el.fishImage, $(".ocean-silhouette"), asset);
    $(".ocean-silhouette").hidden = Boolean(asset);
    el.fishingActions.replaceChildren();

    if (fish.stage === "bite") {
      el.fishingTaskTitle.textContent = "A bite!";
      el.fishingTaskHelp.textContent = "Cast your harpoon before the fish gets away.";
      const button = makeButton("Cast harpoon", {}, "action-button");
      button.dataset.fishing = "cast";
      const harpoonOffline = gameState.issues.some((issue) => issue.type === "harpoon");
      if (harpoonOffline) button.textContent = "Harpoon offline";
      button.disabled = localRole !== "fisher" || harpoonOffline || gameState.ended;
      el.fishingActions.append(button);
      return;
    }

    if (fish.type === "aim") {
      el.fishingTaskTitle.textContent = "Keep the aim steady";
      el.fishingTaskHelp.textContent = "Move the dot into the drifting ring and hold it there. Use mouse or WASD / arrows.";
      target.classList.remove("hidden");
      dot.classList.remove("hidden");
      target.style.left = `${fish.target.x * 100}%`;
      target.style.top = `${fish.target.y * 100}%`;
      dot.style.left = `${fish.aim.x * 100}%`;
      dot.style.top = `${fish.aim.y * 100}%`;
      el.fishingActions.innerHTML = progressMarkup(fish.progress, fish.needed);
    } else if (fish.type === "rhythm") {
      el.fishingTaskTitle.textContent = "Match the rhythm";
      el.fishingTaskHelp.textContent = "Press the arrows in sequence before the line goes slack.";
      const keys = document.createElement("div");
      keys.className = "rhythm-keys";
      fish.sequence.forEach((key, index) => {
        const span = document.createElement("span");
        span.className = `rhythm-key${index < fish.seqIndex ? " hit" : ""}${index === fish.seqIndex ? " next" : ""}`;
        span.textContent = arrowGlyph[key];
        span.setAttribute("role", "button");
        span.tabIndex = localRole === "fisher" ? 0 : -1;
        span.dataset.fishing = "rhythm";
        span.dataset.key = key;
        keys.append(span);
      });
      el.fishingActions.append(keys);
    } else {
      el.fishingTaskTitle.textContent = "Reel it in!";
      el.fishingTaskHelp.textContent = "Tap fast or press Space to keep the fish on the line.";
      const button = makeButton("REEL  ·  SPACE", {}, "action-button");
      button.dataset.fishing = "reel";
      button.disabled = localRole !== "fisher" || gameState.ended;
      el.fishingActions.append(button, document.createRange().createContextualFragment(progressMarkup(fish.progress, fish.needed)));
    }
  }

  function renderRooms() {
    el.missionList.replaceChildren();
    const heading = document.createElement("div");
    heading.className = "mission-list-heading";
    heading.textContent = gameState.issues.length ? `ACTIVE CALLS · ${gameState.issues.length}` : "SYSTEMS";
    el.missionList.append(heading);
    if (!gameState.issues.length) {
      const empty = document.createElement("div");
      empty.className = "mission-empty";
      const title = document.createElement("b");
      title.textContent = "Room clear";
      const note = document.createElement("span");
      note.textContent = "Keep an eye on the board for new trouble.";
      empty.append(title, note);
      el.missionList.append(empty);
      resetRepairPanel();
      return;
    }
    const issues = [...gameState.issues].sort((a, b) => a.secondsLeft - b.secondsLeft);
    for (const issue of issues) {
      const row = document.createElement("div");
      row.className = `mission-row${selectedIssueId === issue.id ? " selected" : ""}`;
      const details = document.createElement("div");
      details.className = "mission-details";
      const location = document.createElement("span");
      location.className = "mission-room";
      location.textContent = issue.room;
      const name = document.createElement("b");
      name.textContent = issueInfo[issue.type].name;
      const desc = document.createElement("span");
      desc.textContent = issueInfo[issue.type].description;
      details.append(location, name, desc);
      const open = makeButton("Repair", { issue: issue.id }, "action-button");
      open.disabled = localRole !== "engineer" || gameState.ended;
      row.append(details, open);
      if (issue.expired) {
        const label = document.createElement("span");
        label.className = "danger-label";
        label.textContent = "CRITICAL";
        row.append(label);
      } else {
        desc.textContent += ` · ${issue.secondsLeft}s`;
      }
      el.missionList.append(row);
    }
  }

  function renderRepair() {
    const issue = selectedIssueId && issueById(selectedIssueId);
    if (!issue) {
      resetRepairPanel();
      return;
    }
    el.repairPanel.classList.remove("hidden");
    el.repairRoomLabel.textContent = issue.room.toUpperCase();
    el.repairTitle.textContent = issueInfo[issue.type].name;
    el.repairInstructions.textContent = issueInfo[issue.type].instructions;
    const signature = `${issue.id}:${issue.type}`;
    if (signature !== repairSignature) {
      repairSignature = signature;
      el.repairChallenge.replaceChildren();
      if (issue.type === "sequence") {
        const preview = document.createElement("div");
        preview.className = "sequence-preview";
        preview.textContent = issue.pattern.map((index) => index + 1).join("  ·  ");
        el.repairChallenge.append(preview);
        const grid = document.createElement("div");
        grid.className = "sequence-grid";
        for (let index = 0; index < 9; index++) grid.append(makeButton(String(index + 1), { repair: "sequence", index }));
        el.repairChallenge.append(grid);
        setTimeout(() => {
          if (preview.isConnected) preview.classList.add("concealed");
        }, 2400);
      } else if (issue.type === "alignment") {
        const controls = document.createElement("div");
        controls.className = "alignment-console";
        const dial = document.createElement("div");
        dial.className = "alignment-dial";
        const submarine = document.createElement("div");
        submarine.className = "alignment-sub";
        submarine.setAttribute("role", "img");
        submarine.setAttribute("aria-label", "Submarine angle indicator");
        submarine.innerHTML = '<svg viewBox="0 0 120 48" aria-hidden="true"><path d="M16 28h84l-9 10H27zM41 28l7-12h25l9 12M53 16V9h12v7" /><circle cx="40" cy="31" r="3"/><circle cx="58" cy="31" r="3"/><circle cx="76" cy="31" r="3"/></svg>';
        const level = document.createElement("span");
        level.className = "alignment-level";
        level.textContent = "LEVEL";
        dial.append(submarine, level);
        const left = makeButton("↶", { repair: "align", direction: "-1" }, "alignment-button");
        left.setAttribute("aria-label", "Trim left");
        const right = makeButton("↷", { repair: "align", direction: "1" }, "alignment-button");
        right.setAttribute("aria-label", "Trim right");
        controls.append(left, dial, right);
        el.repairChallenge.append(controls);
      } else if (issue.type === "engine") {
        const preview = document.createElement("div");
        preview.className = "sequence-preview";
        preview.textContent = issue.pattern.map((key) => arrowGlyph[key]).join("  ·  ");
        el.repairChallenge.append(preview);
        const buttons = document.createElement("div");
        buttons.className = "sequence-grid arrow-grid";
        arrowKeys.forEach((key) => buttons.append(makeButton(arrowGlyph[key], { repair: "engine", key })));
        el.repairChallenge.append(buttons);
      } else if (issue.type === "valve") {
        const valve = makeButton("↻  TURN VALVE", { repair: "turn" }, "mini-button valve-button");
        el.repairChallenge.append(valve);
      } else if (issue.type === "weld") {
        const track = document.createElement("div");
        track.className = "weld-track";
        track.dataset.repair = "weld";
        track.dataset.id = issue.id;
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 1000 300");
        svg.setAttribute("preserveAspectRatio", "none");
        svg.setAttribute("aria-hidden", "true");
        const seam = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        seam.setAttribute("points", weldPath.map(([x, y]) => `${x * 1000},${y * 300}`).join(" "));
        svg.append(seam);
        const dot = document.createElement("span");
        dot.className = "weld-dot";
        const start = document.createElement("span");
        start.className = "weld-label weld-start";
        start.textContent = "START";
        const finish = document.createElement("span");
        finish.className = "weld-label weld-finish";
        finish.textContent = "FINISH";
        track.append(svg, dot, start, finish);
        el.repairChallenge.append(track);
      } else if (issue.type === "bolts") {
        const field = document.createElement("div");
        field.className = "bolt-field";
        for (let index = 0; index < 6; index++) {
          const bolt = makeButton("✣", { repair: "bolt", index }, "mini-button bolt-button");
          const [x, y] = issue.boltPositions[index];
          bolt.style.left = `${x * 100}%`;
          bolt.style.top = `${y * 100}%`;
          bolt.title = `Secure bolt ${index + 1}`;
          field.append(bolt);
        }
        el.repairChallenge.append(field);
      } else if (issue.type === "harpoon") {
        const steps = ["Remove", "Replace", "Reload"];
        for (let index = 0; index < steps.length; index++) el.repairChallenge.append(makeButton(steps[index], { repair: "harpoon", step: index }));
      } else {
        const rig = document.createElement("div");
        rig.className = "pump-rig";
        const gauge = document.createElement("div");
        gauge.className = "pump-gauge";
        const gaugeFill = document.createElement("i");
        gauge.append(gaugeFill);
        const reading = document.createElement("span");
        reading.className = "pump-reading";
        reading.textContent = "0 / 9 strokes";
        const pump = makeButton(issue.type === "fuel" ? "↓  PUMP FUEL" : "↓  PUMP BILGE", { repair: "pump" }, "mini-button pump-button");
        rig.append(gauge, reading, pump);
        el.repairChallenge.append(rig);
      }
      const track = document.createElement("div");
      track.className = "progress-track repair-progress";
      track.innerHTML = "<i></i>";
      if (issue.type !== "fuel" && issue.type !== "water") el.repairChallenge.append(track);
    }
    const progress = el.repairChallenge.querySelector(".repair-progress i");
    if (progress) {
      const max = issue.type === "sequence" ? issue.pattern.length : issue.type === "engine" ? issue.pattern.length : issue.type === "valve" ? 8 : issue.type === "bolts" ? 6 : issue.type === "harpoon" ? 3 : issue.type === "weld" ? 1 : issue.type === "alignment" ? 90 : 9;
      const value = issue.type === "sequence" || issue.type === "engine" || issue.type === "harpoon" ? issue.step : issue.type === "bolts" ? issue.bolts.length : issue.type === "alignment" ? max - Math.abs(issue.angle) : issue.progress;
      progress.style.width = `${Math.max(0, Math.min(100, value / max * 100))}%`;
    }
    const submarine = el.repairChallenge.querySelector(".alignment-sub");
    if (submarine) submarine.style.transform = `rotate(${issue.angle}deg)`;
    const pumpFill = el.repairChallenge.querySelector(".pump-gauge i");
    if (pumpFill) pumpFill.style.width = `${Math.min(100, issue.progress / 9 * 100)}%`;
    const pumpReading = el.repairChallenge.querySelector(".pump-reading");
    if (pumpReading) pumpReading.textContent = `${Math.min(9, issue.progress)} / 9 strokes`;
    el.repairChallenge.querySelectorAll("[data-repair='bolt']").forEach((button) => {
      const complete = issue.bolts.includes(Number(button.dataset.index));
      button.classList.toggle("done", complete);
      button.disabled = complete || localRole !== "engineer" || gameState.ended;
    });
    el.repairChallenge.querySelectorAll("button[data-repair]").forEach((button) => {
      if (!button.hasAttribute("data-index") || issue.type !== "bolts") button.disabled = localRole !== "engineer" || gameState.ended;
    });
    const weldDot = el.repairChallenge.querySelector(".weld-dot");
    if (weldDot) {
      const segment = Math.min(weldPath.length - 2, Math.floor(issue.progress * (weldPath.length - 1)));
      const fraction = issue.progress * (weldPath.length - 1) - segment;
      const from = weldPath[segment];
      const to = weldPath[segment + 1];
      weldDot.style.left = `${(from[0] + (to[0] - from[0]) * fraction) * 100}%`;
      weldDot.style.top = `${(from[1] + (to[1] - from[1]) * fraction) * 100}%`;
    }
  }

  function renderShop() {
    const open = gameState.checkpointOpen;
    el.shopButton.classList.toggle("hidden", !open);
    el.shopPanel.classList.toggle("hidden", !open || !el.shopPanel.dataset.open);
    if (!open) delete el.shopPanel.dataset.open;
    const total = gameState.inventory.reduce((sum, fish) => sum + fish.value, 0);
    el.inventoryValue.textContent = `+${total} ◈`;
    el.sellButton.disabled = !open || total === 0 || localRole !== "engineer" || gameState.ended;
    const species = [...new Set(gameState.inventory.map((fish) => fish.species).filter(Boolean))];
    el.inventoryCopy.textContent = gameState.inventory.length
      ? `${gameState.inventory.length} fish in the hold${species.length ? ` · ${species.join(", ")}` : ""}. Sell the haul to fund crew upgrades.`
      : "Your hold is empty. Catch fish to sell them for gold.";
    el.upgradeList.replaceChildren();
    for (const [key, item] of Object.entries(upgrades)) {
      const card = document.createElement("div");
      card.className = "upgrade-card";
      const name = document.createElement("b");
      name.textContent = `${item.name} · Lv ${gameState.upgrades[key]}`;
      const description = document.createElement("small");
      description.textContent = item.description;
      const buy = makeButton(`Buy · ${upgradeCost(key)} ◈`, { upgrade: key }, "");
      buy.disabled = !open || gameState.gold < upgradeCost(key) || localRole !== "engineer" || gameState.ended;
      card.append(name, description, buy);
      el.upgradeList.append(card);
    }
  }

  function render() {
    if (!gameState) return;
    el.roleBadge.textContent = localRole.toUpperCase();
    el.fisherOwner.textContent = mode === "practice" ? "PRACTICE" : mode === "host" ? "YOU" : "CREWMATE";
    el.engineerOwner.textContent = mode === "practice" ? "PRACTICE" : mode === "host" ? (connection ? "CREWMATE" : "WAITING") : "YOU";
    el.depth.textContent = Math.floor(gameState.depth);
    el.gold.textContent = Math.floor(gameState.gold);
    el.caughtCount.textContent = gameState.caught;
    el.checkpointDistance.textContent = Math.max(0, gameState.nextCheckpoint - Math.floor(gameState.depth));
    el.progressMeter.style.width = `${Math.min(100, (gameState.depth % 250) / 250 * 100)}%`;
    el.hullValue.textContent = `${Math.round(gameState.hull)}%`;
    el.hullMeter.style.width = `${Math.max(0, gameState.hull)}%`;
    el.fuelValue.textContent = `${Math.round(gameState.fuel)}%`;
    el.fuelMeter.style.width = `${Math.max(0, gameState.fuel)}%`;
    el.waterValue.textContent = `${Math.round(gameState.water)}%`;
    el.waterMeter.style.width = `${Math.max(0, gameState.water)}%`;
    $(".system-meter").classList.toggle("danger", gameState.hull < 30);
    document.querySelector(".fisher-station").classList.toggle("smoke-active", gameState.issues.some((issue) => issue.type === "valve"));
    el.systemNote.textContent = gameState.ended ? "HULL BREACHED · VOYAGE OVER" : gameState.issues.some((issue) => issue.type === "valve") ? "Gas leak · valve repair needed" : gameState.issues.some((issue) => issue.type === "harpoon") ? "Harpoon offline" : gameState.water > 55 ? "Bilge water rising" : gameState.issues.length ? `${gameState.issues.length} system issue${gameState.issues.length === 1 ? "" : "s"} active` : "All systems nominal";
    const assets = window.CCM_ASSETS || {};
    setImage(el.subImage, el.subFallback, assets.submarine);
    el.switchRole.textContent = `Switch to ${localRole === "fisher" ? "engineer" : "fisher"} practice role`;
    el.crewMessage.textContent = gameState.ended ? "Hull breached. Start a new voyage to play again." : gameState.issues.length ? `${gameState.issues.length} issue${gameState.issues.length === 1 ? "" : "s"} need attention` : gameState.encounter ? "A catch is on the line — work together!" : gameState.checkpointOpen ? "Checkpoint reached — sell and upgrade before the next leg." : "A good crew keeps talking.";
    $("#game-over").classList.toggle("hidden", !gameState.ended);
    renderFishing();
    renderRooms();
    renderRepair();
    renderShop();
    document.querySelector(".fisher-station").classList.toggle("station-inactive", localRole !== "fisher" && mode !== "practice");
    document.querySelector(".engineer-station").classList.toggle("station-inactive", localRole !== "engineer" && mode !== "practice");
    el.fisherUpgradeSummary.textContent = `Harpoon winch ${roman(gameState.upgrades.harpoon + 1)}`;
    const fisherSub = document.createElement("span");
    fisherSub.textContent = "Reel-in bonus active";
    el.fisherUpgradeSummary.append(fisherSub);
    el.engineerUpgradeSummary.textContent = `Reinforced hull ${roman(gameState.upgrades.hull + 1)}`;
    const engineerSub = document.createElement("span");
    engineerSub.textContent = "Reduces incoming damage";
    el.engineerUpgradeSummary.append(engineerSub);
    if (gameState.checkpointOpen && !el.shopPanel.dataset.open) el.shopButton.classList.remove("hidden");
  }

  function roman(value) {
    return ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][Math.min(9, value - 1)] || `${value}`;
  }

  function handleFishingClick(event) {
    const button = event.target.closest("[data-fishing]");
    if (!button || localRole !== "fisher" || gameState.ended) return;
    if (button.dataset.fishing === "cast") sendAction("cast");
    if (button.dataset.fishing === "reel") sendAction("reel");
    if (button.dataset.fishing === "rhythm") sendAction("rhythm", { key: button.dataset.key });
  }

  function handleRepairClick(event) {
    const button = event.target.closest("[data-repair]");
    if (!button || localRole !== "engineer" || !selectedIssueId) return;
    const issue = issueById(selectedIssueId);
    if (!issue) return;
    const modeName = button.dataset.repair;
    const data = { id: issue.id, room: issue.room, mode: modeName };
    if (modeName === "sequence" || modeName === "bolt") data.index = Number(button.dataset.index);
    if (modeName === "engine") data.key = button.dataset.key;
    if (modeName === "align") data.direction = Number(button.dataset.direction);
    if (modeName === "harpoon") data.step = Number(button.dataset.step);
    sendAction("repair", data);
  }

  function handleKeyboard(event) {
    if (mode === "lobby" || gameState.ended || event.altKey || event.ctrlKey || event.metaKey) return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
    if (localRole === "fisher" && gameState.encounter && gameState.encounter.stage === "hooked") {
      const fish = gameState.encounter;
      if (fish.type === "rhythm" && arrowKeys.includes(event.key) && !event.repeat) sendAction("rhythm", { key: event.key });
      if (fish.type === "aim") {
        const move = {
          ArrowUp: [0, -.08], w: [0, -.08], ArrowDown: [0, .08], s: [0, .08],
          ArrowLeft: [-.08, 0], a: [-.08, 0], ArrowRight: [.08, 0], d: [.08, 0]
        }[event.key];
        if (move) sendAction("aimMove", { dx: move[0], dy: move[1] });
      }
      if (fish.type === "reel" && event.code === "Space" && Date.now() - lastReelSent > 95) {
        lastReelSent = Date.now();
        sendAction("reel");
      }
    }
    if (localRole === "engineer" && selectedIssueId && !event.repeat) {
      const issue = issueById(selectedIssueId);
      if (issue && issue.type === "alignment" && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        sendAction("repair", { id: issue.id, room: issue.room, mode: "align", direction: event.key === "ArrowRight" ? 1 : -1 });
      } else if (issue && issue.type === "engine" && arrowKeys.includes(event.key)) {
        sendAction("repair", { id: issue.id, room: issue.room, mode: "engine", key: event.key });
      } else if (issue && (issue.type === "fuel" || issue.type === "water") && event.code === "Space") {
        sendAction("repair", { id: issue.id, room: issue.room, mode: "pump" });
      }
    }
  }

  function handleOceanPointer(event) {
    if (localRole !== "fisher" || !gameState || !gameState.encounter || gameState.encounter.type !== "aim" || gameState.encounter.stage !== "hooked") return;
    if (Date.now() - lastAimSent < 60) return;
    lastAimSent = Date.now();
    const rect = el.oceanScene.getBoundingClientRect();
    sendAction("aimPosition", { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height });
  }

  function handleWeldPointerMove(event) {
    const track = event.target.closest(".weld-track");
    if (!track || !weldPointerDown || localRole !== "engineer" || !selectedIssueId) return;
    const rect = track.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    const issue = issueById(selectedIssueId);
    if (!issue || issue.type !== "weld") return;
    let nearest = { progress: 0, distance: Infinity };
    for (let index = 0; index < weldPath.length - 1; index++) {
      const [x1, y1] = weldPath[index];
      const [x2, y2] = weldPath[index + 1];
      const dx = (x2 - x1) * rect.width;
      const dy = (y2 - y1) * rect.height;
      const lengthSquared = dx * dx + dy * dy;
      const projection = Math.max(0, Math.min(1, ((x - x1) * rect.width * dx + (y - y1) * rect.height * dy) / lengthSquared));
      const px = x1 + (x2 - x1) * projection;
      const py = y1 + (y2 - y1) * projection;
      const distance = Math.hypot((x - px) * rect.width, (y - py) * rect.height);
      if (distance < nearest.distance) nearest = { progress: (index + projection) / (weldPath.length - 1), distance };
    }
    if (nearest.distance <= 24 && nearest.progress > issue.progress + .012 && nearest.progress <= issue.progress + .08) {
      sendAction("repair", { id: issue.id, room: issue.room, mode: "weld", value: nearest.progress });
    }
  }

  function bindEvents() {
    el.hostButton.addEventListener("click", startHostRoom);
    el.joinForm.addEventListener("submit", (event) => {
      event.preventDefault();
      joinRoom(el.joinCode.value);
    });
    el.joinCode.addEventListener("input", () => {
      el.joinCode.value = el.joinCode.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    });
    el.copyCode.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(el.roomCode.textContent);
        el.copyCode.textContent = "COPIED";
        setTimeout(() => { el.copyCode.textContent = "COPY"; }, 1200);
      } catch {
        showMessage("Copy was blocked by the browser. Select the room code and copy it manually.", true);
      }
    });
    el.practiceButton.addEventListener("click", () => enterGame("practice", "fisher", initialState()));
    el.leaveButton.addEventListener("click", returnToLobby);
    $("#restart-button").addEventListener("click", () => sendAction("restart"));
    el.switchRole.addEventListener("click", () => {
      if (mode !== "practice") return;
      localRole = localRole === "fisher" ? "engineer" : "fisher";
      render();
    });
    el.fishingActions.addEventListener("click", handleFishingClick);
    el.missionList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-issue]");
      if (!button || localRole !== "engineer") return;
      selectedIssueId = button.dataset.issue;
      repairSignature = "";
      render();
    });
    el.repairChallenge.addEventListener("click", handleRepairClick);
    el.repairChallenge.addEventListener("pointerdown", (event) => {
      const track = event.target.closest(".weld-track");
      if (track) {
        weldPointerDown = true;
        track.setPointerCapture(event.pointerId);
        handleWeldPointerMove(event);
      }
    });
    el.repairChallenge.addEventListener("pointermove", handleWeldPointerMove);
    el.repairChallenge.addEventListener("pointerup", () => { weldPointerDown = false; });
    el.repairChallenge.addEventListener("pointercancel", () => { weldPointerDown = false; });
    el.closeRepair.addEventListener("click", resetRepairPanel);
    el.oceanScene.addEventListener("pointermove", handleOceanPointer);
    el.shopButton.addEventListener("click", () => {
      el.shopPanel.dataset.open = "true";
      renderShop();
      el.shopPanel.classList.remove("hidden");
    });
    el.closeShop.addEventListener("click", () => {
      el.shopPanel.classList.remove("hidden");
      sendAction("checkpointContinue");
    });
    el.sellButton.addEventListener("click", () => sendAction("sell"));
    el.upgradeList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-upgrade]");
      if (button && localRole === "engineer") sendAction("upgrade", { key: button.dataset.upgrade });
    });
    window.addEventListener("keydown", handleKeyboard);
  }

  setupAimOverlay();
  bindEvents();
})();

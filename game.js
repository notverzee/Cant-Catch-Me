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
    barnacles: "Hull",
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
    bolts: { name: "Rescrew the bolts", description: "Several hull bolts are working loose.", instructions: "Find all six loose bolts and turn each one three times to secure the hull plate." },
    barnacles: { name: "Scrape the barnacles", description: "A thick colony is dragging along the hull.", instructions: "Aim the robotic scraper at every barnacle cluster and clear the hull before the drag gets worse." },
    harpoon: { name: "Replace the harpoon", description: "The harpoon mechanism is damaged.", instructions: "Complete each step to replace and reload the harpoon." }
  };
  const rarityData = [
    { key: "trash", name: "Trash", species: ["Can", "Boot", "Tire"], weight: 20, min: 0, max: 1, size: 1 },
    { key: "common", name: "Common", species: ["Blue Gill", "Yellow Perch", "Common Carp", "Rainbow Trout", "Largemouth Bass", "Channel Catfish", "Sardine", "Atlantic Mackerel", "Tilapia", "Goldfish"], weight: 70, min: 5, max: 10, size: 1 },
    { key: "uncommon", name: "Uncommon", species: ["Northern Pike", "Walleye", "Clownfish", "Lionfish", "Moray Eel", "Red Snapper", "Angelfish", "Atlantic Cod", "Haddock", "Flounder"], weight: 50, min: 15, max: 25, size: 2 },
    { key: "rare", name: "Rare", species: ["Arowana", "Swordfish", "Mahi-Mahi", "Electric Eel", "Pufferfish", "Blue Tang", "Barracuda", "Sailfish", "Triggerfish", "Atlantic Halibut"], weight: 40, min: 30, max: 45, size: 3 },
    { key: "epic", name: "Epic", species: ["Ocean Sunfish", "Oarfish", "Giant Grouper", "Blue Marlin", "Coelacanth", "Arapaima", "Giant Freshwater Stingray", "Sturgeon", "Napoleon Wrasse", "Greenland Shark"], weight: 35, min: 55, max: 85, size: 4 },
    { key: "legendary", name: "Legendary", species: ["Great White Shark", "Whale Shark", "Basking Shark", "Goblin Shark", "Megamouth Shark", "Frilled Shark", "Bluefin Tuna", "Sawfish", "Greenland Halibut", "Shortfin Mako Shark"], weight: 10, min: 100, max: 180, size: 5 },
    { key: "mythic", name: "Mythic", species: ["Black Dragonfish", "Deep Sea Anglerfish", "Pelican Eel", "Gulper Eel", "Barreleye Fish", "Fangtooth Fish", "Viperfish", "Lanternfish", "Hatchetfish", "Tripod Fish"], weight: 1, min: 220, max: 400, size: 6 },
    { key: "treasure", name: "Treasure", species: ["Gold", "Chest"], weight: 0.005, min: 500, max: 1200, size: 8, values: { Gold: 500, Chest: 1200 } }
  ];
  rarityData.forEach((rarity) => {
    if (rarity.values) return;
    rarity.values = Object.fromEntries(rarity.species.map((species, index) => [
      species,
      Math.round(rarity.min + (rarity.max - rarity.min) * index / (rarity.species.length - 1))
    ]));
  });
  const pityThresholds = { legendary: 1000, mythic: 5000, treasure: 12500 };
  const checkpointDistance = 150;
  const fishPerCheckpoint = 5;
  const baitCapacity = 20;
  const baitRestockAmount = 10;
  const baseBaitPrice = 15;
  const chatPhrases = [
    "Fish on the line!", "Hull needs help!", "Harpoon is broken!", "Repair the engine!",
    "Restock bait at the checkpoint!", "Let's buy the hull upgrade.", "Save our gold for bait.",
    "Sell the catch now?", "I vote for the fuel upgrade.", "Hold our gold for the next checkpoint.",
    "Great catch!", "I am cleaning the barnacles.", "My fishing line is tangled!"
  ];
  const storyCards = [
    { title: "A promise below the waves", text: "Your great-grandfather's family was poor and buried in debt. He set out to catch exotic fish, hoping the haul could pay what they owed and give his children a future.", stage: "departure" },
    { title: "The last signal", text: "His submarine imploded in the deepest water before he could return. His remains and the wreck were lost below, leaving only a fading sonar trace.", stage: "descent" },
    { title: "The next generation", text: "Generations later, his great-grandchildren borrow a submarine and follow that trace. Catch exotic fish to lift the family out of debt, keep the borrowed sub alive, and bring their great-grandfather and his lost vessel home.", stage: "legacy" }
  ];
  const arrowKeys = ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"];
  const arrowNames = { ArrowUp: "up", ArrowRight: "right", ArrowDown: "down", ArrowLeft: "left" };
  const arrowPaths = {
    ArrowUp: "M12 19V5m-6 6 6-6 6 6",
    ArrowRight: "M5 12h14m-6-6 6 6-6 6",
    ArrowDown: "M12 5v14m6-6-6 6-6-6",
    ArrowLeft: "M19 12H5m6 6-6-6 6-6"
  };
  const wasdKeys = { w: "ArrowUp", d: "ArrowRight", s: "ArrowDown", a: "ArrowLeft" };
  const weldPath = [[.02, .5], [.1, .2], [.2, .4], [.3, .8], [.4, .58], [.5, .2], [.6, .35], [.7, .78], [.8, .55], [.9, .18], [.98, .5]];
  const boltSpots = [[.1, .18], [.32, .22], [.57, .15], [.84, .22], [.18, .72], [.43, .82], [.68, .68], [.89, .78], [.5, .47], [.27, .48]];
  const upgrades = {
    hull: { name: "Reinforced hull", description: "Reduce hull damage from impacts and leaks by up to 75%.", base: 35 },
    harpoon: { name: "Harpoon winch", description: "Reel in catches with fewer pulls (minimum 8).", base: 30 },
    lure: { name: "Rare-fish lure", description: "Improve rare catch odds and shorten sonar waits.", base: 40 },
    fuel: { name: "Efficient engine", description: "Slow routine fuel burn by up to 75%.", base: 25 },
    bilge: { name: "Bilge pump", description: "Slow water buildup and require fewer pump strokes.", base: 25 }
  };
  const upgradeMaxLevels = { hull: 10, harpoon: 5, lure: 5, fuel: 5, bilge: 5 };
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
    menuTabs: $("#menu-tabs"),
    localButton: $("#local-button"),
    soloButton: $("#solo-button"),
    menuMusic: $("#menu-music"),
    engineSound: $("#engine-sound"),
    baitCount: $("#bait-count"),
    fisherTimer: $("#fisher-timer"),
    harpoonWarning: $("#harpoon-warning"),
    swimmingFish: $("#swimming-fish"),
    shoalCursor: $("#shoal-cursor"),
    quickChat: $("#quick-chat"),
    quickChatFeed: $("#quick-chat-feed"),
    buyBait: $("#buy-bait"),
    barnacleValue: $("#barnacle-value"),
    barnacleMeter: $("#barnacle-meter"),
    fisherActivityStatus: $("#fisher-activity-status"),
    fisherActivityButton: $("#fisher-activity-button"),
    barnacleCleanupOverlay: $("#barnacle-cleanup-overlay"),
    barnacleCleanupProgress: $("#barnacle-cleanup-progress"),
    barnacleCleanupField: $("#barnacle-cleanup-field"),
    roleSelectionOverlay: $("#role-selection-overlay"),
    roleSelectionTitle: $("#role-selection-title"),
    roleSelectionCopy: $("#role-selection-copy"),
    roleSelectionStatus: $("#role-selection-status"),
    roleCancel: $("#role-cancel"),
    roleChoices: [...document.querySelectorAll("[data-role-choice]")],
    storyOverlay: $("#story-overlay"),
    storyTitle: $("#story-title"),
    storyText: $("#story-text"),
    storyArt: $("#story-art"),
    storyStep: $("#story-step"),
    storyContinue: $("#story-continue"),
    copyCode: $("#copy-code"),
    roleBadge: $("#role-badge"),
    leaveButton: $("#leave-button"),
    depth: $("#depth"),
    gold: $("#gold"),
    caughtCount: $("#caught-count"),
    checkpointDistance: $("#checkpoint-distance"),
    checkpointFishProgress: $("#checkpoint-fish-progress"),
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
    repairTimer: $("#repair-timer"),
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
    toast: $("#toast"),
    fishLogButton: $("#fish-log-button"),
    fishLogPanel: $("#fish-log-panel"),
    closeFishLog: $("#close-fish-log"),
    fishLogSummary: $("#fish-log-summary"),
    fishCollection: $("#fish-collection")
  };

  let gameState;
  let socket;
  let socketRole;
  let mode = "lobby";
  let localRole = "fisher";
  let localRolePicks = [];
  let onlineRolePicks = { host: null, client: null };
  let roleSelectionContext = null;
  let pendingOnlineRole = null;
  let localFisherPlayer = 1;
  let fishCollectionSignature = null;
  let barnacleCleanupSignature = "";
  let selectedIssueId = null;
  let repairSignature = "";
  let hostTimer = null;
  let connectionTimer = null;
  let toastTimer = null;
  let weldPointerDown = false;
  let lastAimSent = 0;
  let lastOceanPointerSent = 0;
  let lastReelSent = 0;
  let lastShoalMoveSent = 0;
  let storyStep = 0;
  let storyActive = false;
  let audioContext = null;
  let audioUnlocked = false;

  function initialState() {
    return {
      depth: 0,
      nextCheckpoint: checkpointDistance,
      checkpointOpen: false,
      fishSinceCheckpoint: 0,
      hull: 100,
      fuel: 100,
      water: 0,
      bait: baitCapacity,
      baitPurchases: 0,
      gold: 0,
      caught: 0,
      inventory: [],
      collection: {},
      issues: [],
      encounter: null,
      barnacles: 0,
      barnacleCritical: false,
      barnacleCleaning: 0,
      barnaclePositions: [],
      barnacleTargets: [],
      ropeTangled: false,
      ropeFixProgress: 0,
      ropeTangleIn: 50 + Math.floor(Math.random() * 31),
      upgrades: { hull: 0, harpoon: 0, lure: 0, fuel: 0, bilge: 0 },
      purchases: { hull: 0, harpoon: 0, lure: 0, fuel: 0, bilge: 0 },
      pity: { legendary: 0, mythic: 0, treasure: 0 },
      seconds: 0,
      issueSpawnIn: 15,
      fishSpawnIn: 4 + Math.floor(Math.random() * 5),
      ended: false
    };
  }

  function canFisherAct() {
    return isSharedControlMode() || localRole === "fisher";
  }

  function canEngineerAct() {
    return isSharedControlMode() || localRole === "engineer";
  }

  function isSharedControlMode() {
    return mode === "local" || mode === "solo";
  }

  function aimBounds() {
    const rect = el.oceanScene.getBoundingClientRect();
    const marginX = Math.min(.1, 8 / Math.max(1, rect.width));
    const marginY = Math.min(.1, 8 / Math.max(1, rect.height));
    return { minX: marginX, maxX: 1 - marginX, minY: marginY, maxY: 1 - marginY };
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

  function initializeAudio() {
    if (audioContext) return;
    el.menuMusic.volume = .35;
    el.engineSound.volume = .23;
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return;
    try {
      audioContext = new AudioContextConstructor();
      const menuSource = audioContext.createMediaElementSource(el.menuMusic);
      const menuGain = audioContext.createGain();
      menuGain.gain.value = .85;
      menuSource.connect(menuGain).connect(audioContext.destination);
      const engineSource = audioContext.createMediaElementSource(el.engineSound);
      const engineFilter = audioContext.createBiquadFilter();
      engineFilter.type = "lowpass";
      engineFilter.frequency.value = 850;
      engineFilter.Q.value = .7;
      const engineGain = audioContext.createGain();
      engineGain.gain.value = .8;
      engineSource.connect(engineFilter).connect(engineGain).connect(audioContext.destination);
    } catch (error) {
      audioContext = null;
      el.engineSound.volume = .2;
      console.error("Could not configure the underwater audio filter.", error);
    }
  }

  function playTrack(audio, shouldPlay) {
    if (!shouldPlay) {
      audio.pause();
      return;
    }
    const playback = audio.play();
    playback?.catch((error) => {
      if (error.name === "NotAllowedError") {
        audioUnlocked = false;
        return;
      }
      console.error(`Could not play audio track ${audio.currentSrc || audio.src}.`, error);
    });
  }

  function syncMusic() {
    if (!audioUnlocked) return;
    const inGame = mode !== "lobby";
    playTrack(el.menuMusic, !inGame);
    playTrack(el.engineSound, inGame);
  }

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    initializeAudio();
    if (audioContext?.state === "suspended") {
      audioContext.resume().catch((error) => {
        console.error("Could not resume game audio.", error);
      });
    }
    syncMusic();
  }

  function playSfx(kind) {
    if (!audioContext || audioContext.state !== "running") return;
    const sounds = {
      click: [[600, .035]],
      action: [[390, .06], [520, .075]],
      fish: [[390, .09], [620, .14]],
      catch: [[560, .08], [760, .11], [950, .15]],
      rare: [[660, .09], [830, .11], [1040, .14], [1320, .2]],
      sell: [[760, .06], [990, .08], [1240, .16]],
      repair: [[440, .08], [620, .08], [820, .16]],
      warning: [[300, .12], [230, .18]]
    };
    const notes = sounds[kind];
    if (!notes) return;
    const start = audioContext.currentTime;
    notes.forEach(([frequency, duration], index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const noteStart = start + index * .085;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, noteStart);
      gain.gain.setValueAtTime(.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(.055, noteStart + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, noteStart + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + duration + .01);
    });
  }

  function appendChatMessage(sender, text) {
    const message = document.createElement("p");
    message.className = "chat-message";
    message.textContent = `${sender} · ${text}`;
    el.quickChatFeed.append(message);
    while (el.quickChatFeed.childElementCount > 4) el.quickChatFeed.firstElementChild.remove();
    el.quickChatFeed.scrollTop = el.quickChatFeed.scrollHeight;
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
    el.repairPanel.classList.remove("hidden");
    el.missionList.classList.remove("hidden");
  }

  function clearConnectionTimer() {
    clearTimeout(connectionTimer);
    connectionTimer = null;
  }

  function failJoin(message) {
    clearConnectionTimer();
    const pendingSocket = socket;
    socket = null;
    socketRole = null;
    if (pendingSocket && pendingSocket.readyState < WebSocket.CLOSING) pendingSocket.close();
    roleSelectionContext = null;
    pendingOnlineRole = null;
    onlineRolePicks = { host: null, client: null };
    el.roleSelectionOverlay.classList.add("hidden");
    el.joinForm.querySelector("button").disabled = false;
    setConnectionLabel("Crew not connected");
    showMessage(message, true);
  }

  function isGameRole(role) {
    return role === "fisher" || role === "engineer";
  }

  function roleName(role) {
    return role === "fisher" ? "Fisher" : "Engineer";
  }

  function updateRoleSelection(notice = "") {
    const context = roleSelectionContext;
    if (!context) return;
    el.roleSelectionOverlay.classList.remove("hidden");
    const localFirst = context === "local-player-1";
    const localSecond = context === "local-player-2";
    const side = context === "online-host" ? "host" : "client";
    const isOnline = context === "online-host" || context === "online-client";
    const chosenRole = isOnline ? onlineRolePicks[side] : null;
    const otherRole = isOnline ? onlineRolePicks[side === "host" ? "client" : "host"] : localRolePicks[0];
    const assigned = Boolean(chosenRole);
    el.roleSelectionTitle.textContent = localFirst ? "Player 1, choose your station" : localSecond ? "Player 2, choose your station" : assigned || pendingOnlineRole ? "Station reserved" : "Choose your station";
    if (localFirst) {
      el.roleSelectionCopy.textContent = "Player 1 picks first. Player 2 will take the remaining station.";
    } else if (localSecond) {
      el.roleSelectionCopy.textContent = `Player 1 chose ${roleName(otherRole)}. Choose the remaining station.`;
    } else if (assigned) {
      el.roleSelectionCopy.textContent = `You are the ${roleName(chosenRole)}. Your crewmate will take the other station.`;
    } else if (pendingOnlineRole) {
      el.roleSelectionCopy.textContent = `You picked ${roleName(pendingOnlineRole)}. Waiting for the host to confirm the assignment.`;
    } else if (otherRole) {
      el.roleSelectionCopy.textContent = `Your crewmate chose ${roleName(otherRole)}. Choose the remaining station.`;
    } else {
      el.roleSelectionCopy.textContent = "Whoever chooses a station first gets it; the other player will take the remaining one.";
    }
    el.roleSelectionStatus.textContent = notice || (isOnline && assigned
      ? "Waiting for your crewmate…"
      : isOnline && pendingOnlineRole
        ? "Waiting for the other crew member…"
        : "");
    for (const button of el.roleChoices) {
      const role = button.dataset.roleChoice;
      const unavailable = localSecond && role === otherRole
        || isOnline && role === otherRole
        || isOnline && (assigned || Boolean(pendingOnlineRole));
      button.disabled = unavailable;
      button.classList.toggle("selected", chosenRole === role);
      button.setAttribute("aria-pressed", String(chosenRole === role));
    }
  }

  function openRoleSelection(context) {
    roleSelectionContext = context;
    updateRoleSelection();
    el.roleChoices.find((button) => !button.disabled)?.focus();
  }

  function beginLocalRoleSelection() {
    localRolePicks = [];
    localFisherPlayer = 1;
    openRoleSelection("local-player-1");
  }

  function sendRoleStatus(notice = "") {
    if (mode === "host") {
      broadcast({ type: "role-status", roles: onlineRolePicks, notice });
      updateRoleSelection(notice);
    }
  }

  function chooseRole(role) {
    if (!isGameRole(role) || !roleSelectionContext) return;
    if (roleSelectionContext === "local-player-1") {
      localRolePicks[0] = role;
      openRoleSelection("local-player-2");
      return;
    }
    if (roleSelectionContext === "local-player-2") {
      localRolePicks[1] = role;
      localFisherPlayer = localRolePicks[0] === "fisher" ? 1 : 2;
      roleSelectionContext = null;
      enterGame("local", localRolePicks[0], initialState());
      return;
    }
    if (roleSelectionContext === "online-host") {
      if (onlineRolePicks.host || onlineRolePicks.client === role) return;
      onlineRolePicks.host = role;
      sendRoleStatus();
      if (onlineRolePicks.client) finishOnlineRoleSelection();
      return;
    }
    if (roleSelectionContext === "online-client") {
      if (pendingOnlineRole || onlineRolePicks.client || onlineRolePicks.host === role) return;
      pendingOnlineRole = role;
      updateRoleSelection();
      if (!broadcast({ type: "role-choice", role })) {
        pendingOnlineRole = null;
        updateRoleSelection("Could not send your choice. Check the connection and try again.");
      }
    }
  }

  function finishOnlineRoleSelection() {
    if (!isGameRole(onlineRolePicks.host) || !isGameRole(onlineRolePicks.client)) return;
    const hostRole = onlineRolePicks.host;
    roleSelectionContext = null;
    pendingOnlineRole = null;
    enterGame("host", hostRole, initialState());
    setConnectionLabel("Crew connected", true);
    el.netStatus.textContent = "Online crew connected";
    sendState();
    toast("Crew stations assigned. Happy hunting!");
  }

  function enterGame(nextMode, role, state) {
    clearConnectionTimer();
    mode = nextMode;
    syncMusic();
    localRole = role;
    gameState = state || initialState();
    roleSelectionContext = null;
    pendingOnlineRole = null;
    el.roleSelectionOverlay.classList.add("hidden");
    el.game.classList.toggle("online-fisher", (nextMode === "host" || nextMode === "client") && role === "fisher");
    el.game.classList.toggle("online-engineer", (nextMode === "host" || nextMode === "client") && role === "engineer");
    el.lobby.classList.add("hidden");
    el.game.classList.remove("hidden");
    $(".shell").classList.add("in-game");
    el.roleBadge.textContent = role.toUpperCase();
    el.netStatus.textContent = mode === "local" ? "Local co-op · Fisher WASD + Space · Engineer arrows + mouse" : mode === "solo" ? "Solo expedition · WASD + Space · arrows + mouse" : mode === "host" ? "Room open · waiting for your crewmate" : "Online crew connected";
    if (mode === "client") setConnectionLabel("Crew connected", true);
    selectedIssueId = null;
    repairSignature = "";
    playSfx("repair");
    if (isSharedControlMode() && gameState.issues.length === 0) makeIssue();
    storyActive = true;
    storyStep = 0;
    render();
    renderStory();
  }

  function renderStory() {
    const card = storyCards[storyStep];
    if (!card) return;
    el.storyOverlay.classList.remove("hidden");
    el.storyTitle.textContent = card.title;
    el.storyText.textContent = card.text;
    el.storyArt.dataset.stage = card.stage;
    el.storyStep.textContent = `0${storyStep + 1} / 0${storyCards.length}`;
    el.storyContinue.textContent = storyStep === storyCards.length - 1 ? "Begin dive" : "Continue";
  }

  function advanceStory() {
    if (!storyActive) return;
    storyStep += 1;
    if (storyStep < storyCards.length) {
      renderStory();
      return;
    }
    storyActive = false;
    el.storyOverlay.classList.add("hidden");
    if (mode === "host" || isSharedControlMode()) startHostTimer();
    render();
    sendState();
  }

  function returnToLobby() {
    clearInterval(hostTimer);
    clearConnectionTimer();
    hostTimer = null;
    if (socket) {
      socket.close();
      socket = null;
      socketRole = null;
    }
    mode = "lobby";
    syncMusic();
    gameState = null;
    el.game.classList.remove("online-fisher", "online-engineer");
    el.quickChatFeed.replaceChildren();
    el.fishLogPanel.classList.add("hidden");
    localRolePicks = [];
    onlineRolePicks = { host: null, client: null };
    roleSelectionContext = null;
    pendingOnlineRole = null;
    storyActive = false;
    el.roleSelectionOverlay.classList.add("hidden");
    el.game.classList.add("hidden");
    el.storyOverlay.classList.add("hidden");
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
    const values = new Uint32Array(6);
    window.crypto.getRandomValues(values);
    return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
  }

  function relayUrl() {
    if (typeof window.CCM_RELAY_URL !== "string" || !window.CCM_RELAY_URL.trim()) {
      showMessage("The online relay is not configured. Deploy the Render service and set its URL in relay-config.js.", true);
      return null;
    }
    try {
      const url = new URL(window.CCM_RELAY_URL, window.location.href);
      if (!["ws:", "wss:"].includes(url.protocol) || (window.location.protocol === "https:" && url.protocol !== "wss:")) {
        throw new Error("Relay URL must use secure WebSockets (wss://) on an HTTPS page.");
      }
      return url.href;
    } catch (error) {
      showMessage(error.message || "The relay URL in relay-config.js is invalid.", true);
      return null;
    }
  }

  function failHostRoom(message) {
    clearConnectionTimer();
    const pendingSocket = socket;
    socket = null;
    socketRole = null;
    if (pendingSocket && pendingSocket.readyState < WebSocket.CLOSING) pendingSocket.close();
    el.hostButton.disabled = false;
    el.roomDisplay.classList.add("hidden");
    setConnectionLabel("Crew not connected");
    showMessage(message, true);
  }

  function connectRelay(role, code) {
    const url = relayUrl();
    if (!url) {
      if (role === "host") el.hostButton.disabled = false;
      else el.joinForm.querySelector("button").disabled = false;
      return;
    }
    if (typeof WebSocket === "undefined") {
      showMessage("This browser does not support WebSockets, which the online relay requires.", true);
      setConnectionLabel("Crew not connected");
      if (role === "host") el.hostButton.disabled = false;
      else el.joinForm.querySelector("button").disabled = false;
      return;
    }
    let relaySocket;
    try {
      relaySocket = new WebSocket(url);
    } catch (error) {
      const message = error.message || "Could not open the online relay connection.";
      if (role === "host") failHostRoom(message);
      else failJoin(message);
      return;
    }
    socket = relaySocket;
    socketRole = role;
    clearConnectionTimer();
    connectionTimer = setTimeout(() => {
      if (socket !== relaySocket || mode !== "lobby") return;
      const message = "The relay server did not respond in time. Check its Render deployment and try again.";
      if (role === "host") failHostRoom(message);
      else failJoin(message);
    }, 90000);
    relaySocket.addEventListener("open", () => {
      if (socket !== relaySocket) return;
      try {
        relaySocket.send(JSON.stringify({ type: role === "host" ? "host" : "join", code }));
      } catch {
        if (role === "host") failHostRoom("Could not register the room with the relay server.");
        else failJoin("Could not join the room through the relay server.");
      }
    });
    relaySocket.addEventListener("message", (event) => {
      if (socket !== relaySocket) return;
      let packet;
      try {
        packet = JSON.parse(event.data);
      } catch {
        if (role === "host") failHostRoom("The relay server sent an invalid response.");
        else failJoin("The relay server sent an invalid response.");
        return;
      }
      handleRelayPacket(packet, role);
    });
    relaySocket.addEventListener("error", () => {
      if (socket === relaySocket && mode === "lobby") {
        showMessage("Could not reach the relay server. Check that the Render service is running.", true);
      }
    });
    relaySocket.addEventListener("close", () => handleConnectionClose(relaySocket, role));
  }

  function startHostRoom() {
    let code;
    try {
      code = randomCode();
    } catch {
      showMessage("Secure room codes need a browser that supports cryptographic randomness. Open the game over HTTPS and try again.", true);
      return;
    }
    el.hostButton.disabled = true;
    showMessage("Connecting to the online relay…");
    setConnectionLabel("Connecting to relay");
    connectRelay("host", code);
  }

  function handleRelayPacket(packet, role) {
    if (!packet || typeof packet !== "object") return;
    if (packet.type === "room-ready" && role === "host") {
      clearConnectionTimer();
      el.roomCode.textContent = packet.code;
      el.roomDisplay.classList.remove("hidden");
      showMessage("Room is ready. Keep this page open while your friend joins.");
      setConnectionLabel("Waiting for crew");
    } else if (packet.type === "room-joined" && role === "client") {
      clearConnectionTimer();
      connectionTimer = setTimeout(() => {
        if (mode === "lobby") failJoin("The relay connected, but the host did not send the voyage state. Ask the host to reopen the room and try again.");
      }, 15000);
      setConnectionLabel("Syncing crew");
      showMessage("Connected to the relay — synchronizing the voyage…");
      broadcast({ type: "hello" });
    } else if (packet.type === "guest-joined" && role === "host") {
      activateHostConnection();
    } else if (packet.type === "guest-left" || packet.type === "host-left") {
      handlePeerLeft(role);
    } else if (packet.type === "game-message") {
      receiveMessage(packet.message, "engineer");
    } else if (packet.type === "room-error") {
      const messages = {
        "invalid-code": "Enter a valid six-character room code.",
        "room-in-use": "That room code is already in use. Open another room.",
        "room-not-found": "That room is not open. Check the code and ask your friend to host again.",
        "room-full": "That room already has a crewmate."
      };
      const message = messages[packet.code] || "The relay server could not complete that request.";
      if (role === "host") failHostRoom(message);
      else failJoin(message);
    }
  }

  function activateHostConnection() {
    if (!socket || socket.readyState !== WebSocket.OPEN || socketRole !== "host") return;
    const wasWaiting = mode === "lobby";
    if (wasWaiting) {
      mode = "host";
      gameState = initialState();
      onlineRolePicks = { host: null, client: null };
      pendingOnlineRole = null;
      openRoleSelection("online-host");
    }
    if (mode !== "host") return;
    setConnectionLabel("Crew connected", true);
    if (roleSelectionContext === "online-host") sendRoleStatus();
    else {
      el.netStatus.textContent = "Online crew connected";
      sendState();
    }
    if (wasWaiting) toast("Crew connected. Choose your stations.");
  }

  function joinRoom(code) {
    const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (normalized.length !== 6) {
      showMessage("Enter the six-character room code.", true);
      return;
    }
    el.joinForm.querySelector("button").disabled = true;
    showMessage("Connecting to your crewmate…");
    setConnectionLabel("Connecting to crew");
    connectRelay("client", normalized);
  }

  function handleConnectionClose(closedSocket, role) {
    if (socket !== closedSocket) return;
    socket = null;
    socketRole = null;
    setConnectionLabel("Crew disconnected");
    if (mode === "lobby" && role === "host") {
      clearConnectionTimer();
      el.hostButton.disabled = false;
      el.roomDisplay.classList.add("hidden");
      showMessage("The relay connection closed before the room was ready. Check the server and try again.", true);
    } else if (mode === "lobby") {
      failJoin("The connection closed before the voyage synced. Check the room code and try again.");
    } else if (mode === "client") {
      el.netStatus.textContent = "Crew connection lost";
      toast("The connection to the host was lost.", true);
    } else if (mode === "host") {
      el.netStatus.textContent = "Crew disconnected · waiting for a new connection";
      toast("Your crewmate disconnected.", true);
    }
  }

  function handlePeerLeft(role) {
    setConnectionLabel("Crew disconnected");
    if (mode === "client") {
      el.netStatus.textContent = "Crew connection lost";
      toast(role === "client" ? "The host left the room." : "Your crewmate left the room.", true);
    } else if (mode === "host") {
      el.netStatus.textContent = "Crew disconnected · waiting for a new connection";
      toast(role === "host" ? "Your crewmate disconnected." : "The host closed the room.", true);
    }
  }

  function receiveMessage(message, senderRole) {
    if (!message || typeof message !== "object") return;
    if (message.type === "hello" && mode === "host") {
      activateHostConnection();
    } else if (message.type === "role-choice" && mode === "host") {
      if (!isGameRole(message.role) || onlineRolePicks.client) return;
      if (message.role === onlineRolePicks.host) {
        sendRoleStatus(`${roleName(message.role)} is taken. Choose the remaining station.`);
        return;
      }
      onlineRolePicks.client = message.role;
      sendRoleStatus();
      if (onlineRolePicks.host) finishOnlineRoleSelection();
    } else if (message.type === "role-status" && mode === "lobby" && socketRole === "client") {
      if (!message.roles || typeof message.roles !== "object") return;
      onlineRolePicks = {
        host: isGameRole(message.roles.host) ? message.roles.host : null,
        client: isGameRole(message.roles.client) ? message.roles.client : null
      };
      pendingOnlineRole = null;
      if (roleSelectionContext !== "online-client") openRoleSelection("online-client");
      updateRoleSelection(typeof message.notice === "string" ? message.notice : "");
    } else if (message.type === "action" && (mode === "host" || isSharedControlMode())) {
      const actionRole = mode === "host" ? onlineRolePicks.client : senderRole;
      if (isGameRole(actionRole)) applyAction(message.action, message.data || {}, actionRole);
    } else if (message.type === "state" && mode !== "host" && message.state && typeof message.state === "object") {
      clearConnectionTimer();
      if (mode === "lobby") enterGame("client", isGameRole(message.role) ? message.role : "engineer", message.state);
      else gameState = message.state;
      render();
    } else if (message.type === "notice" && typeof message.text === "string") {
      if (/caught|sold|fixed|repaired|sonar/i.test(message.text)) {
        playSfx(/sold/i.test(message.text) ? "sell" : /fixed|repaired/i.test(message.text) ? "repair" : /sonar/i.test(message.text) ? "fish" : "catch");
      } else if (/critical|breached|got away|damaged|worse|barnacles reached|overwhelmed/i.test(message.text)) {
        playSfx("warning");
      }
      toast(message.text, Boolean(message.warning));
    } else if (message.type === "quick-chat" && chatPhrases.includes(message.text)) {
      appendChatMessage("CREW", message.text);
    }
  }

  function broadcast(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify({ type: "game-message", message }));
        return true;
      } catch {
        toast("Could not send game update. The relay connection may be closed.", true);
      }
    }
    return false;
  }

  function sendState() {
    if (mode === "host") broadcast({ type: "state", state: gameState, role: onlineRolePicks.client });
  }

  function sendNotice(message, warning = false) {
    if (mode === "host") broadcast({ type: "notice", text: message, warning });
    toast(message, warning);
  }

  function sendAction(action, data = {}, role = localRole) {
    if (isSharedControlMode() || mode === "host") {
      applyAction(action, data, role);
    } else if (mode === "client" && socket && socket.readyState === WebSocket.OPEN) {
      broadcast({ type: "action", action, data });
    }
  }

  function sendQuickChat(text) {
    if (!chatPhrases.includes(text) || (mode !== "host" && mode !== "client")) return;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      toast("Crew chat is unavailable while disconnected.", true);
      return;
    }
    if (broadcast({ type: "quick-chat", text })) appendChatMessage("YOU", text);
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
    gameState.pity ||= { legendary: 0, mythic: 0, treasure: 0 };
    if (gameState.pity.treasure >= pityThresholds.treasure - 1) return rarityByKey.treasure;
    if (gameState.pity.mythic >= pityThresholds.mythic - 1) return rarityByKey.mythic;
    if (gameState.pity.legendary >= pityThresholds.legendary - 1) return rarityByKey.legendary;
    const lure = Math.min(upgradeMaxLevels.lure, gameState.upgrades.lure);
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

  function fishIllustration(species, rarity) {
    const name = species.toLowerCase();
    const rareColors = {
      trash: ["#9baeb0", "#56696c"],
      common: ["#69c0c9", "#2c7d88"],
      uncommon: ["#82cbd0", "#2a8993"],
      rare: ["#74b9db", "#3476a0"],
      epic: ["#9bb6e8", "#526da1"],
      legendary: ["#e1c66c", "#98703b"],
      mythic: ["#a99be9", "#6453a0"],
      treasure: ["#f1cb62", "#99672c"]
    };
    let [bodyColor, finColor] = rareColors[rarity] || rareColors.common;
    if (name.includes("blue")) [bodyColor, finColor] = ["#5d9fe0", "#32649a"];
    if (name.includes("yellow") || name.includes("gold") || name.includes("mahi") || name.includes("carp")) [bodyColor, finColor] = ["#e2bc59", "#a27131"];
    if (name.includes("red") || name.includes("clown") || name.includes("lionfish") || name.includes("rainbow")) [bodyColor, finColor] = ["#e08a63", "#a84d42"];
    if (name.includes("green") || name.includes("perch") || name.includes("pike") || name.includes("bass")) [bodyColor, finColor] = ["#90ad76", "#59794f"];
    if (name.includes("black") || name.includes("deep sea") || name.includes("dragon") || name.includes("viper") || name.includes("fangtooth")) [bodyColor, finColor] = ["#657c9b", "#32b8c7"];

    let body;
    let details = "";
    if (name === "can") {
      body = '<path d="M56 19h45l5 8v35l-5 8H56l-5-8V27z"/><path d="M55 27h50M57 60h46"/>';
      details = '<path d="M66 36h26m-26 8h20"/><ellipse cx="79" cy="19" rx="22" ry="5"/>';
    } else if (name === "boot") {
      body = '<path d="M63 14h23v29c0 7 4 12 13 14l18 3v12H35c-8 0-13-5-13-12s5-11 13-12l16-3 6-16V14z"/>';
      details = '<path d="M61 27h24m-23 8h21M37 67h74"/>';
    } else if (name === "tire") {
      body = '<circle cx="80" cy="45" r="31"/><circle cx="80" cy="45" r="14"/>';
      details = '<path d="m60 23 8 8m24 28 8 8M49 45h11m40 0h11M60 67l8-8m24-28 8-8"/>';
    } else if (name === "gold") {
      body = '<ellipse cx="72" cy="61" rx="32" ry="8"/><ellipse cx="82" cy="48" rx="29" ry="8"/><ellipse cx="70" cy="35" rx="26" ry="8"/>';
      details = '<path d="M70 27v16m-7-12h11a4 4 0 0 1 0 8h-8a4 4 0 0 0 0 8h12"/>';
    } else if (name === "chest") {
      body = '<path d="M35 37h90v37H35zM42 25h76l9 15H33z"/>';
      details = '<path d="M52 27v44m56-44v44m-74-29h90m-47 8v10m-5-5h10"/>';
    } else if (name.includes("ray") || name.includes("stingray")) {
      body = '<path d="M80 20c-18 15-35 7-61 7 11 18 24 31 44 31 5 0 10 5 17 10 7-5 12-10 17-10 20 0 33-13 44-31-26 0-43 8-61-7z"/><path d="M80 68c3 7 2 13-1 20"/>';
      details = '<path d="M69 43h.1m21 0h.1"/>';
    } else if (name.includes("sunfish")) {
      body = '<path d="M48 22c18-7 38-7 54 0l17 22-17 23c-16 7-36 7-54 0L38 44z"/><path d="M48 22 38 11l-2 34m12 22L37 78l-1-34"/>';
      details = '<path d="M55 30c-6 10-6 18 0 28"/>';
    } else if (name.includes("puffer")) {
      body = '<circle cx="80" cy="44" r="27"/>';
      details = '<path d="m80 9 2 8m25-1-5 8m27 8-9 4m7 25-10-1m-15 25-4-10m-25 12 2-11m-26-5 9-5M45 31l10 4"/><circle cx="91" cy="39" r="2"/>';
    } else if (name.includes("squid")) {
      body = '<path d="M80 11c-22 0-31 16-27 39 3 14 17 17 27 17s24-3 27-17c4-23-5-39-27-39z"/><path d="M60 64c-4 11-2 18 1 22m8-18c-1 9 1 14 4 19m7-17v18m8-18c2 9 1 14-1 18m10-24c5 9 6 15 3 20"/>';
      details = '<circle cx="69" cy="38" r="3"/><circle cx="91" cy="38" r="3"/>';
    } else if (name.includes("eel") || name.includes("dragonfish") || name.includes("tripod fish")) {
      body = '<path d="M21 48c20-29 43 23 64-1s35-14 54-3" stroke-width="12"/><path d="M137 44 150 35v20z"/>';
      details = '<circle cx="129" cy="43" r="2"/><path d="m123 49 5 5 5-5"/>';
    } else if (name.includes("shark") || name.includes("sawfish")) {
      body = '<path d="M21 47c15-17 39-25 72-20 15 2 24 9 33 16l17-14-4 19 5 18-18-11c-11 10-25 14-43 14-27 0-47-6-62-22z"/><path d="m72 29 14-22 14 24m-18 43-12 13 25-9m-29-24-11 14 23-5"/>';
      details = '<path d="M113 36v20m5-18v16m5-14v12"/><circle cx="112" cy="42" r="2"/>';
      if (name.includes("sawfish")) details += '<path d="m21 47-18-6 4 7-4 4 18-1"/>';
      if (name.includes("goblin")) details += '<path d="m122 41 22 6-22 7"/>';
    } else if (name.includes("swordfish") || name.includes("marlin") || name.includes("sailfish")) {
      body = '<path d="M25 47c18-18 42-24 73-16 15 4 25 11 35 17-10 8-20 15-35 18-31 7-55 0-73-19z"/><path d="m121 43 34-13-30 20m-39-21 7-21 12 25m-27 29-8 12 21-7"/>';
      details = '<circle cx="115" cy="43" r="2"/><path d="M95 34c8 7 8 18 0 27"/>';
      if (name.includes("sailfish")) details += '<path d="m78 38-3-29 11 12 8-18 2 34"/>';
    } else if (name.includes("oarfish") || name.includes("hatchetfish")) {
      body = '<path d="M21 43c30-13 67-13 116 0-49 14-86 14-116 0z"/><path d="m137 43 17-10v20zM36 37 40 23l8 13m8-2 5-12 8 13m8-3 5-12 8 13"/>';
      details = '<circle cx="31" cy="42" r="2"/>';
    } else if (name.includes("flounder") || name.includes("halibut")) {
      body = '<path d="M22 46c12-23 41-31 77-20 18 5 31 13 42 20-11 8-24 16-42 20-36 11-65 3-77-20z"/><path d="m141 46 14-10v20z"/>';
      details = '<circle cx="48" cy="39" r="2.5"/><circle cx="55" cy="44" r="2.5"/><path d="M65 32c-7 8-7 19 0 27"/>';
    } else if (name.includes("catfish")) {
      body = '<path d="M22 45c16-17 42-23 72-18 19 3 30 10 42 18-12 9-23 15-42 18-30 5-56-1-72-18z"/><path d="m136 45 16-10v20zM38 43c-14-12-20-10-25-10m25 15c-13 9-18 10-24 8"/>';
      details = '<circle cx="111" cy="41" r="2"/>';
    } else {
      body = '<path d="M24 45c15-19 42-28 74-21 19 4 30 12 41 21-11 9-22 17-41 21-32 7-59-2-74-21z"/><path d="m138 45 16-11v22zM60 30l10-17 12 20m-22 24-8 15 22-11"/>';
      details = '<path d="M94 30c-7 8-7 22 0 30m10-27v24"/><circle cx="119" cy="41" r="2.5"/>';
      if (name.includes("sardine") || name.includes("mackerel") || name.includes("tuna")) details += '<path d="M48 37c22-8 41-8 61-1"/>';
      if (name.includes("lanternfish") || name.includes("anglerfish") || name.includes("fangtooth") || name.includes("viperfish")) details += '<path d="M88 25 82 10l10 2"/><path d="m109 48 5 6 5-6"/>';
      if (name.includes("triggerfish")) details += '<path d="m76 24 5-10 6 11"/>';
      if (name.includes("arowana")) details += '<path d="m24 45-12-4 3 5-3 4 12-1"/>';
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90" aria-hidden="true"><g fill="${bodyColor}" stroke="${finColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}${details}</g></svg>`;
  }

  function makeSwimmers(rarity) {
    return Array.from({ length: 5 }, (_, index) => ({
      species: rarity.species[Math.floor(Math.random() * rarity.species.length)],
      x: .12 + Math.random() * .76,
      y: .2 + Math.random() * .48,
      direction: index % 2 ? -1 : 1,
      speed: .018 + Math.random() * .018,
      caught: false
    }));
  }

  function spawnEncounter() {
    if (gameState.bait <= 0) return;
    const rarity = pickRarity();
    const type = ["aim", "rhythm", "reel", "shoal"][Math.floor(Math.random() * 4)];
    const species = rarity.species[Math.floor(Math.random() * rarity.species.length)];
    gameState.bait = Math.max(0, gameState.bait - 1);
    gameState.encounter = {
      id: `${Date.now()}-${Math.random()}`,
      rarity: rarity.key,
      species,
      type,
      stage: type === "shoal" ? "hooked" : "bite",
      timeLeft: type === "shoal" ? 16 : 9,
      progress: 0,
      needed: type === "shoal" ? 1 : type === "reel" ? Math.max(8, 17 - Math.min(upgradeMaxLevels.harpoon, gameState.upgrades.harpoon) * 2) : 5,
      sequence: type === "rhythm" ? Array.from({ length: 5 }, () => arrowKeys[Math.floor(Math.random() * 4)]) : [],
      seqIndex: 0,
      target: { x: .62 + Math.random() * .24, y: .32 + Math.random() * .36 },
      aim: { x: .15, y: .65 },
      cursor: { x: .5, y: .5 },
      swimmers: type === "shoal" ? makeSwimmers(rarity) : []
    };
    gameState.fishSpawnIn = Math.max(4, 4 + Math.floor(Math.random() * 5) - Math.min(upgradeMaxLevels.lure, gameState.upgrades.lure));
    playSfx("fish");
    sendNotice(`Something is on the sonar — ${rarity.name.toLowerCase()} catch!`);
  }

  function makeIssue(requestedTypes = null) {
    if (gameState.issues.length >= 6 && !requestedTypes) return;
    const candidates = requestedTypes || Object.keys(issueInfo).filter((type) => type !== "barnacles");
    const available = candidates.filter((type) => issueInfo[type] && !gameState.issues.some((issue) => issue.type === type));
    if (!available.length) return;
    const type = available[Math.floor(Math.random() * available.length)];
    let direction = Math.floor(Math.random() * 5) - 2;
    if (type === "alignment" && direction === 0) direction = Math.random() < .5 ? -1 : 1;
    const barnaclePositions = type === "barnacles" ? randomBarnaclePositions() : [];
    const issue = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      room: roomByType[type],
      secondsLeft: 34 + Math.floor(Math.random() * 17),
      step: 0,
      progress: 0,
      angle: type === "alignment" ? Math.sign(direction) * (25 + Math.floor(Math.random() * 36)) : 0,
      pattern: type === "sequence" ? Array.from({ length: 5 }, () => Math.floor(Math.random() * 9)) : type === "engine" ? Array.from({ length: 4 }, () => arrowKeys[Math.floor(Math.random() * 4)]) : [],
      bolts: [],
      boltTurns: {},
      boltPositions: type === "bolts" ? randomBoltPositions() : [],
      barnacles: type === "barnacles" ? Array.from({ length: 8 }, (_, index) => index) : [],
      barnaclePositions,
      armTarget: barnaclePositions[0] || null,
      expired: false
    };
    gameState.issues.push(issue);
    sendNotice(`${issueInfo[type].name} needs attention in the ${issue.room.toLowerCase()}.`, true);
  }

  function tick() {
    if (gameState.ended) return;
    gameState.barnacles ??= 0;
    gameState.barnacleCleaning ??= 0;
    gameState.barnaclePositions ??= [];
    gameState.barnacleTargets ??= [];
    gameState.ropeTangled ??= false;
    gameState.ropeFixProgress ??= 0;
    gameState.ropeTangleIn ??= 50;
    gameState.seconds += 1;
    gameState.depth += gameState.fuel > 0 ? 1 : .2;
    const fuelReduction = Math.min(.75, gameState.upgrades.fuel * .15);
    const bilgeReduction = Math.min(.75, gameState.upgrades.bilge * .15);
    gameState.fuel = Math.max(0, gameState.fuel - .12 * (1 - fuelReduction));
    const hullMitigation = Math.max(.25, 1 - gameState.upgrades.hull * .08);
    if (gameState.barnacleCleaning <= 0) {
      gameState.barnacles = Math.min(100, Math.round((gameState.barnacles + 2 / 3) * 100) / 100);
    }
    const barnacleCritical = gameState.barnacles >= 60;
    if (barnacleCritical && !gameState.barnacleCritical) {
      gameState.barnacleCritical = true;
      playSfx("warning");
      sendNotice("Barnacles reached 60% — hull damage is accelerating. Clean them before 100%.", true);
    } else if (!barnacleCritical) {
      gameState.barnacleCritical = false;
    }
    if (barnacleCritical) {
      gameState.hull = Math.max(0, gameState.hull - 1.2 * hullMitigation);
    }
    if (gameState.barnacles >= 100) {
      gameState.ended = true;
      gameState.hull = 0;
      playSfx("warning");
      sendNotice("Barnacles overwhelmed the hull at 100%. This voyage is over.", true);
      return;
    }
    if (!gameState.ropeTangled && !gameState.encounter && gameState.ropeTangleIn > 0) {
      gameState.ropeTangleIn -= 1;
      if (gameState.ropeTangleIn === 0) {
        gameState.ropeTangled = true;
        gameState.ropeFixProgress = 0;
        sendNotice("The fishing line is tangled! Clear the knot to resume fishing.", true);
      }
    }
    for (const issue of gameState.issues) {
      if (issue.secondsLeft > 0) issue.secondsLeft -= 1;
      if (issue.secondsLeft <= 0 && !issue.expired) {
        issue.expired = true;
        sendNotice(`${issueInfo[issue.type].name} is getting worse!`, true);
      }
      const critical = issue.secondsLeft <= 10;
      if (issue.type === "sequence") gameState.fuel = Math.max(0, gameState.fuel - (critical ? 1.4 : .15));
      if (issue.type === "valve") gameState.hull = Math.max(0, gameState.hull - (critical ? 2.2 : .35) * hullMitigation);
      if (issue.type === "weld" || issue.type === "bolts") gameState.hull = Math.max(0, gameState.hull - (critical ? 1.8 : .3) * hullMitigation);
      if (issue.type === "alignment") gameState.hull = Math.max(0, gameState.hull - (critical ? 1.1 : .12) * hullMitigation);
      if (issue.type === "water") gameState.water = Math.min(100, gameState.water + (critical ? 2.6 : .55) * (1 - bilgeReduction));
      if (issue.type === "fuel") gameState.fuel = Math.max(0, gameState.fuel - (critical ? 2.8 : .35));
      if (issue.type === "engine") gameState.fuel = Math.max(0, gameState.fuel - (critical ? 1.5 : .2));
      if (issue.type === "barnacles") {
        gameState.fuel = Math.max(0, gameState.fuel - (critical ? 1.2 : .18));
        gameState.hull = Math.max(0, gameState.hull - (critical ? .8 : .1) * hullMitigation);
      }
    }
    if (gameState.fuel <= 50 && !gameState.issues.some((issue) => issue.type === "fuel")) {
      makeIssue(["fuel"]);
    }
    if (gameState.water > 70) gameState.hull = Math.max(0, gameState.hull - (gameState.water > 90 ? 1.3 : .35) * hullMitigation);

    if (gameState.encounter) {
      const fish = gameState.encounter;
      if (fish.stage === "bite") {
        fish.timeLeft -= 1;
        if (fish.timeLeft <= 0) loseFish();
      } else {
        fish.timeLeft -= 1;
        if (fish.type === "aim") {
          fish.target.x = Math.min(.9, Math.max(.2, fish.target.x + (Math.random() - .5) * .06));
          fish.target.y = Math.min(.76, Math.max(.23, fish.target.y + (Math.random() - .5) * .06));
          const scene = el.oceanScene.getBoundingClientRect();
          const dx = (fish.aim.x - fish.target.x) * (scene.width || 500);
          const dy = (fish.aim.y - fish.target.y) * (scene.height || 170);
          const aimDistance = Math.hypot(dx, dy);
          if (aimDistance <= 32) fish.progress = Math.min(fish.needed, fish.progress + 1);
          else if (aimDistance > 48) fish.progress = Math.max(0, fish.progress - .2);
          if (fish.progress >= fish.needed) catchFish();
        }
        if (fish.type === "shoal") {
          for (const swimmer of fish.swimmers) {
            if (swimmer.caught) continue;
            swimmer.x += swimmer.direction * swimmer.speed;
            if (swimmer.x >= .94 || swimmer.x <= .06) {
              swimmer.direction *= -1;
              swimmer.y = .2 + Math.random() * .48;
            }
          }
        }
        if (fish.timeLeft <= 0 && gameState.encounter) loseFish();
      }
    } else {
      const fishingPaused = gameState.barnacleCleaning > 0 || gameState.ropeTangled;
      if (fishingPaused) {
        gameState.fishSpawnIn = Math.max(1, gameState.fishSpawnIn);
      } else if (gameState.bait <= 0) {
        gameState.fishSpawnIn = 0;
      } else {
        gameState.fishSpawnIn -= 1;
        if (gameState.fishSpawnIn <= 0 && !gameState.issues.some((issue) => issue.type === "harpoon")) spawnEncounter();
      }
    }

    gameState.issueSpawnIn -= 1;
    if (gameState.issueSpawnIn <= 0) {
      makeIssue();
      gameState.issueSpawnIn = 14 + Math.floor(Math.random() * 9);
    }

    if (!gameState.checkpointOpen && gameState.depth >= gameState.nextCheckpoint) {
      gameState.checkpointOpen = true;
      sendNotice("Checkpoint reached! Trade your catch and refit the submarine.");
    }
    if (gameState.hull <= 0 && !gameState.ended) {
      gameState.ended = true;
      sendNotice("Hull breached — this voyage is over. Start a new run to try again.", true);
    }
  }

  function catchFish() {
    if (!gameState.encounter) return;
    const rarity = rarityByKey[gameState.encounter.rarity];
    const species = gameState.encounter.species;
    const value = rarity.values?.[species] ?? rarity.min + Math.floor(Math.random() * (rarity.max - rarity.min + 1));
    gameState.inventory.push({ rarity: rarity.key, species, value });
    gameState.collection ||= {};
    gameState.collection[species] = (gameState.collection[species] || 0) + 1;
    gameState.caught += 1;
    gameState.fishSinceCheckpoint = (gameState.fishSinceCheckpoint || 0) + 1;
    playSfx(rarity.size >= 3 ? "rare" : "catch");
    gameState.pity ||= { legendary: 0, mythic: 0, treasure: 0 };
    gameState.pity.legendary = rarity.size >= 5 ? 0 : gameState.pity.legendary + 1;
    gameState.pity.mythic = rarity.size >= 6 ? 0 : gameState.pity.mythic + 1;
    gameState.pity.treasure = rarity.key === "treasure" ? 0 : gameState.pity.treasure + 1;
    gameState.encounter = null;
    sendNotice(`${species} (${rarity.name}) caught! Sell it at the next checkpoint.`);
    if (gameState.fishSinceCheckpoint >= fishPerCheckpoint && !gameState.checkpointOpen) {
      gameState.fishSinceCheckpoint = fishPerCheckpoint;
      gameState.depth = Math.max(gameState.depth, gameState.nextCheckpoint);
      gameState.checkpointOpen = true;
      sendNotice(`${fishPerCheckpoint} fish secured — checkpoint reached! Trade and refit the submarine.`);
    }
  }

  function loseFish() {
    if (!gameState.encounter) return;
    const rarity = rarityByKey[gameState.encounter.rarity];
    const damage = Math.max(1, Math.round(rarity.size * 1.5 * (1 - Math.min(.75, gameState.upgrades.hull * .08))));
    gameState.hull = Math.max(0, gameState.hull - damage);
    gameState.encounter = null;
    playSfx("warning");
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
    const sharedPurchases = ["sell", "upgrade", "buyBait"];
    const allowed = role === "fisher"
      ? ["cast", "reel", "rhythm", "aimMove", "aimPosition", "shoalMove", "shoalClick", "cleanBarnacles", "scrapeBarnacle", "untangleRope", "checkpointContinue", ...sharedPurchases, "restart"]
      : ["repair", "checkpointContinue", ...sharedPurchases, "restart"];
    if (!allowed.includes(action)) return;
    if (gameState.ended && action !== "restart") return;
    const fishingActions = ["cast", "reel", "rhythm", "aimMove", "aimPosition", "shoalMove", "shoalClick"];
    if (role === "fisher" && fishingActions.includes(action)
      && (gameState.ropeTangled || gameState.barnacleCleaning > 0 || gameState.issues.some((issue) => issue.type === "harpoon"))) return;
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
        playSfx("action");
        sendNotice(`${rarityByKey[fish.rarity].name} on the line!`);
      }
    } else if (action === "shoalMove" && role === "fisher") {
      const fish = gameState.encounter;
      if (fish && fish.stage === "hooked" && fish.type === "shoal" && Number.isFinite(data.dx) && Number.isFinite(data.dy)) {
        fish.cursor.x = Math.max(.04, Math.min(.96, fish.cursor.x + data.dx));
        fish.cursor.y = Math.max(.12, Math.min(.82, fish.cursor.y + data.dy));
      }
    } else if (action === "shoalClick" && role === "fisher") {
      const fish = gameState.encounter;
      if (!fish || fish.stage !== "hooked" || fish.type !== "shoal") return;
      let target;
      if (Number.isInteger(data.index)) {
        target = fish.swimmers[data.index];
      } else {
        const scene = el.oceanScene.getBoundingClientRect();
        const width = scene.width || 500;
        const height = scene.height || 170;
        target = fish.swimmers.find((swimmer) => (
          !swimmer.caught
          && Math.hypot((swimmer.x - fish.cursor.x) * width, (swimmer.y - fish.cursor.y) * height) <= 24
        ));
      }
      if (target && !target.caught) {
        target.caught = true;
        fish.species = target.species;
        fish.progress += 1;
        if (fish.progress >= fish.needed) catchFish();
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
      if (fish && fish.stage === "hooked" && fish.type === "aim" && Number.isFinite(data.dx) && Number.isFinite(data.dy)) {
        const bounds = aimBounds();
        fish.aim.x = Math.max(bounds.minX, Math.min(bounds.maxX, fish.aim.x + data.dx));
        fish.aim.y = Math.max(bounds.minY, Math.min(bounds.maxY, fish.aim.y + data.dy));
      }
    } else if (action === "aimPosition" && role === "fisher") {
      const fish = gameState.encounter;
      if (fish && fish.stage === "hooked" && fish.type === "aim" && Number.isFinite(data.x) && Number.isFinite(data.y)) {
        const bounds = aimBounds();
        fish.aim.x = Math.max(bounds.minX, Math.min(bounds.maxX, data.x));
        fish.aim.y = Math.max(bounds.minY, Math.min(bounds.maxY, data.y));
      }
    } else if (action === "cleanBarnacles" && role === "fisher") {
      if (gameState.barnacles < 1 || gameState.encounter || gameState.ropeTangled || gameState.barnacleCleaning > 0) return;
      gameState.barnaclePositions = randomBarnaclePositions();
      gameState.barnacleTargets = gameState.barnaclePositions.map((_, index) => index);
      gameState.barnacleCleaning = gameState.barnacleTargets.length;
      playSfx("action");
      sendNotice("Barnacle cleanup started. Scrape every cluster to resume fishing.");
    } else if (action === "scrapeBarnacle" && role === "fisher") {
      if (gameState.barnacleCleaning <= 0 || !Number.isInteger(data.index) || !gameState.barnacleTargets.includes(data.index)) return;
      gameState.barnacleTargets = gameState.barnacleTargets.filter((index) => index !== data.index);
      gameState.barnacleCleaning = gameState.barnacleTargets.length;
      playSfx("action");
      if (gameState.barnacleCleaning === 0) {
        gameState.barnacles = 0;
        gameState.barnacleCritical = false;
        gameState.barnaclePositions = [];
        gameState.fishSpawnIn = 4 + Math.floor(Math.random() * 5);
        sendNotice("All barnacle clusters scraped. The hull is clean and fishing can resume.");
      }
    } else if (action === "untangleRope" && role === "fisher") {
      if (!gameState.ropeTangled) return;
      gameState.ropeFixProgress += 1;
      if (gameState.ropeFixProgress >= 5) {
        gameState.ropeTangled = false;
        gameState.ropeFixProgress = 0;
        gameState.ropeTangleIn = 45 + Math.floor(Math.random() * 36);
        gameState.fishSpawnIn = 4 + Math.floor(Math.random() * 5);
        sendNotice("Fishing line untangled. Back to fishing!");
      }
    } else if (action === "repair" && role === "engineer") {
      const issue = issueById(data.id);
      if (issue && issue.room === data.room && (mode === "host" && role !== localRole || selectedIssueId === issue.id)) applyRepair(issue, data);
    } else if (action === "sell") {
      if (gameState.checkpointOpen && gameState.inventory.length) {
        const total = gameState.inventory.reduce((sum, fish) => sum + fish.value, 0);
        gameState.gold += total;
        gameState.inventory = [];
        playSfx("sell");
        sendNotice(`Catch sold for ${total} gold.`);
      }
    } else if (action === "upgrade") {
      buyUpgrade(data.key);
    } else if (action === "buyBait") {
      buyBait();
    } else if (action === "checkpointContinue" && gameState.checkpointOpen) {
      gameState.checkpointOpen = false;
      gameState.fishSinceCheckpoint = 0;
      gameState.nextCheckpoint += checkpointDistance;
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
        issue.pattern = Array.from({ length: 5 }, () => Math.floor(Math.random() * 9));
        repairSignature = "";
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
      if (issue.progress >= .97) finish();
    } else if (issue.type === "bolts") {
      if (data.mode !== "bolt" || !Number.isInteger(data.index) || data.index < 0 || data.index > 5) return;
      if (issue.bolts.includes(data.index)) return;
      issue.boltTurns ||= {};
      issue.boltTurns[data.index] = Math.min(3, (issue.boltTurns[data.index] || 0) + 1);
      if (issue.boltTurns[data.index] >= 3) issue.bolts.push(data.index);
      if (issue.bolts.length >= 6) finish();
    } else if (issue.type === "barnacles") {
      if (data.mode !== "scrape" || !Number.isInteger(data.index) || data.index < 0 || data.index >= issue.barnaclePositions.length) return;
      if (!issue.barnacles.includes(data.index)) return;
      issue.barnacles = issue.barnacles.filter((index) => index !== data.index);
      issue.armTarget = issue.barnaclePositions[issue.barnacles[0]] || null;
      if (issue.barnacles.length === 0) finish();
    } else if (issue.type === "harpoon") {
      if (data.mode !== "harpoon" || data.step !== issue.step) return;
      issue.step += 1;
      if (issue.step >= 3) finish();
    } else if (issue.type === "fuel" || issue.type === "water") {
      if (data.mode !== "pump") return;
      issue.progress = Math.min(9, issue.progress + Math.min(3, 1 + Math.floor(gameState.upgrades.bilge / 2)));
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
    if (gameState.upgrades[key] >= upgradeMaxLevels[key]) {
      sendNotice(`${upgrades[key].name} is already at maximum level.`, true);
      return;
    }
    const cost = upgradeCost(key);
    if (gameState.gold < cost) {
      sendNotice(`Not enough gold — ${upgrades[key].name} costs ${cost}.`, true);
      return;
    }
    gameState.gold -= cost;
    gameState.upgrades[key] += 1;
    gameState.purchases[key] += 1;
    playSfx("repair");
    sendNotice(`${upgrades[key].name} upgraded to level ${gameState.upgrades[key]}. Next price rises by 5%.`);
  }

  function baitPrice() {
    return baseBaitPrice + Math.floor(gameState.baitPurchases / 6);
  }

  function buyBait() {
    if (!gameState.checkpointOpen) return;
    if (gameState.bait > 0) {
      sendNotice(`Use the remaining ${gameState.bait} bait before restocking.`, true);
      return;
    }
    const cost = baitPrice();
    if (gameState.gold < cost) {
      sendNotice(`Not enough gold — ${baitRestockAmount} bait costs ${cost} G.`, true);
      return;
    }
    gameState.gold -= cost;
    gameState.bait = Math.min(baitCapacity, gameState.bait + baitRestockAmount);
    gameState.baitPurchases += 1;
    gameState.fishSpawnIn = 4 + Math.floor(Math.random() * 5);
    playSfx("sell");
    sendNotice(`Restocked ${baitRestockAmount} bait for ${cost} G. The next restock price rises slowly.`);
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

  function makeBarnacleField(positions, actionAttributes, className = "") {
    const field = document.createElement("div");
    field.className = `barnacle-field${className ? ` ${className}` : ""}`;
    const hull = document.createElement("div");
    hull.className = "barnacle-hull";
    hull.setAttribute("aria-hidden", "true");
    const arm = document.createElement("div");
    arm.className = "scraper-arm";
    arm.innerHTML = '<span class="arm-claw"></span>';
    field.append(hull, arm);
    for (let index = 0; index < positions.length; index++) {
      const target = makeButton("", { ...actionAttributes, index }, "mini-button barnacle-target");
      target.setAttribute("aria-label", `Scrape barnacle cluster ${index + 1}`);
      target.innerHTML = '<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M15 3 19 9l7-1-2 7 4 5-7 2-3 6-5-5-7 1 1-7-4-5 7-2z"/><circle cx="15" cy="15" r="4"/></svg>';
      const [x, y] = positions[index];
      target.style.left = `${x * 100}%`;
      target.style.top = `${y * 100}%`;
      field.append(target);
    }
    const armLabel = document.createElement("span");
    armLabel.className = "scraper-label";
    armLabel.textContent = "ROBOTIC SCRAPER";
    field.append(armLabel);
    return field;
  }

  function makeArrowIcon(key) {
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.classList.add("direction-arrow");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", arrowPaths[key]);
    icon.append(path);
    return icon;
  }

  function makeSequencePreview(values, glyph = (value) => String(value + 1)) {
    const preview = document.createElement("div");
    preview.className = "sequence-preview";
    preview.setAttribute("aria-label", "Memorize the signal sequence");
    values.forEach((value, index) => {
      const light = document.createElement("span");
      const mark = glyph(value);
      if (mark instanceof Element) light.append(mark);
      else light.textContent = String(mark);
      light.style.animationDelay = `${index * .34}s`;
      preview.append(light);
    });
    return preview;
  }

  function concealSequencePreview(preview) {
    preview.classList.add("concealed");
    preview.querySelectorAll("span").forEach((light) => {
      light.textContent = "●";
      light.setAttribute("aria-label", "Hidden signal");
    });
    preview.setAttribute("aria-label", "Signal sequence hidden");
  }

  function randomBoltPositions() {
    const positions = [...boltSpots];
    for (let index = positions.length - 1; index > 0; index--) {
      const swap = Math.floor(Math.random() * (index + 1));
      [positions[index], positions[swap]] = [positions[swap], positions[index]];
    }
    return positions.slice(0, 6);
  }

  function randomBarnaclePositions() {
    const positions = [
      [.17, .28], [.34, .2], [.53, .24], [.75, .3], [.24, .52], [.46, .48],
      [.68, .54], [.84, .61], [.15, .73], [.38, .72], [.59, .77], [.79, .78]
    ];
    for (let index = positions.length - 1; index > 0; index--) {
      const swap = Math.floor(Math.random() * (index + 1));
      [positions[index], positions[swap]] = [positions[swap], positions[index]];
    }
    return positions.slice(0, 8);
  }

  function renderFishing() {
    const fish = gameState.encounter;
    const scene = el.oceanScene;
    const target = scene.querySelector(".aim-target");
    const dot = scene.querySelector(".aim-dot");
    target.classList.add("hidden");
    dot.classList.add("hidden");
    el.shoalCursor.classList.add("hidden");
    const baitEmpty = gameState.bait <= 0;
    el.baitCount.textContent = baitEmpty
      ? fish ? "0 BAIT · LAST ENCOUNTER" : "NO BAIT · CHECKPOINT"
      : `BAIT · ${gameState.bait}`;
    el.baitCount.classList.toggle("low", gameState.bait > 0 && gameState.bait <= 2);
    el.baitCount.classList.toggle("empty", baitEmpty);
    el.baitCount.setAttribute("aria-label", baitEmpty
      ? fish ? "No bait remaining; finish the current encounter" : "No bait; restock at the next checkpoint"
      : `${gameState.bait} bait remaining`);
    const harpoonOffline = gameState.issues.some((issue) => issue.type === "harpoon");
    el.harpoonWarning.classList.toggle("hidden", !harpoonOffline);
    if (!fish) {
      el.fisherTimer.classList.add("hidden");
      el.swimmingFish.replaceChildren();
      el.encounterRarity.textContent = "SCANNING THE DEEP";
      el.encounterRarity.style.color = "";
      el.encounterTitle.textContent = "The water is quiet";
      el.encounterCopy.textContent = gameState.ropeTangled
        ? "Fishing is paused while the Fisher untangles the line."
        : gameState.barnacleCleaning > 0
          ? "Fishing is paused while the Fisher cleans the hull."
          : gameState.bait > 0
            ? "Next sonar contact expected in about 4–8 seconds."
            : gameState.checkpointOpen
              ? "No bait left. Restock at this checkpoint."
              : "No bait left. Restock at the next checkpoint.";
      el.fishingTaskTitle.textContent = baitEmpty ? "No bait left" : "Standing by";
      el.fishingTaskHelp.textContent = baitEmpty
        ? gameState.checkpointOpen
          ? "Restock ten bait in the checkpoint shop before fishing again."
          : "Restock at the next checkpoint before fishing again."
        : "Watch for a bite and follow the on-screen challenge.";
      el.fishingActions.replaceChildren(makeButton(baitEmpty ? "NO BAIT · CHECKPOINT" : "Waiting for a bite", {}, "action-button"));
      el.fishingActions.firstElementChild.disabled = true;
      el.fishImage.hidden = true;
      $(".ocean-silhouette").hidden = false;
      return;
    }

    el.fisherTimer.classList.remove("hidden");
    el.fisherTimer.querySelector("span").textContent = Math.max(0, Math.ceil(fish.timeLeft));
    el.fisherTimer.classList.toggle("urgent", fish.timeLeft <= 5);
    const rarity = rarityByKey[fish.rarity] || rarityByKey.common;
    const fishingPaused = gameState.ropeTangled || gameState.barnacleCleaning > 0;
    el.encounterRarity.textContent = rarity.name.toUpperCase();
    el.encounterRarity.style.color = fish.rarity === "treasure" || fish.rarity === "mythic" ? "var(--amber)" : "";
    el.encounterTitle.textContent = fish.stage === "bite" ? "Something is on the line!" : fish.species || rarity.species[0];
    el.encounterCopy.textContent = harpoonOffline ? "The harpoon is damaged. Repair it before you can fish." : fish.stage === "bite" ? "Get ready to hook it before it slips away." : `Keep it on the line · ${Math.max(0, fish.timeLeft)}s`;
    const illustrationKey = `${fish.species}:${fish.rarity}`;
    if (el.fishImage.dataset.illustration !== illustrationKey) {
      el.fishImage.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fishIllustration(fish.species, fish.rarity))}`;
      el.fishImage.dataset.illustration = illustrationKey;
    }
    el.fishImage.alt = fish.species;
    el.fishImage.hidden = fish.type === "shoal";
    $(".ocean-silhouette").hidden = true;
    el.fishingActions.replaceChildren();

    if (fish.stage === "bite") {
      el.swimmingFish.replaceChildren();
      el.fishingTaskTitle.textContent = "A bite!";
      el.fishingTaskHelp.textContent = isSharedControlMode() ? "Fisher: press Space or cast before the fish gets away." : "Cast your harpoon before the fish gets away.";
      const button = makeButton(isSharedControlMode() ? "CAST  ·  SPACE" : "Cast harpoon", {}, "action-button");
      button.dataset.fishing = "cast";
      if (harpoonOffline) button.textContent = "Harpoon offline";
      button.disabled = !canFisherAct() || harpoonOffline || fishingPaused || gameState.ended;
      el.fishingActions.append(button);
      if (harpoonOffline) {
        el.fishingTaskTitle.textContent = "Harpoon offline";
        el.fishingTaskHelp.textContent = "Fishing is locked until the harpoon is repaired.";
      }
      return;
    }

    if (fish.type === "shoal") {
      el.fishingTaskTitle.textContent = "Pick a fish from the shoal";
      el.fishingTaskHelp.textContent = isSharedControlMode()
        ? "Steer with WASD or mouse, then click a fish or press Space when the cursor overlaps it."
        : "Click a passing fish before the shoal swims out of reach.";
      const existing = new Map([...el.swimmingFish.children].map((button) => [Number(button.dataset.swimmer), button]));
      const visibleIndexes = new Set();
      fish.swimmers.forEach((swimmer, index) => {
        const button = existing.get(index);
        if (swimmer.caught) {
          button?.remove();
          return;
        }
        visibleIndexes.add(index);
        const swimmerButton = button || makeButton("", { swimmer: index }, "fish-swimmer");
        const illustrationKey = `${swimmer.species}:${fish.rarity}`;
        if (swimmerButton.dataset.illustration !== illustrationKey) {
          swimmerButton.innerHTML = fishIllustration(swimmer.species, fish.rarity);
          swimmerButton.dataset.illustration = illustrationKey;
          swimmerButton.setAttribute("aria-label", `Catch ${swimmer.species}`);
        }
        swimmerButton.disabled = harpoonOffline || fishingPaused || !canFisherAct() || gameState.ended;
        swimmerButton.style.left = `${swimmer.x * 100}%`;
        swimmerButton.style.top = `${swimmer.y * 100}%`;
        swimmerButton.classList.toggle("swimming-left", swimmer.direction < 0);
        if (!button) el.swimmingFish.append(swimmerButton);
      });
      existing.forEach((button, index) => {
        if (!visibleIndexes.has(index)) button.remove();
      });
      if (isSharedControlMode() && !harpoonOffline) {
        el.shoalCursor.classList.remove("hidden");
        el.shoalCursor.style.left = `${fish.cursor.x * 100}%`;
        el.shoalCursor.style.top = `${fish.cursor.y * 100}%`;
      }
      el.fishingActions.append(document.createRange().createContextualFragment(progressMarkup(fish.progress, fish.needed)));
    } else if (fish.type === "aim") {
      el.swimmingFish.replaceChildren();
      el.fishingTaskTitle.textContent = "Keep the aim steady";
      el.fishingTaskHelp.textContent = isSharedControlMode()
        ? "Fisher: use WASD or mouse to keep the dot in the ring; slight drift won't erase progress."
        : "Keep the dot in the drifting ring; slight deviations won't erase progress. Use mouse or WASD / arrows.";
      target.classList.remove("hidden");
      dot.classList.remove("hidden");
      target.style.left = `${fish.target.x * 100}%`;
      target.style.top = `${fish.target.y * 100}%`;
      dot.style.left = `${fish.aim.x * 100}%`;
      dot.style.top = `${fish.aim.y * 100}%`;
      el.fishingActions.innerHTML = progressMarkup(fish.progress, fish.needed);
    } else if (fish.type === "rhythm") {
      el.swimmingFish.replaceChildren();
      el.fishingTaskTitle.textContent = "Match the rhythm";
      el.fishingTaskHelp.textContent = isSharedControlMode()
        ? "Fisher: tap W, D, S, A to match the sequence before the line goes slack."
        : "Press the arrows in sequence before the line goes slack.";
      const keys = document.createElement("div");
      keys.className = "rhythm-keys";
      fish.sequence.forEach((key, index) => {
        const span = document.createElement("span");
        span.className = `rhythm-key${index < fish.seqIndex ? " hit" : ""}${index === fish.seqIndex ? " next" : ""}`;
        span.append(makeArrowIcon(key));
        span.setAttribute("aria-label", `Direction ${arrowNames[key]}`);
        span.setAttribute("role", "button");
        span.tabIndex = canFisherAct() && !harpoonOffline && !fishingPaused ? 0 : -1;
        span.setAttribute("aria-disabled", String(harpoonOffline || fishingPaused));
        span.dataset.fishing = "rhythm";
        span.dataset.key = key;
        keys.append(span);
      });
      el.fishingActions.append(keys);
    } else {
      el.swimmingFish.replaceChildren();
      el.fishingTaskTitle.textContent = "Reel it in!";
      el.fishingTaskHelp.textContent = "Tap fast or press Space to keep the fish on the line.";
      const button = makeButton("REEL  ·  SPACE", {}, "action-button");
      button.dataset.fishing = "reel";
      button.disabled = !canFisherAct() || harpoonOffline || fishingPaused || gameState.ended;
      el.fishingActions.append(button, document.createRange().createContextualFragment(progressMarkup(fish.progress, fish.needed)));
    }
    if (harpoonOffline || fishingPaused) {
      el.fishingTaskTitle.textContent = harpoonOffline ? "Harpoon offline" : "Fishing paused";
      el.fishingTaskHelp.textContent = harpoonOffline ? "Fishing is locked until the harpoon is repaired." : "Clear the line knot or finish cleaning the hull to resume.";
      el.fishingActions.querySelectorAll("[data-fishing], [data-swimmer], [role='button']").forEach((control) => {
        control.setAttribute("aria-disabled", "true");
        if ("disabled" in control) control.disabled = true;
      });
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
      const critical = issue.secondsLeft <= 10;
      row.classList.toggle("critical", critical);
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
      const timer = document.createElement("span");
      timer.className = `mission-timer${critical ? " urgent" : ""}`;
      timer.textContent = `${Math.max(0, issue.secondsLeft)}s`;
      const open = makeButton("Repair", { issue: issue.id }, "action-button");
      open.disabled = !canEngineerAct() || gameState.ended;
      row.append(details, timer, open);
      if (critical) {
        const label = document.createElement("span");
        label.className = "danger-label";
        label.textContent = "CRITICAL";
        row.append(label);
      }
      el.missionList.append(row);
    }
  }

  function renderRepair() {
    const issue = selectedIssueId && issueById(selectedIssueId);
    if (!issue) {
      el.repairTimer.classList.add("hidden");
      resetRepairPanel();
      el.repairRoomLabel.textContent = gameState.issues.length ? "REPAIR DESK" : "STANDBY";
      el.repairTitle.textContent = gameState.issues.length ? "Choose a system fault" : "All systems quiet";
      el.repairInstructions.textContent = gameState.issues.length
        ? "Select any active call to open its repair challenge. Keep an eye on the countdown."
        : "The repair station is ready. New faults will appear as the submarine descends.";
      const signature = `standby:${gameState.issues.length ? "active" : "clear"}`;
      if (repairSignature !== signature) {
        repairSignature = signature;
        const status = document.createElement("div");
        status.className = "repair-standby";
        const icon = document.createElement("span");
        icon.className = "repair-standby-icon";
        icon.textContent = gameState.issues.length ? "!" : "✓";
        const message = document.createElement("b");
        message.textContent = gameState.issues.length ? "Repair desk ready" : "No repairs needed";
        const help = document.createElement("span");
        help.textContent = gameState.issues.length ? "Pick a highlighted call from the board." : "Stay alert for the next system fault.";
        status.append(icon, message, help);
        el.repairChallenge.replaceChildren(status);
      }
      return;
    }
    el.repairPanel.classList.remove("hidden");
    el.repairTimer.classList.remove("hidden");
    el.repairTimer.classList.toggle("urgent", issue.secondsLeft <= 10);
    el.repairTimer.textContent = `${Math.max(0, issue.secondsLeft)}s`;
    el.repairRoomLabel.textContent = issue.room.toUpperCase();
    el.repairTitle.textContent = issueInfo[issue.type].name;
    el.repairInstructions.textContent = issueInfo[issue.type].instructions;
    const signature = `${issue.id}:${issue.type}:${issue.type === "sequence" ? issue.pattern.join(",") : ""}`;
    if (signature !== repairSignature) {
      repairSignature = signature;
      el.repairChallenge.replaceChildren();
      if (issue.type === "sequence") {
        const preview = makeSequencePreview(issue.pattern);
        el.repairChallenge.append(preview);
        const grid = document.createElement("div");
        grid.className = "sequence-grid";
        for (let index = 0; index < 9; index++) {
          const tile = makeButton(String(index + 1), { repair: "sequence", index });
          tile.setAttribute("aria-label", `Signal tile ${index + 1}`);
          grid.append(tile);
        }
        el.repairChallenge.append(grid);
        setTimeout(() => {
          if (preview.isConnected) concealSequencePreview(preview);
        }, Math.max(1800, issue.pattern.length * 300 + 350));
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
        const reading = document.createElement("span");
        reading.className = "alignment-reading";
        dial.append(submarine, level, reading);
        const left = makeButton("", { repair: "align", direction: "-1" }, "alignment-button");
        left.setAttribute("aria-label", "Trim left");
        left.append(makeArrowIcon("ArrowLeft"));
        const right = makeButton("", { repair: "align", direction: "1" }, "alignment-button");
        right.setAttribute("aria-label", "Trim right");
        right.append(makeArrowIcon("ArrowRight"));
        controls.append(left, dial, right);
        el.repairChallenge.append(controls);
      } else if (issue.type === "engine") {
        const preview = makeSequencePreview(issue.pattern, makeArrowIcon);
        el.repairChallenge.append(preview);
        const buttons = document.createElement("div");
        buttons.className = "sequence-grid arrow-grid";
        arrowKeys.forEach((key) => {
          const button = makeButton("", { repair: "engine", key });
          button.setAttribute("aria-label", `Press ${arrowNames[key]}`);
          button.append(makeArrowIcon(key));
          buttons.append(button);
        });
        el.repairChallenge.append(buttons);
      } else if (issue.type === "valve") {
        const valve = makeButton("", { repair: "turn" }, "mini-button valve-button");
        valve.setAttribute("aria-label", "Turn the valve");
        valve.innerHTML = '<span class="valve-wheel" aria-hidden="true"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="13"/><path d="M20 3v34M3 20h34M8 8l24 24M32 8 8 32"/><circle cx="20" cy="20" r="4"/></svg></span><span>TURN VALVE</span>';
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
          const bolt = makeButton("", { repair: "bolt", index }, "mini-button bolt-button");
          bolt.innerHTML = '<span class="bolt-screw" aria-hidden="true">✣</span><small class="bolt-turn-count"></small>';
          const [x, y] = issue.boltPositions[index];
          bolt.style.left = `${x * 100}%`;
          bolt.style.top = `${y * 100}%`;
          bolt.title = `Secure bolt ${index + 1}`;
          field.append(bolt);
        }
        el.repairChallenge.append(field);
      } else if (issue.type === "barnacles") {
        el.repairChallenge.append(makeBarnacleField(issue.barnaclePositions, { repair: "scrape" }));
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
      const max = issue.type === "sequence" ? issue.pattern.length : issue.type === "engine" ? issue.pattern.length : issue.type === "valve" ? 8 : issue.type === "bolts" ? 18 : issue.type === "barnacles" ? 8 : issue.type === "harpoon" ? 3 : issue.type === "weld" ? 1 : issue.type === "alignment" ? 90 : 9;
      const boltTurns = issue.boltTurns || {};
      const completedTurns = Object.values(boltTurns).reduce((sum, turns) => sum + Math.min(3, turns), 0);
      const value = issue.type === "sequence" || issue.type === "engine" || issue.type === "harpoon" ? issue.step : issue.type === "bolts" ? completedTurns : issue.type === "barnacles" ? 8 - issue.barnacles.length : issue.type === "alignment" ? max - Math.abs(issue.angle) : issue.progress;
      progress.style.width = `${Math.max(0, Math.min(100, value / max * 100))}%`;
    }
    const submarine = el.repairChallenge.querySelector(".alignment-sub");
    if (submarine) submarine.style.transform = `rotate(${issue.angle}deg)`;
    const alignmentReading = el.repairChallenge.querySelector(".alignment-reading");
    if (alignmentReading) alignmentReading.textContent = `${Math.round(issue.angle)}°`;
    const valveWheel = el.repairChallenge.querySelector(".valve-wheel");
    if (valveWheel) valveWheel.style.transform = `rotate(${issue.progress * 45}deg)`;
    const pumpFill = el.repairChallenge.querySelector(".pump-gauge i");
    if (pumpFill) pumpFill.style.width = `${Math.min(100, issue.progress / 9 * 100)}%`;
    const pumpReading = el.repairChallenge.querySelector(".pump-reading");
    if (pumpReading) pumpReading.textContent = `${Math.min(9, issue.progress)} / 9 strokes`;
    const scraperArm = el.repairChallenge.querySelector(".scraper-arm");
    const barnacleField = el.repairChallenge.querySelector(".barnacle-field");
    if (scraperArm && barnacleField && issue.armTarget) {
      const rect = barnacleField.getBoundingClientRect();
      const [x, y] = issue.armTarget;
      const angle = Math.atan2((y - .84) * rect.height, (x - .1) * rect.width);
      scraperArm.style.transform = `rotate(${angle}rad)`;
    }
    el.repairChallenge.querySelectorAll("[data-repair='bolt']").forEach((button) => {
      const index = Number(button.dataset.index);
      const turns = Math.min(3, issue.boltTurns?.[index] || 0);
      const complete = issue.bolts.includes(index);
      button.classList.toggle("done", complete);
      button.querySelector(".bolt-screw").style.transform = `rotate(${turns * 120}deg)`;
      button.querySelector(".bolt-turn-count").textContent = complete ? "✓" : `${turns}/3`;
      button.title = complete ? `Bolt ${index + 1} secured` : `Turn bolt ${index + 1} · ${3 - turns} left`;
      button.disabled = complete || !canEngineerAct() || gameState.ended;
    });
    el.repairChallenge.querySelectorAll("button[data-repair]").forEach((button) => {
      if (issue.type === "harpoon") {
        const step = Number(button.dataset.step);
        button.classList.toggle("done", step < issue.step);
        button.classList.toggle("active", step === issue.step);
        button.disabled = step !== issue.step || !canEngineerAct() || gameState.ended;
      } else if (issue.type === "barnacles") {
        const index = Number(button.dataset.index);
        const active = issue.barnacles.includes(index);
        button.classList.toggle("scraped", !active);
        button.disabled = !active || !canEngineerAct() || gameState.ended;
      } else if (issue.type !== "bolts") {
        button.disabled = !canEngineerAct() || gameState.ended;
      }
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
    el.sellButton.disabled = !open || total === 0 || gameState.ended;
    const species = [...new Set(gameState.inventory.map((fish) => fish.species).filter(Boolean))];
    el.inventoryCopy.textContent = gameState.inventory.length
      ? `${gameState.inventory.length} fish in the hold${species.length ? ` · ${species.join(", ")}` : ""}. Sell the haul to fund crew upgrades.`
      : "Your hold is empty. Catch fish to sell them for gold.";
    el.buyBait.textContent = gameState.bait > 0
      ? `${gameState.bait}/${baitCapacity} bait aboard`
      : `Restock ${baitRestockAmount} bait · ${baitPrice()} G`;
    el.buyBait.disabled = !open || gameState.bait > 0 || gameState.gold < baitPrice() || gameState.ended;
    el.upgradeList.replaceChildren();
    for (const [key, item] of Object.entries(upgrades)) {
      const card = document.createElement("div");
      card.className = "upgrade-card";
      const name = document.createElement("b");
      name.textContent = `${item.name} · Lv ${gameState.upgrades[key]}`;
      const description = document.createElement("small");
      description.textContent = item.description;
      const maxed = gameState.upgrades[key] >= upgradeMaxLevels[key];
      const buy = makeButton(maxed ? "MAX LEVEL" : `Buy · ${upgradeCost(key)} ◈`, { upgrade: key }, "");
      buy.disabled = !open || maxed || gameState.gold < upgradeCost(key) || gameState.ended;
      card.append(name, description, buy);
      el.upgradeList.append(card);
    }
  }

  function renderFishCollection() {
    if (el.fishLogPanel.classList.contains("hidden")) return;
    const collection = gameState.collection || {};
    const signature = Object.keys(collection).sort().map((species) => `${species}:${collection[species]}`).join("|");
    if (signature === fishCollectionSignature) return;
    fishCollectionSignature = signature;
    const discovered = Object.values(collection).filter((count) => count > 0).length;
    el.fishLogSummary.textContent = `${discovered} of ${rarityData.reduce((total, rarity) => total + rarity.species.length, 0)} species discovered this voyage.`;
    el.fishCollection.replaceChildren();
    for (const rarity of rarityData) {
      for (const species of rarity.species) {
        const count = collection[species] || 0;
        const entry = document.createElement("article");
        entry.className = `collection-entry${count ? " discovered" : ""}`;
        const art = document.createElement("span");
        art.className = "collection-art";
        art.innerHTML = fishIllustration(species, rarity.key);
        art.setAttribute("aria-hidden", "true");
        const details = document.createElement("span");
        details.className = "collection-details";
        const name = document.createElement("b");
        name.textContent = species;
        const metadata = document.createElement("small");
        metadata.textContent = `${rarity.name} · ${count ? `Caught ${count}` : "Not caught yet"}`;
        details.append(name, metadata);
        entry.append(art, details);
        el.fishCollection.append(entry);
      }
    }
  }

  function renderFisherActivity() {
    const barnacles = gameState.barnacles || 0;
    el.barnacleValue.textContent = `${Math.floor(barnacles)}%`;
    el.barnacleMeter.style.width = `${Math.min(100, barnacles)}%`;
    el.barnacleMeter.classList.toggle("danger-fill", barnacles >= 60);
    if (gameState.ropeTangled) {
      el.fisherActivityStatus.textContent = `Fishing paused · untangle the line (${gameState.ropeFixProgress || 0}/5).`;
      el.fisherActivityButton.textContent = `Untangle Line · ${gameState.ropeFixProgress || 0}/5`;
      el.fisherActivityButton.dataset.activity = "untangle";
      el.fisherActivityButton.disabled = !canFisherAct() || gameState.ended;
    } else if (gameState.barnacleCleaning > 0) {
      el.fisherActivityStatus.textContent = `Cleaning barnacles · ${gameState.barnacleCleaning} clusters left. Fishing is paused.`;
      el.fisherActivityButton.textContent = `Cleaning · ${gameState.barnacleCleaning} left`;
      el.fisherActivityButton.dataset.activity = "clean";
      el.fisherActivityButton.disabled = true;
    } else {
      el.fisherActivityStatus.textContent = gameState.encounter
        ? `Finish this catch, then clean the hull${barnacles >= 60 ? " now — hull damage is accelerating" : " before 60%"}.`
        : barnacles >= 60
          ? "HULL DAMAGE ACCELERATING · Clean the barnacles before they reach 100%."
          : "Barnacles build by 1% every 1.5 seconds. Clean them before 60%.";
      el.fisherActivityButton.textContent = "Clean Barnacles";
      el.fisherActivityButton.dataset.activity = "clean";
      el.fisherActivityButton.disabled = !canFisherAct() || gameState.ended || barnacles < 1 || Boolean(gameState.encounter);
    }
  }

  function renderBarnacleCleanup() {
    const active = gameState.barnacleCleaning > 0;
    el.barnacleCleanupOverlay.classList.toggle("hidden", !active);
    if (!active) {
      barnacleCleanupSignature = "";
      el.barnacleCleanupField.replaceChildren();
      return;
    }

    const signature = gameState.barnaclePositions.map(([x, y]) => `${x},${y}`).join("|");
    if (signature !== barnacleCleanupSignature) {
      barnacleCleanupSignature = signature;
      el.barnacleCleanupField.replaceChildren(
        makeBarnacleField(gameState.barnaclePositions, { cleanupBarnacle: true }, "cleanup-field")
      );
    }
    el.barnacleCleanupProgress.textContent = `${gameState.barnacleCleaning} / ${gameState.barnaclePositions.length} CLUSTERS LEFT`;
    const remaining = new Set(gameState.barnacleTargets);
    el.barnacleCleanupField.querySelectorAll("[data-cleanup-barnacle]").forEach((button) => {
      const activeTarget = remaining.has(Number(button.dataset.index));
      button.classList.toggle("scraped", !activeTarget);
      button.disabled = !activeTarget || gameState.ended;
    });
    const arm = el.barnacleCleanupField.querySelector(".scraper-arm");
    const [x, y] = gameState.barnaclePositions[gameState.barnacleTargets[0]] || [];
    if (arm && Number.isFinite(x) && Number.isFinite(y)) {
      const rect = el.barnacleCleanupField.getBoundingClientRect();
      arm.style.transform = `rotate(${Math.atan2((y - .84) * rect.height, (x - .1) * rect.width)}rad)`;
    }
  }

  function render() {
    if (!gameState) return;
    gameState.collection ||= {};
    const lowFuelIssue = gameState.issues.find((issue) => issue.type === "fuel");
    if (canEngineerAct() && lowFuelIssue && gameState.fuel <= 50 && selectedIssueId !== lowFuelIssue.id) {
      selectedIssueId = lowFuelIssue.id;
      repairSignature = "";
    }
    el.roleBadge.textContent = mode === "local" ? "LOCAL CREW" : mode === "solo" ? "SOLO PILOT" : localRole.toUpperCase();
    el.fisherOwner.textContent = mode === "local"
      ? `LOCAL PLAYER ${localFisherPlayer}`
      : mode === "solo"
        ? "YOU"
        : localRole === "fisher"
          ? "YOU"
          : mode === "host" && !onlineRolePicks.client
            ? "WAITING"
            : "CREWMATE";
    el.engineerOwner.textContent = mode === "local"
      ? `LOCAL PLAYER ${localFisherPlayer === 1 ? 2 : 1}`
      : mode === "solo"
        ? "YOU"
        : localRole === "engineer"
          ? "YOU"
          : mode === "host" && !onlineRolePicks.client
            ? "WAITING"
            : "CREWMATE";
    el.depth.textContent = Math.floor(gameState.depth);
    el.gold.textContent = Math.floor(gameState.gold);
    el.caughtCount.textContent = gameState.caught;
    el.checkpointDistance.textContent = Math.max(0, gameState.nextCheckpoint - Math.floor(gameState.depth));
    el.checkpointFishProgress.textContent = gameState.checkpointOpen
      ? "CHECKPOINT READY"
      : `${Math.min(fishPerCheckpoint, gameState.fishSinceCheckpoint || 0)}/${fishPerCheckpoint} FISH`;
    const legStart = gameState.nextCheckpoint - checkpointDistance;
    const legProgress = Math.max(0, Math.min(1, (gameState.depth - legStart) / checkpointDistance));
    el.progressMeter.style.width = `${(gameState.checkpointOpen ? 1 : legProgress) * 100}%`;
    el.hullValue.textContent = `${Math.round(gameState.hull)}%`;
    el.hullMeter.style.width = `${Math.max(0, gameState.hull)}%`;
    el.fuelValue.textContent = `${Math.round(gameState.fuel)}%`;
    el.fuelMeter.style.width = `${Math.max(0, gameState.fuel)}%`;
    el.waterValue.textContent = `${Math.round(gameState.water)}%`;
    el.waterMeter.style.width = `${Math.max(0, gameState.water)}%`;
    $(".system-meter").classList.toggle("danger", gameState.hull < 30);
    document.querySelector(".fisher-station").classList.toggle("smoke-active", gameState.issues.some((issue) => issue.type === "valve"));
    const criticalIssues = gameState.issues.filter((issue) => issue.secondsLeft <= 10).length;
    el.systemNote.textContent = gameState.ended ? "HULL BREACHED · VOYAGE OVER" : gameState.barnacles >= 60 ? "BARNACLES CRITICAL · CLEAN NOW" : criticalIssues ? `${criticalIssues} CRITICAL SYSTEM${criticalIssues === 1 ? "" : "S"} · REPAIR NOW` : gameState.issues.some((issue) => issue.type === "valve") ? "Gas leak · valve repair needed" : gameState.issues.some((issue) => issue.type === "harpoon") ? "Harpoon offline" : gameState.water > 55 ? "Bilge water rising" : gameState.issues.length ? `${gameState.issues.length} system issue${gameState.issues.length === 1 ? "" : "s"} active` : "All systems nominal";
    el.quickChat.classList.toggle("hidden", mode !== "host" && mode !== "client");
    $(".crew-comms").classList.toggle("hidden", mode !== "host" && mode !== "client");
    const assets = window.CCM_ASSETS || {};
    setImage(el.subImage, el.subFallback, assets.submarine);
    el.crewMessage.textContent = gameState.ended ? "Hull breached. Start a new voyage to play again." : gameState.issues.length ? `${gameState.issues.length} issue${gameState.issues.length === 1 ? "" : "s"} need attention` : gameState.encounter ? "A catch is on the line — work together!" : gameState.checkpointOpen ? "Checkpoint reached — sell and upgrade before the next leg." : "A good crew keeps talking.";
    $("#game-over").classList.toggle("hidden", !gameState.ended);
    $("#game-over b").textContent = gameState.barnacles >= 100 ? "Barnacles overwhelmed the hull." : "The hull couldn't take any more.";
    renderFishing();
    renderFisherActivity();
    renderBarnacleCleanup();
    renderRooms();
    renderRepair();
    renderShop();
    renderFishCollection();
    document.querySelector(".fisher-station").classList.toggle("station-inactive", localRole !== "fisher" && !isSharedControlMode());
    document.querySelector(".engineer-station").classList.toggle("station-inactive", localRole !== "engineer" && !isSharedControlMode());
    el.fishLogButton.classList.toggle("hidden", mode === "lobby");
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
    if (!button || !canFisherAct() || gameState.ended) return;
    if (button.dataset.fishing === "cast") sendAction("cast", {}, "fisher");
    if (button.dataset.fishing === "reel") sendAction("reel", {}, "fisher");
    if (button.dataset.fishing === "rhythm") sendAction("rhythm", { key: button.dataset.key }, "fisher");
  }

  function handleRepairClick(event) {
    const button = event.target.closest("[data-repair]");
    if (!button || !canEngineerAct() || !selectedIssueId) return;
    const issue = issueById(selectedIssueId);
    if (!issue) return;
    const modeName = button.dataset.repair;
    const data = { id: issue.id, room: issue.room, mode: modeName };
    if (modeName === "sequence" || modeName === "bolt" || modeName === "scrape") data.index = Number(button.dataset.index);
    if (modeName === "engine") data.key = button.dataset.key;
    if (modeName === "align") data.direction = Number(button.dataset.direction);
    if (modeName === "harpoon") data.step = Number(button.dataset.step);
    sendAction("repair", data, "engineer");
  }

  function handleKeyboard(event) {
    if (mode === "lobby" || storyActive || gameState.ended || event.altKey || event.ctrlKey || event.metaKey) return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
    if (canFisherAct() && gameState.encounter) {
      const fish = gameState.encounter;
      if (fish.stage === "bite" && event.code === "Space" && !event.repeat) {
        sendAction("cast", {}, "fisher");
      } else if (fish.stage === "hooked" && fish.type === "shoal") {
        if (isSharedControlMode() && event.code === "Space" && !event.repeat) {
          sendAction("shoalClick", {}, "fisher");
        }
        const shoalMoves = {
            w: [0, -.035], a: [-.035, 0], s: [0, .035], d: [.035, 0]
        };
        const move = isSharedControlMode() ? shoalMoves[event.key.toLowerCase()] : null;
        if (move && Date.now() - lastShoalMoveSent > 45) {
          lastShoalMoveSent = Date.now();
          sendAction("shoalMove", { dx: move[0], dy: move[1] }, "fisher");
        }
      } else if (fish.stage === "hooked" && fish.type === "rhythm" && !event.repeat) {
        const rhythmKey = wasdKeys[event.key.toLowerCase()] || (!isSharedControlMode() && arrowKeys.includes(event.key) ? event.key : null);
        if (rhythmKey) sendAction("rhythm", { key: rhythmKey }, "fisher");
      }
      if (fish.stage === "hooked" && fish.type === "aim") {
        const aimMoves = {
          ArrowUp: [0, -.02], w: [0, -.02], ArrowDown: [0, .02], s: [0, .02],
          ArrowLeft: [-.02, 0], a: [-.02, 0], ArrowRight: [.02, 0], d: [.02, 0]
        };
        const move = isSharedControlMode() ? aimMoves[event.key.toLowerCase()] : aimMoves[event.key] || aimMoves[event.key.toLowerCase()];
        if (move && Date.now() - lastAimSent > 45) {
          lastAimSent = Date.now();
          sendAction("aimMove", { dx: move[0], dy: move[1] }, "fisher");
        }
      }
      if (fish.stage === "hooked" && fish.type === "reel" && event.code === "Space" && Date.now() - lastReelSent > 95) {
        lastReelSent = Date.now();
        sendAction("reel", {}, "fisher");
      }
    }
    if (canEngineerAct() && selectedIssueId && !event.repeat) {
      const issue = issueById(selectedIssueId);
      if (issue && issue.type === "alignment" && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        sendAction("repair", { id: issue.id, room: issue.room, mode: "align", direction: event.key === "ArrowRight" ? 1 : -1 }, "engineer");
      } else if (issue && issue.type === "engine" && arrowKeys.includes(event.key)) {
        sendAction("repair", { id: issue.id, room: issue.room, mode: "engine", key: event.key }, "engineer");
      }
    }
  }

  function handleOceanPointer(event) {
    const fish = gameState?.encounter;
    if (!canFisherAct() || !fish || fish.stage !== "hooked" || gameState.ropeTangled || gameState.barnacleCleaning > 0
      || gameState.issues.some((issue) => issue.type === "harpoon")) return;
    if (Date.now() - lastOceanPointerSent < 35) return;
    lastOceanPointerSent = Date.now();
    const rect = el.oceanScene.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    if (fish.type === "aim") {
      sendAction("aimPosition", { x, y }, "fisher");
    } else if (fish.type === "shoal" && isSharedControlMode()) {
      sendAction("shoalMove", { dx: x - fish.cursor.x, dy: y - fish.cursor.y }, "fisher");
    }
  }

  function handleOceanClick(event) {
    const swimmer = event.target.closest("[data-swimmer]");
    if (!swimmer || !canFisherAct() || gameState.ended) return;
    sendAction("shoalClick", { index: Number(swimmer.dataset.swimmer) }, "fisher");
  }

  function handleWeldPointerMove(event) {
    const track = event.target.closest(".weld-track");
    if (!track || !weldPointerDown || !canEngineerAct() || !selectedIssueId) return;
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
    if (nearest.distance <= 24 && nearest.progress > issue.progress + .005 && nearest.progress <= issue.progress + .08) {
      sendAction("repair", { id: issue.id, room: issue.room, mode: "weld", value: nearest.progress }, "engineer");
    }
  }

  function bindEvents() {
    document.addEventListener("pointerdown", unlockAudio, { capture: true, once: true });
    document.addEventListener("keydown", unlockAudio, { capture: true, once: true });
    document.addEventListener("click", (event) => {
      if (event.target.closest("button:not(:disabled)")) playSfx("click");
    });
    [el.menuMusic, el.engineSound].forEach((audio) => audio.addEventListener("error", () => {
      toast(`Could not load ${audio.getAttribute("src")}.`, true);
    }));
    el.menuTabs.addEventListener("click", (event) => {
      const selectedTab = event.target.closest("[data-menu]");
      if (!selectedTab) return;
      el.menuTabs.querySelectorAll("[data-menu]").forEach((tab) => {
        const selected = tab === selectedTab;
        tab.classList.toggle("active", selected);
        tab.setAttribute("aria-selected", String(selected));
        document.getElementById(tab.dataset.menu).classList.toggle("hidden", !selected);
      });
    });
    el.menuTabs.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const tabs = [...el.menuTabs.querySelectorAll("[data-menu]")];
      const currentIndex = tabs.indexOf(document.activeElement);
      const nextIndex = (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    });
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
    el.localButton.addEventListener("click", beginLocalRoleSelection);
    el.soloButton.addEventListener("click", () => enterGame("solo", "fisher", initialState()));
    el.roleChoices.forEach((button) => button.addEventListener("click", () => chooseRole(button.dataset.roleChoice)));
    el.roleCancel.addEventListener("click", returnToLobby);
    el.leaveButton.addEventListener("click", returnToLobby);
    el.storyContinue.addEventListener("click", advanceStory);
    $("#restart-button").addEventListener("click", () => sendAction("restart"));
    el.fishingActions.addEventListener("click", handleFishingClick);
    el.quickChat.addEventListener("click", (event) => {
      const button = event.target.closest("[data-chat]");
      if (button) sendQuickChat(button.dataset.chat);
    });
    el.fisherActivityButton.addEventListener("click", () => {
      if (el.fisherActivityButton.dataset.activity === "untangle") sendAction("untangleRope", {}, "fisher");
      else sendAction("cleanBarnacles", {}, "fisher");
    });
    el.barnacleCleanupField.addEventListener("click", (event) => {
      const target = event.target.closest("[data-cleanup-barnacle]");
      if (target) sendAction("scrapeBarnacle", { index: Number(target.dataset.index) }, "fisher");
    });
    el.missionList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-issue]");
      if (!button || !canEngineerAct()) return;
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
    el.repairChallenge.addEventListener("pointerup", (event) => {
      handleWeldPointerMove(event);
      weldPointerDown = false;
    });
    el.repairChallenge.addEventListener("pointercancel", () => { weldPointerDown = false; });
    el.closeRepair.addEventListener("click", () => {
      resetRepairPanel();
      render();
    });
    el.oceanScene.addEventListener("pointermove", handleOceanPointer);
    el.oceanScene.addEventListener("click", handleOceanClick);
    el.shopButton.addEventListener("click", () => {
      el.shopPanel.dataset.open = "true";
      renderShop();
      el.shopPanel.classList.remove("hidden");
    });
    el.closeShop.addEventListener("click", () => {
      el.shopPanel.classList.add("hidden");
      delete el.shopPanel.dataset.open;
      sendAction("checkpointContinue", {}, "engineer");
    });
    el.sellButton.addEventListener("click", () => sendAction("sell", {}, "engineer"));
    el.buyBait.addEventListener("click", () => sendAction("buyBait", {}, "engineer"));
    el.upgradeList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-upgrade]");
      if (button) sendAction("upgrade", { key: button.dataset.upgrade }, "engineer");
    });
    el.fishLogButton.addEventListener("click", () => {
      el.fishLogPanel.classList.toggle("hidden");
      if (!el.fishLogPanel.classList.contains("hidden")) renderFishCollection();
    });
    el.closeFishLog.addEventListener("click", () => el.fishLogPanel.classList.add("hidden"));
    window.addEventListener("keydown", handleKeyboard);
  }

  setupAimOverlay();
  bindEvents();
})();

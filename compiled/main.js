/*
 * Entry point for the AI Scenario Mobile Web RPG engine prototype. This
 * script loads a minimal content pack from the public folder, sets up a
 * basic game loop using the Canvas API, and wires up simple mobile and
 * keyboard controls. It intentionally avoids any third‑party runtime
 * dependencies to ensure it can run in an isolated environment. The
 * resulting code should compile with TypeScript and run under Vite.
 */

// Build identifier used for cache busting and GitHub Pages verification.
const BUILD_ID = '20260502_pages_path_fix_02';
/**
 * Validate the loaded content pack for invalid references.  Currently
 * only validates show_dialogue steps to ensure the referenced
 * dialogueId exists.  Returns a report containing any issues.
 */
function validateContentPack(content) {
    const dialogueIds = new Set(content.dialogues.map((d) => d.id));
    const issues = [];
    for (const event of content.events) {
        const commands = event.commands || event.steps || [];
        for (const cmd of commands) {
            if (cmd.type === 'show_dialogue') {
                const dlgId = cmd.dialogueId;
                if (!dialogueIds.has(dlgId)) {
                    issues.push({
                        severity: 'error',
                        ruleId: 'VAL_REF_001',
                        title: '存在しない会話ID参照',
                        message: `イベント「${event.id}」が、存在しない会話ID「${dlgId}」を参照しています。`,
                        file: 'events.json',
                        sourceId: event.id,
                        problemId: dlgId,
                    });
                }
            }
        }
    }
    const errorCount = issues.filter((i) => i.severity === 'error').length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;
    return { issues, summary: { errorCount, warningCount } };
}
/**
 * Render a validation error screen using the first error in the
 * report.  Hides the game UI and canvas and displays the report
 * contents in Japanese.  This is intended for developer feedback
 * rather than end‑user consumption.
 */
function renderValidationErrorScreen(report) {
    const app = document.getElementById('app');
    if (!app)
        return;
    // Hide game canvas and UI elements
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        canvas.style.display = 'none';
    }
    const ui = document.getElementById('ui');
    if (ui) {
        ui.style.display = 'none';
    }
    const dialogueOverlay = document.getElementById('dialogue');
    if (dialogueOverlay) {
        dialogueOverlay.style.display = 'none';
    }
    // Build overlay
    const overlay = document.createElement('div');
    overlay.id = 'validatorError';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.backgroundColor = '#fff';
    overlay.style.color = '#000';
    overlay.style.padding = '20px';
    overlay.style.overflowY = 'auto';
    overlay.style.zIndex = '1000';
    const issue = report.issues[0];
    overlay.innerHTML = `
    <h1>Content Pack検証エラー</h1>
    <p>検証エラーのためゲームを開始できません。</p>
    <p>error: ${report.summary.errorCount}</p>
    <p>warning: ${report.summary.warningCount}</p>
    <h3>[${issue.severity}] ${issue.title}</h3>
    <p>${issue.message}</p>
    <p>対象ファイル: ${issue.file}</p>
    <p>対象イベントID: ${issue.sourceId}</p>
    <p>問題ID: ${issue.problemId}</p>
    <p>対処: dialogues.jsonに対象IDを追加するか、events.jsonの参照先を既存の会話IDへ変更してください。</p>
  `;
    app.appendChild(overlay);
}

/**
 * Render an error screen when the content pack or its components fail to
 * load (e.g. due to incorrect paths or network errors).  This hides
 * the game UI and presents a simple message in Japanese so the user
 * understands what went wrong.  The provided error is displayed
 * alongside a hint about verifying the URL structure.
 */
function renderContentLoadError(err) {
    const app = document.getElementById('app');
    if (!app)
        return;
    // Hide game canvas and UI elements
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        canvas.style.display = 'none';
    }
    const ui = document.getElementById('ui');
    if (ui) {
        ui.style.display = 'none';
    }
    const dialogueOverlay = document.getElementById('dialogue');
    if (dialogueOverlay) {
        dialogueOverlay.style.display = 'none';
    }
    // Build overlay
    const overlay = document.createElement('div');
    overlay.id = 'contentLoadError';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.backgroundColor = '#fff';
    overlay.style.color = '#000';
    overlay.style.padding = '20px';
    overlay.style.overflowY = 'auto';
    overlay.style.zIndex = '1000';
    overlay.innerHTML = `
    <h1>コンテンツ読み込みエラー</h1>
    <p>ゲームデータの読み込み中にエラーが発生しました。</p>
    <p>${err.message}</p>
    <p>URL が正しいか、ホスティング先のパス設定を確認してください。</p>
  `;
    app.appendChild(overlay);
}
class Game {
    constructor(canvas, content) {
        this.npcs = [];
        this.flags = {};
        this.dialogues = new Map();
        this.debugEnabled = false;
        this.dpadButtons = {};
        this.keys = {};
        this.moveCooldown = 0;
        this.tileSize = 32;
        this.dialogueQueue = null;
        this.dialogueCallback = null;
        this.lastRender = 0;
        /** Animation loop wrapper. */
        this.loop = (timestamp) => {
            const delta = this.lastRender ? timestamp - this.lastRender : 16;
            this.lastRender = timestamp;
            this.update(delta);
            this.render();
            requestAnimationFrame(this.loop);
        };
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Unable to obtain 2D context');
        }
        this.canvas = canvas;
        this.ctx = ctx;
        this.content = content;
        // Transfer dialogues into a Map for faster lookup.
        content.dialogues.forEach((dlg) => {
            this.dialogues.set(dlg.id, dlg);
        });
        this.debugOverlay = document.getElementById('debugOverlay');
        this.dialogueOverlay = document.getElementById('dialogue');
        this.dialogueSpeaker = document.getElementById('dialogueSpeaker');
        this.dialogueText = document.getElementById('dialogueText');
        this.actionButton = document.getElementById('actionButton');
        // Map dpad buttons by direction keys.
        this.dpadButtons = {
            up: document.getElementById('btn-up'),
            down: document.getElementById('btn-down'),
            left: document.getElementById('btn-left'),
            right: document.getElementById('btn-right'),
        };
        this.initFlags(content.flags);
        this.initMap(content.gameConfig.startingMapId);
        this.initActors();
        this.initInput();
        this.initUI();
        // Parse debug flag from URL
        const params = new URLSearchParams(window.location.search);
        this.debugEnabled = params.get('debug') === '1';
        if (this.debugEnabled) {
            this.debugOverlay.classList.remove('hidden');
        }
    }
    /** Initialize flags based on the content pack defaults. */
    initFlags(defaults) {
        Object.entries(defaults).forEach(([k, v]) => {
            this.flags[k] = v;
        });
        // If there is saved data, merge it.
        const saved = this.loadSaved();
        if (saved) {
            this.flags = { ...this.flags, ...saved.flags };
        }
    }
    /** Initialize the map by selecting the first map. */
    initMap(mapId) {
        const map = this.content.maps.find((m) => m.id === mapId);
        if (!map) {
            throw new Error(`Map ${mapId} not found`);
        }
        this.map = map;
    }
    /** Initialize actors: create player and NPC instances. */
    initActors() {
        const playerDef = this.content.actors.find((a) => a.id === this.content.gameConfig.playerId);
        if (!playerDef)
            throw new Error(`Player actor ${this.content.gameConfig.playerId} not found`);
        // Restore saved position if available.
        const saved = this.loadSaved();
        this.player = {
            id: playerDef.id,
            name: playerDef.name,
            x: saved?.player?.x ?? playerDef.startX,
            y: saved?.player?.y ?? playerDef.startY,
            sprite: playerDef.sprite,
            facing: 'down',
        };
        // NPCs: load every other actor as an NPC.
        this.npcs = this.content.actors
            .filter((a) => a.id !== playerDef.id)
            .map((def) => ({ id: def.id, name: def.name, x: def.startX, y: def.startY, sprite: def.sprite, facing: 'down' }));
    }
    /** Save minimal state into localStorage. */
    save() {
        const data = {
            packId: this.content.packId,
            mapId: this.map.id,
            player: { x: this.player.x, y: this.player.y },
            flags: this.flags,
        };
        localStorage.setItem('aiRpgSave', JSON.stringify(data));
    }
    /** Load saved state if it matches the current content pack. */
    loadSaved() {
        try {
            const raw = localStorage.getItem('aiRpgSave');
            if (!raw)
                return null;
            const parsed = JSON.parse(raw);
            if (parsed.packId !== this.content.packId)
                return null;
            return parsed;
        }
        catch {
            return null;
        }
    }
    /** Setup input handlers for keyboard and on‑screen buttons. */
    initInput() {
        // Keyboard input
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleAction();
            }
        });
        window.addEventListener('keyup', (e) => {
            delete this.keys[e.key];
        });
        // D‑pad buttons
        ['up', 'down', 'left', 'right'].forEach((dir) => {
            const btn = this.dpadButtons[dir];
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys[dir] = true;
            });
            btn.addEventListener('touchend', () => {
                delete this.keys[dir];
            });
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.keys[dir] = true;
            });
            btn.addEventListener('mouseup', () => {
                delete this.keys[dir];
            });
            btn.addEventListener('mouseleave', () => {
                delete this.keys[dir];
            });
        });
        // Action button
        this.actionButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleAction();
        });
    }
    /** Setup UI behaviour such as updating action button text. */
    initUI() {
        // Nothing to set up yet. Action button label is updated each frame.
    }
    /** Determine if an NPC is in front of the player. */
    getNpcInFront() {
        // Compute the tile in front of the player based on facing
        let fx = this.player.x;
        let fy = this.player.y;
        switch (this.player.facing) {
            case 'up':
                fy -= 1;
                break;
            case 'down':
                fy += 1;
                break;
            case 'left':
                fx -= 1;
                break;
            case 'right':
                fx += 1;
                break;
        }
        return this.npcs.find((npc) => npc.x === fx && npc.y === fy) || null;
    }
    /** Handle the action button being pressed. */
    handleAction() {
        // If a dialogue is active, advance it
        if (this.dialogueQueue) {
            this.advanceDialogue();
            return;
        }
        const npc = this.getNpcInFront();
        if (npc) {
            // Determine which event to run based on flag
            const flagKey = 'chief_talked';
            if (!this.flags[flagKey]) {
                this.runEvent('event_talk_chief_first');
            }
            else {
                this.runEvent('event_talk_chief_after');
            }
            return;
        }
        // If no interaction, maybe confirm or inspect. For now do nothing.
    }
    /** Execute a simple event by ID. In this prototype we support only
     * show_dialogue, set_flag, start_quest, update_quest, complete_quest and
     * save_checkpoint. */
    runEvent(eventId) {
        const event = this.content.events.find((ev) => ev.id === eventId);
        if (!event) {
            console.warn(`Event ${eventId} not found`);
            return;
        }
        const runCommands = (commands, index) => {
            if (index >= commands.length) {
                // End of commands. Update action button label in next frame.
                return;
            }
            const cmd = commands[index];
            switch (cmd.type) {
                case 'show_dialogue': {
                    const dlg = this.dialogues.get(cmd.dialogueId);
                    if (!dlg) {
                        console.error(`Dialogue ${cmd.dialogueId} not found`);
                        return;
                    }
                    this.showDialogue(dlg.lines, () => {
                        runCommands(commands, index + 1);
                    });
                    break;
                }
                case 'set_flag': {
                    this.flags[cmd.flag] = cmd.value;
                    runCommands(commands, index + 1);
                    break;
                }
                case 'start_quest': {
                    // For simplicity, mark quest as started and ignore objectives.
                    console.log(`Quest ${cmd.questId} started`);
                    runCommands(commands, index + 1);
                    break;
                }
                case 'update_quest': {
                    console.log(`Quest ${cmd.questId} updated: ${cmd.description || ''}`);
                    runCommands(commands, index + 1);
                    break;
                }
                case 'complete_quest': {
                    console.log(`Quest ${cmd.questId} completed`);
                    runCommands(commands, index + 1);
                    break;
                }
                case 'save_checkpoint': {
                    this.save();
                    runCommands(commands, index + 1);
                    break;
                }
                default: {
                    console.warn(`Command ${cmd.type} not implemented`);
                    runCommands(commands, index + 1);
                    break;
                }
            }
        };
        runCommands(event.commands, 0);
    }
    /** Display a sequence of dialogue lines. The callback is invoked when
     * all lines have been consumed. */
    showDialogue(lines, callback) {
        this.dialogueQueue = lines.slice();
        this.dialogueCallback = callback;
        this.dialogueOverlay.classList.remove('hidden');
        this.advanceDialogue();
    }
    /** Advance the current dialogue by one line. If no lines remain,
     * hide the overlay and invoke the callback. */
    advanceDialogue() {
        if (!this.dialogueQueue || this.dialogueQueue.length === 0) {
            // End of dialogue
            this.dialogueQueue = null;
            this.dialogueOverlay.classList.add('hidden');
            const cb = this.dialogueCallback;
            this.dialogueCallback = null;
            if (cb)
                cb();
            return;
        }
        const line = this.dialogueQueue.shift();
        this.dialogueSpeaker.textContent = line.speaker;
        this.dialogueText.textContent = line.text;
    }
    /** Main update loop. Called every animation frame. */
    update(delta) {
        // Skip movement while a dialogue is open.
        if (!this.dialogueQueue) {
            this.updateMovement(delta);
        }
        // Update action button label depending on context.
        const npc = this.getNpcInFront();
        if (this.dialogueQueue) {
            this.actionButton.textContent = '次へ';
        }
        else if (npc) {
            this.actionButton.textContent = '話す';
        }
        else {
            this.actionButton.textContent = '決定';
        }
        // Update debug overlay if enabled.
        if (this.debugEnabled) {
            this.debugOverlay.textContent = `pack:${this.content.packId} map:${this.map.id} x:${this.player.x} y:${this.player.y} facing:${this.player.facing} flags:${JSON.stringify(this.flags)}`;
        }
    }
    /** Update player movement based on pressed keys. */
    updateMovement(delta) {
        // Simple cooldown to avoid moving too quickly.
        this.moveCooldown -= delta;
        if (this.moveCooldown > 0)
            return;
        const dirOrder = ['up', 'down', 'left', 'right'];
        for (const dir of dirOrder) {
            if (this.keys[dir] || this.keys[this.keyForDirection(dir)]) {
                // Update facing
                this.player.facing = dir;
                // Compute target position
                let nx = this.player.x;
                let ny = this.player.y;
                switch (dir) {
                    case 'up':
                        ny -= 1;
                        break;
                    case 'down':
                        ny += 1;
                        break;
                    case 'left':
                        nx -= 1;
                        break;
                    case 'right':
                        nx += 1;
                        break;
                }
                // Check map bounds
                if (nx < 0 || ny < 0 || nx >= this.map.width || ny >= this.map.height) {
                    return;
                }
                // Check collision with NPCs
                const occupied = this.npcs.some((npc) => npc.x === nx && npc.y === ny);
                if (occupied) {
                    return;
                }
                // Move player
                this.player.x = nx;
                this.player.y = ny;
                this.moveCooldown = 200; // ms
                // Save state after movement
                this.save();
                return;
            }
        }
    }
    /** Map direction string to keyboard key names. */
    keyForDirection(dir) {
        switch (dir) {
            case 'up': return 'ArrowUp';
            case 'down': return 'ArrowDown';
            case 'left': return 'ArrowLeft';
            case 'right': return 'ArrowRight';
        }
    }
    /** Render the current frame onto the canvas. */
    render() {
        const ctx = this.ctx;
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        ctx.clearRect(0, 0, cw, ch);
        // Determine scaling based on canvas size and map size
        const scaleX = cw / (this.map.width * this.tileSize);
        const scaleY = ch / (this.map.height * this.tileSize);
        const scale = Math.min(scaleX, scaleY);
        ctx.save();
        ctx.scale(scale, scale);
        // Draw a simple grid for the map
        ctx.strokeStyle = '#444';
        for (let x = 0; x <= this.map.width; x++) {
            ctx.beginPath();
            ctx.moveTo(x * this.tileSize, 0);
            ctx.lineTo(x * this.tileSize, this.map.height * this.tileSize);
            ctx.stroke();
        }
        for (let y = 0; y <= this.map.height; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * this.tileSize);
            ctx.lineTo(this.map.width * this.tileSize, y * this.tileSize);
            ctx.stroke();
        }
        // Draw NPCs as colored rectangles
        ctx.fillStyle = '#a44';
        this.npcs.forEach((npc) => {
            ctx.fillRect(npc.x * this.tileSize, npc.y * this.tileSize, this.tileSize, this.tileSize);
        });
        // Draw player as different colored rectangle
        ctx.fillStyle = '#4a4';
        ctx.fillRect(this.player.x * this.tileSize, this.player.y * this.tileSize, this.tileSize, this.tileSize);
        ctx.restore();
    }
    /** Start the game loop. */
    start() {
        // Adjust canvas size to fill its parent element
        const resize = () => {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height * 0.7; // top 70% of the container
        };
        window.addEventListener('resize', resize);
        resize();
        requestAnimationFrame(this.loop);
    }
}
/**
 * Load all JSON files that comprise the content pack.  This function
 * resolves paths relative to the current index.html location so that
 * the engine can be hosted under a sub‑path (e.g. GitHub Pages).  If
 * the `pack` URL parameter is provided it will be used, otherwise
 * `sample_minimal_pack` is assumed.  If any file fails to load this
 * function will throw an exception so the caller can render an error
 * overlay.
 */
async function loadContentPack() {
    // Determine the base URL of the app (the directory containing index.html).
    const appBaseUrl = new URL('.', window.location.href);
    // Determine which pack to load from the query string.
    const params = new URLSearchParams(window.location.search);
    const packId = params.get('pack') ?? 'sample_minimal_pack';
    // Resolve the pack.json URL relative to the app base.
    const packUrl = new URL(`content/${packId}/pack.json`, appBaseUrl);
    // Fetch pack.json first to obtain the packId and use it later in the returned object.
    const pack = await fetch(packUrl.href).then((r) => {
        if (!r.ok)
            throw new Error(`pack.jsonの読み込みに失敗しました (${r.status})`);
        return r.json();
    });
    // Determine the base URL for other files (same directory as pack.json).
    const packBase = new URL('.', packUrl);
    // Helper to fetch JSON relative to packBase.
    async function loadJson(filename) {
        const url = new URL(filename, packBase);
        const resp = await fetch(url.href);
        if (!resp.ok)
            throw new Error(`${filename} の読み込みに失敗しました (${resp.status})`);
        return resp.json();
    }
    const [gameConfig, actors, maps, dialogues, events, flags, quests] = await Promise.all([
        loadJson('game.config.json'),
        loadJson('actors.json'),
        loadJson('maps.json'),
        loadJson('dialogues.json'),
        loadJson('events.json'),
        loadJson('flags.json'),
        loadJson('quests.json'),
    ]);
    return {
        packId: pack.packId,
        maps: maps.maps,
        actors: actors.actors,
        dialogues: dialogues.dialogues,
        events: events.events,
        flags: flags.flags,
        quests: quests.quests,
        gameConfig: gameConfig,
    };
}
// Wait for DOMContentLoaded then bootstrap the game.
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const content = await loadContentPack();
        // Validate the content pack before starting the game.
        const report = validateContentPack(content);
        // Compute and display debug information about paths, IDs and validation summary.
        try {
            const appBaseUrl = new URL('.', window.location.href).href;
            const params = new URLSearchParams(window.location.search);
            const packIdParam = params.get('pack') ?? 'sample_minimal_pack';
            const packUrlStr = new URL(`content/${packIdParam}/pack.json`, new URL('.', window.location.href)).href;
            const packBaseUrl = new URL('.', packUrlStr).href;
            const debugOverlay = document.getElementById('debugOverlay');
            if (debugOverlay) {
                debugOverlay.classList.remove('hidden');
                debugOverlay.style.whiteSpace = 'pre';
                debugOverlay.innerText =
                    `buildId: ${BUILD_ID}\n` +
                    `appBaseUrl: ${appBaseUrl}\n` +
                    `packUrl: ${packUrlStr}\n` +
                    `packBaseUrl: ${packBaseUrl}\n` +
                    `packId: ${content.packId}\n` +
                    `errorCount: ${report.summary.errorCount}\n` +
                    `warningCount: ${report.summary.warningCount}`;
            }
        }
        catch (_) {
            /* ignore debug info errors */
        }
        if (report.summary.errorCount > 0) {
            // Show validation error and do not start the game
            renderValidationErrorScreen(report);
            return;
        }
        const canvas = document.getElementById('gameCanvas');
        const game = new Game(canvas, content);
        game.start();
    }
    catch (err) {
        console.error('Failed to initialize game', err);
        // If loading the content pack fails (e.g. 404), show a user‑friendly error overlay.
        renderContentLoadError(err);
    }
});

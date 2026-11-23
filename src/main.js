/**
 * SYMBIOTE 3D: APEX PREDATOR (VENOM PROTOCOL)
 * Main Application Controller
 * Handles 3D Loop, Procedural Infinite Facility, AK-47 Audio, and One-Handed Mobile Touch Controls.
 */

import { Venom3DEngine } from "./engine/Venom3DEngine.js";
import { Venom3DRenderer } from "./render/Venom3DRenderer.js";
import { venomAudio } from "./audio/VenomAudio.js";

class Venom3DApp {
  constructor() {
    this.container = document.getElementById("canvas-container");
    this.engine = new Venom3DEngine();
    this.renderer = new Venom3DRenderer(this.container);

    this.keys = {};
    this.touchInput = { x: 0, z: 0, active: false };
    this.lastTime = performance.now();
    this.heartbeatTimer = 0;

    this.initDOM();
    this.bindEngineCallbacks();
    this.bindInputs();

    // 60FPS Game Loop
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  initDOM() {
    this.healthBar = document.getElementById("health-bar");
    this.healthVal = document.getElementById("health-val");
    this.biomassBar = document.getElementById("biomass-bar");
    this.tierBadge = document.getElementById("tier-badge");

    this.depthVal = document.getElementById("depth-val");
    this.killsVal = document.getElementById("kills-val");

    this.disguisePill = document.getElementById("disguise-pill");
    this.disguiseStatusText = document.getElementById("disguise-status-text");

    this.actionToast = document.getElementById("action-toast");
    this.toastText = document.getElementById("toast-text");

    this.btnReset = document.getElementById("btn-reset");
    this.btnMute = document.getElementById("btn-mute");

    this.btnMorph = document.getElementById("btn-morph");
    this.btnDevour = document.getElementById("btn-devour");

    // Virtual Joystick Elements
    this.joystickRing = document.getElementById("virtual-joystick");
    this.joystickKnob = document.getElementById("joystick-knob");

    // Game Over Modal
    this.gameOverModal = document.getElementById("gameover-modal");
    this.modalDepth = document.getElementById("modal-depth");
    this.modalKills = document.getElementById("modal-kills");
    this.modalTier = document.getElementById("modal-tier");
    this.btnRetry = document.getElementById("btn-retry");
  }

  bindEngineCallbacks() {
    // 1. Realistic AK-47 Firing
    this.engine.onAK47Shot = () => {
      venomAudio.playAK47Burst(3); // 3-round burst
      this.renderer.triggerScreenShake(0.65);
      this.updateHUD();
    };

    // 2. Slime Crawl
    this.engine.onSlimeMove = () => {
      venomAudio.playSlinkSlime();
    };

    // 3. Morph Camouflage
    this.engine.onMorph = (isDisguised, prop) => {
      venomAudio.playMorphCamouflage(isDisguised);
      this.renderer.triggerScreenShake(0.3);
      if (isDisguised) {
        this.showToast(`🎭 CAMOUFLAGED: ${prop.def.name.toUpperCase()}`);
      } else {
        this.showToast("⚡ REVERTED TO LIVING VENOM");
      }
      this.updateHUD();
    };

    // 4. Devour Execution
    this.engine.onDevour = (guard, player) => {
      venomAudio.playDevourExecution();
      this.renderer.triggerScreenShake(1.4);
      this.showToast("🩸 GUARD CONSUMED! +40 BIOMASS");
      this.updateHUD();
    };

    // 5. Evolution
    this.engine.onEvolution = (tier) => {
      if (tier === 2) {
        this.showToast("🧬 EVOLUTION: TIER 2 SYMBIOTE (RANGE x2)");
      } else if (tier === 3) {
        this.showToast("🔥 EVOLUTION: TIER 3 APEX BEAST!");
      }
    };

    // 6. Guard Alerted
    this.engine.onGuardSpotted = (guard) => {
      venomAudio.playGuardSpotted();
      this.renderer.triggerScreenShake(0.4);
      this.showToast("⚠️ GUARD SPOTTED INTRUDER! AK-47 FIRING!");
    };

    // 7. Game Over
    this.engine.onGameOver = () => {
      this.modalDepth.textContent = `${this.engine.depth}m`;
      this.modalKills.textContent = `${this.engine.guardsDevoured}`;
      this.modalTier.textContent = this.engine.player.tier === 3 ? "TIER 3 APEX BEAST" : (this.engine.player.tier === 2 ? "TIER 2 SYMBIOTE" : "TIER 1 PARASITE");
      this.gameOverModal.classList.add("active");
    };
  }

  bindInputs() {
    // Sound Toggle
    this.btnMute.addEventListener("click", () => {
      const isMuted = venomAudio.toggleMute();
      this.btnMute.textContent = isMuted ? "🔇" : "🔊";
    });

    // Reset Level
    this.btnReset.addEventListener("click", () => this.restartGame());
    this.btnRetry.addEventListener("click", () => {
      this.gameOverModal.classList.remove("active");
      this.restartGame();
    });

    // Morph Button
    this.btnMorph.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      venomAudio.ensureContext();
      this.engine.toggleDisguise();
    });

    // Devour Button
    this.btnDevour.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      venomAudio.ensureContext();
      this.engine.triggerDevour();
    });

    // Keyboard Listeners
    window.addEventListener("keydown", (e) => {
      venomAudio.ensureContext();
      this.keys[e.code] = true;

      if (e.code === "Space") {
        e.preventDefault();
        this.engine.toggleDisguise();
      }
      if (e.code === "KeyE") {
        e.preventDefault();
        this.engine.triggerDevour();
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    // --- ONE-HANDED MOBILE VIRTUAL JOYSTICK (TOUCH ANYWHERE) ---
    const stage = document.getElementById("viewport-stage");
    let touchStartX = 0;
    let touchStartY = 0;

    const handlePointerDown = (clientX, clientY) => {
      venomAudio.ensureContext();
      touchStartX = clientX;
      touchStartY = clientY;
      this.touchInput.active = true;

      // Position joystick under thumb
      this.joystickRing.style.left = `${clientX}px`;
      this.joystickRing.style.top = `${clientY}px`;
      this.joystickRing.classList.remove("hidden");
      this.joystickKnob.style.transform = `translate(0px, 0px)`;
    };

    const handlePointerMove = (clientX, clientY) => {
      if (!this.touchInput.active) return;
      const dx = clientX - touchStartX;
      const dy = clientY - touchStartY;
      const dist = Math.hypot(dx, dy);
      const maxRadius = 45;

      const clampedDist = Math.min(dist, maxRadius);
      const angle = Math.atan2(dy, dx);

      const knobX = Math.cos(angle) * clampedDist;
      const knobY = Math.sin(angle) * clampedDist;
      this.joystickKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;

      // Normalize inputs (Screen Up -> Forward/Negative Z)
      this.touchInput.x = dx / maxRadius;
      this.touchInput.z = dy / maxRadius; // Screen Y corresponds to 3D Z
    };

    const handlePointerUp = () => {
      this.touchInput.active = false;
      this.touchInput.x = 0;
      this.touchInput.z = 0;
      this.joystickRing.classList.add("hidden");
    };

    // Touch Events
    stage.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) {
        handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    stage.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    stage.addEventListener("touchend", () => handlePointerUp(), { passive: true });
    stage.addEventListener("touchcancel", () => handlePointerUp(), { passive: true });

    // Mouse Drag Alternative (for desktop browser testing)
    stage.addEventListener("mousedown", (e) => {
      if (e.button === 0) handlePointerDown(e.clientX, e.clientY);
    });

    window.addEventListener("mousemove", (e) => {
      handlePointerMove(e.clientX, e.clientY);
    });

    window.addEventListener("mouseup", () => handlePointerUp());
  }

  restartGame() {
    this.engine.reset();
    this.updateHUD();
  }

  updateHUD() {
    const p = this.engine.player;

    // Health Bar
    const hpPct = Math.max(0, (p.health / p.maxHealth) * 100);
    this.healthBar.style.width = `${hpPct}%`;
    this.healthVal.textContent = Math.ceil(p.health);

    // Biomass Gauge & Tier
    const nextGoal = p.tier === 1 ? 80 : (p.tier === 2 ? 160 : 240);
    const bioPct = Math.min(100, (p.biomass / nextGoal) * 100);
    this.biomassBar.style.width = `${bioPct}%`;

    const tierLabels = ["TIER 1", "TIER 2", "TIER 3"];
    this.tierBadge.textContent = tierLabels[p.tier - 1];

    // Depth & Kills
    this.depthVal.textContent = `${this.engine.depth}m`;
    this.killsVal.textContent = this.engine.guardsDevoured;

    // Disguise Status Pill
    if (p.isDisguised && p.disguisedProp) {
      this.disguisePill.classList.add("camouflaged");
      this.disguiseStatusText.textContent = `CAMOUFLAGED (${p.disguisedProp.def.name.toUpperCase()})`;
    } else {
      this.disguisePill.classList.remove("camouflaged");
      this.disguiseStatusText.textContent = "SLINKING (VENOM FORM)";
    }

    // Devour Button State (Lights up red when target in range)
    if (this.engine.devourTarget) {
      this.btnDevour.classList.remove("disabled");
    } else {
      this.btnDevour.classList.add("disabled");
    }
  }

  showToast(text) {
    this.toastText.textContent = text;
    this.actionToast.classList.remove("hidden");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.actionToast.classList.add("hidden");
    }, 1800);
  }

  loop(currentTime) {
    const delta = Math.min(0.06, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    // Calculate Combined Keyboard + Mobile Touch Input
    let mx = 0;
    let mz = 0;

    if (this.keys["KeyW"] || this.keys["ArrowUp"]) mz -= 1;
    if (this.keys["KeyS"] || this.keys["ArrowDown"]) mz += 1;
    if (this.keys["KeyA"] || this.keys["ArrowLeft"]) mx -= 1;
    if (this.keys["KeyD"] || this.keys["ArrowRight"]) mx += 1;

    // Apply Touch Input if active
    if (this.touchInput.active) {
      mx += this.touchInput.x;
      mz += this.touchInput.z;
    }

    // Move Venom
    this.engine.movePlayer(mx, mz, delta);

    // Update 3D Engine Simulation & Guard AI
    this.engine.update(delta);

    // Heartbeat Audio Check
    this.heartbeatTimer += delta;
    if (this.heartbeatTimer > 0.8) {
      this.heartbeatTimer = 0;
      const p = this.engine.player;
      let nearGuard = false;
      for (const g of this.engine.guards) {
        if (g.state !== "DEAD" && Math.hypot(g.x - p.x, g.z - p.z) < 10.0) {
          nearGuard = true;
          break;
        }
      }
      if (nearGuard && !this.engine.isGameOver) {
        venomAudio.playHeartbeat(this.engine.devourTarget !== null);
      }
    }

    // Update HUD
    this.updateHUD();

    // Render 3D Scene
    this.renderer.render(this.engine, delta);

    requestAnimationFrame(this.loop);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new Venom3DApp();
});

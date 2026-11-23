/**
 * SYMBIOTE 3D: APEX PREDATOR (VENOM PROTOCOL)
 * Main Application Controller
 * Handles 3D Loop, Procedural Infinite Facility, AK-47 Audio, One-Handed Mobile Touch Controls,
 * and First-Time User Interactive Animated Finger Tutorial.
 */

import { Venom3DEngine } from "./engine/Venom3DEngine.js";
import { Venom3DRenderer } from "./render/Venom3DRenderer.js";
import { venomAudio } from "./audio/VenomAudio.js";

const TUTORIAL_STEPS = {
  MOVE: 1,
  MORPH: 2,
  WAIT: 3,
  DEVOUR: 4,
  COMPLETED: 5
};

class Venom3DApp {
  constructor() {
    this.container = document.getElementById("canvas-container");
    this.engine = new Venom3DEngine();
    this.renderer = new Venom3DRenderer(this.container);

    this.keys = {};
    this.touchInput = { x: 0, z: 0, active: false };
    this.lastTime = performance.now();
    this.heartbeatTimer = 0;

    // Tutorial State
    const hasCompletedTutorial = localStorage.getItem("venom_tutorial_completed") === "true";
    this.tutorialActive = !hasCompletedTutorial;
    this.tutorialStep = TUTORIAL_STEPS.MOVE;

    this.initDOM();
    this.bindEngineCallbacks();
    this.bindInputs();

    this.updateTutorialDisplay();

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

    this.btnHelp = document.getElementById("btn-help");
    this.btnReset = document.getElementById("btn-reset");
    this.btnMute = document.getElementById("btn-mute");

    this.btnMorph = document.getElementById("btn-morph");
    this.btnDevour = document.getElementById("btn-devour");
    this.btnDash = document.getElementById("btn-dash");
    this.btnDecoy = document.getElementById("btn-decoy");
    this.morphText = document.getElementById("morph-text");

    // Virtual Joystick Elements
    this.joystickRing = document.getElementById("virtual-joystick");
    this.joystickKnob = document.getElementById("joystick-knob");

    // Tutorial Elements
    this.tutorialOverlay = document.getElementById("tutorial-overlay");
    this.tutorialCard = document.getElementById("tutorial-card");
    this.tutorialStepText = document.getElementById("tutorial-step-text");
    this.tutorialStepCounter = document.getElementById("tutorial-step-counter");
    this.tutorialFinger = document.getElementById("tutorial-finger");
    this.btnSkipTutorial = document.getElementById("btn-skip-tutorial");

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
        if (this.tutorialActive && this.tutorialStep === TUTORIAL_STEPS.MORPH) {
          this.setTutorialStep(TUTORIAL_STEPS.WAIT);
        }
      } else {
        this.showToast("⚡ REVERTED TO LIVING VENOM");
      }
      this.updateHUD();
    };

    // 4. Devour Execution with Chain Combos!
    this.engine.onDevour = (guard, player, comboCount, gainedBiomass) => {
      venomAudio.playDevourExecution();
      this.renderer.triggerScreenShake(comboCount > 1 ? 2.0 : 1.4);

      if (comboCount > 1) {
        this.showToast(`🔥 CHAIN COMBO x${comboCount}! +${gainedBiomass} BIOMASS!`);
      } else {
        this.showToast(`🩸 GUARD CONSUMED! +${gainedBiomass} BIOMASS`);
      }
      this.updateHUD();

      if (this.tutorialActive && this.tutorialStep === TUTORIAL_STEPS.DEVOUR) {
        this.setTutorialStep(TUTORIAL_STEPS.COMPLETED);
      }
    };

    // 5. Camouflage Denied (Under Fire Lockout)
    this.engine.onCamouflageDenied = (reason) => {
      venomAudio.playCamouflageDenied();
      this.renderer.triggerScreenShake(0.5);
      this.showToast("⚠️ UNDER FIRE! RUN FROM SHOOTING SPOT TO DISGUISE!");
      if (this.btnMorph) {
        this.btnMorph.classList.add("denied");
        setTimeout(() => this.btnMorph.classList.remove("denied"), 500);
      }
    };

    // 6. Shadow Tendril Dash
    this.engine.onDash = () => {
      venomAudio.playDashWhip();
      this.renderer.triggerScreenShake(0.6);
      this.showToast("💨 SHADOW DASH! EVADED SHOOTING ZONE!");
    };

    // 7. Decoy Distraction Noise
    this.engine.onDecoy = (guard) => {
      venomAudio.playDecoyRattle();
      if (guard) {
        this.showToast("🔊 DECOY RATTLE! GUARD INVESTIGATING...");
      } else {
        this.showToast("🔊 DECOY RATTLE ECHOED...");
      }
    };

    // 8. Evolution
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
    // Robust touch & click helper for 0ms delay mobile responsiveness
    const bindButton = (el, fn) => {
      if (!el) return;
      let lastTrigger = 0;
      const onTrigger = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        const now = performance.now();
        if (now - lastTrigger < 200) return; // Debounce dual touchstart/pointerdown
        lastTrigger = now;
        venomAudio.ensureContext();
        fn();
      };
      el.addEventListener("touchstart", onTrigger, { passive: false });
      el.addEventListener("pointerdown", onTrigger);
      el.addEventListener("click", onTrigger);
    };

    // Tutorial Help Button (Re-run tutorial anytime)
    bindButton(this.btnHelp, () => {
      this.restartGame();
      this.tutorialActive = true;
      this.setTutorialStep(TUTORIAL_STEPS.MOVE);
    });

    // Skip Tutorial Button
    bindButton(this.btnSkipTutorial, () => {
      this.tutorialActive = false;
      this.tutorialOverlay.classList.add("hidden");
      localStorage.setItem("venom_tutorial_completed", "true");
      this.showToast("🚀 TUTORIAL SKIPPED! HAVE FUN!");
    });

    // Sound Toggle
    bindButton(this.btnMute, () => {
      const isMuted = venomAudio.toggleMute();
      this.btnMute.textContent = isMuted ? "🔇" : "🔊";
    });

    // Reset Level
    bindButton(this.btnReset, () => this.restartGame());

    // Retry Button (Game Over Modal)
    bindButton(this.btnRetry, () => {
      this.gameOverModal.classList.remove("active");
      this.restartGame();
    });

    // Morph Button
    bindButton(this.btnMorph, () => {
      if (this.engine.isUnderFire() && !this.engine.player.isDisguised) {
        venomAudio.playCamouflageDenied();
        this.renderer.triggerScreenShake(0.4);
        this.showToast("⚠️ UNDER FIRE! TAP [DASH] TO ESCAPE FIRST!");
        this.btnMorph.classList.add("denied");
        setTimeout(() => this.btnMorph.classList.remove("denied"), 450);
        return;
      }
      this.engine.toggleDisguise();
    });

    // Dash Button
    bindButton(this.btnDash, () => {
      const dashed = this.engine.triggerDash();
      if (!dashed && this.engine.dashCooldownTimer > 0) {
        this.showToast("💨 DASH RECHARGING...");
      }
    });

    // Decoy Lure Button
    bindButton(this.btnDecoy, () => {
      this.engine.triggerDecoyNoise();
    });

    // Devour Button
    bindButton(this.btnDevour, () => {
      const devoured = this.engine.triggerDevour();
      if (!devoured && !this.engine.isGameOver) {
        this.showToast("⚡ SNEAK CLOSER BEHIND GUARD TO DEVOUR!");
      }
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
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        e.preventDefault();
        this.engine.triggerDash();
      }
      if (e.code === "KeyQ" || e.code === "KeyF") {
        e.preventDefault();
        this.engine.triggerDecoyNoise();
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    // --- ONE-HANDED MOBILE VIRTUAL JOYSTICK (TOUCH ANYWHERE) ---
    const stage = document.getElementById("viewport-stage");
    let touchStartX = 0;
    let touchStartY = 0;

    const isUIElement = (target) => {
      return !!(target && (
        target.closest("button") ||
        target.closest(".action-dock") ||
        target.closest(".action-btn") ||
        target.closest("#game-header") ||
        target.closest(".modal-overlay") ||
        target.closest(".modal-box") ||
        target.closest(".tutorial-card") ||
        target.closest(".tutorial-skip-btn")
      ));
    };

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

    // Touch Events (Ignore if tapping any button or header)
    stage.addEventListener("touchstart", (e) => {
      if (isUIElement(e.target)) return;
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
      if (e.button === 0 && !isUIElement(e.target)) handlePointerDown(e.clientX, e.clientY);
    });

    window.addEventListener("mousemove", (e) => {
      handlePointerMove(e.clientX, e.clientY);
    });

    window.addEventListener("mouseup", () => handlePointerUp());
  }

  // --- TUTORIAL STATE MACHINE ---
  setTutorialStep(step) {
    this.tutorialStep = step;
    this.updateTutorialDisplay();
  }

  updateTutorialDisplay() {
    if (!this.tutorialActive) {
      this.tutorialOverlay.classList.add("hidden");
      return;
    }

    this.tutorialOverlay.classList.remove("hidden");

    // Remove all finger classes
    this.tutorialFinger.className = "tutorial-finger";

    switch (this.tutorialStep) {
      case TUTORIAL_STEPS.MOVE:
        this.tutorialStepCounter.textContent = "1/4";
        this.tutorialStepText.innerHTML = "👆 <b>DRAG THUMB UPWARD</b> to slink Venom forward towards the supply crate!";
        this.tutorialFinger.classList.add("finger-drag");
        break;

      case TUTORIAL_STEPS.MORPH:
        this.tutorialStepCounter.textContent = "2/4";
        this.tutorialStepText.innerHTML = "📦 You are near a crate! Tap <b>[MORPH]</b> to hide inside it!";
        this.tutorialFinger.classList.add("finger-point-morph");
        break;

      case TUTORIAL_STEPS.WAIT:
        this.tutorialStepCounter.textContent = "3/4";
        this.tutorialStepText.innerHTML = "👀 <b>STAY HIDDEN!</b> The guard cannot see you. Wait for him to pass...";
        this.tutorialFinger.classList.add("finger-wait");
        break;

      case TUTORIAL_STEPS.DEVOUR:
        this.tutorialStepCounter.textContent = "4/4";
        this.tutorialStepText.innerHTML = "⚡ <b>GUARD'S BACK IS TURNED!</b> Tap <b>[DEVOUR]</b> to consume him!";
        this.tutorialFinger.classList.add("finger-point-devour");
        break;

      case TUTORIAL_STEPS.COMPLETED:
        this.tutorialStepCounter.textContent = "✓";
        this.tutorialStepText.innerHTML = "🎉 <b>TUTORIAL COMPLETE!</b> Infiltrate as deep as you can. Survive the guards!";
        this.tutorialFinger.classList.add("hidden");
        localStorage.setItem("venom_tutorial_completed", "true");
        setTimeout(() => {
          this.tutorialActive = false;
          this.tutorialOverlay.classList.add("hidden");
        }, 3200);
        break;
    }
  }

  restartGame() {
    venomAudio.ensureContext();
    this.engine.reset();
    this.bindEngineCallbacks();
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

    // Under Fire Camouflage Lockout
    const isUnderFire = this.engine.isUnderFire();
    if (this.btnMorph) {
      if (isUnderFire && !p.isDisguised) {
        this.btnMorph.classList.add("under-fire");
        if (this.morphText) this.morphText.textContent = "LOCKED";
      } else {
        this.btnMorph.classList.remove("under-fire");
        if (this.morphText) this.morphText.textContent = p.isDisguised ? "EMERGE" : "MORPH";
      }
    }

    // Decoy Lure Button visibility (visible when disguised in prop)
    if (this.btnDecoy) {
      if (p.isDisguised) {
        this.btnDecoy.classList.remove("hidden");
        this.btnDecoy.style.opacity = this.engine.decoyCooldownTimer > 0 ? "0.45" : "1.0";
      } else {
        this.btnDecoy.classList.add("hidden");
      }
    }

    // Dash Cooldown Indicator
    if (this.btnDash) {
      this.btnDash.style.opacity = this.engine.dashCooldownTimer > 0 ? "0.4" : "1.0";
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

    // --- CHECK TUTORIAL STEP ADVANCEMENTS IN REAL TIME ---
    if (this.tutorialActive) {
      const p = this.engine.player;

      if (this.tutorialStep === TUTORIAL_STEPS.MOVE) {
        // Check if player has moved close to the tutorial crate (at z = -10)
        let nearProp = false;
        for (const prop of this.engine.props) {
          if (Math.hypot(prop.x - p.x, prop.z - p.z) < 4.2) {
            nearProp = true;
            break;
          }
        }
        if (nearProp) {
          this.setTutorialStep(TUTORIAL_STEPS.MORPH);
        }
      } else if (this.tutorialStep === TUTORIAL_STEPS.WAIT) {
        // Check if devour target is ready (guard walked past and is in range)
        if (this.engine.devourTarget) {
          this.setTutorialStep(TUTORIAL_STEPS.DEVOUR);
        }
      }
    }

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

/**
 * SYMBIOTE: APEX PREDATOR (VENOM)
 * 60FPS High-Atmosphere Canvas Renderer
 * Renders:
 * - Dark black-ops military research facility with warning hazard lines.
 * - Dynamic guard flashlight vision cones with realistic raycast lighting.
 * - Procedural living black slime particle Symbiote with glowing white Venom eyes.
 * - Mimic prop disguises with subtle symbiote vein pulses.
 * - AK-47 muzzle flashes, bullet tracers, and blood/biomass splatters.
 * - Devour execution targeting reticles and screen shake.
 */

export class VenomRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.screenShake = 0;
    this.popups = [];

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    const parent = this.canvas.parentElement;
    const w = parent ? parent.clientWidth : window.innerWidth;
    const h = parent ? parent.clientHeight : window.innerHeight;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2.0);
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.width = w;
    this.height = h;
  }

  triggerScreenShake(intensity = 10) {
    this.screenShake = Math.max(this.screenShake, intensity);
  }

  addPopup(text, x, y, color = "#ef4444") {
    this.popups.push({
      text,
      x,
      y,
      color,
      life: 1.0,
      vy: -40
    });
  }

  render(engine, delta) {
    const ctx = this.ctx;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    // Apply Screen Shake
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
      this.screenShake = Math.max(0, this.screenShake - delta * 30);
    }

    // 1. Dark Facility Floor Background
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, this.width, this.height);

    // Grid Floor Plates & Safety Hazard Lines
    this.drawFacilityFloor(ctx, engine);

    // 2. Slime Trails on Floor
    this.drawSlimeTrails(ctx, engine);

    // 3. Blood & Biomass Splatters on Floor
    this.drawBloodSplats(ctx, engine);

    // 4. Facility Obstacles & Walls
    this.drawWalls(ctx, engine);

    // 5. Props (Non-Living Objects)
    this.drawProps(ctx, engine);

    // 6. Guards Flashlight Vision Cones (Dynamic Lighting)
    this.drawGuardVisionCones(ctx, engine);

    // 7. AK-47 Bodyguards
    this.drawGuards(ctx, engine);

    // 8. The Living Venom Symbiote (Player)
    this.drawVenomSymbiote(ctx, engine);

    // 9. Bullets & Muzzle Flashes
    this.drawBulletsAndFlashes(ctx, engine);

    // 10. Devour Target Reticle & Ambush Prompt
    this.drawAmbushReticle(ctx, engine);

    // 11. Floating Popups
    this.drawPopups(ctx, delta);

    ctx.restore(); // Restore DPR
  }

  drawFacilityFloor(ctx, engine) {
    ctx.save();
    ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
    ctx.lineWidth = 1;
    const gridSize = 48;
    for (let x = 0; x < this.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawSlimeTrails(ctx, engine) {
    engine.player.slimeTrails.forEach(t => {
      ctx.save();
      const alpha = Math.max(0, t.life / 3.5);
      ctx.fillStyle = `rgba(10, 10, 15, ${alpha * 0.75})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      ctx.fill();

      // Wet slime sheen highlight
      ctx.fillStyle = `rgba(168, 85, 247, ${alpha * 0.25})`;
      ctx.beginPath();
      ctx.arc(t.x - 2, t.y - 2, t.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  drawBloodSplats(ctx, engine) {
    engine.bloodSplats.forEach(b => {
      ctx.save();
      const alpha = Math.max(0, b.life / 5.0);
      ctx.fillStyle = `rgba(185, 28, 28, ${alpha * 0.85})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  drawWalls(ctx, engine) {
    engine.walls.forEach(w => {
      ctx.save();
      // Concrete metallic block
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(w.x, w.y, w.w, w.h);

      // Steel border
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      ctx.strokeRect(w.x, w.y, w.w, w.h);

      // Warning hazard stripes on corners
      ctx.strokeStyle = "rgba(234, 179, 8, 0.4)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w.x + 4, w.y + 4);
      ctx.lineTo(w.x + 16, w.y + 4);
      ctx.stroke();

      ctx.restore();
    });
  }

  drawProps(ctx, engine) {
    engine.props.forEach(prop => {
      const isDisguisedHere = engine.player.isDisguised && engine.player.disguisedProp === prop;

      ctx.save();
      ctx.translate(prop.x, prop.y);

      // Draw shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.beginPath();
      ctx.ellipse(0, prop.height / 2 + 4, prop.width / 2 + 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw Prop Body
      ctx.fillStyle = prop.type.color;
      ctx.strokeStyle = isDisguisedHere ? "#a855f7" : "#64748b";
      ctx.lineWidth = isDisguisedHere ? 2.5 : 1.5;

      ctx.beginPath();
      ctx.roundRect(-prop.width / 2, -prop.height / 2, prop.width, prop.height, 6);
      ctx.fill();
      ctx.stroke();

      // Prop Icon
      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(prop.type.icon, 0, 0);

      // If disguised here: Eerie Symbiote Veins & Hidden White Eyes!
      if (isDisguisedHere) {
        ctx.strokeStyle = "rgba(168, 85, 247, 0.8)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-prop.width / 2 + 4, 0);
        ctx.lineTo(0, -prop.height / 2 + 6);
        ctx.lineTo(prop.width / 2 - 4, 0);
        ctx.stroke();

        // Subtle glowing white eyes (only player sees them!)
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(-6, -4, 3.5, 2, -0.3, 0, Math.PI * 2);
        ctx.ellipse(6, -4, 3.5, 2, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    });
  }

  drawGuardVisionCones(ctx, engine) {
    engine.guards.forEach(g => {
      if (g.state === "DEAD") return;

      ctx.save();
      ctx.translate(g.x, g.y);

      let coneColor = "rgba(34, 197, 94, 0.15)"; // Green Patrol
      let edgeColor = "rgba(34, 197, 94, 0.4)";

      if (g.state === "SUSPICIOUS") {
        coneColor = "rgba(234, 179, 8, 0.22)"; // Amber Suspicious
        edgeColor = "rgba(234, 179, 8, 0.6)";
      } else if (g.state === "ALERT_COMBAT") {
        coneColor = "rgba(239, 68, 68, 0.32)"; // Red Combat Alert!
        edgeColor = "rgba(239, 68, 68, 0.85)";
      }

      // Flashlight Arc
      const halfFov = g.fov / 2;
      const startAngle = g.angle - halfFov;
      const endAngle = g.angle + halfFov;

      const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, g.viewDist);
      grad.addColorStop(0, edgeColor);
      grad.addColorStop(1, coneColor);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, g.viewDist, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();

      // Vision cone outer boundary line
      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    });
  }

  drawGuards(ctx, engine) {
    engine.guards.forEach(g => {
      if (g.state === "DEAD") return;

      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.angle);

      // Bodyguard Drop Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.beginPath();
      ctx.ellipse(0, 4, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body (Combat Armor)
      ctx.fillStyle = g.state === "ALERT_COMBAT" ? "#dc2626" : "#3b82f6";
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tactical Combat Helmet
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      // AK-47 Assault Rifle (held in hands)
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(4, 2, 22, 5); // Rifle barrel
      ctx.fillStyle = "#78350f"; // Wooden stock/grip
      ctx.fillRect(8, 5, 8, 4);

      ctx.restore(); // Restore angle

      // Suspicion / Alert Gauge overhead
      if (g.state === "SUSPICIOUS") {
        ctx.fillStyle = "#ffd200";
        ctx.font = "900 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("❓ SUSPICIOUS", g.x, g.y - 24);
      } else if (g.state === "ALERT_COMBAT") {
        ctx.fillStyle = "#ef4444";
        ctx.font = "900 14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("‼️ FIRING AK-47!", g.x, g.y - 24);
      }
    });
  }

  drawVenomSymbiote(ctx, engine) {
    const p = engine.player;
    if (p.isDisguised) return; // Hidden inside prop!

    ctx.save();

    // 1. Slinking Wavy Tendrils
    p.tendrils.forEach((t, idx) => {
      ctx.save();
      ctx.fillStyle = "#050508";
      ctx.shadowColor = "#000000";
      ctx.shadowBlur = 12;

      const size = Math.max(4, p.radius * (1.0 - idx * 0.08));
      ctx.beginPath();
      ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
      ctx.fill();

      // Connecting tendril line
      if (idx > 0) {
        ctx.strokeStyle = "#050508";
        ctx.lineWidth = size * 1.4;
        ctx.beginPath();
        ctx.moveTo(p.tendrils[idx - 1].x, p.tendrils[idx - 1].y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
      }
      ctx.restore();
    });

    // 2. Main Fluid Slime Head / Body
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    ctx.fillStyle = "#030305";
    ctx.shadowColor = p.tier >= 3 ? "rgba(168, 85, 247, 0.85)" : "rgba(0, 0, 0, 0.9)";
    ctx.shadowBlur = p.tier >= 3 ? 24 : 16;

    // Organic asymmetrical slime perimeter
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Glossy liquid specular highlights
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.beginPath();
    ctx.ellipse(-p.radius * 0.3, -p.radius * 0.3, p.radius * 0.4, p.radius * 0.2, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // 3. Iconic Piercing White Venom Eyes!
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 14;

    const eyeScale = p.tier >= 3 ? 1.4 : 1.0;
    // Left eye (sharp angular predator eye)
    ctx.beginPath();
    ctx.moveTo(p.radius * 0.2 * eyeScale, -p.radius * 0.45 * eyeScale);
    ctx.quadraticCurveTo(p.radius * 0.7 * eyeScale, -p.radius * 0.2 * eyeScale, p.radius * 0.85 * eyeScale, -p.radius * 0.1 * eyeScale);
    ctx.quadraticCurveTo(p.radius * 0.4 * eyeScale, -p.radius * 0.05 * eyeScale, p.radius * 0.2 * eyeScale, -p.radius * 0.45 * eyeScale);
    ctx.fill();

    // Right eye
    ctx.beginPath();
    ctx.moveTo(p.radius * 0.2 * eyeScale, p.radius * 0.45 * eyeScale);
    ctx.quadraticCurveTo(p.radius * 0.7 * eyeScale, p.radius * 0.2 * eyeScale, p.radius * 0.85 * eyeScale, p.radius * 0.1 * eyeScale);
    ctx.quadraticCurveTo(p.radius * 0.4 * eyeScale, p.radius * 0.05 * eyeScale, p.radius * 0.2 * eyeScale, p.radius * 0.45 * eyeScale);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  drawBulletsAndFlashes(ctx, engine) {
    // Muzzle Flashes
    engine.muzzleFlashes.forEach(m => {
      ctx.save();
      ctx.fillStyle = "#ffd200";
      ctx.shadowColor = "#ffd200";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Tracer Bullets
    engine.bullets.forEach(b => {
      ctx.save();
      ctx.strokeStyle = "#ff9800";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#ff9800";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - b.vx * 0.03, b.y - b.vy * 0.03);
      ctx.stroke();
      ctx.restore();
    });
  }

  drawAmbushReticle(ctx, engine) {
    if (!engine.devourTarget) return;

    const g = engine.devourTarget;
    ctx.save();
    ctx.translate(g.x, g.y);

    const pulse = 1.0 + Math.sin(performance.now() * 0.015) * 0.15;
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#ef4444";
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.arc(0, 0, 32 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    // Devour Action Prompt
    ctx.fillStyle = "#ef4444";
    ctx.font = "900 15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("[E] DEVOUR!", 0, -42 * pulse);

    ctx.restore();
  }

  drawPopups(ctx, delta) {
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.y += p.vy * delta;
      p.life -= delta * 1.2;

      ctx.save();
      ctx.font = "900 16px sans-serif";
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.textAlign = "center";
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();

      if (p.life <= 0) this.popups.splice(i, 1);
    }
  }
}

/**
 * SYMBIOTE: APEX PREDATOR (VENOM)
 * Core Game Engine:
 * - Living fluid symbiote particle physics with whipping tendrils.
 * - Non-living prop mimic metamorphosis (crates, barrels, vending machines, chairs).
 * - AK-47 Bodyguard AI with vision cones, patrol paths, suspicion state, and burst fire.
 * - Behind-the-back ambush & tentacle devour mechanics with biomass evolution.
 */

export const PROP_TYPES = {
  CRATE: { id: "CRATE", name: "Supply Crate", icon: "📦", width: 44, height: 44, color: "#475569" },
  BARREL: { id: "BARREL", name: "Hazardous Barrel", icon: "🛢️", width: 38, height: 38, color: "#ca8a04" },
  CHAIR: { id: "CHAIR", name: "Office Chair", icon: "🪑", width: 36, height: 36, color: "#334155" },
  VENDING: { id: "VENDING", name: "Soda Vending Machine", icon: "🥫", width: 52, height: 40, color: "#dc2626" },
  SERVER: { id: "SERVER", name: "Server Rack", icon: "🖥️", width: 56, height: 36, color: "#0284c7" }
};

export class VenomEngine {
  constructor() {
    this.reset();
  }

  reset() {
    // 1. Player (Venom Symbiote)
    this.player = {
      x: 100,
      y: 300,
      vx: 0,
      vy: 0,
      speed: 190,
      angle: 0,
      radius: 18,
      health: 100,
      maxHealth: 100,
      biomass: 0,
      tier: 1, // 1: Parasite, 2: Adult Symbiote, 3: Apex Beast
      isDisguised: false,
      disguisedProp: null,
      stealthDetected: false,
      isInvulnerable: false,
      invulnTimer: 0,
      // Living slime tendrils (verlet-like trailing nodes)
      tendrils: Array.from({ length: 8 }, () => ({ x: 100, y: 300, angle: 0, len: 14 })),
      slimeTrails: []
    };

    // 2. Guards
    this.guards = [];

    // 3. Props
    this.props = [];

    // 4. Facility Walls (Obstacles)
    this.walls = [];

    // 5. Active Projectiles & Particles
    this.bullets = [];
    this.bloodSplats = [];
    this.muzzleFlashes = [];

    // Game State
    this.timeSlow = 1.0;
    this.isVictory = false;
    this.isGameOver = false;
    this.score = 0;
    this.devourTarget = null; // Guard currently targetable for ambush

    // Callbacks
    this.onAK47Shot = null;
    this.onSlimeMove = null;
    this.onMorph = null;
    this.onDevour = null;
    this.onGuardSpotted = null;
    this.onVictory = null;
    this.onGameOver = null;
  }

  // Load Sector Level
  loadSector(sectorDef) {
    this.reset();
    this.player.x = sectorDef.playerStart.x;
    this.player.y = sectorDef.playerStart.y;
    this.walls = sectorDef.walls || [];

    // Spawn Props
    this.props = sectorDef.props.map((p, idx) => ({
      id: `prop_${idx}`,
      type: PROP_TYPES[p.type] || PROP_TYPES.CRATE,
      x: p.x,
      y: p.y,
      width: (PROP_TYPES[p.type] || PROP_TYPES.CRATE).width,
      height: (PROP_TYPES[p.type] || PROP_TYPES.CRATE).height
    }));

    // Spawn Guards
    this.guards = sectorDef.guards.map((g, idx) => ({
      id: `guard_${idx}`,
      x: g.x,
      y: g.y,
      vx: 0,
      vy: 0,
      speed: 70,
      angle: g.angle || 0,
      targetAngle: g.angle || 0,
      waypoints: g.waypoints || [{ x: g.x, y: g.y }],
      currentWpIdx: 0,
      state: "PATROL", // PATROL, SUSPICIOUS, ALERT_COMBAT, DEAD
      suspicion: 0, // 0 to 100
      shootCooldown: 0,
      burstCount: 0,
      searchTimer: 0,
      health: 100,
      fov: (72 * Math.PI) / 180, // 72 degree vision cone
      viewDist: 230
    }));
  }

  // --- SYMBIOTE MOVEMENT ---
  movePlayer(inputX, inputY, delta) {
    if (this.isGameOver || this.isVictory) return;

    const p = this.player;

    if (inputX !== 0 || inputY !== 0) {
      // If moving while disguised in front of guards: DISGUISE BLOWN!
      if (p.isDisguised) {
        this.checkDisguiseBlown();
        p.isDisguised = false;
        p.disguisedProp = null;
      }

      const len = Math.sqrt(inputX * inputX + inputY * inputY);
      p.vx = (inputX / len) * p.speed;
      p.vy = (inputY / len) * p.speed;
      p.angle = Math.atan2(inputY, inputX);

      // Slime audio
      if (this.onSlimeMove) this.onSlimeMove();

      // Slime Trail Emitter
      if (Math.random() < 0.35) {
        p.slimeTrails.push({
          x: p.x + (Math.random() - 0.5) * 10,
          y: p.y + (Math.random() - 0.5) * 10,
          radius: 6 + Math.random() * 6,
          life: 3.5
        });
      }
    } else {
      p.vx *= 0.6;
      p.vy *= 0.6;
    }

    // Move player with wall collisions
    const newX = p.x + p.vx * delta * this.timeSlow;
    const newY = p.y + p.vy * delta * this.timeSlow;

    if (!this.checkWallCollision(newX, p.y, p.radius)) p.x = newX;
    if (!this.checkWallCollision(p.x, newY, p.radius)) p.y = newY;

    // Update Living Slime Tendril Nodes
    let prevX = p.x;
    let prevY = p.y;
    p.tendrils.forEach((t, idx) => {
      const dx = prevX - t.x;
      const dy = prevY - t.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const targetDist = 8;
      if (dist > targetDist) {
        t.x += (dx / dist) * (dist - targetDist) * 0.75;
        t.y += (dy / dist) * (dist - targetDist) * 0.75;
      }
      // Wavy sine oscillation
      t.x += Math.sin(performance.now() * 0.01 + idx) * 0.8;
      t.y += Math.cos(performance.now() * 0.01 + idx) * 0.8;

      prevX = t.x;
      prevY = t.y;
    });
  }

  // --- PROP METAMORPHOSIS (CAMOUFLAGE) ---
  toggleDisguise() {
    if (this.isGameOver || this.isVictory) return false;
    const p = this.player;

    if (p.isDisguised) {
      // Un-disguise
      p.isDisguised = false;
      p.disguisedProp = null;
      if (this.onMorph) this.onMorph(false);
      return true;
    }

    // Find nearest prop within interaction range (65px)
    let closestProp = null;
    let closestDist = 65;

    for (const prop of this.props) {
      const dx = prop.x - p.x;
      const dy = prop.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < closestDist) {
        closestDist = dist;
        closestProp = prop;
      }
    }

    if (closestProp) {
      // Morph into prop!
      p.isDisguised = true;
      p.disguisedProp = closestProp;
      p.x = closestProp.x;
      p.y = closestProp.y;
      p.vx = 0;
      p.vy = 0;
      if (this.onMorph) this.onMorph(true, closestProp);
      return true;
    }

    return false;
  }

  // --- AMBUSH & DEVOUR (THE FEAST) ---
  triggerDevour() {
    if (!this.devourTarget || this.isGameOver || this.isVictory) return false;

    const guard = this.devourTarget;
    guard.state = "DEAD";
    this.devourTarget = null;

    // Bullet-time slow-mo for impact
    this.timeSlow = 0.25;
    setTimeout(() => { this.timeSlow = 1.0; }, 400);

    // If player was disguised, un-disguise with tentacle burst!
    this.player.isDisguised = false;
    this.player.disguisedProp = null;

    // Lunge Venom to the guard's position
    this.player.x = guard.x;
    this.player.y = guard.y;

    // Blood / Biomass splatter
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      this.bloodSplats.push({
        x: guard.x,
        y: guard.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 5,
        life: 5.0
      });
    }

    // Absorb Biomass & Heal
    this.player.biomass += 40;
    this.player.health = Math.min(this.player.maxHealth, this.player.health + 45);
    this.score += 500;

    // Check Evolution Tier
    if (this.player.biomass >= 140) {
      this.player.tier = 3; // Apex Beast
      this.player.maxHealth = 240;
      this.player.radius = 28;
    } else if (this.player.biomass >= 70) {
      this.player.tier = 2; // Adult Symbiote
      this.player.maxHealth = 170;
      this.player.radius = 22;
    }

    if (this.onDevour) this.onDevour(guard, this.player);

    // Check Sector Clear
    const remainingGuards = this.guards.filter(g => g.state !== "DEAD");
    if (remainingGuards.length === 0) {
      this.isVictory = true;
      if (this.onVictory) this.onVictory(this.score);
    }

    return true;
  }

  // --- 60FPS AI & PHYSICS UPDATE ---
  update(delta) {
    if (this.isGameOver || this.isVictory) return;

    const actualDelta = delta * this.timeSlow;
    const p = this.player;

    // Decay slime trails
    p.slimeTrails.forEach(t => t.life -= actualDelta);
    p.slimeTrails = p.slimeTrails.filter(t => t.life > 0);

    // Update Blood Splatters
    this.bloodSplats.forEach(b => {
      b.x += b.vx * actualDelta;
      b.y += b.vy * actualDelta;
      b.vx *= 0.85;
      b.vy *= 0.85;
      b.life -= actualDelta;
    });
    this.bloodSplats = this.bloodSplats.filter(b => b.life > 0);

    // Update Muzzle Flashes
    this.muzzleFlashes.forEach(m => m.life -= actualDelta);
    this.muzzleFlashes = this.muzzleFlashes.filter(m => m.life > 0);

    // Check Ambush Target Availability
    this.updateDevourTarget();

    // Update Bodyguards AI
    this.guards.forEach(guard => {
      if (guard.state === "DEAD") return;
      this.updateGuardAI(guard, actualDelta);
    });

    // Update Bullets
    for (let b = this.bullets.length - 1; b >= 0; b--) {
      const bullet = this.bullets[b];
      bullet.x += bullet.vx * actualDelta;
      bullet.y += bullet.vy * actualDelta;
      bullet.life -= actualDelta;

      // Check hit player
      const dx = bullet.x - p.x;
      const dy = bullet.y - p.y;
      if (dx * dx + dy * dy < (p.radius + 6) ** 2) {
        if (!p.isInvulnerable) {
          p.health -= 14;
          if (p.health <= 0) {
            p.health = 0;
            this.isGameOver = true;
            if (this.onGameOver) this.onGameOver();
          }
        }
        this.bullets.splice(b, 1);
        continue;
      }

      // Check hit walls
      if (this.checkWallCollision(bullet.x, bullet.y, 4)) {
        this.bullets.splice(b, 1);
        continue;
      }

      if (bullet.life <= 0) this.bullets.splice(b, 1);
    }
  }

  updateDevourTarget() {
    const p = this.player;
    const reach = p.tier >= 2 ? 160 : 110;
    this.devourTarget = null;

    let closestDist = reach;
    for (const g of this.guards) {
      if (g.state === "DEAD") continue;
      const dx = g.x - p.x;
      const dy = g.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < closestDist) {
        // Can devour if:
        // 1. Player is disguised as prop
        // 2. OR player is behind the guard's back (outside vision cone)
        const angleToPlayer = Math.atan2(p.y - g.y, p.x - g.x);
        let diff = Math.abs(this.normalizeAngle(angleToPlayer - g.angle));
        const isBehind = diff > g.fov / 2;

        if (p.isDisguised || isBehind) {
          closestDist = dist;
          this.devourTarget = g;
        }
      }
    }
  }

  updateGuardAI(guard, delta) {
    const p = this.player;

    // Check Line of Sight & Vision Cone to Player
    const canSee = this.canGuardSeePlayer(guard);

    if (canSee) {
      if (!p.isDisguised) {
        // SPOTTED! Immediate Combat Alert!
        if (guard.state !== "ALERT_COMBAT") {
          guard.state = "ALERT_COMBAT";
          if (this.onGuardSpotted) this.onGuardSpotted(guard);
        }
        // Face player
        guard.targetAngle = Math.atan2(p.y - guard.y, p.x - guard.x);
        guard.angle = guard.targetAngle;

        // Shoot AK-47 in 3-round bursts!
        guard.shootCooldown -= delta;
        if (guard.shootCooldown <= 0) {
          this.fireAK47Burst(guard);
          guard.shootCooldown = 0.55; // 0.55s between bursts
        }
      }
    } else if (guard.state === "ALERT_COMBAT") {
      // Lost sight of player
      guard.searchTimer += delta;
      if (guard.searchTimer > 3.5) {
        guard.state = "PATROL";
        guard.searchTimer = 0;
      }
    }

    // Patrol Waypoint Walking
    if (guard.state === "PATROL" && guard.waypoints.length > 1) {
      const targetWp = guard.waypoints[guard.currentWpIdx];
      const dx = targetWp.x - guard.x;
      const dy = targetWp.y - guard.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 10) {
        guard.currentWpIdx = (guard.currentWpIdx + 1) % guard.waypoints.length;
      } else {
        guard.targetAngle = Math.atan2(dy, dx);
        guard.angle = this.lerpAngle(guard.angle, guard.targetAngle, 6.0 * delta);
        guard.x += Math.cos(guard.angle) * guard.speed * delta;
        guard.y += Math.sin(guard.angle) * guard.speed * delta;
      }
    }
  }

  canGuardSeePlayer(guard) {
    const p = this.player;

    // Disguised props don't trigger vision unless moving
    if (p.isDisguised) return false;

    const dx = p.x - guard.x;
    const dy = p.y - guard.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > guard.viewDist) return false;

    // Check Angle within Vision Cone
    const angleToPlayer = Math.atan2(dy, dx);
    const diff = Math.abs(this.normalizeAngle(angleToPlayer - guard.angle));

    if (diff > guard.fov / 2) return false;

    // Raycast Line of Sight against Walls
    if (this.isRayBlockedByWalls(guard.x, guard.y, p.x, p.y)) {
      return false;
    }

    return true;
  }

  checkDisguiseBlown() {
    this.guards.forEach(g => {
      if (g.state !== "DEAD" && this.canGuardSeePlayer(g)) {
        g.state = "ALERT_COMBAT";
        if (this.onGuardSpotted) this.onGuardSpotted(g);
      }
    });
  }

  fireAK47Burst(guard) {
    const bulletSpeed = 520;
    const spread = (Math.random() - 0.5) * 0.14;
    const shotAngle = guard.angle + spread;

    // Muzzle Flash
    const muzzleX = guard.x + Math.cos(guard.angle) * 26;
    const muzzleY = guard.y + Math.sin(guard.angle) * 26;

    this.muzzleFlashes.push({ x: muzzleX, y: muzzleY, life: 0.08 });

    // Tracer Bullet
    this.bullets.push({
      x: muzzleX,
      y: muzzleY,
      vx: Math.cos(shotAngle) * bulletSpeed,
      vy: Math.sin(shotAngle) * bulletSpeed,
      life: 0.8
    });

    if (this.onAK47Shot) this.onAK47Shot();
  }

  checkWallCollision(x, y, radius) {
    for (const w of this.walls) {
      if (x + radius > w.x && x - radius < w.x + w.w &&
          y + radius > w.y && y - radius < w.y + w.h) {
        return true;
      }
    }
    return false;
  }

  isRayBlockedByWalls(x1, y1, x2, y2) {
    const steps = 18;
    for (let i = 1; i < steps; i++) {
      const rx = x1 + (x2 - x1) * (i / steps);
      const ry = y1 + (y2 - y1) * (i / steps);
      if (this.checkWallCollision(rx, ry, 2)) return true;
    }
    return false;
  }

  normalizeAngle(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }

  lerpAngle(a, b, t) {
    const diff = this.normalizeAngle(b - a);
    return a + diff * Math.min(1.0, t);
  }
}

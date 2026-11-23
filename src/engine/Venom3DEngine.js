/**
 * SYMBIOTE 3D: APEX PREDATOR (VENOM PROTOCOL)
 * Endless Procedural 3D Engine with Escalating Bodyguards
 * 
 * Features:
 * - Infinite linear facility corridor with seamless chunk streaming.
 * - Exponential bodyguard escalation: deeper intrusion = more guards with overlapping AK-47 crossfire!
 * - Realistic line-of-sight vision cone raycasting with dynamic alertness.
 * - Prop mimic metamorphosis camouflage.
 * - Behind-the-back ambush & tentacle devour execution.
 * - Biomass evolution tiers (Tier 1: Parasite -> Tier 2: Symbiote -> Tier 3: Apex Beast).
 */

export const PROP_TYPES = {
  CRATE: { id: "CRATE", name: "Reinforced Crate", radius: 1.6 },
  BARREL: { id: "BARREL", name: "Toxic Barrel", radius: 1.4 },
  VENDING: { id: "VENDING", name: "Vending Machine", radius: 1.6 },
  SERVER: { id: "SERVER", name: "Server Rack", radius: 1.8 }
};

export class Venom3DEngine {
  constructor() {
    this.reset();
  }

  reset() {
    // 1. Player (Venom Symbiote)
    this.player = {
      x: 0,
      z: 0,
      vx: 0,
      vz: 0,
      speed: 12.0, // units/sec
      angle: 0, // facing forward (-Z)
      radius: 1.1,
      health: 100,
      maxHealth: 100,
      biomass: 0,
      tier: 1, // 1: Parasite, 2: Symbiote, 3: Apex Beast
      isDisguised: false,
      disguisedProp: null,
      invulnerableTimer: 0
    };

    // 2. Endless Facility Architecture
    this.corridorWidth = 18.0; // Corridor bounds: x from -9 to +9
    this.chunkLength = 32.0;
    this.facilityChunks = [];
    this.nextChunkZ = 0;
    this.props = [];
    this.guards = [];
    this.bullets = [];

    // 3. Stats & Score
    this.depth = 0; // In meters
    this.guardsDevoured = 0;
    this.score = 0;
    this.devourTarget = null;
    this.timeSlow = 1.0;
    this.isGameOver = false;

    // Callbacks
    this.onAK47Shot = null;
    this.onSlimeMove = null;
    this.onMorph = null;
    this.onDevour = null;
    this.onGuardSpotted = null;
    this.onEvolution = null;
    this.onGameOver = null;

    // Generate Initial 4 Chunks
    for (let i = 0; i < 4; i++) {
      this.generateNextChunk();
    }
  }

  // --- PROCEDURAL INFINITE CHUNK GENERATOR ---
  generateNextChunk() {
    const chunkIdx = Math.floor(Math.abs(this.nextChunkZ) / this.chunkLength);
    const chunkId = `chunk_${chunkIdx}`;
    const zCenter = this.nextChunkZ - this.chunkLength / 2;

    const chunk = {
      id: chunkId,
      x: 0,
      z: zCenter,
      width: this.corridorWidth,
      length: this.chunkLength
    };
    this.facilityChunks.push(chunk);

    // Spawn Props in this chunk
    const propTypes = ["CRATE", "BARREL", "VENDING", "SERVER"];

    if (chunkIdx === 0) {
      // Guaranteed Tutorial Supply Crate directly ahead of Venom
      this.props.push({
        id: "prop_tutorial_0",
        type: "CRATE",
        def: PROP_TYPES.CRATE,
        x: 0,
        z: -10.0,
        chunkId
      });
      // Tutorial Guard patrolling at z = -20
      this.guards.push({
        id: "guard_tutorial_0",
        x: -4.0,
        z: -20.0,
        speed: 2.6,
        angle: 0,
        waypoints: [{ x: -5.5, z: -20.0 }, { x: 5.5, z: -20.0 }],
        currentWpIdx: 0,
        state: "PATROL",
        shootCooldown: 0,
        fov: (72 * Math.PI) / 180,
        viewDist: 15.0,
        chunkId
      });
    }

    const propCount = chunkIdx === 0 ? 1 : (2 + Math.floor(Math.random() * 3));

    for (let p = 0; p < propCount; p++) {
      const typeKey = propTypes[Math.floor(Math.random() * propTypes.length)];
      // Position props along corridor sides & alcoves
      const px = (Math.random() > 0.5 ? 1 : -1) * (4.0 + Math.random() * 3.5);
      const pz = this.nextChunkZ - 4.0 - Math.random() * (this.chunkLength - 8.0);

      this.props.push({
        id: `prop_${this.props.length}`,
        type: typeKey,
        def: PROP_TYPES[typeKey],
        x: px,
        z: pz,
        chunkId
      });
    }

    // --- ESCALATING BODYGUARD GENERATOR ---
    let guardCount = 0;
    if (chunkIdx === 0) guardCount = 0; // Already added tutorial guard
    else if (chunkIdx === 1) guardCount = 1;
    else if (chunkIdx === 2) guardCount = 2;
    // Chunk 3-5 (100-200m): 3-4 guards
    // Chunk 6-10 (200-350m): 4-5 guards
    // Chunk 11+ (350m+): 6-8 guards with overlapping crossfire!
    let guardCount = 0;
    if (chunkIdx === 1) guardCount = 1;
    else if (chunkIdx === 2) guardCount = 2;
    else if (chunkIdx >= 3 && chunkIdx < 6) guardCount = 3 + Math.floor(Math.random() * 2);
    else if (chunkIdx >= 6 && chunkIdx < 10) guardCount = 4 + Math.floor(Math.random() * 2);
    else if (chunkIdx >= 10) guardCount = 5 + Math.min(4, Math.floor(chunkIdx / 3));

    for (let g = 0; g < guardCount; g++) {
      const gz = this.nextChunkZ - 5.0 - (g + 0.5) * ((this.chunkLength - 10) / guardCount);
      const startX = (Math.random() - 0.5) * 10;

      // Waypoints: Horizontal patrol across the corridor
      const wpLeft = { x: -6.5, z: gz };
      const wpRight = { x: 6.5, z: gz };

      this.guards.push({
        id: `guard_${this.guards.length}_${Date.now()}`,
        x: startX,
        z: gz,
        speed: 3.2 + Math.min(2.5, chunkIdx * 0.15),
        angle: 0,
        waypoints: Math.random() > 0.5 ? [wpLeft, wpRight] : [wpRight, wpLeft],
        currentWpIdx: 0,
        state: "PATROL", // PATROL, SUSPICIOUS, ALERT_COMBAT, DEAD
        shootCooldown: 0,
        fov: (72 * Math.PI) / 180,
        viewDist: 15.0,
        chunkId
      });
    }

    this.nextChunkZ -= this.chunkLength;
  }

  // --- SYMBIOTE MOVEMENT (MOBILE ONE-THUMB & KEYBOARD) ---
  movePlayer(inputX, inputZ, delta) {
    if (this.isGameOver) return;
    const p = this.player;

    if (inputX !== 0 || inputZ !== 0) {
      // If player moves while disguised: DISGUISE BLOWN!
      if (p.isDisguised) {
        this.checkDisguiseBlown();
        p.isDisguised = false;
        p.disguisedProp = null;
        if (this.onMorph) this.onMorph(false);
      }

      const len = Math.hypot(inputX, inputZ);
      const normX = inputX / len;
      const normZ = inputZ / len;

      p.vx = normX * p.speed;
      p.vz = normZ * p.speed;
      p.angle = Math.atan2(normX, -normZ); // 3D rotation around Y

      if (this.onSlimeMove) this.onSlimeMove();
    } else {
      p.vx *= 0.7;
      p.vz *= 0.7;
    }

    // Move player with corridor boundary collision
    const actualDelta = delta * this.timeSlow;
    const nextX = p.x + p.vx * actualDelta;
    const nextZ = p.z + p.vz * actualDelta;

    const halfW = this.corridorWidth / 2 - 1.2;
    p.x = Math.max(-halfW, Math.min(halfW, nextX));
    p.z = nextZ; // Free movement forward/backward

    // Depth in meters (forward is negative Z)
    this.depth = Math.max(this.depth, Math.floor(Math.abs(p.z)));

    // Generate chunks ahead when player advances
    if (p.z - 90 < this.nextChunkZ) {
      this.generateNextChunk();
    }

    // Cull chunks & entities behind the player
    this.cullOldChunks(p.z);
  }

  cullOldChunks(playerZ) {
    const cullZ = playerZ + 45.0; // 45m behind player

    // Remove old chunks
    this.facilityChunks = this.facilityChunks.filter(c => c.z < cullZ);
    this.props = this.props.filter(p => p.z < cullZ);
    this.guards = this.guards.filter(g => g.z < cullZ && g.state !== "DEAD");
  }

  // --- PROP METAMORPHOSIS (CAMOUFLAGE) ---
  toggleDisguise() {
    if (this.isGameOver) return false;
    const p = this.player;

    if (p.isDisguised) {
      p.isDisguised = false;
      p.disguisedProp = null;
      if (this.onMorph) this.onMorph(false);
      return true;
    }

    // Find nearest prop within interaction range (3.8 units)
    let closestProp = null;
    let closestDist = 3.8;

    for (const prop of this.props) {
      const dist = Math.hypot(prop.x - p.x, prop.z - p.z);
      if (dist < closestDist) {
        closestDist = dist;
        closestProp = prop;
      }
    }

    if (closestProp) {
      p.isDisguised = true;
      p.disguisedProp = closestProp;
      p.x = closestProp.x;
      p.z = closestProp.z;
      p.vx = 0;
      p.vz = 0;
      if (this.onMorph) this.onMorph(true, closestProp);
      return true;
    }

    return false;
  }

  // --- AMBUSH & DEVOUR EXECUTION ---
  triggerDevour() {
    if (!this.devourTarget || this.isGameOver) return false;

    const guard = this.devourTarget;
    guard.state = "DEAD";
    this.devourTarget = null;

    // Slow-motion bullet-time
    this.timeSlow = 0.22;
    setTimeout(() => { this.timeSlow = 1.0; }, 420);

    // Un-disguise with tentacle strike
    this.player.isDisguised = false;
    this.player.disguisedProp = null;

    // Lunge Venom to the guard's position
    this.player.x = guard.x;
    this.player.z = guard.z;

    // Biomass Absorption & Health Regen
    this.player.biomass += 40;
    this.player.health = Math.min(this.player.maxHealth, this.player.health + 35);
    this.guardsDevoured += 1;
    this.score += 500 * this.player.tier;

    // Check Evolution Tier
    const prevTier = this.player.tier;
    if (this.player.biomass >= 160 && this.player.tier < 3) {
      this.player.tier = 3; // Apex Beast
      this.player.maxHealth = 260;
      this.player.health = 260;
      this.player.speed = 15.0;
      if (this.onEvolution) this.onEvolution(3);
    } else if (this.player.biomass >= 80 && this.player.tier < 2) {
      this.player.tier = 2; // Adult Symbiote
      this.player.maxHealth = 180;
      this.player.health = 180;
      this.player.speed = 13.5;
      if (this.onEvolution) this.onEvolution(2);
    }

    if (this.onDevour) this.onDevour(guard, this.player);
    return true;
  }

  // --- 60FPS AI & SIMULATION UPDATE ---
  update(delta) {
    if (this.isGameOver) return;
    const actualDelta = delta * this.timeSlow;
    const p = this.player;

    // Check Devour Target Availability
    this.updateDevourTarget();

    // Update Bodyguards AI
    this.guards.forEach(g => {
      if (g.state === "DEAD") return;
      this.updateGuardAI(g, actualDelta);
    });

    // Update Projectiles (AK-47 Bullets)
    for (let b = this.bullets.length - 1; b >= 0; b--) {
      const bullet = this.bullets[b];
      bullet.x += bullet.vx * actualDelta;
      bullet.z += bullet.vz * actualDelta;
      bullet.life -= actualDelta;

      // Check hit Venom
      const distToPlayer = Math.hypot(bullet.x - p.x, bullet.z - p.z);
      if (distToPlayer < p.radius + 0.4) {
        p.health -= 14;
        if (p.health <= 0) {
          p.health = 0;
          this.isGameOver = true;
          if (this.onGameOver) this.onGameOver();
        }
        this.bullets.splice(b, 1);
        continue;
      }

      if (bullet.life <= 0) {
        this.bullets.splice(b, 1);
      }
    }
  }

  updateDevourTarget() {
    const p = this.player;
    const reach = p.tier >= 2 ? 8.5 : 5.8; // Devour reach
    this.devourTarget = null;

    let closestDist = reach;
    for (const g of this.guards) {
      if (g.state === "DEAD") continue;
      const dist = Math.hypot(g.x - p.x, g.z - p.z);

      if (dist < closestDist) {
        // Can devour if:
        // 1. Player is disguised as prop
        // 2. OR player is behind guard's vision cone
        const angleToPlayer = Math.atan2(p.x - g.x, -(p.z - g.z));
        const diff = Math.abs(this.normalizeAngle(angleToPlayer - g.angle));
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
    const canSee = this.canGuardSeePlayer(guard);

    if (canSee) {
      if (!p.isDisguised) {
        // SPOTTED! Trigger Combat Alert!
        if (guard.state !== "ALERT_COMBAT") {
          guard.state = "ALERT_COMBAT";
          if (this.onGuardSpotted) this.onGuardSpotted(guard);
        }

        // Face player
        guard.angle = Math.atan2(p.x - guard.x, -(p.z - guard.z));

        // Rapid AK-47 3-burst firing!
        guard.shootCooldown -= delta;
        if (guard.shootCooldown <= 0) {
          this.fireAK47(guard);
          guard.shootCooldown = 0.58; // 0.58s between bursts
        }
      }
    } else if (guard.state === "ALERT_COMBAT") {
      // Revert to patrol after losing target
      guard.searchTimer = (guard.searchTimer || 0) + delta;
      if (guard.searchTimer > 3.0) {
        guard.state = "PATROL";
        guard.searchTimer = 0;
      }
    }

    // Patrol Walking
    if (guard.state === "PATROL" && guard.waypoints.length > 1) {
      const targetWp = guard.waypoints[guard.currentWpIdx];
      const dx = targetWp.x - guard.x;
      const dz = targetWp.z - guard.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 0.8) {
        guard.currentWpIdx = (guard.currentWpIdx + 1) % guard.waypoints.length;
      } else {
        guard.angle = Math.atan2(dx, -dz);
        guard.x += (dx / dist) * guard.speed * delta;
        guard.z += (dz / dist) * guard.speed * delta;
      }
    }
  }

  canGuardSeePlayer(guard) {
    const p = this.player;
    if (p.isDisguised) return false;

    const dx = p.x - guard.x;
    const dz = p.z - guard.z;
    const dist = Math.hypot(dx, dz);

    if (dist > guard.viewDist) return false;

    const angleToPlayer = Math.atan2(dx, -dz);
    const diff = Math.abs(this.normalizeAngle(angleToPlayer - guard.angle));

    return diff <= guard.fov / 2;
  }

  checkDisguiseBlown() {
    this.guards.forEach(g => {
      if (g.state !== "DEAD" && this.canGuardSeePlayer(g)) {
        g.state = "ALERT_COMBAT";
        if (this.onGuardSpotted) this.onGuardSpotted(g);
      }
    });
  }

  fireAK47(guard) {
    const bulletSpeed = 42.0;
    const spread = (Math.random() - 0.5) * 0.12;
    const angle = guard.angle + spread;

    this.bullets.push({
      x: guard.x,
      z: guard.z,
      vx: Math.sin(angle) * bulletSpeed,
      vz: -Math.cos(angle) * bulletSpeed,
      life: 1.2
    });

    if (this.onAK47Shot) this.onAK47Shot();
  }

  normalizeAngle(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }
}

/**
 * SYMBIOTE 3D: APEX PREDATOR (VENOM PROTOCOL)
 * High-Performance Three.js 3D Mobile-First Renderer
 * 
 * Features:
 * - Bright, crisp laboratory lighting with ceiling fixtures & ambient illumination.
 * - Procedural 3D Living Symbiote (Venom) with glistening fluid mesh, trailing tendrils, and sharp glowing eyes.
 * - 3D Bodyguards with tactical swat gear, detailed AK-47 assault rifles, and dynamic volumetric flashlight vision cones.
 * - 3D Props (crates, toxic barrels, server racks, vending machines) with camouflage vein pulses.
 * - 3D AK-47 bullet tracers, muzzle flashes, and visceral biomass splatter particles.
 * - Mobile vertical portrait camera with smooth dampening follow.
 */

import * as THREE from "three";

export class Venom3DRenderer {
  constructor(container) {
    this.container = container;

    // 1. Scene & Bright Lab Lighting
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a); // Deep high-tech navy
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.012);

    // 2. Camera (Vertical Mobile-First Perspective)
    this.camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / container.clientHeight,
      0.1,
      250
    );
    this.camera.position.set(0, 24, 18);
    this.cameraTarget = new THREE.Vector3(0, 0, 0);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35; // Bright, punchy exposure!

    container.appendChild(this.renderer.domElement);

    // 4. Object Pools / Scene Dictionaries
    this.guardMeshes = new Map();
    this.propMeshes = new Map();
    this.wallMeshes = new Map();
    this.lightMeshes = [];
    this.bulletMeshes = [];
    this.particlePool = [];
    this.slimePuddles = [];

    // Screen Shake
    this.shakeIntensity = 0;

    // Materials Library (Optimized shared materials)
    this.initMaterials();

    // Setup Bright Lighting Rig
    this.setupBrightLighting();

    // Build 3D Symbiote Mesh
    this.createSymbiotePlayer();

    // Resize Handler
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  initMaterials() {
    // Floor Tile Material (Bright polished high-tech facility)
    this.matFloor = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Bright slate gray
      roughness: 0.35,
      metalness: 0.4
    });

    // Wall Material
    this.matWall = new THREE.MeshStandardMaterial({
      color: 0x334155, // Clean steel blue-gray
      roughness: 0.5,
      metalness: 0.3
    });

    // Wall Trim / Hazard Neon
    this.matHazard = new THREE.MeshBasicMaterial({ color: 0x06b6d4 }); // Glowing cyan

    // Venom Symbiote (Glossy living black slime)
    this.matVenom = new THREE.MeshStandardMaterial({
      color: 0x050508,
      roughness: 0.1,
      metalness: 0.85
    });

    // Venom Glowing Predator Eyes
    this.matEyes = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Guard Tactical Armor
    this.matGuardArmor = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a, // Police/SWAT tactical blue
      roughness: 0.5,
      metalness: 0.2
    });

    this.matGuardAlertArmor = new THREE.MeshStandardMaterial({
      color: 0xb91c1c, // Alert red
      roughness: 0.4,
      metalness: 0.3
    });

    // AK-47 Steel & Wood
    this.matAKSteel = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 });
    this.matAKWood = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7, metalness: 0.1 });

    // Tracer Bullet Material
    this.matTracer = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  }

  setupBrightLighting() {
    // 1. Ambient Light (Generous base brightness so the facility is clear & vivid)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    // 2. Main Sun / Ceiling Overhead Key Light
    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    this.keyLight.position.set(15, 35, 20);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.camera.near = 1;
    this.keyLight.shadow.camera.far = 100;
    this.keyLight.shadow.camera.left = -30;
    this.keyLight.shadow.camera.right = 30;
    this.keyLight.shadow.camera.top = 40;
    this.keyLight.shadow.camera.bottom = -40;
    this.scene.add(this.keyLight);

    // 3. Cool Accent Fill Light
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.5);
    fillLight.position.set(-20, 20, -10);
    this.scene.add(fillLight);
  }

  // --- 3D LIVING SYMBIOTE (VENOM) ---
  createSymbiotePlayer() {
    this.symbioteGroup = new THREE.Group();

    // Central Fluid Biomass Body
    const bodyGeo = new THREE.IcosahedronGeometry(1.2, 3);
    this.symbioteMesh = new THREE.Mesh(bodyGeo, this.matVenom);
    this.symbioteMesh.castShadow = true;
    this.symbioteMesh.position.y = 1.0;
    this.symbioteGroup.add(this.symbioteMesh);

    // Iconic Piercing White Venom Eyes (Left & Right)
    const eyeGeo = new THREE.ConeGeometry(0.35, 0.7, 4);
    eyeGeo.rotateX(Math.PI / 2);
    eyeGeo.scale(0.8, 0.35, 1.2);

    this.leftEye = new THREE.Mesh(eyeGeo, this.matEyes);
    this.leftEye.position.set(-0.45, 1.2, 0.9);
    this.leftEye.rotation.set(-0.2, 0.35, -0.2);
    this.symbioteGroup.add(this.leftEye);

    this.rightEye = new THREE.Mesh(eyeGeo, this.matEyes);
    this.rightEye.position.set(0.45, 1.2, 0.9);
    this.rightEye.rotation.set(-0.2, -0.35, 0.2);
    this.symbioteGroup.add(this.rightEye);

    // Trailing 3D Jointed Tendrils (6 flexible tendril chains)
    this.tendrilChains = [];
    const tendrilCount = 6;
    for (let c = 0; c < tendrilCount; c++) {
      const chain = [];
      const linkCount = 5;
      for (let l = 0; l < linkCount; l++) {
        const radius = Math.max(0.12, 0.38 * (1 - l / linkCount));
        const tMesh = new THREE.Mesh(
          new THREE.SphereGeometry(radius, 8, 8),
          this.matVenom
        );
        tMesh.castShadow = true;
        this.scene.add(tMesh);
        chain.push({ mesh: tMesh, x: 0, y: 0.5, z: 0 });
      }
      this.tendrilChains.push(chain);
    }

    this.scene.add(this.symbioteGroup);
  }

  // --- 3D BODYGUARD CREATOR ---
  createGuardModel() {
    const group = new THREE.Group();

    // 1. Torso (Tactical Armor Vest)
    const torsoGeo = new THREE.CylinderGeometry(0.55, 0.45, 1.4, 8);
    const torso = new THREE.Mesh(torsoGeo, this.matGuardArmor);
    torso.position.y = 1.6;
    torso.castShadow = true;
    group.add(torso);
    group.torso = torso;

    // 2. Helmet
    const headGeo = new THREE.SphereGeometry(0.42, 12, 12);
    const head = new THREE.Mesh(headGeo, this.matAKSteel);
    head.position.y = 2.6;
    head.castShadow = true;
    group.add(head);

    // Helmet NVG Visor
    const visorGeo = new THREE.BoxGeometry(0.45, 0.15, 0.25);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 2.65, 0.35);
    group.add(visor);

    // 3. Legs
    const legGeo = new THREE.CylinderGeometry(0.18, 0.16, 1.0, 6);
    const leftLeg = new THREE.Mesh(legGeo, this.matAKSteel);
    leftLeg.position.set(-0.25, 0.5, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, this.matAKSteel);
    rightLeg.position.set(0.25, 0.5, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // 4. 3D AK-47 Assault Rifle
    const akGroup = new THREE.Group();
    // Gun Body
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 1.2), this.matAKSteel);
    receiver.position.set(0, 0, 0);
    akGroup.add(receiver);

    // Barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), this.matAKSteel);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.06, 0.9);
    akGroup.add(barrel);

    // Wooden Stock & Handguard
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.65), this.matAKWood);
    stock.position.set(0, -0.05, -0.6);
    akGroup.add(stock);

    // Curved Banana Magazine
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.25), this.matAKSteel);
    mag.position.set(0, -0.28, 0.15);
    mag.rotation.x = -0.3;
    akGroup.add(mag);

    akGroup.position.set(0.4, 1.5, 0.4);
    group.add(akGroup);
    group.akRifle = akGroup;

    // 5. Dynamic Flashlight Vision Cone (Volumetric Light Mesh)
    const fovAngle = (70 * Math.PI) / 180;
    const coneDist = 14.0;
    const coneRadius = Math.tan(fovAngle / 2) * coneDist;
    const coneGeo = new THREE.ConeGeometry(coneRadius, coneDist, 16, 1, true);
    coneGeo.rotateX(-Math.PI / 2);
    coneGeo.translate(0, 0, coneDist / 2);

    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e, // Bright green patrol
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const visionCone = new THREE.Mesh(coneGeo, coneMat);
    visionCone.position.set(0, 1.4, 0.3);
    group.add(visionCone);
    group.visionCone = visionCone;
    group.visionConeMat = coneMat;

    // Floor Target Reticle for Devour
    const reticleGeo = new THREE.RingGeometry(1.6, 1.85, 24);
    reticleGeo.rotateX(-Math.PI / 2);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide
    });
    const reticle = new THREE.Mesh(reticleGeo, reticleMat);
    reticle.position.y = 0.06;
    group.add(reticle);
    group.reticle = reticle;
    group.reticleMat = reticleMat;

    this.scene.add(group);
    return group;
  }

  // --- 3D PROP CREATOR ---
  createPropModel(propDef) {
    const group = new THREE.Group();

    if (propDef.type === "CRATE") {
      // 3D Heavy Reinforced Cargo Crate
      const geo = new THREE.BoxGeometry(2.4, 2.2, 2.4);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        roughness: 0.6,
        metalness: 0.2
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = 1.1;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      // Warning hazard stripes around crate
      const band = new THREE.Mesh(
        new THREE.BoxGeometry(2.46, 0.35, 2.46),
        new THREE.MeshBasicMaterial({ color: 0xeab308 })
      );
      band.position.y = 1.1;
      group.add(band);
    } else if (propDef.type === "BARREL") {
      // 3D Toxic Chemical Barrel
      const geo = new THREE.CylinderGeometry(1.0, 1.0, 2.2, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xca8a04, // Toxic Yellow
        roughness: 0.4,
        metalness: 0.5
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = 1.1;
      mesh.castShadow = true;
      group.add(mesh);

      // Glowing toxic rim
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(1.05, 0.08, 8, 16),
        new THREE.MeshBasicMaterial({ color: 0x22c55e })
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 2.15;
      group.add(rim);
    } else if (propDef.type === "VENDING") {
      // 3D Cyberpunk Vending Machine
      const geo = new THREE.BoxGeometry(2.0, 3.2, 1.6);
      const mat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3, metalness: 0.4 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = 1.6;
      mesh.castShadow = true;
      group.add(mesh);

      // Illuminated Soda Glass
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 1.8, 0.2),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      glass.position.set(0, 1.9, 0.85);
      group.add(glass);
    } else {
      // 3D Server Rack
      const geo = new THREE.BoxGeometry(2.2, 3.4, 1.8);
      const mat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.7 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = 1.7;
      mesh.castShadow = true;
      group.add(mesh);

      // Blinking Green/Cyan Server LED strip
      const led = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 2.6, 0.1),
        new THREE.MeshBasicMaterial({ color: 0x10b981 })
      );
      led.position.set(0, 1.7, 0.95);
      group.add(led);
    }

    // Camouflage Glowing Veins (Visible when player hides in this prop)
    const veinMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.0
    });
    const veinMesh = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.3, 2.5), veinMat);
    veinMesh.position.y = 1.1;
    group.add(veinMesh);
    group.veinMesh = veinMesh;
    group.veinMat = veinMat;

    this.scene.add(group);
    return group;
  }

  // --- SCREEN SHAKE FX ---
  triggerScreenShake(intensity = 0.8) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  // --- 60FPS RENDER & CAMERA UPDATE ---
  render(engine, delta) {
    const p = engine.player;

    // 1. Camera Tracking (Vertical Portrait Follow)
    const targetCamX = p.x;
    const targetCamY = 24.0;
    const targetCamZ = p.z + 18.0;

    // Smooth Lerp Camera
    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.12;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.12;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.12;

    this.cameraTarget.set(p.x, 0.8, p.z - 4.0);
    this.camera.lookAt(this.cameraTarget);

    // Apply Screen Shake
    if (this.shakeIntensity > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - delta * 3.5);
    }

    // Move Key Directional Light with Player
    this.keyLight.position.set(p.x + 15, 35, p.z + 20);
    this.keyLight.target.position.set(p.x, 0, p.z);
    this.keyLight.target.updateMatrixWorld();

    // 2. Update Symbiote Mesh
    if (p.isDisguised) {
      // Hidden inside prop
      this.symbioteGroup.visible = false;
      this.tendrilChains.forEach(chain => chain.forEach(link => (link.mesh.visible = false)));
    } else {
      this.symbioteGroup.visible = true;
      this.tendrilChains.forEach(chain => chain.forEach(link => (link.mesh.visible = true)));

      this.symbioteGroup.position.set(p.x, 0, p.z);
      this.symbioteGroup.rotation.y = Math.PI - p.angle;

      // Organic Slime Ripple Wobble
      const wobble = Math.sin(performance.now() * 0.008) * 0.08;
      const tierScale = p.tier === 3 ? 1.6 : (p.tier === 2 ? 1.3 : 1.0);
      this.symbioteMesh.scale.set(
        tierScale + wobble,
        tierScale - wobble * 0.5,
        tierScale + wobble
      );

      // Trailing Tendrils Joint Physics
      this.updateSymbioteTendrils(p, delta);
    }

    // 3. Sync Bodyguards
    this.syncGuardMeshes(engine);

    // 4. Sync Props & Camouflage Pulses
    this.syncPropMeshes(engine);

    // 5. Sync Walls & Floor Chunks
    this.syncFacilityArchitecture(engine);

    // 6. Sync Bullets & Muzzle Flashes
    this.syncProjectiles(engine, delta);

    // Render WebGL Scene
    this.renderer.render(this.scene, this.camera);
  }

  updateSymbioteTendrils(p, delta) {
    const time = performance.now() * 0.006;
    this.tendrilChains.forEach((chain, cIdx) => {
      let prevX = p.x;
      let prevZ = p.z;
      const angleOffset = (cIdx / this.tendrilChains.length) * Math.PI * 2;

      chain.forEach((link, lIdx) => {
        const dx = prevX - link.x;
        const dz = prevZ - link.z;
        const dist = Math.hypot(dx, dz);
        const targetDist = 0.6;

        if (dist > targetDist) {
          link.x += (dx / dist) * (dist - targetDist) * 0.75;
          link.z += (dz / dist) * (dist - targetDist) * 0.75;
        }

        // Wavy organic whip
        link.x += Math.sin(time + lIdx * 0.8 + angleOffset) * 0.03;
        link.z += Math.cos(time + lIdx * 0.8 + angleOffset) * 0.03;
        link.y = 0.4 + Math.sin(time * 2 + lIdx) * 0.15;

        link.mesh.position.set(link.x, link.y, link.z);

        prevX = link.x;
        prevZ = link.z;
      });
    });
  }

  syncGuardMeshes(engine) {
    const activeIds = new Set();

    engine.guards.forEach(g => {
      if (g.state === "DEAD") return;
      activeIds.add(g.id);

      let meshGroup = this.guardMeshes.get(g.id);
      if (!meshGroup) {
        meshGroup = this.createGuardModel();
        this.guardMeshes.set(g.id, meshGroup);
      }

      meshGroup.position.set(g.x, 0, g.z);
      meshGroup.rotation.y = Math.PI - g.angle;

      // Vision cone color & alert states
      if (g.state === "ALERT_COMBAT") {
        meshGroup.visionConeMat.color.setHex(0xef4444); // Red Combat
        meshGroup.visionConeMat.opacity = 0.45;
        meshGroup.torso.material = this.matGuardAlertArmor;
      } else if (g.state === "SUSPICIOUS") {
        meshGroup.visionConeMat.color.setHex(0xeab308); // Yellow Suspicious
        meshGroup.visionConeMat.opacity = 0.35;
        meshGroup.torso.material = this.matGuardArmor;
      } else {
        meshGroup.visionConeMat.color.setHex(0x22c55e); // Green Patrol
        meshGroup.visionConeMat.opacity = 0.25;
        meshGroup.torso.material = this.matGuardArmor;
      }

      // Devour Target Reticle
      const isTarget = engine.devourTarget && engine.devourTarget.id === g.id;
      meshGroup.reticleMat.opacity = isTarget ? 0.95 : 0.0;
      if (isTarget) {
        const pulse = 1.0 + Math.sin(performance.now() * 0.015) * 0.15;
        meshGroup.reticle.scale.set(pulse, pulse, pulse);
      }
    });

    // Remove dead/despawned guards
    for (const [id, mesh] of this.guardMeshes.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(mesh);
        this.guardMeshes.delete(id);
      }
    }
  }

  syncPropMeshes(engine) {
    const activeIds = new Set();

    engine.props.forEach(prop => {
      activeIds.add(prop.id);
      let mesh = this.propMeshes.get(prop.id);
      if (!mesh) {
        mesh = this.createPropModel(prop);
        mesh.position.set(prop.x, 0, prop.z);
        this.propMeshes.set(prop.id, mesh);
      }

      // Check if player is disguised inside this prop
      const isDisguisedHere = engine.player.isDisguised && engine.player.disguisedProp === prop;
      if (isDisguisedHere) {
        const pulse = 0.5 + Math.sin(performance.now() * 0.008) * 0.45;
        mesh.veinMat.opacity = pulse;
      } else {
        mesh.veinMat.opacity = 0.0;
      }
    });

    for (const [id, mesh] of this.propMeshes.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(mesh);
        this.propMeshes.delete(id);
      }
    }
  }

  syncFacilityArchitecture(engine) {
    const activeIds = new Set();

    // Floor Chunks & Walls
    engine.facilityChunks.forEach(chunk => {
      activeIds.add(chunk.id);
      let mesh = this.wallMeshes.get(chunk.id);
      if (!mesh) {
        mesh = this.createFacilityChunk(chunk);
        this.wallMeshes.set(chunk.id, mesh);
      }
    });

    for (const [id, mesh] of this.wallMeshes.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(mesh);
        this.wallMeshes.delete(id);
      }
    }
  }

  createFacilityChunk(chunk) {
    const group = new THREE.Group();

    // 1. Bright Polished Floor
    const floorGeo = new THREE.PlaneGeometry(chunk.width, chunk.length);
    floorGeo.rotateX(-Math.PI / 2);
    const floor = new THREE.Mesh(floorGeo, this.matFloor);
    floor.position.set(chunk.x, 0, chunk.z);
    floor.receiveShadow = true;
    group.add(floor);

    // Hazard Stripes on Left & Right Corridor Edges
    const hazardGeo = new THREE.PlaneGeometry(0.8, chunk.length);
    hazardGeo.rotateX(-Math.PI / 2);
    const hazardMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 }); // Glowing neon cyan

    const leftTrim = new THREE.Mesh(hazardGeo, hazardMat);
    leftTrim.position.set(chunk.x - chunk.width / 2 + 0.4, 0.02, chunk.z);
    group.add(leftTrim);

    const rightTrim = new THREE.Mesh(hazardGeo, hazardMat);
    rightTrim.position.set(chunk.x + chunk.width / 2 - 0.4, 0.02, chunk.z);
    group.add(rightTrim);

    // 2. High-Tech Corridor Walls
    const wallGeo = new THREE.BoxGeometry(1.6, 5.0, chunk.length);
    const leftWall = new THREE.Mesh(wallGeo, this.matWall);
    leftWall.position.set(chunk.x - chunk.width / 2 - 0.8, 2.5, chunk.z);
    leftWall.castShadow = true;
    group.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, this.matWall);
    rightWall.position.set(chunk.x + chunk.width / 2 + 0.8, 2.5, chunk.z);
    rightWall.castShadow = true;
    group.add(rightWall);

    // 3. Zig-Zag Partition Cover Walls (for stealth hiding & breaking line-of-sight)
    if (chunk.barriers && chunk.barriers.length > 0) {
      chunk.barriers.forEach(b => {
        // Main Reinforced Steel Cover Wall
        const bGeo = new THREE.BoxGeometry(b.width, 4.2, b.depth);
        const bMesh = new THREE.Mesh(bGeo, this.matWall);
        bMesh.position.set(b.x, 2.1, b.z);
        bMesh.castShadow = true;
        bMesh.receiveShadow = true;
        group.add(bMesh);

        // Top Panel Cap Trim
        const capGeo = new THREE.BoxGeometry(b.width + 0.1, 0.25, b.depth + 0.1);
        const capMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.3 });
        const capMesh = new THREE.Mesh(capGeo, capMat);
        capMesh.position.set(b.x, 4.25, b.z);
        group.add(capMesh);

        // Glowing Cyan Hazard Edge Indicator at Corner
        const edgeX = b.side === "LEFT" ? (b.x + b.width / 2) : (b.x - b.width / 2);
        const edgeGeo = new THREE.BoxGeometry(0.35, 4.2, b.depth + 0.08);
        const edgeMesh = new THREE.Mesh(edgeGeo, this.matHazard);
        edgeMesh.position.set(edgeX, 2.1, b.z);
        group.add(edgeMesh);
      });
    }

    // 3. Overhead Ceiling Fluorescent Panel Light (Bright illuminating fixture)
    const ceilGeo = new THREE.BoxGeometry(chunk.width * 0.4, 0.3, 1.2);
    const ceilMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const ceilFixture = new THREE.Mesh(ceilGeo, ceilMat);
    ceilFixture.position.set(chunk.x, 6.0, chunk.z);
    group.add(ceilFixture);

    // Point Light for crisp room illumination
    const roomLight = new THREE.PointLight(0xffffff, 1.1, 28);
    roomLight.position.set(chunk.x, 5.2, chunk.z);
    group.add(roomLight);

    this.scene.add(group);
    return group;
  }

  syncProjectiles(engine, delta) {
    // Tracers
    while (this.bulletMeshes.length < engine.bullets.length) {
      const bGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6);
      bGeo.rotateX(Math.PI / 2);
      const bMesh = new THREE.Mesh(bGeo, this.matTracer);
      this.scene.add(bMesh);
      this.bulletMeshes.push(bMesh);
    }

    engine.bullets.forEach((b, idx) => {
      const bMesh = this.bulletMeshes[idx];
      bMesh.visible = true;
      bMesh.position.set(b.x, 1.5, b.z);
      bMesh.rotation.y = Math.PI - Math.atan2(b.vx, -b.vz);
    });

    for (let i = engine.bullets.length; i < this.bulletMeshes.length; i++) {
      this.bulletMeshes[i].visible = false;
    }
  }
}

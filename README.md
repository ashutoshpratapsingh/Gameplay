# 🕷️ SYMBIOTE 3D: APEX PREDATOR (VENOM PROTOCOL)
### *Endless 3D Stealth Mimic & Biomass Evolution Action Game*

[![Engine: Three.js WebGL](https://img.shields.io/badge/Engine-Three.js_WebGL-blue.svg)](https://threejs.org/)
[![Audio: Web Audio API](https://img.shields.io/badge/Audio-Procedural_Web_Audio_API-purple.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Platform: Mobile First](https://img.shields.io/badge/Platform-Mobile_Vertical_&_Desktop-emerald.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)]()

---

## 🎮 Game Concept & Novel Mechanic

Inspired by the Hollywood predator fantasy (*Venom*), **SYMBIOTE 3D** introduces a gameplay loop not found in any existing mobile store game:

1. **3D Living Symbiote Physics**:
   - The player controls an amorphous, glossy black fluid symbiote with dynamic surface ripples, 6 trailing jointed tendrils, and piercing glowing white eyes.
2. **Metamorphic Prop Camouflage (The Mimic)**:
   - Slink near non-living objects (supply crates, toxic chemical barrels, server racks, vending machines) and press **`[MORPH]` / `[SPACE]`**.
   - Venom liquefies and absorbs into the object. While camouflaged, armed guards can shine flashlights directly on the prop without detecting the player.
3. **Tactical AK-47 Bodyguard AI**:
   - Armed bodyguards patrol corridors with dynamic volumetric vision cones (Green = Patrol, Yellow = Suspicious, Red = Alert).
   - If guards spot Venom in living form, they open fire with realistic **AK-47 assault rifle 3-round bursts** (`RAT-TAT-TAT!`).
4. **Behind-the-Back Ambush & Devour Execution**:
   - Sneak behind guards outside their vision cone or erupt from a disguised prop and trigger **`[DEVOUR]` / `[E]`**.
   - Thick black tendrils erupt, lifting and consuming the guard in slow-motion bullet-time.
5. **Endless Procedural Facility & Guard Escalation**:
   - The facility extends infinitely along the corridor axis.
   - The deeper Venom infiltrates (`Depth: 50m, 100m, 250m, 500m+`), the number of bodyguards escalates exponentially, creating overlapping crossfire hazards.
6. **Biomass Evolution**:
   - **Tier 1 (Parasite)**: Base form (100 HP, 2 tendrils, 5.8m Devour reach).
   - **Tier 2 (Symbiote)**: Unlocks at 80 Biomass (180 HP, 4 tendrils, 8.5m Devour reach, faster movement).
   - **Tier 3 (Apex Beast)**: Unlocks at 160 Biomass (260 HP, 6 massive tendrils, fearsome aura).

---

## 📱 Controls

### Mobile (One-Handed Play)
- **Interactive First-Time Tutorial**: Animated finger (`👆`) guides first-time players through slinking, camouflaging, waiting for guards to pass, and executing behind-the-back devours.
- **`[❓]` Tutorial Help**: Tap anytime in the header to restart the tutorial walkthrough.
- **Touch & Drag Anywhere**: A floating virtual joystick appears under your thumb for smooth 360° locomotion.
- **`[MORPH]` Button**: One-tap camouflage when near props.
- **`[DEVOUR]` Button**: Glows neon crimson when an armed guard is in ambush range.

### Desktop
- **`WASD` / `Arrow Keys`**: Slink / Move Venom.
- **`[SPACE]`**: Morph into nearby prop / Revert form.
- **`[E]`**: Ambush & Devour target guard.

---

## 🛠️ Architecture & Tech Stack

- **Rendering**: Three.js WebGL (60 FPS, ACESFilmic tonemapping, soft shadows, volumetric lighting).
- **Procedural Audio**: Multi-layered Web Audio API synthesis:
  - 7.62x39mm AK-47 gunfire (supersonic crack, gunpowder blast, sub-bass kick, steel bolt slap, shell casing ping).
  - Wet slime slinking & organic squelches.
  - Bone-shattering Devour crunch & guttural roar.
- **Performance**: Zero external runtime dependencies; automated chunk streaming & culling for endless 60 FPS gameplay.

---

## 🚀 Quickstart

### Prerequisites
- Node.js (v16+)

### Run Locally
```bash
# Clone the repository
git clone https://github.com/ashutoshpratapsingh/Gameplay.git
cd Gameplay

# Start zero-dependency static server
node server.js
```
Open **`http://localhost:8110`** in any web browser.

---

## 📄 License
MIT License. Created by Ashutosh Pratap Singh.

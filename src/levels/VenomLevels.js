/**
 * SYMBIOTE: APEX PREDATOR (VENOM)
 * 3 Escalating Tactical Infiltration Sectors
 */

export const SECTORS = [
  {
    id: 1,
    title: "Sector 1: Sub-Level Research Lab",
    directive: "Crawl near a prop $\to$ Press <b>[SPACE]</b> to disguise $\to$ Wait for guard to walk past $\to$ Press <b>[E]</b> to DEVOUR!",
    playerStart: { x: 80, y: 300 },
    walls: [
      { x: 0, y: 0, w: 900, h: 20 },
      { x: 0, y: 580, w: 900, h: 20 },
      { x: 0, y: 0, w: 20, h: 600 },
      { x: 880, y: 0, w: 20, h: 600 },
      // Internal lab partitions
      { x: 260, y: 20, w: 24, h: 240 },
      { x: 260, y: 360, w: 24, h: 220 },
      { x: 560, y: 160, w: 24, h: 300 }
    ],
    props: [
      { type: "CRATE", x: 180, y: 200 },
      { type: "BARREL", x: 210, y: 440 },
      { type: "CHAIR", x: 380, y: 180 },
      { type: "VENDING", x: 420, y: 480 },
      { type: "SERVER", x: 680, y: 220 },
      { type: "CRATE", x: 740, y: 420 }
    ],
    guards: [
      {
        x: 380,
        y: 280,
        angle: 0,
        waypoints: [
          { x: 380, y: 140 },
          { x: 380, y: 460 }
        ]
      },
      {
        x: 500,
        y: 120,
        angle: Math.PI / 2,
        waypoints: [
          { x: 340, y: 120 },
          { x: 520, y: 120 }
        ]
      },
      {
        x: 740,
        y: 300,
        angle: Math.PI,
        waypoints: [
          { x: 660, y: 300 },
          { x: 820, y: 300 }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Sector 2: Weapons Armory",
    directive: "5 Guards patrolling with overlapping AK-47 vision cones! Evolve to <b>TIER 2 SYMBIOTE</b>!",
    playerStart: { x: 80, y: 100 },
    walls: [
      { x: 0, y: 0, w: 900, h: 20 },
      { x: 0, y: 580, w: 900, h: 20 },
      { x: 0, y: 0, w: 20, h: 600 },
      { x: 880, y: 0, w: 20, h: 600 },
      // Armory security cages
      { x: 220, y: 140, w: 220, h: 20 },
      { x: 500, y: 140, w: 220, h: 20 },
      { x: 220, y: 420, w: 220, h: 20 },
      { x: 500, y: 420, w: 220, h: 20 },
      { x: 460, y: 220, w: 24, h: 160 }
    ],
    props: [
      { type: "CRATE", x: 140, y: 220 },
      { type: "BARREL", x: 180, y: 360 },
      { type: "VENDING", x: 350, y: 80 },
      { type: "CHAIR", x: 580, y: 80 },
      { type: "SERVER", x: 360, y: 500 },
      { type: "CRATE", x: 600, y: 500 },
      { type: "BARREL", x: 780, y: 280 }
    ],
    guards: [
      {
        x: 160,
        y: 280,
        angle: Math.PI / 2,
        waypoints: [{ x: 160, y: 180 }, { x: 160, y: 440 }]
      },
      {
        x: 350,
        y: 280,
        angle: 0,
        waypoints: [{ x: 260, y: 280 }, { x: 420, y: 280 }]
      },
      {
        x: 580,
        y: 280,
        angle: Math.PI,
        waypoints: [{ x: 520, y: 280 }, { x: 680, y: 280 }]
      },
      {
        x: 760,
        y: 180,
        angle: Math.PI / 2,
        waypoints: [{ x: 760, y: 100 }, { x: 760, y: 300 }]
      },
      {
        x: 760,
        y: 420,
        angle: -Math.PI / 2,
        waypoints: [{ x: 760, y: 340 }, { x: 760, y: 500 }]
      }
    ]
  },
  {
    id: 3,
    title: "Sector 3: Apex Extraction Hangar",
    directive: "FINAL SECTOR: 8 Heavy Bodyguards! Consume them all to unleash the <b>TIER 3 APEX BEAST</b>!",
    playerStart: { x: 60, y: 300 },
    walls: [
      { x: 0, y: 0, w: 900, h: 20 },
      { x: 0, y: 580, w: 900, h: 20 },
      { x: 0, y: 0, w: 20, h: 600 },
      { x: 880, y: 0, w: 20, h: 600 },
      // Hangar cargo blocks
      { x: 200, y: 100, w: 60, h: 140 },
      { x: 200, y: 360, w: 60, h: 140 },
      { x: 450, y: 180, w: 60, h: 240 },
      { x: 700, y: 100, w: 60, h: 140 },
      { x: 700, y: 360, w: 60, h: 140 }
    ],
    props: [
      { type: "CRATE", x: 120, y: 180 },
      { type: "BARREL", x: 120, y: 420 },
      { type: "SERVER", x: 340, y: 120 },
      { type: "VENDING", x: 340, y: 480 },
      { type: "CHAIR", x: 580, y: 120 },
      { type: "CRATE", x: 580, y: 480 },
      { type: "BARREL", x: 800, y: 220 },
      { type: "BARREL", x: 800, y: 380 }
    ],
    guards: [
      { x: 330, y: 200, angle: Math.PI / 2, waypoints: [{ x: 330, y: 120 }, { x: 330, y: 300 }] },
      { x: 330, y: 400, angle: -Math.PI / 2, waypoints: [{ x: 330, y: 300 }, { x: 330, y: 480 }] },
      { x: 400, y: 300, angle: 0, waypoints: [{ x: 320, y: 300 }, { x: 420, y: 300 }] },
      { x: 570, y: 200, angle: Math.PI / 2, waypoints: [{ x: 570, y: 120 }, { x: 570, y: 300 }] },
      { x: 570, y: 400, angle: -Math.PI / 2, waypoints: [{ x: 570, y: 300 }, { x: 570, y: 480 }] },
      { x: 720, y: 260, angle: Math.PI, waypoints: [{ x: 640, y: 260 }, { x: 800, y: 260 }] },
      { x: 720, y: 340, angle: 0, waypoints: [{ x: 640, y: 340 }, { x: 800, y: 340 }] },
      { x: 820, y: 300, angle: Math.PI, waypoints: [{ x: 780, y: 200 }, { x: 780, y: 400 }] }
    ]
  }
];

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Realm = "meadow" | "cave";
type ResourceKind = "tree" | "rock" | "ore" | "bush";
type Tool = "axe" | "pickaxe" | "spear" | "sword" | "food" | "build";
type BuildKind =
  | "woodFence"
  | "stoneFence"
  | "woodGate"
  | "stoneGate"
  | "floor"
  | "wall"
  | "door"
  | "roof"
  | "spikes"
  | "crop";

type Material = "wood" | "stone" | "metal" | "fiber" | "food" | "seeds";
type Panel = "inventory" | "craft" | "build" | null;

interface ResourceNode {
  id: number;
  kind: ResourceKind;
  realm: Realm;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  respawnAt: number;
}

interface Creature {
  id: number;
  kind: "shade" | "brute" | "bear" | "boar";
  realm: Realm;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  fed: number;
  tame: boolean;
  angry: boolean;
  hitAt: number;
  phase: number;
}

interface Building {
  id: number;
  kind: BuildKind;
  realm: Realm;
  gx: number;
  gy: number;
  hp: number;
  maxHp: number;
  open: boolean;
  growth: number;
}

interface Player {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  hunger: number;
  dir: number;
  swing: number;
  attackReady: number;
}

interface GameState {
  started: boolean;
  dead: boolean;
  day: number;
  clock: number;
  wasNight: boolean;
  realm: Realm;
  zoom: number;
  player: Player;
  resources: Record<Material, number>;
  gear: { spear: boolean; sword: boolean; ironAxe: boolean; ironPick: boolean };
  kits: Record<BuildKind, number>;
  selected: Tool;
  weapon: "spear" | "sword";
  buildMode: BuildKind | null;
  nodes: ResourceNode[];
  creatures: Creature[];
  buildings: Building[];
  keys: Set<string>;
  pointer: { x: number; y: number; worldX: number; worldY: number; active: boolean };
  camera: { x: number; y: number };
  message: string;
  messageUntil: number;
  wave: number;
  kills: number;
  lastId: number;
}

interface Recipe {
  id: string;
  name: string;
  detail: string;
  cost: Partial<Record<Material, number>>;
  action: (game: GameState) => void;
}

const WORLD_W = 2200;
const WORLD_H = 1600;
const GRID = 48;
const DAY_SECONDS = 110;

const MATERIALS: { id: Material; name: string; icon: string }[] = [
  { id: "wood", name: "Wood", icon: "W" },
  { id: "stone", name: "Stone", icon: "S" },
  { id: "metal", name: "Metal", icon: "M" },
  { id: "fiber", name: "Fiber", icon: "F" },
  { id: "food", name: "Food", icon: "●" },
  { id: "seeds", name: "Seeds", icon: "✦" },
];

const BUILD_DATA: Record<
  BuildKind,
  { name: string; detail: string; icon: string; cost: Partial<Record<Material, number>>; makes: number; hp: number }
> = {
  woodFence: { name: "Wood Fence", detail: "A quick timber barrier", icon: "WF", cost: { wood: 3 }, makes: 2, hp: 55 },
  stoneFence: { name: "Stone Fence", detail: "Slow, sturdy protection", icon: "SF", cost: { stone: 4 }, makes: 2, hp: 105 },
  woodGate: { name: "Wood Gate", detail: "Opens with E", icon: "WG", cost: { wood: 5 }, makes: 1, hp: 70 },
  stoneGate: { name: "Stone Gate", detail: "Reinforced entrance", icon: "SG", cost: { stone: 5, metal: 1 }, makes: 1, hp: 130 },
  floor: { name: "Wood Floor", detail: "Snaps beneath structures", icon: "FL", cost: { wood: 2 }, makes: 2, hp: 45 },
  wall: { name: "House Wall", detail: "Heavy shelter wall", icon: "WL", cost: { wood: 5, stone: 2 }, makes: 1, hp: 120 },
  door: { name: "House Door", detail: "A doorway for your shelter", icon: "DR", cost: { wood: 4, metal: 1 }, makes: 1, hp: 90 },
  roof: { name: "Roof", detail: "Shelter from the dark", icon: "RF", cost: { wood: 4, fiber: 2 }, makes: 1, hp: 75 },
  spikes: { name: "Spike Trap", detail: "Damages monsters", icon: "SP", cost: { wood: 4, metal: 2 }, makes: 1, hp: 60 },
  crop: { name: "Crop Plot", detail: "Grows food over time", icon: "CP", cost: { wood: 2, fiber: 2, seeds: 1 }, makes: 1, hp: 45 },
};

const BUILD_ORDER: BuildKind[] = [
  "woodFence",
  "stoneFence",
  "woodGate",
  "stoneGate",
  "floor",
  "wall",
  "door",
  "roof",
  "spikes",
  "crop",
];

function seeded(index: number, salt: number) {
  const value = Math.sin(index * 999 + salt * 77.13) * 43758.5453;
  return value - Math.floor(value);
}

function makeGame(): GameState {
  const nodes: ResourceNode[] = [];
  let id = 1;
  for (let i = 0; i < 54; i++) {
    const kind: ResourceKind = i % 7 === 0 ? "bush" : i % 4 === 0 ? "rock" : "tree";
    const x = 100 + seeded(i, 1) * (WORLD_W - 200);
    const y = 100 + seeded(i, 2) * (WORLD_H - 200);
    if (Math.hypot(x - 1100, y - 800) > 260 && Math.hypot(x - 1850, y - 280) > 150) {
      const hp = kind === "tree" ? 3 : kind === "rock" ? 4 : 1;
      nodes.push({ id: id++, kind, realm: "meadow", x, y, hp, maxHp: hp, respawnAt: 0 });
    }
  }
  for (let i = 0; i < 38; i++) {
    const kind: ResourceKind = i % 3 === 0 ? "ore" : "rock";
    const hp = kind === "ore" ? 5 : 4;
    nodes.push({
      id: id++,
      kind,
      realm: "cave",
      x: 120 + seeded(i, 9) * (WORLD_W - 240),
      y: 120 + seeded(i, 10) * (WORLD_H - 240),
      hp,
      maxHp: hp,
      respawnAt: 0,
    });
  }
  const creatures: Creature[] = [
    { id: id++, kind: "bear", realm: "meadow", x: 650, y: 540, hp: 65, maxHp: 65, speed: 48, damage: 8, fed: 0, tame: false, angry: false, hitAt: 0, phase: 0.2 },
    { id: id++, kind: "boar", realm: "meadow", x: 1450, y: 1120, hp: 42, maxHp: 42, speed: 54, damage: 5, fed: 0, tame: false, angry: false, hitAt: 0, phase: 2.1 },
    { id: id++, kind: "boar", realm: "meadow", x: 470, y: 1260, hp: 42, maxHp: 42, speed: 54, damage: 5, fed: 0, tame: false, angry: false, hitAt: 0, phase: 4.2 },
  ];
  return {
    started: false,
    dead: false,
    day: 1,
    clock: 0.16,
    wasNight: false,
    realm: "meadow",
    zoom: 1,
    player: { x: 1100, y: 800, hp: 100, maxHp: 100, hunger: 100, dir: 0, swing: 0, attackReady: 0 },
    resources: { wood: 8, stone: 5, metal: 0, fiber: 4, food: 3, seeds: 2 },
    gear: { spear: false, sword: false, ironAxe: false, ironPick: false },
    kits: {
      woodFence: 2,
      stoneFence: 0,
      woodGate: 0,
      stoneGate: 0,
      floor: 2,
      wall: 0,
      door: 0,
      roof: 0,
      spikes: 0,
      crop: 0,
    },
    selected: "axe",
    weapon: "spear",
    buildMode: null,
    nodes,
    creatures,
    buildings: [],
    keys: new Set(),
    pointer: { x: 0, y: 0, worldX: 0, worldY: 0, active: false },
    camera: { x: 1100, y: 800 },
    message: "Gather, craft, and build before nightfall.",
    messageUntil: performance.now() + 6000,
    wave: 0,
    kills: 0,
    lastId: id,
  };
}

function isNight(game: GameState) {
  return game.clock >= 0.5;
}

function notify(game: GameState, message: string, duration = 2300) {
  game.message = message;
  game.messageUntil = performance.now() + duration;
}

function costLabel(cost: Partial<Record<Material, number>>) {
  return Object.entries(cost)
    .map(([key, value]) => String(value) + " " + key)
    .join(" · ");
}

function canAfford(game: GameState, cost: Partial<Record<Material, number>>) {
  return Object.entries(cost).every(([key, value]) => game.resources[key as Material] >= (value || 0));
}

function pay(game: GameState, cost: Partial<Record<Material, number>>) {
  Object.entries(cost).forEach(([key, value]) => {
    game.resources[key as Material] -= value || 0;
  });
}

function spawnNightWave(game: GameState) {
  game.wave = game.day;
  const count = Math.min(18, 3 + game.day * 2);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + seeded(i, game.day);
    const distance = 430 + seeded(i, game.day + 5) * 280;
    const x = Math.max(70, Math.min(WORLD_W - 70, game.player.x + Math.cos(angle) * distance));
    const y = Math.max(70, Math.min(WORLD_H - 70, game.player.y + Math.sin(angle) * distance));
    const brute = game.day > 1 && i % 4 === 0;
    const hp = (brute ? 54 : 28) + game.day * (brute ? 13 : 8);
    game.creatures.push({
      id: game.lastId++,
      kind: brute ? "brute" : "shade",
      realm: game.realm,
      x,
      y,
      hp,
      maxHp: hp,
      speed: (brute ? 45 : 66) + game.day * 2,
      damage: (brute ? 12 : 7) + game.day * 1.4,
      fed: 0,
      tame: false,
      angry: true,
      hitAt: 0,
      phase: i,
    });
  }
  notify(game, "NIGHT " + game.day + " — " + count + " creatures are hunting.", 4300);
}

function activeTool(game: GameState): Tool {
  if (game.selected === "spear" && game.weapon === "sword" && game.gear.sword) return "sword";
  return game.selected;
}

function selectSlot(game: GameState, slot: number) {
  game.buildMode = null;
  if (slot === 1) game.selected = "axe";
  if (slot === 2) game.selected = "pickaxe";
  if (slot === 3) {
    if (game.gear.sword) {
      game.selected = "spear";
      game.weapon = "sword";
    } else if (game.gear.spear) {
      game.selected = "spear";
      game.weapon = "spear";
    } else {
      notify(game, "Craft a spear or sword first.");
    }
  }
  if (slot === 4) game.selected = "food";
}

function nearestCreature(game: GameState, maxDistance: number) {
  let found: Creature | null = null;
  let best = maxDistance;
  for (const creature of game.creatures) {
    if (creature.realm !== game.realm || creature.hp <= 0) continue;
    const distance = Math.hypot(creature.x - game.player.x, creature.y - game.player.y);
    if (distance < best) {
      best = distance;
      found = creature;
    }
  }
  return found;
}

function nearestNode(game: GameState, maxDistance: number) {
  let found: ResourceNode | null = null;
  let best = maxDistance;
  for (const node of game.nodes) {
    if (node.realm !== game.realm || node.hp <= 0) continue;
    const distance = Math.hypot(node.x - game.player.x, node.y - game.player.y);
    if (distance < best) {
      best = distance;
      found = node;
    }
  }
  return found;
}

function buildLayer(kind: BuildKind) {
  if (kind === "floor") return "floor";
  if (kind === "roof") return "roof";
  return "solid";
}

function previewCell(game: GameState) {
  let x = game.player.x + Math.cos(game.player.dir) * 105;
  let y = game.player.y + Math.sin(game.player.dir) * 105;
  if (game.pointer.active) {
    const distance = Math.hypot(game.pointer.worldX - game.player.x, game.pointer.worldY - game.player.y);
    if (distance < 250) {
      x = game.pointer.worldX;
      y = game.pointer.worldY;
    }
  }
  return { gx: Math.round(x / GRID), gy: Math.round(y / GRID) };
}

function validPlacement(game: GameState, kind: BuildKind, gx: number, gy: number) {
  const x = gx * GRID;
  const y = gy * GRID;
  if (x < 70 || y < 70 || x > WORLD_W - 70 || y > WORLD_H - 70) return false;
  if (Math.hypot(x - game.player.x, y - game.player.y) > 260) return false;
  return !game.buildings.some(
    (building) =>
      building.realm === game.realm &&
      building.gx === gx &&
      building.gy === gy &&
      buildLayer(building.kind) === buildLayer(kind),
  );
}

function placeBuild(game: GameState) {
  const kind = game.buildMode;
  if (!kind) return;
  const cell = previewCell(game);
  if (!validPlacement(game, kind, cell.gx, cell.gy)) {
    notify(game, "That grid space is blocked or too far away.");
    return;
  }
  if (game.kits[kind] <= 0) {
    notify(game, "Craft another " + BUILD_DATA[kind].name + " first.");
    return;
  }
  game.kits[kind] -= 1;
  game.buildings.push({
    id: game.lastId++,
    kind,
    realm: game.realm,
    gx: cell.gx,
    gy: cell.gy,
    hp: BUILD_DATA[kind].hp,
    maxHp: BUILD_DATA[kind].hp,
    open: false,
    growth: 0,
  });
  notify(game, BUILD_DATA[kind].name + " placed. E places another.");
  if (game.kits[kind] <= 0) game.buildMode = null;
}

function interact(game: GameState) {
  if (game.buildMode) {
    placeBuild(game);
    return;
  }
  const caveX = game.realm === "meadow" ? 1850 : 180;
  const caveY = game.realm === "meadow" ? 280 : 180;
  if (Math.hypot(game.player.x - caveX, game.player.y - caveY) < 110) {
    game.realm = game.realm === "meadow" ? "cave" : "meadow";
    game.player.x = game.realm === "cave" ? 260 : 1760;
    game.player.y = game.realm === "cave" ? 240 : 340;
    game.camera.x = game.player.x;
    game.camera.y = game.player.y;
    notify(game, game.realm === "cave" ? "Cave entered. Mine ore, but watch the dark." : "Back in the meadow.");
    return;
  }
  const nearbyBuilding = game.buildings.find((building) => {
    if (building.realm !== game.realm) return false;
    if (building.kind !== "woodGate" && building.kind !== "stoneGate" && building.kind !== "door" && building.kind !== "crop") return false;
    return Math.hypot(building.gx * GRID - game.player.x, building.gy * GRID - game.player.y) < 82;
  });
  if (nearbyBuilding) {
    if (nearbyBuilding.kind === "crop") {
      if (nearbyBuilding.growth >= 1) {
        game.resources.food += 4;
        game.resources.seeds += 2;
        nearbyBuilding.growth = 0;
        notify(game, "Harvested 4 food and 2 seeds.");
      } else {
        notify(game, "The crop is " + Math.floor(nearbyBuilding.growth * 100) + "% grown.");
      }
    } else {
      nearbyBuilding.open = !nearbyBuilding.open;
      notify(game, nearbyBuilding.open ? "Opened." : "Closed.");
    }
    return;
  }
  const creature = nearestCreature(game, 92);
  if (creature && (creature.kind === "bear" || creature.kind === "boar") && !creature.tame) {
    if (game.selected !== "food") {
      notify(game, "Equip Food, then press E to feed this " + creature.kind + ".");
      return;
    }
    if (game.resources.food <= 0) {
      notify(game, "You need food to tame animals.");
      return;
    }
    game.resources.food -= 1;
    creature.fed += 1;
    creature.angry = false;
    if (creature.fed >= 3) {
      creature.tame = true;
      notify(game, "Tamed! Your " + creature.kind + " will follow and defend you.", 3500);
    } else {
      notify(game, "Fed " + creature.kind + " (" + creature.fed + "/3).");
    }
    return;
  }
  const node = nearestNode(game, 92);
  if (node) {
    if (node.kind === "tree" && game.selected !== "axe") {
      notify(game, "Equip your Axe to chop this tree.");
      return;
    }
    if ((node.kind === "rock" || node.kind === "ore") && game.selected !== "pickaxe") {
      notify(game, "Equip your Pickaxe to mine this.");
      return;
    }
    const power =
      node.kind === "tree" && game.gear.ironAxe
        ? 2
        : (node.kind === "rock" || node.kind === "ore") && game.gear.ironPick
          ? 2
          : 1;
    node.hp -= power;
    game.player.swing = 0.24;
    if (node.hp <= 0) {
      node.respawnAt = performance.now() + 90000;
      if (node.kind === "tree") {
        game.resources.wood += 5;
        game.resources.fiber += 1;
        notify(game, "+5 wood · +1 fiber");
      }
      if (node.kind === "rock") {
        game.resources.stone += 5;
        notify(game, "+5 stone");
      }
      if (node.kind === "ore") {
        game.resources.metal += 4;
        game.resources.stone += 2;
        notify(game, "+4 metal · +2 stone");
      }
      if (node.kind === "bush") {
        game.resources.food += 3;
        game.resources.seeds += 2;
        game.resources.fiber += 2;
        notify(game, "+3 food · +2 seeds · +2 fiber");
      }
    } else {
      notify(game, (node.kind === "tree" ? "Chopping" : "Mining") + " · " + node.hp + " hits left", 900);
    }
    return;
  }
  if (game.selected === "food" && game.resources.food > 0) {
    game.resources.food -= 1;
    game.player.hunger = Math.min(100, game.player.hunger + 24);
    game.player.hp = Math.min(game.player.maxHp, game.player.hp + 5);
    notify(game, "Ate food. Hunger restored.");
    return;
  }
  notify(game, "Nothing close enough to interact with.");
}

function attack(game: GameState) {
  const now = performance.now();
  if (now < game.player.attackReady || game.dead || !game.started) return;
  const tool = activeTool(game);
  const damage =
    tool === "sword" ? 25 : tool === "spear" ? 17 : tool === "axe" ? (game.gear.ironAxe ? 14 : 9) : tool === "pickaxe" ? 7 : 3;
  const range = tool === "spear" || tool === "sword" ? 102 : 78;
  game.player.attackReady = now + (tool === "sword" ? 380 : 500);
  game.player.swing = 0.28;
  let hit = false;
  for (const creature of game.creatures) {
    if (creature.realm !== game.realm || creature.hp <= 0 || creature.tame) continue;
    const dx = creature.x - game.player.x;
    const dy = creature.y - game.player.y;
    const distance = Math.hypot(dx, dy);
    let angle = Math.atan2(dy, dx) - game.player.dir;
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    if (distance < range && Math.abs(angle) < 1.15) {
      creature.hp -= damage;
      creature.angry = true;
      creature.x += Math.cos(game.player.dir) * 22;
      creature.y += Math.sin(game.player.dir) * 22;
      hit = true;
      if (creature.hp <= 0) {
        game.kills += 1;
        if (creature.kind === "bear" || creature.kind === "boar") game.resources.food += 2;
        if (creature.kind === "brute") game.resources.metal += 1;
      }
    }
  }
  if (hit) notify(game, damage + " damage", 700);
}

function reviveNodes(game: GameState) {
  const now = performance.now();
  for (const node of game.nodes) {
    if (node.hp <= 0 && node.respawnAt < now) node.hp = node.maxHp;
  }
}

function updateCreatures(game: GameState, dt: number) {
  const now = performance.now();
  for (const creature of game.creatures) {
    if (creature.hp <= 0 || creature.realm !== game.realm) continue;
    let targetX = creature.x + Math.cos(now / 1400 + creature.phase) * 15;
    let targetY = creature.y + Math.sin(now / 1700 + creature.phase) * 15;
    let chasing = creature.kind === "shade" || creature.kind === "brute";
    const playerDistance = Math.hypot(game.player.x - creature.x, game.player.y - creature.y);
    if ((creature.kind === "bear" || creature.kind === "boar") && !creature.tame) {
      if (playerDistance < (creature.kind === "bear" ? 135 : 90) && game.selected !== "food") creature.angry = true;
      if (playerDistance > 340) creature.angry = false;
      chasing = creature.angry;
    }
    if (creature.tame) {
      const enemy = game.creatures
        .filter((other) => other.realm === game.realm && !other.tame && (other.kind === "shade" || other.kind === "brute") && other.hp > 0)
        .sort(
          (a, b) =>
            Math.hypot(a.x - creature.x, a.y - creature.y) - Math.hypot(b.x - creature.x, b.y - creature.y),
        )[0];
      if (enemy && Math.hypot(enemy.x - creature.x, enemy.y - creature.y) < 230) {
        targetX = enemy.x;
        targetY = enemy.y;
        const enemyDistance = Math.hypot(enemy.x - creature.x, enemy.y - creature.y);
        if (enemyDistance < 45 && now - creature.hitAt > 800) {
          enemy.hp -= creature.kind === "bear" ? 16 : 10;
          creature.hitAt = now;
        }
      } else {
        targetX = game.player.x - Math.cos(game.player.dir) * 65;
        targetY = game.player.y - Math.sin(game.player.dir) * 65;
      }
      chasing = true;
    } else if (chasing) {
      targetX = game.player.x;
      targetY = game.player.y;
    }
    const dx = targetX - creature.x;
    const dy = targetY - creature.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const shouldMove = chasing ? distance > (creature.tame ? 58 : 30) : true;
    if (shouldMove) {
      const pace = chasing ? creature.speed : creature.speed * 0.22;
      creature.x = Math.max(35, Math.min(WORLD_W - 35, creature.x + (dx / distance) * pace * dt));
      creature.y = Math.max(35, Math.min(WORLD_H - 35, creature.y + (dy / distance) * pace * dt));
    }
    if (chasing && !creature.tame && playerDistance < 43 && now - creature.hitAt > 850) {
      game.player.hp -= creature.damage;
      creature.hitAt = now;
      notify(game, "You took " + Math.round(creature.damage) + " damage!", 1100);
    }
    for (const building of game.buildings) {
      if (building.realm !== game.realm || building.hp <= 0) continue;
      const buildingDistance = Math.hypot(building.gx * GRID - creature.x, building.gy * GRID - creature.y);
      if (building.kind === "spikes" && buildingDistance < 42 && !creature.tame && now - creature.hitAt > 450) {
        creature.hp -= 10;
        creature.hitAt = now;
      }
      if ((creature.kind === "shade" || creature.kind === "brute") && buildingDistance < 36 && now - creature.hitAt > 800) {
        building.hp -= creature.damage;
        creature.hitAt = now;
      }
    }
  }
  game.creatures = game.creatures.filter((creature) => creature.hp > 0);
  game.buildings = game.buildings.filter((building) => building.hp > 0);
}

function updateGame(game: GameState, dt: number) {
  const beforeNight = isNight(game);
  game.clock += dt / DAY_SECONDS;
  if (game.clock >= 1) {
    game.clock -= 1;
    game.day += 1;
    game.player.hp = Math.min(game.player.maxHp, game.player.hp + 12);
    notify(game, "DAWN — Day " + game.day + ". The next night will be stronger.", 4000);
  }
  const afterNight = isNight(game);
  if (!beforeNight && afterNight) spawnNightWave(game);
  game.wasNight = afterNight;

  let dx = 0;
  let dy = 0;
  if (game.keys.has("w") || game.keys.has("arrowup")) dy -= 1;
  if (game.keys.has("s") || game.keys.has("arrowdown")) dy += 1;
  if (game.keys.has("a") || game.keys.has("arrowleft")) dx -= 1;
  if (game.keys.has("d") || game.keys.has("arrowright")) dx += 1;
  if (dx || dy) {
    const length = Math.hypot(dx, dy);
    const speed = 190;
    game.player.x = Math.max(32, Math.min(WORLD_W - 32, game.player.x + (dx / length) * speed * dt));
    game.player.y = Math.max(32, Math.min(WORLD_H - 32, game.player.y + (dy / length) * speed * dt));
    game.player.dir = Math.atan2(dy, dx);
  } else if (game.pointer.active) {
    game.player.dir = Math.atan2(game.pointer.worldY - game.player.y, game.pointer.worldX - game.player.x);
  }
  game.player.swing = Math.max(0, game.player.swing - dt);
  game.player.hunger = Math.max(0, game.player.hunger - dt * 0.5);
  if (game.player.hunger <= 0) game.player.hp -= dt * 2;
  if (game.player.hp <= 0) {
    game.player.hp = 0;
    game.dead = true;
    game.started = false;
  }
  game.camera.x += (game.player.x - game.camera.x) * Math.min(1, dt * 8);
  game.camera.y += (game.player.y - game.camera.y) * Math.min(1, dt * 8);
  for (const building of game.buildings) {
    if (building.kind === "crop") building.growth = Math.min(1, building.growth + dt / 75);
  }
  updateCreatures(game, dt);
  reviveNodes(game);
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function drawTree(ctx: CanvasRenderingContext2D, node: ResourceNode) {
  ctx.save();
  ctx.translate(node.x, node.y);
  ctx.fillStyle = "rgba(31,65,43,.2)";
  ctx.beginPath();
  ctx.ellipse(9, 21, 38, 23, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#775035";
  roundedRect(ctx, -7, -2, 14, 34, 5);
  ctx.fill();
  ctx.fillStyle = "#244f3b";
  ctx.strokeStyle = "#173b30";
  ctx.lineWidth = 5;
  const crowns = [
    [-18, -18, 25],
    [17, -16, 24],
    [0, -38, 29],
    [2, -9, 31],
  ];
  crowns.forEach(([x, y, radius], index) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = index === 2 ? "#477d4c" : index === 3 ? "#356b46" : "#2d6041";
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();
}

function drawRock(ctx: CanvasRenderingContext2D, node: ResourceNode) {
  ctx.save();
  ctx.translate(node.x, node.y);
  ctx.fillStyle = "rgba(31,65,43,.18)";
  ctx.beginPath();
  ctx.ellipse(7, 15, 30, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-28, 11);
  ctx.lineTo(-21, -15);
  ctx.lineTo(2, -25);
  ctx.lineTo(27, -8);
  ctx.lineTo(24, 16);
  ctx.lineTo(-9, 22);
  ctx.closePath();
  ctx.fillStyle = node.kind === "ore" ? "#596877" : "#718177";
  ctx.strokeStyle = node.kind === "ore" ? "#343a4b" : "#4c6259";
  ctx.lineWidth = 5;
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-18, -10);
  ctx.lineTo(1, -18);
  ctx.lineTo(10, -3);
  ctx.closePath();
  ctx.fillStyle = "#9aa99e";
  ctx.fill();
  if (node.kind === "ore") {
    ctx.fillStyle = "#e0a44c";
    for (const [x, y] of [[-10, 1], [8, 7], [14, -8]]) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawBush(ctx: CanvasRenderingContext2D, node: ResourceNode) {
  ctx.save();
  ctx.translate(node.x, node.y);
  ctx.fillStyle = "rgba(31,65,43,.18)";
  ctx.beginPath();
  ctx.ellipse(5, 14, 28, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#417b47";
  ctx.strokeStyle = "#28573a";
  ctx.lineWidth = 4;
  for (const [x, y] of [[-15, 0], [4, -8], [18, 2], [1, 9]]) {
    ctx.beginPath();
    ctx.arc(x, y, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = "#e56a57";
  for (const [x, y] of [[-12, -5], [5, -15], [17, 1], [0, 9]]) {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawTool(ctx: CanvasRenderingContext2D, tool: Tool, swing: number) {
  const angle = swing > 0 ? -0.75 : -0.22;
  ctx.save();
  ctx.translate(19, 6);
  ctx.rotate(angle);
  if (tool === "food") {
    ctx.fillStyle = "#d9574f";
    ctx.strokeStyle = "#432f2b";
    ctx.lineWidth = 3;
    for (const [x, y] of [[8, -4], [15, 1], [7, 5]]) {
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    return;
  }
  ctx.strokeStyle = "#432f2b";
  ctx.lineWidth = tool === "spear" || tool === "sword" ? 5 : 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(4, 0);
  ctx.lineTo(tool === "spear" || tool === "sword" ? 49 : 39, 0);
  ctx.stroke();
  if (tool === "axe") {
    ctx.fillStyle = "#b7c0b9";
    ctx.strokeStyle = "#32443e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, -13);
    ctx.lineTo(48, -10);
    ctx.lineTo(46, 11);
    ctx.lineTo(31, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (tool === "pickaxe") {
    ctx.strokeStyle = "#aebbb4";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(40, 0, 14, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  } else if (tool === "spear") {
    ctx.fillStyle = "#cad4ce";
    ctx.strokeStyle = "#35463f";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(58, 0);
    ctx.lineTo(44, -8);
    ctx.lineTo(44, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (tool === "sword") {
    ctx.fillStyle = "#e4ece8";
    ctx.strokeStyle = "#35463f";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(58, 0);
    ctx.lineTo(43, -6);
    ctx.lineTo(43, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, -9);
    ctx.lineTo(10, 9);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#d89b47";
    roundedRect(ctx, 28, -10, 19, 20, 4);
    ctx.fill();
  }
  ctx.restore();
}

function drawPlayer(ctx: CanvasRenderingContext2D, game: GameState) {
  const player = game.player;
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = "rgba(23,48,35,.25)";
  ctx.beginPath();
  ctx.ellipse(6, 17, 28, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(player.dir);
  drawTool(ctx, activeTool(game), player.swing);
  ctx.fillStyle = "#dfa93d";
  ctx.strokeStyle = "#203a33";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, 25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#f0be91";
  ctx.beginPath();
  ctx.arc(10, 0, 14, -Math.PI / 2, Math.PI / 2);
  ctx.fill();
  ctx.fillStyle = "#263a34";
  ctx.beginPath();
  ctx.arc(16, -5, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(16, 5, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCreature(ctx: CanvasRenderingContext2D, creature: Creature, now: number) {
  const scale = creature.kind === "brute" ? 1.28 : creature.kind === "bear" ? 1.2 : creature.kind === "boar" ? 0.92 : 1;
  ctx.save();
  ctx.translate(creature.x, creature.y + Math.sin(now / 230 + creature.phase) * 2);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(12,27,24,.23)";
  ctx.beginPath();
  ctx.ellipse(5, 14, 25, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  if (creature.kind === "bear" || creature.kind === "boar") {
    ctx.fillStyle = creature.kind === "bear" ? "#77513c" : "#9a6444";
    ctx.strokeStyle = "#3e322c";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(-14, -14, creature.kind === "bear" ? 9 : 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(14, -14, creature.kind === "bear" ? 9 : 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = creature.kind === "bear" ? "#b9825d" : "#ca8560";
    ctx.beginPath();
    ctx.ellipse(13, 3, 12, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2b2927";
    ctx.beginPath();
    ctx.arc(20, 1, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(7, -7, 2.5, 0, Math.PI * 2);
    ctx.fill();
    if (creature.tame) {
      ctx.strokeStyle = "#f1bf4f";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0.25, 2.9);
      ctx.stroke();
      ctx.fillStyle = "#ef6b67";
      ctx.font = "bold 19px Arial";
      ctx.textAlign = "center";
      ctx.fillText("♥", 0, -34);
    } else if (creature.fed > 0) {
      ctx.fillStyle = "#ef6b67";
      ctx.font = "bold 15px Arial";
      ctx.textAlign = "center";
      ctx.fillText(creature.fed + "/3", 0, -33);
    }
  } else {
    ctx.fillStyle = creature.kind === "brute" ? "#462f51" : "#27364f";
    ctx.strokeStyle = "#152136";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f36a58";
    for (const y of [-7, 7]) {
      ctx.beginPath();
      ctx.ellipse(12, y, 6, 3, -0.25, 0, Math.PI * 2);
      ctx.fill();
    }
    if (creature.kind === "brute") {
      ctx.fillStyle = "#735578";
      for (const y of [-16, 16]) {
        ctx.beginPath();
        ctx.moveTo(-12, y);
        ctx.lineTo(-25, y * 1.35);
        ctx.lineTo(-8, y * 0.7);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  if (creature.hp < creature.maxHp) {
    ctx.fillStyle = "#1d2a27";
    roundedRect(ctx, -22, -39, 44, 5, 3);
    ctx.fill();
    ctx.fillStyle = "#e45e55";
    roundedRect(ctx, -22, -39, 44 * Math.max(0, creature.hp / creature.maxHp), 5, 3);
    ctx.fill();
  }
  ctx.restore();
}

function drawBuilding(ctx: CanvasRenderingContext2D, building: Building, alpha = 1) {
  const x = building.gx * GRID;
  const y = building.gy * GRID;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  const kind = building.kind;
  if (kind === "floor") {
    ctx.fillStyle = "#b47a43";
    ctx.strokeStyle = "#6b472f";
    ctx.lineWidth = 3;
    roundedRect(ctx, -22, -22, 44, 44, 5);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(20, 0);
    ctx.moveTo(-5, -20);
    ctx.lineTo(-5, 20);
    ctx.stroke();
  } else if (kind === "roof") {
    ctx.fillStyle = "#8e543e";
    ctx.strokeStyle = "#5c382e";
    ctx.lineWidth = 4;
    roundedRect(ctx, -24, -24, 48, 48, 7);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#b56c49";
    for (let yy = -15; yy <= 15; yy += 10) {
      ctx.beginPath();
      ctx.moveTo(-19, yy);
      ctx.lineTo(19, yy);
      ctx.stroke();
    }
  } else if (kind === "woodFence" || kind === "stoneFence") {
    const stone = kind === "stoneFence";
    ctx.strokeStyle = stone ? "#687b73" : "#7c4d31";
    ctx.lineWidth = stone ? 11 : 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-24, -9);
    ctx.lineTo(24, -9);
    ctx.moveTo(-24, 11);
    ctx.lineTo(24, 11);
    ctx.stroke();
    ctx.fillStyle = stone ? "#8d9b94" : "#a96d3e";
    for (const xx of [-20, 0, 20]) {
      roundedRect(ctx, xx - 5, -22, 10, 44, 4);
      ctx.fill();
    }
  } else if (kind === "woodGate" || kind === "stoneGate") {
    const stone = kind === "stoneGate";
    ctx.fillStyle = stone ? "#8d9b94" : "#a96d3e";
    for (const xx of [-21, 21]) {
      roundedRect(ctx, xx - 6, -24, 12, 48, 4);
      ctx.fill();
    }
    ctx.save();
    ctx.translate(-16, 0);
    ctx.rotate(building.open ? -1.25 : 0);
    ctx.strokeStyle = stone ? "#687b73" : "#75482f";
    ctx.lineWidth = stone ? 10 : 7;
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(32, -11);
    ctx.moveTo(0, 11);
    ctx.lineTo(32, 11);
    ctx.stroke();
    ctx.restore();
  } else if (kind === "wall") {
    ctx.fillStyle = "#875738";
    ctx.strokeStyle = "#583b2c";
    ctx.lineWidth = 4;
    roundedRect(ctx, -23, -23, 46, 46, 5);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#b77a45";
    ctx.lineWidth = 5;
    for (const yy of [-13, 0, 13]) {
      ctx.beginPath();
      ctx.moveTo(-18, yy);
      ctx.lineTo(18, yy);
      ctx.stroke();
    }
  } else if (kind === "door") {
    ctx.fillStyle = "#68422f";
    ctx.strokeStyle = "#432d25";
    ctx.lineWidth = 5;
    roundedRect(ctx, -20, -24, 40, 48, 5);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#a96d3e";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-15, -10);
    ctx.lineTo(15, -10);
    ctx.moveTo(-15, 5);
    ctx.lineTo(15, 5);
    ctx.stroke();
    ctx.fillStyle = "#e6b24a";
    ctx.beginPath();
    ctx.arc(10, 3, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "spikes") {
    ctx.fillStyle = "#a9b4ae";
    ctx.strokeStyle = "#43544e";
    ctx.lineWidth = 3;
    for (const [xx, yy] of [[-14, -12], [5, -14], [14, 5], [-7, 10]]) {
      ctx.beginPath();
      ctx.moveTo(xx, yy - 15);
      ctx.lineTo(xx - 8, yy + 10);
      ctx.lineTo(xx + 8, yy + 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else if (kind === "crop") {
    ctx.fillStyle = "#795039";
    ctx.strokeStyle = "#50382e";
    ctx.lineWidth = 4;
    roundedRect(ctx, -22, -22, 44, 44, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#8c633f";
    roundedRect(ctx, -16, -16, 32, 32, 4);
    ctx.fill();
    const height = 7 + building.growth * 14;
    ctx.strokeStyle = "#4c803e";
    ctx.lineWidth = 4;
    for (const xx of [-9, 0, 9]) {
      ctx.beginPath();
      ctx.moveTo(xx, 12);
      ctx.lineTo(xx, 12 - height);
      ctx.stroke();
      if (building.growth > 0.6) {
        ctx.fillStyle = "#dda641";
        ctx.beginPath();
        ctx.arc(xx, 10 - height, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

function drawCave(ctx: CanvasRenderingContext2D, x: number, y: number, exit: boolean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(27,39,34,.25)";
  ctx.beginPath();
  ctx.ellipse(5, 29, 63, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#65746c";
  ctx.strokeStyle = "#3b4c45";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(0, 12, 53, Math.PI, 0);
  ctx.lineTo(51, 35);
  ctx.lineTo(-51, 35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#172321";
  ctx.beginPath();
  ctx.arc(0, 21, 32, Math.PI, 0);
  ctx.lineTo(31, 37);
  ctx.lineTo(-31, 37);
  ctx.closePath();
  ctx.fill();
  if (exit) {
    ctx.fillStyle = "#d4b256";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.fillText("EXIT", 0, -51);
  }
  ctx.restore();
}

function drawWorld(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, game: GameState) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const cave = game.realm === "cave";
  ctx.fillStyle = cave ? "#34423d" : "#89bd63";
  ctx.fillRect(0, 0, width, height);
  const scale = game.zoom;
  const offsetX = width / 2 - game.camera.x * scale;
  const offsetY = height / 2 - game.camera.y * scale;
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  ctx.fillStyle = cave ? "#3b4944" : "#91c66b";
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  for (let i = 0; i < 180; i++) {
    const x = seeded(i, cave ? 31 : 21) * WORLD_W;
    const y = seeded(i, cave ? 32 : 22) * WORLD_H;
    ctx.fillStyle = cave ? (i % 2 ? "#45534e" : "#2f3d38") : i % 2 ? "#7eb35b" : "#a3cf7b";
    ctx.beginPath();
    ctx.arc(x, y, 2 + seeded(i, 4) * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  if (game.buildMode) {
    ctx.strokeStyle = cave ? "rgba(192,210,201,.13)" : "rgba(47,89,60,.15)";
    ctx.lineWidth = 1;
    const left = Math.max(0, Math.floor((game.camera.x - width / (2 * scale)) / GRID) * GRID);
    const right = Math.min(WORLD_W, game.camera.x + width / (2 * scale));
    const top = Math.max(0, Math.floor((game.camera.y - height / (2 * scale)) / GRID) * GRID);
    const bottom = Math.min(WORLD_H, game.camera.y + height / (2 * scale));
    for (let x = left; x <= right; x += GRID) {
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
    }
    for (let y = top; y <= bottom; y += GRID) {
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }
  }
  if (!cave) drawCave(ctx, 1850, 280, false);
  else drawCave(ctx, 180, 180, true);

  const visibleBuildings = game.buildings.filter((building) => building.realm === game.realm);
  visibleBuildings.filter((building) => building.kind === "floor").forEach((building) => drawBuilding(ctx, building));

  const drawables: { y: number; draw: () => void }[] = [];
  game.nodes.forEach((node) => {
    if (node.realm !== game.realm || node.hp <= 0) return;
    drawables.push({
      y: node.y,
      draw: () => {
        if (node.kind === "tree") drawTree(ctx, node);
        else if (node.kind === "bush") drawBush(ctx, node);
        else drawRock(ctx, node);
      },
    });
  });
  visibleBuildings
    .filter((building) => building.kind !== "floor" && building.kind !== "roof")
    .forEach((building) => drawables.push({ y: building.gy * GRID, draw: () => drawBuilding(ctx, building) }));
  game.creatures.forEach((creature) => {
    if (creature.realm === game.realm && creature.hp > 0) {
      drawables.push({ y: creature.y, draw: () => drawCreature(ctx, creature, performance.now()) });
    }
  });
  drawables.push({ y: game.player.y, draw: () => drawPlayer(ctx, game) });
  drawables.sort((a, b) => a.y - b.y).forEach((item) => item.draw());
  visibleBuildings.filter((building) => building.kind === "roof").forEach((building) => drawBuilding(ctx, building, 0.78));

  if (game.buildMode) {
    const cell = previewCell(game);
    const valid = validPlacement(game, game.buildMode, cell.gx, cell.gy) && game.kits[game.buildMode] > 0;
    ctx.fillStyle = valid ? "rgba(87,210,113,.24)" : "rgba(230,83,73,.26)";
    ctx.strokeStyle = valid ? "#69db7c" : "#ef6258";
    ctx.lineWidth = 3;
    ctx.fillRect(cell.gx * GRID - 23, cell.gy * GRID - 23, 46, 46);
    ctx.strokeRect(cell.gx * GRID - 23, cell.gy * GRID - 23, 46, 46);
    drawBuilding(
      ctx,
      {
        id: -1,
        kind: game.buildMode,
        realm: game.realm,
        gx: cell.gx,
        gy: cell.gy,
        hp: 1,
        maxHp: 1,
        open: false,
        growth: 0.5,
      },
      0.62,
    );
  }
  ctx.restore();

  const px = width / 2 + (game.player.x - game.camera.x) * scale;
  const py = height / 2 + (game.player.y - game.camera.y) * scale;
  if (isNight(game) || cave) {
    const darkness = cave ? 0.82 : 0.72;
    const lightRadius = cave ? 230 : 300;
    const gradient = ctx.createRadialGradient(px, py, 45, px, py, lightRadius);
    gradient.addColorStop(0, "rgba(10,18,34,0)");
    gradient.addColorStop(0.45, "rgba(10,18,34,.08)");
    gradient.addColorStop(1, "rgba(7,13,31," + darkness + ")");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  } else if (game.clock > 0.4) {
    ctx.fillStyle = "rgba(210,126,68," + ((game.clock - 0.4) * 0.9) + ")";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.strokeStyle = "rgba(255,255,255,.07)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
}

function nearbyPrompt(game: GameState) {
  if (game.buildMode) return "E · Place " + BUILD_DATA[game.buildMode].name + " on grid";
  const caveX = game.realm === "meadow" ? 1850 : 180;
  const caveY = game.realm === "meadow" ? 280 : 180;
  if (Math.hypot(game.player.x - caveX, game.player.y - caveY) < 110) {
    return "E · " + (game.realm === "meadow" ? "Enter cave" : "Exit cave");
  }
  const building = game.buildings.find(
    (item) =>
      item.realm === game.realm &&
      ["woodGate", "stoneGate", "door", "crop"].includes(item.kind) &&
      Math.hypot(item.gx * GRID - game.player.x, item.gy * GRID - game.player.y) < 82,
  );
  if (building) {
    if (building.kind === "crop") return "E · " + (building.growth >= 1 ? "Harvest crop" : "Check crop");
    return "E · " + (building.open ? "Close" : "Open") + " " + BUILD_DATA[building.kind].name;
  }
  const creature = nearestCreature(game, 92);
  if (creature && (creature.kind === "bear" || creature.kind === "boar") && !creature.tame) {
    return "E · Feed " + creature.kind + " with Food (" + creature.fed + "/3)";
  }
  const node = nearestNode(game, 92);
  if (node) {
    if (node.kind === "tree") return "E · Chop tree with Axe";
    if (node.kind === "rock") return "E · Mine stone with Pickaxe";
    if (node.kind === "ore") return "E · Mine metal ore with Pickaxe";
    return "E · Gather berry bush";
  }
  if (game.selected === "food") return "E · Eat food";
  return "";
}

const CRAFT_RECIPES: Recipe[] = [
  {
    id: "spear",
    name: "Stone Spear",
    detail: "Long reach · 17 damage",
    cost: { wood: 5, stone: 3 },
    action: (game) => {
      game.gear.spear = true;
      game.weapon = "spear";
      game.selected = "spear";
    },
  },
  {
    id: "sword",
    name: "Iron Sword",
    detail: "Fast swing · 25 damage",
    cost: { wood: 4, metal: 7 },
    action: (game) => {
      game.gear.sword = true;
      game.weapon = "sword";
      game.selected = "spear";
    },
  },
  {
    id: "ironAxe",
    name: "Iron Axe",
    detail: "Chops twice as fast",
    cost: { wood: 4, metal: 5 },
    action: (game) => {
      game.gear.ironAxe = true;
      game.selected = "axe";
    },
  },
  {
    id: "ironPick",
    name: "Iron Pickaxe",
    detail: "Mines twice as fast",
    cost: { wood: 4, metal: 5 },
    action: (game) => {
      game.gear.ironPick = true;
      game.selected = "pickaxe";
    },
  },
  {
    id: "bandage",
    name: "Field Bandage",
    detail: "Restore 35 health",
    cost: { fiber: 5, food: 1 },
    action: (game) => {
      game.player.hp = Math.min(game.player.maxHp, game.player.hp + 35);
    },
  },
];

function ToolGlyph({ type }: { type: Tool | "pack" }) {
  return (
    <span className={"tool-glyph tool-" + type} aria-hidden="true">
      <i />
      <b />
    </span>
  );
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameState>(makeGame());
  const [panel, setPanel] = useState<Panel>(null);
  const [started, setStarted] = useState(false);
  const [revision, setRevision] = useState(0);
  const game = gameRef.current;
  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    let frame = 0;
    let last = performance.now();
    let lastHud = last;
    const loop = (now: number) => {
      const dt = Math.min(0.035, (now - last) / 1000);
      last = now;
      if (game.started && !game.dead) updateGame(game, dt);
      drawWorld(context, canvas, game);
      if (now - lastHud > 120) {
        lastHud = now;
        refresh();
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [game, refresh]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
        event.preventDefault();
        game.keys.add(key);
      }
      if (event.repeat) return;
      if (key === "e") interact(game);
      if (key === " " || key === "f") {
        event.preventDefault();
        attack(game);
      }
      if (["1", "2", "3", "4"].includes(key)) selectSlot(game, Number(key));
      if (key === "q") setPanel((value) => (value === "build" ? null : "build"));
      if (key === "c") setPanel((value) => (value === "craft" ? null : "craft"));
      if (key === "i" || key === "b") setPanel((value) => (value === "inventory" ? null : "inventory"));
      if (key === "escape") {
        game.buildMode = null;
        setPanel(null);
      }
      if (key === "=" || key === "+") game.zoom = Math.min(1.55, game.zoom + 0.1);
      if (key === "-") game.zoom = Math.max(0.68, game.zoom - 0.1);
      refresh();
    };
    const up = (event: KeyboardEvent) => game.keys.delete(event.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [game, refresh]);

  const start = () => {
    game.started = true;
    game.dead = false;
    setStarted(true);
    canvasRef.current?.focus();
    notify(game, "Day 1 — gather supplies and build before night.");
    refresh();
  };

  const restart = () => {
    gameRef.current = makeGame();
    window.location.reload();
  };

  const pointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    game.pointer.x = x;
    game.pointer.y = y;
    game.pointer.worldX = game.camera.x + (x - rect.width / 2) / game.zoom;
    game.pointer.worldY = game.camera.y + (y - rect.height / 2) / game.zoom;
    game.pointer.active = true;
  };

  const craft = (recipe: Recipe) => {
    if (!canAfford(game, recipe.cost)) {
      notify(game, "Not enough materials for " + recipe.name + ".");
      refresh();
      return;
    }
    if (
      (recipe.id === "spear" && game.gear.spear) ||
      (recipe.id === "sword" && game.gear.sword) ||
      (recipe.id === "ironAxe" && game.gear.ironAxe) ||
      (recipe.id === "ironPick" && game.gear.ironPick)
    ) {
      notify(game, recipe.name + " already crafted.");
      return;
    }
    pay(game, recipe.cost);
    recipe.action(game);
    notify(game, "Crafted " + recipe.name + ".");
    refresh();
  };

  const chooseBuild = (kind: BuildKind) => {
    if (game.kits[kind] <= 0) {
      const data = BUILD_DATA[kind];
      if (!canAfford(game, data.cost)) {
        notify(game, "Not enough materials for " + data.name + ".");
        refresh();
        return;
      }
      pay(game, data.cost);
      game.kits[kind] += data.makes;
    }
    game.buildMode = kind;
    game.selected = "build";
    setPanel(null);
    notify(game, BUILD_DATA[kind].name + " selected — aim at the grid and press E.");
    refresh();
    canvasRef.current?.focus();
  };

  const zoom = (amount: number) => {
    game.zoom = Math.max(0.68, Math.min(1.55, game.zoom + amount));
    refresh();
  };

  const holdMove = (key: string, active: boolean) => {
    if (active) game.keys.add(key);
    else game.keys.delete(key);
  };

  const toolName =
    game.selected === "spear"
      ? game.weapon === "sword" && game.gear.sword
        ? "Iron Sword"
        : "Stone Spear"
      : game.selected === "pickaxe"
        ? game.gear.ironPick
          ? "Iron Pickaxe"
          : "Stone Pickaxe"
        : game.selected === "axe"
          ? game.gear.ironAxe
            ? "Iron Axe"
            : "Stone Axe"
          : game.selected === "food"
            ? "Food"
            : game.buildMode
              ? BUILD_DATA[game.buildMode].name
              : "Build";
  const prompt = nearbyPrompt(game);
  const messageVisible = performance.now() < game.messageUntil;
  const phase = isNight(game) ? "NIGHT" : "DAY";

  return (
    <main className="survival-game" data-revision={revision}>
      <canvas
        ref={canvasRef}
        className="world-canvas"
        tabIndex={0}
        aria-label="Halflight game world"
        onPointerMove={pointerMove}
        onPointerLeave={() => {
          game.pointer.active = false;
        }}
        onPointerDown={(event) => {
          if (event.button === 0 && game.buildMode) placeBuild(game);
          else if (event.button === 0) attack(game);
          refresh();
        }}
        onWheel={(event) => {
          event.preventDefault();
          zoom(event.deltaY > 0 ? -0.08 : 0.08);
        }}
      />

      <div className="top-hud">
        <section className="cycle-panel" aria-label={"Day " + game.day + ", " + phase.toLowerCase()}>
          <div className="day-count"><small>CURRENT</small><strong>DAY {String(game.day).padStart(2, "0")}</strong></div>
          <div className="cycle-dial">
            <span className="sun-symbol">●</span>
            <span className="moon-symbol">☾</span>
            <i style={{ transform: "rotate(" + game.clock * 360 + "deg)" }} />
            <b />
          </div>
          <div className={"phase-chip " + phase.toLowerCase()}>{phase}</div>
        </section>

        <div className="brand-pill"><span>H</span><strong>HALFLIGHT</strong><small>{game.realm === "cave" ? "THE CAVES" : "THE MEADOW"}</small></div>

        <section className="resource-strip" aria-label="Resources">
          {MATERIALS.slice(0, 5).map((material) => (
            <div key={material.id} title={material.name}>
              <span className={"resource-mark mark-" + material.id}>{material.icon}</span>
              <b>{game.resources[material.id]}</b>
              <small>{material.name}</small>
            </div>
          ))}
          <button onClick={() => setPanel("inventory")} aria-label="Open inventory">Inventory <kbd>I</kbd></button>
        </section>
      </div>

      <section className="vitals" aria-label="Player status">
        <div className="vital-row"><span>HEALTH</span><b>{Math.ceil(game.player.hp)}</b><i><em style={{ width: game.player.hp + "%" }} /></i></div>
        <div className="vital-row hunger"><span>HUNGER</span><b>{Math.ceil(game.player.hunger)}</b><i><em style={{ width: game.player.hunger + "%" }} /></i></div>
        <small>{game.kills} threats defeated · wave {game.wave || "—"}</small>
      </section>

      <section className="zoom-panel" aria-label="Camera zoom">
        <button onClick={() => zoom(0.12)} aria-label="Zoom in">+</button>
        <span>{Math.round(game.zoom * 100)}%</span>
        <button onClick={() => zoom(-0.12)} aria-label="Zoom out">−</button>
      </section>

      {messageVisible && <div className="game-toast">{game.message}</div>}
      {prompt && <div className="interact-prompt"><kbd>E</kbd><span>{prompt.replace("E · ", "")}</span></div>}
      {game.buildMode && <div className="build-mode-banner"><b>GRID BUILD</b><span>{BUILD_DATA[game.buildMode].name} · {game.kits[game.buildMode]} ready</span><button onClick={() => { game.buildMode = null; game.selected = "axe"; refresh(); }}>Cancel <kbd>Esc</kbd></button></div>}

      <nav className="hotbar" aria-label="Equipment hotbar">
        <button className={game.selected === "axe" ? "selected" : ""} onClick={() => { selectSlot(game, 1); refresh(); }}>
          <kbd>1</kbd><ToolGlyph type="axe" /><span>{game.gear.ironAxe ? "Iron Axe" : "Axe"}</span>
        </button>
        <button className={game.selected === "pickaxe" ? "selected" : ""} onClick={() => { selectSlot(game, 2); refresh(); }}>
          <kbd>2</kbd><ToolGlyph type="pickaxe" /><span>{game.gear.ironPick ? "Iron Pick" : "Pickaxe"}</span>
        </button>
        <button className={game.selected === "spear" ? "selected" : ""} data-locked={!game.gear.spear && !game.gear.sword} onClick={() => { selectSlot(game, 3); refresh(); }}>
          <kbd>3</kbd><ToolGlyph type={game.gear.sword ? "sword" : "spear"} /><span>{game.gear.sword ? "Sword" : game.gear.spear ? "Spear" : "Weapon"}</span>
        </button>
        <button className={game.selected === "food" ? "selected" : ""} onClick={() => { selectSlot(game, 4); refresh(); }}>
          <kbd>4</kbd><ToolGlyph type="food" /><span>Food · {game.resources.food}</span>
        </button>
        <button className={game.selected === "build" ? "selected" : ""} onClick={() => setPanel("build")}>
          <kbd>Q</kbd><ToolGlyph type="build" /><span>Build</span>
        </button>
        <button onClick={() => setPanel("inventory")}>
          <kbd>I</kbd><ToolGlyph type="pack" /><span>Backpack</span>
        </button>
        <div className="equipped-label"><small>EQUIPPED</small><strong>{toolName}</strong></div>
      </nav>

      <aside className="key-guide">
        <span><kbd>WASD</kbd> Move</span>
        <span><kbd>E</kbd> Interact</span>
        <span><kbd>SPACE</kbd> Attack</span>
        <span><kbd>C</kbd> Craft</span>
      </aside>

      <div className="touch-controls" aria-label="Touch controls">
        <div className="touch-dpad">
          <button
            className="up"
            onPointerDown={() => holdMove("w", true)}
            onPointerUp={() => holdMove("w", false)}
            onPointerLeave={() => holdMove("w", false)}
            aria-label="Move up"
          >↑</button>
          <button
            className="left"
            onPointerDown={() => holdMove("a", true)}
            onPointerUp={() => holdMove("a", false)}
            onPointerLeave={() => holdMove("a", false)}
            aria-label="Move left"
          >←</button>
          <button
            className="right"
            onPointerDown={() => holdMove("d", true)}
            onPointerUp={() => holdMove("d", false)}
            onPointerLeave={() => holdMove("d", false)}
            aria-label="Move right"
          >→</button>
          <button
            className="down"
            onPointerDown={() => holdMove("s", true)}
            onPointerUp={() => holdMove("s", false)}
            onPointerLeave={() => holdMove("s", false)}
            aria-label="Move down"
          >↓</button>
        </div>
        <button className="touch-e" onClick={() => { interact(game); refresh(); }}>E<small>Interact</small></button>
        <button className="touch-attack" onClick={() => { attack(game); refresh(); }}>Attack</button>
      </div>

      {panel && (
        <div className="panel-scrim" onPointerDown={() => setPanel(null)}>
          <aside className="game-panel" onPointerDown={(event) => event.stopPropagation()}>
            <header>
              <div><small>SURVIVAL KIT</small><h2>{panel === "inventory" ? "Backpack" : panel === "craft" ? "Crafting Bench" : "Grid Building"}</h2></div>
              <button onClick={() => setPanel(null)} aria-label="Close panel">×</button>
            </header>
            <nav className="panel-tabs">
              <button className={panel === "inventory" ? "active" : ""} onClick={() => setPanel("inventory")}>Inventory <kbd>I</kbd></button>
              <button className={panel === "craft" ? "active" : ""} onClick={() => setPanel("craft")}>Craft <kbd>C</kbd></button>
              <button className={panel === "build" ? "active" : ""} onClick={() => setPanel("build")}>Build <kbd>Q</kbd></button>
            </nav>
            <div className="panel-content">
              {panel === "inventory" && (
                <>
                  <h3>Resources</h3>
                  <div className="inventory-grid">
                    {MATERIALS.map((material) => (
                      <div key={material.id}><span className={"resource-mark mark-" + material.id}>{material.icon}</span><b>{game.resources[material.id]}</b><small>{material.name}</small></div>
                    ))}
                  </div>
                  <h3>Equipment</h3>
                  <div className="equipment-list">
                    <div><ToolGlyph type="axe" /><span><b>{game.gear.ironAxe ? "Iron Axe" : "Stone Axe"}</b><small>Equipped with key 1</small></span><em>READY</em></div>
                    <div><ToolGlyph type="pickaxe" /><span><b>{game.gear.ironPick ? "Iron Pickaxe" : "Stone Pickaxe"}</b><small>Equipped with key 2</small></span><em>READY</em></div>
                    <div><ToolGlyph type={game.gear.sword ? "sword" : "spear"} /><span><b>{game.gear.sword ? "Iron Sword" : game.gear.spear ? "Stone Spear" : "Weapon slot"}</b><small>{game.gear.spear || game.gear.sword ? "Equipped with key 3" : "Craft a weapon first"}</small></span><em>{game.gear.spear || game.gear.sword ? "READY" : "EMPTY"}</em></div>
                  </div>
                  <div className="taming-tip"><span>♥</span><div><b>Taming animals</b><p>Equip Food, approach a bear or boar, then press E. Feed it three times and it will follow you and fight night creatures.</p></div></div>
                </>
              )}
              {panel === "craft" && (
                <>
                  <p className="panel-intro">Turn gathered stone and cave metal into better tools and weapons.</p>
                  <div className="recipe-list">
                    {CRAFT_RECIPES.map((recipe) => {
                      const owned =
                        (recipe.id === "spear" && game.gear.spear) ||
                        (recipe.id === "sword" && game.gear.sword) ||
                        (recipe.id === "ironAxe" && game.gear.ironAxe) ||
                        (recipe.id === "ironPick" && game.gear.ironPick);
                      return (
                        <article key={recipe.id}>
                          <div className="recipe-badge">{recipe.name.slice(0, 2).toUpperCase()}</div>
                          <div><h3>{recipe.name}</h3><p>{recipe.detail}</p><small>{costLabel(recipe.cost)}</small></div>
                          <button disabled={!canAfford(game, recipe.cost) || owned} onClick={() => craft(recipe)}>{owned ? "Owned" : "Craft"}</button>
                        </article>
                      );
                    })}
                  </div>
                </>
              )}
              {panel === "build" && (
                <>
                  <p className="panel-intro">Everything snaps to a 48px grid. Craft or select a piece, aim near your character, then press E to place it.</p>
                  <div className="build-grid">
                    {BUILD_ORDER.map((kind) => {
                      const data = BUILD_DATA[kind];
                      return (
                        <article key={kind}>
                          <div className={"build-badge build-" + kind}>{data.icon}</div>
                          <div><h3>{data.name}</h3><p>{data.detail}</p><small>{costLabel(data.cost)}</small></div>
                          <footer><span>{game.kits[kind]} ready</span><button disabled={game.kits[kind] <= 0 && !canAfford(game, data.cost)} onClick={() => chooseBuild(kind)}>{game.kits[kind] > 0 ? "Place" : "Craft + place"}</button></footer>
                        </article>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      )}

      {!started && !game.dead && (
        <section className="start-card">
          <div className="start-mark"><span>H</span></div>
          <small>DAYLIGHT IS BORROWED</small>
          <h1>HALFLIGHT</h1>
          <p>Gather by day. Build on the grid. Survive creatures that grow stronger every night.</p>
          <button onClick={start}>Begin survival <span>→</span></button>
          <div><span><kbd>WASD</kbd> Move</span><span><kbd>E</kbd> Main interact</span><span><kbd>SPACE</kbd> Attack</span></div>
        </section>
      )}

      {game.dead && (
        <section className="start-card death-card">
          <small>THE DARK TOOK HOLD</small>
          <h1>Night {game.day}</h1>
          <p>You defeated {game.kills} threats and survived to day {game.day}. Rebuild smarter next time.</p>
          <button onClick={restart}>Try again <span>↻</span></button>
        </section>
      )}
    </main>
  );
}

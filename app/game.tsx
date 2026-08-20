"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CaveRealm = "graniteCave" | "ironCave" | "sulfurCave";
type Realm = "meadow" | CaveRealm;
type ResourceKind =
  | "oak"
  | "pine"
  | "birch"
  | "rock"
  | "granite"
  | "ironOre"
  | "copperOre"
  | "coal"
  | "sulfur"
  | "aetherOre"
  | "berryBush"
  | "grass"
  | "mushroom";
type FoodMaterial = "berries" | "mushrooms" | "meat";
type Tool = "axe" | "pickaxe" | "spear" | "sword" | "bow" | "pistol" | FoodMaterial | "build" | "hands";
type ToolTier = "none" | "wood" | "stone" | "iron" | "aetherium";
type BuildKind =
  | "craftingBench"
  | "woodFence"
  | "stoneFence"
  | "woodGate"
  | "stoneGate"
  | "floor"
  | "woodWall"
  | "stoneWall"
  | "metalWall"
  | "door"
  | "roof"
  | "spikes"
  | "snare"
  | "fireTrap"
  | "turret"
  | "crop";

type Material =
  | "wood"
  | "stone"
  | "granite"
  | "iron"
  | "copper"
  | "coal"
  | "sulfur"
  | "aetherium"
  | "fiber"
  | "berries"
  | "meat"
  | "mushrooms"
  | "seeds"
  | "hide"
  | "arrows"
  | "bullets";
type AnimalKind = "bear" | "boar" | "deer" | "rabbit" | "fox" | "wolf";
type MonsterKind = "shade" | "crawler" | "brute" | "wraith" | "maw";
type CreatureKind = MonsterKind | AnimalKind;
type ArmorKind = "none" | "copper" | "iron" | "blacksteel";
type InventoryItem = Tool | BuildKind | Material;
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
  kind: CreatureKind;
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
  slowUntil: number;
  rewarded: boolean;
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
  triggerAt: number;
}

interface Projectile {
  id: number;
  kind: "arrow" | "bullet";
  realm: Realm;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  damage: number;
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
  useReady: number;
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
  gear: {
    spear: boolean;
    sword: boolean;
    bow: boolean;
    pistol: boolean;
    axeTier: ToolTier;
    pickaxeTier: ToolTier;
    armor: ArmorKind;
  };
  kits: Record<BuildKind, number>;
  selected: Tool;
  selectedSlot: number;
  weapon: "spear" | "sword" | "bow" | "pistol";
  inventory: (InventoryItem | null)[];
  hotbar: (InventoryItem | null)[];
  buildMode: BuildKind | null;
  nodes: ResourceNode[];
  creatures: Creature[];
  buildings: Building[];
  projectiles: Projectile[];
  keys: Set<string>;
  mouseHeld: boolean;
  buildDrag: boolean;
  lastBuildCell: string | null;
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
  requiresBench?: boolean;
  owned?: (game: GameState) => boolean;
  action: (game: GameState) => void;
}

const WORLD_W = 5200;
const WORLD_H = 3800;
const GRID = 48;
const DAY_SECONDS = 110;
const SPAWN_X = 2780;
const SPAWN_Y = 1940;
const CAVE_EXIT_X = 180;
const CAVE_EXIT_Y = 180;
const FOREST_X = 1320;
const FOREST_Y = 2080;
const FOREST_RX = 1120;
const FOREST_RY = 1500;

interface CaveDefinition {
  realm: CaveRealm;
  name: string;
  entranceX: number;
  entranceY: number;
  ground: string;
  textureA: string;
  textureB: string;
}

const CAVES: CaveDefinition[] = [
  {
    realm: "graniteCave",
    name: "Granite Hollow",
    entranceX: 4720,
    entranceY: 480,
    ground: "#444f4a",
    textureA: "#52605a",
    textureB: "#35423d",
  },
  {
    realm: "ironCave",
    name: "Iron Delve",
    entranceX: 4420,
    entranceY: 3260,
    ground: "#494b4b",
    textureA: "#5a5c5b",
    textureB: "#393c3c",
  },
  {
    realm: "sulfurCave",
    name: "Sulfur Grotto",
    entranceX: 650,
    entranceY: 470,
    ground: "#4d4d39",
    textureA: "#626044",
    textureB: "#3d3e31",
  },
];

const MATERIALS: { id: Material; name: string; icon: string }[] = [
  { id: "wood", name: "Wood", icon: "W" },
  { id: "stone", name: "Stone", icon: "S" },
  { id: "granite", name: "Granite", icon: "G" },
  { id: "iron", name: "Iron", icon: "Fe" },
  { id: "copper", name: "Copper", icon: "Cu" },
  { id: "coal", name: "Coal", icon: "C" },
  { id: "sulfur", name: "Sulfur", icon: "Su" },
  { id: "aetherium", name: "Aetherium", icon: "Ae" },
  { id: "fiber", name: "Fiber", icon: "F" },
  { id: "berries", name: "Berries", icon: "●" },
  { id: "meat", name: "Meat", icon: "M" },
  { id: "mushrooms", name: "Mushrooms", icon: "Mu" },
  { id: "seeds", name: "Seeds", icon: "✦" },
  { id: "hide", name: "Hide", icon: "H" },
  { id: "arrows", name: "Arrows", icon: "↑" },
  { id: "bullets", name: "Bullets", icon: "•" },
];

const BUILD_DATA: Record<
  BuildKind,
  { name: string; detail: string; icon: string; cost: Partial<Record<Material, number>>; makes: number; hp: number }
> = {
  craftingBench: { name: "Crafting Bench", detail: "Unlocks advanced crafting nearby", icon: "CB", cost: { wood: 4, stone: 2 }, makes: 1, hp: 85 },
  woodFence: { name: "Wood Fence", detail: "A quick timber barrier", icon: "WF", cost: { wood: 3 }, makes: 2, hp: 55 },
  stoneFence: { name: "Stone Fence", detail: "Slow, sturdy protection", icon: "SF", cost: { stone: 4 }, makes: 2, hp: 105 },
  woodGate: { name: "Wood Gate", detail: "Opens with E", icon: "WG", cost: { wood: 5 }, makes: 1, hp: 70 },
  stoneGate: { name: "Granite Gate", detail: "Reinforced entrance", icon: "GG", cost: { granite: 5, iron: 1 }, makes: 1, hp: 130 },
  floor: { name: "Wood Floor", detail: "Snaps beneath structures", icon: "FL", cost: { wood: 2 }, makes: 2, hp: 45 },
  woodWall: { name: "Wood Wall", detail: "Basic shelter wall", icon: "WW", cost: { wood: 4 }, makes: 2, hp: 90 },
  stoneWall: { name: "Stone Wall", detail: "Strong masonry wall", icon: "SW", cost: { stone: 5, granite: 2 }, makes: 2, hp: 155 },
  metalWall: { name: "Metal Wall", detail: "Heavy end-game barrier", icon: "MW", cost: { iron: 6, coal: 1 }, makes: 2, hp: 235 },
  door: { name: "House Door", detail: "A doorway for your shelter", icon: "DR", cost: { wood: 4, iron: 1 }, makes: 1, hp: 90 },
  roof: { name: "Roof", detail: "Shelter from the dark", icon: "RF", cost: { wood: 4, fiber: 2 }, makes: 1, hp: 75 },
  spikes: { name: "Spike Trap", detail: "Fast close-range damage", icon: "SP", cost: { wood: 4, iron: 2 }, makes: 1, hp: 60 },
  snare: { name: "Wire Snare", detail: "Hurts and slows monsters", icon: "SN", cost: { fiber: 5, copper: 2 }, makes: 2, hp: 45 },
  fireTrap: { name: "Fire Trap", detail: "Burns a wide area", icon: "FT", cost: { stone: 4, coal: 3, sulfur: 2 }, makes: 1, hp: 70 },
  turret: { name: "Scrap Turret", detail: "Automatically shoots monsters", icon: "TU", cost: { wood: 6, iron: 7, copper: 5 }, makes: 1, hp: 95 },
  crop: { name: "Crop Plot", detail: "Grows berries over time", icon: "CP", cost: { wood: 2, fiber: 2, seeds: 1 }, makes: 1, hp: 45 },
};

const BUILD_ORDER: BuildKind[] = [
  "craftingBench",
  "woodFence",
  "stoneFence",
  "woodGate",
  "stoneGate",
  "floor",
  "woodWall",
  "stoneWall",
  "metalWall",
  "door",
  "roof",
  "spikes",
  "snare",
  "fireTrap",
  "turret",
  "crop",
];

const ANIMAL_KINDS: AnimalKind[] = ["bear", "boar", "deer", "rabbit", "fox", "wolf"];
const MONSTER_KINDS: MonsterKind[] = ["shade", "crawler", "brute", "wraith", "maw"];

const ITEM_LABELS: Partial<Record<InventoryItem, string>> = {
  axe: "Axe",
  pickaxe: "Pickaxe",
  spear: "Stone Spear",
  sword: "Iron Sword",
  bow: "Hunting Bow",
  pistol: "Scrap Pistol",
  wood: "Wood",
  stone: "Stone",
  granite: "Granite",
  iron: "Iron",
  copper: "Copper",
  coal: "Coal",
  sulfur: "Sulfur",
  aetherium: "Aetherium",
  fiber: "Fiber",
  berries: "Berries",
  meat: "Meat",
  mushrooms: "Mushrooms",
  seeds: "Seeds",
  hide: "Hide",
  arrows: "Arrows",
  bullets: "Bullets",
};

function isAnimal(kind: CreatureKind): kind is AnimalKind {
  return ANIMAL_KINDS.includes(kind as AnimalKind);
}

function isMonster(kind: CreatureKind): kind is MonsterKind {
  return MONSTER_KINDS.includes(kind as MonsterKind);
}

function isBuildKind(item: InventoryItem): item is BuildKind {
  return BUILD_ORDER.includes(item as BuildKind);
}

function isMaterial(item: InventoryItem): item is Material {
  return MATERIALS.some((material) => material.id === item);
}

const TOOL_TIER_NAMES: Record<ToolTier, string> = {
  none: "No",
  wood: "Wood",
  stone: "Stone",
  iron: "Iron",
  aetherium: "Aetherium",
};

function isFoodItem(item: InventoryItem | null): item is FoodMaterial {
  return item === "berries" || item === "mushrooms" || item === "meat";
}

function itemLabel(item: InventoryItem | null, game?: GameState) {
  if (!item) return "Empty";
  if (isBuildKind(item)) return BUILD_DATA[item].name;
  if (item === "axe" && game) return TOOL_TIER_NAMES[game.gear.axeTier] + " Axe";
  if (item === "pickaxe" && game) return TOOL_TIER_NAMES[game.gear.pickaxeTier] + " Pickaxe";
  return ITEM_LABELS[item] || item;
}

function itemCount(game: GameState, item: InventoryItem | null) {
  if (!item) return 0;
  if (isBuildKind(item)) return game.kits[item];
  if (isMaterial(item)) return game.resources[item];
  if (item === "axe") return game.gear.axeTier === "none" ? 0 : 1;
  if (item === "pickaxe") return game.gear.pickaxeTier === "none" ? 0 : 1;
  if (item === "spear") return game.gear.spear ? 1 : 0;
  if (item === "sword") return game.gear.sword ? 1 : 0;
  if (item === "bow") return game.gear.bow ? 1 : 0;
  if (item === "pistol") return game.gear.pistol ? 1 : 0;
  return 0;
}

function ensureItemListed(game: GameState, item: InventoryItem) {
  if (game.hotbar.includes(item) || game.inventory.includes(item)) return;
  const openHotbar = game.hotbar.findIndex((entry) => entry === null);
  if (openHotbar >= 0 && (item === "axe" || item === "pickaxe" || item === "spear" || item === "sword" || item === "bow" || item === "pistol")) {
    game.hotbar[openHotbar] = item;
    return;
  }
  const openInventory = game.inventory.findIndex((entry) => entry === null);
  if (openInventory >= 0) game.inventory[openInventory] = item;
}

function addMaterial(game: GameState, material: Material, amount: number) {
  game.resources[material] += amount;
  if (game.resources[material] > 0) ensureItemListed(game, material);
}

function consumeSelectedFood(game: GameState) {
  if (!isFoodItem(game.selected) || game.resources[game.selected] <= 0) return null;
  game.resources[game.selected] -= 1;
  return game.selected;
}

function isTree(kind: ResourceKind) {
  return kind === "oak" || kind === "pine" || kind === "birch";
}

function isMineable(kind: ResourceKind) {
  return ["rock", "granite", "ironOre", "copperOre", "coal", "sulfur", "aetherOre"].includes(kind);
}

function nodeRadius(kind: ResourceKind) {
  if (kind === "oak") return 58;
  if (kind === "pine") return 52;
  if (kind === "birch") return 47;
  if (kind === "granite") return 50;
  if (isMineable(kind)) return 43;
  if (kind === "berryBush") return 28;
  return 22;
}

function nodeHp(kind: ResourceKind) {
  if (kind === "oak") return 8;
  if (kind === "pine") return 6;
  if (kind === "birch") return 5;
  if (kind === "granite") return 9;
  if (kind === "ironOre") return 8;
  if (kind === "copperOre") return 7;
  if (kind === "aetherOre") return 12;
  if (kind === "rock" || kind === "coal" || kind === "sulfur") return 6;
  return 1;
}

function isCaveRealm(realm: Realm): realm is CaveRealm {
  return realm !== "meadow";
}

function caveForRealm(realm: Realm) {
  if (!isCaveRealm(realm)) return undefined;
  return CAVES.find((cave) => cave.realm === realm);
}

function nearbyCaveEntrance(game: GameState) {
  if (game.realm !== "meadow") return null;
  return CAVES.find(
    (cave) => Math.hypot(game.player.x - cave.entranceX, game.player.y - cave.entranceY) < 110,
  ) || null;
}

function inForest(x: number, y: number) {
  const dx = (x - FOREST_X) / FOREST_RX;
  const dy = (y - FOREST_Y) / FOREST_RY;
  return dx * dx + dy * dy < 1;
}

function equipNewItem(game: GameState, item: InventoryItem) {
  ensureItemListed(game, item);
  const slot = game.hotbar.indexOf(item);
  if (slot >= 0) selectSlot(game, slot);
}

function seeded(index: number, salt: number) {
  const value = Math.sin(index * 999 + salt * 77.13) * 43758.5453;
  return value - Math.floor(value);
}

function makeGame(): GameState {
  const nodes: ResourceNode[] = [];
  let id = 1;
  const addNode = (kind: ResourceKind, realm: Realm, x: number, y: number) => {
    const blocksMovement = isTree(kind) || isMineable(kind);
    const clearSpawn = realm !== "meadow" || !blocksMovement || Math.hypot(x - SPAWN_X, y - SPAWN_Y) > 360;
    const clearExit = realm === "meadow" || Math.hypot(x - CAVE_EXIT_X, y - CAVE_EXIT_Y) > 210;
    const clearCave =
      realm !== "meadow" ||
      CAVES.every((cave) => Math.hypot(x - cave.entranceX, y - cave.entranceY) > 210);
    if (!clearSpawn || !clearExit || !clearCave) return;
    const hp = nodeHp(kind);
    nodes.push({ id: id++, kind, realm, x, y, hp, maxHp: hp, respawnAt: 0 });
  };

  for (let i = 0; i < 210; i++) {
    const x = 110 + seeded(i, 1) * (WORLD_W - 220);
    const y = 110 + seeded(i, 2) * (WORLD_H - 220);
    const roll = i % 16;
    const kind: ResourceKind =
      roll === 0 ? "berryBush" : roll === 1 || roll === 2 ? "grass" : roll === 3 ? "granite" : roll === 4 || roll === 5 ? "rock" : roll === 6 ? "birch" : roll === 7 ? "mushroom" : i % 2 ? "oak" : "pine";
    if (!inForest(x, y) || !isTree(kind)) addNode(kind, "meadow", x, y);
  }

  for (let i = 0; i < 170; i++) {
    addNode(
      "grass",
      "meadow",
      70 + seeded(i, 121) * (WORLD_W - 140),
      70 + seeded(i, 122) * (WORLD_H - 140),
    );
  }
  for (let i = 0; i < 28; i++) {
    const angle = (i / 28) * Math.PI * 2 + seeded(i, 126) * 0.3;
    const distance = 115 + seeded(i, 127) * 235;
    addNode("grass", "meadow", SPAWN_X + Math.cos(angle) * distance, SPAWN_Y + Math.sin(angle) * distance);
  }
  for (let i = 0; i < 24; i++) {
    addNode(
      i % 3 === 0 ? "copperOre" : "ironOre",
      "meadow",
      180 + seeded(i, 131) * (WORLD_W - 360),
      180 + seeded(i, 132) * (WORLD_H - 360),
    );
  }
  for (let i = 0; i < 5; i++) {
    addNode(
      "aetherOre",
      "meadow",
      280 + seeded(i, 137) * (WORLD_W - 560),
      280 + seeded(i, 138) * (WORLD_H - 560),
    );
  }

  for (let i = 0; i < 245; i++) {
    const angle = seeded(i, 41) * Math.PI * 2;
    const radius = Math.sqrt(seeded(i, 42));
    const x = FOREST_X + Math.cos(angle) * FOREST_RX * radius;
    const y = FOREST_Y + Math.sin(angle) * FOREST_RY * radius;
    const kind: ResourceKind = i % 13 === 0 ? "berryBush" : i % 17 === 0 ? "mushroom" : i % 11 === 0 ? "grass" : i % 3 === 0 ? "pine" : i % 3 === 1 ? "oak" : "birch";
    const tooClose = isTree(kind) && nodes.some((node) => node.realm === "meadow" && isTree(node.kind) && Math.hypot(node.x - x, node.y - y) < 82);
    if (!tooClose) addNode(kind, "meadow", x, y);
  }

  for (const [caveIndex, cave] of CAVES.entries()) {
    for (let i = 0; i < 145; i++) {
      const roll = i % 18;
      let kind: ResourceKind;
      if (cave.realm === "graniteCave") {
        kind = roll % 3 === 0 ? "granite" : roll === 1 ? "coal" : roll === 5 ? "mushroom" : "rock";
      } else if (cave.realm === "ironCave") {
        kind = roll === 17 ? "aetherOre" : roll % 4 === 0 ? "ironOre" : roll % 7 === 0 ? "copperOre" : roll === 3 ? "coal" : roll === 9 ? "granite" : "rock";
      } else {
        kind = roll % 4 === 0 ? "sulfur" : roll % 5 === 0 ? "coal" : roll === 3 ? "mushroom" : roll === 7 ? "copperOre" : "rock";
      }
      addNode(
        kind,
        cave.realm,
        150 + seeded(i, 90 + caveIndex * 11) * (WORLD_W - 300),
        150 + seeded(i, 91 + caveIndex * 11) * (WORLD_H - 300),
      );
    }
  }

  const creatures: Creature[] = [];
  const animalStats: Record<AnimalKind, { hp: number; speed: number; damage: number }> = {
    bear: { hp: 70, speed: 48, damage: 9 },
    boar: { hp: 44, speed: 55, damage: 6 },
    deer: { hp: 36, speed: 74, damage: 4 },
    rabbit: { hp: 18, speed: 84, damage: 2 },
    fox: { hp: 30, speed: 78, damage: 4 },
    wolf: { hp: 50, speed: 70, damage: 8 },
  };
  const addAnimal = (kind: AnimalKind, x: number, y: number, phase: number) => {
    const stats = animalStats[kind];
    creatures.push({ id: id++, kind, realm: "meadow", x, y, hp: stats.hp, maxHp: stats.hp, speed: stats.speed, damage: stats.damage, fed: 0, tame: false, angry: false, hitAt: 0, phase, slowUntil: 0, rewarded: false });
  };
  for (let i = 0; i < 24; i++) {
    const x = FOREST_X + (seeded(i, 61) - 0.5) * FOREST_RX * 1.55;
    const y = FOREST_Y + (seeded(i, 62) - 0.5) * FOREST_RY * 1.55;
    const kind: AnimalKind = i % 8 === 0 ? "bear" : i % 5 === 0 ? "wolf" : i % 4 === 0 ? "boar" : i % 3 === 0 ? "deer" : i % 2 === 0 ? "fox" : "rabbit";
    addAnimal(kind, x, y, i * 0.73);
  }
  return {
    started: false,
    dead: false,
    day: 1,
    clock: 0.16,
    wasNight: false,
    realm: "meadow",
    zoom: 1,
    player: { x: SPAWN_X, y: SPAWN_Y, hp: 100, maxHp: 100, hunger: 100, dir: 0, swing: 0, attackReady: 0, useReady: 0 },
    resources: { wood: 8, stone: 5, granite: 0, iron: 0, copper: 0, coal: 0, sulfur: 0, aetherium: 0, fiber: 4, berries: 3, meat: 0, mushrooms: 0, seeds: 2, hide: 0, arrows: 0, bullets: 0 },
    gear: { spear: false, sword: false, bow: false, pistol: false, axeTier: "none", pickaxeTier: "none", armor: "none" },
    kits: {
      craftingBench: 0,
      woodFence: 0,
      stoneFence: 0,
      woodGate: 0,
      stoneGate: 0,
      floor: 0,
      woodWall: 0,
      stoneWall: 0,
      metalWall: 0,
      door: 0,
      roof: 0,
      spikes: 0,
      snare: 0,
      fireTrap: 0,
      turret: 0,
      crop: 0,
    },
    selected: "berries",
    selectedSlot: 0,
    weapon: "spear",
    inventory: ["wood", "stone", "fiber", "berries", "seeds", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    hotbar: ["berries", null, null, null, null, null, null, null, null, null],
    buildMode: null,
    nodes,
    creatures,
    buildings: [],
    projectiles: [],
    keys: new Set(),
    mouseHeld: false,
    buildDrag: false,
    lastBuildCell: null,
    pointer: { x: 0, y: 0, worldX: 0, worldY: 0, active: false },
    camera: { x: SPAWN_X, y: SPAWN_Y },
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
  const count = 6 + game.day * 3;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + seeded(i, game.day);
    const distance = 560 + seeded(i, game.day + 5) * 420;
    const x = Math.max(70, Math.min(WORLD_W - 70, game.player.x + Math.cos(angle) * distance));
    const y = Math.max(70, Math.min(WORLD_H - 70, game.player.y + Math.sin(angle) * distance));
    const kind: MonsterKind =
      game.day >= 5 && i % 7 === 0
        ? "maw"
        : game.day >= 4 && i % 5 === 0
          ? "wraith"
          : game.day >= 2 && i % 4 === 0
            ? "brute"
            : game.day >= 2 && i % 3 === 0
              ? "crawler"
              : "shade";
    const baseStats: Record<MonsterKind, { hp: number; hpScale: number; speed: number; damage: number }> = {
      shade: { hp: 28, hpScale: 8, speed: 66, damage: 7 },
      crawler: { hp: 23, hpScale: 6, speed: 91, damage: 6 },
      brute: { hp: 54, hpScale: 13, speed: 45, damage: 12 },
      wraith: { hp: 42, hpScale: 10, speed: 73, damage: 10 },
      maw: { hp: 92, hpScale: 17, speed: 39, damage: 17 },
    };
    const stats = baseStats[kind];
    const hp = stats.hp + game.day * stats.hpScale;
    game.creatures.push({
      id: game.lastId++,
      kind,
      realm: game.realm,
      x,
      y,
      hp,
      maxHp: hp,
      speed: stats.speed + game.day * 2,
      damage: stats.damage + game.day * 1.4,
      fed: 0,
      tame: false,
      angry: false,
      hitAt: 0,
      phase: i,
      slowUntil: 0,
      rewarded: false,
    });
  }
  notify(game, "NIGHT " + game.day + " — " + count + " horrors have entered the hunt.", 4300);
}

function activeTool(game: GameState): Tool {
  return game.selected;
}

function nearCraftingBench(game: GameState) {
  return game.buildings.some(
    (building) =>
      building.kind === "craftingBench" &&
      building.realm === game.realm &&
      building.hp > 0 &&
      Math.hypot(building.gx * GRID - game.player.x, building.gy * GRID - game.player.y) <= 150,
  );
}

function selectSlot(game: GameState, slot: number) {
  const index = Math.max(0, Math.min(9, slot));
  game.selectedSlot = index;
  game.buildMode = null;
  const item = game.hotbar[index];
  if (!item || itemCount(game, item) <= 0) {
    game.selected = "hands";
    return;
  }
  if (isBuildKind(item)) {
    game.selected = "build";
    game.buildMode = item;
    return;
  }
  if (isFoodItem(item)) {
    game.selected = item;
    return;
  }
  if (isMaterial(item)) {
    game.selected = "hands";
    return;
  }
  game.selected = item;
  if (item === "spear" || item === "sword" || item === "bow" || item === "pistol") game.weapon = item;
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
    const distance = Math.hypot(node.x - game.player.x, node.y - game.player.y) - nodeRadius(node.kind);
    if (distance < best) {
      best = distance;
      found = node;
    }
  }
  return found;
}

function targetNode(game: GameState, maxDistance: number) {
  if (game.pointer.active) {
    const reachable = game.nodes.filter(
      (node) =>
        node.realm === game.realm &&
        node.hp > 0 &&
        Math.hypot(node.x - game.player.x, node.y - game.player.y) - nodeRadius(node.kind) < maxDistance,
    );
    const pointed = reachable
      .filter(
        (node) =>
          Math.hypot(node.x - game.pointer.worldX, node.y - game.pointer.worldY) < nodeRadius(node.kind) + 18,
      )
      .sort(
        (a, b) =>
          Math.hypot(a.x - game.pointer.worldX, a.y - game.pointer.worldY) - nodeRadius(a.kind) -
          (Math.hypot(b.x - game.pointer.worldX, b.y - game.pointer.worldY) - nodeRadius(b.kind)),
      )[0];
    if (pointed) return pointed;

    const aim = Math.atan2(
      game.pointer.worldY - game.player.y,
      game.pointer.worldX - game.player.x,
    );
    return reachable
      .map((node) => {
        let angle = Math.atan2(node.y - game.player.y, node.x - game.player.x) - aim;
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return {
          node,
          angle: Math.abs(angle),
          edge: Math.hypot(node.x - game.player.x, node.y - game.player.y) - nodeRadius(node.kind),
        };
      })
      .filter((target) => target.angle < 0.55)
      .sort((a, b) => a.angle - b.angle || a.edge - b.edge)[0]?.node || null;
  }
  return nearestNode(game, maxDistance);
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
  if (
    buildLayer(kind) === "solid" &&
    game.nodes.some(
      (node) =>
        node.realm === game.realm &&
        node.hp > 0 &&
        (isTree(node.kind) || isMineable(node.kind)) &&
        Math.hypot(node.x - x, node.y - y) < nodeRadius(node.kind) + 24,
    )
  ) return false;
  return !game.buildings.some(
    (building) =>
      building.realm === game.realm &&
      building.gx === gx &&
      building.gy === gy &&
      buildLayer(building.kind) === buildLayer(kind),
  );
}

function placeBuild(game: GameState, quiet = false) {
  const kind = game.buildMode;
  if (!kind) return false;
  const cell = previewCell(game);
  if (!validPlacement(game, kind, cell.gx, cell.gy)) {
    if (!quiet) notify(game, "That grid space is blocked or too far away.");
    return false;
  }
  if (game.kits[kind] <= 0) {
    if (!quiet) notify(game, "Craft another " + BUILD_DATA[kind].name + " first.");
    return false;
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
    triggerAt: 0,
  });
  if (!quiet) {
    notify(
      game,
      game.kits[kind] > 0
        ? BUILD_DATA[kind].name + " placed. Hold Shift and drag to place several."
        : BUILD_DATA[kind].name + " placed. Craft more pieces to keep building.",
    );
  }
  if (game.kits[kind] <= 0) {
    game.buildMode = null;
    game.selected = "hands";
  }
  return true;
}

function interact(game: GameState) {
  if (game.buildMode) {
    placeBuild(game);
    return;
  }
  const entrance = nearbyCaveEntrance(game);
  const currentCave = caveForRealm(game.realm);
  const atCaveExit =
    currentCave &&
    Math.hypot(game.player.x - CAVE_EXIT_X, game.player.y - CAVE_EXIT_Y) < 110;
  if (entrance || atCaveExit) {
    if (entrance) {
      game.realm = entrance.realm;
      game.player.x = CAVE_EXIT_X + 80;
      game.player.y = CAVE_EXIT_Y + 60;
      notify(game, entrance.name + " entered. Its deposits differ from the other caves.");
    } else if (currentCave) {
      game.realm = "meadow";
      game.player.x = currentCave.entranceX - 90;
      game.player.y = currentCave.entranceY + 90;
      notify(game, "Back in the meadow from " + currentCave.name + ".");
    }
    game.camera.x = game.player.x;
    game.camera.y = game.player.y;
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
        addMaterial(game, "berries", 4);
        addMaterial(game, "seeds", 2);
        nearbyBuilding.growth = 0;
        notify(game, "Harvested 4 berries and 2 seeds.");
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
  if (creature && isAnimal(creature.kind) && !creature.tame) {
    if (!isFoodItem(game.selected)) {
      notify(game, "Equip berries, mushrooms, or meat, then press E to feed this " + creature.kind + ".");
      return;
    }
    if (game.resources[game.selected] <= 0) {
      notify(game, "You need food to tame animals.");
      return;
    }
    const fedFood = consumeSelectedFood(game);
    creature.fed += 1;
    creature.angry = false;
    if (creature.fed >= 3) {
      creature.tame = true;
      notify(game, "Tamed! Your " + creature.kind + " will follow and defend you.", 3500);
    } else {
      notify(game, "Fed " + fedFood + " to the " + creature.kind + " (" + creature.fed + "/3).");
    }
    return;
  }
  if (isFoodItem(game.selected) && game.resources[game.selected] > 0) {
    const food = consumeSelectedFood(game);
    if (!food) return;
    const hunger = food === "meat" ? 38 : food === "mushrooms" ? 26 : 18;
    const health = food === "meat" ? 10 : food === "mushrooms" ? 8 : 2;
    game.player.hunger = Math.min(100, game.player.hunger + hunger);
    game.player.hp = Math.min(game.player.maxHp, game.player.hp + health);
    notify(game, "Ate " + food + " · +" + hunger + " hunger · +" + health + " health");
    return;
  }
  notify(game, "Nothing close enough to interact with.");
}

const TOOL_TIER_RANK: Record<ToolTier, number> = { none: 0, wood: 1, stone: 2, iron: 3, aetherium: 4 };
const TOOL_POWER: Record<ToolTier, number> = { none: 0, wood: 1, stone: 2, iron: 3, aetherium: 5 };
const TOOL_COOLDOWN: Record<ToolTier, number> = { none: 450, wood: 400, stone: 320, iron: 220, aetherium: 140 };

function harvestNode(game: GameState, node: ResourceNode) {
  const now = performance.now();
  if (now < game.player.useReady || game.dead || !game.started) return;
  const tree = isTree(node.kind);
  const mining = isMineable(node.kind);
  if (tree && game.selected !== "axe") {
    notify(game, "Put an axe in the selected hotbar slot.", 900);
    game.player.useReady = now + 450;
    return;
  }
  if (mining && game.selected !== "pickaxe") {
    notify(game, "Put a pickaxe in the selected hotbar slot.", 900);
    game.player.useReady = now + 450;
    return;
  }
  const tier = tree ? game.gear.axeTier : mining ? game.gear.pickaxeTier : "wood";
  const requiredPickTier: ToolTier = node.kind === "aetherOre"
    ? "iron"
    : node.kind === "rock"
      ? "wood"
      : mining
        ? "stone"
        : "none";
  if (mining && TOOL_TIER_RANK[tier] < TOOL_TIER_RANK[requiredPickTier]) {
    notify(game, "This deposit needs a " + TOOL_TIER_NAMES[requiredPickTier] + " Pickaxe or better.", 1100);
    game.player.useReady = now + 500;
    return;
  }
  const power = tree || mining ? TOOL_POWER[tier] : 1;
  const hits = Math.min(power, node.hp);
  node.hp -= power;
  game.player.swing = 0.24;
  game.player.useReady = now + (tree || mining ? TOOL_COOLDOWN[tier] : 300);
  const gains: string[] = [];
  const gain = (material: Material, amount: number) => {
    addMaterial(game, material, amount);
    gains.push("+" + amount + " " + material);
  };
  if (node.kind === "oak") {
    gain("wood", hits * 2);
  } else if (node.kind === "pine") {
    gain("wood", hits);
    gain("fiber", hits);
  } else if (node.kind === "birch") {
    gain("wood", hits);
  } else if (node.kind === "rock") {
    gain("stone", hits);
  } else if (node.kind === "granite") {
    gain("granite", hits);
  } else if (node.kind === "ironOre") {
    gain("iron", hits);
  } else if (node.kind === "copperOre") {
    gain("copper", hits);
  } else if (node.kind === "coal") {
    gain("coal", hits);
  } else if (node.kind === "sulfur") {
    gain("sulfur", hits);
  } else if (node.kind === "aetherOre") {
    gain("aetherium", hits);
  } else if (node.kind === "berryBush") {
    gain("berries", 3);
    gain("seeds", 1);
  } else if (node.kind === "grass") {
    gain("fiber", 2);
    gain("seeds", 1);
  } else {
    gain("mushrooms", 2);
  }
  if (node.hp <= 0) {
    node.respawnAt = now + 120000;
    if (node.kind === "oak") gain("fiber", 2);
    if (node.kind === "birch") gain("fiber", 1);
  }
  notify(game, gains.join(" · "), 850);
}

function attack(game: GameState) {
  const now = performance.now();
  if (now < game.player.attackReady || game.dead || !game.started) return;
  const tool = activeTool(game);
  if (tool === "bow" || tool === "pistol") {
    const ammo: Material = tool === "bow" ? "arrows" : "bullets";
    if (game.resources[ammo] <= 0) {
      notify(game, "Out of " + ammo + ". Craft more ammunition.", 1000);
      game.player.attackReady = now + 500;
      return;
    }
    game.resources[ammo] -= 1;
    game.player.attackReady = now + (tool === "bow" ? 520 : 320);
    game.player.swing = 0.2;
    const speed = tool === "bow" ? 620 : 1120;
    game.projectiles.push({
      id: game.lastId++,
      kind: tool === "bow" ? "arrow" : "bullet",
      realm: game.realm,
      x: game.player.x + Math.cos(game.player.dir) * 34,
      y: game.player.y + Math.sin(game.player.dir) * 34,
      vx: Math.cos(game.player.dir) * speed,
      vy: Math.sin(game.player.dir) * speed,
      life: tool === "bow" ? 0.9 : 0.58,
      damage: tool === "bow" ? 18 : 34,
    });
    return;
  }
  const axeDamage: Record<ToolTier, number> = { none: 3, wood: 7, stone: 9, iron: 14, aetherium: 22 };
  const pickDamage: Record<ToolTier, number> = { none: 3, wood: 5, stone: 7, iron: 11, aetherium: 18 };
  const damage =
    tool === "sword" ? 25 : tool === "spear" ? 17 : tool === "axe" ? axeDamage[game.gear.axeTier] : tool === "pickaxe" ? pickDamage[game.gear.pickaxeTier] : 3;
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
        awardCreatureDrop(game, creature);
      }
    }
  }
  if (hit) notify(game, damage + " damage", 700);
}

function awardCreatureDrop(game: GameState, creature: Creature) {
  if (creature.rewarded) return;
  creature.rewarded = true;
  game.kills += 1;
  if (isAnimal(creature.kind)) {
    addMaterial(game, "meat", creature.kind === "rabbit" ? 1 : creature.kind === "bear" ? 4 : 2);
    addMaterial(game, "hide", creature.kind === "bear" || creature.kind === "deer" ? 2 : 1);
  }
  if (creature.kind === "brute") addMaterial(game, "iron", 1);
  if (creature.kind === "wraith") addMaterial(game, "sulfur", 1);
  if (creature.kind === "maw") {
    addMaterial(game, "iron", 2);
    addMaterial(game, "sulfur", 2);
  }
}

function updateProjectiles(game: GameState, dt: number) {
  for (const projectile of game.projectiles) {
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.life -= dt;
    const target = game.creatures.find(
      (creature) =>
        creature.realm === projectile.realm &&
        creature.hp > 0 &&
        !creature.tame &&
        Math.hypot(creature.x - projectile.x, creature.y - projectile.y) < (creature.kind === "maw" || creature.kind === "bear" ? 38 : 28),
    );
    if (target) {
      target.hp -= projectile.damage;
      target.angry = true;
      projectile.life = 0;
      notify(game, (projectile.kind === "arrow" ? "Arrow" : "Bullet") + " hit · " + projectile.damage + " damage", 650);
      if (target.hp <= 0) awardCreatureDrop(game, target);
    }
    if (projectile.x < 0 || projectile.y < 0 || projectile.x > WORLD_W || projectile.y > WORLD_H) projectile.life = 0;
  }
  game.projectiles = game.projectiles.filter((projectile) => projectile.life > 0);
}

function primaryAction(game: GameState, repeated = false) {
  const now = performance.now();
  if (game.buildMode) {
    const continuous = game.buildDrag || game.keys.has("shift");
    if (repeated && !continuous) return;
    const cell = previewCell(game);
    const cellKey = game.realm + ":" + cell.gx + ":" + cell.gy;
    if (repeated && game.lastBuildCell === cellKey) return;
    if (!continuous && now < game.player.useReady) return;
    const placed = placeBuild(game, repeated);
    game.lastBuildCell = cellKey;
    game.player.useReady = continuous ? now : now + 300;
    if (!placed && !continuous) game.lastBuildCell = null;
    return;
  }
  const node = targetNode(game, 112);
  if (node) {
    harvestNode(game, node);
    return;
  }
  attack(game);
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
    let chasing = false;
    const playerDistance = Math.hypot(game.player.x - creature.x, game.player.y - creature.y);
    if (isMonster(creature.kind)) {
      const senseDistance: Record<MonsterKind, number> = {
        shade: 320,
        crawler: 390,
        brute: 270,
        wraith: 440,
        maw: 240,
      };
      const sense = senseDistance[creature.kind];
      if (playerDistance < sense) creature.angry = true;
      if (playerDistance > sense * 1.8) creature.angry = false;
      chasing = creature.angry;
    } else if (!creature.tame) {
      const aggroDistance = creature.kind === "bear" ? 135 : creature.kind === "wolf" ? 120 : creature.kind === "boar" ? 90 : 62;
      if (playerDistance < aggroDistance && !isFoodItem(game.selected)) creature.angry = true;
      if (playerDistance > 340) creature.angry = false;
      chasing = creature.angry;
    }
    if (creature.tame) {
      const enemy = game.creatures
        .filter((other) => other.realm === game.realm && !other.tame && isMonster(other.kind) && other.hp > 0)
        .sort(
          (a, b) =>
            Math.hypot(a.x - creature.x, a.y - creature.y) - Math.hypot(b.x - creature.x, b.y - creature.y),
        )[0];
      if (enemy && Math.hypot(enemy.x - creature.x, enemy.y - creature.y) < 230) {
        targetX = enemy.x;
        targetY = enemy.y;
        const enemyDistance = Math.hypot(enemy.x - creature.x, enemy.y - creature.y);
        if (enemyDistance < 45 && now - creature.hitAt > 800) {
          const tameDamage = creature.kind === "bear" ? 16 : creature.kind === "wolf" ? 14 : creature.kind === "boar" ? 10 : creature.kind === "deer" ? 9 : 7;
          enemy.hp -= tameDamage;
          creature.hitAt = now;
          if (enemy.hp <= 0) awardCreatureDrop(game, enemy);
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
      const slowFactor = now < creature.slowUntil ? 0.42 : 1;
      const pace = (chasing ? creature.speed : creature.speed * 0.22) * slowFactor;
      creature.x = Math.max(35, Math.min(WORLD_W - 35, creature.x + (dx / distance) * pace * dt));
      creature.y = Math.max(35, Math.min(WORLD_H - 35, creature.y + (dy / distance) * pace * dt));
    }
    if (chasing && !creature.tame && playerDistance < 43 && now - creature.hitAt > 850) {
      const armorReduction = game.gear.armor === "blacksteel" ? 0.55 : game.gear.armor === "iron" ? 0.35 : game.gear.armor === "copper" ? 0.18 : 0;
      const received = creature.damage * (1 - armorReduction);
      game.player.hp -= received;
      creature.hitAt = now;
      notify(game, "You took " + Math.round(received) + " damage!", 1100);
    }
    for (const building of game.buildings) {
      if (building.realm !== game.realm || building.hp <= 0) continue;
      const buildingDistance = Math.hypot(building.gx * GRID - creature.x, building.gy * GRID - creature.y);
      if (building.kind === "spikes" && buildingDistance < 42 && isMonster(creature.kind) && now - creature.hitAt > 450) {
        creature.hp -= 10;
        creature.hitAt = now;
      }
      if (building.kind === "snare" && buildingDistance < 44 && isMonster(creature.kind) && now > building.triggerAt) {
        creature.hp -= 8;
        creature.slowUntil = now + 2600;
        building.triggerAt = now + 2200;
      }
      if (building.kind === "fireTrap" && buildingDistance < 76 && isMonster(creature.kind) && now > building.triggerAt) {
        creature.hp -= 18;
        building.triggerAt = now + 3200;
      }
      if (isMonster(creature.kind) && buildingDistance < 36 && now - creature.hitAt > 800) {
        building.hp -= creature.damage;
        creature.hitAt = now;
      }
      if (creature.hp <= 0) awardCreatureDrop(game, creature);
    }
  }
  for (const turret of game.buildings) {
    if (turret.kind !== "turret" || turret.realm !== game.realm || performance.now() < turret.triggerAt) continue;
    const target = game.creatures
      .filter((creature) => creature.realm === game.realm && creature.hp > 0 && isMonster(creature.kind))
      .sort(
        (a, b) =>
          Math.hypot(a.x - turret.gx * GRID, a.y - turret.gy * GRID) -
          Math.hypot(b.x - turret.gx * GRID, b.y - turret.gy * GRID),
      )[0];
    if (target && Math.hypot(target.x - turret.gx * GRID, target.y - turret.gy * GRID) < 360) {
      target.hp -= 12;
      turret.triggerAt = now + 700;
      if (target.hp <= 0) awardCreatureDrop(game, target);
    }
  }
  game.creatures = game.creatures.filter((creature) => creature.hp > 0);
  game.buildings = game.buildings.filter((building) => building.hp > 0);
}

function canStand(game: GameState, x: number, y: number) {
  return !game.nodes.some(
    (node) =>
      node.realm === game.realm &&
      node.hp > 0 &&
      (isTree(node.kind) || isMineable(node.kind)) &&
      Math.hypot(node.x - x, node.y - y) < nodeRadius(node.kind) + 19,
  );
}

function syncPointerWorld(game: GameState, viewportWidth: number, viewportHeight: number) {
  if (!game.pointer.active) return;
  game.pointer.worldX = game.camera.x + (game.pointer.x - viewportWidth / 2) / game.zoom;
  game.pointer.worldY = game.camera.y + (game.pointer.y - viewportHeight / 2) / game.zoom;
}

function updateGame(game: GameState, dt: number, viewportWidth: number, viewportHeight: number) {
  game.clock += dt / DAY_SECONDS;
  while (game.clock >= 1) {
    game.clock -= 1;
    game.day += 1;
    game.player.hp = Math.min(game.player.maxHp, game.player.hp + 12);
    notify(game, "DAWN — Day " + game.day + ". There is no final night.", 4000);
  }
  const afterNight = isNight(game);
  if (afterNight && game.wave < game.day) spawnNightWave(game);
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
    const nextX = Math.max(32, Math.min(WORLD_W - 32, game.player.x + (dx / length) * speed * dt));
    const nextY = Math.max(32, Math.min(WORLD_H - 32, game.player.y + (dy / length) * speed * dt));
    if (canStand(game, nextX, game.player.y)) game.player.x = nextX;
    if (canStand(game, game.player.x, nextY)) game.player.y = nextY;
    if (!game.pointer.active) game.player.dir = Math.atan2(dy, dx);
  }
  game.camera.x += (game.player.x - game.camera.x) * Math.min(1, dt * 8);
  game.camera.y += (game.player.y - game.camera.y) * Math.min(1, dt * 8);
  syncPointerWorld(game, viewportWidth, viewportHeight);
  if (game.pointer.active) {
    game.player.dir = Math.atan2(
      game.pointer.worldY - game.player.y,
      game.pointer.worldX - game.player.x,
    );
  }
  if (game.mouseHeld) primaryAction(game, true);
  game.player.swing = Math.max(0, game.player.swing - dt);
  game.player.hunger = Math.max(0, game.player.hunger - dt * 0.5);
  if (game.player.hunger <= 0) game.player.hp -= dt * 2;
  if (game.player.hp <= 0) {
    game.player.hp = 0;
    game.dead = true;
    game.started = false;
  }
  for (const building of game.buildings) {
    if (building.kind === "crop") building.growth = Math.min(1, building.growth + dt / 75);
  }
  updateProjectiles(game, dt);
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
  const radius = nodeRadius(node.kind);
  ctx.fillStyle = "rgba(31,65,43,.2)";
  ctx.beginPath();
  ctx.ellipse(7, 9, radius, radius * 0.82, 0, 0, Math.PI * 2);
  ctx.fill();
  const dark = node.kind === "pine" ? "#153d31" : node.kind === "birch" ? "#326b3f" : "#1c4b38";
  const mid = node.kind === "pine" ? "#245b43" : node.kind === "birch" ? "#59a653" : "#2d7045";
  const light = node.kind === "pine" ? "#397a50" : node.kind === "birch" ? "#83c665" : "#579855";
  ctx.fillStyle = dark;
  ctx.strokeStyle = "#15392d";
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 * i) / 20;
    const r = radius * (i % 2 ? 0.82 : 1);
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  const crowns = [[-0.3, -0.2, 0.48], [0.35, -0.12, 0.42], [-0.08, 0.36, 0.46], [0.08, 0.02, 0.54]];
  crowns.forEach(([px, py, size], index) => {
    ctx.beginPath();
    ctx.arc(px * radius, py * radius, size * radius, 0, Math.PI * 2);
    ctx.fillStyle = index === 3 ? light : mid;
    ctx.fill();
  });
  ctx.strokeStyle = "rgba(222,236,184,.32)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(-radius * 0.13, -radius * 0.16, radius * 0.48, Math.PI * 1.05, Math.PI * 1.72);
  ctx.stroke();
  ctx.fillStyle = node.kind === "birch" ? "#e5dec8" : "#805438";
  ctx.strokeStyle = "#493727";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawRock(ctx: CanvasRenderingContext2D, node: ResourceNode) {
  ctx.save();
  ctx.translate(node.x, node.y);
  const radius = nodeRadius(node.kind);
  ctx.fillStyle = "rgba(31,65,43,.18)";
  ctx.beginPath();
  ctx.ellipse(7, 11, radius, radius * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-radius, 8);
  ctx.lineTo(-radius * 0.72, -radius * 0.58);
  ctx.lineTo(-radius * 0.12, -radius);
  ctx.lineTo(radius * 0.62, -radius * 0.67);
  ctx.lineTo(radius, -radius * 0.08);
  ctx.lineTo(radius * 0.72, radius * 0.72);
  ctx.lineTo(-radius * 0.18, radius);
  ctx.closePath();
  const ore = node.kind === "ironOre" || node.kind === "copperOre" || node.kind === "coal" || node.kind === "sulfur" || node.kind === "aetherOre";
  ctx.fillStyle = node.kind === "aetherOre" ? "#394e5f" : node.kind === "granite" ? "#8e7778" : node.kind === "coal" ? "#343a3b" : node.kind === "sulfur" ? "#8b8050" : ore ? "#596877" : "#718177";
  ctx.strokeStyle = node.kind === "aetherOre" ? "#172c3a" : node.kind === "granite" ? "#624f53" : node.kind === "coal" ? "#1d2424" : node.kind === "sulfur" ? "#5c5638" : ore ? "#343a4b" : "#4c6259";
  ctx.lineWidth = 6;
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-radius * 0.62, -radius * 0.28);
  ctx.lineTo(-radius * 0.05, -radius * 0.72);
  ctx.lineTo(radius * 0.36, -radius * 0.18);
  ctx.closePath();
  ctx.fillStyle = "#9aa99e";
  ctx.fill();
  if (ore) {
    ctx.fillStyle = node.kind === "aetherOre" ? "#67e2f0" : node.kind === "copperOre" ? "#d77d50" : node.kind === "coal" ? "#151a1a" : node.kind === "sulfur" ? "#e0cb42" : "#d3a95a";
    for (const [x, y] of [[-18, 2], [10, 14], [22, -13], [-2, -20]]) {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawBush(ctx: CanvasRenderingContext2D, node: ResourceNode) {
  ctx.save();
  ctx.translate(node.x, node.y);
  if (node.kind === "grass") {
    ctx.fillStyle = "rgba(38,75,39,.18)";
    ctx.beginPath();
    ctx.ellipse(3, 10, 30, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5c9d45";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    for (let i = 0; i < 21; i++) {
      const angle = (Math.PI * 2 * i) / 21;
      const length = 19 + (i % 5) * 4;
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.quadraticCurveTo(Math.cos(angle) * length * 0.45, Math.sin(angle) * length * 0.45, Math.cos(angle) * length, Math.sin(angle) * length);
      ctx.stroke();
      if (i % 5 === 0) {
        ctx.fillStyle = "#d8bf63";
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * length, Math.sin(angle) * length, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
    return;
  }
  if (node.kind === "mushroom") {
    for (const [x, y, size] of [[-10, 6, 9], [7, -5, 11], [15, 10, 7]] as const) {
      ctx.fillStyle = "#e8dfc5";
      roundedRect(ctx, x - 2, y, 5, 12, 2);
      ctx.fill();
      ctx.fillStyle = "#9d554b";
      ctx.beginPath();
      ctx.arc(x, y, size, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    return;
  }
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

function drawTool(ctx: CanvasRenderingContext2D, game: GameState, swing: number) {
  const tool = activeTool(game);
  const angle = swing > 0 ? -0.75 : -0.22;
  ctx.save();
  ctx.translate(19, 6);
  ctx.rotate(angle);
  if (isFoodItem(tool)) {
    ctx.fillStyle = tool === "berries" ? "#d95762" : tool === "mushrooms" ? "#d9cba8" : "#b95c4d";
    ctx.strokeStyle = "#432f2b";
    ctx.lineWidth = 3;
    if (tool === "mushrooms") {
      for (const [x, y] of [[8, -3], [17, 4]] as const) {
        roundedRect(ctx, x, y, 4, 10, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 2, y, 7, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else {
      for (const [x, y] of [[8, -4], [15, 1], [7, 5]] as const) {
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
    return;
  }
  if (tool === "hands") {
    ctx.restore();
    return;
  }
  if (tool === "bow") {
    ctx.strokeStyle = "#8c5a37";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(26, 0, 23, -1.1, 1.1);
    ctx.stroke();
    ctx.strokeStyle = "#e7dfca";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(36, -20);
    ctx.lineTo(13, 0);
    ctx.lineTo(36, 20);
    ctx.stroke();
    ctx.strokeStyle = "#4b3a30";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(9, 0);
    ctx.lineTo(55, 0);
    ctx.stroke();
    ctx.fillStyle = "#c8d1cc";
    ctx.beginPath();
    ctx.moveTo(59, 0);
    ctx.lineTo(49, -5);
    ctx.lineTo(49, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }
  if (tool === "pistol") {
    ctx.fillStyle = "#77878b";
    ctx.strokeStyle = "#2d3638";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(6, -11);
    ctx.lineTo(48, -11);
    ctx.lineTo(53, -6);
    ctx.lineTo(53, 5);
    ctx.lineTo(22, 8);
    ctx.lineTo(8, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#30393b";
    roundedRect(ctx, 27, -6, 14, 7, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(51, -1, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#71503a";
    ctx.beginPath();
    ctx.moveTo(14, 6);
    ctx.lineTo(29, 6);
    ctx.lineTo(25, 27);
    ctx.lineTo(10, 23);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#2d3638";
    ctx.beginPath();
    ctx.arc(31, 9, 8, 0.2, 2.65);
    ctx.stroke();
    ctx.fillStyle = "#2d3638";
    roundedRect(ctx, 9, -15, 6, 4, 1);
    ctx.fill();
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
    const tier = game.gear.axeTier;
    ctx.fillStyle = tier === "wood" ? "#9a693f" : tier === "stone" ? "#87948d" : tier === "iron" ? "#c3ceca" : "#69d8e7";
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
    const tier = game.gear.pickaxeTier;
    const headColor = tier === "wood" ? "#9a693f" : tier === "stone" ? "#87948d" : tier === "iron" ? "#c3ceca" : "#69d8e7";
    ctx.strokeStyle = "#32443e";
    ctx.lineWidth = 12;
    ctx.lineCap = "butt";
    ctx.beginPath();
    ctx.moveTo(40, -25);
    ctx.lineTo(40, 25);
    ctx.stroke();
    ctx.strokeStyle = headColor;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(40, -25);
    ctx.lineTo(40, 25);
    ctx.stroke();
    ctx.fillStyle = headColor;
    ctx.beginPath();
    ctx.moveTo(40, -31);
    ctx.lineTo(33, -20);
    ctx.lineTo(47, -20);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(40, 31);
    ctx.lineTo(33, 20);
    ctx.lineTo(47, 20);
    ctx.closePath();
    ctx.fill();
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

function drawHelmet(ctx: CanvasRenderingContext2D, armor: ArmorKind) {
  if (armor === "none") return;
  const fill = armor === "copper" ? "#c47a4a" : armor === "iron" ? "#aeb8b5" : "#343d42";
  const edge = armor === "copper" ? "#70402f" : armor === "iron" ? "#53615f" : "#141a20";
  const shine = armor === "copper" ? "#e5a16b" : armor === "iron" ? "#dce3df" : "#6e7d84";
  ctx.fillStyle = fill;
  ctx.strokeStyle = edge;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(-2, 0, 22, 0.62, Math.PI * 2 - 0.62);
  ctx.lineTo(5, -12);
  ctx.lineTo(5, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = shine;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(-4, -2, 14, 3.45, 5.08);
  ctx.stroke();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(3, -14);
  ctx.lineTo(9, -14);
  ctx.moveTo(3, 14);
  ctx.lineTo(9, 14);
  ctx.stroke();
  if (armor === "blacksteel") {
    ctx.fillStyle = "#9d3f38";
    ctx.beginPath();
    ctx.moveTo(-10, -18);
    ctx.lineTo(-20, 0);
    ctx.lineTo(-10, 18);
    ctx.closePath();
    ctx.fill();
  }
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
  drawTool(ctx, game, player.swing);
  ctx.fillStyle = "#dfa93d";
  ctx.strokeStyle = "#203a33";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, 25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  drawHelmet(ctx, game.gear.armor);
  ctx.restore();
}

function drawCreature(ctx: CanvasRenderingContext2D, creature: Creature, now: number) {
  const scale = creature.kind === "brute" ? 1.28 : creature.kind === "bear" ? 1.2 : creature.kind === "rabbit" ? 0.68 : creature.kind === "boar" ? 0.92 : 1;
  ctx.save();
  ctx.translate(creature.x, creature.y + Math.sin(now / 230 + creature.phase) * 2);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(12,27,24,.23)";
  ctx.beginPath();
  ctx.ellipse(5, 14, 25, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  if (isAnimal(creature.kind)) {
    const animalColor: Record<AnimalKind, string> = {
      bear: "#77513c",
      boar: "#9a6444",
      deer: "#b57a48",
      rabbit: "#b9b6aa",
      fox: "#d36f3d",
      wolf: "#697773",
    };
    const muzzleColor: Record<AnimalKind, string> = {
      bear: "#b9825d",
      boar: "#ca8560",
      deer: "#d3a06f",
      rabbit: "#e1d8c7",
      fox: "#e5a06e",
      wolf: "#a6ada8",
    };
    ctx.fillStyle = animalColor[creature.kind];
    ctx.strokeStyle = "#3e322c";
    ctx.lineWidth = 5;
    if (creature.kind === "rabbit") {
      for (const x of [-10, 10]) {
        ctx.beginPath();
        ctx.ellipse(x, -22, 7, 18, x * 0.015, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    } else if (creature.kind === "fox" || creature.kind === "wolf") {
      for (const x of [-15, 15]) {
        ctx.beginPath();
        ctx.moveTo(x - 7, -10);
        ctx.lineTo(x, -30);
        ctx.lineTo(x + 9, -9);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.arc(-14, -14, creature.kind === "bear" ? 9 : 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(14, -14, creature.kind === "bear" ? 9 : 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (creature.kind === "deer") {
      ctx.strokeStyle = "#6a472f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-8, -18);
      ctx.lineTo(-14, -34);
      ctx.lineTo(-21, -39);
      ctx.moveTo(8, -18);
      ctx.lineTo(14, -34);
      ctx.lineTo(21, -39);
      ctx.stroke();
    }
    ctx.fillStyle = muzzleColor[creature.kind];
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
    const pulse = Math.sin(now / 120 + creature.phase) * 2;
    ctx.strokeStyle = "#111522";
    ctx.lineCap = "round";
    if (creature.kind === "crawler") {
      ctx.lineWidth = 5;
      for (const side of [-1, 1]) {
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(side * 12, i * 9);
          ctx.lineTo(side * (29 + Math.abs(i) * 4), i * 17 - 4);
          ctx.lineTo(side * 38, i * 22 + 4);
          ctx.stroke();
        }
      }
      ctx.fillStyle = "#283044";
      ctx.beginPath();
      ctx.ellipse(0, 0, 25 + pulse, 19, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#0b0d12";
      ctx.beginPath();
      ctx.ellipse(13, 1, 11, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ead9bd";
      for (const y of [-5, 0, 5]) {
        ctx.beginPath();
        ctx.moveTo(7, y - 3);
        ctx.lineTo(18, y);
        ctx.lineTo(7, y + 3);
        ctx.fill();
      }
      ctx.fillStyle = "#e94f4f";
      for (const [x, y] of [[-9, -8], [-2, -12], [-10, 8], [-2, 12]] as const) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (creature.kind === "wraith") {
      ctx.fillStyle = "#3d385f";
      ctx.strokeStyle = "#17182b";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(25, 0);
      ctx.quadraticCurveTo(8, -29, -15, -20);
      ctx.lineTo(-35, -30 - pulse);
      ctx.lineTo(-27, -9);
      ctx.lineTo(-42, 1 + pulse);
      ctx.lineTo(-25, 10);
      ctx.lineTo(-34, 31 - pulse);
      ctx.lineTo(-12, 20);
      ctx.quadraticCurveTo(12, 28, 25, 0);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#05060b";
      ctx.beginPath();
      ctx.ellipse(8, 1, 11, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f15b63";
      ctx.beginPath();
      ctx.arc(13, -6, 3, 0, Math.PI * 2);
      ctx.arc(13, 7, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (creature.kind === "maw") {
      ctx.fillStyle = "#553044";
      ctx.strokeStyle = "#25131d";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, 34 + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#09070a";
      ctx.beginPath();
      ctx.arc(5, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ead8bd";
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12;
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(17, -4);
        ctx.lineTo(7, 0);
        ctx.lineTo(17, 4);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = "#ff5e55";
      for (const [x, y] of [[-18, -19], [-22, 14], [4, -29]] as const) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#171014";
        ctx.beginPath();
        ctx.arc(x + 1, y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff5e55";
      }
    } else {
      ctx.fillStyle = creature.kind === "brute" ? "#4e3152" : "#252d49";
      ctx.strokeStyle = "#111522";
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const angle = (Math.PI * 2 * i) / 16;
        const radius = (creature.kind === "brute" ? 30 : 25) + (i % 2 ? pulse : 7);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (creature.kind === "brute") {
        ctx.fillStyle = "#8a697f";
        for (const y of [-18, 18]) {
          ctx.beginPath();
          ctx.moveTo(-12, y);
          ctx.lineTo(-34, y * 1.55);
          ctx.lineTo(-19, y * 0.55);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.fillStyle = "#090b12";
      ctx.beginPath();
      ctx.ellipse(11, 0, 11, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f35a58";
      for (const y of [-8, 0, 8]) {
        ctx.beginPath();
        ctx.ellipse(14, y, 5, 2.5, -0.2, 0, Math.PI * 2);
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
  if (kind === "craftingBench") {
    ctx.fillStyle = "#75482f";
    ctx.strokeStyle = "#432c22";
    ctx.lineWidth = 4;
    roundedRect(ctx, -23, -17, 46, 34, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#b77a45";
    roundedRect(ctx, -25, -20, 50, 12, 5);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#c8d1cc";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-12, -5);
    ctx.lineTo(8, 9);
    ctx.moveTo(12, -6);
    ctx.lineTo(-6, 10);
    ctx.stroke();
    ctx.fillStyle = "#69787a";
    roundedRect(ctx, 6, -10, 18, 8, 2);
    ctx.fill();
  } else if (kind === "floor") {
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
  } else if (kind === "woodWall" || kind === "stoneWall" || kind === "metalWall") {
    ctx.fillStyle = kind === "metalWall" ? "#68777b" : kind === "stoneWall" ? "#89958f" : "#875738";
    ctx.strokeStyle = kind === "metalWall" ? "#344348" : kind === "stoneWall" ? "#596861" : "#583b2c";
    ctx.lineWidth = 4;
    roundedRect(ctx, -23, -23, 46, 46, 5);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = kind === "metalWall" ? "#9ba9ac" : kind === "stoneWall" ? "#b3beb6" : "#b77a45";
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
  } else if (kind === "snare") {
    ctx.strokeStyle = "#aab7b2";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 1, 18, 0, Math.PI * 2);
    ctx.moveTo(-21, -17);
    ctx.lineTo(21, 19);
    ctx.moveTo(21, -17);
    ctx.lineTo(-21, 19);
    ctx.stroke();
  } else if (kind === "fireTrap") {
    ctx.fillStyle = "#4b4c45";
    ctx.strokeStyle = "#292f2c";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#e16b3d";
    ctx.beginPath();
    ctx.moveTo(-11, 12);
    ctx.quadraticCurveTo(-17, -6, -4, -18);
    ctx.quadraticCurveTo(0, -4, 8, -15);
    ctx.quadraticCurveTo(17, 2, 9, 13);
    ctx.closePath();
    ctx.fill();
  } else if (kind === "turret") {
    ctx.fillStyle = "#6d7f7c";
    ctx.strokeStyle = "#34443f";
    ctx.lineWidth = 4;
    roundedRect(ctx, -20, -19, 40, 38, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#2f3a38";
    roundedRect(ctx, 3, -7, 31, 14, 4);
    ctx.fill();
    ctx.stroke();
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

function drawCave(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  exit: boolean,
  label: string,
) {
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
  ctx.fillStyle = exit ? "#d4b256" : "#e7d6a5";
  ctx.font = "bold 13px Arial";
  ctx.textAlign = "center";
  ctx.fillText(exit ? "EXIT · " + label.toUpperCase() : label.toUpperCase(), 0, -51);
  ctx.restore();
}

function drawProjectile(ctx: CanvasRenderingContext2D, projectile: Projectile) {
  ctx.save();
  ctx.translate(projectile.x, projectile.y);
  ctx.rotate(Math.atan2(projectile.vy, projectile.vx));
  if (projectile.kind === "arrow") {
    ctx.strokeStyle = "#4b3426";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(14, 0);
    ctx.stroke();
    ctx.fillStyle = "#d7e0dc";
    ctx.beginPath();
    ctx.moveTo(21, 0);
    ctx.lineTo(10, -5);
    ctx.lineTo(10, 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#e5b85a";
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(-11, -5);
    ctx.lineTo(-11, 5);
    ctx.closePath();
    ctx.fill();
  } else {
    const trail = ctx.createLinearGradient(-28, 0, 10, 0);
    trail.addColorStop(0, "rgba(255,211,91,0)");
    trail.addColorStop(1, "rgba(255,239,169,.95)");
    ctx.strokeStyle = trail;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.lineTo(6, 0);
    ctx.stroke();
    ctx.fillStyle = "#fff4bd";
    ctx.beginPath();
    ctx.arc(8, 0, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawWorld(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, game: GameState) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const cave = caveForRealm(game.realm);
  ctx.fillStyle = cave ? cave.ground : "#89bd63";
  ctx.fillRect(0, 0, width, height);
  const scale = game.zoom;
  const offsetX = width / 2 - game.camera.x * scale;
  const offsetY = height / 2 - game.camera.y * scale;
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  ctx.fillStyle = cave ? cave.ground : "#91c66b";
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  if (!cave) {
    ctx.fillStyle = "#5f8f50";
    ctx.beginPath();
    ctx.ellipse(FOREST_X, FOREST_Y, FOREST_RX, FOREST_RY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(232,239,195,.48)";
    ctx.font = "900 34px Arial";
    ctx.textAlign = "center";
    ctx.fillText("THE BLACKWOOD", FOREST_X, Math.max(90, FOREST_Y - FOREST_RY + 85));
  }
  for (let i = 0; i < 420; i++) {
    const x = seeded(i, cave ? 31 : 21) * WORLD_W;
    const y = seeded(i, cave ? 32 : 22) * WORLD_H;
    ctx.fillStyle = cave ? (i % 2 ? cave.textureA : cave.textureB) : i % 2 ? "#7eb35b" : "#a3cf7b";
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
  if (!cave) {
    CAVES.forEach((entrance) =>
      drawCave(ctx, entrance.entranceX, entrance.entranceY, false, entrance.name),
    );
  } else {
    drawCave(ctx, CAVE_EXIT_X, CAVE_EXIT_Y, true, cave.name);
  }

  const viewLeft = game.camera.x - width / (2 * scale) - 140;
  const viewRight = game.camera.x + width / (2 * scale) + 140;
  const viewTop = game.camera.y - height / (2 * scale) - 140;
  const viewBottom = game.camera.y + height / (2 * scale) + 140;
  const onScreen = (x: number, y: number) => x >= viewLeft && x <= viewRight && y >= viewTop && y <= viewBottom;
  const visibleBuildings = game.buildings.filter((building) => building.realm === game.realm && onScreen(building.gx * GRID, building.gy * GRID));
  visibleBuildings.filter((building) => building.kind === "floor").forEach((building) => drawBuilding(ctx, building));

  const drawables: { y: number; draw: () => void }[] = [];
  game.nodes.forEach((node) => {
    if (node.realm !== game.realm || node.hp <= 0 || !onScreen(node.x, node.y)) return;
    drawables.push({
      y: node.y,
      draw: () => {
        if (isTree(node.kind)) drawTree(ctx, node);
        else if (node.kind === "berryBush" || node.kind === "grass" || node.kind === "mushroom") drawBush(ctx, node);
        else drawRock(ctx, node);
      },
    });
  });
  visibleBuildings
    .filter((building) => building.kind !== "floor" && building.kind !== "roof")
    .forEach((building) => drawables.push({ y: building.gy * GRID, draw: () => drawBuilding(ctx, building) }));
  game.creatures.forEach((creature) => {
    if (creature.realm === game.realm && creature.hp > 0 && onScreen(creature.x, creature.y)) {
      drawables.push({ y: creature.y, draw: () => drawCreature(ctx, creature, performance.now()) });
    }
  });
  game.projectiles.forEach((projectile) => {
    if (projectile.realm === game.realm && onScreen(projectile.x, projectile.y)) {
      drawables.push({ y: projectile.y + 40, draw: () => drawProjectile(ctx, projectile) });
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
        triggerAt: 0,
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
  if (game.buildMode) {
    return "BUILD · Place " + BUILD_DATA[game.buildMode].name + " · Shift-drag for multiple";
  }
  const entrance = nearbyCaveEntrance(game);
  const currentCave = caveForRealm(game.realm);
  if (entrance) return "E · Enter " + entrance.name;
  if (
    currentCave &&
    Math.hypot(game.player.x - CAVE_EXIT_X, game.player.y - CAVE_EXIT_Y) < 110
  ) {
    return "E · Exit " + currentCave.name;
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
  if (creature && isAnimal(creature.kind) && !creature.tame) {
    return "E · Feed " + creature.kind + " with equipped food (" + creature.fed + "/3)";
  }
  if (isFoodItem(game.selected)) return "E · Eat " + game.selected;
  const node = nearestNode(game, 92);
  if (node) {
    if (isTree(node.kind)) return "TOOL · Chop " + node.kind + " with Axe";
    if (node.kind === "rock") return "TOOL · Mine stone with Pickaxe";
    if (node.kind === "granite") return "TOOL · Mine granite with Pickaxe";
    if (node.kind === "ironOre") return "TOOL · Mine iron ore with Pickaxe";
    if (node.kind === "copperOre") return "TOOL · Mine copper ore with Pickaxe";
    if (node.kind === "coal") return "TOOL · Mine coal with Pickaxe";
    if (node.kind === "sulfur") return "TOOL · Mine sulfur with Pickaxe";
    if (node.kind === "aetherOre") return "TOOL · Mine rare Aetherium with Iron Pickaxe";
    return "TOOL · Gather " + (node.kind === "berryBush" ? "berries" : node.kind);
  }
  return "";
}

const CRAFT_RECIPES: Recipe[] = [
  {
    id: "woodAxe",
    name: "Wood Axe",
    detail: "Starter chopping tool",
    cost: { wood: 3 },
    owned: (game) => TOOL_TIER_RANK[game.gear.axeTier] >= TOOL_TIER_RANK.wood,
    action: (game) => {
      game.gear.axeTier = "wood";
      equipNewItem(game, "axe");
    },
  },
  {
    id: "woodPick",
    name: "Wood Pickaxe",
    detail: "Mines surface stone",
    cost: { wood: 3 },
    owned: (game) => TOOL_TIER_RANK[game.gear.pickaxeTier] >= TOOL_TIER_RANK.wood,
    action: (game) => {
      game.gear.pickaxeTier = "wood";
      equipNewItem(game, "pickaxe");
    },
  },
  {
    id: "stoneAxe",
    name: "Stone Axe",
    detail: "Stronger and faster chopping",
    cost: { wood: 3, stone: 4 },
    owned: (game) => TOOL_TIER_RANK[game.gear.axeTier] >= TOOL_TIER_RANK.stone,
    action: (game) => {
      game.gear.axeTier = "stone";
      equipNewItem(game, "axe");
    },
  },
  {
    id: "stonePick",
    name: "Stone Pickaxe",
    detail: "Mines granite and common metals",
    cost: { wood: 3, stone: 4 },
    owned: (game) => TOOL_TIER_RANK[game.gear.pickaxeTier] >= TOOL_TIER_RANK.stone,
    action: (game) => {
      game.gear.pickaxeTier = "stone";
      equipNewItem(game, "pickaxe");
    },
  },
  {
    id: "spear",
    name: "Stone Spear",
    detail: "Long reach · 17 damage",
    cost: { wood: 5, stone: 3 },
    owned: (game) => game.gear.spear,
    action: (game) => {
      game.gear.spear = true;
      game.weapon = "spear";
      equipNewItem(game, "spear");
    },
  },
  {
    id: "sword",
    name: "Iron Sword",
    detail: "Fast swing · 25 damage",
    cost: { wood: 4, iron: 7 },
    requiresBench: true,
    owned: (game) => game.gear.sword,
    action: (game) => {
      game.gear.sword = true;
      game.weapon = "sword";
      equipNewItem(game, "sword");
    },
  },
  {
    id: "bow",
    name: "Hunting Bow",
    detail: "520 range · 18 damage",
    cost: { wood: 6, fiber: 4, copper: 2 },
    requiresBench: true,
    owned: (game) => game.gear.bow,
    action: (game) => {
      game.gear.bow = true;
      game.weapon = "bow";
      equipNewItem(game, "bow");
    },
  },
  {
    id: "arrows",
    name: "Arrow Bundle ×12",
    detail: "Ammunition for bows",
    cost: { wood: 2, stone: 1 },
    action: (game) => {
      addMaterial(game, "arrows", 12);
    },
  },
  {
    id: "pistol",
    name: "Scrap Pistol",
    detail: "640 range · 34 damage",
    cost: { iron: 8, copper: 6, coal: 3, sulfur: 2 },
    requiresBench: true,
    owned: (game) => game.gear.pistol,
    action: (game) => {
      game.gear.pistol = true;
      game.weapon = "pistol";
      equipNewItem(game, "pistol");
    },
  },
  {
    id: "bullets",
    name: "Bullet Bundle ×12",
    detail: "Ammunition for pistols",
    cost: { iron: 2, coal: 1, sulfur: 2 },
    requiresBench: true,
    action: (game) => {
      addMaterial(game, "bullets", 12);
    },
  },
  {
    id: "copperArmor",
    name: "Copper Armor",
    detail: "Reduces incoming damage by 18%",
    cost: { copper: 12, hide: 5 },
    requiresBench: true,
    owned: (game) => game.gear.armor !== "none",
    action: (game) => {
      game.gear.armor = "copper";
    },
  },
  {
    id: "ironArmor",
    name: "Iron Armor",
    detail: "Reduces incoming damage by 35%",
    cost: { iron: 14, hide: 6 },
    requiresBench: true,
    owned: (game) => game.gear.armor === "iron" || game.gear.armor === "blacksteel",
    action: (game) => {
      game.gear.armor = "iron";
    },
  },
  {
    id: "blacksteelArmor",
    name: "Blacksteel Armor",
    detail: "Reduces incoming damage by 55%",
    cost: { iron: 18, coal: 10, sulfur: 4, hide: 8 },
    requiresBench: true,
    owned: (game) => game.gear.armor === "blacksteel",
    action: (game) => {
      game.gear.armor = "blacksteel";
    },
  },
  {
    id: "ironAxe",
    name: "Iron Axe",
    detail: "Advanced high-speed chopping",
    cost: { wood: 4, iron: 5 },
    requiresBench: true,
    owned: (game) => TOOL_TIER_RANK[game.gear.axeTier] >= TOOL_TIER_RANK.iron,
    action: (game) => {
      game.gear.axeTier = "iron";
      equipNewItem(game, "axe");
    },
  },
  {
    id: "ironPick",
    name: "Iron Pickaxe",
    detail: "Can mine rare Aetherium",
    cost: { wood: 4, iron: 5 },
    requiresBench: true,
    owned: (game) => TOOL_TIER_RANK[game.gear.pickaxeTier] >= TOOL_TIER_RANK.iron,
    action: (game) => {
      game.gear.pickaxeTier = "iron";
      equipNewItem(game, "pickaxe");
    },
  },
  {
    id: "aetherAxe",
    name: "Aetherium Axe",
    detail: "Super tool · five-hit chopping power",
    cost: { wood: 4, aetherium: 7, iron: 3 },
    requiresBench: true,
    owned: (game) => game.gear.axeTier === "aetherium",
    action: (game) => {
      game.gear.axeTier = "aetherium";
      equipNewItem(game, "axe");
    },
  },
  {
    id: "aetherPick",
    name: "Aetherium Pickaxe",
    detail: "Super tool · five-hit mining power",
    cost: { wood: 4, aetherium: 7, iron: 3 },
    requiresBench: true,
    owned: (game) => game.gear.pickaxeTier === "aetherium",
    action: (game) => {
      game.gear.pickaxeTier = "aetherium";
      equipNewItem(game, "pickaxe");
    },
  },
  {
    id: "bandage",
    name: "Field Bandage",
    detail: "Restore 35 health",
    cost: { fiber: 5, berries: 1 },
    action: (game) => {
      game.player.hp = Math.min(game.player.maxHp, game.player.hp + 35);
    },
  },
  ...BUILD_ORDER.map((kind): Recipe => ({
    id: "build:" + kind,
    name: BUILD_DATA[kind].name + " ×" + BUILD_DATA[kind].makes,
    detail: BUILD_DATA[kind].detail + " · crafted into inventory",
    cost: BUILD_DATA[kind].cost,
    requiresBench: !["craftingBench", "woodFence", "floor", "woodWall", "crop"].includes(kind),
    action: (game) => {
      game.kits[kind] += BUILD_DATA[kind].makes;
      ensureItemListed(game, kind);
    },
  })),
];

function ToolGlyph({ type }: { type: Tool | "pack" }) {
  return (
    <span className={"tool-glyph tool-" + type} aria-hidden="true">
      <i />
      <b />
    </span>
  );
}

function ItemVisual({ item }: { item: InventoryItem }) {
  if (["axe", "pickaxe", "spear", "sword", "bow", "pistol"].includes(item)) {
    return <ToolGlyph type={item as Tool} />;
  }
  if (isBuildKind(item)) {
    return <span className={"slot-build-mark build-" + item}>{BUILD_DATA[item].icon}</span>;
  }
  const material = MATERIALS.find((entry) => entry.id === item);
  return <span className={"resource-mark mark-" + item}>{material?.icon || item.slice(0, 2).toUpperCase()}</span>;
}

interface SlotAddress {
  area: "inventory" | "hotbar";
  index: number;
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameState>(makeGame());
  const [panel, setPanel] = useState<Panel>(null);
  const [started, setStarted] = useState(false);
  const [revision, setRevision] = useState(0);
  const [moveSource, setMoveSource] = useState<SlotAddress | null>(null);
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
      if (game.started && !game.dead) {
        updateGame(game, dt, canvas.clientWidth, canvas.clientHeight);
      }
      drawWorld(context, canvas, game);
      if (now - lastHud > 120) {
        lastHud = now;
        if (game.messageUntil > 0 && now >= game.messageUntil) game.messageUntil = 0;
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
      if (key === "shift") game.keys.add(key);
      if (event.repeat) return;
      if (key === "e") interact(game);
      if (key === " " || key === "f") {
        event.preventDefault();
        attack(game);
      }
      if (["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].includes(key)) {
        selectSlot(game, key === "0" ? 9 : Number(key) - 1);
      }
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
    const releasePrimary = () => {
      game.mouseHeld = false;
      game.buildDrag = false;
      game.lastBuildCell = null;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("pointerup", releasePrimary);
    window.addEventListener("pointercancel", releasePrimary);
    window.addEventListener("blur", releasePrimary);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("pointerup", releasePrimary);
      window.removeEventListener("pointercancel", releasePrimary);
      window.removeEventListener("blur", releasePrimary);
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
    if (game.mouseHeld && game.buildMode && (event.shiftKey || game.keys.has("shift"))) {
      game.buildDrag = true;
      primaryAction(game, true);
      refresh();
    }
  };

  const craft = (recipe: Recipe) => {
    if (recipe.requiresBench && !nearCraftingBench(game)) {
      notify(game, "Stand near a placed Crafting Bench to make " + recipe.name + ".");
      refresh();
      return;
    }
    if (recipe.owned?.(game)) {
      notify(game, recipe.name + " already crafted.");
      refresh();
      return;
    }
    if (!canAfford(game, recipe.cost)) {
      notify(game, "Not enough materials for " + recipe.name + ".");
      refresh();
      return;
    }
    pay(game, recipe.cost);
    recipe.action(game);
    notify(game, "Crafted " + recipe.name + ".");
    refresh();
  };

  const chooseBuild = (kind: BuildKind) => {
    if (game.kits[kind] <= 0) {
      notify(game, "Craft " + BUILD_DATA[kind].name + " in the Craft menu first.");
      refresh();
      return;
    }
    game.buildMode = kind;
    game.selected = "build";
    setPanel(null);
    notify(game, BUILD_DATA[kind].name + " selected — click once, or hold Shift and drag for a row.");
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

  const swapSlots = (from: SlotAddress, to: SlotAddress) => {
    const fromList = from.area === "hotbar" ? game.hotbar : game.inventory;
    const toList = to.area === "hotbar" ? game.hotbar : game.inventory;
    const moving = fromList[from.index];
    fromList[from.index] = toList[to.index];
    toList[to.index] = moving;
    setMoveSource(null);
    selectSlot(game, game.selectedSlot);
    refresh();
  };

  const inventorySlot = (area: SlotAddress["area"], index: number, movable = true) => {
    const list = area === "hotbar" ? game.hotbar : game.inventory;
    const rawItem = list[index];
    const item = rawItem && itemCount(game, rawItem) > 0 ? rawItem : null;
    const address: SlotAddress = { area, index };
    const isMoving = moveSource?.area === area && moveSource.index === index;
    return (
      <button
        key={area + index}
        className={"inventory-slot" + (area === "hotbar" && game.selectedSlot === index ? " active" : "") + (isMoving ? " moving" : "")}
        draggable={movable && Boolean(item)}
        aria-label={(area === "hotbar" ? "Hotbar " + (index === 9 ? 0 : index + 1) + ": " : "Inventory: ") + itemLabel(item, game)}
        onDragStart={() => item && setMoveSource(address)}
        onDragOver={(event) => movable && event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (moveSource) swapSlots(moveSource, address);
        }}
        onClick={() => {
          if (movable && moveSource && (moveSource.area !== area || moveSource.index !== index)) swapSlots(moveSource, address);
          else if (movable && item) setMoveSource(isMoving ? null : address);
          else if (area === "hotbar") {
            selectSlot(game, index);
            refresh();
          }
        }}
      >
        <kbd>{area === "hotbar" ? (index === 9 ? "0" : index + 1) : ""}</kbd>
        {item ? <ItemVisual item={item} /> : <span className="empty-slot" />}
        {item && <span className="slot-name">{itemLabel(item, game)}</span>}
        {item && itemCount(game, item) > 1 && <b className="stack-count">{itemCount(game, item)}</b>}
      </button>
    );
  };

  const toolName =
    game.selected === "sword"
      ? "Iron Sword"
      : game.selected === "spear"
        ? "Stone Spear"
        : game.selected === "bow"
          ? "Hunting Bow · " + game.resources.arrows + " arrows"
      : game.selected === "pistol"
            ? "Scrap Pistol · " + game.resources.bullets + " bullets"
      : game.selected === "pickaxe"
        ? itemLabel("pickaxe", game)
        : game.selected === "axe"
          ? itemLabel("axe", game)
          : isFoodItem(game.selected)
            ? itemLabel(game.selected, game) + " · " + game.resources[game.selected]
            : game.buildMode
              ? BUILD_DATA[game.buildMode].name
              : itemLabel(game.hotbar[game.selectedSlot], game);
  const prompt = nearbyPrompt(game);
  const promptKey = prompt.startsWith("TOOL")
    ? "HOLD LMB"
    : prompt.startsWith("BUILD")
      ? "LMB / SHIFT+DRAG"
      : "E";
  const promptText = prompt.replace(/^(E|TOOL|BUILD) · /, "");
  const messageVisible = game.messageUntil > 0;
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
          game.mouseHeld = false;
          game.buildDrag = false;
          game.lastBuildCell = null;
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          pointerMove(event);
          event.currentTarget.setPointerCapture(event.pointerId);
          game.mouseHeld = true;
          game.buildDrag = event.shiftKey;
          game.lastBuildCell = null;
          primaryAction(game);
          refresh();
        }}
        onPointerUp={(event) => {
          game.mouseHeld = false;
          game.buildDrag = false;
          game.lastBuildCell = null;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onContextMenu={(event) => event.preventDefault()}
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

        <div className="brand-pill"><span>H</span><strong>HALFLIGHT</strong><small>{caveForRealm(game.realm)?.name.toUpperCase() || (inForest(game.player.x, game.player.y) ? "THE BLACKWOOD" : "THE MEADOW")}</small></div>

        <section className="resource-strip" aria-label="Resources">
          {MATERIALS.filter((material) => ["wood", "stone", "iron", "copper", "aetherium", "berries"].includes(material.id)).map((material) => (
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
        <small>{game.kills} threats defeated · wave {game.wave || "—"} · {game.gear.armor === "none" ? "no armor" : game.gear.armor + " armor"}</small>
      </section>

      <section className="zoom-panel" aria-label="Camera zoom">
        <button onClick={() => zoom(0.12)} aria-label="Zoom in">+</button>
        <span>{Math.round(game.zoom * 100)}%</span>
        <button onClick={() => zoom(-0.12)} aria-label="Zoom out">−</button>
      </section>

      {messageVisible && <div className="game-toast">{game.message}</div>}
      {prompt && <div className="interact-prompt"><kbd>{promptKey}</kbd><span>{promptText}</span></div>}
      {game.buildMode && <div className="build-mode-banner"><b>GRID BUILD</b><span>{BUILD_DATA[game.buildMode].name} · {game.kits[game.buildMode]} ready</span><button onClick={() => { game.buildMode = null; game.selected = "hands"; refresh(); }}>Cancel <kbd>Esc</kbd></button></div>}

      <nav className="hotbar" aria-label="Equipment hotbar">
        {game.hotbar.map((_, index) => inventorySlot("hotbar", index, false))}
        <button className="hotbar-pack" onClick={() => setPanel("inventory")} aria-label="Open free inventory">
          <kbd>I</kbd><ToolGlyph type="pack" /><span>Inventory</span>
        </button>
        <div className="equipped-label"><small>EQUIPPED</small><strong>{toolName}</strong></div>
      </nav>

      <aside className="key-guide">
        <span><kbd>WASD</kbd> Move</span>
        <span><kbd>E</kbd> Interact</span>
        <span><kbd>HOLD LMB</kbd> Use tool</span>
        <span><kbd>SHIFT+DRAG</kbd> Multi-build</span>
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
        <button
          className="touch-attack"
          onPointerDown={() => {
            game.mouseHeld = true;
            game.buildDrag = true;
            game.lastBuildCell = null;
            primaryAction(game);
            refresh();
          }}
          onPointerUp={() => {
            game.mouseHeld = false;
            game.buildDrag = false;
            game.lastBuildCell = null;
          }}
          onPointerLeave={() => {
            game.mouseHeld = false;
            game.buildDrag = false;
            game.lastBuildCell = null;
          }}
        >Hold tool</button>
      </div>

      {panel && (
        <div className="panel-scrim" onPointerDown={() => setPanel(null)}>
          <aside className="game-panel" onPointerDown={(event) => event.stopPropagation()}>
            <header>
              <div><small>SURVIVAL KIT</small><h2>{panel === "inventory" ? "Backpack" : panel === "craft" ? "Crafting" : "Ready Pieces"}</h2></div>
              <button onClick={() => setPanel(null)} aria-label="Close panel">×</button>
            </header>
            <nav className="panel-tabs">
              <button className={panel === "inventory" ? "active" : ""} onClick={() => setPanel("inventory")}>Inventory <kbd>I</kbd></button>
              <button className={panel === "craft" ? "active" : ""} onClick={() => setPanel("craft")}>Craft <kbd>C</kbd></button>
              <button className={panel === "build" ? "active" : ""} onClick={() => setPanel("build")}>Ready pieces <kbd>Q</kbd></button>
            </nav>
            <div className="panel-content">
              {panel === "inventory" && (
                <>
                  <div className="inventory-help">
                    <b>Free inventory</b>
                    <span>Drag any stack, tool, weapon, or building piece to any slot. On touch, tap an item and then its destination.</span>
                  </div>
                  <h3>Backpack · 30 slots</h3>
                  <div className="free-inventory">
                    {game.inventory.map((_, index) => inventorySlot("inventory", index))}
                  </div>
                  <h3>Hotbar · 10 slots</h3>
                  <div className="free-inventory inventory-hotbar-row">
                    {game.hotbar.map((_, index) => inventorySlot("hotbar", index))}
                  </div>
                  <div className="taming-tip"><span>♥</span><div><b>Taming wildlife</b><p>Move berries, mushrooms, or meat onto the hotbar, equip one, and feed an animal three times with E.</p></div></div>
                </>
              )}
              {panel === "craft" && (
                <>
                  <div className="inventory-help bench-status">
                    <b>{nearCraftingBench(game) ? "Crafting Bench in range" : "Hand crafting"}</b>
                    <span>{nearCraftingBench(game) ? "Advanced tools, weapons, and construction pieces are unlocked." : "Craft starter tools and a bench. Place the bench, then stand near it for advanced recipes."}</span>
                  </div>
                  <div className="recipe-list">
                    {CRAFT_RECIPES.map((recipe) => {
                      const owned = Boolean(recipe.owned?.(game));
                      const needsBench = Boolean(recipe.requiresBench && !nearCraftingBench(game));
                      return (
                        <article key={recipe.id}>
                          <div className="recipe-badge">{recipe.name.slice(0, 2).toUpperCase()}</div>
                          <div><h3>{recipe.name}</h3><p>{recipe.detail}</p><small>{costLabel(recipe.cost)}{recipe.requiresBench ? " · bench" : ""}</small></div>
                          <button disabled={!canAfford(game, recipe.cost) || owned || needsBench} onClick={() => craft(recipe)}>{owned ? "Owned" : needsBench ? "Need bench" : "Craft"}</button>
                        </article>
                      );
                    })}
                  </div>
                </>
              )}
              {panel === "build" && (
                <>
                  <p className="panel-intro">These are completed pieces from your inventory. Craft more in the Craft menu, then place them on the 48px grid.</p>
                  <div className="build-grid">
                    {BUILD_ORDER.map((kind) => {
                      const data = BUILD_DATA[kind];
                      return (
                        <article key={kind}>
                          <div className={"build-badge build-" + kind}>{data.icon}</div>
                          <div><h3>{data.name}</h3><p>{data.detail}</p><small>Crafted pieces only</small></div>
                          <footer><span>{game.kits[kind]} ready</span><button disabled={game.kits[kind] <= 0} onClick={() => chooseBuild(kind)}>{game.kits[kind] > 0 ? "Place" : "Not crafted"}</button></footer>
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
          <div><span><kbd>WASD</kbd> Move</span><span><kbd>E</kbd> Interact</span><span><kbd>HOLD LMB</kbd> Use tool</span></div>
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

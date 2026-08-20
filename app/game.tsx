"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CaveRealm = "caveSystem";
type CaveZone = "granite" | "iron" | "sulfur";
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
type ToolTier = "none" | "wood" | "stone" | "iron" | "aetherium";
type DurableTool =
  | "woodAxe"
  | "stoneAxe"
  | "ironAxe"
  | "aetheriumAxe"
  | "woodPickaxe"
  | "stonePickaxe"
  | "ironPickaxe"
  | "aetheriumPickaxe";
type Tool = DurableTool | "hammer" | "spear" | "sword" | "bow" | "pistol" | FoodMaterial | "build" | "hands";
type ToolGlyphKind = "axe" | "pickaxe" | "hammer" | "spear" | "sword" | "bow" | "pistol" | "pack";
type BuildKind =
  | "craftingBench"
  | "storageChest"
  | "bedroll"
  | "torch"
  | "campfire"
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

interface CaveTreasure {
  id: number;
  realm: CaveRealm;
  x: number;
  y: number;
  opened: boolean;
  loot: Partial<Record<Material, number>>;
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
  dir: number;
  structureHitAt: number;
  boss: boolean;
  homeX: number;
  homeY: number;
  provokedUntil: number;
  respawnAt: number;
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
  construction: number;
  deconstruction: number;
  restedDay: number;
  storage?: Partial<Record<Material, number>>;
}

interface WorkOrder {
  buildingId: number;
  action: "construct" | "deconstruct";
  progress: number;
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
    hammer: boolean;
    toolDurability: Record<DurableTool, number>;
    armor: ArmorKind;
  };
  kits: Record<BuildKind, number>;
  selected: Tool;
  selectedSlot: number;
  weapon: "spear" | "sword" | "bow" | "pistol";
  inventory: (InventoryItem | null)[];
  hotbar: (InventoryItem | null)[];
  buildMode: BuildKind | null;
  openChestId: number | null;
  workOrders: WorkOrder[];
  nodes: ResourceNode[];
  treasures: CaveTreasure[];
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
const CONSTRUCTION_SECONDS = 3;
const DECONSTRUCTION_SECONDS = 2.25;
const BUILDING_HALF_SIZE = 23;
const SPAWN_X = 2780;
const SPAWN_Y = 1940;
const FOREST_X = 1320;
const FOREST_Y = 2080;
const FOREST_RX = 1120;
const FOREST_RY = 1500;

interface CaveDefinition {
  id: CaveZone;
  name: string;
  entranceX: number;
  entranceY: number;
  undergroundX: number;
  undergroundY: number;
  chamberRadius: number;
  ground: string;
  textureA: string;
  textureB: string;
}

const CAVES: CaveDefinition[] = [
  {
    id: "granite",
    name: "Granite Hollow",
    entranceX: 4720,
    entranceY: 480,
    undergroundX: 860,
    undergroundY: 900,
    chamberRadius: 570,
    ground: "#444f4a",
    textureA: "#52605a",
    textureB: "#35423d",
  },
  {
    id: "iron",
    name: "Iron Delve",
    entranceX: 4420,
    entranceY: 3260,
    undergroundX: 4300,
    undergroundY: 980,
    chamberRadius: 600,
    ground: "#494b4b",
    textureA: "#5a5c5b",
    textureB: "#393c3c",
  },
  {
    id: "sulfur",
    name: "Sulfur Grotto",
    entranceX: 650,
    entranceY: 470,
    undergroundX: 2580,
    undergroundY: 3100,
    chamberRadius: 620,
    ground: "#4d4d39",
    textureA: "#626044",
    textureB: "#3d3e31",
  },
];

const CAVE_HUB = { x: 2580, y: 1830, radius: 520 };
const CAVE_TUNNEL_HALF_WIDTH = 185;
const CAVE_CONNECTIONS = CAVES.map((cave) => [
  { x: cave.undergroundX, y: cave.undergroundY },
  CAVE_HUB,
] as const);

function caveEncounterPoint(cave: CaveDefinition, distance: number, lateral = 0) {
  const angle = Math.atan2(cave.undergroundY - CAVE_HUB.y, cave.undergroundX - CAVE_HUB.x);
  return {
    x: cave.undergroundX + Math.cos(angle) * distance - Math.sin(angle) * lateral,
    y: cave.undergroundY + Math.sin(angle) * distance + Math.cos(angle) * lateral,
  };
}

const MATERIALS: { id: Material; name: string }[] = [
  { id: "wood", name: "Wood" },
  { id: "stone", name: "Stone" },
  { id: "granite", name: "Granite" },
  { id: "iron", name: "Iron" },
  { id: "copper", name: "Copper" },
  { id: "coal", name: "Coal" },
  { id: "sulfur", name: "Sulfur" },
  { id: "aetherium", name: "Aetherium" },
  { id: "fiber", name: "Fiber" },
  { id: "berries", name: "Berries" },
  { id: "meat", name: "Meat" },
  { id: "mushrooms", name: "Mushrooms" },
  { id: "seeds", name: "Seeds" },
  { id: "hide", name: "Hide" },
  { id: "arrows", name: "Arrows" },
  { id: "bullets", name: "Bullets" },
];

const BUILD_DATA: Record<
  BuildKind,
  { name: string; detail: string; icon: string; cost: Partial<Record<Material, number>>; makes: number; hp: number }
> = {
  craftingBench: { name: "Crafting Bench", detail: "Unlocks advanced crafting nearby", icon: "CB", cost: { wood: 4, stone: 2 }, makes: 1, hp: 85 },
  storageChest: { name: "Storage Chest", detail: "Holds separate resource stacks", icon: "CH", cost: { wood: 5, fiber: 2 }, makes: 1, hp: 110 },
  bedroll: { name: "Bedroll", detail: "Rest once each day to recover health", icon: "BR", cost: { wood: 2, fiber: 4 }, makes: 1, hp: 50 },
  torch: { name: "Standing Torch", detail: "A small permanent light", icon: "TO", cost: { wood: 2, fiber: 1, coal: 1 }, makes: 2, hp: 35 },
  campfire: { name: "Campfire", detail: "A broad pool of warmth and light", icon: "CF", cost: { wood: 4, stone: 4, coal: 1 }, makes: 1, hp: 80 },
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
  "storageChest",
  "bedroll",
  "torch",
  "campfire",
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
const MAX_TAMED_ANIMALS = 5;
const ANIMAL_RESPAWN_MS = 120000;
const ANIMAL_LURE_DISTANCE = 360;

const ANIMAL_DATA: Record<
  AnimalKind,
  {
    hp: number;
    speed: number;
    damage: number;
    temperament: "aggressive" | "skittish";
    noticeDistance: number;
    tameChance: number;
    startingCount: number;
  }
> = {
  bear: { hp: 70, speed: 48, damage: 9, temperament: "aggressive", noticeDistance: 135, tameChance: 0.1, startingCount: 1 },
  boar: { hp: 44, speed: 55, damage: 6, temperament: "aggressive", noticeDistance: 90, tameChance: 0.24, startingCount: 2 },
  deer: { hp: 36, speed: 74, damage: 0, temperament: "skittish", noticeDistance: 150, tameChance: 0.42, startingCount: 7 },
  rabbit: { hp: 18, speed: 84, damage: 0, temperament: "skittish", noticeDistance: 110, tameChance: 0.6, startingCount: 10 },
  fox: { hp: 30, speed: 78, damage: 0, temperament: "skittish", noticeDistance: 125, tameChance: 0.32, startingCount: 3 },
  wolf: { hp: 50, speed: 70, damage: 8, temperament: "aggressive", noticeDistance: 120, tameChance: 0.16, startingCount: 1 },
};

const ITEM_LABELS: Partial<Record<InventoryItem, string>> = {
  woodAxe: "Wood Axe",
  stoneAxe: "Stone Axe",
  ironAxe: "Iron Axe",
  aetheriumAxe: "Aetherium Axe",
  woodPickaxe: "Wood Pickaxe",
  stonePickaxe: "Stone Pickaxe",
  ironPickaxe: "Iron Pickaxe",
  aetheriumPickaxe: "Aetherium Pickaxe",
  hammer: "Deconstruction Hammer",
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

const DURABLE_TOOL_DATA: Record<
  DurableTool,
  { family: "axe" | "pickaxe"; tier: Exclude<ToolTier, "none">; maxDurability: number; damage: number }
> = {
  woodAxe: { family: "axe", tier: "wood", maxDurability: 36, damage: 7 },
  stoneAxe: { family: "axe", tier: "stone", maxDurability: 72, damage: 9 },
  ironAxe: { family: "axe", tier: "iron", maxDurability: 120, damage: 14 },
  aetheriumAxe: { family: "axe", tier: "aetherium", maxDurability: 180, damage: 22 },
  woodPickaxe: { family: "pickaxe", tier: "wood", maxDurability: 36, damage: 5 },
  stonePickaxe: { family: "pickaxe", tier: "stone", maxDurability: 72, damage: 7 },
  ironPickaxe: { family: "pickaxe", tier: "iron", maxDurability: 120, damage: 11 },
  aetheriumPickaxe: { family: "pickaxe", tier: "aetherium", maxDurability: 180, damage: 18 },
};

function isDurableTool(item: InventoryItem | null): item is DurableTool {
  return Boolean(item && item in DURABLE_TOOL_DATA);
}

function durableToolInfo(item: InventoryItem | null) {
  return isDurableTool(item) ? DURABLE_TOOL_DATA[item] : null;
}

function isFoodItem(item: InventoryItem | null): item is FoodMaterial {
  return item === "berries" || item === "mushrooms" || item === "meat";
}

function itemLabel(item: InventoryItem | null, game?: GameState) {
  if (!item) return "Empty";
  if (isBuildKind(item)) return BUILD_DATA[item].name;
  if (isDurableTool(item) && game) return ITEM_LABELS[item] || item;
  return ITEM_LABELS[item] || item;
}

function itemCount(game: GameState, item: InventoryItem | null) {
  if (!item) return 0;
  if (isBuildKind(item)) return game.kits[item];
  if (isMaterial(item)) return game.resources[item];
  if (isDurableTool(item)) return game.gear.toolDurability[item] > 0 ? 1 : 0;
  if (item === "hammer") return game.gear.hammer ? 1 : 0;
  if (item === "spear") return game.gear.spear ? 1 : 0;
  if (item === "sword") return game.gear.sword ? 1 : 0;
  if (item === "bow") return game.gear.bow ? 1 : 0;
  if (item === "pistol") return game.gear.pistol ? 1 : 0;
  return 0;
}

function ensureItemListed(game: GameState, item: InventoryItem) {
  if (game.hotbar.includes(item) || game.inventory.includes(item)) return;
  const openHotbar = game.hotbar.findIndex((entry) => entry === null);
  if (openHotbar >= 0 && (isDurableTool(item) || item === "hammer" || item === "spear" || item === "sword" || item === "bow" || item === "pistol")) {
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

function pointToSegmentDistance(
  x: number,
  y: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) {
  const dx = endX - startX;
  const dy = endY - startY;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared
    ? Math.max(0, Math.min(1, ((x - startX) * dx + (y - startY) * dy) / lengthSquared))
    : 0;
  return Math.hypot(x - (startX + dx * t), y - (startY + dy * t));
}

function isCaveFloor(x: number, y: number, padding = 0) {
  if (Math.hypot(x - CAVE_HUB.x, y - CAVE_HUB.y) <= CAVE_HUB.radius - padding) return true;
  if (
    CAVES.some(
      (cave) =>
        Math.hypot(x - cave.undergroundX, y - cave.undergroundY) <= cave.chamberRadius - padding,
    )
  ) return true;
  return CAVE_CONNECTIONS.some(
    ([start, end]) =>
      pointToSegmentDistance(x, y, start.x, start.y, end.x, end.y) <= CAVE_TUNNEL_HALF_WIDTH - padding,
  );
}

function caveAreaAt(x: number, y: number) {
  return [...CAVES].sort(
    (a, b) =>
      Math.hypot(x - a.undergroundX, y - a.undergroundY) -
      Math.hypot(x - b.undergroundX, y - b.undergroundY),
  )[0];
}

function nearbyCaveEntrance(game: GameState) {
  if (game.realm !== "meadow") return null;
  return CAVES.find(
    (cave) => Math.hypot(game.player.x - cave.entranceX, game.player.y - cave.entranceY) < 110,
  ) || null;
}

function nearbyCaveExit(game: GameState) {
  if (game.realm !== "caveSystem") return null;
  return CAVES.find(
    (cave) => Math.hypot(game.player.x - cave.undergroundX, game.player.y - cave.undergroundY) < 110,
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
  const treasureCave = CAVES[Math.floor(Math.random() * CAVES.length)];
  const guardianCave = CAVES[Math.floor(Math.random() * CAVES.length)];
  const treasurePoint = caveEncounterPoint(treasureCave, treasureCave.chamberRadius * 0.48, -95);
  const guardianPoint = caveEncounterPoint(guardianCave, guardianCave.chamberRadius * 0.38, 95);
  const addNode = (kind: ResourceKind, realm: Realm, x: number, y: number) => {
    const blocksMovement = isTree(kind) || isMineable(kind);
    const clearSpawn = realm !== "meadow" || !blocksMovement || Math.hypot(x - SPAWN_X, y - SPAWN_Y) > 360;
    const clearExit =
      realm === "meadow" ||
      CAVES.every((cave) => Math.hypot(x - cave.undergroundX, y - cave.undergroundY) > 340);
    const clearCave =
      realm !== "meadow" ||
      CAVES.every((cave) => Math.hypot(x - cave.entranceX, y - cave.entranceY) > 210);
    const insideCave = realm !== "caveSystem" || isCaveFloor(x, y, nodeRadius(kind) + 32);
    const clearCaveNode =
      realm !== "caveSystem" ||
      !blocksMovement ||
      nodes.every(
        (node) =>
          node.realm !== realm ||
          !isMineable(node.kind) ||
          Math.hypot(x - node.x, y - node.y) > nodeRadius(kind) + nodeRadius(node.kind) + 30,
      );
    const clearEncounter =
      realm !== "caveSystem" ||
      (Math.hypot(x - treasurePoint.x, y - treasurePoint.y) > nodeRadius(kind) + 75 &&
        Math.hypot(x - guardianPoint.x, y - guardianPoint.y) > nodeRadius(kind) + 95);
    if (!clearSpawn || !clearExit || !clearCave || !insideCave || !clearCaveNode || !clearEncounter) return;
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
  for (let i = 0; i < 8; i++) {
    addNode(
      i % 3 === 0 ? "copperOre" : "ironOre",
      "meadow",
      180 + seeded(i, 131) * (WORLD_W - 360),
      180 + seeded(i, 132) * (WORLD_H - 360),
    );
  }
  for (let i = 0; i < 1; i++) {
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
    for (let i = 0; i < 68; i++) {
      const roll = i % 24;
      let kind: ResourceKind;
      if (cave.id === "granite") {
        kind = roll % 4 === 0 ? "granite" : roll === 1 ? "coal" : roll === 5 || roll === 17 ? "mushroom" : "rock";
      } else if (cave.id === "iron") {
        kind = i === 67 ? "aetherOre" : roll === 0 || roll === 12 ? "ironOre" : roll === 7 ? "copperOre" : roll === 3 ? "coal" : roll === 9 ? "granite" : "rock";
      } else {
        kind = roll === 0 || roll === 8 || roll === 16 ? "sulfur" : roll === 5 || roll === 15 ? "coal" : roll === 3 || roll === 19 ? "mushroom" : roll === 11 ? "copperOre" : "rock";
      }
      const angle = seeded(i, 90 + caveIndex * 11) * Math.PI * 2;
      const distance = 150 + Math.sqrt(seeded(i, 91 + caveIndex * 11)) * (cave.chamberRadius - 235);
      addNode(
        kind,
        "caveSystem",
        cave.undergroundX + Math.cos(angle) * distance,
        cave.undergroundY + Math.sin(angle) * distance,
      );
    }
  }

  const treasures: CaveTreasure[] = [
    {
      id: id++,
      realm: "caveSystem",
      x: treasurePoint.x,
      y: treasurePoint.y,
      opened: false,
      loot: { granite: 4, iron: 5, copper: 4, coal: 3, sulfur: 3, aetherium: 2 },
    },
  ];
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
    creatures.push({ id: id++, kind, realm: "meadow", x, y, hp: stats.hp, maxHp: stats.hp, speed: stats.speed, damage: stats.damage, fed: 0, tame: false, angry: false, hitAt: 0, phase, slowUntil: 0, rewarded: false, dir: phase, structureHitAt: 0, boss: false, homeX: x, homeY: y, provokedUntil: 0, respawnAt: 0 });
  };
  for (let i = 0; i < 24; i++) {
    const x = FOREST_X + (seeded(i, 61) - 0.5) * FOREST_RX * 1.55;
    const y = FOREST_Y + (seeded(i, 62) - 0.5) * FOREST_RY * 1.55;
    const kind: AnimalKind = i % 8 === 0 ? "bear" : i % 5 === 0 ? "wolf" : i % 4 === 0 ? "boar" : i % 3 === 0 ? "deer" : i % 2 === 0 ? "fox" : "rabbit";
    addAnimal(kind, x, y, i * 0.73);
  }
  creatures.push({
    id: id++,
    kind: "maw",
    realm: "caveSystem",
    x: guardianPoint.x,
    y: guardianPoint.y,
    hp: 240,
    maxHp: 240,
    speed: 34,
    damage: 22,
    fed: 0,
    tame: false,
    angry: false,
    hitAt: 0,
    phase: 19.7,
    slowUntil: 0,
    rewarded: false,
    dir: Math.atan2(CAVE_HUB.y - guardianPoint.y, CAVE_HUB.x - guardianPoint.x),
    structureHitAt: 0,
    boss: true,
    homeX: guardianPoint.x,
    homeY: guardianPoint.y,
    provokedUntil: 0,
    respawnAt: 0,
  });
  const startingCampfire: Building = {
    id: id++,
    kind: "campfire",
    realm: "meadow",
    gx: 57,
    gy: 40,
    hp: BUILD_DATA.campfire.hp,
    maxHp: BUILD_DATA.campfire.hp,
    open: false,
    growth: 0,
    triggerAt: 0,
    construction: 1,
    deconstruction: 0,
    restedDay: 0,
  };
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
    gear: {
      spear: false,
      sword: false,
      bow: false,
      pistol: false,
      hammer: false,
      toolDurability: {
        woodAxe: DURABLE_TOOL_DATA.woodAxe.maxDurability,
        stoneAxe: 0,
        ironAxe: 0,
        aetheriumAxe: 0,
        woodPickaxe: 0,
        stonePickaxe: 0,
        ironPickaxe: 0,
        aetheriumPickaxe: 0,
      },
      armor: "none",
    },
    kits: {
      craftingBench: 0,
      storageChest: 0,
      bedroll: 0,
      torch: 0,
      campfire: 0,
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
    hotbar: ["berries", "woodAxe", null, null, null, null, null, null, null, null],
    buildMode: null,
    openChestId: null,
    workOrders: [],
    nodes,
    treasures,
    creatures,
    buildings: [startingCampfire],
    projectiles: [],
    keys: new Set(),
    mouseHeld: false,
    buildDrag: false,
    lastBuildCell: null,
    pointer: { x: 0, y: 0, worldX: 0, worldY: 0, active: false },
    camera: { x: SPAWN_X, y: SPAWN_Y },
    message: "Your Wood Axe is in slot 2 and a campfire is already lit. Gather before nightfall.",
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
    let x = game.player.x;
    let y = game.player.y;
    for (let attempt = 0; attempt < 160; attempt++) {
      const candidateIndex = i * 211 + attempt * 2;
      const candidateX = 70 + seeded(candidateIndex, game.day * 17 + 101) * (WORLD_W - 140);
      const candidateY = 70 + seeded(candidateIndex + 1, game.day * 19 + 103) * (WORLD_H - 140);
      if (Math.hypot(candidateX - game.player.x, candidateY - game.player.y) < 360) continue;
      if (game.realm === "caveSystem" && !isCaveFloor(candidateX, candidateY, 38)) continue;
      if (blockingBuildingAt(game, game.realm, candidateX, candidateY, 24)) continue;
      if (
        game.nodes.some(
          (node) =>
            node.realm === game.realm &&
            node.hp > 0 &&
            (isTree(node.kind) || isMineable(node.kind)) &&
            distanceToNodeFootprint(node, candidateX, candidateY, 20) === 0,
        )
      ) continue;
      x = candidateX;
      y = candidateY;
      break;
    }
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
      dir: Math.atan2(game.player.y - y, game.player.x - x),
      structureHitAt: 0,
      boss: false,
      homeX: x,
      homeY: y,
      provokedUntil: 0,
      respawnAt: 0,
    });
  }
  notify(game, "NIGHT " + game.day + " — " + count + " horrors have entered the hunt.", 4300);
}

function activeTool(game: GameState): Tool {
  const order = game.workOrders[0];
  const building = order && game.buildings.find((candidate) => candidate.id === order.buildingId);
  if (
    order?.action === "construct" &&
    building?.realm === game.realm &&
    distanceToBuilding(building, game.player.x, game.player.y) <= 58 &&
    !movementInput(game)
  ) return "build";
  return game.selected;
}

function nearCraftingBench(game: GameState) {
  return game.buildings.some(
    (building) =>
      building.kind === "craftingBench" &&
      building.realm === game.realm &&
      building.hp > 0 &&
      building.construction >= 1 &&
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

function nearestTreasure(game: GameState, maxDistance: number) {
  let found: CaveTreasure | null = null;
  let best = maxDistance;
  for (const treasure of game.treasures) {
    if (treasure.realm !== game.realm || treasure.opened) continue;
    const distance = Math.hypot(treasure.x - game.player.x, treasure.y - game.player.y);
    if (distance < best) {
      best = distance;
      found = treasure;
    }
  }
  return found;
}

function distanceToNodeFootprint(node: ResourceNode, x: number, y: number, padding = 0) {
  return Math.max(0, Math.hypot(node.x - x, node.y - y) - nodeRadius(node.kind) - padding);
}

function rayEntryToNode(game: GameState, node: ResourceNode, padding = 10) {
  const aimX = game.pointer.worldX - game.player.x;
  const aimY = game.pointer.worldY - game.player.y;
  const aimLength = Math.hypot(aimX, aimY);
  if (aimLength < 0.001) return null;
  const unitX = aimX / aimLength;
  const unitY = aimY / aimLength;
  const nodeX = node.x - game.player.x;
  const nodeY = node.y - game.player.y;
  const projection = nodeX * unitX + nodeY * unitY;
  const radius = nodeRadius(node.kind) + padding;
  if (projection < -radius) return null;
  const perpendicularSquared = nodeX * nodeX + nodeY * nodeY - projection * projection;
  if (perpendicularSquared > radius * radius) return null;
  return Math.max(0, projection - Math.sqrt(Math.max(0, radius * radius - perpendicularSquared)));
}

function targetNode(game: GameState, maxDistance: number) {
  if (game.pointer.active) {
    const reachable = game.nodes.filter(
      (node) =>
        node.realm === game.realm &&
        node.hp > 0 &&
        distanceToNodeFootprint(node, game.player.x, game.player.y) <= maxDistance,
    );
    const pointed = reachable
      .filter((node) => distanceToNodeFootprint(node, game.pointer.worldX, game.pointer.worldY, 12) === 0)
      .sort(
        (a, b) =>
          distanceToNodeFootprint(a, game.pointer.worldX, game.pointer.worldY) -
          distanceToNodeFootprint(b, game.pointer.worldX, game.pointer.worldY),
      )[0];
    if (pointed) return pointed;

    return reachable
      .map((node) => ({ node, entry: rayEntryToNode(game, node) }))
      .filter((target): target is { node: ResourceNode; entry: number } => target.entry !== null && target.entry <= maxDistance)
      .sort((a, b) => a.entry - b.entry)[0]?.node || null;
  }
  return nearestNode(game, maxDistance);
}

function buildLayer(kind: BuildKind) {
  if (kind === "floor") return "floor";
  if (kind === "roof") return "roof";
  return "solid";
}

function blocksMovementKind(kind: BuildKind) {
  return !["floor", "roof", "bedroll", "torch", "campfire", "spikes", "snare", "fireTrap", "crop"].includes(kind);
}

function isSolidBuilding(building: Building) {
  if (building.hp <= 0 || building.construction < 1 || !blocksMovementKind(building.kind)) return false;
  return !(["woodGate", "stoneGate", "door"].includes(building.kind) && building.open);
}

function distanceToBuilding(building: Building, x: number, y: number, padding = 0) {
  const dx = Math.max(Math.abs(x - building.gx * GRID) - BUILDING_HALF_SIZE - padding, 0);
  const dy = Math.max(Math.abs(y - building.gy * GRID) - BUILDING_HALF_SIZE - padding, 0);
  return Math.hypot(dx, dy);
}

function blockingBuildingAt(game: GameState, realm: Realm, x: number, y: number, radius: number) {
  return game.buildings.find(
    (building) =>
      building.realm === realm &&
      isSolidBuilding(building) &&
      distanceToBuilding(building, x, y, radius) === 0,
  ) || null;
}

function creatureRadius(creature: Creature) {
  if (creature.boss) return 49;
  if (creature.kind === "maw" || creature.kind === "bear" || creature.kind === "brute") return 27;
  if (creature.kind === "rabbit") return 14;
  return 20;
}

function cancelBuildMode(game: GameState) {
  game.buildMode = null;
  game.selected = "hands";
  game.mouseHeld = false;
  game.buildDrag = false;
  game.lastBuildCell = null;
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
  if (game.realm === "caveSystem" && !isCaveFloor(x, y, BUILDING_HALF_SIZE + 10)) return false;
  if (
    game.treasures.some(
      (treasure) =>
        treasure.realm === game.realm &&
        Math.hypot(treasure.x - x, treasure.y - y) < BUILDING_HALF_SIZE + 34,
    )
  ) return false;
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
  if (
    blocksMovementKind(kind) &&
    (Math.hypot(game.player.x - x, game.player.y - y) < BUILDING_HALF_SIZE + 25 ||
      game.creatures.some(
        (creature) =>
          creature.realm === game.realm &&
          creature.hp > 0 &&
          Math.hypot(creature.x - x, creature.y - y) < BUILDING_HALF_SIZE + creatureRadius(creature),
      ))
  ) return false;
  return !game.buildings.some(
    (building) =>
      building.realm === game.realm &&
      building.gx === gx &&
      building.gy === gy &&
      buildLayer(building.kind) === buildLayer(kind),
  );
}

function placeBuild(game: GameState, quiet = false, keepPlacing = false) {
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
  const building: Building = {
    id: game.lastId++,
    kind,
    realm: game.realm,
    gx: cell.gx,
    gy: cell.gy,
    hp: Math.max(1, Math.ceil(BUILD_DATA[kind].hp * 0.15)),
    maxHp: BUILD_DATA[kind].hp,
    open: false,
    growth: 0,
    triggerAt: 0,
    construction: 0,
    deconstruction: 0,
    restedDay: 0,
    storage: kind === "storageChest" ? {} : undefined,
  };
  game.buildings.push(building);
  game.workOrders.push({ buildingId: building.id, action: "construct", progress: 0 });
  if (!quiet) {
    notify(
      game,
      BUILD_DATA[kind].name + " blueprint placed. Moving in to build it.",
    );
  }
  if (!keepPlacing || game.kits[kind] <= 0) cancelBuildMode(game);
  return true;
}

function rayEntryToBuilding(game: GameState, building: Building, padding = 10) {
  const aimX = game.pointer.worldX - game.player.x;
  const aimY = game.pointer.worldY - game.player.y;
  const aimLength = Math.hypot(aimX, aimY);
  if (aimLength < 0.001) return null;
  const unitX = aimX / aimLength;
  const unitY = aimY / aimLength;
  const buildingX = building.gx * GRID - game.player.x;
  const buildingY = building.gy * GRID - game.player.y;
  const projection = buildingX * unitX + buildingY * unitY;
  const radius = BUILDING_HALF_SIZE * Math.SQRT2 + padding;
  if (projection < -radius) return null;
  const perpendicularSquared = buildingX * buildingX + buildingY * buildingY - projection * projection;
  if (perpendicularSquared > radius * radius) return null;
  return Math.max(0, projection - Math.sqrt(Math.max(0, radius * radius - perpendicularSquared)));
}

function targetBuilding(game: GameState, maxDistance: number) {
  const reachable = game.buildings.filter(
    (building) =>
      building.realm === game.realm &&
      building.hp > 0 &&
      distanceToBuilding(building, game.player.x, game.player.y) <= maxDistance,
  );
  if (game.pointer.active) {
    const pointed = reachable
      .filter((building) => distanceToBuilding(building, game.pointer.worldX, game.pointer.worldY, 10) === 0)
      .sort(
        (a, b) =>
          distanceToBuilding(a, game.pointer.worldX, game.pointer.worldY) -
          distanceToBuilding(b, game.pointer.worldX, game.pointer.worldY),
      )[0];
    if (pointed) return pointed;
    return reachable
      .map((building) => ({ building, entry: rayEntryToBuilding(game, building) }))
      .filter((target): target is { building: Building; entry: number } => target.entry !== null && target.entry <= maxDistance)
      .sort((a, b) => a.entry - b.entry)[0]?.building || null;
  }
  return reachable.sort(
    (a, b) =>
      distanceToBuilding(a, game.player.x, game.player.y) -
      distanceToBuilding(b, game.player.x, game.player.y),
  )[0] || null;
}

function startDeconstruction(game: GameState) {
  const now = performance.now();
  if (now < game.player.useReady) return;
  const building = targetBuilding(game, 118);
  if (!building) {
    notify(game, "Aim the hammer at a nearby structure.", 900);
    game.player.useReady = now + 450;
    return;
  }
  const activeOrder = game.workOrders.find(
    (order) => order.buildingId === building.id && order.action === "deconstruct",
  );
  if (activeOrder) return;
  game.workOrders = game.workOrders.filter((order) => order.buildingId !== building.id);
  building.deconstruction = 0;
  game.workOrders.unshift({ buildingId: building.id, action: "deconstruct", progress: 0 });
  game.player.useReady = now + 450;
  notify(game, "Deconstructing " + BUILD_DATA[building.kind].name + "…", 1200);
}

function interact(game: GameState) {
  if (game.buildMode) {
    placeBuild(game, false, game.keys.has("shift"));
    return;
  }
  const entrance = nearbyCaveEntrance(game);
  const caveExit = nearbyCaveExit(game);
  if (entrance || caveExit) {
    if (entrance) {
      const towardHub = Math.atan2(CAVE_HUB.y - entrance.undergroundY, CAVE_HUB.x - entrance.undergroundX);
      game.realm = "caveSystem";
      game.player.x = entrance.undergroundX + Math.cos(towardHub) * 145;
      game.player.y = entrance.undergroundY + Math.sin(towardHub) * 145;
      notify(game, "Entered the cave. Its tunnels connect to the other entrances.", 3000);
    } else if (caveExit) {
      game.realm = "meadow";
      game.player.x = caveExit.entranceX - 90;
      game.player.y = caveExit.entranceY + 90;
      notify(game, "Back in the meadow.");
    }
    game.camera.x = game.player.x;
    game.camera.y = game.player.y;
    return;
  }
  const treasure = nearestTreasure(game, 92);
  if (treasure) {
    const rewards = Object.entries(treasure.loot) as [Material, number][];
    rewards.forEach(([material, amount]) => addMaterial(game, material, amount));
    treasure.opened = true;
    notify(
      game,
      "Treasure found · " + rewards.map(([material, amount]) => amount + " " + material).join(" · "),
      5200,
    );
    return;
  }
  const nearbyBuilding = game.buildings.find((building) => {
    if (building.realm !== game.realm || building.construction < 1) return false;
    if (building.kind !== "woodGate" && building.kind !== "stoneGate" && building.kind !== "door" && building.kind !== "crop" && building.kind !== "storageChest" && building.kind !== "bedroll") return false;
    return Math.hypot(building.gx * GRID - game.player.x, building.gy * GRID - game.player.y) < 82;
  });
  if (nearbyBuilding) {
    if (nearbyBuilding.kind === "storageChest") {
      game.openChestId = nearbyBuilding.id;
      notify(game, "Storage Chest opened. Stored materials are unavailable for crafting until removed.");
    } else if (nearbyBuilding.kind === "bedroll") {
      if (nearbyBuilding.restedDay === game.day) {
        notify(game, "You have already rested here today.");
      } else if (game.player.hp >= game.player.maxHp) {
        notify(game, "You are already at full health.");
      } else {
        const recovered = Math.min(25, game.player.maxHp - game.player.hp);
        game.player.hp += recovered;
        game.player.hunger = Math.max(0, game.player.hunger - 8);
        nearbyBuilding.restedDay = game.day;
        notify(game, "Rested at the bedroll · +" + Math.ceil(recovered) + " health · -8 hunger.");
      }
    } else if (nearbyBuilding.kind === "crop") {
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

function wearTool(game: GameState, tool: DurableTool) {
  const remaining = Math.max(0, game.gear.toolDurability[tool] - 1);
  game.gear.toolDurability[tool] = remaining;
  if (remaining > 0) return { remaining, broke: false };
  game.hotbar = game.hotbar.map((item) => (item === tool ? null : item));
  game.inventory = game.inventory.map((item) => (item === tool ? null : item));
  if (game.selected === tool) selectSlot(game, game.selectedSlot);
  return { remaining: 0, broke: true };
}

function harvestNode(game: GameState, node: ResourceNode) {
  const now = performance.now();
  if (now < game.player.useReady || game.dead || !game.started) return;
  const tree = isTree(node.kind);
  const mining = isMineable(node.kind);
  const selectedTool = durableToolInfo(game.selected);
  if (tree && selectedTool?.family !== "axe") {
    notify(game, "Put an axe in the selected hotbar slot.", 900);
    game.player.useReady = now + 450;
    return;
  }
  if (mining && selectedTool?.family !== "pickaxe") {
    notify(game, "Put a pickaxe in the selected hotbar slot.", 900);
    game.player.useReady = now + 450;
    return;
  }
  const tier = tree || mining ? selectedTool?.tier ?? "none" : "wood";
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
  if ((tree || mining) && isDurableTool(game.selected)) {
    const usedTool = game.selected;
    const wear = wearTool(game, usedTool);
    gains.push(
      wear.broke
        ? ITEM_LABELS[usedTool] + " broke"
        : "durability " + wear.remaining + "/" + DURABLE_TOOL_DATA[usedTool].maxDurability,
    );
  }
  notify(game, gains.join(" · "), 1000);
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
  const durableTool = durableToolInfo(tool);
  const damage =
    tool === "sword" ? 25 : tool === "spear" ? 17 : durableTool?.damage ?? 3;
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
  if (hit && isDurableTool(tool)) {
    const wear = wearTool(game, tool);
    notify(
      game,
      damage + " damage · " +
        (wear.broke
          ? ITEM_LABELS[tool] + " broke"
          : "durability " + wear.remaining + "/" + DURABLE_TOOL_DATA[tool].maxDurability),
      1000,
    );
  } else if (hit) notify(game, damage + " damage", 700);
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
    if (projectile.realm === "caveSystem" && !isCaveFloor(projectile.x, projectile.y, 5)) {
      projectile.life = 0;
      continue;
    }
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
    const placed = placeBuild(game, repeated, continuous);
    game.lastBuildCell = cellKey;
    game.player.useReady = continuous ? now : now + 300;
    if (!placed && !continuous) game.lastBuildCell = null;
    return;
  }
  if (game.selected === "hammer") {
    startDeconstruction(game);
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

function moveCreatureWithBuildings(game: GameState, creature: Creature, dx: number, dy: number, distance: number, step: number) {
  const radius = creatureRadius(creature);
  const nextX = Math.max(35, Math.min(WORLD_W - 35, creature.x + (dx / distance) * step));
  const nextY = Math.max(35, Math.min(WORLD_H - 35, creature.y + (dy / distance) * step));
  let blocker = blockingBuildingAt(game, creature.realm, nextX, creature.y, radius);
  const xInsideCave = creature.realm !== "caveSystem" || isCaveFloor(nextX, creature.y, radius + 4);
  if (!blocker && xInsideCave) creature.x = nextX;
  const yBlocker = blockingBuildingAt(game, creature.realm, creature.x, nextY, radius);
  const yInsideCave = creature.realm !== "caveSystem" || isCaveFloor(creature.x, nextY, radius + 4);
  if (!yBlocker && yInsideCave) creature.y = nextY;
  blocker ||= yBlocker;
  return blocker;
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
      creature.dir = Math.atan2(dy, dx);
      const blocker = moveCreatureWithBuildings(game, creature, dx, dy, distance, pace * dt);
      if (blocker && isMonster(creature.kind) && now - creature.structureHitAt > 800) {
        blocker.hp -= creature.damage;
        creature.structureHitAt = now;
      }
    }
    if (chasing && !creature.tame && playerDistance < 43 && now - creature.hitAt > 850) {
      const armorReduction = game.gear.armor === "blacksteel" ? 0.55 : game.gear.armor === "iron" ? 0.35 : game.gear.armor === "copper" ? 0.18 : 0;
      const received = creature.damage * (1 - armorReduction);
      game.player.hp -= received;
      creature.hitAt = now;
      notify(game, "You took " + Math.round(received) + " damage!", 1100);
    }
    for (const building of game.buildings) {
      if (building.realm !== game.realm || building.hp <= 0 || building.construction < 1) continue;
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
      if (creature.hp <= 0) awardCreatureDrop(game, creature);
    }
  }
  for (const turret of game.buildings) {
    if (turret.kind !== "turret" || turret.realm !== game.realm || turret.construction < 1 || performance.now() < turret.triggerAt) continue;
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
  if (game.realm === "caveSystem" && !isCaveFloor(x, y, 24)) return false;
  if (blockingBuildingAt(game, game.realm, x, y, 22)) return false;
  if (
    game.treasures.some(
      (treasure) => treasure.realm === game.realm && Math.hypot(treasure.x - x, treasure.y - y) < 53,
    )
  ) return false;
  return !game.nodes.some(
    (node) =>
      node.realm === game.realm &&
      node.hp > 0 &&
      (isTree(node.kind) || isMineable(node.kind)) &&
      Math.hypot(node.x - x, node.y - y) < nodeRadius(node.kind) + 19,
  );
}

function movementInput(game: GameState) {
  return ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].some((key) => game.keys.has(key));
}

function movePlayerToward(game: GameState, targetX: number, targetY: number, dt: number) {
  const dx = targetX - game.player.x;
  const dy = targetY - game.player.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const step = Math.min(distance, 155 * dt);
  const nextX = Math.max(32, Math.min(WORLD_W - 32, game.player.x + (dx / distance) * step));
  const nextY = Math.max(32, Math.min(WORLD_H - 32, game.player.y + (dy / distance) * step));
  if (canStand(game, nextX, game.player.y)) game.player.x = nextX;
  if (canStand(game, game.player.x, nextY)) game.player.y = nextY;
}

function finishDeconstruction(game: GameState, building: Building) {
  const recovered: string[] = [];
  for (const [material, totalCost] of Object.entries(BUILD_DATA[building.kind].cost) as [Material, number][]) {
    const amount = Math.floor((totalCost / BUILD_DATA[building.kind].makes) * 0.5);
    if (amount <= 0) continue;
    addMaterial(game, material, amount);
    recovered.push(amount + " " + material);
  }
  if (building.storage) {
    for (const [material, stored] of Object.entries(building.storage) as [Material, number][]) {
      if (!stored) continue;
      addMaterial(game, material, stored);
      recovered.push(stored + " " + material + " from storage");
    }
  }
  game.buildings = game.buildings.filter((candidate) => candidate.id !== building.id);
  if (game.openChestId === building.id) game.openChestId = null;
  notify(
    game,
    BUILD_DATA[building.kind].name + " deconstructed" + (recovered.length ? " · recovered " + recovered.join(", ") : "."),
    2600,
  );
}

function updateWorkOrders(game: GameState, dt: number) {
  while (game.workOrders.length > 0 && !game.buildings.some((building) => building.id === game.workOrders[0].buildingId)) {
    game.workOrders.shift();
  }
  const order = game.workOrders[0];
  if (!order || movementInput(game)) return;
  const building = game.buildings.find((candidate) => candidate.id === order.buildingId);
  if (!building || building.realm !== game.realm) return;
  const targetX = building.gx * GRID;
  const targetY = building.gy * GRID;
  game.player.dir = Math.atan2(targetY - game.player.y, targetX - game.player.x);
  if (distanceToBuilding(building, game.player.x, game.player.y) > 58) {
    movePlayerToward(game, targetX, targetY, dt);
    return;
  }
  if (game.player.swing <= 0.03) game.player.swing = 0.2;
  const duration = order.action === "construct" ? CONSTRUCTION_SECONDS : DECONSTRUCTION_SECONDS;
  order.progress = Math.min(1, order.progress + dt / duration);
  if (order.action === "construct") {
    building.construction = order.progress;
    building.hp = Math.max(building.hp, Math.ceil(building.maxHp * (0.15 + order.progress * 0.85)));
    if (order.progress >= 1) {
      building.construction = 1;
      building.hp = building.maxHp;
      game.workOrders.shift();
      notify(game, BUILD_DATA[building.kind].name + " finished · " + building.maxHp + " health.", 1800);
    }
    return;
  }
  building.deconstruction = order.progress;
  if (order.progress >= 1) {
    game.workOrders.shift();
    finishDeconstruction(game, building);
  }
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
  updateWorkOrders(game, dt);
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
    if (building.kind === "crop" && building.construction >= 1) building.growth = Math.min(1, building.growth + dt / 75);
  }
  updateProjectiles(game, dt);
  updateCreatures(game, dt);
  reviveNodes(game);
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function drawResourceHealth(ctx: CanvasRenderingContext2D, node: ResourceNode) {
  if (node.hp >= node.maxHp) return;
  const width = Math.max(44, Math.min(62, nodeRadius(node.kind) * 1.15));
  const y = node.y - nodeRadius(node.kind) - 17;
  const ratio = Math.max(0, node.hp / node.maxHp);
  ctx.save();
  ctx.fillStyle = "rgba(15,27,24,.92)";
  roundedRect(ctx, node.x - width / 2, y, width, 9, 4);
  ctx.fill();
  ctx.fillStyle = ratio > 0.5 ? "#75c86e" : ratio > 0.25 ? "#e1b84e" : "#e55f56";
  roundedRect(ctx, node.x - width / 2 + 2, y + 2, (width - 4) * ratio, 5, 2);
  ctx.fill();
  ctx.fillStyle = "#fff2dc";
  ctx.font = "bold 8px Arial";
  ctx.textAlign = "center";
  ctx.fillText(Math.max(0, Math.ceil(node.hp)) + "/" + node.maxHp, node.x, y - 3);
  ctx.restore();
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
  const durableTool = durableToolInfo(tool);
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
  if (durableTool?.family === "axe") {
    const tier = durableTool.tier;
    ctx.strokeStyle = "#32443e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (tier === "wood") {
      ctx.fillStyle = "#9d673b";
      ctx.moveTo(30, 6);
      ctx.lineTo(31, -13);
      ctx.lineTo(39, -14);
      ctx.quadraticCurveTo(49, -24, 56, -21);
      ctx.lineTo(52, -6);
      ctx.quadraticCurveTo(47, 5, 38, 10);
    } else if (tier === "stone") {
      ctx.fillStyle = "#818d86";
      ctx.moveTo(28, 8);
      ctx.lineTo(29, -17);
      ctx.lineTo(39, -19);
      ctx.lineTo(51, -27);
      ctx.lineTo(58, -22);
      ctx.lineTo(53, -5);
      ctx.lineTo(43, 12);
    } else if (tier === "iron") {
      ctx.fillStyle = "#c4cfcb";
      ctx.moveTo(27, 10);
      ctx.lineTo(28, -18);
      ctx.lineTo(39, -20);
      ctx.quadraticCurveTo(51, -30, 60, -25);
      ctx.lineTo(55, -4);
      ctx.quadraticCurveTo(49, 11, 39, 16);
    } else {
      ctx.shadowColor = "#69e6ef";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#6ce0ec";
      ctx.moveTo(26, 11);
      ctx.lineTo(28, -18);
      ctx.lineTo(39, -22);
      ctx.lineTo(50, -31);
      ctx.lineTo(63, -26);
      ctx.lineTo(56, -12);
      ctx.lineTo(60, -2);
      ctx.lineTo(43, 17);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = tier === "aetherium" ? "#d5fbff" : tier === "iron" ? "#f0f6f2" : "#d3b06a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(35, -13);
    ctx.lineTo(tier === "iron" || tier === "aetherium" ? 52 : 48, -20);
    ctx.stroke();
    if (tier === "wood") {
      ctx.strokeStyle = "#d6b15f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(29, -5);
      ctx.lineTo(35, 6);
      ctx.moveTo(30, -9);
      ctx.lineTo(36, 2);
      ctx.stroke();
    }
  } else if (durableTool?.family === "pickaxe") {
    const tier = durableTool.tier;
    ctx.strokeStyle = "#32443e";
    ctx.beginPath();
    if (tier === "wood") {
      ctx.fillStyle = "#946039";
      ctx.moveTo(34, -23);
      ctx.lineTo(44, -19);
      ctx.lineTo(44, 19);
      ctx.lineTo(34, 23);
    } else if (tier === "stone") {
      ctx.fillStyle = "#818d86";
      ctx.moveTo(40, -29);
      ctx.lineTo(48, -18);
      ctx.lineTo(44, -6);
      ctx.lineTo(49, 0);
      ctx.lineTo(44, 7);
      ctx.lineTo(48, 18);
      ctx.lineTo(40, 29);
      ctx.lineTo(32, 18);
      ctx.lineTo(36, 7);
      ctx.lineTo(32, 0);
      ctx.lineTo(36, -6);
      ctx.lineTo(32, -18);
    } else if (tier === "iron") {
      ctx.fillStyle = "#c4cfcb";
      ctx.moveTo(40, -33);
      ctx.lineTo(47, -18);
      ctx.lineTo(43, -4);
      ctx.lineTo(50, 0);
      ctx.lineTo(43, 4);
      ctx.lineTo(47, 18);
      ctx.lineTo(40, 33);
      ctx.lineTo(34, 18);
      ctx.lineTo(37, 4);
      ctx.lineTo(33, 0);
      ctx.lineTo(37, -4);
      ctx.lineTo(34, -18);
    } else {
      ctx.shadowColor = "#69e6ef";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#6ce0ec";
      ctx.moveTo(40, -35);
      ctx.lineTo(49, -17);
      ctx.lineTo(44, -5);
      ctx.lineTo(54, 0);
      ctx.lineTo(44, 5);
      ctx.lineTo(49, 17);
      ctx.lineTo(40, 35);
      ctx.lineTo(31, 17);
      ctx.lineTo(36, 5);
      ctx.lineTo(29, 0);
      ctx.lineTo(36, -5);
      ctx.lineTo(31, -17);
    }
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = tier === "aetherium" ? "#ddfcff" : tier === "iron" ? "#f0f6f2" : "#d3b06a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, -21);
    ctx.lineTo(40, 21);
    ctx.stroke();
    if (tier === "wood") {
      ctx.strokeStyle = "#e0b85e";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(34, -7);
      ctx.lineTo(45, 5);
      ctx.moveTo(34, 0);
      ctx.lineTo(44, 11);
      ctx.stroke();
    }
  } else if (tool === "hammer") {
    ctx.fillStyle = "#879793";
    ctx.strokeStyle = "#33433f";
    ctx.lineWidth = 3;
    roundedRect(ctx, 29, -14, 24, 27, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#d5dedb";
    roundedRect(ctx, 32, -10, 18, 6, 2);
    ctx.fill();
    ctx.fillStyle = "#40524d";
    ctx.beginPath();
    ctx.moveTo(50, -12);
    ctx.lineTo(59, -7);
    ctx.lineTo(52, -1);
    ctx.closePath();
    ctx.fill();
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

function drawTopDownAnimal(ctx: CanvasRenderingContext2D, creature: Creature) {
  const kind = creature.kind as AnimalKind;
  const animalColor: Record<AnimalKind, string> = {
    bear: "#77513c",
    boar: "#9a6444",
    deer: "#b57a48",
    rabbit: "#b9b6aa",
    fox: "#d36f3d",
    wolf: "#697773",
  };
  const lightColor: Record<AnimalKind, string> = {
    bear: "#a97857",
    boar: "#bd7b56",
    deer: "#d39a63",
    rabbit: "#ded9cd",
    fox: "#e69a67",
    wolf: "#9aa4a0",
  };
  const body = animalColor[kind];
  const light = lightColor[kind];
  const outline = kind === "rabbit" ? "#56544e" : "#3e322c";
  const bodyLength = kind === "bear" ? 31 : kind === "rabbit" ? 21 : kind === "deer" ? 27 : 28;
  const bodyWidth = kind === "bear" ? 21 : kind === "boar" ? 18 : kind === "rabbit" ? 13 : kind === "deer" ? 13 : 15;

  ctx.fillStyle = body;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 4;

  // Tails and legs sit beneath the torso, just as they would be seen from overhead.
  if (kind === "fox" || kind === "wolf") {
    ctx.beginPath();
    ctx.moveTo(-19, -7);
    ctx.bezierCurveTo(-34, -20, -48, -15, -43, -3);
    ctx.bezierCurveTo(-38, 8, -27, 9, -18, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (kind === "fox") {
      ctx.fillStyle = "#eee2cf";
      ctx.beginPath();
      ctx.ellipse(-42, -7, 8, 6, -0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = body;
    }
  } else if (kind === "rabbit") {
    ctx.fillStyle = "#eee9dc";
    ctx.beginPath();
    ctx.arc(-23, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = body;
  } else if (kind === "deer") {
    ctx.fillStyle = "#eee4d0";
    ctx.beginPath();
    ctx.moveTo(-25, 0);
    ctx.lineTo(-15, -7);
    ctx.lineTo(-15, 7);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(-bodyLength + 1, 0, kind === "bear" ? 6 : 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  for (const [x, y] of [[-12, -bodyWidth], [11, -bodyWidth], [-12, bodyWidth], [11, bodyWidth]] as const) {
    ctx.beginPath();
    ctx.ellipse(x, y, kind === "rabbit" ? 8 : 10, kind === "rabbit" ? 4 : 5, x < 0 ? -0.2 : 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.ellipse(-2, 0, bodyLength, bodyWidth, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = light;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.ellipse(-4, -bodyWidth * 0.25, bodyLength * 0.62, bodyWidth * 0.34, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  if (kind === "rabbit") {
    ctx.fillStyle = body;
    for (const y of [-7, 7]) {
      ctx.beginPath();
      ctx.ellipse(33, y, 16, 5, y * 0.015, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#d8a7a0";
      ctx.beginPath();
      ctx.ellipse(35, y, 10, 2, y * 0.015, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = body;
    }
    ctx.beginPath();
    ctx.arc(20, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (kind === "fox" || kind === "wolf") {
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(39, 0);
    ctx.lineTo(20, -14);
    ctx.lineTo(14, -8);
    ctx.lineTo(14, 8);
    ctx.lineTo(20, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    for (const y of [-11, 11]) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(13, y * 1.75);
      ctx.lineTo(29, y * 1.15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = kind === "fox" ? "#eee2cf" : light;
    ctx.beginPath();
    ctx.moveTo(39, 0);
    ctx.lineTo(29, -5);
    ctx.lineTo(29, 5);
    ctx.closePath();
    ctx.fill();
  } else {
    const headX = kind === "deer" ? 31 : kind === "boar" ? 25 : 23;
    const headLength = kind === "deer" ? 15 : kind === "boar" ? 17 : 15;
    const headWidth = kind === "bear" ? 14 : kind === "boar" ? 13 : 11;
    ctx.fillStyle = body;
    if (kind === "deer") {
      ctx.beginPath();
      ctx.ellipse(18, 0, 17, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.ellipse(headX, 0, headLength, headWidth, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    for (const y of [-headWidth, headWidth]) {
      ctx.beginPath();
      ctx.ellipse(headX - 2, y, kind === "bear" ? 7 : 9, kind === "bear" ? 6 : 4, y * 0.025, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.ellipse(headX + headLength - 4, 0, kind === "boar" ? 9 : 7, kind === "boar" ? 8 : 7, 0, 0, Math.PI * 2);
    ctx.fill();
    if (kind === "deer") {
      ctx.strokeStyle = "#6a472f";
      ctx.lineWidth = 3;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(33, side * 8);
        ctx.lineTo(45, side * 17);
        ctx.lineTo(53, side * 15);
        ctx.moveTo(44, side * 16);
        ctx.lineTo(47, side * 25);
        ctx.stroke();
      }
    }
  }

  ctx.fillStyle = "#20211f";
  ctx.beginPath();
  ctx.arc(kind === "rabbit" ? 25 : 31, -5, 2.2, 0, Math.PI * 2);
  ctx.arc(kind === "rabbit" ? 25 : 31, 5, 2.2, 0, Math.PI * 2);
  ctx.fill();
  if (creature.tame) {
    ctx.strokeStyle = "#f1bf4f";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(15, -bodyWidth * 0.85);
    ctx.lineTo(15, bodyWidth * 0.85);
    ctx.stroke();
  }
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
  ctx.rotate(creature.dir);
  if (isAnimal(creature.kind)) {
    drawTopDownAnimal(ctx, creature);
  } else {
    const pulse = Math.sin(now / 120 + creature.phase) * 2;
    const tentacleCount = creature.kind === "maw" ? 10 : creature.kind === "crawler" ? 8 : creature.kind === "wraith" ? 7 : creature.kind === "brute" ? 6 : 5;
    const tentacleLength = creature.kind === "wraith" ? 52 : creature.kind === "maw" ? 43 : creature.kind === "brute" ? 39 : 34;
    const tentacleWidth = creature.kind === "brute" || creature.kind === "maw" ? 9 : creature.kind === "wraith" ? 5 : 7;
    const tentacleColor = creature.kind === "maw" ? "#67354f" : creature.kind === "wraith" ? "#514775" : creature.kind === "brute" ? "#5c385c" : creature.kind === "crawler" ? "#303a51" : "#2b3452";
    ctx.lineCap = "round";
    for (let i = 0; i < tentacleCount; i++) {
      const angle = (Math.PI * 2 * i) / tentacleCount + (creature.kind === "crawler" ? 0.35 : 0);
      const wave = Math.sin(now / 260 + creature.phase + i * 1.7) * 8;
      const startRadius = creature.kind === "maw" ? 24 : creature.kind === "brute" ? 21 : 17;
      const endRadius = tentacleLength + (i % 2) * 7;
      const startX = Math.cos(angle) * startRadius;
      const startY = Math.sin(angle) * startRadius;
      const endX = Math.cos(angle) * endRadius - Math.sin(angle) * wave;
      const endY = Math.sin(angle) * endRadius + Math.cos(angle) * wave;
      const controlRadius = (startRadius + endRadius) * 0.55;
      const controlX = Math.cos(angle) * controlRadius + Math.sin(angle) * wave;
      const controlY = Math.sin(angle) * controlRadius - Math.cos(angle) * wave;
      ctx.strokeStyle = "#111522";
      ctx.lineWidth = tentacleWidth + 4;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(controlX, controlY, endX, endY);
      ctx.stroke();
      ctx.strokeStyle = tentacleColor;
      ctx.lineWidth = tentacleWidth;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(controlX, controlY, endX, endY);
      ctx.stroke();
    }
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
      ctx.arc(0, 0, 24 + pulse, 0, Math.PI * 2);
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
      ctx.arc(0, 0, 27 + pulse, 0, Math.PI * 2);
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
      ctx.arc(0, 0, (creature.kind === "brute" ? 30 : 26) + pulse, 0, Math.PI * 2);
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
  ctx.rotate(-creature.dir);
  if (isAnimal(creature.kind)) {
    if (creature.tame) {
      ctx.fillStyle = "#ef6b67";
      ctx.font = "bold 19px Arial";
      ctx.textAlign = "center";
      ctx.fillText("♥", 0, -42);
    } else if (creature.fed > 0) {
      ctx.fillStyle = "#ef6b67";
      ctx.font = "bold 15px Arial";
      ctx.textAlign = "center";
      ctx.fillText(creature.fed + "/3", 0, -41);
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
  ctx.globalAlpha = alpha * (0.38 + building.construction * 0.62);
  ctx.translate(x, y);
  const kind = building.kind;
  if (building.construction < 1) {
    ctx.fillStyle = "rgba(196,218,207,.12)";
    ctx.strokeStyle = "#b9d4c5";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.fillRect(-BUILDING_HALF_SIZE, -BUILDING_HALF_SIZE, BUILDING_HALF_SIZE * 2, BUILDING_HALF_SIZE * 2);
    ctx.strokeRect(-BUILDING_HALF_SIZE, -BUILDING_HALF_SIZE, BUILDING_HALF_SIZE * 2, BUILDING_HALF_SIZE * 2);
    ctx.setLineDash([]);
  }
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
  } else if (kind === "storageChest") {
    ctx.fillStyle = "rgba(31,34,28,.2)";
    ctx.beginPath();
    ctx.ellipse(4, 13, 27, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9a6037";
    ctx.strokeStyle = "#4c3025";
    ctx.lineWidth = 4;
    roundedRect(ctx, -23, -18, 46, 37, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#bd7d43";
    ctx.beginPath();
    ctx.arc(0, -11, 22, Math.PI, 0);
    ctx.lineTo(22, -4);
    ctx.lineTo(-22, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#d2b15d";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-23, -4);
    ctx.lineTo(23, -4);
    ctx.stroke();
    ctx.fillStyle = "#e2bd5d";
    ctx.strokeStyle = "#59452a";
    ctx.lineWidth = 3;
    roundedRect(ctx, -6, -7, 12, 16, 3);
    ctx.fill();
    ctx.stroke();
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
  } else if (kind === "bedroll") {
    ctx.save();
    ctx.rotate(-0.16);
    ctx.fillStyle = "#6e4937";
    ctx.strokeStyle = "#3f3028";
    ctx.lineWidth = 4;
    roundedRect(ctx, -22, -16, 44, 32, 9);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#c2b986";
    roundedRect(ctx, -18, -12, 15, 24, 7);
    ctx.fill();
    ctx.fillStyle = "#456b5d";
    roundedRect(ctx, 0, -12, 18, 24, 5);
    ctx.fill();
    ctx.strokeStyle = "rgba(231,221,173,.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(5, -10);
    ctx.lineTo(5, 10);
    ctx.stroke();
    ctx.restore();
  } else if (kind === "torch") {
    const flicker = Math.sin(performance.now() / 85 + building.id) * 2;
    ctx.fillStyle = "rgba(243,159,57,.2)";
    ctx.beginPath();
    ctx.arc(0, -7, 24 + flicker, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#513a2a";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 21);
    ctx.lineTo(0, -7);
    ctx.stroke();
    ctx.fillStyle = "#ffca4d";
    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.quadraticCurveTo(-9, -22 - flicker, 0, -29);
    ctx.quadraticCurveTo(11, -18 + flicker, 8, -7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ed673d";
    ctx.beginPath();
    ctx.moveTo(-3, -8);
    ctx.quadraticCurveTo(-3, -18, 2, -21);
    ctx.quadraticCurveTo(6, -13, 4, -8);
    ctx.closePath();
    ctx.fill();
  } else if (kind === "campfire") {
    const flicker = Math.sin(performance.now() / 95 + building.id) * 2.5;
    ctx.fillStyle = "rgba(239,143,47,.22)";
    ctx.beginPath();
    ctx.arc(0, 0, 31 + flicker, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8c9188";
    ctx.strokeStyle = "#4b534f";
    ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      const angle = (Math.PI * 2 * i) / 9;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * 18, Math.sin(angle) * 18, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.strokeStyle = "#65402c";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-13, -9);
    ctx.lineTo(13, 9);
    ctx.moveTo(13, -9);
    ctx.lineTo(-13, 9);
    ctx.stroke();
    ctx.fillStyle = "#ffca4d";
    ctx.beginPath();
    ctx.moveTo(-10, 11);
    ctx.quadraticCurveTo(-13, -9, -1, -23 - flicker);
    ctx.quadraticCurveTo(4, -8, 10, -17);
    ctx.quadraticCurveTo(17, 3, 8, 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#eb5d3d";
    ctx.beginPath();
    ctx.moveTo(-4, 10);
    ctx.quadraticCurveTo(-4, -5, 3, -13);
    ctx.quadraticCurveTo(9, 3, 5, 10);
    ctx.closePath();
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
    if (building.construction >= 1) {
      const percent = Math.min(100, Math.floor(building.growth * 100));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(16,30,25,.92)";
      roundedRect(ctx, -23, -39, 46, 14, 6);
      ctx.fill();
      ctx.fillStyle = building.growth >= 1 ? "#f3c557" : "#dbe9ce";
      ctx.font = "bold 9px Arial";
      ctx.textAlign = "center";
      ctx.fillText(percent + "% GROWN", 0, -29);
    }
  }
  const workInProgress = building.construction < 1 || building.deconstruction > 0;
  if (workInProgress || building.hp < building.maxHp) {
    const progress = building.construction < 1
      ? building.construction
      : building.deconstruction > 0
        ? building.deconstruction
        : Math.max(0, building.hp / building.maxHp);
    ctx.globalAlpha = alpha;
    const barY = kind === "crop" ? -53 : -35;
    ctx.fillStyle = "rgba(17,30,26,.9)";
    roundedRect(ctx, -25, barY, 50, 8, 4);
    ctx.fill();
    ctx.fillStyle = building.construction < 1 ? "#68b9da" : building.deconstruction > 0 ? "#e5a346" : "#74c66d";
    roundedRect(ctx, -23, barY + 2, 46 * progress, 4, 2);
    ctx.fill();
    ctx.fillStyle = "#f4ead8";
    ctx.font = "bold 8px Arial";
    ctx.textAlign = "center";
    const label = building.construction < 1
      ? "BUILD " + Math.floor(building.construction * 100) + "%"
      : building.deconstruction > 0
        ? "REMOVE " + Math.floor(building.deconstruction * 100) + "%"
        : Math.ceil(building.hp) + "/" + building.maxHp;
    ctx.fillText(label, 0, barY - 4);
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

function drawCaveSystemTerrain(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#141c1b";
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const [start, end] of CAVE_CONNECTIONS) {
    ctx.strokeStyle = "#293330";
    ctx.lineWidth = (CAVE_TUNNEL_HALF_WIDTH + 58) * 2;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }
  ctx.fillStyle = "#293330";
  ctx.beginPath();
  ctx.arc(CAVE_HUB.x, CAVE_HUB.y, CAVE_HUB.radius + 58, 0, Math.PI * 2);
  ctx.fill();
  for (const cave of CAVES) {
    ctx.beginPath();
    ctx.arc(cave.undergroundX, cave.undergroundY, cave.chamberRadius + 58, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const [index, [start, end]] of CAVE_CONNECTIONS.entries()) {
    const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
    gradient.addColorStop(0, CAVES[index].ground);
    gradient.addColorStop(1, "#414a46");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = CAVE_TUNNEL_HALF_WIDTH * 2;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }
  ctx.fillStyle = "#414a46";
  ctx.beginPath();
  ctx.arc(CAVE_HUB.x, CAVE_HUB.y, CAVE_HUB.radius, 0, Math.PI * 2);
  ctx.fill();
  for (const cave of CAVES) {
    ctx.fillStyle = cave.ground;
    ctx.beginPath();
    ctx.arc(cave.undergroundX, cave.undergroundY, cave.chamberRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(13,20,19,.45)";
    ctx.lineWidth = 16;
    ctx.stroke();
  }
  ctx.restore();

  for (let i = 0; i < 560; i++) {
    const x = seeded(i, 231) * WORLD_W;
    const y = seeded(i, 232) * WORLD_H;
    if (!isCaveFloor(x, y, 12)) continue;
    const area = caveAreaAt(x, y);
    ctx.fillStyle = i % 2 ? area.textureA : area.textureB;
    ctx.globalAlpha = 0.42;
    ctx.beginPath();
    ctx.arc(x, y, 2 + seeded(i, 233) * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (const cave of CAVES) {
    for (let i = 0; i < 26; i++) {
      const angle = (i / 26) * Math.PI * 2 + seeded(i, 241 + CAVES.indexOf(cave)) * 0.11;
      const radius = cave.chamberRadius + 31;
      const x = cave.undergroundX + Math.cos(angle) * radius;
      const y = cave.undergroundY + Math.sin(angle) * radius;
      const size = 17 + seeded(i, 244 + CAVES.indexOf(cave)) * 20;
      ctx.fillStyle = i % 2 ? "#202927" : "#343e3a";
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
      ctx.lineTo(x + Math.cos(angle + 2.25) * size * 0.8, y + Math.sin(angle + 2.25) * size * 0.8);
      ctx.lineTo(x + Math.cos(angle - 2.25) * size * 0.8, y + Math.sin(angle - 2.25) * size * 0.8);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = "rgba(231,222,184,.34)";
    ctx.font = "900 30px Arial";
    ctx.textAlign = "center";
    ctx.fillText(cave.name.toUpperCase(), cave.undergroundX, cave.undergroundY - cave.chamberRadius + 105);
  }
  ctx.fillStyle = "rgba(218,226,216,.25)";
  ctx.font = "900 26px Arial";
  ctx.textAlign = "center";
  ctx.fillText("THE DEEPWAYS", CAVE_HUB.x, CAVE_HUB.y + 12);
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

let lightingLayer: HTMLCanvasElement | null = null;

function drawDarkness(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
  game: GameState,
  scale: number,
  offsetX: number,
  offsetY: number,
  inCave: boolean,
) {
  if (!lightingLayer) lightingLayer = document.createElement("canvas");
  const pixelWidth = Math.max(1, Math.round(width * dpr));
  const pixelHeight = Math.max(1, Math.round(height * dpr));
  if (lightingLayer.width !== pixelWidth || lightingLayer.height !== pixelHeight) {
    lightingLayer.width = pixelWidth;
    lightingLayer.height = pixelHeight;
  }
  const light = lightingLayer.getContext("2d");
  if (!light) return;
  light.setTransform(dpr, 0, 0, dpr, 0, 0);
  light.clearRect(0, 0, width, height);
  light.fillStyle = inCave ? "rgba(2,6,9,.93)" : "rgba(4,7,18,.975)";
  light.fillRect(0, 0, width, height);
  light.globalCompositeOperation = "destination-out";

  const reveal = (x: number, y: number, radius: number, core: number) => {
    if (x + radius < 0 || y + radius < 0 || x - radius > width || y - radius > height) return;
    const gradient = light.createRadialGradient(x, y, Math.max(1, core), x, y, radius);
    gradient.addColorStop(0, "rgba(0,0,0,1)");
    gradient.addColorStop(0.45, "rgba(0,0,0,.93)");
    gradient.addColorStop(0.76, "rgba(0,0,0,.52)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    light.fillStyle = gradient;
    light.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  };

  const playerX = width / 2 + (game.player.x - game.camera.x) * scale;
  const playerY = height / 2 + (game.player.y - game.camera.y) * scale;
  reveal(playerX, playerY, (inCave ? 430 : 96) * scale, 25 * scale);
  game.buildings.forEach((building) => {
    if (building.realm !== game.realm || building.hp <= 0 || building.construction < 1) return;
    const radius = building.kind === "campfire" ? 410 : building.kind === "torch" ? 225 : building.kind === "fireTrap" ? 115 : 0;
    if (!radius) return;
    reveal(offsetX + building.gx * GRID * scale, offsetY + building.gy * GRID * scale, radius * scale, 55 * scale);
  });

  light.globalCompositeOperation = "source-over";
  ctx.drawImage(lightingLayer, 0, 0, width, height);
}

function drawWorld(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, game: GameState) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const inCave = game.realm === "caveSystem";
  const cave = inCave ? caveAreaAt(game.player.x, game.player.y) : undefined;
  ctx.fillStyle = inCave ? "#141c1b" : "#89bd63";
  ctx.fillRect(0, 0, width, height);
  const scale = game.zoom;
  const offsetX = width / 2 - game.camera.x * scale;
  const offsetY = height / 2 - game.camera.y * scale;
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  if (inCave) {
    drawCaveSystemTerrain(ctx);
  } else {
    ctx.fillStyle = "#91c66b";
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    ctx.fillStyle = "#5f8f50";
    ctx.beginPath();
    ctx.ellipse(FOREST_X, FOREST_Y, FOREST_RX, FOREST_RY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(232,239,195,.48)";
    ctx.font = "900 34px Arial";
    ctx.textAlign = "center";
    ctx.fillText("THE BLACKWOOD", FOREST_X, Math.max(90, FOREST_Y - FOREST_RY + 85));
    for (let i = 0; i < 420; i++) {
      const x = seeded(i, 21) * WORLD_W;
      const y = seeded(i, 22) * WORLD_H;
      ctx.fillStyle = i % 2 ? "#7eb35b" : "#a3cf7b";
      ctx.beginPath();
      ctx.arc(x, y, 2 + seeded(i, 4) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (game.buildMode) {
    ctx.strokeStyle = cave ? "rgba(192,210,201,.13)" : "rgba(47,89,60,.15)";
    ctx.lineWidth = 1;
    const left = Math.max(
      GRID / 2,
      Math.floor((game.camera.x - width / (2 * scale) - GRID / 2) / GRID) * GRID + GRID / 2,
    );
    const right = Math.min(WORLD_W, game.camera.x + width / (2 * scale));
    const top = Math.max(
      GRID / 2,
      Math.floor((game.camera.y - height / (2 * scale) - GRID / 2) / GRID) * GRID + GRID / 2,
    );
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
  if (!inCave) {
    CAVES.forEach((entrance) =>
      drawCave(ctx, entrance.entranceX, entrance.entranceY, false, entrance.name),
    );
  } else {
    CAVES.forEach((exit) =>
      drawCave(ctx, exit.undergroundX, exit.undergroundY, true, exit.name),
    );
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
        drawResourceHealth(ctx, node);
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
        construction: 1,
        deconstruction: 0,
        restedDay: 0,
      },
      0.62,
    );
  }
  ctx.restore();

  if (isNight(game) || inCave) {
    drawDarkness(ctx, width, height, dpr, game, scale, offsetX, offsetY, inCave);
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
    return "BUILD · Place one " + BUILD_DATA[game.buildMode].name + " · hold Shift to keep placing";
  }
  if (game.selected === "hammer") {
    const target = targetBuilding(game, 118);
    if (target) return "TOOL · Deconstruct " + BUILD_DATA[target.kind].name + " · " + Math.ceil(target.hp) + "/" + target.maxHp + " health";
  }
  const entrance = nearbyCaveEntrance(game);
  const currentCave = nearbyCaveExit(game);
  if (entrance) return "E · Enter " + entrance.name;
  if (
    currentCave
  ) {
    return "E · Exit " + currentCave.name;
  }
  const building = game.buildings.find(
    (item) =>
      item.realm === game.realm &&
      item.construction >= 1 &&
      ["woodGate", "stoneGate", "door", "crop", "storageChest", "bedroll"].includes(item.kind) &&
      Math.hypot(item.gx * GRID - game.player.x, item.gy * GRID - game.player.y) < 82,
  );
  if (building) {
    if (building.kind === "storageChest") return "E · Open Storage Chest";
    if (building.kind === "bedroll") return "E · Rest at Bedroll";
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
    detail: "Starter chopping tool · 36 durability",
    cost: { wood: 3 },
    owned: (game) => game.gear.toolDurability.woodAxe > 0,
    action: (game) => {
      game.gear.toolDurability.woodAxe = DURABLE_TOOL_DATA.woodAxe.maxDurability;
      equipNewItem(game, "woodAxe");
    },
  },
  {
    id: "woodPick",
    name: "Wood Pickaxe",
    detail: "Mines surface stone · 36 durability",
    cost: { wood: 3 },
    owned: (game) => game.gear.toolDurability.woodPickaxe > 0,
    action: (game) => {
      game.gear.toolDurability.woodPickaxe = DURABLE_TOOL_DATA.woodPickaxe.maxDurability;
      equipNewItem(game, "woodPickaxe");
    },
  },
  {
    id: "stoneAxe",
    name: "Stone Axe",
    detail: "Stronger, faster chopping · 72 durability",
    cost: { wood: 3, stone: 4 },
    owned: (game) => game.gear.toolDurability.stoneAxe > 0,
    action: (game) => {
      game.gear.toolDurability.stoneAxe = DURABLE_TOOL_DATA.stoneAxe.maxDurability;
      equipNewItem(game, "stoneAxe");
    },
  },
  {
    id: "stonePick",
    name: "Stone Pickaxe",
    detail: "Mines granite and common metals · 72 durability",
    cost: { wood: 3, stone: 4 },
    owned: (game) => game.gear.toolDurability.stonePickaxe > 0,
    action: (game) => {
      game.gear.toolDurability.stonePickaxe = DURABLE_TOOL_DATA.stonePickaxe.maxDurability;
      equipNewItem(game, "stonePickaxe");
    },
  },
  {
    id: "hammer",
    name: "Deconstruction Hammer",
    detail: "Recovers half the materials from placed structures",
    cost: { wood: 4, stone: 2 },
    owned: (game) => game.gear.hammer,
    action: (game) => {
      game.gear.hammer = true;
      equipNewItem(game, "hammer");
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
    detail: "Advanced high-speed chopping · 120 durability",
    cost: { wood: 4, iron: 5 },
    requiresBench: true,
    owned: (game) => game.gear.toolDurability.ironAxe > 0,
    action: (game) => {
      game.gear.toolDurability.ironAxe = DURABLE_TOOL_DATA.ironAxe.maxDurability;
      equipNewItem(game, "ironAxe");
    },
  },
  {
    id: "ironPick",
    name: "Iron Pickaxe",
    detail: "Can mine rare Aetherium · 120 durability",
    cost: { wood: 4, iron: 5 },
    requiresBench: true,
    owned: (game) => game.gear.toolDurability.ironPickaxe > 0,
    action: (game) => {
      game.gear.toolDurability.ironPickaxe = DURABLE_TOOL_DATA.ironPickaxe.maxDurability;
      equipNewItem(game, "ironPickaxe");
    },
  },
  {
    id: "aetherAxe",
    name: "Aetherium Axe",
    detail: "Five-hit chopping power · 180 durability",
    cost: { wood: 4, aetherium: 7, iron: 3 },
    requiresBench: true,
    owned: (game) => game.gear.toolDurability.aetheriumAxe > 0,
    action: (game) => {
      game.gear.toolDurability.aetheriumAxe = DURABLE_TOOL_DATA.aetheriumAxe.maxDurability;
      equipNewItem(game, "aetheriumAxe");
    },
  },
  {
    id: "aetherPick",
    name: "Aetherium Pickaxe",
    detail: "Five-hit mining power · 180 durability",
    cost: { wood: 4, aetherium: 7, iron: 3 },
    requiresBench: true,
    owned: (game) => game.gear.toolDurability.aetheriumPickaxe > 0,
    action: (game) => {
      game.gear.toolDurability.aetheriumPickaxe = DURABLE_TOOL_DATA.aetheriumPickaxe.maxDurability;
      equipNewItem(game, "aetheriumPickaxe");
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
    detail: BUILD_DATA[kind].detail + " · " + BUILD_DATA[kind].hp + " health · crafted into inventory",
    cost: BUILD_DATA[kind].cost,
    requiresBench: !["craftingBench", "storageChest", "bedroll", "torch", "campfire", "woodFence", "floor", "woodWall", "crop"].includes(kind),
    action: (game) => {
      game.kits[kind] += BUILD_DATA[kind].makes;
      ensureItemListed(game, kind);
    },
  })),
];

function ToolGlyph({ type, tier }: { type: ToolGlyphKind; tier?: ToolTier }) {
  return (
    <span className={"tool-glyph tool-" + type + (tier ? " tier-" + tier : "")} aria-hidden="true">
      <i />
      <b />
    </span>
  );
}

function MaterialIcon({ material }: { material: Material }) {
  return (
    <span className={"resource-mark material-icon mark-" + material + " material-" + material} aria-hidden="true">
      <i />
      <b />
    </span>
  );
}

function BuildIcon({ kind }: { kind: BuildKind }) {
  return (
    <span className={"slot-build-mark build-icon build-" + kind} aria-hidden="true">
      <i />
      <b />
      <em />
    </span>
  );
}

function RecipeVisual({ recipe }: { recipe: Recipe }) {
  if (recipe.id.startsWith("build:")) return <BuildIcon kind={recipe.id.slice(6) as BuildKind} />;
  const tier: ToolTier | undefined = recipe.id.startsWith("wood")
    ? "wood"
    : recipe.id.startsWith("stone")
      ? "stone"
      : recipe.id.startsWith("iron")
        ? "iron"
        : recipe.id.startsWith("aether")
          ? "aetherium"
          : undefined;
  if (recipe.id.toLowerCase().includes("axe")) return <ToolGlyph type="axe" tier={tier} />;
  if (recipe.id.toLowerCase().includes("pick")) return <ToolGlyph type="pickaxe" tier={tier} />;
  if (recipe.id === "hammer") return <ToolGlyph type="hammer" />;
  if (recipe.id === "spear") return <ToolGlyph type="spear" />;
  if (recipe.id === "sword") return <ToolGlyph type="sword" />;
  if (recipe.id === "bow") return <ToolGlyph type="bow" />;
  if (recipe.id === "pistol") return <ToolGlyph type="pistol" />;
  if (recipe.id === "arrows") return <MaterialIcon material="arrows" />;
  if (recipe.id === "bullets") return <MaterialIcon material="bullets" />;
  if (recipe.id.endsWith("Armor")) return <span className={"recipe-special recipe-armor armor-" + recipe.id.replace("Armor", "")} aria-hidden="true"><i /><b /></span>;
  return <span className="recipe-special recipe-bandage" aria-hidden="true"><i /><b /></span>;
}

function ItemVisual({ item }: { item: InventoryItem; game: GameState }) {
  const durableTool = durableToolInfo(item);
  if (durableTool) {
    return <ToolGlyph type={durableTool.family} tier={durableTool.tier} />;
  }
  if (["hammer", "spear", "sword", "bow", "pistol"].includes(item)) {
    return <ToolGlyph type={item as ToolGlyphKind} />;
  }
  if (isBuildKind(item)) {
    return <BuildIcon kind={item} />;
  }
  return <MaterialIcon material={item as Material} />;
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
  const openChest = game.buildings.find(
    (building) => building.id === game.openChestId && building.kind === "storageChest",
  );
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
    let last = 0;
    let lastHud = 0;
    const loop = (now: number) => {
      if (last === 0) {
        last = now;
        lastHud = now;
      }
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
      if (key === "e") {
        interact(game);
        if (game.openChestId !== null) setPanel(null);
      }
      if (key === " " || key === "f") {
        event.preventDefault();
        attack(game);
      }
      if (["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].includes(key)) {
        selectSlot(game, key === "0" ? 9 : Number(key) - 1);
      }
      if (key === "q") {
        game.openChestId = null;
        setPanel((value) => (value === "build" ? null : "build"));
      }
      if (key === "c") {
        game.openChestId = null;
        setPanel((value) => (value === "craft" ? null : "craft"));
      }
      if (key === "i" || key === "b") {
        game.openChestId = null;
        setPanel((value) => (value === "inventory" ? null : "inventory"));
      }
      if (key === "escape") {
        cancelBuildMode(game);
        game.openChestId = null;
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
    notify(game, "Day 1 — your Wood Axe is ready in hotbar slot 2.", 3200);
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
    game.openChestId = null;
    game.selected = "build";
    setPanel(null);
    notify(game, BUILD_DATA[kind].name + " selected — click once, or hold Shift while placing several. Right-click cancels.");
    refresh();
    canvasRef.current?.focus();
  };

  const moveChestStack = (material: Material, intoChest: boolean) => {
    if (!openChest) return;
    const storage = openChest.storage ?? (openChest.storage = {});
    if (intoChest) {
      const amount = game.resources[material];
      if (amount <= 0) return;
      storage[material] = (storage[material] ?? 0) + amount;
      game.resources[material] = 0;
      selectSlot(game, game.selectedSlot);
      notify(game, "Stored " + amount + " " + material + ".");
    } else {
      const amount = storage[material] ?? 0;
      if (amount <= 0) return;
      storage[material] = 0;
      addMaterial(game, material, amount);
      notify(game, "Retrieved " + amount + " " + material + ".");
    }
    refresh();
  };

  const closeChest = () => {
    game.openChestId = null;
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
    const durabilityDescription = item && isDurableTool(item)
      ? ", " + game.gear.toolDurability[item] + " of " + DURABLE_TOOL_DATA[item].maxDurability + " durability"
      : "";
    return (
      <button
        key={area + index}
        className={"inventory-slot" + (area === "hotbar" && game.selectedSlot === index ? " active" : "") + (isMoving ? " moving" : "")}
        draggable={movable && Boolean(item)}
        aria-label={(area === "hotbar" ? "Hotbar " + (index === 9 ? 0 : index + 1) + ": " : "Inventory: ") + itemLabel(item, game) + durabilityDescription}
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
        {item ? <ItemVisual item={item} game={game} /> : <span className="empty-slot" />}
        {item && <span className="slot-name">{itemLabel(item, game)}</span>}
        {item && itemCount(game, item) > 1 && <b className="stack-count">{itemCount(game, item)}</b>}
        {item && isDurableTool(item) && (
          <span className="tool-durability" title={game.gear.toolDurability[item] + " durability remaining"}>
            <i style={{ width: (game.gear.toolDurability[item] / DURABLE_TOOL_DATA[item].maxDurability) * 100 + "%" }} />
          </span>
        )}
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
      : isDurableTool(game.selected)
        ? itemLabel(game.selected, game) + " · " + game.gear.toolDurability[game.selected] + "/" + DURABLE_TOOL_DATA[game.selected].maxDurability + " durability"
          : isFoodItem(game.selected)
            ? itemLabel(game.selected, game) + " · " + game.resources[game.selected]
            : game.buildMode
              ? BUILD_DATA[game.buildMode].name
              : itemLabel(game.hotbar[game.selectedSlot], game);
  const prompt = nearbyPrompt(game);
  const promptKey = prompt.startsWith("TOOL")
    ? "HOLD LMB"
    : prompt.startsWith("BUILD")
      ? "LMB / SHIFT+LMB"
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
          if (event.button === 2) {
            if (game.buildMode) {
              cancelBuildMode(game);
              notify(game, "Build placement canceled.", 900);
              refresh();
            }
            return;
          }
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

        <div className="brand-pill"><span>H</span><strong>HALFLIGHT</strong><small>{game.realm === "caveSystem" ? caveAreaAt(game.player.x, game.player.y).name.toUpperCase() : inForest(game.player.x, game.player.y) ? "THE BLACKWOOD" : "THE MEADOW"}</small></div>

        <section className="resource-strip" aria-label="Resources">
          {MATERIALS.filter((material) => ["wood", "stone", "iron", "copper", "aetherium", "berries"].includes(material.id)).map((material) => (
            <div key={material.id} title={material.name}>
              <MaterialIcon material={material.id} />
              <b>{game.resources[material.id]}</b>
              <small>{material.name}</small>
            </div>
          ))}
          <button onClick={() => { game.openChestId = null; setPanel("inventory"); }} aria-label="Open inventory">Inventory <kbd>I</kbd></button>
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
      {game.buildMode && <div className="build-mode-banner"><b>GRID BUILD</b><span>{BUILD_DATA[game.buildMode].name} · {game.kits[game.buildMode]} ready</span><button onClick={() => { cancelBuildMode(game); refresh(); }}>Cancel <kbd>RMB / Esc</kbd></button></div>}

      <nav className="hotbar" aria-label="Equipment hotbar">
        {game.hotbar.map((_, index) => inventorySlot("hotbar", index, false))}
        <button className="hotbar-pack" onClick={() => { game.openChestId = null; setPanel("inventory"); }} aria-label="Open free inventory">
          <kbd>I</kbd><ToolGlyph type="pack" /><span>Inventory</span>
        </button>
        <div className="equipped-label"><small>EQUIPPED</small><strong>{toolName}</strong></div>
      </nav>

      <aside className="key-guide">
        <span><kbd>WASD</kbd> Move</span>
        <span><kbd>E</kbd> Interact</span>
        <span><kbd>HOLD LMB</kbd> Use tool</span>
        <span><kbd>SHIFT+LMB</kbd> Keep building</span>
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
                          <div className="recipe-badge"><RecipeVisual recipe={recipe} /></div>
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
                          <div className="build-badge"><BuildIcon kind={kind} /></div>
                          <div><h3>{data.name}</h3><p>{data.detail}</p><small>{data.hp} health · 3s build time</small></div>
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

      {openChest && (
        <div className="panel-scrim chest-scrim" onPointerDown={closeChest}>
          <aside className="game-panel chest-panel" role="dialog" aria-modal="true" aria-label="Storage Chest" onPointerDown={(event) => event.stopPropagation()}>
            <header>
              <div><small>PLACED CONTAINER</small><h2>Storage Chest</h2></div>
              <button onClick={closeChest} aria-label="Close storage chest">×</button>
            </header>
            <div className="chest-content">
              <section>
                <h3>Backpack resources</h3>
                <p>Choose a stack to store it. Stored supplies cannot be used for crafting until you retrieve them.</p>
                <div className="chest-grid">
                  {MATERIALS.filter((material) => game.resources[material.id] > 0).map((material) => (
                    <button key={material.id} onClick={() => moveChestStack(material.id, true)} aria-label={"Store all " + material.name}>
                      <MaterialIcon material={material.id} />
                      <span><b>{material.name}</b><small>{game.resources[material.id]} items · Store stack</small></span>
                      <em aria-hidden="true">→</em>
                    </button>
                  ))}
                  {!MATERIALS.some((material) => game.resources[material.id] > 0) && <div className="chest-empty">No resource stacks in your backpack.</div>}
                </div>
              </section>
              <section>
                <h3>Chest contents</h3>
                <p>Choose a stored stack to move all of it back into your backpack.</p>
                <div className="chest-grid">
                  {MATERIALS.filter((material) => (openChest.storage?.[material.id] ?? 0) > 0).map((material) => (
                    <button key={material.id} onClick={() => moveChestStack(material.id, false)} aria-label={"Retrieve all " + material.name}>
                      <MaterialIcon material={material.id} />
                      <span><b>{material.name}</b><small>{openChest.storage?.[material.id]} items · Retrieve stack</small></span>
                      <em className="retrieve-arrow" aria-hidden="true">←</em>
                    </button>
                  ))}
                  {!MATERIALS.some((material) => (openChest.storage?.[material.id] ?? 0) > 0) && <div className="chest-empty">This chest is empty.</div>}
                </div>
              </section>
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

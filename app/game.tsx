"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CaveRealm = "caveSystem";
type CaveZone = "stone" | "iron" | "sulfur";
type Realm = "meadow" | CaveRealm;
type ResourceSize = "small" | "medium" | "huge";
type ResourceKind =
  | "oak"
  | "pine"
  | "birch"
  | "rock"
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
type Tool = DurableTool | "hammer" | "spear" | "sword" | "bow" | "ironBow" | "pistol" | FoodMaterial | "build" | "hands";
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
type GroundAnimalKind = "bear" | "boar" | "deer" | "rabbit" | "fox" | "wolf" | "raccoon";
type BirdKind = "crow" | "owl" | "turkey";
type AnimalKind = GroundAnimalKind | BirdKind;
type MonsterKind = "shade" | "crawler" | "brute" | "wraith" | "maw";
type CreatureKind = MonsterKind | AnimalKind;
type ArmorKind = "none" | "copper" | "iron" | "blacksteel";
type InventoryItem = Tool | BuildKind | Material;
type Panel = "inventory" | "craft" | "build" | null;
type AttackStyle = "slash" | "thrust" | "shot";

interface ResourceNode {
  id: number;
  kind: ResourceKind;
  size: ResourceSize;
  realm: Realm;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  respawnAt: number;
}

interface GroundDrop {
  id: number;
  material: Material;
  amount: number;
  realm: Realm;
  x: number;
  y: number;
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
  rangedAt: number;
  rangedChargeUntil: number;
  rangedAim: number;
  boss: boolean;
  homeX: number;
  homeY: number;
  provokedUntil: number;
  waryOfPlayer: boolean;
  respawnAt: number;
  fleeing: boolean;
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
  kind: "arrow" | "bullet" | "guardianOrb";
  realm: Realm;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  damage: number;
}

interface AttackFlash {
  realm: Realm;
  x: number;
  y: number;
  direction: number;
  range: number;
  arc: number;
  style: AttackStyle;
  startedAt: number;
  duration: number;
}

type LightOccluder =
  | { shape: "circle"; x: number; y: number; radius: number }
  | { shape: "rectangle"; x: number; y: number; halfWidth: number; halfHeight: number };

type HeldAction =
  | { kind: "resource"; nodeId: number }
  | { kind: "free" }
  | null;

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
    ironBow: boolean;
    pistol: boolean;
    hammer: boolean;
    toolDurability: Record<DurableTool, number[]>;
    armor: ArmorKind;
  };
  kits: Record<BuildKind, number>;
  selected: Tool;
  selectedSlot: number;
  weapon: "spear" | "sword" | "bow" | "ironBow" | "pistol";
  inventory: (InventoryItem | null)[];
  hotbar: (InventoryItem | null)[];
  buildMode: BuildKind | null;
  openChestId: number | null;
  workOrders: WorkOrder[];
  autoBuildActive: boolean;
  nodes: ResourceNode[];
  drops: GroundDrop[];
  treasures: CaveTreasure[];
  creatures: Creature[];
  buildings: Building[];
  projectiles: Projectile[];
  attackFlash: AttackFlash | null;
  keys: Set<string>;
  mouseHeld: boolean;
  heldAction: HeldAction;
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

const WORLD_W = 7200;
const WORLD_H = 5200;
const GRID = 48;
const DAY_SECONDS = 480;
const RESOURCE_RESPAWN_DAYS: Record<ResourceKind, readonly [number, number]> = {
  oak: [10, 15],
  pine: [5, 10],
  birch: [5, 10],
  rock: [10, 20],
  ironOre: [10, 20],
  copperOre: [10, 20],
  coal: [10, 20],
  sulfur: [10, 20],
  aetherOre: [10, 20],
  berryBush: [2, 4],
  grass: [2, 4],
  mushroom: [2, 4],
};
const ANIMAL_RESPAWN_DAYS = [2, 4] as const;
const LOW_HEALTH_THRESHOLD = 30;
const LOW_HUNGER_THRESHOLD = 25;
const COMPANION_ATTACK_COOLDOWN_MS = 1100;
const CREATURE_ATTACK_COOLDOWN_MS = 1250;
const CREATURE_STRUCTURE_ATTACK_COOLDOWN_MS = 1200;
const PLAYER_LIGHT_RADIUS: Record<Realm, number> = { meadow: 96, caveSystem: 112 };
const BUILDING_LIGHT_RADIUS: Partial<Record<BuildKind, number>> = {
  torch: 225,
  campfire: 410,
  fireTrap: 115,
};
const LIGHT_BLOCKING_BUILDINGS = new Set<BuildKind>([
  "woodGate",
  "stoneGate",
  "woodWall",
  "stoneWall",
  "metalWall",
  "door",
]);
const LIGHT_RAY_COUNT = 96;
const LIGHT_ANGLE_EPSILON = 0.0008;
const MONSTER_SPAWN_LIGHT_PADDING = 30;
const CONSTRUCTION_SECONDS = 1.5;
const DECONSTRUCTION_SECONDS = 2.25;
const BUILDING_HALF_SIZE = 23;
const CROP_HALF_SIZE = GRID - 2;
const AUTO_BUILD_RANGE = GRID * 3;
const SPAWN_X = 2780;
const SPAWN_Y = 1940;
const SHALLOW_WATER_SPEED_FACTOR = 0.48;

interface ForestRegion {
  id: "blackwood" | "pineReach" | "birchGrove";
  name: string;
  x: number;
  y: number;
  rx: number;
  ry: number;
  rotation: number;
  color: string;
  treeCount: number;
}

const FOREST_REGIONS: ForestRegion[] = [
  { id: "blackwood", name: "THE BLACKWOOD", x: 1320, y: 2080, rx: 1120, ry: 1500, rotation: 0, color: "#5f8f50", treeCount: 245 },
  { id: "pineReach", name: "PINE REACH", x: 5790, y: 1240, rx: 1080, ry: 820, rotation: -0.16, color: "#557f49", treeCount: 175 },
  { id: "birchGrove", name: "BIRCH GROVE", x: 5480, y: 4280, rx: 1380, ry: 760, rotation: 0.1, color: "#6f9b58", treeCount: 195 },
];

interface WaterBody {
  name: string;
  x: number;
  y: number;
  rx: number;
  ry: number;
  rotation: number;
  deepScale: number;
}

const WATER_BODIES: WaterBody[] = [
  { name: "STILLWATER", x: 3480, y: 1840, rx: 440, ry: 310, rotation: -0.18, deepScale: 0.57 },
  { name: "EASTMERE", x: 6500, y: 2920, rx: 570, ry: 820, rotation: 0.24, deepScale: 0.62 },
  { name: "LOW MARSH", x: 3430, y: 4460, rx: 820, ry: 390, rotation: 0.08, deepScale: 0.52 },
];

interface CaveDefinition {
  id: CaveZone;
  entranceX: number;
  entranceY: number;
  undergroundX: number;
  undergroundY: number;
  chamberRadius: number;
  ground: string;
  textureA: string;
  textureB: string;
}

interface CaveRoom {
  x: number;
  y: number;
  radius: number;
  ground: string;
}

interface CaveConnection {
  start: { x: number; y: number };
  end: { x: number; y: number };
  halfWidth: number;
}

const CAVES: CaveDefinition[] = [
  {
    id: "stone",
    entranceX: 4720,
    entranceY: 480,
    undergroundX: 950,
    undergroundY: 1050,
    chamberRadius: 720,
    ground: "#444f4a",
    textureA: "#52605a",
    textureB: "#35423d",
  },
  {
    id: "iron",
    entranceX: 4420,
    entranceY: 3260,
    undergroundX: 6220,
    undergroundY: 1120,
    chamberRadius: 760,
    ground: "#494b4b",
    textureA: "#5a5c5b",
    textureB: "#393c3c",
  },
  {
    id: "sulfur",
    entranceX: 650,
    entranceY: 470,
    undergroundX: 4050,
    undergroundY: 4320,
    chamberRadius: 780,
    ground: "#4d4d39",
    textureA: "#626044",
    textureB: "#3d3e31",
  },
];

const CAVE_HUB: CaveRoom = { x: 3500, y: 2600, radius: 620, ground: "#414a46" };
const CAVE_ROOMS: CaveRoom[] = [
  CAVE_HUB,
  { x: 2050, y: 2280, radius: 430, ground: "#3e4944" },
  { x: 3450, y: 820, radius: 420, ground: "#444b49" },
  { x: 5250, y: 2460, radius: 460, ground: "#454945" },
  { x: 2700, y: 4150, radius: 470, ground: "#42473d" },
];
const CAVE_CONNECTIONS: CaveConnection[] = [
  { start: { x: CAVES[0].undergroundX, y: CAVES[0].undergroundY }, end: CAVE_ROOMS[1], halfWidth: 195 },
  { start: CAVE_ROOMS[1], end: CAVE_HUB, halfWidth: 185 },
  { start: { x: CAVES[0].undergroundX, y: CAVES[0].undergroundY }, end: CAVE_ROOMS[2], halfWidth: 165 },
  { start: CAVE_ROOMS[2], end: CAVE_HUB, halfWidth: 180 },
  { start: { x: CAVES[1].undergroundX, y: CAVES[1].undergroundY }, end: CAVE_ROOMS[2], halfWidth: 175 },
  { start: { x: CAVES[1].undergroundX, y: CAVES[1].undergroundY }, end: CAVE_ROOMS[3], halfWidth: 205 },
  { start: CAVE_ROOMS[3], end: CAVE_HUB, halfWidth: 190 },
  { start: CAVE_ROOMS[2], end: CAVE_ROOMS[3], halfWidth: 150 },
  { start: { x: CAVES[2].undergroundX, y: CAVES[2].undergroundY }, end: CAVE_ROOMS[4], halfWidth: 200 },
  { start: CAVE_ROOMS[4], end: CAVE_HUB, halfWidth: 185 },
  { start: { x: CAVES[2].undergroundX, y: CAVES[2].undergroundY }, end: CAVE_ROOMS[3], halfWidth: 170 },
  { start: CAVE_ROOMS[1], end: CAVE_ROOMS[4], halfWidth: 155 },
];

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
  stoneGate: { name: "Stone Gate", detail: "Reinforced entrance", icon: "SG", cost: { stone: 5, iron: 1 }, makes: 1, hp: 130 },
  floor: { name: "Wood Floor", detail: "Snaps beneath structures", icon: "FL", cost: { wood: 2 }, makes: 2, hp: 45 },
  woodWall: { name: "Wood Wall", detail: "Basic shelter wall", icon: "WW", cost: { wood: 4 }, makes: 2, hp: 90 },
  stoneWall: { name: "Stone Wall", detail: "Strong masonry wall", icon: "SW", cost: { stone: 7 }, makes: 2, hp: 155 },
  metalWall: { name: "Metal Wall", detail: "Heavy end-game barrier", icon: "MW", cost: { iron: 6, coal: 1 }, makes: 2, hp: 235 },
  door: { name: "House Door", detail: "A doorway for your shelter", icon: "DR", cost: { wood: 4, iron: 1 }, makes: 1, hp: 90 },
  roof: { name: "Roof", detail: "Shelter from the dark", icon: "RF", cost: { wood: 4, fiber: 2 }, makes: 1, hp: 75 },
  spikes: { name: "Spike Trap", detail: "Fast close-range damage", icon: "SP", cost: { wood: 4, iron: 2 }, makes: 1, hp: 60 },
  snare: { name: "Wire Snare", detail: "Hurts and slows monsters", icon: "SN", cost: { fiber: 5, copper: 2 }, makes: 2, hp: 45 },
  fireTrap: { name: "Fire Trap", detail: "Burns a wide area", icon: "FT", cost: { stone: 4, coal: 3, sulfur: 2 }, makes: 1, hp: 70 },
  turret: { name: "Scrap Turret", detail: "Automatically shoots monsters", icon: "TU", cost: { wood: 6, iron: 7, copper: 5 }, makes: 1, hp: 95 },
  crop: { name: "Crop Plot", detail: "Grows berries over time", icon: "CP", cost: { wood: 2, seeds: 1 }, makes: 1, hp: 45 },
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

const ANIMAL_KINDS: AnimalKind[] = ["bear", "boar", "deer", "rabbit", "fox", "wolf", "raccoon", "crow", "owl", "turkey"];
const BIRD_KINDS: BirdKind[] = ["crow", "owl", "turkey"];
const MONSTER_KINDS: MonsterKind[] = ["shade", "crawler", "brute", "wraith", "maw"];
const MONSTER_ATTACK_REACH: Record<MonsterKind, number> = {
  shade: 76,
  crawler: 82,
  brute: 88,
  wraith: 108,
  maw: 96,
};
const BOSS_ATTACK_REACH_BONUS = 18;
const BOSS_SPEED = 78;
const BOSS_SENSE_DISTANCE = 540;
const BOSS_RANGED_MIN_DISTANCE = 220;
const BOSS_RANGED_RANGE = 520;
const BOSS_RANGED_DAMAGE = 14;
const BOSS_RANGED_COOLDOWN_MS = 2600;
const BOSS_RANGED_WINDUP_MS = 650;
const BOSS_PROJECTILE_SPEED = 315;
const MAX_TAMED_ANIMALS = 5;
const ANIMAL_LURE_DISTANCE = 360;
const WARY_ESCAPE_DISTANCE = 520;
const WARY_NOTICE_BONUS = 120;
const MEAT_EATING_ANIMALS: AnimalKind[] = ["bear", "fox", "wolf"];
const PERMANENTLY_WARY_PREY: AnimalKind[] = ["deer", "rabbit"];

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
    habitat: "forest" | "meadow";
    flying: boolean;
    meatDrop: number;
    hideDrop: number;
    companionDamage: number;
  }
> = {
  bear: { hp: 70, speed: 48, damage: 9, temperament: "aggressive", noticeDistance: 135, tameChance: 0.1, startingCount: 1, habitat: "forest", flying: false, meatDrop: 4, hideDrop: 2, companionDamage: 16 },
  boar: { hp: 44, speed: 55, damage: 6, temperament: "aggressive", noticeDistance: 90, tameChance: 0.24, startingCount: 2, habitat: "forest", flying: false, meatDrop: 2, hideDrop: 1, companionDamage: 10 },
  deer: { hp: 36, speed: 74, damage: 0, temperament: "skittish", noticeDistance: 220, tameChance: 0.42, startingCount: 7, habitat: "forest", flying: false, meatDrop: 2, hideDrop: 2, companionDamage: 9 },
  rabbit: { hp: 18, speed: 84, damage: 0, temperament: "skittish", noticeDistance: 170, tameChance: 0.6, startingCount: 10, habitat: "forest", flying: false, meatDrop: 1, hideDrop: 1, companionDamage: 7 },
  fox: { hp: 30, speed: 78, damage: 6, temperament: "aggressive", noticeDistance: 135, tameChance: 0.32, startingCount: 3, habitat: "forest", flying: false, meatDrop: 2, hideDrop: 1, companionDamage: 7 },
  wolf: { hp: 50, speed: 70, damage: 8, temperament: "aggressive", noticeDistance: 120, tameChance: 0.16, startingCount: 1, habitat: "forest", flying: false, meatDrop: 2, hideDrop: 1, companionDamage: 14 },
  raccoon: { hp: 28, speed: 72, damage: 0, temperament: "skittish", noticeDistance: 115, tameChance: 0.35, startingCount: 5, habitat: "forest", flying: false, meatDrop: 1, hideDrop: 1, companionDamage: 7 },
  crow: { hp: 14, speed: 102, damage: 0, temperament: "skittish", noticeDistance: 85, tameChance: 0.68, startingCount: 7, habitat: "meadow", flying: true, meatDrop: 1, hideDrop: 0, companionDamage: 5 },
  owl: { hp: 24, speed: 82, damage: 0, temperament: "skittish", noticeDistance: 105, tameChance: 0.38, startingCount: 3, habitat: "forest", flying: true, meatDrop: 1, hideDrop: 0, companionDamage: 8 },
  turkey: { hp: 34, speed: 62, damage: 0, temperament: "skittish", noticeDistance: 130, tameChance: 0.28, startingCount: 4, habitat: "meadow", flying: false, meatDrop: 3, hideDrop: 0, companionDamage: 8 },
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
  ironBow: "Iron Bow",
  pistol: "Scrap Pistol",
  wood: "Wood",
  stone: "Stone",
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

function isBird(kind: CreatureKind): kind is BirdKind {
  return BIRD_KINDS.includes(kind as BirdKind);
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

interface AttackProfile {
  damage: number;
  range: number;
  cooldown: number;
  animationSeconds: number;
  arc: number;
  style: AttackStyle;
}

const BASIC_ATTACK: AttackProfile = {
  damage: 3,
  range: 78,
  cooldown: 600,
  animationSeconds: 0.32,
  arc: 0.8,
  style: "slash",
};

const ATTACK_PROFILES: Partial<Record<Tool, AttackProfile>> = {
  woodAxe: { damage: 7, range: 78, cooldown: 700, animationSeconds: 0.36, arc: 1.05, style: "slash" },
  stoneAxe: { damage: 9, range: 78, cooldown: 760, animationSeconds: 0.4, arc: 1.05, style: "slash" },
  ironAxe: { damage: 14, range: 78, cooldown: 700, animationSeconds: 0.38, arc: 1.05, style: "slash" },
  aetheriumAxe: { damage: 22, range: 78, cooldown: 620, animationSeconds: 0.34, arc: 1.05, style: "slash" },
  woodPickaxe: { damage: 5, range: 78, cooldown: 820, animationSeconds: 0.42, arc: 0.85, style: "slash" },
  stonePickaxe: { damage: 7, range: 78, cooldown: 860, animationSeconds: 0.44, arc: 0.85, style: "slash" },
  ironPickaxe: { damage: 11, range: 78, cooldown: 800, animationSeconds: 0.41, arc: 0.85, style: "slash" },
  aetheriumPickaxe: { damage: 18, range: 78, cooldown: 700, animationSeconds: 0.38, arc: 0.85, style: "slash" },
  hammer: { damage: 3, range: 78, cooldown: 750, animationSeconds: 0.4, arc: 0.9, style: "slash" },
  spear: { damage: 17, range: 102, cooldown: 620, animationSeconds: 0.34, arc: 0.38, style: "thrust" },
  sword: { damage: 25, range: 102, cooldown: 480, animationSeconds: 0.3, arc: 1.15, style: "slash" },
  bow: { damage: 18, range: 520, cooldown: 780, animationSeconds: 0.38, arc: 0, style: "shot" },
  ironBow: { damage: 28, range: 600, cooldown: 780, animationSeconds: 0.38, arc: 0, style: "shot" },
  pistol: { damage: 34, range: 640, cooldown: 460, animationSeconds: 0.24, arc: 0, style: "shot" },
};

function attackProfile(tool: Tool) {
  return ATTACK_PROFILES[tool] ?? BASIC_ATTACK;
}

function isDurableTool(item: InventoryItem | null): item is DurableTool {
  return Boolean(item && item in DURABLE_TOOL_DATA);
}

function durableToolInfo(item: InventoryItem | null) {
  return isDurableTool(item) ? DURABLE_TOOL_DATA[item] : null;
}

function durableToolCount(game: GameState, tool: DurableTool) {
  return game.gear.toolDurability[tool].length;
}

function activeToolDurability(game: GameState, tool: DurableTool) {
  return game.gear.toolDurability[tool][0] ?? 0;
}

function addDurableTool(game: GameState, tool: DurableTool) {
  game.gear.toolDurability[tool].push(DURABLE_TOOL_DATA[tool].maxDurability);
  equipNewItem(game, tool);
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
  if (isDurableTool(item)) return durableToolCount(game, item);
  if (item === "hammer") return game.gear.hammer ? 1 : 0;
  if (item === "spear") return game.gear.spear ? 1 : 0;
  if (item === "sword") return game.gear.sword ? 1 : 0;
  if (item === "bow") return game.gear.bow ? 1 : 0;
  if (item === "ironBow") return game.gear.ironBow ? 1 : 0;
  if (item === "pistol") return game.gear.pistol ? 1 : 0;
  return 0;
}

function ensureItemListed(game: GameState, item: InventoryItem) {
  if (game.hotbar.includes(item) || game.inventory.includes(item)) return;
  const openHotbar = game.hotbar.findIndex((entry) => entry === null);
  if (openHotbar >= 0) {
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

function removeDepletedMaterialStacks(game: GameState) {
  const isDepleted = (item: InventoryItem | null) =>
    item !== null && isMaterial(item) && game.resources[item] <= 0;
  const selectedStackDepleted = isDepleted(game.hotbar[game.selectedSlot]);
  if (!selectedStackDepleted && !game.hotbar.some(isDepleted) && !game.inventory.some(isDepleted)) return;
  game.hotbar = game.hotbar.map((item) => (isDepleted(item) ? null : item));
  game.inventory = game.inventory.map((item) => (isDepleted(item) ? null : item));
  if (selectedStackDepleted) selectSlot(game, game.selectedSlot);
}

function consumeSelectedFood(game: GameState) {
  if (!isFoodItem(game.selected) || game.resources[game.selected] <= 0) return null;
  const food = game.selected;
  game.resources[food] -= 1;
  removeDepletedMaterialStacks(game);
  return food;
}

function isTree(kind: ResourceKind) {
  return kind === "oak" || kind === "pine" || kind === "birch";
}

function isMineable(kind: ResourceKind) {
  return ["rock", "ironOre", "copperOre", "coal", "sulfur", "aetherOre"].includes(kind);
}

const RESOURCE_SIZE_SCALE: Record<ResourceSize, number> = {
  small: 0.68,
  medium: 1,
  huge: 1.62,
};

function nodeRadius(kind: ResourceKind, size: ResourceSize = "medium") {
  const baseRadius = kind === "oak"
    ? 58
    : kind === "pine"
      ? 52
      : kind === "birch"
        ? 47
        : isMineable(kind)
          ? 43
          : kind === "berryBush"
            ? 28
            : 22;
  return baseRadius * (isMineable(kind) ? RESOURCE_SIZE_SCALE[size] : 1);
}

function nodeHp(kind: ResourceKind, size: ResourceSize = "medium") {
  const baseHp = kind === "oak"
    ? 8
    : kind === "pine"
      ? 6
      : kind === "birch"
        ? 5
        : kind === "ironOre"
          ? 8
          : kind === "copperOre"
            ? 7
            : kind === "aetherOre"
              ? 12
              : kind === "rock" || kind === "coal" || kind === "sulfur"
                ? 6
                : 1;
  if (!isMineable(kind)) return baseHp;
  const durabilityScale = size === "small" ? 0.6 : size === "huge" ? 2 : 1;
  return Math.max(1, Math.round(baseHp * durabilityScale));
}

function depositSize(index: number, salt: number): ResourceSize {
  const roll = seeded(index, salt);
  return roll < 0.4 ? "small" : roll < 0.8 ? "medium" : "huge";
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
  if (
    CAVE_ROOMS.some(
      (room) => Math.hypot(x - room.x, y - room.y) <= room.radius - padding,
    )
  ) return true;
  if (
    CAVES.some(
      (cave) =>
        Math.hypot(x - cave.undergroundX, y - cave.undergroundY) <= cave.chamberRadius - padding,
    )
  ) return true;
  return CAVE_CONNECTIONS.some(
    ({ start, end, halfWidth }) =>
      pointToSegmentDistance(x, y, start.x, start.y, end.x, end.y) <= halfWidth - padding,
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

function ellipseLevel(
  x: number,
  y: number,
  region: { x: number; y: number; rx: number; ry: number; rotation: number },
  padding = 0,
) {
  const cos = Math.cos(-region.rotation);
  const sin = Math.sin(-region.rotation);
  const dx = x - region.x;
  const dy = y - region.y;
  const localX = dx * cos - dy * sin;
  const localY = dx * sin + dy * cos;
  return (localX * localX) / ((region.rx + padding) ** 2) +
    (localY * localY) / ((region.ry + padding) ** 2);
}

function forestRegionAt(x: number, y: number) {
  return FOREST_REGIONS.find((region) => ellipseLevel(x, y, region) < 1) || null;
}

function inForest(x: number, y: number) {
  return forestRegionAt(x, y) !== null;
}

function waterEllipseLevel(x: number, y: number, water: WaterBody, scale = 1, padding = 0) {
  const cos = Math.cos(-water.rotation);
  const sin = Math.sin(-water.rotation);
  const dx = x - water.x;
  const dy = y - water.y;
  const localX = dx * cos - dy * sin;
  const localY = dx * sin + dy * cos;
  return (localX * localX) / ((water.rx * scale + padding) ** 2) +
    (localY * localY) / ((water.ry * scale + padding) ** 2);
}

function waterDepthAt(x: number, y: number, padding = 0): "deep" | "shallow" | null {
  for (const water of WATER_BODIES) {
    if (waterEllipseLevel(x, y, water, water.deepScale, padding) < 1) return "deep";
  }
  return WATER_BODIES.some((water) => waterEllipseLevel(x, y, water, 1, padding) < 1) ? "shallow" : null;
}

function inDeepWater(x: number, y: number, padding = 0) {
  return WATER_BODIES.some(
    (water) => waterEllipseLevel(x, y, water, water.deepScale, padding) < 1,
  );
}

function groundSpeedFactor(realm: Realm, x: number, y: number) {
  return realm === "meadow" && waterDepthAt(x, y) === "shallow" ? SHALLOW_WATER_SPEED_FACTOR : 1;
}

function meadowAreaName(x: number, y: number) {
  const forest = forestRegionAt(x, y);
  if (forest) return forest.name;
  if (waterDepthAt(x, y) === "shallow") return "THE SHALLOWS";
  return "THE MEADOW";
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

function respawnDelayMs([minimumDays, maximumDays]: readonly [number, number]) {
  const days = minimumDays + Math.random() * (maximumDays - minimumDays);
  return days * DAY_SECONDS * 1000;
}

function makeGame(): GameState {
  const nodes: ResourceNode[] = [];
  let id = 1;
  const treasureCave = CAVES[Math.floor(Math.random() * CAVES.length)];
  const guardianCave = CAVES[Math.floor(Math.random() * CAVES.length)];
  const treasurePoint = caveEncounterPoint(treasureCave, treasureCave.chamberRadius * 0.48, -95);
  const guardianPoint = caveEncounterPoint(guardianCave, guardianCave.chamberRadius * 0.38, 95);
  const addNode = (
    kind: ResourceKind,
    realm: Realm,
    x: number,
    y: number,
    size: ResourceSize = "medium",
  ) => {
    const blocksMovement = isTree(kind) || isMineable(kind);
    const radius = nodeRadius(kind, size);
    const clearSpawn = realm !== "meadow" || !blocksMovement || Math.hypot(x - SPAWN_X, y - SPAWN_Y) > 360;
    const clearExit =
      realm === "meadow" ||
      CAVES.every((cave) => Math.hypot(x - cave.undergroundX, y - cave.undergroundY) > 340);
    const clearCave =
      realm !== "meadow" ||
      CAVES.every((cave) => Math.hypot(x - cave.entranceX, y - cave.entranceY) > 210);
    const clearWater = realm !== "meadow" || waterDepthAt(x, y, radius + 12) === null;
    const insideCave = realm !== "caveSystem" || isCaveFloor(x, y, radius + 32);
    const clearCaveNode =
      realm !== "caveSystem" ||
      !blocksMovement ||
      nodes.every(
        (node) =>
          node.realm !== realm ||
          !isMineable(node.kind) ||
          Math.hypot(x - node.x, y - node.y) > radius + nodeRadius(node.kind, node.size) + 30,
      );
    const clearEncounter =
      realm !== "caveSystem" ||
      (Math.hypot(x - treasurePoint.x, y - treasurePoint.y) > radius + 75 &&
        Math.hypot(x - guardianPoint.x, y - guardianPoint.y) > radius + 95);
    if (!clearSpawn || !clearExit || !clearCave || !clearWater || !insideCave || !clearCaveNode || !clearEncounter) return;
    const hp = nodeHp(kind, size);
    nodes.push({ id: id++, kind, size, realm, x, y, hp, maxHp: hp, respawnAt: 0 });
  };

  for (let i = 0; i < 340; i++) {
    const x = 110 + seeded(i, 1) * (WORLD_W - 220);
    const y = 110 + seeded(i, 2) * (WORLD_H - 220);
    const roll = i % 16;
    const kind: ResourceKind =
      roll === 0 ? "berryBush" : roll === 1 ? "grass" : roll === 3 || roll === 4 || roll === 5 ? "rock" : roll === 6 ? "birch" : roll === 7 ? "mushroom" : i % 2 ? "oak" : "pine";
    if (!inForest(x, y) || !isTree(kind)) {
      addNode(kind, "meadow", x, y, isMineable(kind) ? depositSize(i, 15) : "medium");
    }
  }

  for (let i = 0; i < 48; i++) {
    addNode(
      "grass",
      "meadow",
      70 + seeded(i, 121) * (WORLD_W - 140),
      70 + seeded(i, 122) * (WORLD_H - 140),
    );
  }
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + seeded(i, 126) * 0.3;
    const distance = 115 + seeded(i, 127) * 235;
    addNode("grass", "meadow", SPAWN_X + Math.cos(angle) * distance, SPAWN_Y + Math.sin(angle) * distance);
  }
  for (let i = 0; i < 8; i++) {
    const size: ResourceSize = i % 3 === 0 ? "small" : i % 3 === 1 ? "medium" : "huge";
    addNode(
      i % 3 === 0 ? "copperOre" : "ironOre",
      "meadow",
      180 + seeded(i, 131) * (WORLD_W - 360),
      180 + seeded(i, 132) * (WORLD_H - 360),
      size,
    );
  }
  for (let i = 0; i < 1; i++) {
    addNode(
      "aetherOre",
      "meadow",
      280 + seeded(i, 137) * (WORLD_W - 560),
      280 + seeded(i, 138) * (WORLD_H - 560),
      "huge",
    );
  }

  for (const [forestIndex, forest] of FOREST_REGIONS.entries()) {
    for (let i = 0; i < forest.treeCount; i++) {
      const angle = seeded(i, 41 + forestIndex * 31) * Math.PI * 2;
      const radius = Math.sqrt(seeded(i, 42 + forestIndex * 31));
      const localX = Math.cos(angle) * forest.rx * radius;
      const localY = Math.sin(angle) * forest.ry * radius;
      const cos = Math.cos(forest.rotation);
      const sin = Math.sin(forest.rotation);
      const x = forest.x + localX * cos - localY * sin;
      const y = forest.y + localX * sin + localY * cos;
      let kind: ResourceKind;
      if (i % 13 === 0) kind = "berryBush";
      else if (i % 17 === 0) kind = "mushroom";
      else if (i % 29 === 0) kind = "grass";
      else if (forest.id === "pineReach") kind = i % 5 < 3 ? "pine" : i % 2 ? "oak" : "birch";
      else if (forest.id === "birchGrove") kind = i % 5 < 3 ? "birch" : i % 2 ? "oak" : "pine";
      else kind = i % 3 === 0 ? "pine" : i % 3 === 1 ? "oak" : "birch";
      const tooClose = isTree(kind) && nodes.some((node) => node.realm === "meadow" && isTree(node.kind) && Math.hypot(node.x - x, node.y - y) < 82);
      if (!tooClose) addNode(kind, "meadow", x, y);
    }
  }

  for (const [caveIndex, cave] of CAVES.entries()) {
    for (let i = 0; i < 68; i++) {
      const roll = i % 24;
      let kind: ResourceKind;
      if (cave.id === "stone") {
        kind = roll === 1 ? "coal" : roll === 5 || roll === 17 ? "mushroom" : "rock";
      } else if (cave.id === "iron") {
        kind = i === 67 ? "aetherOre" : roll === 0 || roll === 12 ? "ironOre" : roll === 7 ? "copperOre" : roll === 3 ? "coal" : "rock";
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
        isMineable(kind) ? depositSize(i, 96 + caveIndex * 11) : "medium",
      );
    }
  }

  for (const [roomIndex, room] of CAVE_ROOMS.slice(1).entries()) {
    for (let i = 0; i < 10; i++) {
      const angle = seeded(i, 171 + roomIndex * 13) * Math.PI * 2;
      const distance = 90 + Math.sqrt(seeded(i, 172 + roomIndex * 13)) * (room.radius - 190);
      const kind: ResourceKind = i % 5 === 0 ? "mushroom" : i % 4 === 0 ? "coal" : "rock";
      addNode(
        kind,
        "caveSystem",
        room.x + Math.cos(angle) * distance,
        room.y + Math.sin(angle) * distance,
        isMineable(kind) && i % 3 === 0 ? "small" : "medium",
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
      loot: { stone: 4, iron: 5, copper: 4, coal: 3, sulfur: 3, aetherium: 2 },
    },
  ];
  const creatures: Creature[] = [];
  const addAnimal = (kind: AnimalKind, x: number, y: number, phase: number) => {
    const stats = ANIMAL_DATA[kind];
    creatures.push({ id: id++, kind, realm: "meadow", x, y, hp: stats.hp, maxHp: stats.hp, speed: stats.speed, damage: stats.damage, fed: 0, tame: false, angry: false, hitAt: 0, phase, slowUntil: 0, rewarded: false, dir: phase, structureHitAt: 0, rangedAt: 0, rangedChargeUntil: 0, rangedAim: phase, boss: false, homeX: x, homeY: y, provokedUntil: 0, waryOfPlayer: false, respawnAt: 0, fleeing: false });
  };
  const wildlifeRoster = ANIMAL_KINDS.flatMap((kind) =>
    Array.from({ length: ANIMAL_DATA[kind].startingCount }, () => kind),
  );
  for (let i = wildlifeRoster.length - 1; i > 0; i--) {
    const swapIndex = Math.floor(seeded(i, 63) * (i + 1));
    [wildlifeRoster[i], wildlifeRoster[swapIndex]] = [wildlifeRoster[swapIndex], wildlifeRoster[i]];
  }
  for (let i = 0; i < wildlifeRoster.length; i++) {
    const kind = wildlifeRoster[i];
    const stats = ANIMAL_DATA[kind];
    let x = FOREST_REGIONS[0].x;
    let y = FOREST_REGIONS[0].y;
    const firstOfSpecies = wildlifeRoster.indexOf(kind) === i;
    if (kind === "crow" && firstOfSpecies) {
      x = SPAWN_X + 410;
      y = SPAWN_Y - 145;
    } else if (kind === "owl" && firstOfSpecies) {
      x = SPAWN_X - 500;
      y = SPAWN_Y - 220;
    } else if (kind === "turkey" && firstOfSpecies) {
      x = SPAWN_X + 555;
      y = SPAWN_Y + 130;
    } else {
      for (let attempt = 0; attempt < 18; attempt++) {
        const sample = i * 19 + attempt;
        if (stats.habitat === "forest") {
          const forest = FOREST_REGIONS[Math.floor(seeded(sample, 60) * FOREST_REGIONS.length)];
          const angle = seeded(sample, 61) * Math.PI * 2;
          const distance = Math.sqrt(seeded(sample, 62)) * 0.78;
          const localX = Math.cos(angle) * forest.rx * distance;
          const localY = Math.sin(angle) * forest.ry * distance;
          const cos = Math.cos(forest.rotation);
          const sin = Math.sin(forest.rotation);
          x = forest.x + localX * cos - localY * sin;
          y = forest.y + localX * sin + localY * cos;
        } else {
          x = 180 + seeded(sample, 161) * (WORLD_W - 360);
          y = 180 + seeded(sample, 162) * (WORLD_H - 360);
          if (inForest(x, y)) continue;
        }
        const blocked = !stats.flying && nodes.some(
          (node) =>
            node.realm === "meadow" &&
            node.hp > 0 &&
            (isTree(node.kind) || isMineable(node.kind)) &&
            Math.hypot(node.x - x, node.y - y) < nodeRadius(node.kind, node.size) + 30,
        );
        if (!blocked && (stats.flying || !inDeepWater(x, y, 30))) break;
      }
    }
    addAnimal(wildlifeRoster[i], x, y, i * 0.73);
  }
  creatures.push({
    id: id++,
    kind: "maw",
    realm: "caveSystem",
    x: guardianPoint.x,
    y: guardianPoint.y,
    hp: 240,
    maxHp: 240,
    speed: BOSS_SPEED,
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
    rangedAt: -BOSS_RANGED_COOLDOWN_MS,
    rangedChargeUntil: 0,
    rangedAim: Math.atan2(CAVE_HUB.y - guardianPoint.y, CAVE_HUB.x - guardianPoint.x),
    boss: true,
    homeX: guardianPoint.x,
    homeY: guardianPoint.y,
    provokedUntil: 0,
    waryOfPlayer: false,
    respawnAt: 0,
    fleeing: false,
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
    resources: { wood: 0, stone: 0, iron: 0, copper: 0, coal: 0, sulfur: 0, aetherium: 0, fiber: 0, berries: 3, meat: 0, mushrooms: 0, seeds: 0, hide: 0, arrows: 0, bullets: 0 },
    gear: {
      spear: false,
      sword: false,
      bow: false,
      ironBow: false,
      pistol: false,
      hammer: false,
      toolDurability: {
        woodAxe: [DURABLE_TOOL_DATA.woodAxe.maxDurability],
        stoneAxe: [],
        ironAxe: [],
        aetheriumAxe: [],
        woodPickaxe: [],
        stonePickaxe: [],
        ironPickaxe: [],
        aetheriumPickaxe: [],
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
    inventory: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    hotbar: ["berries", "woodAxe", null, null, null, null, null, null, null, null],
    buildMode: null,
    openChestId: null,
    workOrders: [],
    autoBuildActive: false,
    nodes,
    drops: [],
    treasures,
    creatures,
    buildings: [startingCampfire],
    projectiles: [],
    attackFlash: null,
    keys: new Set(),
    mouseHeld: false,
    heldAction: null,
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

function buildingLightRadius(building: Building) {
  if (building.hp <= 0 || building.construction < 1) return 0;
  return BUILDING_LIGHT_RADIUS[building.kind] ?? 0;
}

function pointIsLit(game: GameState, realm: Realm, x: number, y: number, padding = 0) {
  if (
    realm === game.realm &&
    Math.hypot(x - game.player.x, y - game.player.y) <= PLAYER_LIGHT_RADIUS[realm] + padding &&
    lightLineIsClear(game, realm, game.player.x, game.player.y, x, y)
  ) return true;
  return game.buildings.some((building) => {
    if (building.realm !== realm) return false;
    const radius = buildingLightRadius(building);
    if (radius <= 0) return false;
    const center = buildingWorldCenter(building);
    return Math.hypot(x - center.x, y - center.y) <= radius + padding &&
      lightLineIsClear(game, realm, center.x, center.y, x, y);
  });
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
  removeDepletedMaterialStacks(game);
}

function spawnNightWave(game: GameState) {
  game.wave = game.day;
  const count = 6 + game.day * 3;
  let spawned = 0;
  for (let i = 0; i < count; i++) {
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
    let spawnPoint: { x: number; y: number } | null = null;
    for (let attempt = 0; attempt < 160; attempt++) {
      const candidateIndex = i * 211 + attempt * 2;
      const candidateX = 70 + seeded(candidateIndex, game.day * 17 + 101) * (WORLD_W - 140);
      const candidateY = 70 + seeded(candidateIndex + 1, game.day * 19 + 103) * (WORLD_H - 140);
      if (Math.hypot(candidateX - game.player.x, candidateY - game.player.y) < 360) continue;
      if (game.realm === "caveSystem" && !isCaveFloor(candidateX, candidateY, 38)) continue;
      if (game.realm === "meadow" && inDeepWater(candidateX, candidateY, 30)) continue;
      if (pointIsLit(game, game.realm, candidateX, candidateY, MONSTER_SPAWN_LIGHT_PADDING)) continue;
      if (reservedBuildingAt(game, game.realm, candidateX, candidateY, 30)) continue;
      if (
        game.nodes.some(
          (node) =>
            node.realm === game.realm &&
            node.hp > 0 &&
            (isTree(node.kind) || isMineable(node.kind)) &&
            distanceToNodeFootprint(node, candidateX, candidateY, 20) === 0,
        )
      ) continue;
      spawnPoint = { x: candidateX, y: candidateY };
      break;
    }
    if (!spawnPoint) continue;
    const baseStats: Record<MonsterKind, { hp: number; hpScale: number; speed: number; damage: number }> = {
      shade: { hp: 28, hpScale: 8, speed: 84, damage: 7 },
      crawler: { hp: 23, hpScale: 6, speed: 116, damage: 6 },
      brute: { hp: 54, hpScale: 13, speed: 60, damage: 12 },
      wraith: { hp: 42, hpScale: 10, speed: 96, damage: 10 },
      maw: { hp: 92, hpScale: 17, speed: 56, damage: 17 },
    };
    const stats = baseStats[kind];
    const hp = stats.hp + game.day * stats.hpScale;
    game.creatures.push({
      id: game.lastId++,
      kind,
      realm: game.realm,
      x: spawnPoint.x,
      y: spawnPoint.y,
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
      dir: Math.atan2(game.player.y - spawnPoint.y, game.player.x - spawnPoint.x),
      structureHitAt: 0,
      rangedAt: 0,
      rangedChargeUntil: 0,
      rangedAim: 0,
      boss: false,
      homeX: spawnPoint.x,
      homeY: spawnPoint.y,
      provokedUntil: 0,
      waryOfPlayer: false,
      respawnAt: 0,
      fleeing: false,
    });
    spawned += 1;
  }
  notify(game, "NIGHT " + game.day + " — " + spawned + " horrors have entered the hunt.", 4300);
}

function activeTool(game: GameState): Tool {
  const order = game.workOrders[0];
  const building = order && game.buildings.find((candidate) => candidate.id === order.buildingId);
  if (
    game.autoBuildActive &&
    order?.action === "construct" &&
    building?.realm === game.realm &&
    distanceToBuilding(building, game.player.x, game.player.y) <= AUTO_BUILD_RANGE &&
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
  releasePrimaryInput(game);
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
  if (item === "spear" || item === "sword" || item === "bow" || item === "ironBow" || item === "pistol") game.weapon = item;
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

function tamedAnimalCount(game: GameState) {
  return game.creatures.filter(
    (creature) => creature.hp > 0 && creature.tame && isAnimal(creature.kind),
  ).length;
}

function isMeatEatingAnimal(kind: AnimalKind) {
  return MEAT_EATING_ANIMALS.includes(kind);
}

function isPermanentlyWaryPrey(kind: AnimalKind) {
  return PERMANENTLY_WARY_PREY.includes(kind);
}

function animalLureFood(kind: AnimalKind): Material {
  return isMeatEatingAnimal(kind) ? "meat" : "berries";
}

function isHoldingAnimalLure(game: GameState, kind: AnimalKind) {
  const food = animalLureFood(kind);
  return game.selected === food && game.resources[food] > 0;
}

function makePreyPermanentlyWary(creature: Creature) {
  if (!isAnimal(creature.kind) || !isPermanentlyWaryPrey(creature.kind)) return;
  creature.waryOfPlayer = true;
  creature.provokedUntil = 0;
}

function nearestNode(game: GameState, maxDistance: number) {
  let found: ResourceNode | null = null;
  let best = maxDistance;
  for (const node of game.nodes) {
    if (node.realm !== game.realm || node.hp <= 0) continue;
    const distance = Math.hypot(node.x - game.player.x, node.y - game.player.y) - nodeRadius(node.kind, node.size);
    if (distance < best) {
      best = distance;
      found = node;
    }
  }
  return found;
}

function collectGroundDrops(game: GameState) {
  const collected = game.drops.filter(
    (drop) =>
      drop.realm === game.realm &&
      Math.hypot(drop.x - game.player.x, drop.y - game.player.y) < 36,
  );
  if (collected.length === 0) return;

  const collectedIds = new Set(collected.map((drop) => drop.id));
  const totals = new Map<Material, number>();
  for (const drop of collected) {
    addMaterial(game, drop.material, drop.amount);
    totals.set(drop.material, (totals.get(drop.material) ?? 0) + drop.amount);
  }
  game.drops = game.drops.filter((drop) => !collectedIds.has(drop.id));
  notify(
    game,
    "Picked up " +
      [...totals].map(([material, amount]) => amount + " " + itemLabel(material)).join(" · "),
    1300,
  );
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
  return Math.max(0, Math.hypot(node.x - x, node.y - y) - nodeRadius(node.kind, node.size) - padding);
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
  const radius = nodeRadius(node.kind, node.size) + padding;
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

function isLightBlockingBuilding(building: Building) {
  if (building.hp <= 0 || building.construction < 1 || !LIGHT_BLOCKING_BUILDINGS.has(building.kind)) return false;
  return !(["woodGate", "stoneGate", "door"].includes(building.kind) && building.open);
}

function collectLightOccluders(
  game: GameState,
  realm: Realm,
  sourceX: number,
  sourceY: number,
  radius: number,
) {
  const occluders: LightOccluder[] = [];
  for (const node of game.nodes) {
    if (node.realm !== realm || node.hp <= 0 || !isTree(node.kind)) continue;
    const blockerRadius = nodeRadius(node.kind, node.size);
    if (Math.hypot(node.x - sourceX, node.y - sourceY) > radius + blockerRadius) continue;
    occluders.push({ shape: "circle", x: node.x, y: node.y, radius: blockerRadius });
  }
  for (const building of game.buildings) {
    if (building.realm !== realm || !isLightBlockingBuilding(building)) continue;
    const center = buildingWorldCenter(building);
    const halfSize = buildingHalfSize(building.kind);
    const dx = Math.max(Math.abs(center.x - sourceX) - halfSize, 0);
    const dy = Math.max(Math.abs(center.y - sourceY) - halfSize, 0);
    if (Math.hypot(dx, dy) > radius) continue;
    occluders.push({
      shape: "rectangle",
      x: center.x,
      y: center.y,
      halfWidth: halfSize,
      halfHeight: halfSize,
    });
  }
  return occluders;
}

function rayCircleDistance(
  sourceX: number,
  sourceY: number,
  directionX: number,
  directionY: number,
  blocker: Extract<LightOccluder, { shape: "circle" }>,
  maximum: number,
) {
  const offsetX = sourceX - blocker.x;
  const offsetY = sourceY - blocker.y;
  const projection = offsetX * directionX + offsetY * directionY;
  const discriminant = projection * projection -
    (offsetX * offsetX + offsetY * offsetY - blocker.radius * blocker.radius);
  if (discriminant < 0) return null;
  const near = -projection - Math.sqrt(discriminant);
  if (near < 0 || near > maximum) return null;
  return near;
}

function rayRectangleDistance(
  sourceX: number,
  sourceY: number,
  directionX: number,
  directionY: number,
  blocker: Extract<LightOccluder, { shape: "rectangle" }>,
  maximum: number,
) {
  let near = 0;
  let far = maximum;
  const axes = [
    { source: sourceX, direction: directionX, minimum: blocker.x - blocker.halfWidth, maximum: blocker.x + blocker.halfWidth },
    { source: sourceY, direction: directionY, minimum: blocker.y - blocker.halfHeight, maximum: blocker.y + blocker.halfHeight },
  ];
  for (const axis of axes) {
    if (Math.abs(axis.direction) < 0.000001) {
      if (axis.source < axis.minimum || axis.source > axis.maximum) return null;
      continue;
    }
    const first = (axis.minimum - axis.source) / axis.direction;
    const second = (axis.maximum - axis.source) / axis.direction;
    near = Math.max(near, Math.min(first, second));
    far = Math.min(far, Math.max(first, second));
    if (near > far) return null;
  }
  return near >= 0 && near <= maximum ? near : null;
}

function lightOccluderRayDistance(
  sourceX: number,
  sourceY: number,
  angle: number,
  maximum: number,
  blocker: LightOccluder,
) {
  const directionX = Math.cos(angle);
  const directionY = Math.sin(angle);
  return blocker.shape === "circle"
    ? rayCircleDistance(sourceX, sourceY, directionX, directionY, blocker, maximum)
    : rayRectangleDistance(sourceX, sourceY, directionX, directionY, blocker, maximum);
}

function caveWallRayDistance(
  sourceX: number,
  sourceY: number,
  directionX: number,
  directionY: number,
  maximum: number,
) {
  if (!isCaveFloor(sourceX, sourceY)) return 0;
  let previous = 0;
  for (let distance = 12; distance <= maximum + 12; distance += 12) {
    const sample = Math.min(maximum, distance);
    if (!isCaveFloor(sourceX + directionX * sample, sourceY + directionY * sample)) {
      let inside = previous;
      let outside = sample;
      for (let step = 0; step < 7; step++) {
        const midpoint = (inside + outside) / 2;
        if (isCaveFloor(sourceX + directionX * midpoint, sourceY + directionY * midpoint)) inside = midpoint;
        else outside = midpoint;
      }
      return inside;
    }
    if (sample >= maximum) break;
    previous = sample;
  }
  return maximum;
}

function lightRayDistance(
  realm: Realm,
  sourceX: number,
  sourceY: number,
  angle: number,
  maximum: number,
  occluders: LightOccluder[],
) {
  const directionX = Math.cos(angle);
  const directionY = Math.sin(angle);
  let distance = realm === "caveSystem"
    ? caveWallRayDistance(sourceX, sourceY, directionX, directionY, maximum)
    : maximum;
  for (const blocker of occluders) {
    const intersection = lightOccluderRayDistance(sourceX, sourceY, angle, distance, blocker);
    if (intersection !== null) distance = Math.min(distance, intersection);
  }
  return distance;
}

function lightLineIsClear(
  game: GameState,
  realm: Realm,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
) {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.hypot(dx, dy);
  if (distance < 1) return true;
  const occluders = collectLightOccluders(game, realm, sourceX, sourceY, distance);
  const visibleDistance = lightRayDistance(realm, sourceX, sourceY, Math.atan2(dy, dx), distance, occluders);
  return visibleDistance >= distance - 0.75;
}

function monsterAttackLineIsClear(
  game: GameState,
  realm: Realm,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
) {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.hypot(dx, dy);
  if (distance < 1) return true;
  const occluders = collectLightOccluders(game, realm, sourceX, sourceY, distance);
  for (const building of game.buildings) {
    if (
      building.realm !== realm ||
      !isSolidBuilding(building) ||
      isLightBlockingBuilding(building)
    ) continue;
    const center = buildingWorldCenter(building);
    const halfSize = buildingHalfSize(building.kind);
    const buildingDx = Math.max(Math.abs(center.x - sourceX) - halfSize, 0);
    const buildingDy = Math.max(Math.abs(center.y - sourceY) - halfSize, 0);
    if (Math.hypot(buildingDx, buildingDy) > distance) continue;
    occluders.push({
      shape: "rectangle",
      x: center.x,
      y: center.y,
      halfWidth: halfSize,
      halfHeight: halfSize,
    });
  }
  const attackDistance = lightRayDistance(
    realm,
    sourceX,
    sourceY,
    Math.atan2(dy, dx),
    distance,
    occluders,
  );
  return attackDistance >= distance - 0.75;
}

function normalizeLightAngle(angle: number) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

function lightVisibilityAngles(sourceX: number, sourceY: number, occluders: LightOccluder[]) {
  const angles: number[] = [];
  for (let ray = 0; ray < LIGHT_RAY_COUNT; ray++) {
    angles.push(-Math.PI + (ray / LIGHT_RAY_COUNT) * Math.PI * 2);
  }
  for (const blocker of occluders) {
    if (blocker.shape === "circle") {
      const dx = blocker.x - sourceX;
      const dy = blocker.y - sourceY;
      const distance = Math.hypot(dx, dy);
      if (distance <= blocker.radius) continue;
      const center = Math.atan2(dy, dx);
      const tangent = Math.asin(Math.min(0.999, blocker.radius / distance));
      angles.push(normalizeLightAngle(center - tangent - LIGHT_ANGLE_EPSILON));
      for (let sample = 0; sample <= 6; sample++) {
        angles.push(normalizeLightAngle(center - tangent + (sample / 6) * tangent * 2));
      }
      angles.push(normalizeLightAngle(center + tangent + LIGHT_ANGLE_EPSILON));
      continue;
    }
    for (const [cornerX, cornerY] of [
      [blocker.x - blocker.halfWidth, blocker.y - blocker.halfHeight],
      [blocker.x + blocker.halfWidth, blocker.y - blocker.halfHeight],
      [blocker.x + blocker.halfWidth, blocker.y + blocker.halfHeight],
      [blocker.x - blocker.halfWidth, blocker.y + blocker.halfHeight],
    ] as const) {
      const cornerAngle = Math.atan2(cornerY - sourceY, cornerX - sourceX);
      angles.push(normalizeLightAngle(cornerAngle - LIGHT_ANGLE_EPSILON));
      angles.push(normalizeLightAngle(cornerAngle));
      angles.push(normalizeLightAngle(cornerAngle + LIGHT_ANGLE_EPSILON));
    }
  }
  return angles
    .sort((a, b) => a - b)
    .filter((angle, index, sorted) => index === 0 || Math.abs(angle - sorted[index - 1]) > 0.00001);
}

function buildingHalfSize(kind: BuildKind) {
  return kind === "crop" ? CROP_HALF_SIZE : BUILDING_HALF_SIZE;
}

function buildingCenter(kind: BuildKind, gx: number, gy: number) {
  const cropOffset = kind === "crop" ? GRID : 0;
  return { x: gx * GRID + cropOffset, y: gy * GRID + cropOffset };
}

function buildingWorldCenter(building: Building) {
  return buildingCenter(building.kind, building.gx, building.gy);
}

function distanceToBuildingFootprint(kind: BuildKind, gx: number, gy: number, x: number, y: number, padding = 0) {
  const center = buildingCenter(kind, gx, gy);
  const halfSize = buildingHalfSize(kind);
  const dx = Math.max(Math.abs(x - center.x) - halfSize - padding, 0);
  const dy = Math.max(Math.abs(y - center.y) - halfSize - padding, 0);
  return Math.hypot(dx, dy);
}

function distanceToBuilding(building: Building, x: number, y: number, padding = 0) {
  return distanceToBuildingFootprint(building.kind, building.gx, building.gy, x, y, padding);
}

function blockingBuildingAt(game: GameState, realm: Realm, x: number, y: number, radius: number) {
  return game.buildings.find(
    (building) =>
      building.realm === realm &&
      isSolidBuilding(building) &&
      distanceToBuilding(building, x, y, radius) === 0,
  ) || null;
}

function reservedBuildingAt(game: GameState, realm: Realm, x: number, y: number, radius: number) {
  return game.buildings.find(
    (building) =>
      building.realm === realm &&
      building.hp > 0 &&
      distanceToBuilding(building, x, y, radius) === 0,
  ) || null;
}

function creatureRadius(creature: Creature) {
  if (creature.boss) return 49;
  if (creature.kind === "maw" || creature.kind === "bear" || creature.kind === "brute") return 27;
  if (creature.kind === "rabbit") return 14;
  if (creature.kind === "crow") return 13;
  if (creature.kind === "owl") return 17;
  if (creature.kind === "turkey") return 22;
  return 20;
}

function creatureAttackReach(creature: Creature) {
  if (isMonster(creature.kind)) {
    return MONSTER_ATTACK_REACH[creature.kind] + (creature.boss ? BOSS_ATTACK_REACH_BONUS : 0);
  }
  return creatureRadius(creature) + 24;
}

function releasePrimaryInput(game: GameState) {
  game.mouseHeld = false;
  game.heldAction = null;
  game.buildDrag = false;
  game.lastBuildCell = null;
}

function resetTransientInput(game: GameState) {
  releasePrimaryInput(game);
  game.keys.clear();
}

function cancelBuildMode(game: GameState) {
  game.buildMode = null;
  game.selected = "hands";
  releasePrimaryInput(game);
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
  const centerGx = Math.round(x / GRID);
  const centerGy = Math.round(y / GRID);
  return game.buildMode === "crop"
    ? { gx: centerGx - 1, gy: centerGy - 1 }
    : { gx: centerGx, gy: centerGy };
}

function validPlacement(game: GameState, kind: BuildKind, gx: number, gy: number) {
  const { x, y } = buildingCenter(kind, gx, gy);
  const halfSize = buildingHalfSize(kind);
  if (x < halfSize + 47 || y < halfSize + 47 || x > WORLD_W - halfSize - 47 || y > WORLD_H - halfSize - 47) return false;
  if (Math.hypot(x - game.player.x, y - game.player.y) > 260) return false;
  if (game.realm === "caveSystem" && !isCaveFloor(x, y, halfSize + 10)) return false;
  if (
    game.treasures.some(
      (treasure) =>
        treasure.realm === game.realm &&
        distanceToBuildingFootprint(kind, gx, gy, treasure.x, treasure.y, 34) === 0,
    )
  ) return false;
  if (
    buildLayer(kind) === "solid" &&
    game.nodes.some(
      (node) =>
        node.realm === game.realm &&
        node.hp > 0 &&
        (isTree(node.kind) || isMineable(node.kind)) &&
        distanceToBuildingFootprint(kind, gx, gy, node.x, node.y) < nodeRadius(node.kind, node.size),
    )
  ) return false;
  if (
    blocksMovementKind(kind) &&
    (distanceToBuildingFootprint(kind, gx, gy, game.player.x, game.player.y, 25) === 0 ||
      game.creatures.some(
        (creature) =>
          creature.realm === game.realm &&
          creature.hp > 0 &&
          distanceToBuildingFootprint(kind, gx, gy, creature.x, creature.y, creatureRadius(creature)) === 0,
      ))
  ) return false;
  return !game.buildings.some(
    (building) => {
      if (building.realm !== game.realm || buildLayer(building.kind) !== buildLayer(kind)) return false;
      const existingCenter = buildingWorldCenter(building);
      const combinedHalfSize = halfSize + buildingHalfSize(building.kind);
      return Math.abs(existingCenter.x - x) < combinedHalfSize && Math.abs(existingCenter.y - y) < combinedHalfSize;
    },
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
      BUILD_DATA[kind].name + " blueprint placed. Press B to auto-build nearby.",
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
  const center = buildingWorldCenter(building);
  const buildingX = center.x - game.player.x;
  const buildingY = center.y - game.player.y;
  const projection = buildingX * unitX + buildingY * unitY;
  const radius = buildingHalfSize(building.kind) * Math.SQRT2 + padding;
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
  game.autoBuildActive = false;
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
    return distanceToBuilding(building, game.player.x, game.player.y) < 58;
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
        game.buildings = game.buildings.filter((building) => building.id !== nearbyBuilding.id);
        game.workOrders = game.workOrders.filter((order) => order.buildingId !== nearbyBuilding.id);
        notify(game, "Harvested 4 berries and 2 seeds · the crop plot is cleared.");
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
    if (isPermanentlyWaryPrey(creature.kind) && creature.waryOfPlayer) {
      notify(game, "This " + creature.kind + " no longer trusts you and refuses bait.");
      return;
    }
    const lureFood = animalLureFood(creature.kind);
    if (!isHoldingAnimalLure(game, creature.kind)) {
      notify(game, "Equip " + lureFood + ", then press E to feed this " + creature.kind + ".");
      return;
    }
    if (tamedAnimalCount(game) >= MAX_TAMED_ANIMALS) {
      notify(game, "Your companion group is full (" + MAX_TAMED_ANIMALS + "/" + MAX_TAMED_ANIMALS + ").");
      return;
    }
    consumeSelectedFood(game);
    creature.fed += 1;
    creature.angry = false;
    creature.provokedUntil = 0;
    const tameChance = ANIMAL_DATA[creature.kind].tameChance;
    if (Math.random() < tameChance) {
      creature.tame = true;
      notify(
        game,
        "Tamed! Your " + creature.kind + " joined you (" + tamedAnimalCount(game) + "/" + MAX_TAMED_ANIMALS + " companions).",
        3500,
      );
    } else {
      notify(
        game,
        "The " + creature.kind + " ate the " + lureFood + " but stayed wild · " +
          Math.round(tameChance * 100) + "% chance · " + creature.fed +
          (creature.fed === 1 ? " attempt." : " attempts."),
        2600,
      );
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
const TOOL_POWER: Record<ToolTier, number> = { none: 1, wood: 1, stone: 2, iron: 3, aetherium: 5 };

function wearTool(game: GameState, tool: DurableTool) {
  const copies = game.gear.toolDurability[tool];
  const remaining = Math.max(0, (copies[0] ?? 0) - 1);
  copies[0] = remaining;
  if (remaining > 0) return { remaining, broke: false, replacement: false, copies: copies.length };
  copies.shift();
  if (copies.length > 0) {
    return { remaining: copies[0], broke: true, replacement: true, copies: copies.length };
  }
  game.hotbar = game.hotbar.map((item) => (item === tool ? null : item));
  game.inventory = game.inventory.map((item) => (item === tool ? null : item));
  if (game.selected === tool) selectSlot(game, game.selectedSlot);
  return { remaining: 0, broke: true, replacement: false, copies: 0 };
}

function toolWearMessage(tool: DurableTool, wear: ReturnType<typeof wearTool>) {
  if (!wear.broke) return "durability " + wear.remaining + "/" + DURABLE_TOOL_DATA[tool].maxDurability;
  if (wear.replacement) {
    return ITEM_LABELS[tool] + " broke · spare equipped · durability " + wear.remaining + "/" +
      DURABLE_TOOL_DATA[tool].maxDurability + " · " + wear.copies + (wear.copies === 1 ? " copy left" : " copies left");
  }
  return ITEM_LABELS[tool] + " broke · no spares left";
}

function resourceNodeLabel(kind: ResourceKind) {
  if (kind === "oak") return "Oak";
  if (kind === "pine") return "Pine";
  if (kind === "birch") return "Birch";
  if (kind === "rock") return "Stone";
  if (kind === "ironOre") return "Iron deposit";
  if (kind === "copperOre") return "Copper deposit";
  if (kind === "coal") return "Coal deposit";
  if (kind === "sulfur") return "Sulfur deposit";
  if (kind === "aetherOre") return "Aetherium deposit";
  if (kind === "berryBush") return "Berry bush";
  if (kind === "grass") return "Wild grass";
  return "Mushrooms";
}

function resourceNodeLoot(node: ResourceNode): [Material, number][] {
  if (node.kind === "oak") return [["wood", node.maxHp * 2]];
  if (node.kind === "pine" || node.kind === "birch") return [["wood", node.maxHp]];
  if (node.kind === "rock") return [["stone", node.maxHp]];
  if (node.kind === "ironOre") return [["iron", node.maxHp]];
  if (node.kind === "copperOre") return [["copper", node.maxHp]];
  if (node.kind === "coal") return [["coal", node.maxHp]];
  if (node.kind === "sulfur") return [["sulfur", node.maxHp]];
  if (node.kind === "aetherOre") return [["aetherium", node.maxHp]];
  if (node.kind === "berryBush") return [["berries", 3], ["seeds", 1]];
  if (node.kind === "grass") return Math.random() < 0.1 ? [["fiber", 2], ["seeds", 1]] : [["fiber", 2]];
  return [["mushrooms", 2]];
}

function dropNodeLoot(game: GameState, node: ResourceNode) {
  const loot = resourceNodeLoot(node).filter(([, amount]) => amount > 0);
  loot.forEach(([material, amount], index) => {
    const angle = seeded(node.id + index, 811) * Math.PI * 2;
    const distance = 18 + index * 9;
    game.drops.push({
      id: game.lastId++,
      material,
      amount,
      realm: node.realm,
      x: Math.max(24, Math.min(WORLD_W - 24, node.x + Math.cos(angle) * distance)),
      y: Math.max(24, Math.min(WORLD_H - 24, node.y + Math.sin(angle) * distance)),
    });
  });
  return loot.reduce((total, [, amount]) => total + amount, 0);
}

function harvestNode(game: GameState, node: ResourceNode) {
  const now = performance.now();
  if (now < game.player.useReady || now < game.player.attackReady || game.dead || !game.started) return;
  const tree = isTree(node.kind);
  const mining = isMineable(node.kind);
  const selectedTool = durableToolInfo(game.selected);
  const profile = attackProfile(game.selected);
  const usingHands = tree && game.selected === "hands";
  if (tree && selectedTool?.family !== "axe" && !usingHands) {
    notify(game, "Select an empty slot to punch this tree, or equip an axe.", 1100);
    game.player.useReady = now + 500;
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
  node.hp = Math.max(0, node.hp - power);
  game.player.swing = tree || mining ? profile.animationSeconds : 0;
  game.player.attackReady = now + profile.cooldown;
  const feedback: string[] = [];
  if (node.hp <= 0) {
    node.respawnAt = now + respawnDelayMs(RESOURCE_RESPAWN_DAYS[node.kind]);
    const dropCount = dropNodeLoot(game, node);
    feedback.push(resourceNodeLabel(node.kind) + " depleted · " + dropCount + " items dropped. Walk over them to collect");
  } else {
    feedback.push(resourceNodeLabel(node.kind) + " damaged");
  }
  if ((tree || mining) && isDurableTool(game.selected)) {
    const usedTool = game.selected;
    const wear = wearTool(game, usedTool);
    feedback.push(toolWearMessage(usedTool, wear));
  }
  notify(game, feedback.join(" · "), node.hp <= 0 ? 2200 : 900);
}

function attack(game: GameState) {
  const now = performance.now();
  if (now < game.player.attackReady || game.dead || !game.started) return;
  const tool = activeTool(game);
  const profile = attackProfile(tool);
  const isBow = tool === "bow" || tool === "ironBow";
  if (isBow || tool === "pistol") {
    const ammo: Material = isBow ? "arrows" : "bullets";
    if (game.resources[ammo] <= 0) {
      notify(game, "Out of " + ammo + ". Craft more ammunition.", 1000);
      game.player.attackReady = now + 500;
      return;
    }
    game.resources[ammo] -= 1;
    removeDepletedMaterialStacks(game);
    game.player.attackReady = now + profile.cooldown;
    game.player.swing = profile.animationSeconds;
    game.attackFlash = {
      realm: game.realm,
      x: game.player.x,
      y: game.player.y,
      direction: game.player.dir,
      range: 58,
      arc: 0,
      style: profile.style,
      startedAt: now,
      duration: tool === "pistol" ? 120 : 155,
    };
    const speed = tool === "ironBow" ? 720 : tool === "bow" ? 620 : 1120;
    game.projectiles.push({
      id: game.lastId++,
      kind: isBow ? "arrow" : "bullet",
      realm: game.realm,
      x: game.player.x + Math.cos(game.player.dir) * 34,
      y: game.player.y + Math.sin(game.player.dir) * 34,
      vx: Math.cos(game.player.dir) * speed,
      vy: Math.sin(game.player.dir) * speed,
      life: tool === "ironBow" ? 0.84 : tool === "bow" ? 0.9 : 0.58,
      damage: profile.damage,
    });
    return;
  }
  game.player.attackReady = now + profile.cooldown;
  game.player.swing = profile.animationSeconds;
  game.attackFlash = {
    realm: game.realm,
    x: game.player.x,
    y: game.player.y,
    direction: game.player.dir,
    range: profile.range,
    arc: profile.arc,
    style: profile.style,
    startedAt: now,
    duration: profile.style === "thrust" ? 175 : 155,
  };
  let hit = false;
  for (const creature of game.creatures) {
    if (creature.realm !== game.realm || creature.hp <= 0 || creature.tame) continue;
    const dx = creature.x - game.player.x;
    const dy = creature.y - game.player.y;
    const distance = Math.hypot(dx, dy);
    let angle = Math.atan2(dy, dx) - game.player.dir;
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    if (distance < profile.range + Math.max(0, creatureRadius(creature) - 20) && Math.abs(angle) < profile.arc) {
      creature.hp -= profile.damage;
      creature.angry = true;
      creature.provokedUntil = now + 5000;
      makePreyPermanentlyWary(creature);
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
    notify(game, profile.damage + " damage · " + toolWearMessage(tool, wear), 1000);
  } else if (hit) notify(game, profile.damage + " damage", 700);
}

function awardCreatureDrop(game: GameState, creature: Creature) {
  if (creature.rewarded) return;
  creature.rewarded = true;
  game.kills += 1;
  if (isAnimal(creature.kind)) {
    const animal = ANIMAL_DATA[creature.kind];
    creature.respawnAt = performance.now() + respawnDelayMs(ANIMAL_RESPAWN_DAYS);
    if (animal.meatDrop > 0) addMaterial(game, "meat", animal.meatDrop);
    if (animal.hideDrop > 0) addMaterial(game, "hide", animal.hideDrop);
  }
  if (creature.kind === "brute") addMaterial(game, "iron", 1);
  if (creature.kind === "wraith") addMaterial(game, "sulfur", 1);
  if (creature.kind === "maw") {
    addMaterial(game, "iron", 2);
    addMaterial(game, "sulfur", 2);
  }
  if (creature.boss) {
    addMaterial(game, "iron", 5);
    addMaterial(game, "sulfur", 5);
    addMaterial(game, "aetherium", 3);
    game.projectiles = game.projectiles.filter((projectile) => projectile.kind !== "guardianOrb");
    notify(game, "Cave guardian defeated · 7 iron · 7 sulfur · 3 Aetherium", 4500);
  }
}

function damagePlayer(game: GameState, damage: number, source = "") {
  const armorReduction = game.gear.armor === "blacksteel" ? 0.55 : game.gear.armor === "iron" ? 0.35 : game.gear.armor === "copper" ? 0.18 : 0;
  const received = damage * (1 - armorReduction);
  game.player.hp -= received;
  notify(game, source ? source + " · " + Math.round(received) + " damage!" : "You took " + Math.round(received) + " damage!", 1100);
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
    if (projectile.kind === "guardianOrb") {
      const blocker = blockingBuildingAt(game, projectile.realm, projectile.x, projectile.y, 10);
      if (blocker) {
        blocker.hp -= projectile.damage;
        projectile.life = 0;
        continue;
      }
      if (
        projectile.realm === game.realm &&
        game.player.hp > 0 &&
        Math.hypot(game.player.x - projectile.x, game.player.y - projectile.y) < 32
      ) {
        damagePlayer(game, projectile.damage, "Guardian orb hit");
        projectile.life = 0;
      }
      if (projectile.x < 0 || projectile.y < 0 || projectile.x > WORLD_W || projectile.y > WORLD_H) projectile.life = 0;
      continue;
    }
    const target = game.creatures.find(
      (creature) =>
        creature.realm === projectile.realm &&
        creature.hp > 0 &&
        !creature.tame &&
        Math.hypot(creature.x - projectile.x, creature.y - projectile.y) < creatureRadius(creature) + 11,
    );
    if (target) {
      target.hp -= projectile.damage;
      target.angry = true;
      target.provokedUntil = performance.now() + 5000;
      makePreyPermanentlyWary(target);
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
    if (game.mouseHeld && game.heldAction === null) game.heldAction = { kind: "free" };
    startDeconstruction(game);
    return;
  }
  if (repeated && game.heldAction?.kind === "resource") {
    const lockedNodeId = game.heldAction.nodeId;
    const lockedNode = game.nodes.find(
      (node) => node.id === lockedNodeId && node.realm === game.realm,
    );
    if (!lockedNode || lockedNode.hp <= 0) {
      releasePrimaryInput(game);
      return;
    }
    if (distanceToNodeFootprint(lockedNode, game.player.x, game.player.y) > 112) {
      releasePrimaryInput(game);
      return;
    }
    harvestNode(game, lockedNode);
    if (lockedNode.hp <= 0) releasePrimaryInput(game);
    return;
  }
  const node = targetNode(game, 112);
  if (node) {
    if (game.mouseHeld) game.heldAction = { kind: "resource", nodeId: node.id };
    harvestNode(game, node);
    if (node.hp <= 0) releasePrimaryInput(game);
    return;
  }
  if (game.mouseHeld && game.heldAction === null) game.heldAction = { kind: "free" };
  if (repeated && game.heldAction?.kind !== "free") return;
  attack(game);
}

function reviveNodes(game: GameState) {
  const now = performance.now();
  for (const node of game.nodes) {
    if (
      node.hp <= 0 &&
      node.respawnAt < now &&
      !reservedBuildingAt(
        game,
        node.realm,
        node.x,
        node.y,
        nodeRadius(node.kind) * (isMineable(node.kind) ? 1.62 : 1),
      )
    ) node.hp = node.maxHp;
  }
}

function moveCreatureWithBuildings(game: GameState, creature: Creature, dx: number, dy: number, distance: number, step: number) {
  if (isAnimal(creature.kind) && ANIMAL_DATA[creature.kind].flying) {
    creature.x = Math.max(35, Math.min(WORLD_W - 35, creature.x + (dx / distance) * step));
    creature.y = Math.max(35, Math.min(WORLD_H - 35, creature.y + (dy / distance) * step));
    return null;
  }
  const radius = creatureRadius(creature);
  const terrainStep = step * groundSpeedFactor(creature.realm, creature.x, creature.y);
  const nextX = Math.max(35, Math.min(WORLD_W - 35, creature.x + (dx / distance) * terrainStep));
  const nextY = Math.max(35, Math.min(WORLD_H - 35, creature.y + (dy / distance) * terrainStep));
  let blocker = blockingBuildingAt(game, creature.realm, nextX, creature.y, radius);
  const xInsideCave = creature.realm !== "caveSystem" || isCaveFloor(nextX, creature.y, radius + 4);
  const xOutsideDeepWater = creature.realm !== "meadow" || !inDeepWater(nextX, creature.y, radius);
  if (!blocker && xInsideCave && xOutsideDeepWater) creature.x = nextX;
  const yBlocker = blockingBuildingAt(game, creature.realm, creature.x, nextY, radius);
  const yInsideCave = creature.realm !== "caveSystem" || isCaveFloor(creature.x, nextY, radius + 4);
  const yOutsideDeepWater = creature.realm !== "meadow" || !inDeepWater(creature.x, nextY, radius);
  if (!yBlocker && yInsideCave && yOutsideDeepWater) creature.y = nextY;
  blocker ||= yBlocker;
  return blocker;
}

function steerCreatureFacing(current: number, target: number, maxTurn: number) {
  const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  const turn = Math.max(-maxTurn, Math.min(maxTurn, difference));
  return Math.atan2(Math.sin(current + turn), Math.cos(current + turn));
}

function launchGuardianVolley(game: GameState, guardian: Creature) {
  const muzzleDistance = creatureRadius(guardian) + 20;
  for (const spread of [-0.22, 0, 0.22]) {
    const direction = guardian.rangedAim + spread;
    game.projectiles.push({
      id: game.lastId++,
      kind: "guardianOrb",
      realm: guardian.realm,
      x: guardian.x + Math.cos(direction) * muzzleDistance,
      y: guardian.y + Math.sin(direction) * muzzleDistance,
      vx: Math.cos(direction) * BOSS_PROJECTILE_SPEED,
      vy: Math.sin(direction) * BOSS_PROJECTILE_SPEED,
      life: BOSS_RANGED_RANGE / BOSS_PROJECTILE_SPEED + 0.2,
      damage: BOSS_RANGED_DAMAGE,
    });
  }
  guardian.rangedChargeUntil = 0;
  notify(game, "The cave guardian launches a void volley!", 900);
}

function updateCreatures(game: GameState, dt: number) {
  const now = performance.now();
  for (const creature of game.creatures) {
    creature.fleeing = false;
    if (creature.hp <= 0) {
      if (!isAnimal(creature.kind) || creature.respawnAt <= 0 || now < creature.respawnAt) continue;
      if (reservedBuildingAt(game, creature.realm, creature.homeX, creature.homeY, creatureRadius(creature))) {
        creature.respawnAt = now + 1000;
        continue;
      }
      creature.hp = creature.maxHp;
      creature.x = creature.homeX;
      creature.y = creature.homeY;
      creature.fed = 0;
      creature.tame = false;
      creature.angry = false;
      creature.provokedUntil = 0;
      creature.waryOfPlayer = false;
      creature.respawnAt = 0;
      creature.rewarded = false;
      creature.dir = creature.phase;
      creature.rangedAt = 0;
      creature.rangedChargeUntil = 0;
      creature.rangedAim = creature.phase;
    }
    if (creature.realm !== game.realm) continue;
    let targetX = creature.x + Math.cos(now / 1400 + creature.phase) * 15;
    let targetY = creature.y + Math.sin(now / 1700 + creature.phase) * 15;
    let movement: "idle" | "chase" | "flee" | "lure" | "follow" | "return" = "idle";
    let attackingPlayer = false;
    const playerDistance = Math.hypot(game.player.x - creature.x, game.player.y - creature.y);
    const cautiousPrey = isAnimal(creature.kind) && isPermanentlyWaryPrey(creature.kind);
    const permanentlyWary = cautiousPrey && creature.waryOfPlayer;
    if (isMonster(creature.kind)) {
      const senseDistance: Record<MonsterKind, number> = {
        shade: 320,
        crawler: 390,
        brute: 270,
        wraith: 440,
        maw: 240,
      };
      const sense = creature.boss ? BOSS_SENSE_DISTANCE : senseDistance[creature.kind];
      if (playerDistance < sense) creature.angry = true;
      if (playerDistance > sense * 1.8) creature.angry = false;
      if (creature.angry) {
        targetX = game.player.x;
        targetY = game.player.y;
        movement = "chase";
        attackingPlayer = true;
      }
    }
    if (creature.tame) {
      creature.angry = false;
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
        if (enemyDistance < 45 && now - creature.hitAt > COMPANION_ATTACK_COOLDOWN_MS) {
          enemy.hp -= ANIMAL_DATA[creature.kind as AnimalKind].companionDamage;
          creature.hitAt = now;
          if (enemy.hp <= 0) awardCreatureDrop(game, enemy);
        }
      } else {
        targetX = game.player.x - Math.cos(game.player.dir) * 65;
        targetY = game.player.y - Math.sin(game.player.dir) * 65;
      }
      movement = "follow";
    } else if (isAnimal(creature.kind)) {
      const animal = ANIMAL_DATA[creature.kind];
      const homeDistance = Math.hypot(creature.homeX - creature.x, creature.homeY - creature.y);
      const roamAngle = now / 4300 + creature.phase;
      const roamRadius = permanentlyWary ? 12 : animal.flying ? 92 : animal.habitat === "meadow" ? 58 : 42;
      targetX = creature.homeX + Math.cos(roamAngle) * roamRadius;
      targetY = creature.homeY + Math.sin(roamAngle) * roamRadius * 0.78;

      if (permanentlyWary) {
        if (playerDistance < animal.noticeDistance + WARY_NOTICE_BONUS) creature.angry = true;
        if (creature.angry && playerDistance >= WARY_ESCAPE_DISTANCE) {
          creature.angry = false;
          creature.homeX = creature.x;
          creature.homeY = creature.y;
        }
      } else if (animal.temperament === "skittish" && now < creature.provokedUntil) {
        creature.angry = true;
      } else if (isHoldingAnimalLure(game, creature.kind) && playerDistance < ANIMAL_LURE_DISTANCE) {
        creature.angry = false;
        targetX = game.player.x;
        targetY = game.player.y;
        movement = "lure";
      } else if (animal.temperament === "skittish") {
        if (playerDistance < animal.noticeDistance) creature.angry = true;
        if (playerDistance > Math.max(240, animal.noticeDistance * 1.8) && now >= creature.provokedUntil) {
          creature.angry = false;
        }
      } else {
        if (playerDistance < animal.noticeDistance || now < creature.provokedUntil) creature.angry = true;
        if (playerDistance > 340 && now >= creature.provokedUntil) creature.angry = false;
        if (creature.angry) {
          targetX = game.player.x;
          targetY = game.player.y;
          movement = "chase";
          attackingPlayer = true;
        }
      }

      if (animal.temperament === "skittish" && creature.angry && movement !== "lure") {
        const awayDistance = Math.max(1, playerDistance);
        const fleeDistance = permanentlyWary ? 420 : 240;
        targetX = creature.x + ((creature.x - game.player.x) / awayDistance) * fleeDistance;
        targetY = creature.y + ((creature.y - game.player.y) / awayDistance) * fleeDistance;
        movement = "flee";
      } else if (movement === "idle" && homeDistance > roamRadius + 30) {
        targetX = creature.homeX;
        targetY = creature.homeY;
        movement = "return";
      }
    }
    const dx = targetX - creature.x;
    const dy = targetY - creature.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const attackReach = creatureAttackReach(creature);
    const needsAttackPathCheck = attackingPlayer && isMonster(creature.kind) && (
      playerDistance <= attackReach + 24 || (creature.boss && playerDistance <= BOSS_RANGED_RANGE)
    );
    const attackPathClear = !needsAttackPathCheck || monsterAttackLineIsClear(
      game,
      creature.realm,
      creature.x,
      creature.y,
      game.player.x,
      game.player.y,
    );
    const bossCanShoot = creature.boss &&
      attackingPlayer &&
      attackPathClear &&
      playerDistance >= BOSS_RANGED_MIN_DISTANCE &&
      playerDistance <= BOSS_RANGED_RANGE;
    if (bossCanShoot) {
      if (creature.rangedChargeUntil > 0 && now >= creature.rangedChargeUntil) {
        launchGuardianVolley(game, creature);
      } else if (creature.rangedChargeUntil <= 0 && now - creature.rangedAt >= BOSS_RANGED_COOLDOWN_MS) {
        creature.rangedAt = now;
        creature.rangedChargeUntil = now + BOSS_RANGED_WINDUP_MS;
        creature.rangedAim = Math.atan2(game.player.y - creature.y, game.player.x - creature.x);
        notify(game, "The cave guardian is charging a ranged attack!", BOSS_RANGED_WINDUP_MS);
      }
    } else if (creature.rangedChargeUntil > 0) {
      creature.rangedChargeUntil = 0;
    }
    const chargingRangedAttack = creature.rangedChargeUntil > now;
    if (chargingRangedAttack) {
      creature.dir = steerCreatureFacing(creature.dir, creature.rangedAim, 9 * dt);
    }
    const chaseStopDistance = creature.boss && bossCanShoot
      ? 280
      : isMonster(creature.kind) && attackPathClear
        ? Math.max(30, attackReach - 12)
        : 30;
    const stopDistance = movement === "follow" ? 58 : movement === "lure" ? 52 : movement === "chase" ? chaseStopDistance : 2;
    const shouldMove = distance > stopDistance && !chargingRangedAttack;
    if (shouldMove) {
      const slowFactor = now < creature.slowUntil ? 0.42 : 1;
      const paceMultiplier =
        movement === "flee"
          ? permanentlyWary
            ? 1.7
            : 1.45
          : movement === "chase" || movement === "follow"
            ? 1
            : movement === "lure"
              ? cautiousPrey
                ? 0.42
                : 0.85
              : movement === "return"
                ? 0.65
                : 0.22;
      const basePace = creature.speed * paceMultiplier * slowFactor;
      const pace = movement === "idle" ? Math.min(basePace, distance * 1.6) : basePace;
      const desiredDirection = Math.atan2(dy, dx);
      const turnRate = movement === "idle" ? 3.2 : 7;
      creature.dir = steerCreatureFacing(creature.dir, desiredDirection, turnRate * dt);
      const step = Math.min(pace * dt, Math.max(0, distance - stopDistance));
      const previousX = creature.x;
      const previousY = creature.y;
      const blocker = moveCreatureWithBuildings(game, creature, dx, dy, distance, step);
      creature.fleeing = movement === "flee" && Math.hypot(creature.x - previousX, creature.y - previousY) > 0.01;
      if (blocker && isMonster(creature.kind) && now - creature.structureHitAt > CREATURE_STRUCTURE_ATTACK_COOLDOWN_MS) {
        blocker.hp -= creature.damage;
        creature.structureHitAt = now;
      }
    }
    if (attackingPlayer && attackPathClear && playerDistance < attackReach && now - creature.hitAt > CREATURE_ATTACK_COOLDOWN_MS) {
      damagePlayer(game, creature.damage, creature.boss ? "Cave guardian hit" : "");
      creature.hitAt = now;
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
  game.creatures = game.creatures.filter((creature) => creature.hp > 0 || isAnimal(creature.kind));
  game.buildings = game.buildings.filter((building) => building.hp > 0);
}

function canStand(game: GameState, x: number, y: number) {
  if (game.realm === "caveSystem" && !isCaveFloor(x, y, 24)) return false;
  if (game.realm === "meadow" && inDeepWater(x, y, 22)) return false;
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
      Math.hypot(node.x - x, node.y - y) < nodeRadius(node.kind, node.size) + 19,
  );
}

function movementInput(game: GameState) {
  return ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].some((key) => game.keys.has(key));
}

function nearbyConstructionOrderIndex(game: GameState) {
  let nearestIndex = -1;
  let nearestDistance = Infinity;
  game.workOrders.forEach((order, index) => {
    if (order.action !== "construct") return;
    const building = game.buildings.find((candidate) => candidate.id === order.buildingId);
    if (!building || building.realm !== game.realm || building.construction >= 1) return;
    const distance = distanceToBuilding(building, game.player.x, game.player.y);
    if (distance > AUTO_BUILD_RANGE || distance >= nearestDistance) return;
    nearestIndex = index;
    nearestDistance = distance;
  });
  return nearestIndex;
}

function startNearbyAutoBuild(game: GameState) {
  if (movementInput(game)) {
    notify(game, "Stop moving, then press B to auto-build nearby blueprints.");
    return false;
  }
  const orderIndex = nearbyConstructionOrderIndex(game);
  if (orderIndex < 0) {
    game.autoBuildActive = false;
    notify(game, "No unfinished blueprints within three squares.");
    return false;
  }
  const [order] = game.workOrders.splice(orderIndex, 1);
  game.workOrders.unshift(order);
  game.autoBuildActive = true;
  notify(game, "Auto-building within three squares · movement stops construction.", 2200);
  return true;
}

function toggleNearbyAutoBuild(game: GameState) {
  if (game.autoBuildActive) {
    game.autoBuildActive = false;
    notify(game, "Auto-build stopped. Press B to resume nearby.", 1400);
    return;
  }
  startNearbyAutoBuild(game);
}

function movePlayerToward(game: GameState, targetX: number, targetY: number, dt: number) {
  const dx = targetX - game.player.x;
  const dy = targetY - game.player.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const step = Math.min(distance, 155 * groundSpeedFactor(game.realm, game.player.x, game.player.y) * dt);
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
  if (movementInput(game)) {
    if (game.autoBuildActive) {
      game.autoBuildActive = false;
      notify(game, "Auto-build stopped by movement. Press B to resume nearby.", 1500);
    }
    return;
  }
  if (game.autoBuildActive) {
    const orderIndex = nearbyConstructionOrderIndex(game);
    if (orderIndex < 0) {
      game.autoBuildActive = false;
      return;
    }
    if (orderIndex > 0) {
      const [nearbyOrder] = game.workOrders.splice(orderIndex, 1);
      game.workOrders.unshift(nearbyOrder);
    }
  }
  const order = game.workOrders[0];
  if (!order || (order.action === "construct" && !game.autoBuildActive)) return;
  const building = game.buildings.find((candidate) => candidate.id === order.buildingId);
  if (!building || building.realm !== game.realm) return;
  const { x: targetX, y: targetY } = buildingWorldCenter(building);
  game.player.dir = Math.atan2(targetY - game.player.y, targetX - game.player.x);
  const workRange = order.action === "construct" ? AUTO_BUILD_RANGE : 58;
  if (distanceToBuilding(building, game.player.x, game.player.y) > workRange) {
    if (order.action === "construct") {
      game.autoBuildActive = false;
      return;
    }
    movePlayerToward(game, targetX, targetY, dt);
    return;
  }
  if (game.player.swing <= 0.03) game.player.swing = 0.2;
  const duration = order.action === "construct" ? CONSTRUCTION_SECONDS : DECONSTRUCTION_SECONDS;
  const nextProgress = Math.min(1, order.progress + dt / duration);
  if (order.action === "construct") {
    if (
      nextProgress >= 1 &&
      blocksMovementKind(building.kind) &&
      distanceToBuilding(building, game.player.x, game.player.y, 22) === 0
    ) {
      order.progress = Math.min(nextProgress, 0.99);
      building.construction = order.progress;
      building.hp = Math.max(building.hp, Math.ceil(building.maxHp * (0.15 + order.progress * 0.85)));
      game.autoBuildActive = false;
      notify(game, "Move clear of the blueprint, then press B to finish building.", 2200);
      return;
    }
    order.progress = nextProgress;
    building.construction = order.progress;
    building.hp = Math.max(building.hp, Math.ceil(building.maxHp * (0.15 + order.progress * 0.85)));
    if (order.progress >= 1) {
      building.construction = 1;
      building.hp = building.maxHp;
      game.workOrders.shift();
      if (nearbyConstructionOrderIndex(game) < 0) game.autoBuildActive = false;
      notify(
        game,
        BUILD_DATA[building.kind].name + " finished · " + building.maxHp + " health" +
          (game.autoBuildActive ? "." : " · no nearby blueprints remain."),
        1800,
      );
    }
    return;
  }
  order.progress = nextProgress;
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
    game.creatures = game.creatures.filter((creature) => !isMonster(creature.kind) || creature.boss);
    game.player.hp = Math.min(game.player.maxHp, game.player.hp + 12);
    notify(game, "DAWN — Day " + game.day + ". The night creatures fade with the dark.", 4000);
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
    const speed = 190 * groundSpeedFactor(game.realm, game.player.x, game.player.y);
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
  collectGroundDrops(game);
  if (game.mouseHeld) primaryAction(game, true);
  game.player.swing = Math.max(0, game.player.swing - dt);
  if (game.attackFlash && performance.now() - game.attackFlash.startedAt >= game.attackFlash.duration) {
    game.attackFlash = null;
  }
  game.player.hunger = Math.max(0, game.player.hunger - dt * 0.5);
  if (game.player.hunger <= 0) game.player.hp -= dt * 2;
  if (game.player.hp <= 0) {
    game.player.hp = 0;
    game.dead = true;
    game.started = false;
  }
  for (const building of game.buildings) {
    if (building.kind === "crop" && building.construction >= 1) building.growth = Math.min(1, building.growth + dt / 300);
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
  const width = Math.max(70, Math.min(108, nodeRadius(node.kind, node.size) * 1.45));
  const height = 9;
  const y = node.y - nodeRadius(node.kind, node.size) - 24;
  const ratio = Math.max(0, Math.min(1, node.hp / node.maxHp));
  ctx.save();
  ctx.shadowColor = "rgba(6,13,11,.55)";
  ctx.shadowBlur = 7;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = "rgba(12,22,19,.96)";
  roundedRect(ctx, node.x - width / 2 - 2, y - 2, width + 4, height + 4, 7);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#4e2b2b";
  roundedRect(ctx, node.x - width / 2, y, width, height, 5);
  ctx.fill();
  if (ratio > 0) {
    const fillWidth = Math.max(4, width * ratio);
    ctx.fillStyle = ratio > 0.5 ? "#63bd68" : ratio > 0.25 ? "#e1ae43" : "#de5d54";
    roundedRect(ctx, node.x - width / 2, y, fillWidth, height, 5);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.2)";
    roundedRect(ctx, node.x - width / 2 + 3, y + 2, Math.max(1, fillWidth - 6), 3, 2);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(247,238,214,.85)";
  ctx.lineWidth = 2;
  roundedRect(ctx, node.x - width / 2, y, width, height, 5);
  ctx.stroke();
  ctx.restore();
}

function drawGroundDrop(ctx: CanvasRenderingContext2D, drop: GroundDrop, now: number) {
  const bob = Math.sin(now / 320 + drop.id) * 2;
  ctx.save();
  ctx.translate(drop.x, drop.y + bob);
  ctx.fillStyle = "rgba(20,38,29,.28)";
  ctx.beginPath();
  ctx.ellipse(2, 12, 19, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2f3d37";
  ctx.lineWidth = 2.5;

  if (drop.material === "wood") {
    for (const [x, y, rotation] of [[-7, -2, -0.22], [6, 3, 0.18]] as const) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = "#8d5735";
      roundedRect(ctx, -10, -4, 20, 8, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#d4a263";
      ctx.beginPath();
      ctx.arc(9, 0, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (drop.material === "fiber") {
    ctx.strokeStyle = "#4b873e";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    for (const offset of [-9, -4, 2, 8]) {
      ctx.beginPath();
      ctx.moveTo(offset, 9);
      ctx.quadraticCurveTo(offset - 3, -2, offset + (offset % 3), -12);
      ctx.stroke();
    }
  } else if (drop.material === "berries") {
    ctx.fillStyle = "#d95862";
    for (const [x, y] of [[-7, 1], [0, -6], [7, 1], [0, 6]] as const) {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.strokeStyle = "#4c863e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(4, -16);
    ctx.stroke();
  } else if (drop.material === "seeds") {
    ctx.fillStyle = "#d9b35d";
    for (const [x, y, rotation] of [[-7, 1, -0.5], [1, -5, 0.2], [8, 3, 0.7], [-1, 7, -0.1]] as const) {
      ctx.beginPath();
      ctx.ellipse(x, y, 5, 2.8, rotation, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  } else if (drop.material === "mushrooms") {
    ctx.fillStyle = "#d8c9a5";
    roundedRect(ctx, -3, -1, 6, 14, 3);
    ctx.fill();
    ctx.fillStyle = "#b96b51";
    ctx.beginPath();
    ctx.arc(0, -2, 11, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (drop.material === "meat") {
    ctx.fillStyle = "#b85d50";
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 10, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#efd3b5";
    ctx.beginPath();
    ctx.arc(4, -1, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (drop.material === "arrows") {
    ctx.strokeStyle = "#684631";
    ctx.lineWidth = 3;
    for (const offset of [-4, 2, 8]) {
      ctx.beginPath();
      ctx.moveTo(-13, offset);
      ctx.lineTo(12, offset - 5);
      ctx.stroke();
    }
  } else if (drop.material === "bullets") {
    ctx.fillStyle = "#c79a47";
    for (const x of [-7, 0, 7]) {
      roundedRect(ctx, x - 2.5, -9, 5, 18, 2);
      ctx.fill();
      ctx.stroke();
    }
  } else {
    const oreColor: Partial<Record<Material, string>> = {
      stone: "#8b9690",
      iron: "#b8c1bd",
      copper: "#c2774b",
      coal: "#343c3b",
      sulfur: "#d5be4d",
      aetherium: "#62dce8",
      hide: "#9b6b46",
    };
    ctx.fillStyle = oreColor[drop.material] ?? "#a8b2ad";
    for (const [x, y, radius] of [[-7, 3, 9], [5, 1, 10], [1, -8, 7]] as const) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  if (drop.amount > 1) {
    ctx.fillStyle = "#f0c15a";
    ctx.strokeStyle = "#334039";
    ctx.lineWidth = 2;
    roundedRect(ctx, 8, 7, 21, 15, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#26352f";
    ctx.font = "900 9px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("×" + drop.amount, 18.5, 14.5);
  }
  ctx.restore();
}

function radialCrownPath(
  ctx: CanvasRenderingContext2D,
  radius: number,
  points: number,
  innerRatio: number,
  rotation: number,
  seed: number,
) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = rotation + (Math.PI * i) / points;
    const jitter = 0.94 + seeded(seed + i, 301) * 0.1;
    const distance = radius * (i % 2 === 0 ? jitter : innerRatio);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawTree(ctx: CanvasRenderingContext2D, node: ResourceNode) {
  ctx.save();
  ctx.translate(node.x, node.y);
  const radius = nodeRadius(node.kind, node.size);
  ctx.fillStyle = "rgba(20,43,32,.24)";
  ctx.beginPath();
  ctx.ellipse(7, 10, radius * 0.98, radius * 0.84, 0, 0, Math.PI * 2);
  ctx.fill();

  if (node.kind === "pine") {
    const whorls = [
      { radius: 1, points: 16, inner: 0.82, rotation: -0.05, fill: "#123c30" },
      { radius: 0.96, points: 15, inner: 0.8, rotation: 0.17, fill: "#19513a" },
      { radius: 0.88, points: 14, inner: 0.79, rotation: -0.18, fill: "#226344" },
      { radius: 0.68, points: 12, inner: 0.76, rotation: 0.24, fill: "#30764a" },
      { radius: 0.45, points: 10, inner: 0.74, rotation: -0.28, fill: "#4a8b55" },
    ];
    whorls.forEach((whorl, index) => {
      radialCrownPath(ctx, radius * whorl.radius, whorl.points, whorl.inner, whorl.rotation, node.id * 17 + index * 41);
      ctx.fillStyle = whorl.fill;
      ctx.strokeStyle = index === 0 ? "#0d3027" : "rgba(12,51,36,.7)";
      ctx.lineWidth = index === 0 ? 3.5 : 2;
      ctx.fill();
      ctx.stroke();
    });
    ctx.strokeStyle = "rgba(174,210,132,.3)";
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16 + 0.08;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * radius * 0.28, Math.sin(angle) * radius * 0.28);
      ctx.lineTo(Math.cos(angle) * radius * 0.73, Math.sin(angle) * radius * 0.73);
      ctx.stroke();
    }
    ctx.fillStyle = "#6da45d";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.13, 0, Math.PI * 2);
    ctx.fill();
  } else if (node.kind === "birch") {
    ctx.fillStyle = "#397744";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.76, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 13; i++) {
      const angle = (Math.PI * 2 * i) / 13 + seeded(node.id, i + 312) * 0.14;
      const distance = radius * (0.6 + seeded(node.id + i, 319) * 0.06);
      const clusterRadius = radius * (0.26 + seeded(node.id + i, 334) * 0.055);
      ctx.fillStyle = i % 3 === 0 ? "#a6d96c" : i % 3 === 1 ? "#69af50" : "#84c45a";
      ctx.strokeStyle = "rgba(37,91,51,.72)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * distance, Math.sin(angle) * distance, clusterRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    for (let i = 0; i < 7; i++) {
      const angle = (Math.PI * 2 * i) / 7 + 0.26;
      const distance = i === 6 ? 0 : radius * 0.27;
      const clusterRadius = radius * (i === 6 ? 0.34 : 0.3);
      ctx.fillStyle = i % 3 === 0 ? "#9bd269" : i % 3 === 1 ? "#78bb55" : "#8fc85d";
      ctx.strokeStyle = "rgba(38,91,52,.72)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * distance, Math.sin(angle) * distance, clusterRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(237,245,194,.5)";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + 0.18;
      const distance = radius * (0.31 + (i % 2) * 0.2);
      const tangent = angle + Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(
        Math.cos(angle) * distance - Math.cos(tangent) * radius * 0.055,
        Math.sin(angle) * distance - Math.sin(tangent) * radius * 0.055,
      );
      ctx.lineTo(
        Math.cos(angle) * distance + Math.cos(tangent) * radius * 0.055,
        Math.sin(angle) * distance + Math.sin(tangent) * radius * 0.055,
      );
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = "#194a36";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.82, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 11; i++) {
      const angle = (Math.PI * 2 * i) / 11 + seeded(node.id, i + 360) * 0.12;
      const distance = radius * (0.55 + seeded(node.id + i, 367) * 0.07);
      const clusterRadius = radius * (0.32 + seeded(node.id + i, 374) * 0.055);
      ctx.fillStyle = i % 3 === 0 ? "#2d6b43" : i % 3 === 1 ? "#397c49" : "#27613e";
      ctx.strokeStyle = "rgba(19,65,43,.72)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * distance, Math.sin(angle) * distance, clusterRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    for (let i = 0; i < 7; i++) {
      const angle = (Math.PI * 2 * i) / 7 + 0.2;
      const distance = i === 6 ? 0 : radius * 0.28;
      ctx.fillStyle = i === 6 ? "#4f9454" : i % 2 ? "#3e824d" : "#34764a";
      ctx.strokeStyle = "rgba(29,88,52,.62)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * distance, Math.sin(angle) * distance, radius * (i === 6 ? 0.38 : 0.35), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(144,190,102,.24)";
    ctx.beginPath();
    ctx.arc(-radius * 0.13, -radius * 0.16, radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function rockOutcropPath(ctx: CanvasRenderingContext2D, radius: number, seed: number) {
  ctx.beginPath();
  for (let point = 0; point < 12; point++) {
    const angle = (Math.PI * 2 * point) / 12 - Math.PI / 2;
    const distance = radius * (0.88 + seeded(seed + point, 382) * 0.12);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    if (point === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawRock(ctx: CanvasRenderingContext2D, node: ResourceNode) {
  ctx.save();
  ctx.translate(node.x, node.y);
  const radius = nodeRadius(node.kind, node.size);
  const ore = ["ironOre", "copperOre", "coal", "sulfur", "aetherOre"].includes(node.kind);
  const base = node.kind === "aetherOre"
    ? "#394e5f"
    : node.kind === "coal"
      ? "#343a3b"
      : node.kind === "sulfur"
        ? "#8b8050"
        : ore
          ? "#596877"
          : "#718177";
  const edge = node.kind === "aetherOre"
    ? "#172c3a"
    : node.kind === "coal"
      ? "#1d2424"
      : node.kind === "sulfur"
        ? "#5c5638"
        : ore
          ? "#343a4b"
          : "#4c6259";
  const seam = node.kind === "aetherOre"
    ? "#67e2f0"
    : node.kind === "copperOre"
      ? "#d77d50"
      : node.kind === "coal"
        ? "#161b1a"
        : node.kind === "sulfur"
          ? "#e0cb42"
          : node.kind === "ironOre"
            ? "#d3a95a"
            : "#d4c7bd";
  const rotation = (seeded(node.id, 378) - 0.5) * 0.32;

  ctx.fillStyle = "rgba(20,37,30,.24)";
  ctx.beginPath();
  ctx.ellipse(7, 11, radius * 0.98, radius * 0.78, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(rotation);

  if (node.kind === "aetherOre") {
    ctx.shadowColor = "rgba(103,226,240,.4)";
    ctx.shadowBlur = radius * 0.18;
  }
  rockOutcropPath(ctx, radius, node.id * 17);
  ctx.fillStyle = base;
  ctx.strokeStyle = edge;
  ctx.lineWidth = Math.max(4, radius * 0.085);
  ctx.lineJoin = "round";
  ctx.fill();
  ctx.stroke();
  ctx.shadowColor = "transparent";

  ctx.fillStyle = "rgba(224,231,216,.25)";
  ctx.beginPath();
  ctx.moveTo(-radius * 0.72, -radius * 0.12);
  ctx.lineTo(-radius * 0.28, -radius * 0.74);
  ctx.lineTo(radius * 0.18, -radius * 0.58);
  ctx.lineTo(radius * 0.04, -radius * 0.06);
  ctx.lineTo(-radius * 0.3, radius * 0.08);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(21,35,31,.18)";
  ctx.beginPath();
  ctx.moveTo(radius * 0.04, -radius * 0.06);
  ctx.lineTo(radius * 0.74, -radius * 0.28);
  ctx.lineTo(radius * 0.82, radius * 0.3);
  ctx.lineTo(radius * 0.28, radius * 0.72);
  ctx.lineTo(-radius * 0.08, radius * 0.28);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(30,45,41,.38)";
  ctx.lineWidth = Math.max(2, radius * 0.035);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(radius * 0.04, -radius * 0.06);
  ctx.lineTo(-radius * 0.08, radius * 0.28);
  ctx.lineTo(-radius * 0.48, radius * 0.58);
  ctx.moveTo(radius * 0.04, -radius * 0.06);
  ctx.lineTo(radius * 0.18, -radius * 0.58);
  ctx.stroke();

  if (ore) {
    const drawVein = (offset: number, scale: number) => {
      ctx.beginPath();
      ctx.moveTo(-radius * 0.62 * scale, radius * (0.24 + offset));
      ctx.lineTo(-radius * 0.28 * scale, radius * (-0.05 + offset));
      ctx.lineTo(radius * 0.02 * scale, radius * (0.12 + offset));
      ctx.lineTo(radius * 0.3 * scale, radius * (-0.22 + offset));
      ctx.lineTo(radius * 0.62 * scale, radius * (-0.08 + offset));
    };
    ctx.strokeStyle = edge;
    ctx.lineWidth = Math.max(7, radius * 0.13);
    drawVein(0, 1);
    ctx.stroke();
    ctx.strokeStyle = seam;
    ctx.lineWidth = Math.max(3, radius * 0.065);
    drawVein(0, 1);
    ctx.stroke();
    if (node.size === "huge") {
      ctx.strokeStyle = "rgba(240,235,210,.5)";
      ctx.lineWidth = Math.max(2, radius * 0.035);
      drawVein(0.26, 0.58);
      ctx.stroke();
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
  const profile = attackProfile(tool);
  const progress = swing > 0
    ? Math.max(0, Math.min(1, 1 - swing / profile.animationSeconds))
    : 0;
  const motion = swing > 0 ? Math.sin(progress * Math.PI) : 0;
  const angle = tool === "spear"
    ? -0.08
    : tool === "bow" || tool === "ironBow" || tool === "pistol"
      ? -0.22
      : -0.22 - motion * 0.68;
  const forwardMotion = tool === "spear" ? motion * 30 : tool === "pistol" ? -motion * 7 : 0;
  ctx.save();
  ctx.translate(19 + forwardMotion, 6);
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
  if (tool === "bow" || tool === "ironBow") {
    const isIronBow = tool === "ironBow";
    ctx.strokeStyle = isIronBow ? "#aebfbd" : "#8c5a37";
    ctx.lineWidth = isIronBow ? 6 : 5;
    ctx.beginPath();
    ctx.arc(26, 0, 23, -1.1, 1.1);
    ctx.stroke();
    if (isIronBow) {
      ctx.strokeStyle = "#344744";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(26, 0, 23, -1.1, 1.1);
      ctx.stroke();
      ctx.fillStyle = "#596d69";
      roundedRect(ctx, 11, -5, 10, 10, 3);
      ctx.fill();
    }
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
    const headColor = tier === "wood" ? "#a66b3e" : tier === "stone" ? "#858f89" : tier === "iron" ? "#b8c6c3" : "#63dae7";
    const edgeColor = tier === "wood" ? "#e0b06a" : tier === "stone" ? "#c3cbc7" : tier === "iron" ? "#f3f7f5" : "#d7fcff";
    ctx.strokeStyle = tier === "wood" ? "#55372a" : tier === "aetherium" ? "#256a72" : "#344540";
    ctx.lineWidth = 3;
    if (tier === "aetherium") {
      ctx.shadowColor = "#69e6ef";
      ctx.shadowBlur = 12;
    }
    ctx.beginPath();
    if (tier === "wood") {
      ctx.moveTo(29, -5);
      ctx.lineTo(29, -13);
      ctx.quadraticCurveTo(25, -18, 19, -24);
      ctx.quadraticCurveTo(35, -32, 52, -24);
      ctx.quadraticCurveTo(46, -17, 41, -12);
      ctx.lineTo(41, -5);
    } else if (tier === "stone") {
      ctx.moveTo(29, -5);
      ctx.lineTo(28, -14);
      ctx.lineTo(18, -25);
      ctx.lineTo(25, -32);
      ctx.lineTo(51, -29);
      ctx.lineTo(57, -22);
      ctx.lineTo(43, -12);
      ctx.lineTo(41, -5);
    } else if (tier === "iron") {
      ctx.moveTo(29, -5);
      ctx.lineTo(28, -14);
      ctx.quadraticCurveTo(22, -19, 15, -26);
      ctx.quadraticCurveTo(35, -37, 57, -26);
      ctx.quadraticCurveTo(49, -18, 42, -12);
      ctx.lineTo(41, -5);
    } else {
      ctx.moveTo(28, -5);
      ctx.lineTo(27, -15);
      ctx.lineTo(15, -24);
      ctx.lineTo(21, -31);
      ctx.lineTo(33, -29);
      ctx.lineTo(39, -36);
      ctx.lineTo(56, -28);
      ctx.lineTo(62, -20);
      ctx.lineTo(49, -13);
      ctx.lineTo(42, -11);
      ctx.lineTo(41, -5);
    }
    ctx.closePath();
    ctx.fillStyle = headColor;
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (tier === "stone") {
      ctx.moveTo(18, -25);
      ctx.lineTo(25, -32);
      ctx.lineTo(51, -29);
      ctx.lineTo(57, -22);
    } else if (tier === "aetherium") {
      ctx.moveTo(15, -24);
      ctx.lineTo(21, -31);
      ctx.lineTo(33, -29);
      ctx.lineTo(39, -36);
      ctx.lineTo(56, -28);
      ctx.lineTo(62, -20);
    } else {
      ctx.moveTo(tier === "iron" ? 15 : 19, tier === "iron" ? -26 : -24);
      ctx.quadraticCurveTo(35, tier === "iron" ? -37 : -32, tier === "iron" ? 57 : 52, tier === "iron" ? -26 : -24);
    }
    ctx.stroke();
    if (tier === "wood") {
      ctx.strokeStyle = "#d6b15f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(28, -11);
      ctx.lineTo(42, -5);
      ctx.moveTo(30, -16);
      ctx.lineTo(44, -10);
      ctx.stroke();
    }
    ctx.fillStyle = "#4a3329";
    ctx.strokeStyle = "#ead5aa";
    ctx.lineWidth = 1.5;
    roundedRect(ctx, 31, -6, 10, 12, 3);
    ctx.fill();
    ctx.stroke();
  } else if (durableTool?.family === "pickaxe") {
    const tier = durableTool.tier;
    const headColor = tier === "wood" ? "#a66b3e" : tier === "stone" ? "#858f89" : tier === "iron" ? "#b8c6c3" : "#63dae7";
    const edgeColor = tier === "wood" ? "#e0b06a" : tier === "stone" ? "#c3cbc7" : tier === "iron" ? "#f3f7f5" : "#d7fcff";
    ctx.strokeStyle = tier === "wood" ? "#55372a" : tier === "aetherium" ? "#256a72" : "#344540";
    ctx.lineWidth = 3;
    if (tier === "aetherium") {
      ctx.shadowColor = "#69e6ef";
      ctx.shadowBlur = 12;
    }
    ctx.beginPath();
    if (tier === "wood") {
      ctx.moveTo(39, -28);
      ctx.lineTo(46, -20);
      ctx.lineTo(43, -5);
      ctx.lineTo(49, 0);
      ctx.lineTo(43, 5);
      ctx.lineTo(46, 20);
      ctx.lineTo(39, 28);
      ctx.lineTo(33, 19);
      ctx.lineTo(36, 5);
      ctx.lineTo(31, 0);
      ctx.lineTo(36, -5);
      ctx.lineTo(33, -19);
    } else if (tier === "stone") {
      ctx.moveTo(39, -31);
      ctx.lineTo(48, -20);
      ctx.lineTo(44, -6);
      ctx.lineTo(51, 0);
      ctx.lineTo(44, 6);
      ctx.lineTo(48, 20);
      ctx.lineTo(39, 31);
      ctx.lineTo(31, 19);
      ctx.lineTo(35, 6);
      ctx.lineTo(29, 0);
      ctx.lineTo(35, -6);
      ctx.lineTo(31, -19);
    } else if (tier === "iron") {
      ctx.moveTo(39, -34);
      ctx.quadraticCurveTo(50, -22, 45, -5);
      ctx.lineTo(52, 0);
      ctx.lineTo(45, 5);
      ctx.quadraticCurveTo(50, 22, 39, 34);
      ctx.quadraticCurveTo(29, 21, 35, 5);
      ctx.lineTo(29, 0);
      ctx.lineTo(35, -5);
      ctx.quadraticCurveTo(29, -21, 39, -34);
    } else {
      ctx.moveTo(39, -36);
      ctx.lineTo(49, -23);
      ctx.lineTo(46, -10);
      ctx.lineTo(53, -5);
      ctx.lineTo(48, 0);
      ctx.lineTo(54, 7);
      ctx.lineTo(46, 11);
      ctx.lineTo(49, 23);
      ctx.lineTo(39, 36);
      ctx.lineTo(30, 22);
      ctx.lineTo(35, 6);
      ctx.lineTo(28, 0);
      ctx.lineTo(35, -6);
      ctx.lineTo(30, -22);
    }
    ctx.closePath();
    ctx.fillStyle = headColor;
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(39, -26);
    ctx.quadraticCurveTo(45, -10, 40, 0);
    ctx.quadraticCurveTo(45, 10, 39, 26);
    ctx.stroke();
    if (tier === "wood") {
      ctx.strokeStyle = "#e0b85e";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(32, -7);
      ctx.lineTo(45, 5);
      ctx.moveTo(32, 0);
      ctx.lineTo(44, 12);
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

function drawAttackFlash(ctx: CanvasRenderingContext2D, flash: AttackFlash, now: number) {
  const progress = Math.max(0, Math.min(1, (now - flash.startedAt) / flash.duration));
  if (progress >= 1) return;
  const fade = Math.pow(1 - progress, 0.65);
  ctx.save();
  ctx.translate(flash.x, flash.y);
  ctx.rotate(flash.direction);
  ctx.globalAlpha = fade;
  ctx.strokeStyle = "#ffffff";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(255,255,255,.95)";
  ctx.shadowBlur = 14;
  ctx.lineCap = "round";

  if (flash.style === "thrust") {
    const start = 38 + progress * 18;
    const tip = flash.range + 12 + progress * 8;
    ctx.lineWidth = 6 - progress * 3;
    ctx.beginPath();
    ctx.moveTo(start, 0);
    ctx.lineTo(tip, 0);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tip - 7, -8);
    ctx.lineTo(tip + 5, 0);
    ctx.lineTo(tip - 7, 8);
    ctx.stroke();
  } else if (flash.style === "shot") {
    const muzzle = flash.range + progress * 5;
    ctx.lineWidth = 3;
    for (const offset of [-0.42, 0, 0.42]) {
      ctx.beginPath();
      ctx.moveTo(muzzle - 5, 0);
      ctx.lineTo(muzzle + Math.cos(offset) * (15 + progress * 8), Math.sin(offset) * 15);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(muzzle, 0, 4 * (1 - progress) + 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const radius = flash.range * 0.78 + progress * 10;
    ctx.lineWidth = 7 - progress * 4;
    ctx.beginPath();
    ctx.arc(0, 0, radius, -flash.arc, flash.arc);
    ctx.stroke();
    ctx.lineWidth = 3;
    for (const offset of [-0.3, 0, 0.3]) {
      ctx.beginPath();
      ctx.moveTo(radius - 5, 0);
      ctx.lineTo(radius + 8 + progress * 8, offset * 22);
      ctx.stroke();
    }
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

function drawTopDownBird(ctx: CanvasRenderingContext2D, creature: Creature, kind: BirdKind, now: number) {
  const escaping = ANIMAL_DATA[kind].flying && creature.fleeing && !creature.tame;
  const wingCycle = now / 105 + creature.phase;
  const flap = (Math.sin(wingCycle) + 1) / 2;
  const wingSweep = escaping ? Math.cos(wingCycle) * 12 : 0;
  let collarX = 14;
  let collarHalfWidth = 10;

  if (kind === "crow") {
    const outline = "#0d171b";
    const wingReach = 42 + flap * 10;
    ctx.lineJoin = "round";
    ctx.strokeStyle = outline;
    ctx.lineWidth = 4;

    ctx.fillStyle = "#1b272e";
    for (const side of [-1, 0, 1]) {
      ctx.beginPath();
      ctx.moveTo(-17, side * 4 - 5);
      ctx.lineTo(-39, side * 10 - 7);
      ctx.lineTo(-31, side * 9 + 5);
      ctx.lineTo(-15, side * 4 + 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    if (escaping) {
      for (const side of [-1, 1]) {
        const s = side;
        const wingGradient = ctx.createLinearGradient(-10, 0, 10, s * wingReach);
        wingGradient.addColorStop(0, "#26343c");
        wingGradient.addColorStop(1, "#405966");
        ctx.fillStyle = wingGradient;
        ctx.beginPath();
        ctx.moveTo(-11, s * 5);
        ctx.bezierCurveTo(-20, s * 16, -10 + wingSweep * 0.35, s * (wingReach - 8), 5 + wingSweep, s * wingReach);
        ctx.lineTo(10 + wingSweep, s * (wingReach - 12));
        ctx.lineTo(17 + wingSweep, s * (wingReach - 5));
        ctx.lineTo(15 + wingSweep * 0.78, s * (wingReach - 20));
        ctx.lineTo(23 + wingSweep * 0.72, s * (wingReach - 13));
        ctx.lineTo(16 + wingSweep * 0.42, s * 18);
        ctx.bezierCurveTo(12 + wingSweep * 0.25, s * 10, 4, s * 5, -3, s * 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "rgba(128,159,172,.6)";
        ctx.lineWidth = 2.2;
        for (const feather of [0, 1, 2]) {
          ctx.beginPath();
          ctx.moveTo(-3 + feather * 5, s * 10);
          ctx.quadraticCurveTo(1 + feather * 4 + wingSweep * 0.2, s * 24, 6 + feather * 5 + wingSweep, s * (wingReach - feather * 9));
          ctx.stroke();
        }
        ctx.strokeStyle = outline;
        ctx.lineWidth = 4;
      }
    }

    const bodyGradient = ctx.createLinearGradient(-28, -8, 28, 8);
    bodyGradient.addColorStop(0, "#172229");
    bodyGradient.addColorStop(0.55, "#344650");
    bodyGradient.addColorStop(1, "#1c292f");
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(-2, 0, 27, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(117,153,167,.55)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-5, 0, 18, 4.05, 5.37);
    ctx.stroke();

    if (!escaping) {
      for (const side of [-1, 1]) {
        const s = side;
        ctx.fillStyle = "#2c3d46";
        ctx.strokeStyle = outline;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-18, s * 3);
        ctx.bezierCurveTo(-12, s * 7, 3, s * 10, 15, s * 8);
        ctx.bezierCurveTo(9, s * 5, -1, s * 3.5, -12, s * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "rgba(128,159,172,.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-9, s * 4);
        ctx.lineTo(9, s * 7);
        ctx.stroke();
      }
    }

    ctx.fillStyle = "#222f36";
    ctx.strokeStyle = outline;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(21, 0, 12, 10.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#8daab3";
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(24, side * 5.2, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#10171a";
    ctx.beginPath();
    ctx.moveTo(30, -4.2);
    ctx.lineTo(44, 0);
    ctx.lineTo(30, 4.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    collarX = 12;
    collarHalfWidth = 10;
  } else if (kind === "owl") {
    const outline = "#3a3026";
    const wingReach = 44 + flap * 8;
    ctx.lineJoin = "round";
    ctx.strokeStyle = outline;
    ctx.lineWidth = 4;

    ctx.fillStyle = "#745f42";
    for (const side of [-1, 0, 1]) {
      ctx.beginPath();
      ctx.ellipse(-29, side * 7, 17, 6.5, side * 0.09, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    if (escaping) {
      for (const side of [-1, 1]) {
        const s = side;
        const wingGradient = ctx.createLinearGradient(-8, 0, 4, s * wingReach);
        wingGradient.addColorStop(0, "#806a49");
        wingGradient.addColorStop(1, "#b09563");
        ctx.fillStyle = wingGradient;
        ctx.beginPath();
        ctx.moveTo(-12, s * 5);
        ctx.bezierCurveTo(-27, s * 18, -19 + wingSweep * 0.35, s * (wingReach - 3), 1 + wingSweep, s * wingReach);
        ctx.bezierCurveTo(17 + wingSweep, s * (wingReach - 1), 24 + wingSweep * 0.55, s * 27, 15 + wingSweep * 0.28, s * 13);
        ctx.quadraticCurveTo(8, s * 5, -2, s * 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "rgba(234,213,166,.7)";
        ctx.lineWidth = 2.5;
        for (const feather of [0, 1, 2, 3]) {
          ctx.beginPath();
          ctx.moveTo(-5 + feather * 5, s * 10);
          ctx.quadraticCurveTo(-6 + feather * 6 + wingSweep * 0.2, s * 26, -3 + feather * 6 + wingSweep, s * (wingReach - feather * 6));
          ctx.stroke();
        }
        ctx.strokeStyle = outline;
        ctx.lineWidth = 4;
      }
    }

    ctx.fillStyle = "#745f43";
    ctx.beginPath();
    ctx.ellipse(-2, 0, 27, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(214,188,132,.72)";
    for (const [x, y, radius] of [[-15, -7, 3], [-7, 7, 2.7], [3, -8, 2.4], [8, 6, 2.8]] as const) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!escaping) {
      for (const side of [-1, 1]) {
        const s = side;
        ctx.fillStyle = "#8f7752";
        ctx.strokeStyle = outline;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-18, s * 4);
        ctx.bezierCurveTo(-12, s * 10, 4, s * 13, 15, s * 9);
        ctx.bezierCurveTo(7, s * 6, -4, s * 4, -14, s * 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "rgba(234,213,166,.68)";
        ctx.lineWidth = 2;
        for (const featherX of [-9, -1, 7]) {
          ctx.beginPath();
          ctx.moveTo(featherX, s * 5);
          ctx.lineTo(featherX + 5, s * 9);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = "#c5aa73";
    ctx.strokeStyle = outline;
    ctx.beginPath();
    ctx.moveTo(12, -13);
    ctx.lineTo(19, -21);
    ctx.lineTo(23, -13);
    ctx.quadraticCurveTo(37, -9, 37, 0);
    ctx.quadraticCurveTo(37, 9, 23, 13);
    ctx.lineTo(19, 21);
    ctx.lineTo(12, 13);
    ctx.quadraticCurveTo(7, 0, 12, -13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ead9ad";
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(24, side * 6, 8, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#20211d";
      ctx.beginPath();
      ctx.arc(26, side * 6, 3.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ead9ad";
    }
    ctx.fillStyle = "#d69a3f";
    ctx.beginPath();
    ctx.moveTo(33, -3.5);
    ctx.lineTo(43, 0);
    ctx.lineTo(33, 3.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    collarX = 10;
    collarHalfWidth = 13;
  } else {
    const outline = "#38271f";
    ctx.lineJoin = "round";
    ctx.strokeStyle = outline;
    ctx.lineWidth = 3.5;
    for (let feather = -4; feather <= 4; feather++) {
      const angle = feather * 0.18;
      ctx.save();
      ctx.translate(-16, 0);
      ctx.rotate(angle);
      ctx.fillStyle = feather % 2 === 0 ? "#9f5f3e" : "#7f4937";
      ctx.beginPath();
      ctx.ellipse(-27, 0, 30, 8.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#dda05b";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-35, -5.8);
      ctx.lineTo(-35, 5.8);
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = outline;
      ctx.lineWidth = 3.5;
    }

    ctx.fillStyle = "#6d4633";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(-1, 0, 32, 21, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    for (const side of [-1, 1]) {
      ctx.fillStyle = "#b87345";
      ctx.beginPath();
      ctx.ellipse(-5, side * 9, 21, 7.5, side * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#e0a45f";
      ctx.lineWidth = 2.4;
      for (const stripe of [-12, -4, 4]) {
        ctx.beginPath();
        ctx.moveTo(stripe, side * 4);
        ctx.lineTo(stripe - 2, side * 14);
        ctx.stroke();
      }
      ctx.strokeStyle = outline;
      ctx.lineWidth = 4;
    }

    ctx.fillStyle = "#5f7880";
    ctx.beginPath();
    ctx.ellipse(27, 0, 15, 9.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#171b1a";
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(31, side * 4.4, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#d9a044";
    ctx.beginPath();
    ctx.moveTo(38, -4);
    ctx.lineTo(49, 0);
    ctx.lineTo(38, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#b64035";
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(32, 4.5);
    ctx.bezierCurveTo(36, 3.8, 40.5, 6, 40.5, 9);
    ctx.bezierCurveTo(40.2, 12.5, 36.5, 13.8, 33.5, 10.5);
    ctx.bezierCurveTo(31.5, 8.2, 30.7, 5.8, 32, 4.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    collarX = 14;
    collarHalfWidth = 13;
  }

  if (creature.tame) {
    ctx.strokeStyle = "#f1bf4f";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(collarX, -collarHalfWidth);
    ctx.lineTo(collarX, collarHalfWidth);
    ctx.stroke();
  }
}

function drawTopDownAnimal(ctx: CanvasRenderingContext2D, creature: Creature, now: number) {
  const kind = creature.kind as AnimalKind;
  if (isBird(kind)) {
    drawTopDownBird(ctx, creature, kind, now);
    return;
  }
  const style: Record<GroundAnimalKind, { body: string; light: string; length: number; width: number; headX: number; headLength: number; headWidth: number }> = {
    bear: { body: "#77513c", light: "#a97857", length: 34, width: 23, headX: 27, headLength: 18, headWidth: 16 },
    boar: { body: "#9a6444", light: "#bd7b56", length: 31, width: 19, headX: 27, headLength: 18, headWidth: 14 },
    deer: { body: "#b57a48", light: "#d39a63", length: 30, width: 14, headX: 29, headLength: 15, headWidth: 10 },
    rabbit: { body: "#b9b6aa", light: "#ded9cd", length: 24, width: 15, headX: 21, headLength: 12, headWidth: 11 },
    fox: { body: "#d36f3d", light: "#f0b27d", length: 29, width: 15, headX: 27, headLength: 15, headWidth: 12 },
    wolf: { body: "#697773", light: "#9aa4a0", length: 31, width: 17, headX: 28, headLength: 16, headWidth: 13 },
    raccoon: { body: "#69716d", light: "#aeb4ad", length: 27, width: 16, headX: 24, headLength: 14, headWidth: 12 },
  };
  const { body, light, length, width, headX, headLength, headWidth } = style[kind];
  const outline = kind === "rabbit" ? "#56544e" : "#3e322c";

  if (kind === "fox") {
    ctx.fillStyle = body;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(-length + 3, -width * 0.55);
    ctx.bezierCurveTo(-length - 14, -width * 1.4, -length - 38, -width * 0.95, -length - 42, -width * 0.2);
    ctx.bezierCurveTo(-length - 44, width * 0.65, -length - 24, width * 1.15, -length + 2, width * 0.48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f4d7ad";
    ctx.beginPath();
    ctx.moveTo(-length - 34, -width * 0.82);
    ctx.bezierCurveTo(-length - 45, -width * 0.5, -length - 47, width * 0.18, -length - 40, width * 0.55);
    ctx.bezierCurveTo(-length - 34, width * 0.9, -length - 26, width * 0.94, -length - 21, width * 0.72);
    ctx.bezierCurveTo(-length - 27, width * 0.18, -length - 28, -width * 0.34, -length - 34, -width * 0.82);
    ctx.closePath();
    ctx.fill();
  } else if (kind === "wolf") {
    ctx.fillStyle = body;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-length + 2, -width * 0.48);
    ctx.bezierCurveTo(-length - 15, -width * 1.15, -length - 31, -width * 0.72, -length - 36, -width * 0.18);
    ctx.bezierCurveTo(-length - 24, width * 0.1, -length - 13, width * 0.52, -length + 1, width * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.ellipse(-length - 28, -width * 0.29, 8, 4.2, 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = body;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(-3, 0, length, width, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = light;
  ctx.globalAlpha = 0.48;
  ctx.beginPath();
  ctx.ellipse(-7, -width * 0.3, length * 0.62, width * 0.32, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  if (kind === "deer") {
    ctx.fillStyle = "rgba(239,214,165,.72)";
    for (const [x, y] of [[-12, -6], [-2, 7], [9, -5]] as const) {
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === "boar") {
    ctx.strokeStyle = "rgba(77,48,37,.6)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-21, 0);
    ctx.lineTo(10, 0);
    ctx.stroke();
  } else if (kind === "raccoon") {
    ctx.strokeStyle = "rgba(37,43,42,.72)";
    ctx.lineWidth = 3;
    for (const x of [-18, -10, -2]) {
      ctx.beginPath();
      ctx.moveTo(x, -width * 0.72);
      ctx.lineTo(x, width * 0.72);
      ctx.stroke();
    }
  }

  if (kind === "deer") {
    ctx.fillStyle = body;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 3.5;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(headX - 5, side * (headWidth * 0.45));
      ctx.quadraticCurveTo(headX - 10, side * (headWidth + 3), headX - 1, side * (headWidth + 8));
      ctx.quadraticCurveTo(headX + 5, side * (headWidth + 4), headX + 3, side * (headWidth * 0.55));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    const traceAntlers = () => {
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(headX + 1, side * (headWidth * 0.62));
        ctx.quadraticCurveTo(headX + 1, side * (headWidth + 9), headX + 10, side * (headWidth + 16));
        ctx.lineTo(headX + 17, side * (headWidth + 19));
        ctx.moveTo(headX + 3, side * (headWidth + 9));
        ctx.lineTo(headX - 5, side * (headWidth + 17));
        ctx.moveTo(headX + 8, side * (headWidth + 14));
        ctx.lineTo(headX + 5, side * (headWidth + 23));
        ctx.moveTo(headX + 13, side * (headWidth + 17));
        ctx.lineTo(headX + 15, side * (headWidth + 26));
        ctx.stroke();
      }
    };
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = outline;
    ctx.lineWidth = 6;
    traceAntlers();
    ctx.strokeStyle = "#d6b879";
    ctx.lineWidth = 3;
    traceAntlers();
  } else if (kind === "rabbit") {
    for (const side of [-1, 1]) {
      const rotation = side * 0.82;
      const earX = headX - 6;
      const earY = side * (headWidth * 0.76);
      ctx.fillStyle = body;
      ctx.strokeStyle = outline;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(earX, earY, 18.5, 5.4, rotation, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#d8a8a0";
      ctx.beginPath();
      ctx.ellipse(earX + 1, earY, 13.5, 2.2, rotation, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === "fox") {
    for (const side of [-1, 1]) {
      ctx.fillStyle = body;
      ctx.strokeStyle = outline;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(headX - 8, side * (headWidth * 0.38));
      ctx.lineTo(headX - 10, side * (headWidth + 9));
      ctx.lineTo(headX + 4, side * (headWidth * 0.82));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#6f3b2d";
      ctx.beginPath();
      ctx.moveTo(headX - 6, side * (headWidth * 0.66));
      ctx.lineTo(headX - 7, side * (headWidth + 4));
      ctx.lineTo(headX + 1, side * (headWidth * 0.82));
      ctx.closePath();
      ctx.fill();
    }
  } else if (kind === "wolf") {
    for (const side of [-1, 1]) {
      ctx.fillStyle = body;
      ctx.strokeStyle = outline;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(headX - 9, side * (headWidth * 0.35));
      ctx.lineTo(headX - 10, side * (headWidth + 10));
      ctx.lineTo(headX + 4, side * (headWidth * 0.82));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#b6beb9";
      ctx.beginPath();
      ctx.moveTo(headX - 7, side * (headWidth * 0.62));
      ctx.lineTo(headX - 7, side * (headWidth + 5));
      ctx.lineTo(headX + 1, side * (headWidth * 0.82));
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.fillStyle = body;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 4;
  if (kind === "fox") {
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(headX + headLength, 0);
    ctx.lineTo(headX - headLength * 0.6, -headWidth);
    ctx.lineTo(headX - headLength, 0);
    ctx.lineTo(headX - headLength * 0.6, headWidth);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (kind === "wolf") {
    ctx.beginPath();
    ctx.moveTo(headX + headLength, 0);
    ctx.quadraticCurveTo(headX + headLength * 0.62, -headWidth * 0.58, headX + headLength * 0.08, -headWidth * 0.78);
    ctx.quadraticCurveTo(headX - headLength * 0.55, -headWidth, headX - headLength, -headWidth * 0.42);
    ctx.lineTo(headX - headLength, headWidth * 0.42);
    ctx.quadraticCurveTo(headX - headLength * 0.55, headWidth, headX + headLength * 0.08, headWidth * 0.78);
    ctx.quadraticCurveTo(headX + headLength * 0.62, headWidth * 0.58, headX + headLength, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.ellipse(headX, 0, headLength, headWidth, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.ellipse(headX + headLength * 0.38, 0, headLength * 0.48, headWidth * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#20211f";
  ctx.beginPath();
  ctx.arc(headX + headLength * 0.2, -headWidth * 0.42, 2.1, 0, Math.PI * 2);
  ctx.arc(headX + headLength * 0.2, headWidth * 0.42, 2.1, 0, Math.PI * 2);
  ctx.fill();
  if (kind === "fox") {
    ctx.fillStyle = "#1d201e";
    ctx.beginPath();
    ctx.ellipse(headX + headLength * 0.96, 0, 3.4, 4.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(107,54,39,.72)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(headX - 3, -headWidth * 0.72);
    ctx.lineTo(headX + headLength * 0.5, -headWidth * 0.32);
    ctx.moveTo(headX - 3, headWidth * 0.72);
    ctx.lineTo(headX + headLength * 0.5, headWidth * 0.32);
    ctx.stroke();
  } else if (kind === "wolf") {
    ctx.fillStyle = "#171a19";
    ctx.beginPath();
    ctx.ellipse(headX + headLength * 0.92, 0, 3.7, 4.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(55,67,64,.72)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(headX + 1, -headWidth * 0.72);
    ctx.lineTo(headX + headLength * 0.5, -headWidth * 0.32);
    ctx.moveTo(headX + 1, headWidth * 0.72);
    ctx.lineTo(headX + headLength * 0.5, headWidth * 0.32);
    ctx.stroke();
  } else if (kind === "rabbit") {
    ctx.fillStyle = "#4b3535";
    ctx.beginPath();
    ctx.arc(headX + headLength * 0.9, 0, 2.7, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "deer") {
    ctx.fillStyle = "#33251f";
    ctx.beginPath();
    ctx.ellipse(headX + headLength * 0.88, 0, 2.9, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (kind === "raccoon") {
    ctx.strokeStyle = "rgba(37,43,42,.82)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(headX + 1, -headWidth * 0.55);
    ctx.lineTo(headX + 8, -headWidth * 0.28);
    ctx.moveTo(headX + 1, headWidth * 0.55);
    ctx.lineTo(headX + 8, headWidth * 0.28);
    ctx.stroke();
  }
  if (creature.tame) {
    ctx.strokeStyle = "#f1bf4f";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(15, -width * 0.78);
    ctx.lineTo(15, width * 0.78);
    ctx.stroke();
  }
}

function drawCreature(ctx: CanvasRenderingContext2D, creature: Creature, now: number) {
  const scale = creature.boss
    ? 1.82
    : creature.kind === "brute"
      ? 1.28
      : creature.kind === "bear"
        ? 1.2
        : creature.kind === "rabbit"
          ? 0.78
          : creature.kind === "crow"
            ? 0.52
            : creature.kind === "owl"
              ? 0.54
              : creature.kind === "turkey"
                ? 0.58
                : creature.kind === "raccoon" || creature.kind === "boar"
                  ? 0.92
                  : 1;
  const flying = isAnimal(creature.kind) && ANIMAL_DATA[creature.kind].flying;
  const bob = Math.sin(now / (flying ? 150 : 230) + creature.phase) * (flying ? 5 : 2) - (flying ? 5 : 0);
  ctx.save();
  ctx.translate(creature.x, creature.y + bob);
  ctx.scale(scale, scale);
  ctx.fillStyle = flying ? "rgba(12,27,24,.14)" : "rgba(12,27,24,.23)";
  ctx.beginPath();
  ctx.ellipse(5, 14, 25, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(creature.dir);
  if (isAnimal(creature.kind)) {
    drawTopDownAnimal(ctx, creature, now);
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
    if (creature.boss && creature.rangedChargeUntil > now) {
      const chargeProgress = Math.max(0, Math.min(1, 1 - (creature.rangedChargeUntil - now) / BOSS_RANGED_WINDUP_MS));
      const chargePulse = 0.75 + Math.sin(now / 42) * 0.25;
      ctx.strokeStyle = "rgba(244,103,94,.9)";
      ctx.lineWidth = 3 + chargeProgress * 2;
      ctx.beginPath();
      ctx.arc(0, 0, 40 + chargeProgress * 7, -Math.PI * 0.78, Math.PI * 0.78);
      ctx.stroke();
      const chargeGlow = ctx.createRadialGradient(42, 0, 1, 42, 0, 15);
      chargeGlow.addColorStop(0, "#fff0c4");
      chargeGlow.addColorStop(0.28, "#ff7967");
      chargeGlow.addColorStop(1, "rgba(91,24,78,0)");
      ctx.fillStyle = chargeGlow;
      ctx.beginPath();
      ctx.arc(42, 0, (7 + chargeProgress * 7) * chargePulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,189,104,.68)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(48, 0);
      ctx.lineTo(73 + chargeProgress * 12, 0);
      ctx.stroke();
    }
  }
  ctx.rotate(-creature.dir);
  if (creature.boss) {
    ctx.fillStyle = "#f0bd59";
    ctx.font = "900 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("CAVE GUARDIAN", 0, -51);
  }
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

function drawTreasure(ctx: CanvasRenderingContext2D, treasure: CaveTreasure, now: number) {
  const shimmer = 0.65 + Math.sin(now / 220 + treasure.id) * 0.25;
  ctx.save();
  ctx.translate(treasure.x, treasure.y);
  ctx.fillStyle = "rgba(8,15,13,.38)";
  ctx.beginPath();
  ctx.ellipse(4, 21, 39, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  if (!treasure.opened) {
    ctx.globalAlpha = shimmer;
    ctx.fillStyle = "#f7d86b";
    for (const [x, y, size] of [[-31, -25, 4], [28, -18, 3], [4, -35, 3]] as const) {
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size, y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = treasure.opened ? "#735037" : "#a96b38";
  ctx.strokeStyle = "#41291f";
  ctx.lineWidth = 4;
  roundedRect(ctx, -32, -7, 64, 38, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#d3a944";
  ctx.fillRect(-32, 7, 64, 7);
  if (treasure.opened) {
    ctx.save();
    ctx.translate(0, -8);
    ctx.rotate(-0.16);
    ctx.fillStyle = "#815331";
    roundedRect(ctx, -32, -17, 64, 17, 7);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#f1cb58";
    ctx.beginPath();
    ctx.ellipse(0, 0, 23, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#b9793f";
    roundedRect(ctx, -32, -23, 64, 24, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.18)";
    roundedRect(ctx, -25, -18, 50, 7, 4);
    ctx.fill();
  }
  ctx.fillStyle = "#f0c95a";
  ctx.strokeStyle = "#5e4726";
  ctx.lineWidth = 2;
  roundedRect(ctx, -7, 7, 14, 18, 3);
  ctx.fill();
  ctx.stroke();
  if (!treasure.opened) {
    ctx.fillStyle = "#f4d98c";
    ctx.font = "900 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("TREASURE", 0, -35);
  }
  ctx.restore();
}

function drawBuilding(ctx: CanvasRenderingContext2D, building: Building, alpha = 1) {
  const { x, y } = buildingWorldCenter(building);
  const halfSize = buildingHalfSize(building.kind);
  ctx.save();
  ctx.globalAlpha = alpha * (0.38 + building.construction * 0.62);
  ctx.translate(x, y);
  const kind = building.kind;
  if (building.construction < 1) {
    ctx.fillStyle = "rgba(196,218,207,.12)";
    ctx.strokeStyle = "#b9d4c5";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.fillRect(-halfSize, -halfSize, halfSize * 2, halfSize * 2);
    ctx.strokeRect(-halfSize, -halfSize, halfSize * 2, halfSize * 2);
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
    roundedRect(ctx, -CROP_HALF_SIZE, -CROP_HALF_SIZE, CROP_HALF_SIZE * 2, CROP_HALF_SIZE * 2, 8);
    ctx.fill();
    ctx.stroke();
    for (const bedY of [-23, 23]) {
      for (const bedX of [-23, 23]) {
        ctx.fillStyle = "#8c633f";
        roundedRect(ctx, bedX - 19, bedY - 19, 38, 38, 5);
        ctx.fill();
        ctx.strokeStyle = "rgba(80,56,46,.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bedX - 13, bedY);
        ctx.lineTo(bedX + 13, bedY);
        ctx.stroke();
        const leafSize = 2.5 + building.growth * 4;
        for (const plantX of [bedX - 8, bedX + 8]) {
          ctx.fillStyle = "#4c803e";
          ctx.beginPath();
          ctx.ellipse(plantX - leafSize * 0.55, bedY - 4, leafSize, leafSize * 0.62, -0.55, 0, Math.PI * 2);
          ctx.ellipse(plantX + leafSize * 0.55, bedY + 3, leafSize, leafSize * 0.62, -0.55, 0, Math.PI * 2);
          ctx.fill();
          if (building.growth > 0.6) {
            ctx.fillStyle = "#dda641";
            ctx.beginPath();
            ctx.arc(plantX, bedY, 2.4 + building.growth * 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
    if (building.construction >= 1) {
      const percent = Math.min(100, Math.floor(building.growth * 100));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(16,30,25,.92)";
      roundedRect(ctx, -26, -66, 52, 14, 6);
      ctx.fill();
      ctx.fillStyle = building.growth >= 1 ? "#f3c557" : "#dbe9ce";
      ctx.font = "bold 9px Arial";
      ctx.textAlign = "center";
      ctx.fillText(percent + "%", 0, -56);
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
    const barY = kind === "crop" ? -80 : -35;
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
  ctx.fillText(exit ? "EXIT" : "CAVE", 0, -51);
  ctx.restore();
}

function drawCaveSystemTerrain(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#141c1b";
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const { start, end, halfWidth } of CAVE_CONNECTIONS) {
    ctx.strokeStyle = "#293330";
    ctx.lineWidth = (halfWidth + 58) * 2;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }
  ctx.fillStyle = "#293330";
  for (const room of CAVE_ROOMS) {
    ctx.beginPath();
    ctx.arc(room.x, room.y, room.radius + 58, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const cave of CAVES) {
    ctx.beginPath();
    ctx.arc(cave.undergroundX, cave.undergroundY, cave.chamberRadius + 58, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const { start, end, halfWidth } of CAVE_CONNECTIONS) {
    const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
    gradient.addColorStop(0, caveAreaAt(start.x, start.y).ground);
    gradient.addColorStop(1, caveAreaAt(end.x, end.y).ground);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = halfWidth * 2;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }
  for (const room of CAVE_ROOMS) {
    ctx.fillStyle = room.ground;
    ctx.beginPath();
    ctx.arc(room.x, room.y, room.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(13,20,19,.38)";
    ctx.lineWidth = 14;
    ctx.stroke();
  }
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

  for (let i = 0; i < 1100; i++) {
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

  const boundaries = [
    ...CAVES.map((cave) => ({ x: cave.undergroundX, y: cave.undergroundY, radius: cave.chamberRadius })),
    ...CAVE_ROOMS,
  ];
  for (const [boundaryIndex, boundary] of boundaries.entries()) {
    const rockCount = Math.max(22, Math.round(boundary.radius / 21));
    for (let i = 0; i < rockCount; i++) {
      const angle = (i / rockCount) * Math.PI * 2 + seeded(i, 241 + boundaryIndex * 7) * 0.11;
      const radius = boundary.radius + 31;
      const x = boundary.x + Math.cos(angle) * radius;
      const y = boundary.y + Math.sin(angle) * radius;
      const crossesTunnel = CAVE_CONNECTIONS.some(
        ({ start, end, halfWidth }) =>
          pointToSegmentDistance(x, y, start.x, start.y, end.x, end.y) < halfWidth + 14,
      );
      if (crossesTunnel) continue;
      const size = 17 + seeded(i, 244 + boundaryIndex * 7) * 20;
      ctx.fillStyle = i % 2 ? "#202927" : "#343e3a";
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
      ctx.lineTo(x + Math.cos(angle + 2.25) * size * 0.8, y + Math.sin(angle + 2.25) * size * 0.8);
      ctx.lineTo(x + Math.cos(angle - 2.25) * size * 0.8, y + Math.sin(angle - 2.25) * size * 0.8);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function traceOrganicWaterPath(
  ctx: CanvasRenderingContext2D,
  water: WaterBody,
  scale: number,
  variation: number,
) {
  const points = Array.from({ length: 40 }, (_, index) => {
    const angle = (index / 40) * Math.PI * 2;
    const wobble = 1 +
      Math.sin(angle * 3 + variation * 1.7) * 0.045 +
      Math.sin(angle * 5 - variation * 0.9) * 0.026 +
      Math.sin(angle * 7 + variation * 0.6) * 0.012;
    return {
      x: Math.cos(angle) * water.rx * scale * wobble,
      y: Math.sin(angle) * water.ry * scale * wobble,
    };
  });
  const first = points[0];
  const last = points[points.length - 1];
  ctx.beginPath();
  ctx.moveTo((last.x + first.x) / 2, (last.y + first.y) / 2);
  for (let index = 0; index < points.length; index++) {
    const point = points[index];
    const next = points[(index + 1) % points.length];
    ctx.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
  }
  ctx.closePath();
}

function drawMeadowTerrain(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#91c66b";
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);

  for (const forest of FOREST_REGIONS) {
    ctx.fillStyle = forest.color;
    ctx.beginPath();
    ctx.ellipse(forest.x, forest.y, forest.rx, forest.ry, forest.rotation, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(232,239,195,.48)";
    ctx.font = "900 34px Arial";
    ctx.textAlign = "center";
    ctx.fillText(forest.name, forest.x, Math.max(90, forest.y - forest.ry + 85));
  }

  for (let i = 0; i < 720; i++) {
    const x = seeded(i, 21) * WORLD_W;
    const y = seeded(i, 22) * WORLD_H;
    if (waterDepthAt(x, y) !== null) continue;
    const forest = forestRegionAt(x, y);
    ctx.fillStyle = forest ? "rgba(190,214,145,.35)" : i % 2 ? "#7eb35b" : "#a3cf7b";
    ctx.beginPath();
    ctx.arc(x, y, 2 + seeded(i, 4) * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const [waterIndex, water] of WATER_BODIES.entries()) {
    ctx.save();
    ctx.translate(water.x, water.y);
    ctx.rotate(water.rotation);

    traceOrganicWaterPath(ctx, water, 1.035, waterIndex + 1);
    ctx.fillStyle = "#638b61";
    ctx.strokeStyle = "#466f5c";
    ctx.lineWidth = 14;
    ctx.fill();
    ctx.stroke();

    const shallowGradient = ctx.createLinearGradient(-water.rx, -water.ry, water.rx, water.ry);
    shallowGradient.addColorStop(0, "#82c4b8");
    shallowGradient.addColorStop(0.48, "#5ca49f");
    shallowGradient.addColorStop(1, "#438a8d");
    traceOrganicWaterPath(ctx, water, 0.99, waterIndex + 1.35);
    ctx.fillStyle = shallowGradient;
    ctx.strokeStyle = "#3f7d76";
    ctx.lineWidth = 6;
    ctx.fill();
    ctx.stroke();

    const deepGradient = ctx.createLinearGradient(-water.rx * 0.5, -water.ry * 0.5, water.rx * 0.5, water.ry * 0.5);
    deepGradient.addColorStop(0, "#367b82");
    deepGradient.addColorStop(0.55, "#245d69");
    deepGradient.addColorStop(1, "#173f50");
    traceOrganicWaterPath(ctx, water, water.deepScale, waterIndex + 6.4);
    ctx.fillStyle = deepGradient;
    ctx.strokeStyle = "rgba(27,77,83,.72)";
    ctx.lineWidth = 5;
    ctx.fill();
    ctx.stroke();

    ctx.save();
    traceOrganicWaterPath(ctx, water, 0.98, waterIndex + 1.35);
    ctx.clip();
    for (let ripple = 0; ripple < 13; ripple++) {
      const angle = seeded(ripple, 310 + waterIndex * 17) * Math.PI * 2;
      const distance = 0.18 + seeded(ripple, 311 + waterIndex * 17) * 0.7;
      const x = Math.cos(angle) * water.rx * distance;
      const y = Math.sin(angle) * water.ry * distance;
      const length = 18 + seeded(ripple, 312 + waterIndex * 17) * 34;
      ctx.strokeStyle = ripple % 3 === 0 ? "rgba(196,235,222,.46)" : "rgba(143,207,198,.38)";
      ctx.lineWidth = 2.5 + seeded(ripple, 313 + waterIndex * 17) * 1.7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x - length / 2, y);
      ctx.quadraticCurveTo(x, y - 5 - ripple % 3, x + length / 2, y);
      ctx.stroke();
    }

    for (let pad = 0; pad < 5 + waterIndex * 2; pad++) {
      const angle = seeded(pad, 390 + waterIndex * 19) * Math.PI * 2;
      const distance = 0.7 + seeded(pad, 391 + waterIndex * 19) * 0.2;
      const x = Math.cos(angle) * water.rx * distance;
      const y = Math.sin(angle) * water.ry * distance;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle * 0.35);
      ctx.fillStyle = pad % 2 ? "#527f55" : "#64965e";
      ctx.strokeStyle = "#3f6e4b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 11 + pad % 3, 6.5 + pad % 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(211,229,174,.55)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(9, -2);
      ctx.stroke();
      if (pad === 1) {
        ctx.fillStyle = "#e7c8d2";
        for (const petalAngle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
          ctx.beginPath();
          ctx.arc(Math.cos(petalAngle) * 3, Math.sin(petalAngle) * 3, 2.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
    ctx.restore();

    for (let reed = 0; reed < 8 + waterIndex * 2; reed++) {
      const angle = seeded(reed, 460 + waterIndex * 23) * Math.PI * 2;
      const x = Math.cos(angle) * water.rx * 0.96;
      const y = Math.sin(angle) * water.ry * 0.96;
      const height = 15 + seeded(reed, 461 + waterIndex * 23) * 14;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.strokeStyle = reed % 2 ? "#466f45" : "#527e4d";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      for (const spread of [-5, 0, 5]) {
        ctx.beginPath();
        ctx.moveTo(0, spread);
        ctx.quadraticCurveTo(7, spread * 0.5, height, spread - 4);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();

    ctx.fillStyle = "rgba(222,240,217,.55)";
    ctx.font = "900 25px Arial";
    ctx.textAlign = "center";
    ctx.fillText(water.name, water.x, water.y - water.ry - 24);
  }
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
  } else if (projectile.kind === "guardianOrb") {
    const pulse = 0.84 + Math.sin(performance.now() / 45 + projectile.id) * 0.16;
    const trail = ctx.createLinearGradient(-36, 0, 9, 0);
    trail.addColorStop(0, "rgba(91,24,78,0)");
    trail.addColorStop(0.6, "rgba(205,64,104,.48)");
    trail.addColorStop(1, "rgba(255,137,91,.9)");
    ctx.strokeStyle = trail;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(-38, 0);
    ctx.lineTo(3, 0);
    ctx.stroke();
    ctx.fillStyle = "rgba(244,78,92,.25)";
    ctx.beginPath();
    ctx.arc(7, 0, 17 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6b205b";
    ctx.strokeStyle = "#ff9b64";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(7, 0, 10 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff0bd";
    ctx.beginPath();
    ctx.arc(10, -3, 3.5, 0, Math.PI * 2);
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

  const reveal = (worldX: number, worldY: number, radius: number, core: number) => {
    const x = offsetX + worldX * scale;
    const y = offsetY + worldY * scale;
    const screenRadius = radius * scale;
    if (x + screenRadius < 0 || y + screenRadius < 0 || x - screenRadius > width || y - screenRadius > height) return;
    const occluders = collectLightOccluders(game, game.realm, worldX, worldY, radius);
    const angles = lightVisibilityAngles(worldX, worldY, occluders);
    light.save();
    light.beginPath();
    angles.forEach((angle, index) => {
      const distance = lightRayDistance(game.realm, worldX, worldY, angle, radius, occluders);
      const pointX = offsetX + (worldX + Math.cos(angle) * distance) * scale;
      const pointY = offsetY + (worldY + Math.sin(angle) * distance) * scale;
      if (index === 0) light.moveTo(pointX, pointY);
      else light.lineTo(pointX, pointY);
    });
    light.closePath();
    light.clip();
    const gradient = light.createRadialGradient(x, y, Math.max(1, core * scale), x, y, screenRadius);
    gradient.addColorStop(0, "rgba(0,0,0,1)");
    gradient.addColorStop(0.45, "rgba(0,0,0,.93)");
    gradient.addColorStop(0.76, "rgba(0,0,0,.52)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    light.fillStyle = gradient;
    light.fillRect(x - screenRadius, y - screenRadius, screenRadius * 2, screenRadius * 2);
    light.restore();

    for (const blocker of occluders) {
      const angle = Math.atan2(blocker.y - worldY, blocker.x - worldX);
      const blockerDistance = lightOccluderRayDistance(worldX, worldY, angle, radius, blocker);
      if (blockerDistance === null) continue;
      const visibleDistance = lightRayDistance(game.realm, worldX, worldY, angle, radius, occluders);
      if (blockerDistance > visibleDistance + 0.75) continue;

      light.save();
      light.beginPath();
      if (blocker.shape === "circle") {
        light.arc(
          offsetX + blocker.x * scale,
          offsetY + blocker.y * scale,
          blocker.radius * scale,
          0,
          Math.PI * 2,
        );
      } else {
        light.rect(
          offsetX + (blocker.x - blocker.halfWidth) * scale,
          offsetY + (blocker.y - blocker.halfHeight) * scale,
          blocker.halfWidth * 2 * scale,
          blocker.halfHeight * 2 * scale,
        );
      }
      light.clip();
      light.fillStyle = gradient;
      light.fillRect(x - screenRadius, y - screenRadius, screenRadius * 2, screenRadius * 2);
      light.restore();
    }
  };

  reveal(game.player.x, game.player.y, PLAYER_LIGHT_RADIUS[game.realm], 25);
  game.buildings.forEach((building) => {
    if (building.realm !== game.realm) return;
    const radius = buildingLightRadius(building);
    if (!radius) return;
    const center = buildingWorldCenter(building);
    reveal(center.x, center.y, radius, 55);
  });
  game.creatures.forEach((creature) => {
    if (
      creature.realm === game.realm &&
      creature.boss &&
      creature.hp > 0 &&
      creature.rangedChargeUntil > performance.now()
    ) reveal(creature.x, creature.y, 145, 36);
  });
  game.projectiles.forEach((projectile) => {
    if (projectile.realm === game.realm && projectile.kind === "guardianOrb") {
      reveal(projectile.x, projectile.y, 86, 18);
    }
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
    drawMeadowTerrain(ctx);
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
      drawCave(ctx, entrance.entranceX, entrance.entranceY, false),
    );
  } else {
    CAVES.forEach((exit) =>
      drawCave(ctx, exit.undergroundX, exit.undergroundY, true),
    );
  }

  const viewLeft = game.camera.x - width / (2 * scale) - 140;
  const viewRight = game.camera.x + width / (2 * scale) + 140;
  const viewTop = game.camera.y - height / (2 * scale) - 140;
  const viewBottom = game.camera.y + height / (2 * scale) + 140;
  const onScreen = (x: number, y: number) => x >= viewLeft && x <= viewRight && y >= viewTop && y <= viewBottom;
  const visibleBuildings = game.buildings.filter((building) => {
    const center = buildingWorldCenter(building);
    return building.realm === game.realm && onScreen(center.x, center.y);
  });
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
  game.drops.forEach((drop) => {
    if (drop.realm !== game.realm || !onScreen(drop.x, drop.y)) return;
    drawables.push({ y: drop.y + 18, draw: () => drawGroundDrop(ctx, drop, performance.now()) });
  });
  game.treasures.forEach((treasure) => {
    if (treasure.realm === game.realm && onScreen(treasure.x, treasure.y)) {
      drawables.push({ y: treasure.y, draw: () => drawTreasure(ctx, treasure, performance.now()) });
    }
  });
  visibleBuildings
    .filter((building) => building.kind !== "floor" && building.kind !== "roof")
    .forEach((building) => drawables.push({ y: buildingWorldCenter(building).y, draw: () => drawBuilding(ctx, building) }));
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
  if (game.attackFlash?.realm === game.realm) {
    drawAttackFlash(ctx, game.attackFlash, performance.now());
  }
  visibleBuildings.filter((building) => building.kind === "roof").forEach((building) => drawBuilding(ctx, building, 0.78));

  if (game.buildMode) {
    const cell = previewCell(game);
    const valid = validPlacement(game, game.buildMode, cell.gx, cell.gy) && game.kits[game.buildMode] > 0;
    const previewCenter = buildingCenter(game.buildMode, cell.gx, cell.gy);
    const previewHalfSize = buildingHalfSize(game.buildMode);
    ctx.fillStyle = valid ? "rgba(87,210,113,.24)" : "rgba(230,83,73,.26)";
    ctx.strokeStyle = valid ? "#69db7c" : "#ef6258";
    ctx.lineWidth = 3;
    ctx.fillRect(previewCenter.x - previewHalfSize, previewCenter.y - previewHalfSize, previewHalfSize * 2, previewHalfSize * 2);
    ctx.strokeRect(previewCenter.x - previewHalfSize, previewCenter.y - previewHalfSize, previewHalfSize * 2, previewHalfSize * 2);
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
  if (entrance) return "E · Enter cave";
  if (
    currentCave
  ) {
    return "E · Exit cave";
  }
  if (nearestTreasure(game, 92)) return "E · Open treasure cache";
  const building = game.buildings.find(
    (item) =>
      item.realm === game.realm &&
      item.construction >= 1 &&
      ["woodGate", "stoneGate", "door", "crop", "storageChest", "bedroll"].includes(item.kind) &&
      distanceToBuilding(item, game.player.x, game.player.y) < 58,
  );
  if (building) {
    if (building.kind === "storageChest") return "E · Open Storage Chest";
    if (building.kind === "bedroll") return "E · Rest at Bedroll";
    if (building.kind === "crop") return "E · " + (building.growth >= 1 ? "Harvest crop" : "Check crop");
    return "E · " + (building.open ? "Close" : "Open") + " " + BUILD_DATA[building.kind].name;
  }
  const creature = nearestCreature(game, 92);
  if (creature && isAnimal(creature.kind) && !creature.tame) {
    if (isPermanentlyWaryPrey(creature.kind) && creature.waryOfPlayer) {
      return "This " + creature.kind + " is wary and refuses bait";
    }
    const chance = Math.round(ANIMAL_DATA[creature.kind].tameChance * 100);
    return "E · Feed " + animalLureFood(creature.kind) + " to " + creature.kind + " · " + chance + "% tame chance";
  }
  if (isFoodItem(game.selected) && game.resources[game.selected] > 0) return "E · Eat " + game.selected;
  const node = nearestNode(game, 92);
  if (node) {
    if (isTree(node.kind)) return "TOOL · " + (game.selected === "hands" ? "Punch " : "Chop ") + node.kind + (game.selected === "hands" ? "" : " with Axe");
    if (node.kind === "rock") return "TOOL · Mine stone with Pickaxe";
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
    detail: "1 chopping damage per swing · 36 durability",
    cost: { wood: 3 },
    action: (game) => {
      addDurableTool(game, "woodAxe");
    },
  },
  {
    id: "woodPick",
    name: "Wood Pickaxe",
    detail: "1 mining damage per swing · 36 durability",
    cost: { wood: 3 },
    action: (game) => {
      addDurableTool(game, "woodPickaxe");
    },
  },
  {
    id: "stoneAxe",
    name: "Stone Axe",
    detail: "2 chopping damage per swing · 72 durability",
    cost: { wood: 3, stone: 4 },
    action: (game) => {
      addDurableTool(game, "stoneAxe");
    },
  },
  {
    id: "stonePick",
    name: "Stone Pickaxe",
    detail: "2 mining damage per swing · common metals · 72 durability",
    cost: { wood: 3, stone: 4 },
    action: (game) => {
      addDurableTool(game, "stonePickaxe");
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
    id: "ironBow",
    name: "Iron Bow",
    detail: "Tier 2 · 600 range · 28 damage",
    cost: { wood: 6, fiber: 4, iron: 5 },
    requiresBench: true,
    owned: (game) => game.gear.ironBow,
    action: (game) => {
      game.gear.ironBow = true;
      game.weapon = "ironBow";
      equipNewItem(game, "ironBow");
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
    detail: "3 chopping damage per swing · 120 durability",
    cost: { wood: 4, iron: 5 },
    requiresBench: true,
    action: (game) => {
      addDurableTool(game, "ironAxe");
    },
  },
  {
    id: "ironPick",
    name: "Iron Pickaxe",
    detail: "3 mining damage per swing · mines Aetherium · 120 durability",
    cost: { wood: 4, iron: 5 },
    requiresBench: true,
    action: (game) => {
      addDurableTool(game, "ironPickaxe");
    },
  },
  {
    id: "aetherAxe",
    name: "Aetherium Axe",
    detail: "5 chopping damage per swing · 180 durability",
    cost: { wood: 4, aetherium: 7, iron: 3 },
    requiresBench: true,
    action: (game) => {
      addDurableTool(game, "aetheriumAxe");
    },
  },
  {
    id: "aetherPick",
    name: "Aetherium Pickaxe",
    detail: "5 mining damage per swing · 180 durability",
    cost: { wood: 4, aetherium: 7, iron: 3 },
    requiresBench: true,
    action: (game) => {
      addDurableTool(game, "aetheriumPickaxe");
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
  if (type === "axe" || type === "pickaxe") {
    const material = tier ?? "iron";
    const colors: Record<ToolTier, { head: string; edge: string; outline: string }> = {
      none: { head: "#b8c5c0", edge: "#eef4f0", outline: "#33443e" },
      wood: { head: "#a66b3e", edge: "#dca668", outline: "#55372a" },
      stone: { head: "#858f89", edge: "#c3cbc7", outline: "#3d4b47" },
      iron: { head: "#b8c6c3", edge: "#f3f7f5", outline: "#3a4946" },
      aetherium: { head: "#63dae7", edge: "#d7fcff", outline: "#256a72" },
    };
    const palette = colors[material];
    const axeHead: Record<ToolTier, string> = {
      none: "M28 17 L22 13 L8 20 Q14 8 25 2 L32 14 L37 18 L35 26 L29 27 Z",
      wood: "M28 17 L23 14 L10 20 Q15 10 25 4 L32 14 L37 18 L34 26 L29 27 Z",
      stone: "M28 17 L21 13 L7 20 L11 11 L24 2 L32 14 L38 18 L35 27 L29 27 Z",
      iron: "M28 17 L21 12 Q10 13 4 20 Q12 7 25 1 L32 14 L38 18 L35 27 L29 27 Z",
      aetherium: "M28 17 L20 12 L5 20 L10 10 L19 8 L24 0 L31 7 L32 14 L39 18 L35 28 L29 27 Z",
    };
    const axeEdge: Record<ToolTier, string> = {
      none: "M8 20 Q14 8 25 2",
      wood: "M10 20 Q15 10 25 4",
      stone: "M7 20 L11 11 L24 2",
      iron: "M4 20 Q12 7 25 1",
      aetherium: "M5 20 L10 10 L19 8 L24 0",
    };
    const pickCurve = material === "wood" ? "M5 21 Q25 8 47 16" : material === "stone" ? "M4 22 Q25 6 48 16" : material === "aetherium" ? "M3 23 Q25 4 49 15" : "M4 22 Q25 5 48 15";
    return (
      <span className={"tool-glyph tool-" + type + " tier-" + material} aria-hidden="true">
        <svg className="tool-svg" viewBox="0 0 52 52" focusable="false">
          <path d="M9 46 L31 21" stroke="#4b3025" strokeWidth="9" strokeLinecap="round" />
          <path d="M10 44 L30 22" stroke="#b47745" strokeWidth="4.5" strokeLinecap="round" />
          {type === "axe" ? (
            <g>
              <path d={axeHead[material]} fill={palette.head} stroke={palette.outline} strokeWidth="2.5" strokeLinejoin="round" />
              <path d={axeEdge[material]} fill="none" stroke={palette.edge} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="27" y="16" width="8" height="10" rx="2.5" fill="#4b342a" stroke="#ead5a8" strokeWidth="1.4" transform="rotate(2 31 21)" />
              {material === "wood" && <path d="M26 16 L36 25 M27 12 L38 20" fill="none" stroke="#e0bb6b" strokeWidth="2.2" strokeLinecap="round" />}
            </g>
          ) : (
            <>
              <path d={pickCurve} fill="none" stroke={palette.outline} strokeWidth={material === "stone" ? 11 : 9} strokeLinecap="round" />
              <path d={pickCurve} fill="none" stroke={palette.head} strokeWidth={material === "stone" ? 7 : 5.5} strokeLinecap="round" />
              <path d="M3 23 L11 13 L12 22 Z" fill={palette.head} stroke={palette.outline} strokeWidth="2" strokeLinejoin="round" />
              <path d="M47 16 L51 7 L49 18 Z" fill={palette.head} stroke={palette.outline} strokeWidth="2" strokeLinejoin="round" />
              <path d={pickCurve} fill="none" stroke={palette.edge} strokeWidth="1.5" strokeLinecap="round" />
              <rect x="27" y="13" width="8" height="10" rx="2.5" fill="#4b342a" stroke="#ead5a8" strokeWidth="1.4" transform="rotate(-18 31 18)" />
              {material === "wood" && <path d="M25 16 L34 24 M22 18 L31 26" fill="none" stroke="#e0bb6b" strokeWidth="2" strokeLinecap="round" />}
            </>
          )}
        </svg>
      </span>
    );
  }
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
  if (recipe.id === "bow" || recipe.id === "ironBow") return <ToolGlyph type="bow" tier={tier} />;
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
  if (item === "ironBow") {
    return <ToolGlyph type="bow" tier="iron" />;
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
      if (key === "i") {
        game.openChestId = null;
        setPanel((value) => (value === "inventory" ? null : "inventory"));
      }
      if (key === "b") {
        game.openChestId = null;
        setPanel(null);
        toggleNearbyAutoBuild(game);
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
    const releasePrimary = () => releasePrimaryInput(game);
    const resetInput = () => resetTransientInput(game);
    const resetHiddenInput = () => {
      if (document.visibilityState === "hidden") resetTransientInput(game);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("pointerup", releasePrimary);
    window.addEventListener("pointercancel", releasePrimary);
    window.addEventListener("blur", resetInput);
    document.addEventListener("visibilitychange", resetHiddenInput);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("pointerup", releasePrimary);
      window.removeEventListener("pointercancel", releasePrimary);
      window.removeEventListener("blur", resetInput);
      document.removeEventListener("visibilitychange", resetHiddenInput);
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
      removeDepletedMaterialStacks(game);
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
      ? ", " + durableToolCount(game, item) + (durableToolCount(game, item) === 1 ? " copy, " : " copies, ") +
        activeToolDurability(game, item) + " of " + DURABLE_TOOL_DATA[item].maxDurability + " active durability"
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
        {item && (isMaterial(item) || itemCount(game, item) > 1) && <b className="stack-count">{itemCount(game, item)}</b>}
        {item && isDurableTool(item) && (
          <span className="tool-durability" title={activeToolDurability(game, item) + " active durability · " + durableToolCount(game, item) + (durableToolCount(game, item) === 1 ? " copy" : " copies")}>
            <i style={{ width: (activeToolDurability(game, item) / DURABLE_TOOL_DATA[item].maxDurability) * 100 + "%" }} />
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
        : game.selected === "ironBow"
          ? "Iron Bow · " + game.resources.arrows + " arrows"
      : game.selected === "pistol"
            ? "Scrap Pistol · " + game.resources.bullets + " bullets"
      : isDurableTool(game.selected)
        ? itemLabel(game.selected, game) + " · " + activeToolDurability(game, game.selected) + "/" +
          DURABLE_TOOL_DATA[game.selected].maxDurability + " durability · " + durableToolCount(game, game.selected) +
          (durableToolCount(game, game.selected) === 1 ? " copy" : " copies")
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
  const lowHealth = game.started && !game.dead && game.player.hp <= LOW_HEALTH_THRESHOLD;
  const lowHunger = game.started && !game.dead && game.player.hunger <= LOW_HUNGER_THRESHOLD;

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
          releasePrimaryInput(game);
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
          event.currentTarget.focus({ preventScroll: true });
          pointerMove(event);
          event.currentTarget.setPointerCapture(event.pointerId);
          game.mouseHeld = true;
          game.heldAction = null;
          game.buildDrag = event.shiftKey;
          game.lastBuildCell = null;
          primaryAction(game);
          refresh();
        }}
        onPointerUp={(event) => {
          releasePrimaryInput(game);
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => releasePrimaryInput(game)}
        onLostPointerCapture={() => releasePrimaryInput(game)}
        onContextMenu={(event) => event.preventDefault()}
        onWheel={(event) => {
          event.preventDefault();
          zoom(event.deltaY > 0 ? -0.08 : 0.08);
        }}
      />

      {lowHealth && (
        <div
          className="low-health-vignette"
          style={{ opacity: Math.min(0.95, 0.42 + (LOW_HEALTH_THRESHOLD - game.player.hp) / 42) }}
          aria-hidden="true"
        />
      )}

      {lowHunger && (
        <div className={"hunger-warning" + (game.player.hunger <= 10 ? " critical" : "")} role="alert">
          <strong>LOW HUNGER</strong>
          <span>Eat food now — select berries, mushrooms, or meat and press <kbd>E</kbd>.</span>
        </div>
      )}

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

        <div className="brand-pill"><span>H</span><strong>HALFLIGHT</strong><small>{game.realm === "caveSystem" ? "THE CAVES" : meadowAreaName(game.player.x, game.player.y)}</small></div>

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
        <small>{game.kills} threats defeated · {tamedAnimalCount(game)}/{MAX_TAMED_ANIMALS} companions · wave {game.wave || "—"} · {game.gear.armor === "none" ? "no armor" : game.gear.armor + " armor"}</small>
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
        <span><kbd>B</kbd> Auto-build nearby</span>
        <span><kbd>C</kbd> Craft</span>
      </aside>

      <div className="touch-controls" aria-label="Touch controls">
        <div className="touch-dpad">
          <button
            className="up"
            onPointerDown={() => holdMove("w", true)}
            onPointerUp={() => holdMove("w", false)}
            onPointerLeave={() => holdMove("w", false)}
            onPointerCancel={() => holdMove("w", false)}
            aria-label="Move up"
          >↑</button>
          <button
            className="left"
            onPointerDown={() => holdMove("a", true)}
            onPointerUp={() => holdMove("a", false)}
            onPointerLeave={() => holdMove("a", false)}
            onPointerCancel={() => holdMove("a", false)}
            aria-label="Move left"
          >←</button>
          <button
            className="right"
            onPointerDown={() => holdMove("d", true)}
            onPointerUp={() => holdMove("d", false)}
            onPointerLeave={() => holdMove("d", false)}
            onPointerCancel={() => holdMove("d", false)}
            aria-label="Move right"
          >→</button>
          <button
            className="down"
            onPointerDown={() => holdMove("s", true)}
            onPointerUp={() => holdMove("s", false)}
            onPointerLeave={() => holdMove("s", false)}
            onPointerCancel={() => holdMove("s", false)}
            aria-label="Move down"
          >↓</button>
        </div>
        <button className="touch-e" onClick={() => { interact(game); refresh(); }}>E<small>Interact</small></button>
        <button
          className="touch-build"
          aria-pressed={game.autoBuildActive}
          onClick={() => {
            game.openChestId = null;
            setPanel(null);
            toggleNearbyAutoBuild(game);
            refresh();
            canvasRef.current?.focus();
          }}
        >B<small>{game.autoBuildActive ? "Stop" : "Build"}</small></button>
        <button
          className="touch-attack"
          onPointerDown={() => {
            game.mouseHeld = true;
            game.heldAction = null;
            game.buildDrag = true;
            game.lastBuildCell = null;
            primaryAction(game);
            refresh();
          }}
          onPointerUp={() => releasePrimaryInput(game)}
          onPointerLeave={() => releasePrimaryInput(game)}
          onPointerCancel={() => releasePrimaryInput(game)}
        >Hold tool</button>
      </div>

      {panel && (
        <div className="panel-scrim" onPointerDown={() => setPanel(null)}>
          <aside
            className={"game-panel" + (panel === "craft" ? " crafting-menu" : "")}
            role="dialog"
            aria-modal="true"
            aria-labelledby="game-panel-title"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <header>
              <div><small>SURVIVAL KIT</small><h2 id="game-panel-title">{panel === "inventory" ? "Backpack" : panel === "craft" ? "Crafting" : "Ready Pieces"}</h2></div>
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
                  <div className="taming-tip"><span>♥</span><div><b>Taming wildlife · {tamedAnimalCount(game)}/{MAX_TAMED_ANIMALS}</b><p>Equip meat to lure bears, foxes, and wolves; berries lure all other wildlife. Press E nearby to try taming it. Deer and rabbits you injure become permanently wary and refuse bait.</p></div></div>
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
                          <div><h3>{data.name}</h3><p>{data.detail}</p><small>{data.hp} health · 1.5s build time</small></div>
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

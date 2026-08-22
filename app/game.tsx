"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CaveRealm = "caveSystem";
type CaveZone = "stone" | "iron" | "sulfur";
type Realm = "meadow" | CaveRealm;
type GameMode = "survival" | "custom";
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
type FoodMaterial = "berries" | "mushrooms" | "meat" | "cookedMushrooms" | "cookedMeat";
type RawCookableFood = "mushrooms" | "meat";
type ToolTier = "none" | "wood" | "stone" | "iron" | "aetherium" | "biomass";
type Firearm = "pistol" | "smg" | "shotgun" | "rifle" | "sniper" | "chimera";
type DurableTool =
  | "woodAxe"
  | "stoneAxe"
  | "ironAxe"
  | "aetheriumAxe"
  | "carapaceAxe"
  | "woodPickaxe"
  | "stonePickaxe"
  | "ironPickaxe"
  | "aetheriumPickaxe"
  | "spear"
  | "sword"
  | "tendrilBlade"
  | "bow"
  | "ironBow"
  | Firearm;
type Tool = DurableTool | "hammer" | FoodMaterial | "build" | "hands";
type ToolGlyphKind = "axe" | "pickaxe" | "hammer" | "spear" | "sword" | "bow" | Firearm | "pack";
type BuildKind =
  | "craftingBench"
  | "laboratory"
  | "chemicalLab"
  | "mineralGrower"
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
  | "guardianCore"
  | "mineralRock"
  | "carapacePlate"
  | "neuralGel"
  | "livingWeave"
  | "fiber"
  | "berries"
  | "meat"
  | "mushrooms"
  | "cookedMeat"
  | "cookedMushrooms"
  | "seeds"
  | "hide"
  | "biomass"
  | "arrows"
  | "bullets";
type GrowableMineral = "iron" | "copper" | "coal" | "sulfur" | "aetherium";
type BiomassCompound = "carapacePlate" | "neuralGel" | "livingWeave";
type GroundAnimalKind = "bear" | "boar" | "deer" | "rabbit" | "fox" | "wolf" | "raccoon";
type BirdKind = "crow" | "owl" | "turkey";
type AnimalKind = GroundAnimalKind | BirdKind;
type MonsterKind = "shade" | "crawler" | "brute" | "stalker" | "wraith" | "maw" | "aetherWarden" | "dreadTitan";
type CreatureKind = MonsterKind | AnimalKind;
type ArmorKind = "none" | "copper" | "iron" | "blacksteel" | "symbiote";
type ResearchKind = "carapaceAxe" | "tendrilBlade" | "symbioteArmor" | "xenoBallistics";
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
  collectibleAt: number;
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
  maturesAt: number;
  breedReadyAt: number;
  angry: boolean;
  hitAt: number;
  attackAt: number;
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
  abilityReadyAt: number;
  abilityStartedAt: number;
  abilityTargetX: number;
  abilityTargetY: number;
  summonReadyAt?: number;
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
  processMaterial?: GrowableMineral;
}

interface WorkOrder {
  buildingId: number;
  action: "construct" | "deconstruct";
  progress: number;
}

interface Projectile {
  id: number;
  kind: "arrow" | "bullet" | "broodWeb" | "titanShard";
  realm: Realm;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  damage: number;
  bulletStyle?: "standard" | "pellet" | "sniper" | "chimera";
}

interface BroodWeb {
  id: number;
  realm: CaveRealm;
  x: number;
  y: number;
  radius: number;
  expiresAt: number;
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
  | { kind: "bow" }
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
  mode: GameMode;
  started: boolean;
  dead: boolean;
  paused: boolean;
  relaxing: boolean;
  pausedAt: number;
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
    tendrilBlade: boolean;
    bow: boolean;
    ironBow: boolean;
    pistol: boolean;
    smg: boolean;
    shotgun: boolean;
    rifle: boolean;
    sniper: boolean;
    chimera: boolean;
    hammer: boolean;
    toolDurability: Record<DurableTool, number[]>;
    armor: ArmorKind;
  };
  kits: Record<BuildKind, number>;
  selected: Tool;
  selectedSlot: number;
  weapon: "spear" | "sword" | "tendrilBlade" | "bow" | "ironBow" | Firearm;
  inventory: (InventoryItem | null)[];
  hotbar: (InventoryItem | null)[];
  buildMode: BuildKind | null;
  openChestId: number | null;
  openLaboratoryId: number | null;
  research: Record<ResearchKind, boolean>;
  openGrowerId: number | null;
  workOrders: WorkOrder[];
  autoBuildActive: boolean;
  nodes: ResourceNode[];
  drops: GroundDrop[];
  treasures: CaveTreasure[];
  creatures: Creature[];
  buildings: Building[];
  projectiles: Projectile[];
  broodWebs: BroodWeb[];
  broodWebDamageAt: number;
  attackFlash: AttackFlash | null;
  keys: Set<string>;
  mouseHeld: boolean;
  heldAction: HeldAction;
  bowChargeStartedAt: number | null;
  buildDrag: boolean;
  lastBuildCell: string | null;
  pointer: { x: number; y: number; worldX: number; worldY: number; active: boolean };
  camera: { x: number; y: number };
  message: string;
  messageUntil: number;
  hallucinatingUntil: number;
  wave: number;
  dreadTitanSpawned: boolean;
  cavePopulationInitialized: boolean;
  nextCaveSpawnAt: number;
  kills: number;
  lastId: number;
}

interface Recipe {
  id: string;
  name: string;
  detail: string;
  cost: Partial<Record<Material, number>>;
  requiresBench?: boolean;
  requiresLab?: boolean;
  prerequisite?: (game: GameState) => boolean;
  prerequisiteLabel?: string;
  requiresResearch?: ResearchKind;
  owned?: (game: GameState) => boolean;
  action: (game: GameState) => void;
}

const WORLD_W = 7200;
const WORLD_H = 5200;
const GRID = 48;
const DAY_SECONDS = 480;
const MAX_CUSTOM_DAY = 999;
const RELAX_TIME_MULTIPLIER = 5;
const PLAYER_BASE_SPEED = 190;
const HELD_ITEM_SPEED_FACTOR = 0.82;
const BOW_DRAW_SPEED_FACTOR = 0.35;
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
const CAMPFIRE_COOK_DISTANCE = 92;
const RAW_MUSHROOM_SICKNESS_CHANCE = 0.14;
const RAW_MEAT_SICKNESS_CHANCE = 0.2;
const RAW_MUSHROOM_HALLUCINATION_CHANCE = 0.12;
const HALLUCINATION_DURATION_MS = 15_000;
const CREATURE_DROP_COLLECTION_DELAY_MS = 650;
const HALLUCINATION_PHANTOM_COUNT = 2;
const HALLUCINATION_FLICKER_PERIOD_MS = 2_600;
const CREATURE_ATTACK_COOLDOWN_MS = 1250;
const CREATURE_STRUCTURE_ATTACK_COOLDOWN_MS = 1200;
const BRUTE_LEAP_COOLDOWN_MS = 4200;
const BRUTE_LEAP_WINDUP_MS = 420;
const BRUTE_LEAP_TRAVEL_MS = 560;
const BRUTE_LEAP_SPEED = 620;
const BRUTE_LEAP_MIN_DISTANCE = 120;
const BRUTE_LEAP_MAX_DISTANCE = 320;
const BRUTE_LEAP_IMPACT_RADIUS = 78;
const PLAYER_LIGHT_RADIUS: Record<Realm, number> = { meadow: 144, caveSystem: 168 };
const PLAYER_VISION_CONE_RANGE: Record<Realm, number> = { meadow: 376.25, caveSystem: 402.5 };
const PLAYER_VISION_CONE_HALF_ANGLE = Math.PI / 7;
const LIGHT_PROVOKE_DURATION_MS = 12000;
const MONSTER_EYE_GLINT_RANGE = 340;
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
const CAVE_DAY_POPULATION = 6;
const CAVE_DAY_REPLACEMENT_MS = 18000;
const CAVE_NIGHT_BASE_REINFORCEMENTS = 4;
const CAVE_NIGHT_REINFORCEMENTS_PER_DAY = 2;
const CONSTRUCTION_SECONDS = 1.5;
const DECONSTRUCTION_SECONDS = 2.25;
const BUILDING_HALF_SIZE = 23;
const CROP_HALF_SIZE = GRID - 2;
const AUTO_BUILD_RANGE = GRID * 3;
const RESOURCE_USE_RANGE = 112;
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

const AETHER_SITES = CAVES.map((cave, index) => {
  const deposit = caveEncounterPoint(cave, cave.chamberRadius * 0.56, 150);
  const towardCenterX = cave.undergroundX - deposit.x;
  const towardCenterY = cave.undergroundY - deposit.y;
  const towardCenterLength = Math.hypot(towardCenterX, towardCenterY) || 1;
  return {
    deposit,
    guard: {
      x: deposit.x + (towardCenterX / towardCenterLength) * 155,
      y: deposit.y + (towardCenterY / towardCenterLength) * 155,
    },
    size: index === 1 ? "huge" as const : "medium" as const,
  };
});

const MATERIALS: { id: Material; name: string }[] = [
  { id: "wood", name: "Wood" },
  { id: "stone", name: "Stone" },
  { id: "iron", name: "Iron" },
  { id: "copper", name: "Copper" },
  { id: "coal", name: "Coal" },
  { id: "sulfur", name: "Sulfur" },
  { id: "aetherium", name: "Aetherium" },
  { id: "guardianCore", name: "Guardian Core" },
  { id: "mineralRock", name: "Mineral-Rich Rock" },
  { id: "carapacePlate", name: "Carapace Plate" },
  { id: "neuralGel", name: "Neural Gel" },
  { id: "livingWeave", name: "Living Weave" },
  { id: "fiber", name: "Fiber" },
  { id: "berries", name: "Berries" },
  { id: "meat", name: "Raw Meat" },
  { id: "mushrooms", name: "Raw Mushrooms" },
  { id: "cookedMeat", name: "Cooked Meat" },
  { id: "cookedMushrooms", name: "Cooked Mushrooms" },
  { id: "seeds", name: "Seeds" },
  { id: "hide", name: "Hide" },
  { id: "biomass", name: "Alien Biomass" },
  { id: "arrows", name: "Arrows" },
  { id: "bullets", name: "Bullets" },
];

const BUILD_DATA: Record<
  BuildKind,
  { name: string; detail: string; icon: string; cost: Partial<Record<Material, number>>; makes: number; hp: number }
> = {
  craftingBench: { name: "Crafting Bench", detail: "Unlocks advanced crafting nearby", icon: "CB", cost: { wood: 4, stone: 2 }, makes: 1, hp: 85 },
  laboratory: { name: "Laboratory", detail: "Researches blueprints and processes Alien Biomass", icon: "LB", cost: { wood: 10, iron: 8, copper: 6 }, makes: 1, hp: 145 },
  chemicalLab: { name: "Chemical Lab", detail: "Makes bullets and Mineral Growers within 150 units", icon: "CL", cost: { iron: 8, copper: 6, stone: 4 }, makes: 1, hp: 135 },
  mineralGrower: { name: "Mineral Grower", detail: "Uses a mineral catalyst to enrich Mineral-Rich Rock", icon: "MG", cost: { iron: 10, copper: 7, aetherium: 3 }, makes: 1, hp: 155 },
  storageChest: { name: "Storage Chest", detail: "Holds separate resource stacks", icon: "CH", cost: { wood: 5, fiber: 2 }, makes: 1, hp: 110 },
  bedroll: { name: "Bedroll", detail: "Rest once each day to recover health", icon: "BR", cost: { wood: 2, fiber: 4 }, makes: 1, hp: 50 },
  torch: { name: "Standing Torch", detail: "Places instantly as a permanent light", icon: "TO", cost: { wood: 2, fiber: 1, coal: 1 }, makes: 2, hp: 35 },
  campfire: { name: "Campfire", detail: "Cooks raw food and creates a broad pool of light", icon: "CF", cost: { wood: 8 }, makes: 1, hp: 80 },
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
  "laboratory",
  "chemicalLab",
  "mineralGrower",
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

const RESEARCH_ORDER: ResearchKind[] = ["carapaceAxe", "tendrilBlade", "symbioteArmor", "xenoBallistics"];
const RESEARCH_DATA: Record<ResearchKind, { name: string; detail: string; biomassCost: number }> = {
  carapaceAxe: { name: "Carapace Tooling", detail: "Unlocks the durable Carapace Axe recipe.", biomassCost: 2 },
  tendrilBlade: { name: "Tendril Weaponry", detail: "Unlocks the long-reaching Tendril Blade recipe.", biomassCost: 3 },
  symbioteArmor: { name: "Symbiote Weave", detail: "Unlocks protective living armor.", biomassCost: 4 },
  xenoBallistics: { name: "Xenotech Ballistics", detail: "Unlocks the explosive Chimera Cannon super weapon.", biomassCost: 6 },
};

const BIOMASS_PROCESS_ORDER: BiomassCompound[] = ["carapacePlate", "neuralGel", "livingWeave"];
const BIOMASS_PROCESS_DATA: Record<
  BiomassCompound,
  { name: string; detail: string; cost: Partial<Record<Material, number>>; output: number }
> = {
  carapacePlate: {
    name: "Carapace Plate",
    detail: "Iron and coal harden alien tissue into a dense structural shell.",
    cost: { biomass: 2, iron: 2, coal: 1 },
    output: 2,
  },
  neuralGel: {
    name: "Neural Gel",
    detail: "Copper and sulfur make a conductive gel for living weapons.",
    cost: { biomass: 2, copper: 2, sulfur: 1 },
    output: 2,
  },
  livingWeave: {
    name: "Living Weave",
    detail: "Hide and fiber stabilize flexible strands of alien muscle.",
    cost: { biomass: 2, hide: 2, fiber: 2 },
    output: 2,
  },
};

const MINERAL_GROWTH_RECIPES: Record<
  GrowableMineral,
  { name: string; cost: Partial<Record<Material, number>>; output: number; durationMs: number }
> = {
  iron: { name: "Iron", cost: { iron: 1, mineralRock: 4 }, output: 5, durationMs: 45_000 },
  copper: { name: "Copper", cost: { copper: 1, mineralRock: 4 }, output: 5, durationMs: 45_000 },
  coal: { name: "Coal", cost: { coal: 1, mineralRock: 3 }, output: 6, durationMs: 40_000 },
  sulfur: { name: "Sulfur", cost: { sulfur: 1, mineralRock: 4 }, output: 5, durationMs: 45_000 },
  aetherium: { name: "Aetherium", cost: { aetherium: 1, mineralRock: 6 }, output: 3, durationMs: 90_000 },
};
const GROWABLE_MINERALS = Object.keys(MINERAL_GROWTH_RECIPES) as GrowableMineral[];

const ANIMAL_KINDS: AnimalKind[] = ["bear", "boar", "deer", "rabbit", "fox", "wolf", "raccoon", "crow", "owl", "turkey"];
const BIRD_KINDS: BirdKind[] = ["crow", "owl", "turkey"];
const MONSTER_KINDS: MonsterKind[] = ["shade", "crawler", "brute", "stalker", "wraith", "maw", "aetherWarden", "dreadTitan"];
const MONSTER_DATA: Record<
  MonsterKind,
  {
    realm: Realm;
    earliestNight: number;
    hp: number;
    speed: number;
    damage: number;
    attackReach: number;
    senseRadius: number;
  }
> = {
  shade: { realm: "meadow", earliestNight: 1, hp: 28, speed: 84, damage: 7, attackReach: 76, senseRadius: 320 },
  crawler: { realm: "meadow", earliestNight: 2, hp: 23, speed: 116, damage: 6, attackReach: 142, senseRadius: 390 },
  brute: { realm: "meadow", earliestNight: 3, hp: 54, speed: 60, damage: 12, attackReach: 88, senseRadius: 300 },
  stalker: { realm: "meadow", earliestNight: 4, hp: 18, speed: 206, damage: 7, attackReach: 62, senseRadius: 470 },
  wraith: { realm: "caveSystem", earliestNight: 1, hp: 42, speed: 96, damage: 10, attackReach: 108, senseRadius: 440 },
  maw: { realm: "caveSystem", earliestNight: 3, hp: 92, speed: 56, damage: 17, attackReach: 96, senseRadius: 260 },
  aetherWarden: { realm: "caveSystem", earliestNight: 1, hp: 118, speed: 70, damage: 14, attackReach: 104, senseRadius: 380 },
  dreadTitan: { realm: "meadow", earliestNight: 10, hp: 1200, speed: 45, damage: 30, attackReach: 162, senseRadius: 1000 },
};
const MONSTER_LOOT: Record<
  MonsterKind,
  { hide: number; meat: number; meatChance: number; biomass: number; biomassChance: number; minerals?: [Material, number][] }
> = {
  shade: { hide: 1, meat: 1, meatChance: 0.22, biomass: 1, biomassChance: 0.18 },
  crawler: { hide: 1, meat: 1, meatChance: 0.32, biomass: 1, biomassChance: 0.3 },
  brute: { hide: 2, meat: 2, meatChance: 0.48, biomass: 1, biomassChance: 0.38, minerals: [["iron", 1]] },
  stalker: { hide: 1, meat: 1, meatChance: 0.2, biomass: 1, biomassChance: 0.4 },
  wraith: { hide: 1, meat: 1, meatChance: 0.18, biomass: 1, biomassChance: 0.58, minerals: [["sulfur", 1]] },
  maw: { hide: 3, meat: 3, meatChance: 0.68, biomass: 2, biomassChance: 0.76, minerals: [["iron", 2], ["sulfur", 2]] },
  aetherWarden: { hide: 2, meat: 2, meatChance: 0.4, biomass: 2, biomassChance: 0.7 },
  dreadTitan: { hide: 10, meat: 8, meatChance: 1, biomass: 12, biomassChance: 1, minerals: [["iron", 8], ["copper", 8], ["aetherium", 4]] },
};
const MONSTER_WAVE_ROSTERS: Record<Realm, MonsterKind[]> = {
  meadow: ["shade", "shade", "crawler", "shade", "brute", "crawler", "shade", "stalker"],
  caveSystem: ["wraith", "wraith", "maw"],
};
const BOSS_ATTACK_REACH_BONUS = 18;
const BOSS_SPEED = 118;
const BOSS_SENSE_DISTANCE = 620;
const BOSS_RANGED_MIN_DISTANCE = 170;
const BOSS_RANGED_RANGE = 600;
const BOSS_RANGED_DAMAGE = 3;
const BOSS_RANGED_COOLDOWN_MS = 3200;
const BOSS_RANGED_WINDUP_MS = 600;
const BOSS_PROJECTILE_SPEED = 360;
const DREAD_TITAN_NIGHT = 10;
const DREAD_TITAN_RADIUS = 104;
const DREAD_TITAN_STOMP_RADIUS = 235;
const DREAD_TITAN_STOMP_DAMAGE = 34;
const DREAD_TITAN_STOMP_COOLDOWN_MS = 6700;
const DREAD_TITAN_STOMP_WINDUP_MS = 1050;
const DREAD_TITAN_BARRAGE_MIN_DISTANCE = 155;
const DREAD_TITAN_BARRAGE_RANGE = 840;
const DREAD_TITAN_BARRAGE_DAMAGE = 12;
const DREAD_TITAN_BARRAGE_COOLDOWN_MS = 4800;
const DREAD_TITAN_BARRAGE_WINDUP_MS = 780;
const DREAD_TITAN_SHARD_SPEED = 520;
const DREAD_TITAN_SUMMON_COOLDOWN_MS = 9000;
const DREAD_TITAN_SWARM_SIZE = 6;
const BROOD_WEB_RADIUS = 60;
const BROOD_WEB_DURATION_MS = 14000;
const BROOD_WEB_SPEED_FACTOR = 0.42;
const BROOD_WEB_TICK_DAMAGE = 2;
const BROOD_WEB_DAMAGE_INTERVAL_MS = 1600;
const ANIMAL_LURE_DISTANCE = 360;
const ANIMAL_LURE_STANDOFF_DISTANCE = 135;
const ANIMAL_FEED_DISTANCE = 162;
const ANIMAL_FEEDS_TO_BREED = 3;
const ANIMAL_BREED_PAIR_DISTANCE = 260;
const ANIMAL_BABY_DURATION_MS = 240_000;
const ANIMAL_BREED_COOLDOWN_MS = 480_000;
const BOW_MAX_CHARGE_MS = 1200;
const BOW_MAX_DAMAGE_BONUS = 0.75;
const CHIMERA_BURST_RADIUS = 90;
const CHIMERA_BURST_DAMAGE = 52;
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
    startingCount: number;
    habitat: "forest" | "meadow";
    flying: boolean;
    meatDrop: number;
    hideDrop: number;
  }
> = {
  bear: { hp: 70, speed: 48, damage: 9, temperament: "aggressive", noticeDistance: 135, startingCount: 1, habitat: "forest", flying: false, meatDrop: 4, hideDrop: 2 },
  boar: { hp: 44, speed: 55, damage: 6, temperament: "aggressive", noticeDistance: 90, startingCount: 2, habitat: "forest", flying: false, meatDrop: 2, hideDrop: 1 },
  deer: { hp: 36, speed: 74, damage: 0, temperament: "skittish", noticeDistance: 220, startingCount: 7, habitat: "forest", flying: false, meatDrop: 2, hideDrop: 2 },
  rabbit: { hp: 18, speed: 84, damage: 0, temperament: "skittish", noticeDistance: 170, startingCount: 10, habitat: "forest", flying: false, meatDrop: 1, hideDrop: 1 },
  fox: { hp: 30, speed: 78, damage: 6, temperament: "aggressive", noticeDistance: 135, startingCount: 3, habitat: "forest", flying: false, meatDrop: 2, hideDrop: 1 },
  wolf: { hp: 50, speed: 70, damage: 8, temperament: "aggressive", noticeDistance: 120, startingCount: 1, habitat: "forest", flying: false, meatDrop: 2, hideDrop: 1 },
  raccoon: { hp: 28, speed: 72, damage: 0, temperament: "skittish", noticeDistance: 115, startingCount: 5, habitat: "forest", flying: false, meatDrop: 1, hideDrop: 1 },
  crow: { hp: 14, speed: 102, damage: 0, temperament: "skittish", noticeDistance: 85, startingCount: 7, habitat: "meadow", flying: true, meatDrop: 1, hideDrop: 0 },
  owl: { hp: 24, speed: 82, damage: 0, temperament: "skittish", noticeDistance: 105, startingCount: 3, habitat: "forest", flying: true, meatDrop: 1, hideDrop: 0 },
  turkey: { hp: 34, speed: 62, damage: 0, temperament: "skittish", noticeDistance: 130, startingCount: 4, habitat: "meadow", flying: false, meatDrop: 3, hideDrop: 0 },
};

const ITEM_LABELS: Partial<Record<InventoryItem, string>> = {
  woodAxe: "Wood Axe",
  stoneAxe: "Stone Axe",
  ironAxe: "Iron Axe",
  aetheriumAxe: "Aetherium Axe",
  carapaceAxe: "Carapace Axe",
  woodPickaxe: "Wood Pickaxe",
  stonePickaxe: "Stone Pickaxe",
  ironPickaxe: "Iron Pickaxe",
  aetheriumPickaxe: "Aetherium Pickaxe",
  hammer: "Deconstruction Hammer",
  spear: "Stone Spear",
  sword: "Iron Sword",
  tendrilBlade: "Tendril Blade",
  bow: "Hunting Bow",
  ironBow: "Iron Bow",
  pistol: "Scrap Pistol",
  smg: "Compact SMG",
  shotgun: "Scattergun",
  rifle: "Assault Rifle",
  sniper: "Sniper Rifle",
  chimera: "Chimera Cannon",
  wood: "Wood",
  stone: "Stone",
  iron: "Iron",
  copper: "Copper",
  coal: "Coal",
  sulfur: "Sulfur",
  aetherium: "Aetherium",
  guardianCore: "Guardian Core",
  mineralRock: "Mineral-Rich Rock",
  carapacePlate: "Carapace Plate",
  neuralGel: "Neural Gel",
  livingWeave: "Living Weave",
  fiber: "Fiber",
  berries: "Berries",
  meat: "Raw Meat",
  mushrooms: "Raw Mushrooms",
  cookedMeat: "Cooked Meat",
  cookedMushrooms: "Cooked Mushrooms",
  seeds: "Seeds",
  hide: "Hide",
  biomass: "Alien Biomass",
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

function isBroodMother(creature: Creature) {
  return creature.boss && creature.kind === "maw";
}

function isDreadTitan(creature: Creature) {
  return creature.boss && creature.kind === "dreadTitan";
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
  biomass: "Biomass",
};

const DURABLE_TOOL_DATA: Record<
  DurableTool,
  { family: ToolGlyphKind; tier: Exclude<ToolTier, "none">; maxDurability: number; damage: number }
> = {
  woodAxe: { family: "axe", tier: "wood", maxDurability: 36, damage: 7 },
  stoneAxe: { family: "axe", tier: "stone", maxDurability: 72, damage: 9 },
  ironAxe: { family: "axe", tier: "iron", maxDurability: 120, damage: 14 },
  aetheriumAxe: { family: "axe", tier: "aetherium", maxDurability: 180, damage: 22 },
  carapaceAxe: { family: "axe", tier: "biomass", maxDurability: 240, damage: 30 },
  woodPickaxe: { family: "pickaxe", tier: "wood", maxDurability: 36, damage: 5 },
  stonePickaxe: { family: "pickaxe", tier: "stone", maxDurability: 72, damage: 7 },
  ironPickaxe: { family: "pickaxe", tier: "iron", maxDurability: 120, damage: 11 },
  aetheriumPickaxe: { family: "pickaxe", tier: "aetherium", maxDurability: 180, damage: 18 },
  spear: { family: "spear", tier: "stone", maxDurability: 72, damage: 17 },
  sword: { family: "sword", tier: "iron", maxDurability: 120, damage: 25 },
  tendrilBlade: { family: "sword", tier: "biomass", maxDurability: 240, damage: 36 },
  bow: { family: "bow", tier: "wood", maxDurability: 360, damage: 18 },
  ironBow: { family: "bow", tier: "iron", maxDurability: 540, damage: 28 },
  pistol: { family: "pistol", tier: "iron", maxDurability: 720, damage: 54 },
  smg: { family: "smg", tier: "iron", maxDurability: 2400, damage: 30 },
  shotgun: { family: "shotgun", tier: "iron", maxDurability: 900, damage: 24 },
  rifle: { family: "rifle", tier: "aetherium", maxDurability: 1200, damage: 62 },
  sniper: { family: "sniper", tier: "aetherium", maxDurability: 900, damage: 145 },
  chimera: { family: "chimera", tier: "biomass", maxDurability: 1200, damage: 120 },
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
  carapaceAxe: { damage: 30, range: 82, cooldown: 620, animationSeconds: 0.34, arc: 1.08, style: "slash" },
  woodPickaxe: { damage: 5, range: 78, cooldown: 820, animationSeconds: 0.42, arc: 0.85, style: "slash" },
  stonePickaxe: { damage: 7, range: 78, cooldown: 860, animationSeconds: 0.44, arc: 0.85, style: "slash" },
  ironPickaxe: { damage: 11, range: 78, cooldown: 800, animationSeconds: 0.41, arc: 0.85, style: "slash" },
  aetheriumPickaxe: { damage: 18, range: 78, cooldown: 700, animationSeconds: 0.38, arc: 0.85, style: "slash" },
  hammer: { damage: 3, range: 78, cooldown: 750, animationSeconds: 0.4, arc: 0.9, style: "slash" },
  spear: { damage: 17, range: 102, cooldown: 620, animationSeconds: 0.34, arc: 0.38, style: "thrust" },
  sword: { damage: 25, range: 102, cooldown: 480, animationSeconds: 0.3, arc: 1.15, style: "slash" },
  tendrilBlade: { damage: 36, range: 112, cooldown: 520, animationSeconds: 0.32, arc: 1.18, style: "slash" },
  bow: { damage: 18, range: 520, cooldown: 780, animationSeconds: 0.38, arc: 0, style: "shot" },
  ironBow: { damage: 28, range: 600, cooldown: 780, animationSeconds: 0.38, arc: 0, style: "shot" },
  pistol: { damage: 54, range: 660, cooldown: 520, animationSeconds: 0.24, arc: 0, style: "shot" },
  smg: { damage: 30, range: 540, cooldown: 120, animationSeconds: 0.1, arc: 0, style: "shot" },
  shotgun: { damage: 24, range: 430, cooldown: 900, animationSeconds: 0.3, arc: 0, style: "shot" },
  rifle: { damage: 62, range: 760, cooldown: 230, animationSeconds: 0.16, arc: 0, style: "shot" },
  sniper: { damage: 145, range: 1250, cooldown: 1550, animationSeconds: 0.34, arc: 0, style: "shot" },
  chimera: { damage: 120, range: 900, cooldown: 700, animationSeconds: 0.3, arc: 0, style: "shot" },
};

function attackProfile(tool: Tool) {
  return ATTACK_PROFILES[tool] ?? BASIC_ATTACK;
}

function isBowTool(tool: Tool): tool is "bow" | "ironBow" {
  return tool === "bow" || tool === "ironBow";
}

function isFirearm(tool: Tool): tool is Firearm {
  return tool === "pistol" || tool === "smg" || tool === "shotgun" || tool === "rifle" || tool === "sniper" || tool === "chimera";
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
  return item === "berries" ||
    item === "mushrooms" ||
    item === "meat" ||
    item === "cookedMushrooms" ||
    item === "cookedMeat";
}

function cookedFoodFor(item: InventoryItem | null): FoodMaterial | null {
  if (item === "mushrooms") return "cookedMushrooms";
  if (item === "meat") return "cookedMeat";
  return null;
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

const FOOD_EFFECTS: Record<FoodMaterial, { hunger: number; health: number }> = {
  berries: { hunger: 8, health: 0 },
  mushrooms: { hunger: 12, health: 1 },
  meat: { hunger: 16, health: 2 },
  cookedMushrooms: { hunger: 24, health: 5 },
  cookedMeat: { hunger: 32, health: 8 },
};

function nearbyCompletedCampfire(game: GameState) {
  return game.buildings
    .filter(
      (building) =>
        building.kind === "campfire" &&
        building.realm === game.realm &&
        building.hp > 0 &&
        building.construction >= 1 &&
        distanceToBuilding(building, game.player.x, game.player.y) <= CAMPFIRE_COOK_DISTANCE,
    )
    .sort(
      (a, b) =>
        distanceToBuilding(a, game.player.x, game.player.y) -
        distanceToBuilding(b, game.player.x, game.player.y),
    )[0] ?? null;
}

function cookSelectedFood(game: GameState) {
  const rawFood = game.selected;
  const cookedFood = cookedFoodFor(rawFood);
  if (!cookedFood || game.resources[rawFood as RawCookableFood] <= 0 || !nearbyCompletedCampfire(game)) return false;

  const selectedStackWillEmpty = game.resources[rawFood as RawCookableFood] === 1;
  game.resources[rawFood as RawCookableFood] -= 1;
  removeDepletedMaterialStacks(game);
  addMaterial(game, cookedFood, 1);
  if (selectedStackWillEmpty) {
    const cookedSlot = game.hotbar.indexOf(cookedFood);
    if (cookedSlot >= 0) selectSlot(game, cookedSlot);
  }
  notify(game, "Cooked 1 " + itemLabel(rawFood) + " at the Campfire · " + itemLabel(cookedFood) + " ready.");
  return true;
}

function eatSelectedFood(game: GameState) {
  const food = consumeSelectedFood(game);
  if (!food) return false;

  const now = performance.now();
  const effect = FOOD_EFFECTS[food];
  game.player.hunger = Math.min(100, game.player.hunger + effect.hunger);
  game.player.hp = Math.min(game.player.maxHp, game.player.hp + effect.health);

  let sicknessPenalty = 0;
  if (food === "mushrooms" && Math.random() < RAW_MUSHROOM_SICKNESS_CHANCE) sicknessPenalty = 20;
  if (food === "meat" && Math.random() < RAW_MEAT_SICKNESS_CHANCE) sicknessPenalty = 28;
  if (sicknessPenalty > 0) game.player.hunger = Math.max(0, game.player.hunger - sicknessPenalty);

  const hallucinating = food === "mushrooms" && Math.random() < RAW_MUSHROOM_HALLUCINATION_CHANCE;
  if (hallucinating) game.hallucinatingUntil = now + HALLUCINATION_DURATION_MS;

  const healthMessage = effect.health > 0 ? " · +" + effect.health + " health" : "";
  const sicknessMessage = sicknessPenalty > 0 ? " · SICK! −" + sicknessPenalty + " hunger" : "";
  const hallucinationMessage = hallucinating ? " · HALLUCINATING" : "";
  notify(
    game,
    "Ate " + itemLabel(food) + " · +" + effect.hunger + " hunger" + healthMessage + sicknessMessage + hallucinationMessage,
    sicknessPenalty > 0 || hallucinating ? 4200 : 2300,
  );
  return true;
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
  const treasurePoint = caveEncounterPoint(treasureCave, treasureCave.chamberRadius * 0.48, -95);
  const broodMotherRoom = CAVE_ROOMS[Math.floor(Math.random() * CAVE_ROOMS.length)];
  const broodMotherPoint = { x: broodMotherRoom.x, y: broodMotherRoom.y };
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
        Math.hypot(x - broodMotherPoint.x, y - broodMotherPoint.y) > radius + 95 &&
        AETHER_SITES.every((site) => Math.hypot(x - site.guard.x, y - site.guard.y) > radius + 70));
    if (!clearSpawn || !clearExit || !clearCave || !clearWater || !insideCave || !clearCaveNode || !clearEncounter) return false;
    const hp = nodeHp(kind, size);
    nodes.push({ id: id++, kind, size, realm, x, y, hp, maxHp: hp, respawnAt: 0 });
    return true;
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
  const meadowOreKinds: ResourceKind[] = [
    "copperOre", "ironOre", "copperOre", "ironOre", "copperOre", "ironOre", "copperOre",
    "ironOre", "copperOre", "ironOre", "copperOre", "copperOre", "copperOre",
  ];
  meadowOreKinds.forEach((kind, oreIndex) => {
    for (let attempt = 0; attempt < 32; attempt++) {
      const sample = oreIndex * 32 + attempt;
      const size = depositSize(sample, 135);
      const placed = addNode(
        kind,
        "meadow",
        180 + seeded(sample, 131) * (WORLD_W - 360),
        180 + seeded(sample, 132) * (WORLD_H - 360),
        size,
      );
      if (placed) break;
    }
  });
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

  for (const site of AETHER_SITES) {
    addNode("aetherOre", "caveSystem", site.deposit.x, site.deposit.y, site.size);
  }

  for (const [caveIndex, cave] of CAVES.entries()) {
    for (let i = 0; i < 68; i++) {
      const roll = i % 24;
      let kind: ResourceKind;
      if (cave.id === "stone") {
        kind = roll === 1 ? "coal" : roll === 5 || roll === 17 ? "mushroom" : roll === 8 || roll === 20 ? "copperOre" : roll === 13 ? "ironOre" : "rock";
      } else if (cave.id === "iron") {
        kind = roll === 0 || roll === 12 ? "ironOre" : roll === 7 || roll === 19 ? "copperOre" : roll === 3 ? "coal" : "rock";
      } else {
        kind = roll === 0 || roll === 8 || roll === 16 ? "sulfur" : roll === 5 || roll === 15 ? "coal" : roll === 3 || roll === 19 ? "mushroom" : roll === 7 || roll === 11 ? "copperOre" : roll === 21 ? "ironOre" : "rock";
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

  for (const [roomIndex, room] of CAVE_ROOMS.entries()) {
    for (let i = 0; i < 12; i++) {
      const angle = seeded(i, 171 + roomIndex * 13) * Math.PI * 2;
      const distance = 90 + Math.sqrt(seeded(i, 172 + roomIndex * 13)) * (room.radius - 190);
      const kind: ResourceKind = i === 1 || i === 9 ? "ironOre" : i === 3 || i === 10 ? "copperOre" : i % 6 === 0 ? "mushroom" : i % 5 === 0 ? "coal" : "rock";
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
  const broodWebs: BroodWeb[] = Array.from({ length: 9 }, (_, index) => {
    const centered = index === 0;
    const angle = ((index - 1) / 8) * Math.PI * 2 + seeded(index, 701) * 0.24;
    const distance = centered ? 0 : 118 + (index % 2) * 54;
    return {
      id: id++,
      realm: "caveSystem",
      x: broodMotherPoint.x + Math.cos(angle) * distance,
      y: broodMotherPoint.y + Math.sin(angle) * distance,
      radius: centered ? 76 : 50 + (index % 3) * 7,
      expiresAt: 0,
    };
  });
  const creatures: Creature[] = [];
  const addMonster = (kind: MonsterKind, x: number, y: number, phase: number, boss = false) => {
    const stats = MONSTER_DATA[kind];
    const hp = boss ? 320 : stats.hp;
    const direction = Math.atan2(CAVE_HUB.y - y, CAVE_HUB.x - x);
    creatures.push({
      id: id++,
      kind,
      realm: "caveSystem",
      x,
      y,
      hp,
      maxHp: hp,
      speed: boss ? BOSS_SPEED : stats.speed,
      damage: boss ? 22 : stats.damage,
      fed: 0,
      maturesAt: 0,
      breedReadyAt: 0,
      angry: false,
      hitAt: 0,
      attackAt: 0,
      phase,
      slowUntil: 0,
      rewarded: false,
      dir: direction,
      structureHitAt: 0,
      rangedAt: boss ? -BOSS_RANGED_COOLDOWN_MS : 0,
      rangedChargeUntil: 0,
      rangedAim: direction,
      boss,
      homeX: x,
      homeY: y,
      provokedUntil: 0,
      waryOfPlayer: false,
      respawnAt: 0,
      fleeing: false,
      abilityReadyAt: 0,
      abilityStartedAt: 0,
      abilityTargetX: x,
      abilityTargetY: y,
    });
  };
  const addAnimal = (kind: AnimalKind, x: number, y: number, phase: number) => {
    const stats = ANIMAL_DATA[kind];
    creatures.push({ id: id++, kind, realm: "meadow", x, y, hp: stats.hp, maxHp: stats.hp, speed: stats.speed, damage: stats.damage, fed: 0, maturesAt: 0, breedReadyAt: 0, angry: false, hitAt: 0, attackAt: 0, phase, slowUntil: 0, rewarded: false, dir: phase, structureHitAt: 0, rangedAt: 0, rangedChargeUntil: 0, rangedAim: phase, boss: false, homeX: x, homeY: y, provokedUntil: 0, waryOfPlayer: false, respawnAt: 0, fleeing: false, abilityReadyAt: 0, abilityStartedAt: 0, abilityTargetX: x, abilityTargetY: y });
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
  AETHER_SITES.forEach((site, index) => {
    addMonster("aetherWarden", site.guard.x, site.guard.y, 31 + index * 1.7);
  });
  addMonster("maw", broodMotherPoint.x, broodMotherPoint.y, 19.7, true);
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
    mode: "survival",
    started: false,
    dead: false,
    paused: false,
    relaxing: false,
    pausedAt: 0,
    day: 1,
    clock: 0.16,
    wasNight: false,
    realm: "meadow",
    zoom: 1,
    player: { x: SPAWN_X, y: SPAWN_Y, hp: 100, maxHp: 100, hunger: 100, dir: 0, swing: 0, attackReady: 0, useReady: 0 },
    resources: { wood: 0, stone: 0, iron: 0, copper: 0, coal: 0, sulfur: 0, aetherium: 0, guardianCore: 0, mineralRock: 0, carapacePlate: 0, neuralGel: 0, livingWeave: 0, fiber: 0, berries: 3, meat: 0, mushrooms: 0, cookedMeat: 0, cookedMushrooms: 0, seeds: 0, hide: 0, biomass: 0, arrows: 0, bullets: 0 },
    gear: {
      spear: false,
      sword: false,
      tendrilBlade: false,
      bow: false,
      ironBow: false,
      pistol: false,
      smg: false,
      shotgun: false,
      rifle: false,
      sniper: false,
      chimera: false,
      hammer: false,
      toolDurability: {
        woodAxe: [DURABLE_TOOL_DATA.woodAxe.maxDurability],
        stoneAxe: [],
        ironAxe: [],
        aetheriumAxe: [],
        carapaceAxe: [],
        woodPickaxe: [],
        stonePickaxe: [],
        ironPickaxe: [],
        aetheriumPickaxe: [],
        spear: [],
        sword: [],
        tendrilBlade: [],
        bow: [],
        ironBow: [],
        pistol: [],
        smg: [],
        shotgun: [],
        rifle: [],
        sniper: [],
        chimera: [],
      },
      armor: "none",
    },
    kits: {
      craftingBench: 0,
      laboratory: 0,
      chemicalLab: 0,
      mineralGrower: 0,
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
    openLaboratoryId: null,
    research: { carapaceAxe: false, tendrilBlade: false, symbioteArmor: false, xenoBallistics: false },
    openGrowerId: null,
    workOrders: [],
    autoBuildActive: false,
    nodes,
    drops: [],
    treasures,
    creatures,
    buildings: [startingCampfire],
    projectiles: [],
    broodWebs,
    broodWebDamageAt: 0,
    attackFlash: null,
    keys: new Set(),
    mouseHeld: false,
    heldAction: null,
    bowChargeStartedAt: null,
    buildDrag: false,
    lastBuildCell: null,
    pointer: { x: 0, y: 0, worldX: 0, worldY: 0, active: false },
    camera: { x: SPAWN_X, y: SPAWN_Y },
    message: "Your Wood Axe is in slot 2 and a campfire is already lit. Gather before nightfall.",
    messageUntil: performance.now() + 6000,
    hallucinatingUntil: 0,
    wave: 0,
    dreadTitanSpawned: false,
    cavePopulationInitialized: false,
    nextCaveSpawnAt: 0,
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

function realmIsDark(game: GameState, realm: Realm) {
  return realm === "caveSystem" || (realm === "meadow" && isNight(game));
}

function playerVisionConeContains(game: GameState, realm: Realm, x: number, y: number, padding = 0) {
  if (realm !== game.realm) return false;
  const dx = x - game.player.x;
  const dy = y - game.player.y;
  const distance = Math.hypot(dx, dy);
  if (distance > PLAYER_VISION_CONE_RANGE[realm] + padding) return false;
  const angularPadding = padding > 0 && distance > padding
    ? Math.asin(Math.min(0.999, padding / distance))
    : distance <= padding
      ? Math.PI
      : 0;
  if (Math.abs(angleDifference(Math.atan2(dy, dx), game.player.dir)) > PLAYER_VISION_CONE_HALF_ANGLE + angularPadding) {
    return false;
  }
  return lightLineIsClear(game, realm, game.player.x, game.player.y, x, y);
}

function pointIsLit(game: GameState, realm: Realm, x: number, y: number, padding = 0) {
  if (
    realm === game.realm &&
    Math.hypot(x - game.player.x, y - game.player.y) <= PLAYER_LIGHT_RADIUS[realm] + padding &&
    lightLineIsClear(game, realm, game.player.x, game.player.y, x, y)
  ) return true;
  if (playerVisionConeContains(game, realm, x, y, padding)) return true;
  return game.buildings.some((building) => {
    if (building.realm !== realm) return false;
    const radius = buildingLightRadius(building);
    if (radius <= 0) return false;
    const center = buildingWorldCenter(building);
    return Math.hypot(x - center.x, y - center.y) <= radius + padding &&
      lightLineIsClear(game, realm, center.x, center.y, x, y);
  });
}

function monsterIsIlluminated(game: GameState, creature: Creature) {
  return creature.realm === game.realm &&
    realmIsDark(game, creature.realm) &&
    pointIsLit(game, creature.realm, creature.x, creature.y, Math.min(12, creatureRadius(creature) * 0.5));
}

function notify(game: GameState, message: string, duration = 2300) {
  game.message = message;
  game.messageUntil = performance.now() + duration;
}

function costLabel(cost: Partial<Record<Material, number>>) {
  return Object.entries(cost)
    .map(([key, value]) => String(value) + " " + (ITEM_LABELS[key as Material] ?? key))
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

function mineralGrowthSecondsRemaining(game: GameState, building: Building) {
  const now = game.paused ? game.pausedAt : performance.now();
  return Math.max(0, Math.ceil((building.triggerAt - now) / 1000));
}

function startMineralGrowth(game: GameState, buildingId: number | null, material: GrowableMineral) {
  const building = game.buildings.find(
    (candidate) => candidate.id === buildingId && candidate.kind === "mineralGrower" && candidate.construction >= 1,
  );
  if (!building || building.processMaterial) return "The Mineral Grower is unavailable or already running.";
  const recipe = MINERAL_GROWTH_RECIPES[material];
  if (!canAfford(game, recipe.cost)) return "This batch needs one mineral catalyst and enough Mineral-Rich Rock.";
  pay(game, recipe.cost);
  building.processMaterial = material;
  building.triggerAt = performance.now() + recipe.durationMs;
  return recipe.name + " batch loaded · return when growth is complete.";
}

function collectMineralGrowth(game: GameState, buildingId: number | null) {
  const building = game.buildings.find(
    (candidate) => candidate.id === buildingId && candidate.kind === "mineralGrower" && candidate.construction >= 1,
  );
  if (!building?.processMaterial) return "No completed Mineral Grower batch to collect.";
  const material = building.processMaterial;
  const recipe = MINERAL_GROWTH_RECIPES[material];
  if (mineralGrowthSecondsRemaining(game, building) > 0) return recipe.name + " is still growing.";
  addMaterial(game, material, recipe.output);
  building.processMaterial = undefined;
  building.triggerAt = 0;
  return "Collected " + recipe.output + " " + recipe.name + " from the Mineral Grower.";
}

function spawnMonstersInRealm(game: GameState, realm: Realm, count: number) {
  const roster = MONSTER_WAVE_ROSTERS[realm].filter(
    (kind) => MONSTER_DATA[kind].realm === realm && MONSTER_DATA[kind].earliestNight <= game.day,
  );
  if (roster.length === 0) return 0;
  const spawnBatchId = game.lastId;
  let spawned = 0;
  for (let i = 0; i < count; i++) {
    const kind = roster[i % roster.length];
    let spawnPoint: { x: number; y: number } | null = null;
    for (let attempt = 0; attempt < 160; attempt++) {
      const candidateIndex = spawnBatchId * 307 + i * 211 + attempt * 2;
      const candidateX = 70 + seeded(candidateIndex, game.day * 17 + 101) * (WORLD_W - 140);
      const candidateY = 70 + seeded(candidateIndex + 1, game.day * 19 + 103) * (WORLD_H - 140);
      if (realm === game.realm && Math.hypot(candidateX - game.player.x, candidateY - game.player.y) < 360) continue;
      if (realm === "caveSystem" && !isCaveFloor(candidateX, candidateY, 38)) continue;
      if (realm === "meadow" && inDeepWater(candidateX, candidateY, 30)) continue;
      if (pointIsLit(game, realm, candidateX, candidateY, MONSTER_SPAWN_LIGHT_PADDING)) continue;
      if (reservedBuildingAt(game, realm, candidateX, candidateY, 30)) continue;
      if (
        game.nodes.some(
          (node) =>
            node.realm === realm &&
            node.hp > 0 &&
            (isTree(node.kind) || isMineable(node.kind)) &&
            distanceToNodeFootprint(node, candidateX, candidateY, 20) === 0,
        )
      ) continue;
      if (
        game.creatures.some(
          (creature) =>
            creature.realm === realm &&
            creature.hp > 0 &&
            Math.hypot(creature.x - candidateX, creature.y - candidateY) < 72,
        )
      ) continue;
      spawnPoint = { x: candidateX, y: candidateY };
      break;
    }
    if (!spawnPoint) continue;
    const stats = MONSTER_DATA[kind];
    game.creatures.push({
      id: game.lastId++,
      kind,
      realm,
      x: spawnPoint.x,
      y: spawnPoint.y,
      hp: stats.hp,
      maxHp: stats.hp,
      speed: stats.speed,
      damage: stats.damage,
      fed: 0,
      maturesAt: 0,
      breedReadyAt: 0,
      angry: false,
      hitAt: 0,
      attackAt: 0,
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
      abilityReadyAt: 0,
      abilityStartedAt: 0,
      abilityTargetX: spawnPoint.x,
      abilityTargetY: spawnPoint.y,
    });
    spawned += 1;
  }
  return spawned;
}

function makeMonsterAt(
  game: GameState,
  kind: MonsterKind,
  realm: Realm,
  x: number,
  y: number,
  options: { boss?: boolean; angry?: boolean; hp?: number; speed?: number; damage?: number } = {},
) {
  const stats = MONSTER_DATA[kind];
  const now = performance.now();
  const direction = Math.atan2(game.player.y - y, game.player.x - x);
  const hp = options.hp ?? stats.hp;
  const creature: Creature = {
    id: game.lastId++,
    kind,
    realm,
    x,
    y,
    hp,
    maxHp: hp,
    speed: options.speed ?? stats.speed,
    damage: options.damage ?? stats.damage,
    fed: 0,
    maturesAt: 0,
    breedReadyAt: 0,
    angry: options.angry ?? false,
    hitAt: 0,
    attackAt: 0,
    phase: game.lastId * 0.73,
    slowUntil: 0,
    rewarded: false,
    dir: direction,
    structureHitAt: 0,
    rangedAt: now,
    rangedChargeUntil: 0,
    rangedAim: direction,
    boss: options.boss ?? false,
    homeX: x,
    homeY: y,
    provokedUntil: options.angry ? now + 15_000 : 0,
    waryOfPlayer: false,
    respawnAt: 0,
    fleeing: false,
    abilityReadyAt: now + 3200,
    abilityStartedAt: 0,
    abilityTargetX: x,
    abilityTargetY: y,
    summonReadyAt: now + 5200,
  };
  return creature;
}

function spawnDreadTitan(game: GameState) {
  if (game.dreadTitanSpawned || game.day < DREAD_TITAN_NIGHT) return false;
  const anchorX = game.realm === "meadow" ? game.player.x : SPAWN_X;
  const anchorY = game.realm === "meadow" ? game.player.y : SPAWN_Y;
  const candidate = makeMonsterAt(game, "dreadTitan", "meadow", anchorX, anchorY, {
    boss: true,
    angry: true,
    hp: MONSTER_DATA.dreadTitan.hp,
  });
  let placed = false;
  for (let attempt = 0; attempt < 96; attempt++) {
    const angle = seeded(game.lastId + attempt, 911) * Math.PI * 2;
    const distance = 760 + seeded(game.lastId + attempt, 912) * 260;
    const x = Math.max(DREAD_TITAN_RADIUS + 45, Math.min(WORLD_W - DREAD_TITAN_RADIUS - 45, anchorX + Math.cos(angle) * distance));
    const y = Math.max(DREAD_TITAN_RADIUS + 45, Math.min(WORLD_H - DREAD_TITAN_RADIUS - 45, anchorY + Math.sin(angle) * distance));
    if (!creaturePositionIsOpen(game, candidate, "meadow", x, y)) continue;
    if (pointIsLit(game, "meadow", x, y, MONSTER_SPAWN_LIGHT_PADDING)) continue;
    candidate.x = x;
    candidate.y = y;
    candidate.homeX = x;
    candidate.homeY = y;
    candidate.dir = Math.atan2(anchorY - y, anchorX - x);
    placed = true;
    break;
  }
  if (!placed) {
    candidate.x = Math.max(160, Math.min(WORLD_W - 160, anchorX + 820));
    candidate.y = Math.max(160, Math.min(WORLD_H - 160, anchorY));
  }
  game.creatures.push(candidate);
  game.dreadTitanSpawned = true;
  notify(game, "THE DREAD TITAN HAS RISEN — survive its stomps, shard storms, and summoned swarms!", 6200);
  return true;
}

function summonDreadTitanSwarm(game: GameState, titan: Creature, now: number) {
  const roster: MonsterKind[] = ["stalker", "crawler", "shade", "crawler", "stalker", "shade"];
  let summoned = 0;
  for (let index = 0; index < DREAD_TITAN_SWARM_SIZE; index++) {
    const kind = roster[index % roster.length];
    const angle = (index / DREAD_TITAN_SWARM_SIZE) * Math.PI * 2 + titan.phase;
    for (let attempt = 0; attempt < 8; attempt++) {
      const distance = 175 + attempt * 18 + (index % 2) * 34;
      const x = titan.x + Math.cos(angle + attempt * 0.23) * distance;
      const y = titan.y + Math.sin(angle + attempt * 0.23) * distance;
      const minion = makeMonsterAt(game, kind, titan.realm, x, y, { angry: true });
      if (!creaturePositionIsOpen(game, minion, titan.realm, x, y)) {
        game.lastId -= 1;
        continue;
      }
      minion.provokedUntil = now + 20_000;
      game.creatures.push(minion);
      summoned += 1;
      break;
    }
  }
  titan.summonReadyAt = now + DREAD_TITAN_SUMMON_COOLDOWN_MS;
  if (summoned > 0) notify(game, "The Dread Titan tears open the dark — " + summoned + " horrors join the hunt!", 1800);
}

function spawnNightWave(game: GameState) {
  game.wave = game.day;
  const meadowCount = 6 + game.day * 3;
  const caveCount = CAVE_NIGHT_BASE_REINFORCEMENTS + game.day * CAVE_NIGHT_REINFORCEMENTS_PER_DAY;
  const meadowSpawned = spawnMonstersInRealm(game, "meadow", meadowCount);
  const caveSpawned = spawnMonstersInRealm(game, "caveSystem", caveCount);
  notify(
    game,
    "NIGHT " + game.day + " — " + meadowSpawned + " horrors prowl the meadow and " + caveSpawned + " stalk the caves.",
    4300,
  );
  spawnDreadTitan(game);
}

function maintainCavePopulation(game: GameState, now: number) {
  const cavePopulation = game.creatures.filter(
    (creature) =>
      creature.realm === "caveSystem" &&
      creature.hp > 0 &&
      isMonster(creature.kind) &&
      !creature.boss,
  ).length;
  if (!game.cavePopulationInitialized) {
    spawnMonstersInRealm(game, "caveSystem", Math.max(0, CAVE_DAY_POPULATION - cavePopulation));
    game.cavePopulationInitialized = true;
    game.nextCaveSpawnAt = now + CAVE_DAY_REPLACEMENT_MS;
    return;
  }
  if (cavePopulation >= CAVE_DAY_POPULATION) return;
  if (cavePopulation > 0 && now < game.nextCaveSpawnAt) return;
  spawnMonstersInRealm(game, "caveSystem", 1);
  game.nextCaveSpawnAt = now + CAVE_DAY_REPLACEMENT_MS;
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

function activeBroodWebAt(game: GameState, x: number, y: number, now = performance.now()) {
  if (game.realm !== "caveSystem") return null;
  return game.broodWebs.find(
    (web) =>
      (web.expiresAt === 0 || web.expiresAt > now) &&
      Math.hypot(web.x - x, web.y - y) < web.radius,
  ) ?? null;
}

function playerMovementSpeed(game: GameState) {
  const heldItemFactor = game.bowChargeStartedAt !== null
    ? BOW_DRAW_SPEED_FACTOR
    : activeTool(game) === "hands"
      ? 1
      : HELD_ITEM_SPEED_FACTOR;
  const webFactor = activeBroodWebAt(game, game.player.x, game.player.y)
    ? BROOD_WEB_SPEED_FACTOR
    : 1;
  return PLAYER_BASE_SPEED * heldItemFactor * webFactor * groundSpeedFactor(game.realm, game.player.x, game.player.y);
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

function nearChemicalLab(game: GameState) {
  return game.buildings.some(
    (building) =>
      building.kind === "chemicalLab" &&
      building.realm === game.realm &&
      building.hp > 0 &&
      building.construction >= 1 &&
      distanceToBuilding(building, game.player.x, game.player.y) <= 150,
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
  if (item === "spear" || item === "sword" || item === "tendrilBlade" || item === "bow" || item === "ironBow" || isFirearm(item)) game.weapon = item;
}

function isBabyAnimal(creature: Creature, now = performance.now()) {
  return isAnimal(creature.kind) && creature.maturesAt > now;
}

function nearestFeedableAnimal(game: GameState) {
  const now = performance.now();
  const feedPriority = (creature: Creature) => {
    if (!isAnimal(creature.kind)) return 4;
    if (isPermanentlyWaryPrey(creature.kind) && creature.waryOfPlayer) return 3;
    if (creature.breedReadyAt > now) return 2;
    return creature.fed < ANIMAL_FEEDS_TO_BREED ? 0 : 1;
  };
  return game.creatures
    .filter(
      (creature) =>
        creature.realm === game.realm &&
        creature.hp > 0 &&
        isAnimal(creature.kind) &&
        !isBabyAnimal(creature) &&
        (
          Math.hypot(creature.x - game.player.x, creature.y - game.player.y) <= 92 ||
          (
            isHoldingAnimalLure(game, creature.kind) &&
            Math.hypot(creature.x - game.player.x, creature.y - game.player.y) <= ANIMAL_FEED_DISTANCE
          )
        ),
    )
    .sort(
      (a, b) => {
        const priority = feedPriority(a) - feedPriority(b);
        if (priority !== 0) return priority;
        return Math.hypot(a.x - game.player.x, a.y - game.player.y) -
          Math.hypot(b.x - game.player.x, b.y - game.player.y);
      },
    )[0] || null;
}

function babyAnimalCount(game: GameState) {
  const now = performance.now();
  return game.creatures.filter(
    (creature) => creature.hp > 0 && isBabyAnimal(creature, now),
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
  const now = performance.now();
  const collected = game.drops.filter(
    (drop) =>
      now >= drop.collectibleAt &&
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

function angleDifference(angle: number, reference: number) {
  let difference = angle - reference;
  while (difference > Math.PI) difference -= Math.PI * 2;
  while (difference < -Math.PI) difference += Math.PI * 2;
  return difference;
}

function targetAxeSwingNode(game: GameState, profile: AttackProfile) {
  return game.nodes
    .filter((node) => {
      if (node.realm !== game.realm || node.hp <= 0 || isMineable(node.kind)) return false;
      const dx = node.x - game.player.x;
      const dy = node.y - game.player.y;
      const centerDistance = Math.hypot(dx, dy);
      const radius = nodeRadius(node.kind, node.size);
      if (Math.max(0, centerDistance - radius) > RESOURCE_USE_RANGE) return false;
      const forwardProjection = dx * Math.cos(game.player.dir) + dy * Math.sin(game.player.dir);
      if (forwardProjection + radius <= 0) return false;
      const angularRadius = centerDistance <= radius
        ? Math.PI
        : Math.asin(Math.min(1, radius / centerDistance));
      return Math.abs(angleDifference(Math.atan2(dy, dx), game.player.dir)) <= profile.arc + angularRadius;
    })
    .sort((a, b) => {
      const distanceA = distanceToNodeFootprint(a, game.player.x, game.player.y);
      const distanceB = distanceToNodeFootprint(b, game.player.x, game.player.y);
      if (distanceA !== distanceB) return distanceA - distanceB;
      const angleA = Math.abs(angleDifference(Math.atan2(a.y - game.player.y, a.x - game.player.x), game.player.dir));
      const angleB = Math.abs(angleDifference(Math.atan2(b.y - game.player.y, b.x - game.player.x), game.player.dir));
      return angleA - angleB;
    })[0] ?? null;
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

function blockingNodeAt(game: GameState, realm: Realm, x: number, y: number, radius: number) {
  return game.nodes.find(
    (node) =>
      node.realm === realm &&
      node.hp > 0 &&
      (isTree(node.kind) || isMineable(node.kind)) &&
      Math.hypot(node.x - x, node.y - y) < nodeRadius(node.kind, node.size) + radius,
  ) || null;
}

function creaturePositionIsOpen(game: GameState, creature: Creature, realm: Realm, x: number, y: number) {
  if (isAnimal(creature.kind) && ANIMAL_DATA[creature.kind].flying) return true;
  const radius = creatureRadius(creature);
  if (realm === "caveSystem" && !isCaveFloor(x, y, radius + 4)) return false;
  if (realm === "meadow" && inDeepWater(x, y, radius)) return false;
  return !blockingBuildingAt(game, realm, x, y, radius) && !blockingNodeAt(game, realm, x, y, radius);
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
  if (isDreadTitan(creature)) return DREAD_TITAN_RADIUS;
  if (isBroodMother(creature)) return 49;
  const radius = creature.kind === "stalker"
    ? 13
    : creature.kind === "maw" || creature.kind === "bear" || creature.kind === "brute" || creature.kind === "aetherWarden"
      ? 27
      : creature.kind === "rabbit"
        ? 14
        : creature.kind === "crow"
          ? 13
          : creature.kind === "owl"
            ? 17
            : creature.kind === "turkey"
              ? 22
              : 20;
  return isBabyAnimal(creature) ? radius * 0.58 : radius;
}

function creatureAttackReach(creature: Creature) {
  if (isMonster(creature.kind)) {
    return MONSTER_DATA[creature.kind].attackReach + (isBroodMother(creature) ? BOSS_ATTACK_REACH_BONUS : 0);
  }
  return creatureRadius(creature) + 24;
}

function bowChargeRatio(game: GameState, now = performance.now()) {
  if (game.bowChargeStartedAt === null) return 0;
  return Math.max(0, Math.min(1, (now - game.bowChargeStartedAt) / BOW_MAX_CHARGE_MS));
}

function beginBowCharge(game: GameState) {
  const now = performance.now();
  const tool = activeTool(game);
  if (!isBowTool(tool) || game.dead || !game.started || game.relaxing) return;
  if (now < game.player.attackReady) return;
  game.heldAction = { kind: "bow" };
  if (game.resources.arrows <= 0) {
    notify(game, "Out of arrows. Craft more ammunition.", 1000);
    game.player.attackReady = now + 500;
    return;
  }
  game.bowChargeStartedAt = now;
}

function releasePrimaryInput(game: GameState, fireChargedBow = false) {
  const chargedBow = game.bowChargeStartedAt !== null && isBowTool(activeTool(game));
  const charge = bowChargeRatio(game);
  game.mouseHeld = false;
  game.heldAction = null;
  game.bowChargeStartedAt = null;
  game.buildDrag = false;
  game.lastBuildCell = null;
  if (fireChargedBow && chargedBow) attack(game, charge);
}

function resetTransientInput(game: GameState) {
  releasePrimaryInput(game);
  game.keys.clear();
}

function setGamePaused(game: GameState, paused: boolean, now = performance.now()) {
  if (paused === game.paused) return;
  if (paused) {
    game.paused = true;
    game.pausedAt = now;
    resetTransientInput(game);
    return;
  }

  const pausedAt = game.pausedAt;
  const pauseDuration = Math.max(0, now - pausedAt);
  const shiftDeadline = (value: number) => value > pausedAt ? value + pauseDuration : value;
  const shiftTimestamp = (value: number) => value > 0 ? value + pauseDuration : value;

  game.player.attackReady = shiftDeadline(game.player.attackReady);
  game.player.useReady = shiftDeadline(game.player.useReady);
  game.messageUntil = shiftDeadline(game.messageUntil);
  game.hallucinatingUntil = shiftDeadline(game.hallucinatingUntil);
  game.nextCaveSpawnAt = shiftDeadline(game.nextCaveSpawnAt);
  game.broodWebDamageAt = shiftDeadline(game.broodWebDamageAt);
  game.nodes.forEach((node) => {
    node.respawnAt = shiftDeadline(node.respawnAt);
  });
  game.creatures.forEach((creature) => {
    creature.hitAt = shiftTimestamp(creature.hitAt);
    creature.attackAt = shiftTimestamp(creature.attackAt);
    creature.structureHitAt = shiftTimestamp(creature.structureHitAt);
    creature.rangedAt = shiftTimestamp(creature.rangedAt);
    creature.rangedChargeUntil = shiftDeadline(creature.rangedChargeUntil);
    creature.slowUntil = shiftDeadline(creature.slowUntil);
    creature.provokedUntil = shiftDeadline(creature.provokedUntil);
    creature.respawnAt = shiftDeadline(creature.respawnAt);
    creature.maturesAt = shiftDeadline(creature.maturesAt);
    creature.breedReadyAt = shiftDeadline(creature.breedReadyAt);
    creature.abilityReadyAt = shiftDeadline(creature.abilityReadyAt);
    creature.abilityStartedAt = shiftTimestamp(creature.abilityStartedAt);
    if (creature.summonReadyAt !== undefined) creature.summonReadyAt = shiftDeadline(creature.summonReadyAt);
  });
  game.drops.forEach((drop) => {
    drop.collectibleAt = shiftDeadline(drop.collectibleAt);
  });
  game.buildings.forEach((building) => {
    building.triggerAt = shiftDeadline(building.triggerAt);
  });
  game.broodWebs.forEach((web) => {
    web.expiresAt = shiftDeadline(web.expiresAt);
  });
  if (game.attackFlash) game.attackFlash.startedAt = shiftTimestamp(game.attackFlash.startedAt);
  game.paused = false;
  game.pausedAt = 0;
}

function setGameRelaxing(game: GameState, relaxing: boolean) {
  if (game.relaxing === relaxing) return;
  game.relaxing = relaxing;
  resetTransientInput(game);
  game.autoBuildActive = false;
  if (relaxing) {
    notify(game, "Sitting down · day-night time and hunger are moving at 5× speed.", 3200);
  } else {
    notify(game, "Back on your feet · time and hunger returned to normal.", 2200);
  }
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
  const infiniteBuildPieces = game.mode === "custom";
  const cell = previewCell(game);
  if (!validPlacement(game, kind, cell.gx, cell.gy)) {
    if (!quiet) notify(game, "That grid space is blocked or too far away.");
    return false;
  }
  if (!infiniteBuildPieces && game.kits[kind] <= 0) {
    if (!quiet) notify(game, "Craft another " + BUILD_DATA[kind].name + " first.");
    return false;
  }
  if (!infiniteBuildPieces) game.kits[kind] -= 1;
  const instantPlacement = kind === "torch";
  const building: Building = {
    id: game.lastId++,
    kind,
    realm: game.realm,
    gx: cell.gx,
    gy: cell.gy,
    hp: instantPlacement ? BUILD_DATA[kind].hp : Math.max(1, Math.ceil(BUILD_DATA[kind].hp * 0.15)),
    maxHp: BUILD_DATA[kind].hp,
    open: false,
    growth: 0,
    triggerAt: 0,
    construction: instantPlacement ? 1 : 0,
    deconstruction: 0,
    restedDay: 0,
    storage: kind === "storageChest" ? {} : undefined,
  };
  game.buildings.push(building);
  if (!instantPlacement) game.workOrders.push({ buildingId: building.id, action: "construct", progress: 0 });
  if (!quiet) {
    notify(
      game,
      instantPlacement
        ? BUILD_DATA[kind].name + " placed and lit."
        : BUILD_DATA[kind].name + " blueprint placed. Press B to auto-build nearby.",
    );
  }
  if (!keepPlacing || (!infiniteBuildPieces && game.kits[kind] <= 0)) cancelBuildMode(game);
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

function animalName(kind: AnimalKind) {
  return kind === "turkey" ? "wild turkey" : kind;
}

function spawnBabyAnimal(game: GameState, parent: Creature, mate: Creature, now: number) {
  if (!isAnimal(parent.kind) || parent.kind !== mate.kind) return null;
  const stats = ANIMAL_DATA[parent.kind];
  const babyId = game.lastId;
  const centerX = (parent.x + mate.x) / 2;
  const centerY = (parent.y + mate.y) / 2;
  const baby: Creature = {
    id: babyId,
    kind: parent.kind,
    realm: parent.realm,
    x: centerX,
    y: centerY,
    hp: Math.max(1, Math.ceil(stats.hp * 0.6)),
    maxHp: Math.max(1, Math.ceil(stats.hp * 0.6)),
    speed: stats.speed,
    damage: stats.damage,
    fed: 0,
    maturesAt: now + ANIMAL_BABY_DURATION_MS,
    breedReadyAt: now + ANIMAL_BABY_DURATION_MS,
    angry: false,
    hitAt: 0,
    attackAt: 0,
    phase: babyId * 0.73,
    slowUntil: 0,
    rewarded: false,
    dir: parent.dir,
    structureHitAt: 0,
    rangedAt: 0,
    rangedChargeUntil: 0,
    rangedAim: parent.dir,
    boss: false,
    homeX: centerX,
    homeY: centerY,
    provokedUntil: 0,
    waryOfPlayer: false,
    respawnAt: 0,
    fleeing: false,
    abilityReadyAt: 0,
    abilityStartedAt: 0,
    abilityTargetX: centerX,
    abilityTargetY: centerY,
  };
  for (let attempt = 0; attempt < 12; attempt++) {
    const angle = parent.phase + attempt * (Math.PI * 2 / 12);
    const distance = attempt === 0 ? 0 : 28 + (attempt % 3) * 16;
    const candidateX = Math.max(35, Math.min(WORLD_W - 35, centerX + Math.cos(angle) * distance));
    const candidateY = Math.max(35, Math.min(WORLD_H - 35, centerY + Math.sin(angle) * distance));
    if (!creaturePositionIsOpen(game, baby, baby.realm, candidateX, candidateY)) continue;
    baby.x = candidateX;
    baby.y = candidateY;
    baby.homeX = candidateX;
    baby.homeY = candidateY;
    game.creatures.push(baby);
    game.lastId += 1;
    return baby;
  }
  return null;
}

function feedAnimal(game: GameState) {
  if (game.paused || game.relaxing || game.dead || !game.started) return;
  const now = performance.now();
  const creature = nearestFeedableAnimal(game);
  if (!creature || !isAnimal(creature.kind)) {
    const nearbyBaby = game.creatures.find(
      (candidate) =>
        candidate.realm === game.realm &&
        candidate.hp > 0 &&
        isBabyAnimal(candidate, now) &&
        Math.hypot(candidate.x - game.player.x, candidate.y - game.player.y) <= ANIMAL_FEED_DISTANCE,
    );
    notify(game, nearbyBaby ? "That baby is too young to feed." : "No adult animal is close enough to feed.", 1400);
    return;
  }
  if (isPermanentlyWaryPrey(creature.kind) && creature.waryOfPlayer) {
    notify(game, "This " + animalName(creature.kind) + " no longer trusts you and refuses food.");
    return;
  }
  if (creature.breedReadyAt > now) {
    notify(game, "This " + animalName(creature.kind) + " needs more time before breeding again.", 1500);
    return;
  }
  const food = animalLureFood(creature.kind);
  if (!isHoldingAnimalLure(game, creature.kind)) {
    notify(game, "Select " + food + ", then press F to feed this " + animalName(creature.kind) + ".");
    return;
  }
  const alreadyFullyFed = creature.fed >= ANIMAL_FEEDS_TO_BREED;
  if (!alreadyFullyFed) {
    consumeSelectedFood(game);
    creature.fed = Math.min(ANIMAL_FEEDS_TO_BREED, creature.fed + 1);
  }
  creature.angry = false;
  creature.provokedUntil = 0;

  const mate = creature.fed >= ANIMAL_FEEDS_TO_BREED
    ? game.creatures
      .filter(
        (candidate) =>
          candidate.id !== creature.id &&
          candidate.kind === creature.kind &&
          candidate.realm === creature.realm &&
          candidate.hp > 0 &&
          !isBabyAnimal(candidate, now) &&
          candidate.fed >= ANIMAL_FEEDS_TO_BREED &&
          candidate.breedReadyAt <= now &&
          Math.hypot(candidate.x - creature.x, candidate.y - creature.y) <= ANIMAL_BREED_PAIR_DISTANCE,
      )
      .sort(
        (a, b) =>
          Math.hypot(a.x - creature.x, a.y - creature.y) -
          Math.hypot(b.x - creature.x, b.y - creature.y),
      )[0]
    : null;

  if (mate) {
    const baby = spawnBabyAnimal(game, creature, mate, now);
    if (!baby) {
      notify(game, "The pair needs a little more open space for a baby.", 1800);
      return;
    }
    creature.fed = 0;
    mate.fed = 0;
    creature.breedReadyAt = now + ANIMAL_BREED_COOLDOWN_MS;
    mate.breedReadyAt = now + ANIMAL_BREED_COOLDOWN_MS;
    notify(game, "A baby " + animalName(creature.kind) + " was born!", 3200);
    return;
  }

  if (alreadyFullyFed) {
    notify(game, "This " + animalName(creature.kind) + " is fully fed and waiting for a nearby partner.", 1800);
    return;
  }

  notify(
    game,
    "Fed the " + animalName(creature.kind) + " · " + creature.fed + "/" + ANIMAL_FEEDS_TO_BREED +
      ". Feed two nearby adults three times each to breed.",
    2400,
  );
}

function buildingInteractionDistance(building: Building) {
  if (building.kind === "chemicalLab") return 150;
  if (building.kind === "mineralGrower") return 72;
  return 58;
}

function interact(game: GameState): "openCrafting" | undefined {
  if (game.relaxing) return;
  if (game.buildMode) {
    placeBuild(game, false, game.keys.has("shift"));
    return;
  }
  if (cookSelectedFood(game)) return;
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
    if (building.kind !== "woodGate" && building.kind !== "stoneGate" && building.kind !== "door" && building.kind !== "crop" && building.kind !== "storageChest" && building.kind !== "bedroll" && building.kind !== "laboratory" && building.kind !== "chemicalLab" && building.kind !== "mineralGrower") return false;
    return distanceToBuilding(building, game.player.x, game.player.y) <= buildingInteractionDistance(building);
  });
  if (nearbyBuilding) {
    if (nearbyBuilding.kind === "storageChest") {
      game.openGrowerId = null;
      game.openLaboratoryId = null;
      game.openChestId = nearbyBuilding.id;
      notify(game, "Storage Chest opened. Stored materials are unavailable for crafting until removed.");
    } else if (nearbyBuilding.kind === "laboratory") {
      game.openChestId = null;
      game.openGrowerId = null;
      game.openLaboratoryId = nearbyBuilding.id;
      notify(game, "Laboratory online. Spend Alien Biomass to research new blueprints.");
    } else if (nearbyBuilding.kind === "chemicalLab") {
      game.openChestId = null;
      game.openLaboratoryId = null;
      game.openGrowerId = null;
      notify(game, "Chemical Lab online. Bullets and the Mineral Grower are available in Crafting.");
      return "openCrafting";
    } else if (nearbyBuilding.kind === "mineralGrower") {
      game.openChestId = null;
      game.openLaboratoryId = null;
      game.openGrowerId = nearbyBuilding.id;
      notify(game, nearbyBuilding.processMaterial ? "Mineral Grower batch status opened." : "Mineral Grower ready for a seed batch.");
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
  if (isFoodItem(game.selected) && game.resources[game.selected] > 0) {
    eatSelectedFood(game);
    return;
  }
  notify(game, "Nothing close enough to interact with.");
}

const TOOL_TIER_RANK: Record<ToolTier, number> = { none: 0, wood: 1, stone: 2, iron: 3, aetherium: 4, biomass: 5 };
const TOOL_POWER: Record<ToolTier, number> = { none: 0.5, wood: 1, stone: 2, iron: 3, aetherium: 5, biomass: 6 };

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
  if (node.kind === "rock") {
    const richRockRoll = seeded(node.id, 947);
    const richRockAmount = richRockRoll < 0.08 ? 2 : richRockRoll < 0.35 ? 1 : 0;
    return richRockAmount > 0
      ? [["stone", node.maxHp], ["mineralRock", richRockAmount]]
      : [["stone", node.maxHp]];
  }
  if (node.kind === "ironOre") return [["iron", node.maxHp]];
  if (node.kind === "copperOre") return [["copper", node.maxHp]];
  if (node.kind === "coal") return [["coal", node.maxHp]];
  if (node.kind === "sulfur") return [["sulfur", node.maxHp]];
  if (node.kind === "aetherOre") return [["aetherium", node.maxHp]];
  if (node.kind === "berryBush") return [["berries", 3], ["seeds", 1]];
  if (node.kind === "grass") return Math.random() < 0.1 ? [["fiber", 2], ["seeds", 1]] : [["fiber", 2]];
  return [["mushrooms", 2]];
}

function scatterGroundDrops(
  game: GameState,
  realm: Realm,
  x: number,
  y: number,
  loot: [Material, number][],
  seed: number,
  collectionDelayMs: number,
) {
  loot.forEach(([material, amount], index) => {
    if (amount <= 0) return;
    const angle = seeded(seed + index, 811) * Math.PI * 2;
    const distance = 18 + index * 9;
    game.drops.push({
      id: game.lastId++,
      material,
      amount,
      realm,
      x: Math.max(24, Math.min(WORLD_W - 24, x + Math.cos(angle) * distance)),
      y: Math.max(24, Math.min(WORLD_H - 24, y + Math.sin(angle) * distance)),
      collectibleAt: performance.now() + collectionDelayMs,
    });
  });
}

function dropNodeLoot(game: GameState, node: ResourceNode) {
  const loot = resourceNodeLoot(node).filter(([, amount]) => amount > 0);
  scatterGroundDrops(game, node.realm, node.x, node.y, loot, node.id, 0);
  return loot.reduce((total, [, amount]) => total + amount, 0);
}

function damageResourceNode(game: GameState, node: ResourceNode, power: number, now: number) {
  node.hp = Math.max(0, node.hp - power);
  if (node.hp <= 0) {
    node.respawnAt = now + respawnDelayMs(RESOURCE_RESPAWN_DAYS[node.kind]);
    const dropCount = dropNodeLoot(game, node);
    return [resourceNodeLabel(node.kind) + " depleted · " + dropCount + " items dropped. Walk over them to collect"];
  }
  return [resourceNodeLabel(node.kind) + " damaged"];
}

function harvestNode(game: GameState, node: ResourceNode) {
  const now = performance.now();
  if (now < game.player.useReady || now < game.player.attackReady || game.dead || !game.started || game.relaxing) return;
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
  game.player.swing = tree || mining ? profile.animationSeconds : 0;
  game.player.attackReady = now + profile.cooldown;
  const feedback = damageResourceNode(game, node, power, now);
  if ((tree || mining) && isDurableTool(game.selected)) {
    const usedTool = game.selected;
    const wear = wearTool(game, usedTool);
    feedback.push(toolWearMessage(usedTool, wear));
  }
  notify(game, feedback.join(" · "), node.hp <= 0 ? 2200 : 900);
}

function attack(game: GameState, bowCharge = 0) {
  const now = performance.now();
  if (now < game.player.attackReady || game.dead || !game.started || game.relaxing) return;
  const tool = activeTool(game);
  const profile = attackProfile(tool);
  const isBow = isBowTool(tool);
  const isGun = isFirearm(tool);
  if (isBow || isGun) {
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
      duration: isGun ? 120 : 155,
    };
    const charge = isBow ? Math.max(0, Math.min(1, bowCharge)) : 0;
    const baseSpeed = tool === "ironBow"
      ? 720
      : tool === "bow"
        ? 620
        : tool === "chimera"
          ? 980
        : tool === "sniper"
          ? 1900
          : tool === "rifle"
            ? 1450
            : tool === "smg"
              ? 1260
              : tool === "shotgun"
                ? 980
                : 1120;
    const speed = isBow ? baseSpeed * (0.9 + charge * 0.15) : baseSpeed;
    const damage = isBow
      ? Math.round(profile.damage * (1 + charge * BOW_MAX_DAMAGE_BONUS))
      : profile.damage;
    const muzzleDistance = tool === "sniper" ? 79 : tool === "chimera" ? 74 : tool === "rifle" ? 68 : tool === "smg" || tool === "shotgun" ? 55 : 34;
    const shotAngles = tool === "shotgun" ? [-0.18, -0.09, 0, 0.09, 0.18] : [0];
    shotAngles.forEach((spread) => {
      const direction = game.player.dir + spread;
      game.projectiles.push({
        id: game.lastId++,
        kind: isBow ? "arrow" : "bullet",
        realm: game.realm,
        x: game.player.x + Math.cos(direction) * muzzleDistance,
        y: game.player.y + Math.sin(direction) * muzzleDistance,
        vx: Math.cos(direction) * speed,
        vy: Math.sin(direction) * speed,
        life: isBow ? (tool === "ironBow" ? 0.84 : 0.9) : profile.range / speed,
        damage,
        bulletStyle: tool === "shotgun" ? "pellet" : tool === "sniper" ? "sniper" : tool === "chimera" ? "chimera" : "standard",
      });
    });
    if (isDurableTool(tool)) {
      const wear = wearTool(game, tool);
      if (wear.broke) notify(game, toolWearMessage(tool, wear), 2400);
    }
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
  let hitCreature = false;
  for (const creature of game.creatures) {
    if (creature.realm !== game.realm || creature.hp <= 0) continue;
    const dx = creature.x - game.player.x;
    const dy = creature.y - game.player.y;
    const distance = Math.hypot(dx, dy);
    const angle = angleDifference(Math.atan2(dy, dx), game.player.dir);
    if (distance < profile.range + Math.max(0, creatureRadius(creature) - 20) && Math.abs(angle) < profile.arc) {
      creature.hp -= profile.damage;
      creature.angry = true;
      creature.provokedUntil = now + 5000;
      makePreyPermanentlyWary(creature);
      moveCreatureWithBuildings(
        game,
        creature,
        Math.cos(game.player.dir),
        Math.sin(game.player.dir),
        1,
        22,
      );
      hitCreature = true;
      if (creature.hp <= 0) {
        awardCreatureDrop(game, creature);
      }
    }
  }

  const toolInfo = durableToolInfo(tool);
  const swingNode = toolInfo?.family === "axe" ? targetAxeSwingNode(game, profile) : null;
  const resourceFeedback = swingNode && toolInfo
    ? damageResourceNode(game, swingNode, TOOL_POWER[toolInfo.tier], now)
    : [];
  const feedback = hitCreature ? [profile.damage + " creature damage", ...resourceFeedback] : resourceFeedback;
  const wearsTool = hitCreature || Boolean(swingNode && isTree(swingNode.kind));
  if (wearsTool && isDurableTool(tool)) {
    const wear = wearTool(game, tool);
    feedback.push(toolWearMessage(tool, wear));
  }
  if (feedback.length > 0) notify(game, feedback.join(" · "), swingNode?.hp === 0 ? 2200 : 1000);
}

function awardCreatureDrop(game: GameState, creature: Creature) {
  if (creature.rewarded) return;
  creature.rewarded = true;
  game.kills += 1;
  if (isAnimal(creature.kind)) {
    const animal = ANIMAL_DATA[creature.kind];
    creature.respawnAt = performance.now() + respawnDelayMs(ANIMAL_RESPAWN_DAYS);
    const loot: [Material, number][] = [["meat", animal.meatDrop]];
    if (animal.hideDrop > 0) loot.push(["hide", animal.hideDrop]);
    scatterGroundDrops(
      game,
      creature.realm,
      creature.x,
      creature.y,
      loot,
      creature.id * 17,
      CREATURE_DROP_COLLECTION_DELAY_MS,
    );
    notify(
      game,
      animalName(creature.kind) + " dropped " +
        loot.map(([material, amount]) => amount + " " + material).join(" · ") +
        ". Walk over the piles to collect them.",
      2400,
    );
    return;
  }
  if (!isMonster(creature.kind)) return;

  const dropData = MONSTER_LOOT[creature.kind];
  const loot: [Material, number][] = [["hide", dropData.hide]];
  if (Math.random() < dropData.meatChance) loot.push(["meat", dropData.meat]);
  if (Math.random() < dropData.biomassChance) loot.push(["biomass", dropData.biomass]);
  if (dropData.minerals && !isBroodMother(creature)) loot.push(...dropData.minerals);
  if (isBroodMother(creature)) {
    addMaterial(game, "guardianCore", 1);
    game.projectiles = game.projectiles.filter((projectile) => projectile.kind !== "broodWeb");
  } else if (isDreadTitan(creature)) {
    game.projectiles = game.projectiles.filter((projectile) => projectile.kind !== "titanShard");
  }
  scatterGroundDrops(
    game,
    creature.realm,
    creature.x,
    creature.y,
    loot,
    creature.id * 17,
    CREATURE_DROP_COLLECTION_DELAY_MS,
  );
  notify(
    game,
    (isBroodMother(creature)
      ? "Brood Mother defeated · Guardian Core recovered · Assault Rifle recipe unlocked · dropped "
      : isDreadTitan(creature)
        ? "Dread Titan defeated · the endless nights continue · dropped "
      : creature.kind[0].toUpperCase() + creature.kind.slice(1) + " dropped ") +
      loot.map(([material, amount]) => amount + " " + itemLabel(material)).join(" · ") +
      ". Walk over the piles to collect them.",
    creature.boss ? 4800 : 3000,
  );
}

function damagePlayer(game: GameState, damage: number, source = "") {
  const armorReduction = game.gear.armor === "symbiote" ? 0.68 : game.gear.armor === "blacksteel" ? 0.55 : game.gear.armor === "iron" ? 0.35 : game.gear.armor === "copper" ? 0.18 : 0;
  const received = damage * (1 - armorReduction);
  game.player.hp -= received;
  notify(game, source ? source + " · " + Math.round(received) + " damage!" : "You took " + Math.round(received) + " damage!", 1100);
}

function createBroodWeb(game: GameState, x: number, y: number) {
  if (!isCaveFloor(x, y, 8)) return;
  game.broodWebs.push({
    id: game.lastId++,
    realm: "caveSystem",
    x,
    y,
    radius: BROOD_WEB_RADIUS,
    expiresAt: performance.now() + BROOD_WEB_DURATION_MS,
  });
}

function detonateChimeraShot(game: GameState, projectile: Projectile) {
  for (const creature of game.creatures) {
    if (
      creature.realm !== projectile.realm ||
      creature.hp <= 0 ||
      Math.hypot(creature.x - projectile.x, creature.y - projectile.y) > CHIMERA_BURST_RADIUS + creatureRadius(creature)
    ) continue;
    creature.hp -= CHIMERA_BURST_DAMAGE;
    creature.angry = true;
    creature.provokedUntil = performance.now() + 5000;
    makePreyPermanentlyWary(creature);
    if (creature.hp <= 0) awardCreatureDrop(game, creature);
  }
}

function updateProjectiles(game: GameState, dt: number) {
  for (const projectile of game.projectiles) {
    const previousX = projectile.x;
    const previousY = projectile.y;
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.life -= dt;
    if (projectile.realm === "caveSystem" && !isCaveFloor(projectile.x, projectile.y, 5)) {
      if (projectile.kind === "broodWeb") createBroodWeb(game, previousX, previousY);
      if (projectile.bulletStyle === "chimera") {
        projectile.x = previousX;
        projectile.y = previousY;
        detonateChimeraShot(game, projectile);
      }
      projectile.life = 0;
      continue;
    }
    if (projectile.kind === "titanShard") {
      const blocker = blockingBuildingAt(game, projectile.realm, projectile.x, projectile.y, 12);
      if (blocker) {
        blocker.hp -= projectile.damage;
        projectile.life = 0;
        continue;
      }
      if (
        projectile.realm === game.realm &&
        game.player.hp > 0 &&
        Math.hypot(game.player.x - projectile.x, game.player.y - projectile.y) < 30
      ) {
        damagePlayer(game, projectile.damage, "Void shard hit");
        projectile.life = 0;
        continue;
      }
      if (
        projectile.life <= 0 ||
        projectile.x < 0 ||
        projectile.y < 0 ||
        projectile.x > WORLD_W ||
        projectile.y > WORLD_H
      ) projectile.life = 0;
      continue;
    }
    if (projectile.kind === "broodWeb") {
      const blocker = blockingBuildingAt(game, projectile.realm, projectile.x, projectile.y, 10);
      if (blocker) {
        createBroodWeb(game, previousX, previousY);
        projectile.life = 0;
        continue;
      }
      if (
        projectile.realm === game.realm &&
        game.player.hp > 0 &&
        Math.hypot(game.player.x - projectile.x, game.player.y - projectile.y) < 32
      ) {
        damagePlayer(game, projectile.damage, "Brood web hit");
        createBroodWeb(game, projectile.x, projectile.y);
        projectile.life = 0;
        continue;
      }
      if (
        projectile.life <= 0 ||
        projectile.x < 0 ||
        projectile.y < 0 ||
        projectile.x > WORLD_W ||
        projectile.y > WORLD_H
      ) {
        createBroodWeb(game, projectile.x, projectile.y);
        projectile.life = 0;
      }
      continue;
    }
    if (projectile.life <= 0) {
      if (projectile.bulletStyle === "chimera") detonateChimeraShot(game, projectile);
      continue;
    }
    const target = game.creatures.find(
      (creature) =>
        creature.realm === projectile.realm &&
        creature.hp > 0 &&
        Math.hypot(creature.x - projectile.x, creature.y - projectile.y) < creatureRadius(creature) + 11,
    );
    if (target) {
      target.hp -= projectile.damage;
      target.angry = true;
      target.provokedUntil = performance.now() + 5000;
      makePreyPermanentlyWary(target);
      const killedByImpact = target.hp <= 0;
      if (projectile.bulletStyle === "chimera") detonateChimeraShot(game, projectile);
      projectile.life = 0;
      const hitLabel = projectile.kind === "arrow" ? "Arrow" : projectile.bulletStyle === "chimera" ? "Chimera pulse" : "Bullet";
      const shownDamage = projectile.damage + (projectile.bulletStyle === "chimera" && !killedByImpact ? CHIMERA_BURST_DAMAGE : 0);
      notify(game, hitLabel + " hit · " + shownDamage + " damage", 650);
      if (killedByImpact) awardCreatureDrop(game, target);
    }
    if (projectile.x < 0 || projectile.y < 0 || projectile.x > WORLD_W || projectile.y > WORLD_H) projectile.life = 0;
  }
  game.projectiles = game.projectiles.filter((projectile) => projectile.life > 0);
}

function updateBroodWebs(game: GameState) {
  const now = performance.now();
  game.broodWebs = game.broodWebs.filter((web) => web.expiresAt === 0 || web.expiresAt > now);
  if (!activeBroodWebAt(game, game.player.x, game.player.y, now)) return;
  if (now < game.broodWebDamageAt) return;
  damagePlayer(game, BROOD_WEB_TICK_DAMAGE, "Brood web burns");
  game.broodWebDamageAt = now + BROOD_WEB_DAMAGE_INTERVAL_MS;
}

function primaryAction(game: GameState, repeated = false) {
  if (game.relaxing) return;
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
  if (game.mouseHeld && isBowTool(activeTool(game))) {
    if (game.heldAction?.kind !== "bow") beginBowCharge(game);
    return;
  }
  if (isFirearm(activeTool(game))) {
    if (game.mouseHeld) game.heldAction = { kind: "free" };
    if (repeated && game.heldAction?.kind !== "free") return;
    attack(game);
    return;
  }
  if (durableToolInfo(activeTool(game))?.family === "axe") {
    if (game.mouseHeld) game.heldAction = { kind: "free" };
    if (repeated && game.heldAction?.kind !== "free") return;
    attack(game);
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
    if (distanceToNodeFootprint(lockedNode, game.player.x, game.player.y) > RESOURCE_USE_RANGE) {
      releasePrimaryInput(game);
      return;
    }
    harvestNode(game, lockedNode);
    if (lockedNode.hp <= 0) releasePrimaryInput(game);
    return;
  }
  const node = targetNode(game, RESOURCE_USE_RANGE);
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
  const xNodeBlocker = blockingNodeAt(game, creature.realm, nextX, creature.y, radius);
  const xInsideCave = creature.realm !== "caveSystem" || isCaveFloor(nextX, creature.y, radius + 4);
  const xOutsideDeepWater = creature.realm !== "meadow" || !inDeepWater(nextX, creature.y, radius);
  if (!blocker && !xNodeBlocker && xInsideCave && xOutsideDeepWater) creature.x = nextX;
  const yBlocker = blockingBuildingAt(game, creature.realm, creature.x, nextY, radius);
  const yNodeBlocker = blockingNodeAt(game, creature.realm, creature.x, nextY, radius);
  const yInsideCave = creature.realm !== "caveSystem" || isCaveFloor(creature.x, nextY, radius + 4);
  const yOutsideDeepWater = creature.realm !== "meadow" || !inDeepWater(creature.x, nextY, radius);
  if (!yBlocker && !yNodeBlocker && yInsideCave && yOutsideDeepWater) creature.y = nextY;
  blocker ||= yBlocker;
  return blocker;
}

function steerCreatureFacing(current: number, target: number, maxTurn: number) {
  const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  const turn = Math.max(-maxTurn, Math.min(maxTurn, difference));
  return Math.atan2(Math.sin(current + turn), Math.cos(current + turn));
}

function launchBroodWebVolley(game: GameState, mother: Creature) {
  const muzzleDistance = creatureRadius(mother) + 20;
  for (const spread of [-0.18, 0, 0.18]) {
    const direction = mother.rangedAim + spread;
    game.projectiles.push({
      id: game.lastId++,
      kind: "broodWeb",
      realm: mother.realm,
      x: mother.x + Math.cos(direction) * muzzleDistance,
      y: mother.y + Math.sin(direction) * muzzleDistance,
      vx: Math.cos(direction) * BOSS_PROJECTILE_SPEED,
      vy: Math.sin(direction) * BOSS_PROJECTILE_SPEED,
      life: BOSS_RANGED_RANGE / BOSS_PROJECTILE_SPEED + 0.2,
      damage: BOSS_RANGED_DAMAGE,
    });
  }
  mother.rangedChargeUntil = 0;
  notify(game, "The Brood Mother spits a web volley!", 900);
}

function launchDreadTitanShardBarrage(game: GameState, titan: Creature) {
  const directions = Array.from({ length: 12 }, (_, index) => (index / 12) * Math.PI * 2 + titan.phase);
  directions.push(titan.rangedAim - 0.14, titan.rangedAim, titan.rangedAim + 0.14);
  const muzzleDistance = creatureRadius(titan) + 24;
  directions.forEach((direction) => {
    game.projectiles.push({
      id: game.lastId++,
      kind: "titanShard",
      realm: titan.realm,
      x: titan.x + Math.cos(direction) * muzzleDistance,
      y: titan.y + Math.sin(direction) * muzzleDistance,
      vx: Math.cos(direction) * DREAD_TITAN_SHARD_SPEED,
      vy: Math.sin(direction) * DREAD_TITAN_SHARD_SPEED,
      life: DREAD_TITAN_BARRAGE_RANGE / DREAD_TITAN_SHARD_SPEED,
      damage: DREAD_TITAN_BARRAGE_DAMAGE,
    });
  });
  titan.rangedChargeUntil = 0;
  notify(game, "The Dread Titan unleashes a storm of void shards!", 1200);
}

function updateDreadTitanStomp(game: GameState, titan: Creature, now: number) {
  if (!isDreadTitan(titan) || titan.abilityStartedAt <= 0) return false;
  const elapsed = now - titan.abilityStartedAt;
  titan.dir = steerCreatureFacing(
    titan.dir,
    Math.atan2(game.player.y - titan.y, game.player.x - titan.x),
    0.08,
  );
  if (elapsed < DREAD_TITAN_STOMP_WINDUP_MS) return true;

  titan.abilityStartedAt = 0;
  titan.hitAt = now;
  titan.attackAt = now;
  const playerDistance = Math.hypot(game.player.x - titan.x, game.player.y - titan.y);
  if (
    playerDistance <= DREAD_TITAN_STOMP_RADIUS &&
    monsterAttackLineIsClear(game, titan.realm, titan.x, titan.y, game.player.x, game.player.y)
  ) {
    damagePlayer(game, DREAD_TITAN_STOMP_DAMAGE, "Titan stomp dealt");
  }
  game.buildings.forEach((building) => {
    if (building.realm !== titan.realm || building.hp <= 0) return;
    const center = buildingWorldCenter(building);
    if (Math.hypot(center.x - titan.x, center.y - titan.y) <= DREAD_TITAN_STOMP_RADIUS) {
      building.hp -= 42;
    }
  });
  notify(game, "The Dread Titan's stomp shatters the ground!", 1300);
  return true;
}

function updateBruteLeap(game: GameState, creature: Creature, dt: number, now: number) {
  if (creature.kind !== "brute" || creature.abilityStartedAt <= 0) return false;
  const elapsed = now - creature.abilityStartedAt;
  creature.dir = steerCreatureFacing(
    creature.dir,
    Math.atan2(creature.abilityTargetY - creature.y, creature.abilityTargetX - creature.x),
    9 * dt,
  );
  if (elapsed < BRUTE_LEAP_WINDUP_MS) return true;

  if (elapsed < BRUTE_LEAP_WINDUP_MS + BRUTE_LEAP_TRAVEL_MS) {
    const dx = creature.abilityTargetX - creature.x;
    const dy = creature.abilityTargetY - creature.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 1) {
      const blocker = moveCreatureWithBuildings(
        game,
        creature,
        dx,
        dy,
        distance,
        Math.min(BRUTE_LEAP_SPEED * dt, distance),
      );
      if (blocker) {
        if (now - creature.structureHitAt > CREATURE_STRUCTURE_ATTACK_COOLDOWN_MS) {
          blocker.hp -= creature.damage * 1.5;
          creature.structureHitAt = now;
        }
        creature.abilityStartedAt = 0;
      }
    }
    return true;
  }

  creature.abilityStartedAt = 0;
  const playerDistance = Math.hypot(game.player.x - creature.x, game.player.y - creature.y);
  if (
    playerDistance < BRUTE_LEAP_IMPACT_RADIUS &&
    monsterAttackLineIsClear(game, creature.realm, creature.x, creature.y, game.player.x, game.player.y)
  ) {
    damagePlayer(game, creature.damage * 1.5, "Brute impact dealt");
    creature.hitAt = now;
    creature.attackAt = now;
  }
  return true;
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
      const animal = ANIMAL_DATA[creature.kind];
      creature.maxHp = animal.hp;
      creature.hp = animal.hp;
      creature.speed = animal.speed;
      creature.damage = animal.damage;
      creature.x = creature.homeX;
      creature.y = creature.homeY;
      creature.fed = 0;
      creature.maturesAt = 0;
      creature.breedReadyAt = 0;
      creature.angry = false;
      creature.provokedUntil = 0;
      creature.waryOfPlayer = false;
      creature.respawnAt = 0;
      creature.rewarded = false;
      creature.dir = creature.phase;
      creature.attackAt = 0;
      creature.rangedAt = 0;
      creature.rangedChargeUntil = 0;
      creature.rangedAim = creature.phase;
    }
    if (isAnimal(creature.kind) && creature.maturesAt > 0 && now >= creature.maturesAt) {
      const animal = ANIMAL_DATA[creature.kind];
      creature.maturesAt = 0;
      creature.maxHp = animal.hp;
      creature.hp = animal.hp;
      creature.speed = animal.speed;
      creature.damage = animal.damage;
      creature.homeX = creature.x;
      creature.homeY = creature.y;
    }
    if (creature.realm !== game.realm) continue;
    let targetX = creature.x + Math.cos(now / 1400 + creature.phase) * 15;
    let targetY = creature.y + Math.sin(now / 1700 + creature.phase) * 15;
    let movement: "idle" | "chase" | "flee" | "lure" | "return" = "idle";
    let attackingPlayer = false;
    const playerDistance = Math.hypot(game.player.x - creature.x, game.player.y - creature.y);
    const cautiousPrey = isAnimal(creature.kind) && isPermanentlyWaryPrey(creature.kind);
    const permanentlyWary = cautiousPrey && creature.waryOfPlayer;
    if (isMonster(creature.kind)) {
      const sense = isBroodMother(creature) ? BOSS_SENSE_DISTANCE : MONSTER_DATA[creature.kind].senseRadius;
      const illuminated = monsterIsIlluminated(game, creature);
      if (illuminated) creature.provokedUntil = now + LIGHT_PROVOKE_DURATION_MS;
      const lightProvoked = illuminated || now < creature.provokedUntil;
      if (playerDistance < sense || lightProvoked) creature.angry = true;
      if (!lightProvoked && playerDistance > sense * 1.8) creature.angry = false;
      if (creature.angry) {
        targetX = game.player.x;
        targetY = game.player.y;
        movement = "chase";
        attackingPlayer = true;
      }
      if (
        creature.kind === "brute" &&
        creature.angry &&
        creature.abilityStartedAt <= 0 &&
        now >= creature.abilityReadyAt &&
        playerDistance >= BRUTE_LEAP_MIN_DISTANCE &&
        playerDistance <= BRUTE_LEAP_MAX_DISTANCE &&
        monsterAttackLineIsClear(game, creature.realm, creature.x, creature.y, game.player.x, game.player.y)
      ) {
        creature.abilityStartedAt = now;
        creature.abilityReadyAt = now + BRUTE_LEAP_COOLDOWN_MS;
        creature.abilityTargetX = game.player.x;
        creature.abilityTargetY = game.player.y;
      }
      if (isDreadTitan(creature) && creature.angry) {
        if (now >= (creature.summonReadyAt ?? 0)) summonDreadTitanSwarm(game, creature, now);
        if (
          creature.abilityStartedAt <= 0 &&
          now >= creature.abilityReadyAt &&
          playerDistance <= DREAD_TITAN_STOMP_RADIUS + 45
        ) {
          creature.abilityStartedAt = now;
          creature.abilityReadyAt = now + DREAD_TITAN_STOMP_COOLDOWN_MS;
          creature.abilityTargetX = creature.x;
          creature.abilityTargetY = creature.y;
          creature.rangedChargeUntil = 0;
          notify(game, "The Dread Titan raises its arms — move beyond the shockwave!", DREAD_TITAN_STOMP_WINDUP_MS);
        }
      }
    }
    if (isAnimal(creature.kind)) {
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
        const lureDirection = playerDistance > 1
          ? Math.atan2(creature.y - game.player.y, creature.x - game.player.x)
          : creature.phase;
        targetX = game.player.x + Math.cos(lureDirection) * ANIMAL_LURE_STANDOFF_DISTANCE;
        targetY = game.player.y + Math.sin(lureDirection) * ANIMAL_LURE_STANDOFF_DISTANCE;
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
    if (updateDreadTitanStomp(game, creature, now)) continue;
    if (updateBruteLeap(game, creature, dt, now)) continue;

    const dx = targetX - creature.x;
    const dy = targetY - creature.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const attackReach = creatureAttackReach(creature);
    const needsAttackPathCheck = attackingPlayer && isMonster(creature.kind) && (
      playerDistance <= attackReach + 24 ||
      (isBroodMother(creature) && playerDistance <= BOSS_RANGED_RANGE) ||
      (isDreadTitan(creature) && playerDistance <= DREAD_TITAN_BARRAGE_RANGE)
    );
    const attackPathClear = !needsAttackPathCheck || monsterAttackLineIsClear(
      game,
      creature.realm,
      creature.x,
      creature.y,
      game.player.x,
      game.player.y,
    );
    const bossCanShoot = isBroodMother(creature) &&
      attackingPlayer &&
      attackPathClear &&
      playerDistance >= BOSS_RANGED_MIN_DISTANCE &&
      playerDistance <= BOSS_RANGED_RANGE;
    if (bossCanShoot) {
      if (creature.rangedChargeUntil > 0 && now >= creature.rangedChargeUntil) {
        launchBroodWebVolley(game, creature);
      } else if (creature.rangedChargeUntil <= 0 && now - creature.rangedAt >= BOSS_RANGED_COOLDOWN_MS) {
        creature.rangedAt = now;
        creature.rangedChargeUntil = now + BOSS_RANGED_WINDUP_MS;
        creature.rangedAim = Math.atan2(game.player.y - creature.y, game.player.x - creature.x);
        notify(game, "The Brood Mother gathers webbing in her mouths!", BOSS_RANGED_WINDUP_MS);
      }
    } else if (isBroodMother(creature) && creature.rangedChargeUntil > 0) {
      creature.rangedChargeUntil = 0;
    }
    const titanCanShoot = isDreadTitan(creature) &&
      attackingPlayer &&
      attackPathClear &&
      playerDistance >= DREAD_TITAN_BARRAGE_MIN_DISTANCE &&
      playerDistance <= DREAD_TITAN_BARRAGE_RANGE;
    if (titanCanShoot) {
      if (creature.rangedChargeUntil > 0 && now >= creature.rangedChargeUntil) {
        launchDreadTitanShardBarrage(game, creature);
      } else if (creature.rangedChargeUntil <= 0 && now - creature.rangedAt >= DREAD_TITAN_BARRAGE_COOLDOWN_MS) {
        creature.rangedAt = now;
        creature.rangedChargeUntil = now + DREAD_TITAN_BARRAGE_WINDUP_MS;
        creature.rangedAim = Math.atan2(game.player.y - creature.y, game.player.x - creature.x);
        notify(game, "Void shards orbit the Dread Titan — the barrage is coming!", DREAD_TITAN_BARRAGE_WINDUP_MS);
      }
    } else if (isDreadTitan(creature) && creature.rangedChargeUntil > 0) {
      creature.rangedChargeUntil = 0;
    }
    const chargingRangedAttack = creature.rangedChargeUntil > now;
    if (chargingRangedAttack) {
      creature.dir = steerCreatureFacing(creature.dir, creature.rangedAim, 9 * dt);
    }
    const chaseStopDistance = isBroodMother(creature) && bossCanShoot
      ? 210
      : isDreadTitan(creature) && titanCanShoot
        ? 260
      : isMonster(creature.kind) && attackPathClear
        ? Math.max(30, attackReach - 12)
        : 30;
    const stopDistance = movement === "lure" ? 5 : movement === "chase" ? chaseStopDistance : 2;
    const shouldMove = distance > stopDistance && (!chargingRangedAttack || isBroodMother(creature));
    if (shouldMove) {
      const slowFactor = now < creature.slowUntil ? 0.42 : 1;
      const paceMultiplier =
        movement === "flee"
          ? permanentlyWary
            ? 1.7
            : 1.45
          : movement === "chase"
            ? 1
            : movement === "lure"
              ? cautiousPrey
                ? 0.42
                : 0.85
              : movement === "return"
                ? 0.65
                : 0.22;
      const babyPace = isBabyAnimal(creature, now) ? 0.72 : 1;
      const chargingPace = isBroodMother(creature) && chargingRangedAttack ? 0.58 : 1;
      const basePace = creature.speed * paceMultiplier * slowFactor * babyPace * chargingPace;
      const pace = movement === "idle" ? Math.min(basePace, distance * 1.6) : basePace;
      const desiredDirection = chargingRangedAttack ? creature.rangedAim : Math.atan2(dy, dx);
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
      damagePlayer(game, creature.damage, isDreadTitan(creature) ? "Dread Titan hit" : isBroodMother(creature) ? "Brood Mother hit" : "");
      creature.hitAt = now;
      creature.attackAt = now;
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
  if (game.relaxing) return;
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
  const step = Math.min(distance, playerMovementSpeed(game) * dt);
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
  if (game.openLaboratoryId === building.id) game.openLaboratoryId = null;
  if (game.openGrowerId === building.id) game.openGrowerId = null;
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
  const now = performance.now();
  const timeMultiplier = game.relaxing ? RELAX_TIME_MULTIPLIER : 1;
  if (game.hallucinatingUntil > 0 && now >= game.hallucinatingUntil) game.hallucinatingUntil = 0;
  game.clock += (dt / DAY_SECONDS) * timeMultiplier;
  while (game.clock >= 1) {
    game.clock -= 1;
    game.day += 1;
    game.creatures = game.creatures.filter(
      (creature) => !isMonster(creature.kind) || creature.realm === "caveSystem" || creature.boss,
    );
    game.player.hp = Math.min(game.player.maxHp, game.player.hp + 12);
    notify(game, "DAWN — Day " + game.day + ". Meadow horrors fade; the caves stay hostile.", 4000);
  }
  maintainCavePopulation(game, now);
  const afterNight = isNight(game);
  if (afterNight && game.wave < game.day) spawnNightWave(game);
  game.wasNight = afterNight;

  let dx = 0;
  let dy = 0;
  if (game.keys.has("w") || game.keys.has("arrowup")) dy -= 1;
  if (game.keys.has("s") || game.keys.has("arrowdown")) dy += 1;
  if (game.keys.has("a") || game.keys.has("arrowleft")) dx -= 1;
  if (game.keys.has("d") || game.keys.has("arrowright")) dx += 1;
  if (!game.relaxing && (dx || dy)) {
    const length = Math.hypot(dx, dy);
    const speed = playerMovementSpeed(game);
    const nextX = Math.max(32, Math.min(WORLD_W - 32, game.player.x + (dx / length) * speed * dt));
    const nextY = Math.max(32, Math.min(WORLD_H - 32, game.player.y + (dy / length) * speed * dt));
    if (canStand(game, nextX, game.player.y)) game.player.x = nextX;
    if (canStand(game, game.player.x, nextY)) game.player.y = nextY;
    if (!game.pointer.active) game.player.dir = Math.atan2(dy, dx);
  }
  game.camera.x += (game.player.x - game.camera.x) * Math.min(1, dt * 8);
  game.camera.y += (game.player.y - game.camera.y) * Math.min(1, dt * 8);
  syncPointerWorld(game, viewportWidth, viewportHeight);
  if (!game.relaxing && game.pointer.active) {
    game.player.dir = Math.atan2(
      game.pointer.worldY - game.player.y,
      game.pointer.worldX - game.player.x,
    );
  }
  if (!game.relaxing) updateWorkOrders(game, dt);
  collectGroundDrops(game);
  if (!game.relaxing && game.mouseHeld) primaryAction(game, true);
  game.player.swing = Math.max(0, game.player.swing - dt);
  if (game.attackFlash && performance.now() - game.attackFlash.startedAt >= game.attackFlash.duration) {
    game.attackFlash = null;
  }
  game.player.hunger = Math.max(0, game.player.hunger - dt * 0.5 * timeMultiplier);
  if (game.player.hunger <= 0) game.player.hp -= dt * 2;
  if (game.player.hp <= 0) {
    game.player.hp = 0;
    game.dead = true;
    game.started = false;
    game.relaxing = false;
  }
  for (const building of game.buildings) {
    if (building.kind === "crop" && building.construction >= 1) building.growth = Math.min(1, building.growth + dt / 300);
  }
  updateProjectiles(game, dt);
  updateBroodWebs(game);
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
  } else if (drop.material === "mushrooms" || drop.material === "cookedMushrooms") {
    const cooked = drop.material === "cookedMushrooms";
    ctx.fillStyle = cooked ? "#d9b77a" : "#d8c9a5";
    roundedRect(ctx, -3, -1, 6, 14, 3);
    ctx.fill();
    ctx.fillStyle = cooked ? "#8b5132" : "#b96b51";
    ctx.beginPath();
    ctx.arc(0, -2, 11, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (cooked) {
      ctx.strokeStyle = "rgba(245,232,195,.9)";
      ctx.lineWidth = 2;
      for (const x of [-4, 4]) {
        ctx.beginPath();
        ctx.moveTo(x, -14);
        ctx.quadraticCurveTo(x - 4, -20, x + 1, -25);
        ctx.stroke();
      }
    }
  } else if (drop.material === "meat" || drop.material === "cookedMeat") {
    const cooked = drop.material === "cookedMeat";
    ctx.fillStyle = cooked ? "#8f5034" : "#b85d50";
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 10, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (cooked) {
      ctx.strokeStyle = "#d79a57";
      ctx.lineWidth = 2;
      for (const offset of [-5, 1, 7]) {
        ctx.beginPath();
        ctx.moveTo(offset - 4, -7);
        ctx.lineTo(offset, 7);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = "#efd3b5";
      ctx.beginPath();
      ctx.arc(4, -1, 4, 0, Math.PI * 2);
      ctx.fill();
    }
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
  } else if (drop.material === "biomass") {
    const pulse = 1 + Math.sin(now / 180 + drop.id) * 0.08;
    ctx.scale(pulse, pulse);
    ctx.fillStyle = "#984db8";
    ctx.strokeStyle = "#3c2545";
    ctx.shadowColor = "#d878ea";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-5, 2, 10, 0, Math.PI * 2);
    ctx.arc(6, -2, 9, 0, Math.PI * 2);
    ctx.arc(4, 7, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#e8b4f3";
    for (const [x, y] of [[-7, -1], [4, -4], [6, 6]] as const) {
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    const oreColor: Partial<Record<Material, string>> = {
      stone: "#8b9690",
      iron: "#b8c1bd",
      copper: "#c2774b",
      coal: "#343c3b",
      sulfur: "#d5be4d",
      aetherium: "#62dce8",
      mineralRock: "#776d59",
      hide: "#9b6b46",
      biomass: "#984db8",
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
  if (node.kind === "aetherOre") {
    const crystals = [
      { x: -0.34, y: -0.42, width: 0.2, height: 0.58 },
      { x: 0.02, y: -0.54, width: 0.24, height: 0.76 },
      { x: 0.34, y: -0.35, width: 0.18, height: 0.52 },
    ];
    ctx.shadowColor = "rgba(104,235,246,.8)";
    ctx.shadowBlur = radius * 0.22;
    for (const crystal of crystals) {
      const x = radius * crystal.x;
      const baseY = radius * crystal.y;
      const width = radius * crystal.width;
      const height = radius * crystal.height;
      ctx.beginPath();
      ctx.moveTo(x, baseY - height * 0.58);
      ctx.lineTo(x + width, baseY - height * 0.12);
      ctx.lineTo(x + width * 0.62, baseY + height * 0.42);
      ctx.lineTo(x - width * 0.62, baseY + height * 0.42);
      ctx.lineTo(x - width, baseY - height * 0.12);
      ctx.closePath();
      ctx.fillStyle = "#42cfde";
      ctx.strokeStyle = "#bafaff";
      ctx.lineWidth = Math.max(2, radius * 0.035);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, baseY - height * 0.52);
      ctx.lineTo(x, baseY + height * 0.34);
      ctx.strokeStyle = "rgba(230,255,255,.75)";
      ctx.lineWidth = Math.max(1.5, radius * 0.022);
      ctx.stroke();
    }
    ctx.shadowColor = "transparent";
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
  const bowCharge = isBowTool(tool) ? bowChargeRatio(game) : 0;
  const progress = swing > 0
    ? Math.max(0, Math.min(1, 1 - swing / profile.animationSeconds))
    : 0;
  const motion = swing > 0 ? Math.sin(progress * Math.PI) : 0;
  const angle = profile.style === "slash" ? -motion * 0.68 : 0;
  const firearmRecoil = tool === "chimera" ? 16 : tool === "shotgun" ? 14 : tool === "sniper" ? 12 : tool === "rifle" ? 10 : tool === "smg" ? 6 : 7;
  const forwardMotion = tool === "spear" ? motion * 30 : isFirearm(tool) ? -motion * firearmRecoil : 0;
  ctx.save();
  ctx.translate(19 + forwardMotion, 6);
  ctx.rotate(angle);
  if (isFoodItem(tool)) {
    const mushroom = tool === "mushrooms" || tool === "cookedMushrooms";
    const cooked = tool === "cookedMushrooms" || tool === "cookedMeat";
    ctx.fillStyle = tool === "berries"
      ? "#d95762"
      : mushroom
        ? cooked ? "#9b643c" : "#d9cba8"
        : cooked ? "#8f5034" : "#b95c4d";
    ctx.strokeStyle = "#432f2b";
    ctx.lineWidth = 3;
    if (mushroom) {
      for (const [x, y] of [[8, -3], [17, 4]] as const) {
        roundedRect(ctx, x, y, 4, 10, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 2, y, 7, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else if (tool === "meat" || tool === "cookedMeat") {
      ctx.beginPath();
      ctx.ellipse(12, 0, 13, 9, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (cooked) {
        ctx.strokeStyle = "#d99a57";
        ctx.lineWidth = 2;
        for (const offset of [-2, 5, 12]) {
          ctx.beginPath();
          ctx.moveTo(offset, -6);
          ctx.lineTo(offset + 4, 6);
          ctx.stroke();
        }
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
    const nockX = 13 - bowCharge * 21;
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
    ctx.lineTo(nockX, 0);
    ctx.lineTo(36, 20);
    ctx.stroke();
    ctx.strokeStyle = "#4b3a30";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(nockX - 4, 0);
    ctx.lineTo(55, 0);
    ctx.stroke();
    ctx.fillStyle = "#c8d1cc";
    ctx.beginPath();
    ctx.moveTo(59, 0);
    ctx.lineTo(49, -5);
    ctx.lineTo(49, 5);
    ctx.closePath();
    ctx.fill();
    if (game.bowChargeStartedAt !== null) {
      ctx.fillStyle = "rgba(20,35,31,.82)";
      roundedRect(ctx, 2, -31, 52, 6, 3);
      ctx.fill();
      ctx.fillStyle = bowCharge >= 1 ? "#f4c65a" : "#dce8c2";
      roundedRect(ctx, 3, -30, 50 * bowCharge, 4, 2);
      ctx.fill();
    }
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
  if (tool === "smg") {
    ctx.fillStyle = "#384649";
    ctx.strokeStyle = "#172326";
    ctx.lineWidth = 3;
    roundedRect(ctx, 2, -10, 53, 18, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#8b9b9d";
    roundedRect(ctx, 16, -7, 26, 6, 2);
    ctx.fill();
    ctx.fillStyle = "#202c2f";
    roundedRect(ctx, 50, -5, 17, 6, 2);
    ctx.fill();
    ctx.fillStyle = "#273436";
    ctx.beginPath();
    ctx.moveTo(23, 7);
    ctx.lineTo(37, 7);
    ctx.lineTo(34, 28);
    ctx.lineTo(22, 24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#6f513a";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(4, -3);
    ctx.lineTo(-12, 9);
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (tool === "shotgun") {
    ctx.fillStyle = "#744e36";
    ctx.strokeStyle = "#332720";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-13, -7);
    ctx.lineTo(18, -7);
    ctx.lineTo(29, 2);
    ctx.lineTo(8, 8);
    ctx.lineTo(-16, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#475558";
    roundedRect(ctx, 16, -8, 59, 7, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#263235";
    roundedRect(ctx, 19, 1, 56, 6, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#986743";
    roundedRect(ctx, 20, -6, 24, 11, 3);
    ctx.fill();
    ctx.restore();
    return;
  }
  if (tool === "rifle") {
    ctx.fillStyle = "#3e4b4c";
    ctx.strokeStyle = "#1d2728";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-6, -9);
    ctx.lineTo(55, -9);
    ctx.lineTo(67, -4);
    ctx.lineTo(67, 4);
    ctx.lineTo(30, 7);
    ctx.lineTo(5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#91a3a4";
    roundedRect(ctx, 18, -6, 37, 7, 2);
    ctx.fill();
    ctx.fillStyle = "#283334";
    roundedRect(ctx, 57, -5, 15, 5, 2);
    ctx.fill();
    ctx.fillStyle = "#6e513c";
    ctx.beginPath();
    ctx.moveTo(-9, -6);
    ctx.lineTo(8, -5);
    ctx.lineTo(12, 4);
    ctx.lineTo(-11, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#273132";
    ctx.beginPath();
    ctx.moveTo(27, 5);
    ctx.lineTo(43, 4);
    ctx.lineTo(40, 24);
    ctx.lineTo(27, 21);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#68dbe6";
    roundedRect(ctx, 31, -13, 15, 5, 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  if (tool === "sword") {
    const bladeGradient = ctx.createLinearGradient(19, -7, 19, 7);
    bladeGradient.addColorStop(0, "#f5faf8");
    bladeGradient.addColorStop(0.48, "#aebdb9");
    bladeGradient.addColorStop(0.52, "#7f918d");
    bladeGradient.addColorStop(1, "#e1e9e6");
    ctx.fillStyle = bladeGradient;
    ctx.strokeStyle = "#2f403c";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(19, -7);
    ctx.lineTo(47, -5);
    ctx.lineTo(60, 0);
    ctx.lineTo(47, 5);
    ctx.lineTo(19, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(247,252,250,.85)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(23, -3.5);
    ctx.lineTo(50, -2.5);
    ctx.lineTo(56, 0);
    ctx.stroke();
    ctx.fillStyle = "#d6a94b";
    ctx.strokeStyle = "#5b4525";
    ctx.lineWidth = 2.5;
    roundedRect(ctx, 15, -13, 6, 26, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#68432e";
    ctx.strokeStyle = "#35261f";
    roundedRect(ctx, 3, -4.5, 13, 9, 3);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#d6a94b";
    ctx.lineWidth = 1.5;
    for (const wrapX of [7, 11]) {
      ctx.beginPath();
      ctx.moveTo(wrapX, -4);
      ctx.lineTo(wrapX, 4);
      ctx.stroke();
    }
    ctx.fillStyle = "#d6a94b";
    ctx.strokeStyle = "#5b4525";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(2, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (tool === "sniper") {
    ctx.fillStyle = "#26383b";
    ctx.strokeStyle = "#132225";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-15, -7);
    ctx.lineTo(31, -7);
    ctx.lineTo(42, 4);
    ctx.lineTo(7, 8);
    ctx.lineTo(-18, 13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#819496";
    roundedRect(ctx, 24, -6, 58, 7, 2);
    ctx.fill();
    ctx.fillStyle = "#172629";
    roundedRect(ctx, 72, -5, 19, 5, 2);
    ctx.fill();
    ctx.fillStyle = "#5b4536";
    ctx.beginPath();
    ctx.moveTo(-18, -5);
    ctx.lineTo(2, -4);
    ctx.lineTo(8, 5);
    ctx.lineTo(-22, 17);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#54d5e1";
    ctx.strokeStyle = "#174f57";
    roundedRect(ctx, 24, -16, 28, 7, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#d7fdff";
    ctx.beginPath();
    ctx.arc(49, -12.5, 2.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  if (tool === "chimera") {
    ctx.strokeStyle = "#321d3c";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    for (const offset of [-8, 0, 8]) {
      ctx.beginPath();
      ctx.moveTo(-19, offset * 0.45);
      ctx.quadraticCurveTo(-6, offset * 1.45, 8, offset * 0.55);
      ctx.stroke();
    }
    ctx.shadowColor = "#d878ef";
    ctx.shadowBlur = 15;
    const bodyGradient = ctx.createLinearGradient(4, -18, 68, 15);
    bodyGradient.addColorStop(0, "#c66ad9");
    bodyGradient.addColorStop(0.48, "#713b91");
    bodyGradient.addColorStop(1, "#3d2857");
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(-4, -8);
    ctx.bezierCurveTo(8, -23, 46, -22, 68, -10);
    ctx.lineTo(78, 0);
    ctx.lineTo(67, 11);
    ctx.bezierCurveTo(42, 19, 9, 16, -5, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#efb8fb";
    ctx.lineWidth = 2;
    for (const x of [14, 31, 48]) {
      ctx.beginPath();
      ctx.moveTo(x, -15 + Math.abs(31 - x) * 0.08);
      ctx.quadraticCurveTo(x - 6, 0, x, 14 - Math.abs(31 - x) * 0.05);
      ctx.stroke();
    }
    ctx.fillStyle = "#8ff1e9";
    ctx.shadowColor = "#89f8ef";
    ctx.shadowBlur = 13;
    ctx.beginPath();
    ctx.ellipse(42, 0, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dffffb";
    ctx.beginPath();
    ctx.arc(76, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#452754";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(15, 10);
    ctx.quadraticCurveTo(8, 23, 19, 29);
    ctx.stroke();
    ctx.restore();
    return;
  }
  ctx.strokeStyle = "#432f2b";
  ctx.lineWidth = tool === "spear" || tool === "tendrilBlade" ? 5 : 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(4, 0);
  ctx.lineTo(tool === "spear" || tool === "tendrilBlade" ? 49 : 39, 0);
  ctx.stroke();
  if (durableTool?.family === "axe") {
    const tier = durableTool.tier;
    const headColor = tier === "wood" ? "#a66b3e" : tier === "stone" ? "#858f89" : tier === "iron" ? "#b8c6c3" : tier === "biomass" ? "#934bb0" : "#63dae7";
    const edgeColor = tier === "wood" ? "#e0b06a" : tier === "stone" ? "#c3cbc7" : tier === "iron" ? "#f3f7f5" : tier === "biomass" ? "#efb7f8" : "#d7fcff";
    ctx.strokeStyle = tier === "wood" ? "#55372a" : tier === "aetherium" ? "#256a72" : tier === "biomass" ? "#40264a" : "#344540";
    ctx.lineWidth = 3;
    if (tier === "aetherium") {
      ctx.shadowColor = "#69e6ef";
      ctx.shadowBlur = 12;
    } else if (tier === "biomass") {
      ctx.shadowColor = "#d178e9";
      ctx.shadowBlur = 10;
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
    } else if (tier === "aetherium") {
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
    } else {
      ctx.moveTo(28, -5);
      ctx.lineTo(27, -14);
      ctx.quadraticCurveTo(18, -17, 13, -26);
      ctx.quadraticCurveTo(29, -37, 54, -29);
      ctx.quadraticCurveTo(48, -16, 40, -9);
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
    } else if (tier === "biomass") {
      ctx.moveTo(13, -26);
      ctx.quadraticCurveTo(29, -37, 54, -29);
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
  } else if (tool === "tendrilBlade") {
    ctx.fillStyle = "#9f52bd";
    ctx.strokeStyle = "#3e2549";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#d57de9";
    ctx.shadowBlur = 9;
    ctx.beginPath();
    ctx.moveTo(60, 0);
    ctx.quadraticCurveTo(48, -12, 37, -5);
    ctx.quadraticCurveTo(47, 1, 37, 8);
    ctx.quadraticCurveTo(50, 11, 60, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#e7b0f2";
    ctx.beginPath();
    ctx.arc(48, -1, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#705032";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(9, -9);
    ctx.lineTo(9, 9);
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
  const fill = armor === "copper" ? "#c47a4a" : armor === "iron" ? "#aeb8b5" : armor === "symbiote" ? "#834b9a" : "#343d42";
  const edge = armor === "copper" ? "#70402f" : armor === "iron" ? "#53615f" : armor === "symbiote" ? "#392342" : "#141a20";
  const shine = armor === "copper" ? "#e5a16b" : armor === "iron" ? "#dce3df" : armor === "symbiote" ? "#e2a4ef" : "#6e7d84";
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
  } else if (armor === "symbiote") {
    ctx.strokeStyle = "#c876dd";
    ctx.lineWidth = 4;
    for (const offset of [-9, 0, 9]) {
      ctx.beginPath();
      ctx.moveTo(-12, offset);
      ctx.quadraticCurveTo(-25, offset - 7, -28, offset + 5);
      ctx.stroke();
    }
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
  if (!game.relaxing) drawTool(ctx, game, player.swing);
  ctx.fillStyle = "#dfa93d";
  ctx.strokeStyle = "#203a33";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(0, game.relaxing ? 5 : 0, 25, game.relaxing ? 20 : 25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  drawHelmet(ctx, game.gear.armor);
  ctx.restore();
  if (game.relaxing) {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.fillStyle = "rgba(255,244,198,.92)";
    ctx.font = "900 12px Arial";
    ctx.fillText("z", 27, -24);
    ctx.font = "900 16px Arial";
    ctx.fillText("Z", 38, -37);
    ctx.restore();
  }
}

function drawTopDownBird(ctx: CanvasRenderingContext2D, creature: Creature, kind: BirdKind, now: number) {
  const escaping = ANIMAL_DATA[kind].flying && creature.fleeing;
  const wingCycle = now / 105 + creature.phase;
  const flap = (Math.sin(wingCycle) + 1) / 2;
  const wingSweep = escaping ? Math.cos(wingCycle) * 12 : 0;

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
  } else if (kind === "raccoon") {
    ctx.save();
    ctx.translate(-length + 3, 2);
    ctx.rotate(-0.24);
    ctx.fillStyle = "#7c8580";
    ctx.strokeStyle = "#343b38";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(-24, 0, 29, 10.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(-24, 0, 27, 8.7, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#343b38";
    for (const x of [-42, -28, -14]) ctx.fillRect(x, -12, 7, 24);
    ctx.restore();
    ctx.restore();
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
    ctx.fillStyle = "rgba(187,194,187,.48)";
    ctx.beginPath();
    ctx.ellipse(-7, 0, 15, 9, 0, 0, Math.PI * 2);
    ctx.fill();
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
  } else if (kind === "raccoon") {
    for (const side of [-1, 1]) {
      ctx.fillStyle = body;
      ctx.strokeStyle = outline;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(headX - 5, side * (headWidth * 0.78), 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#343b38";
      ctx.beginPath();
      ctx.arc(headX - 4, side * (headWidth * 0.8), 2.7, 0, Math.PI * 2);
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
  if (kind === "raccoon") {
    ctx.fillStyle = "#303735";
    ctx.beginPath();
    ctx.moveTo(headX - 4, -headWidth * 0.62);
    ctx.quadraticCurveTo(headX + 4, -headWidth * 0.92, headX + 10, -headWidth * 0.35);
    ctx.lineTo(headX + 8, headWidth * 0.35);
    ctx.quadraticCurveTo(headX + 4, headWidth * 0.92, headX - 4, headWidth * 0.62);
    ctx.quadraticCurveTo(headX + 1, 0, headX - 4, -headWidth * 0.62);
    ctx.fill();
  }
  ctx.fillStyle = kind === "raccoon" ? "#eee5d6" : "#20211f";
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
    ctx.fillStyle = "#1f2523";
    ctx.beginPath();
    ctx.ellipse(headX + headLength * 0.92, 0, 3.4, 4.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMonsterLimb(
  ctx: CanvasRenderingContext2D,
  points: readonly (readonly [number, number])[],
  width: number,
  color: string,
) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#111522";
  ctx.lineWidth = width + 5;
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function drawBroodMouth(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  rotation: number,
  teeth: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = "#080609";
  ctx.strokeStyle = "#321822";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#eee0bd";
  for (let tooth = 0; tooth < teeth; tooth++) {
    const angle = (tooth / teeth) * Math.PI * 2;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(radiusX * 0.86, -2.1);
    ctx.lineTo(radiusX * 0.42, 0);
    ctx.lineTo(radiusX * 0.86, 2.1);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawBroodMother(ctx: CanvasRenderingContext2D, creature: Creature, now: number) {
  const stride = now / 150 + creature.phase;
  for (const side of [-1, 1] as const) {
    for (let leg = 0; leg < 6; leg++) {
      const anchorX = -25 + leg * 10;
      const splay = (leg - 2.5) * 10;
      const lift = Math.sin(stride + leg * 1.17 + (side > 0 ? 0.9 : 0)) * 5;
      drawMonsterLimb(
        ctx,
        [
          [anchorX, side * 17],
          [anchorX + 10, side * (42 + Math.abs(splay) * 0.22 + lift)],
          [anchorX + splay, side * (70 + Math.abs(splay) * 0.28)],
        ],
        leg === 0 || leg === 5 ? 5.5 : 7,
        leg % 2 ? "#573047" : "#6b3a50",
      );
    }
  }

  ctx.fillStyle = "#472437";
  ctx.strokeStyle = "#170d15";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(-18, 0, 39, 31, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#5d3045";
  ctx.beginPath();
  ctx.ellipse(20, 0, 29, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(218,208,193,.52)";
  ctx.lineWidth = 2;
  for (const y of [-18, -7, 7, 18]) {
    ctx.beginPath();
    ctx.moveTo(-48, y * 0.55);
    ctx.quadraticCurveTo(-20, y * 1.25, 7, y * 0.72);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(-50, 0);
  ctx.lineTo(8, 0);
  ctx.stroke();

  drawBroodMouth(ctx, 26, 0, 18, 14, 0, 14);
  drawBroodMouth(ctx, -28, -14, 10, 7, -0.35, 8);
  drawBroodMouth(ctx, -29, 14, 10, 7, 0.35, 8);
  drawBroodMouth(ctx, -4, -17, 9, 6, -0.15, 7);
  drawBroodMouth(ctx, -4, 17, 9, 6, 0.15, 7);

  ctx.fillStyle = "#f36b63";
  for (const [x, y, radius] of [
    [9, -17, 3.5], [18, -19, 3], [28, -17, 2.6], [9, 17, 3.5], [18, 19, 3], [28, 17, 2.6],
  ] as const) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDreadTitan(ctx: CanvasRenderingContext2D, creature: Creature, now: number) {
  const pulse = 1 + Math.sin(now / 230 + creature.phase) * 0.035;
  const stride = Math.sin(now / 330 + creature.phase) * 5;
  ctx.lineJoin = "round";

  for (const side of [-1, 1] as const) {
    drawMonsterLimb(ctx, [[-30, side * 36], [-66, side * (66 + stride)], [-92, side * 80]], 21, "#382c55");
    drawMonsterLimb(ctx, [[22, side * 39], [58, side * (65 - stride)], [88, side * 74]], 19, "#4a3564");
    ctx.fillStyle = "#211b38";
    ctx.strokeStyle = "#100c1d";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(-94, side * 81, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(90, side * 75, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.save();
  ctx.scale(pulse, pulse);
  ctx.fillStyle = "#32264b";
  ctx.strokeStyle = "#100c1c";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.ellipse(-13, 0, 67, 58, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#4a3766";
  ctx.beginPath();
  ctx.ellipse(36, 0, 43, 39, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#8b66b0";
  ctx.lineWidth = 5;
  for (const side of [-1, 1] as const) {
    ctx.beginPath();
    ctx.moveTo(-58, side * 17);
    ctx.quadraticCurveTo(-14, side * 45, 25, side * 26);
    ctx.stroke();
  }
  ctx.strokeStyle = "#69d6ce";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-54, 0);
  ctx.lineTo(-25, -9);
  ctx.lineTo(-3, 7);
  ctx.lineTo(24, 0);
  ctx.stroke();

  ctx.fillStyle = "#171126";
  ctx.beginPath();
  ctx.ellipse(52, 0, 23, 27, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f5cc67";
  ctx.shadowColor = "#ef5b89";
  ctx.shadowBlur = 12;
  for (const y of [-12, 0, 12]) {
    ctx.beginPath();
    ctx.ellipse(59, y, 7, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#9d78c4";
  for (const [x, y, rotation] of [[-38, -51, -0.4], [-5, -59, -0.05], [28, -42, 0.35], [-38, 51, 0.4], [-5, 59, 0.05], [28, 42, -0.35]] as const) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(2, -10);
    ctx.lineTo(26, 0);
    ctx.lineTo(2, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function drawMonsterCreature(ctx: CanvasRenderingContext2D, creature: Creature, now: number) {
  const pulse = Math.sin(now / 150 + creature.phase) * 1.5;

  if (isDreadTitan(creature)) {
    drawDreadTitan(ctx, creature, now);
    return;
  }

  if (isBroodMother(creature)) {
    drawBroodMother(ctx, creature, now);
    return;
  }

  if (creature.kind === "shade") {
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + Math.sin(now / 520 + creature.phase + i) * 0.12;
      const inner = 14;
      const outer = 34 + (i % 2) * 7;
      const bend = Math.sin(now / 290 + i * 1.8) * 7;
      ctx.strokeStyle = "#111522";
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.quadraticCurveTo(
        Math.cos(angle) * 25 - Math.sin(angle) * bend,
        Math.sin(angle) * 25 + Math.cos(angle) * bend,
        Math.cos(angle) * outer,
        Math.sin(angle) * outer,
      );
      ctx.stroke();
      ctx.strokeStyle = "#303b62";
      ctx.lineWidth = 7;
      ctx.stroke();
    }
    ctx.fillStyle = "#252d49";
    ctx.strokeStyle = "#111522";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 26 + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#090b12";
    ctx.beginPath();
    ctx.ellipse(10, 0, 10, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f35a58";
    for (const y of [-8, 0, 8]) {
      ctx.beginPath();
      ctx.ellipse(13, y, 4.5, 2.5, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (creature.kind === "crawler") {
    const attackAge = now - creature.attackAt;
    const attackProgress = attackAge >= 0 && attackAge < 300 ? attackAge / 300 : -1;
    const strikingSide = Math.floor(creature.attackAt / CREATURE_ATTACK_COOLDOWN_MS) % 2 === 0 ? -1 : 1;
    for (const side of [-1, 1] as const) {
      const fling = side === strikingSide && attackProgress >= 0
        ? Math.sin(attackProgress * Math.PI)
        : 0;
      const upperAngle = side * (1.5 - fling * 1.12);
      const foreAngle = -side * (0.15 + fling * 0.33);
      const baseX = 8;
      const baseY = side * 9;
      const elbowX = baseX + Math.cos(upperAngle) * 43;
      const elbowY = baseY + Math.sin(upperAngle) * 43;
      const tipX = elbowX + Math.cos(foreAngle) * 67;
      const tipY = elbowY + Math.sin(foreAngle) * 67;
      drawMonsterLimb(
        ctx,
        [[baseX, baseY], [elbowX, elbowY], [tipX, tipY]],
        6,
        "#465773",
      );
      drawMonsterLimb(ctx, [[-4, side * 12], [20, side * 38], [58, side * 45]], 5, "#35445f");
      drawMonsterLimb(ctx, [[-14, side * 9], [-30, side * 31], [-57, side * 36]], 5, "#35445f");
    }
    ctx.fillStyle = "#283449";
    ctx.strokeStyle = "#111522";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(-2, 0, 28 + pulse, 19, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1b2334";
    ctx.beginPath();
    ctx.ellipse(-16, 0, 12, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0b0d12";
    ctx.beginPath();
    ctx.ellipse(15, 0, 12, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ead9bd";
    for (const y of [-5, 0, 5]) {
      ctx.beginPath();
      ctx.moveTo(9, y - 3);
      ctx.lineTo(22, y);
      ctx.lineTo(9, y + 3);
      ctx.fill();
    }
    ctx.fillStyle = "#ff655f";
    for (const [x, y] of [[-9, -8], [-2, -11], [-9, 8], [-2, 11]] as const) {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (creature.kind === "stalker") {
    for (const side of [-1, 1] as const) {
      for (let leg = 0; leg < 3; leg++) {
        const rootX = -13 + leg * 13;
        const stride = Math.sin(now / 88 + creature.phase * 2 + leg * 1.7 + side) * 4;
        drawMonsterLimb(
          ctx,
          [[rootX, side * 7], [rootX - 8 + stride, side * (19 + leg * 2)], [rootX + 9 - stride, side * 31]],
          3.5,
          leg === 1 ? "#43445d" : "#35364e",
        );
      }
    }
    ctx.fillStyle = "#191a29";
    ctx.strokeStyle = "#080a11";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(-3, 0, 25 + pulse, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#292b43";
    ctx.beginPath();
    ctx.ellipse(15, 0, 11, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#06070c";
    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.lineTo(32, -5);
    ctx.lineTo(30, 0);
    ctx.lineTo(32, 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ff4e60";
    ctx.beginPath();
    ctx.arc(18, -4, 2.7, 0, Math.PI * 2);
    ctx.arc(18, 4, 2.7, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (creature.kind === "brute") {
    const windup = creature.abilityStartedAt > 0
      ? Math.max(0, Math.min(1, (now - creature.abilityStartedAt) / BRUTE_LEAP_WINDUP_MS))
      : 0;
    for (const side of [-1, 1] as const) {
      drawMonsterLimb(ctx, [[6, side * 18], [31, side * 33], [52, side * 27]], 13, "#76516f");
      ctx.fillStyle = windup > 0 ? "#e29a67" : "#9a708c";
      ctx.strokeStyle = "#211621";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(45, side * 36);
      ctx.lineTo(67 + windup * 8, side * 27);
      ctx.lineTo(49, side * 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = "#4e3152";
    ctx.strokeStyle = "#1b1420";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.quadraticCurveTo(-22, -30, 6, -31);
    ctx.lineTo(31, -18);
    ctx.lineTo(35, 0);
    ctx.lineTo(31, 18);
    ctx.quadraticCurveTo(-4, 37, -30, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#75536d";
    for (const x of [-17, -1, 15]) {
      ctx.beginPath();
      ctx.moveTo(x - 8, -24);
      ctx.lineTo(x, -32 - windup * 5);
      ctx.lineTo(x + 8, -23);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = "#100b11";
    ctx.beginPath();
    ctx.ellipse(22, 0, 10, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff755f";
    ctx.beginPath();
    ctx.arc(25, -7, 3.5, 0, Math.PI * 2);
    ctx.arc(25, 7, 3.5, 0, Math.PI * 2);
    ctx.fill();
    if (windup > 0) {
      ctx.strokeStyle = `rgba(255,175,96,${0.35 + windup * 0.6})`;
      ctx.lineWidth = 3 + windup * 3;
      ctx.beginPath();
      ctx.arc(0, 0, 39 + windup * 8, 0, Math.PI * 2);
      ctx.stroke();
    }
    return;
  }

  if (creature.kind === "aetherWarden") {
    ctx.save();
    ctx.shadowColor = "#61e8f1";
    ctx.shadowBlur = 16;
    for (let crystal = 0; crystal < 7; crystal++) {
      const angle = (crystal / 7) * Math.PI * 2 + Math.sin(now / 700 + creature.phase) * 0.08;
      const inner = 18;
      const outer = 39 + (crystal % 2) * 8;
      ctx.fillStyle = crystal % 2 ? "#4cc7d3" : "#83edf2";
      ctx.strokeStyle = "#1c5962";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle - 0.18) * inner, Math.sin(angle - 0.18) * inner);
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
      ctx.lineTo(Math.cos(angle + 0.18) * inner, Math.sin(angle + 0.18) * inner);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = "#235e68";
    ctx.strokeStyle = "#102f35";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-27, 0);
    ctx.lineTo(-12, -25 - pulse);
    ctx.lineTo(19, -22);
    ctx.lineTo(32, 0);
    ctx.lineTo(19, 22);
    ctx.lineTo(-12, 25 + pulse);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#071517";
    ctx.beginPath();
    ctx.ellipse(12, 0, 11, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e8ffff";
    ctx.beginPath();
    ctx.moveTo(12, -9);
    ctx.lineTo(21, 0);
    ctx.lineTo(12, 9);
    ctx.lineTo(6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }

  if (creature.kind === "wraith") {
    for (const side of [-1, 1] as const) {
      for (let trail = 0; trail < 3; trail++) {
        const y = side * (7 + trail * 8);
        const wave = Math.sin(now / 280 + creature.phase + trail * 1.6) * 6;
        ctx.strokeStyle = "#17182b";
        ctx.lineWidth = 9 - trail;
        ctx.beginPath();
        ctx.moveTo(-10, y * 0.65);
        ctx.bezierCurveTo(-31, y + wave, -42, y - wave, -61 - trail * 5, y + wave);
        ctx.stroke();
        ctx.strokeStyle = trail % 2 ? "#5d5486" : "#49416f";
        ctx.lineWidth = 5 - trail * 0.6;
        ctx.stroke();
      }
    }
    ctx.fillStyle = "#3d385f";
    ctx.strokeStyle = "#17182b";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-28, 0);
    ctx.quadraticCurveTo(-10, -31 - pulse, 23, -21);
    ctx.quadraticCurveTo(35, 0, 23, 21);
    ctx.quadraticCurveTo(-10, 31 + pulse, -28, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#090911";
    ctx.beginPath();
    ctx.ellipse(11, 0, 10, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff6670";
    ctx.beginPath();
    ctx.arc(15, -6, 3, 0, Math.PI * 2);
    ctx.arc(15, 7, 3, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const length = creature.boss ? 48 : 40;
    drawMonsterLimb(
      ctx,
      [[Math.cos(angle) * 22, Math.sin(angle) * 22], [Math.cos(angle) * length, Math.sin(angle) * length]],
      creature.boss ? 10 : 8,
      "#75435b",
    );
  }
  ctx.fillStyle = "#553044";
  ctx.strokeStyle = "#25131d";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, 34 + pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#09070a";
  ctx.beginPath();
  ctx.arc(6, 0, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ead8bd";
  for (let tooth = 0; tooth < 12; tooth++) {
    const angle = (tooth / 12) * Math.PI * 2;
    ctx.save();
    ctx.translate(6, 0);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(18, -4);
    ctx.lineTo(8, 0);
    ctx.lineTo(18, 4);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#ff625a";
  for (const [x, y] of [[-18, -19], [-22, 14], [4, -29]] as const) {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#171014";
    ctx.beginPath();
    ctx.arc(x + 1, y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff625a";
  }
}

function drawCaveMonsterAttack(ctx: CanvasRenderingContext2D, creature: Creature, now: number) {
  if (creature.realm !== "caveSystem" || !isMonster(creature.kind) || creature.attackAt <= 0) return;
  const duration = 280;
  const age = now - creature.attackAt;
  if (age < 0 || age >= duration) return;

  const progress = age / duration;
  const intensity = Math.sin(progress * Math.PI);
  const sweepAngle = -0.78 + progress * 1.56;
  const outerRadius = creatureAttackReach(creature) - 8;
  const innerRadius = creatureRadius(creature) + 7;
  const flashColor = creature.boss
    ? "#ffd08a"
    : creature.kind === "wraith"
      ? "#d8cbff"
      : "#ff9c86";

  ctx.save();
  ctx.translate(creature.x, creature.y);
  ctx.rotate(creature.dir);
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.2 + intensity * 0.8;
  ctx.lineCap = "round";
  ctx.shadowColor = flashColor;
  ctx.shadowBlur = 12 + intensity * 10;

  for (const radiusOffset of [0, -13]) {
    ctx.strokeStyle = flashColor;
    ctx.lineWidth = creature.boss ? 7 : 5.5;
    ctx.beginPath();
    ctx.arc(0, 0, outerRadius + radiusOffset, sweepAngle - 0.42, sweepAngle + 0.18);
    ctx.stroke();
  }

  ctx.strokeStyle = "#fff8e9";
  ctx.lineWidth = creature.boss ? 3.5 : 2.5;
  ctx.beginPath();
  ctx.moveTo(
    Math.cos(sweepAngle - 0.18) * innerRadius,
    Math.sin(sweepAngle - 0.18) * innerRadius,
  );
  ctx.quadraticCurveTo(
    Math.cos(sweepAngle) * outerRadius * 0.72,
    Math.sin(sweepAngle) * outerRadius * 0.72,
    Math.cos(sweepAngle + 0.08) * outerRadius,
    Math.sin(sweepAngle + 0.08) * outerRadius,
  );
  ctx.stroke();
  ctx.restore();
}

function creatureVisualScale(creature: Creature) {
  if (isDreadTitan(creature)) return 1.45;
  if (isBroodMother(creature)) return 1.82;
  if (creature.kind === "brute") return 1.28;
  if (creature.kind === "stalker") return 0.72;
  if (creature.kind === "aetherWarden") return 1.15;
  if (creature.kind === "bear") return 1.2;
  if (creature.kind === "rabbit") return 0.78;
  if (creature.kind === "crow") return 0.52;
  if (creature.kind === "owl") return 0.54;
  if (creature.kind === "turkey") return 0.58;
  if (creature.kind === "raccoon" || creature.kind === "boar") return 0.92;
  return 1;
}

function monsterEyePositions(creature: Creature): readonly (readonly [number, number, number])[] {
  if (creature.kind === "dreadTitan") return [[59, -12, 4.5], [59, 0, 4.5], [59, 12, 4.5]];
  if (creature.kind === "shade") return [[13, -8, 3], [13, 0, 3], [13, 8, 3]];
  if (creature.kind === "crawler") return [[-9, -8, 2.6], [-2, -11, 2.6], [-9, 8, 2.6], [-2, 11, 2.6]];
  if (creature.kind === "brute") return [[25, -7, 3.2], [25, 7, 3.2]];
  if (creature.kind === "stalker") return [[18, -4, 2.8], [18, 4, 2.8]];
  if (creature.kind === "wraith") return [[15, -6, 3], [15, 7, 3]];
  if (creature.kind === "aetherWarden") return [[13, 0, 4.2]];
  return [[-18, -19, 4], [-22, 14, 4], [4, -29, 4]];
}

function drawMonsterEyeGlints(
  ctx: CanvasRenderingContext2D,
  game: GameState,
  now: number,
  onScreen: (x: number, y: number) => boolean,
) {
  for (const creature of game.creatures) {
    if (
      creature.realm !== game.realm ||
      creature.hp <= 0 ||
      !isMonster(creature.kind) ||
      !onScreen(creature.x, creature.y)
    ) continue;
    const distance = Math.hypot(creature.x - game.player.x, creature.y - game.player.y);
    const illuminated = monsterIsIlluminated(game, creature);
    if (
      !illuminated &&
      (distance > MONSTER_EYE_GLINT_RANGE ||
        !lightLineIsClear(game, creature.realm, game.player.x, game.player.y, creature.x, creature.y))
    ) continue;

    const pulse = 0.82 + Math.sin(now / 95 + creature.id) * 0.18;
    const alpha = illuminated ? 0.95 : 0.42;
    let leapHeight = 0;
    if (creature.kind === "brute" && creature.abilityStartedAt > 0) {
      const leapElapsed = now - creature.abilityStartedAt;
      if (leapElapsed >= BRUTE_LEAP_WINDUP_MS) {
        const leapProgress = Math.max(0, Math.min(1, (leapElapsed - BRUTE_LEAP_WINDUP_MS) / BRUTE_LEAP_TRAVEL_MS));
        leapHeight = Math.sin(leapProgress * Math.PI) * 34;
      }
    }

    ctx.save();
    ctx.translate(creature.x, creature.y + Math.sin(now / 230 + creature.phase) * 2 - leapHeight);
    const visualScale = creatureVisualScale(creature);
    ctx.scale(visualScale, visualScale);
    ctx.rotate(creature.dir);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = alpha * pulse;
    const warden = creature.kind === "aetherWarden";
    for (const [x, y, radius] of monsterEyePositions(creature)) {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 4.5);
      glow.addColorStop(0, "rgba(255,241,190,1)");
      glow.addColorStop(0.18, warden ? "rgba(97,232,241,.98)" : "rgba(255,74,88,.98)");
      glow.addColorStop(0.55, warden ? "rgba(35,175,190,.48)" : "rgba(194,18,55,.48)");
      glow.addColorStop(1, warden ? "rgba(20,112,125,0)" : "rgba(120,0,32,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius * 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = warden ? "#e8ffff" : "#ffd8ae";
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1.1, radius * 0.42), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawCreature(ctx: CanvasRenderingContext2D, creature: Creature, now: number) {
  const speciesScale = creatureVisualScale(creature);
  const baby = isBabyAnimal(creature, now);
  const scale = speciesScale * (baby ? 0.58 : 1);
  const flying = isAnimal(creature.kind) && ANIMAL_DATA[creature.kind].flying;
  const leapElapsed = creature.kind === "brute" && creature.abilityStartedAt > 0
    ? now - creature.abilityStartedAt
    : -1;
  const leapProgress = leapElapsed >= BRUTE_LEAP_WINDUP_MS
    ? Math.max(0, Math.min(1, (leapElapsed - BRUTE_LEAP_WINDUP_MS) / BRUTE_LEAP_TRAVEL_MS))
    : 0;
  const leapHeight = leapElapsed >= BRUTE_LEAP_WINDUP_MS
    ? Math.sin(leapProgress * Math.PI) * 34
    : 0;
  const bob = Math.sin(now / (flying ? 150 : 230) + creature.phase) * (flying ? 5 : 2) -
    (flying ? 5 : 0) - leapHeight;
  if (creature.kind === "brute" && creature.abilityStartedAt > 0) {
    const telegraphProgress = Math.max(
      0,
      Math.min(1, leapElapsed / (BRUTE_LEAP_WINDUP_MS + BRUTE_LEAP_TRAVEL_MS)),
    );
    ctx.save();
    ctx.translate(creature.abilityTargetX, creature.abilityTargetY);
    ctx.fillStyle = `rgba(207,74,60,${0.08 + telegraphProgress * 0.1})`;
    ctx.strokeStyle = `rgba(255,159,91,${0.55 + telegraphProgress * 0.4})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, BRUTE_LEAP_IMPACT_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  if (isDreadTitan(creature) && creature.abilityStartedAt > 0) {
    const stompProgress = Math.max(0, Math.min(1, (now - creature.abilityStartedAt) / DREAD_TITAN_STOMP_WINDUP_MS));
    ctx.save();
    ctx.translate(creature.x, creature.y);
    ctx.fillStyle = `rgba(123,69,154,${0.08 + stompProgress * 0.14})`;
    ctx.strokeStyle = `rgba(239,201,102,${0.48 + stompProgress * 0.48})`;
    ctx.lineWidth = 4 + stompProgress * 5;
    ctx.setLineDash([18, 11]);
    ctx.beginPath();
    ctx.arc(0, 0, DREAD_TITAN_STOMP_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = `rgba(132,220,214,${0.35 + stompProgress * 0.45})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, DREAD_TITAN_RADIUS + stompProgress * (DREAD_TITAN_STOMP_RADIUS - DREAD_TITAN_RADIUS), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.save();
  ctx.translate(creature.x, creature.y + bob);
  ctx.scale(scale, scale);
  ctx.fillStyle = flying ? "rgba(12,27,24,.14)" : "rgba(12,27,24,.23)";
  ctx.beginPath();
  ctx.ellipse(5, isDreadTitan(creature) ? 31 : 14, isDreadTitan(creature) ? 91 : 25, isDreadTitan(creature) ? 48 : 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(creature.dir);
  if (isAnimal(creature.kind)) {
    drawTopDownAnimal(ctx, creature, now);
  } else {
    drawMonsterCreature(ctx, creature, now);
    if (isBroodMother(creature) && creature.rangedChargeUntil > now) {
      const chargeProgress = Math.max(0, Math.min(1, 1 - (creature.rangedChargeUntil - now) / BOSS_RANGED_WINDUP_MS));
      const chargePulse = 0.75 + Math.sin(now / 42) * 0.25;
      ctx.strokeStyle = "rgba(229,222,205,.92)";
      ctx.lineWidth = 3 + chargeProgress * 2;
      ctx.beginPath();
      ctx.arc(0, 0, 40 + chargeProgress * 7, -Math.PI * 0.78, Math.PI * 0.78);
      ctx.stroke();
      const chargeGlow = ctx.createRadialGradient(42, 0, 1, 42, 0, 15);
      chargeGlow.addColorStop(0, "#fffdf0");
      chargeGlow.addColorStop(0.28, "#d8d0c5");
      chargeGlow.addColorStop(1, "rgba(114,79,112,0)");
      ctx.fillStyle = chargeGlow;
      ctx.beginPath();
      ctx.arc(42, 0, (7 + chargeProgress * 7) * chargePulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(239,233,220,.72)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(48, 0);
      ctx.lineTo(73 + chargeProgress * 12, 0);
      ctx.stroke();
    } else if (isDreadTitan(creature) && creature.rangedChargeUntil > now) {
      const chargeProgress = Math.max(0, Math.min(1, 1 - (creature.rangedChargeUntil - now) / DREAD_TITAN_BARRAGE_WINDUP_MS));
      ctx.strokeStyle = `rgba(110,231,221,${0.55 + chargeProgress * 0.4})`;
      ctx.lineWidth = 4 + chargeProgress * 3;
      ctx.setLineDash([9, 7]);
      for (let ring = 0; ring < 3; ring++) {
        ctx.beginPath();
        ctx.arc(0, 0, 73 + ring * 14 + chargeProgress * 9, ring * 0.8 + now / 330, ring * 0.8 + now / 330 + Math.PI * 1.35);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
  }
  ctx.rotate(-creature.dir);
  if (isDreadTitan(creature)) {
    ctx.fillStyle = "#d8f9f3";
    ctx.font = "900 13px Arial";
    ctx.textAlign = "center";
    ctx.fillText("DREAD TITAN", 0, -82);
  } else if (isBroodMother(creature)) {
    ctx.fillStyle = "#f0d9b0";
    ctx.font = "900 11px Arial";
    ctx.textAlign = "center";
    ctx.fillText("BROOD MOTHER", 0, -57);
  } else if (creature.kind === "aetherWarden") {
    ctx.fillStyle = "#bffcff";
    ctx.font = "900 9px Arial";
    ctx.textAlign = "center";
    ctx.fillText("AETHER WARDEN", 0, -52);
  }
  if (isAnimal(creature.kind)) {
    if (baby) {
      ctx.fillStyle = "#f4d788";
      ctx.font = "900 11px Arial";
      ctx.textAlign = "center";
      ctx.fillText("BABY", 0, -46);
    } else if (creature.fed > 0) {
      ctx.fillStyle = "#ef6b67";
      ctx.font = "bold 15px Arial";
      ctx.textAlign = "center";
      ctx.fillText("♥ " + creature.fed + "/" + ANIMAL_FEEDS_TO_BREED, 0, -41);
    }
  }
  if (creature.hp < creature.maxHp) {
    const healthWidth = isDreadTitan(creature) ? 126 : creature.boss ? 72 : 44;
    const healthY = isDreadTitan(creature) ? -72 : creature.boss ? -49 : -39;
    ctx.fillStyle = "#1d2a27";
    roundedRect(ctx, -healthWidth / 2, healthY, healthWidth, 5, 3);
    ctx.fill();
    ctx.fillStyle = "#e45e55";
    roundedRect(ctx, -healthWidth / 2, healthY, healthWidth * Math.max(0, creature.hp / creature.maxHp), 5, 3);
    ctx.fill();
  }
  ctx.restore();
  drawCaveMonsterAttack(ctx, creature, now);
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

function drawBuilding(ctx: CanvasRenderingContext2D, building: Building, alpha = 1, now = performance.now()) {
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
  } else if (kind === "laboratory") {
    ctx.fillStyle = "rgba(25,35,31,.25)";
    ctx.beginPath();
    ctx.ellipse(3, 15, 29, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#526762";
    ctx.strokeStyle = "#263b37";
    ctx.lineWidth = 4;
    roundedRect(ctx, -25, -21, 50, 42, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#203b34";
    roundedRect(ctx, -19, -16, 38, 23, 6);
    ctx.fill();
    ctx.stroke();
    const pulse = 9 + Math.sin(now / 240 + building.id) * 1.2;
    ctx.fillStyle = "#bd5fe0";
    ctx.shadowColor = "#dd83f3";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, -5, pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#eab4f8";
    ctx.beginPath();
    ctx.arc(-3, -8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#92aaa3";
    ctx.lineWidth = 3;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 12, 9);
      ctx.lineTo(side * 19, 17);
      ctx.lineTo(side * 24, 17);
      ctx.stroke();
    }
    ctx.fillStyle = "#e3bd59";
    for (const xx of [-12, 0, 12]) {
      ctx.beginPath();
      ctx.arc(xx, 14, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === "chemicalLab") {
    ctx.fillStyle = "rgba(16,31,30,.24)";
    ctx.beginPath();
    ctx.ellipse(4, 15, 31, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#45575a";
    ctx.strokeStyle = "#223235";
    ctx.lineWidth = 4;
    roundedRect(ctx, -24, -18, 48, 37, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#8d9fa0";
    roundedRect(ctx, -26, -21, 52, 10, 4);
    ctx.fill();
    ctx.stroke();
    for (const [flaskX, color] of [[-14, "#e2c44f"], [1, "#61d9df"], [15, "#dc6d65"]] as const) {
      ctx.strokeStyle = "#dce8e5";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(flaskX - 3, -23);
      ctx.lineTo(flaskX - 3, -13);
      ctx.quadraticCurveTo(flaskX - 10, 1, flaskX, 5);
      ctx.quadraticCurveTo(flaskX + 10, 1, flaskX + 3, -13);
      ctx.lineTo(flaskX + 3, -23);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha * 0.9;
      ctx.fill();
      ctx.stroke();
    }
    ctx.globalAlpha = alpha * (0.38 + building.construction * 0.62);
    ctx.strokeStyle = "#80c7c9";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-14, -26);
    ctx.quadraticCurveTo(0, -34, 15, -26);
    ctx.stroke();
  } else if (kind === "mineralGrower") {
    const activeRecipe = building.processMaterial ? MINERAL_GROWTH_RECIPES[building.processMaterial] : null;
    const ready = Boolean(activeRecipe && now >= building.triggerAt);
    const glow = activeRecipe ? (ready ? 0.78 : 0.48 + Math.sin(now / 180) * 0.12) : 0.18;
    ctx.fillStyle = "rgba(29,232,224," + glow * 0.18 + ")";
    ctx.beginPath();
    ctx.arc(0, 0, 33, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#415458";
    ctx.strokeStyle = "#1b2c30";
    ctx.lineWidth = 5;
    ctx.beginPath();
    for (let point = 0; point < 8; point++) {
      const angle = (point / 8) * Math.PI * 2 + Math.PI / 8;
      const px = Math.cos(angle) * 27;
      const py = Math.sin(angle) * 27;
      if (point === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#15282b";
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = activeRecipe ? "#83edf2" : "#71898a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.stroke();
    if (building.processMaterial) {
      ctx.shadowColor = ready ? "#d9ffff" : "#58d8df";
      ctx.shadowBlur = ready ? 18 : 10;
      ctx.fillStyle = building.processMaterial === "sulfur"
        ? "#ead851"
        : building.processMaterial === "copper"
          ? "#d98255"
          : building.processMaterial === "coal"
            ? "#536566"
            : building.processMaterial === "aetherium"
              ? "#68e4ed"
              : "#c8d5d3";
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(11, -2);
      ctx.lineTo(6, 11);
      ctx.lineTo(-8, 9);
      ctx.lineTo(-12, -4);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = "transparent";
    } else {
      ctx.fillStyle = "#75898a";
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    }
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
    const flicker = Math.sin(now / 85 + building.id) * 2;
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
    const flicker = Math.sin(now / 95 + building.id) * 2.5;
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

function drawBroodWeb(ctx: CanvasRenderingContext2D, web: BroodWeb, now: number) {
  const remaining = web.expiresAt === 0
    ? 1
    : Math.max(0, Math.min(1, (web.expiresAt - now) / BROOD_WEB_DURATION_MS));
  const alpha = web.expiresAt === 0 ? 0.62 : 0.24 + remaining * 0.52;
  const rotation = seeded(web.id, 883) * Math.PI * 2;
  ctx.save();
  ctx.translate(web.x, web.y);
  ctx.rotate(rotation);
  ctx.fillStyle = `rgba(111,76,105,${0.1 * alpha})`;
  ctx.beginPath();
  ctx.arc(0, 0, web.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `rgba(229,225,211,${alpha})`;
  ctx.lineCap = "round";
  for (let strand = 0; strand < 12; strand++) {
    const angle = (strand / 12) * Math.PI * 2;
    const length = web.radius * (0.84 + seeded(strand + web.id, 887) * 0.16);
    ctx.lineWidth = strand % 3 === 0 ? 2.3 : 1.4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
    ctx.stroke();
  }
  ctx.lineWidth = 1.5;
  for (const ring of [0.26, 0.48, 0.7, 0.91]) {
    ctx.beginPath();
    for (let strand = 0; strand <= 12; strand++) {
      const angle = (strand / 12) * Math.PI * 2;
      const wobble = 1 + Math.sin(strand * 2.7 + web.id) * 0.045;
      const x = Math.cos(angle) * web.radius * ring * wobble;
      const y = Math.sin(angle) * web.radius * ring * wobble;
      if (strand === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.fillStyle = `rgba(242,236,220,${Math.min(0.9, alpha + 0.18)})`;
  for (const [x, y, radius] of [[0, 0, 4], [-12, 7, 2.8], [10, -9, 2.4]] as const) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawProjectile(ctx: CanvasRenderingContext2D, projectile: Projectile, now: number) {
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
  } else if (projectile.kind === "titanShard") {
    const pulse = 0.86 + Math.sin(now / 52 + projectile.id) * 0.14;
    const trail = ctx.createLinearGradient(-48, 0, 10, 0);
    trail.addColorStop(0, "rgba(91,64,142,0)");
    trail.addColorStop(0.62, "rgba(114,88,174,.65)");
    trail.addColorStop(1, "rgba(105,225,215,.95)");
    ctx.strokeStyle = trail;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-50, 0);
    ctx.lineTo(4, 0);
    ctx.stroke();
    ctx.fillStyle = "#6fe2d7";
    ctx.strokeStyle = "#261b42";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(18 * pulse, 0);
    ctx.lineTo(-2, -9);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-2, 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (projectile.kind === "broodWeb") {
    const pulse = 0.84 + Math.sin(now / 45 + projectile.id) * 0.16;
    const trail = ctx.createLinearGradient(-42, 0, 9, 0);
    trail.addColorStop(0, "rgba(215,209,196,0)");
    trail.addColorStop(0.55, "rgba(215,209,196,.45)");
    trail.addColorStop(1, "rgba(248,243,224,.92)");
    ctx.strokeStyle = trail;
    ctx.lineWidth = 3;
    for (const offset of [-5, 0, 5]) {
      ctx.beginPath();
      ctx.moveTo(-42, offset * 0.25);
      ctx.quadraticCurveTo(-16, offset * 1.4, 3, offset * 0.4);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(235,229,214,.4)";
    ctx.beginPath();
    ctx.arc(7, 0, 16 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d7d0c3";
    ctx.strokeStyle = "#fff9e8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(7, 0, 9 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(99,73,92,.65)";
    ctx.lineWidth = 1.5;
    for (let strand = 0; strand < 5; strand++) {
      const angle = (strand / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(7, 0);
      ctx.lineTo(7 + Math.cos(angle) * 9, Math.sin(angle) * 9);
      ctx.stroke();
    }
  } else {
    const chimera = projectile.bulletStyle === "chimera";
    const sniper = projectile.bulletStyle === "sniper";
    const pellet = projectile.bulletStyle === "pellet";
    if (chimera) {
      const pulse = 0.88 + Math.sin(now / 55 + projectile.id) * 0.12;
      const trail = ctx.createLinearGradient(-54, 0, 8, 0);
      trail.addColorStop(0, "rgba(196,80,221,0)");
      trail.addColorStop(0.65, "rgba(196,80,221,.62)");
      trail.addColorStop(1, "rgba(139,245,235,.94)");
      ctx.strokeStyle = trail;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(-56, 0);
      ctx.quadraticCurveTo(-18, Math.sin(now / 65) * 5, 7, 0);
      ctx.stroke();
      ctx.fillStyle = "rgba(202,91,228,.34)";
      ctx.beginPath();
      ctx.arc(9, 0, 18 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#91f3eb";
      ctx.strokeStyle = "#f0b6fa";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(9, 0, 9 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(225,132,241,.75)";
      ctx.lineWidth = 2;
      for (let tendril = -1; tendril <= 1; tendril++) {
        ctx.beginPath();
        ctx.moveTo(-3, tendril * 4);
        ctx.quadraticCurveTo(-13, tendril * 9, -24, tendril * 5);
        ctx.stroke();
      }
    } else {
      const trailLength = sniper ? 48 : pellet ? 18 : 28;
      const trail = ctx.createLinearGradient(-trailLength, 0, 10, 0);
      trail.addColorStop(0, sniper ? "rgba(99,222,235,0)" : "rgba(255,211,91,0)");
      trail.addColorStop(1, sniper ? "rgba(172,251,255,.98)" : "rgba(255,239,169,.95)");
      ctx.strokeStyle = trail;
      ctx.lineWidth = sniper ? 7 : pellet ? 3 : 5;
      ctx.beginPath();
      ctx.moveTo(-trailLength - 2, 0);
      ctx.lineTo(6, 0);
      ctx.stroke();
      ctx.fillStyle = sniper ? "#d8fdff" : "#fff4bd";
      ctx.beginPath();
      ctx.arc(8, 0, sniper ? 5 : pellet ? 2.5 : 4, 0, Math.PI * 2);
      ctx.fill();
    }
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
  now: number,
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

  const revealConeLayer = (
    worldX: number,
    worldY: number,
    direction: number,
    radius: number,
    halfAngle: number,
    opacity: number,
  ) => {
    const x = offsetX + worldX * scale;
    const y = offsetY + worldY * scale;
    const screenRadius = radius * scale;
    if (x + screenRadius < 0 || y + screenRadius < 0 || x - screenRadius > width || y - screenRadius > height) return;
    const occluders = collectLightOccluders(game, game.realm, worldX, worldY, radius);
    const angleOffsets = lightVisibilityAngles(worldX, worldY, occluders)
      .map((angle) => angleDifference(angle, direction))
      .filter((offset) => Math.abs(offset) < halfAngle);
    angleOffsets.push(-halfAngle, halfAngle);
    angleOffsets.sort((a, b) => a - b);

    light.save();
    light.beginPath();
    light.moveTo(x, y);
    for (const offset of angleOffsets) {
      const angle = direction + offset;
      const distance = lightRayDistance(game.realm, worldX, worldY, angle, radius, occluders);
      light.lineTo(
        offsetX + (worldX + Math.cos(angle) * distance) * scale,
        offsetY + (worldY + Math.sin(angle) * distance) * scale,
      );
    }
    light.closePath();
    light.clip();
    light.globalAlpha = opacity;
    const gradient = light.createRadialGradient(x, y, 24 * scale, x, y, screenRadius);
    gradient.addColorStop(0, "rgba(0,0,0,1)");
    gradient.addColorStop(0.58, "rgba(0,0,0,.82)");
    gradient.addColorStop(0.84, "rgba(0,0,0,.36)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    light.fillStyle = gradient;
    light.fillRect(x - screenRadius, y - screenRadius, screenRadius * 2, screenRadius * 2);
    light.restore();
  };

  reveal(game.player.x, game.player.y, PLAYER_LIGHT_RADIUS[game.realm], 25);
  revealConeLayer(
    game.player.x,
    game.player.y,
    game.player.dir,
    PLAYER_VISION_CONE_RANGE[game.realm],
    PLAYER_VISION_CONE_HALF_ANGLE,
    0.58,
  );
  revealConeLayer(
    game.player.x,
    game.player.y,
    game.player.dir,
    PLAYER_VISION_CONE_RANGE[game.realm],
    PLAYER_VISION_CONE_HALF_ANGLE * 0.76,
    0.78,
  );
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
      creature.kind === "aetherWarden" &&
      creature.hp > 0
    ) reveal(creature.x, creature.y, 118, 24);
    if (
      creature.realm === game.realm &&
      creature.boss &&
      creature.hp > 0 &&
      creature.rangedChargeUntil > now
    ) reveal(creature.x, creature.y, 145, 36);
  });
  game.projectiles.forEach((projectile) => {
    if (projectile.realm === game.realm && projectile.kind === "broodWeb") {
      reveal(projectile.x, projectile.y, 72, 16);
    }
  });

  light.globalCompositeOperation = "source-over";
  ctx.drawImage(lightingLayer, 0, 0, width, height);
}

function hallucinationObjectAlpha(game: GameState, now: number, key: number) {
  if (game.hallucinatingUntil <= now) return 1;
  const offset = (Math.imul(key ^ 811, 2_654_435_761) >>> 0) % HALLUCINATION_FLICKER_PERIOD_MS;
  const phase = (now + offset) % HALLUCINATION_FLICKER_PERIOD_MS;
  if (phase < 820 || phase >= 1_940) return 1;
  if (phase < 1_040) return 1 - (phase - 820) / 220;
  if (phase < 1_700) return 0;
  return (phase - 1_700) / 240;
}

function drawHallucinatingObject(
  ctx: CanvasRenderingContext2D,
  game: GameState,
  now: number,
  key: number,
  draw: () => void,
) {
  const alpha = hallucinationObjectAlpha(game, now, key);
  if (alpha <= 0.01) return;
  if (alpha >= 0.99) {
    draw();
    return;
  }
  ctx.save();
  ctx.globalAlpha *= alpha;
  draw();
  ctx.restore();
}

function hallucinationPhantoms(game: GameState, now: number) {
  if (game.hallucinatingUntil <= now) return [];
  const kinds: Exclude<MonsterKind, "aetherWarden">[] = ["shade", "crawler", "brute", "stalker", "wraith", "maw"];
  const phantoms: { creature: Creature; alpha: number }[] = [];
  const cycleDuration = 1_900;

  for (let index = 0; index < HALLUCINATION_PHANTOM_COUNT; index++) {
    const shiftedNow = now + index * 347;
    const cycle = Math.floor(shiftedNow / cycleDuration);
    const localTime = shiftedNow % cycleDuration;
    if (localTime < 120 || localTime > 1_560) continue;
    const progress = (localTime - 120) / 1_440;
    const fadeIn = Math.min(1, progress / 0.14);
    const fadeOut = Math.min(1, (1 - progress) / 0.2);
    const alpha = Math.max(0, Math.min(fadeIn, fadeOut)) * 0.94;
    const seed = cycle * HALLUCINATION_PHANTOM_COUNT + index;
    const kind = kinds[Math.floor(seeded(seed, 823) * kinds.length)];
    const stats = MONSTER_DATA[kind];
    const angle = seeded(seed, 824) * Math.PI * 2;
    const startingRadius = 190 + seeded(seed, 825) * 340;
    const radius = startingRadius - progress * (90 + seeded(seed, 826) * 90);
    const sideways = Math.sin(progress * Math.PI * 3 + seeded(seed, 827) * Math.PI * 2) * 34;
    const x = Math.max(35, Math.min(WORLD_W - 35, game.player.x + Math.cos(angle) * radius - Math.sin(angle) * sideways));
    const y = Math.max(35, Math.min(WORLD_H - 35, game.player.y + Math.sin(angle) * radius + Math.cos(angle) * sideways));
    phantoms.push({
      alpha,
      creature: {
        id: -(seed + 1),
        kind,
        realm: game.realm,
        x,
        y,
        hp: stats.hp,
        maxHp: stats.hp,
        speed: stats.speed,
        damage: 0,
        fed: 0,
        maturesAt: 0,
        breedReadyAt: 0,
        angry: true,
        hitAt: 0,
        attackAt: 0,
        phase: seeded(seed, 828) * Math.PI * 2,
        slowUntil: 0,
        rewarded: true,
        dir: Math.atan2(game.player.y - y, game.player.x - x),
        structureHitAt: 0,
        rangedAt: 0,
        rangedChargeUntil: 0,
        rangedAim: 0,
        boss: false,
        homeX: x,
        homeY: y,
        provokedUntil: 0,
        waryOfPlayer: false,
        respawnAt: 0,
        fleeing: false,
        abilityReadyAt: 0,
        abilityStartedAt: 0,
        abilityTargetX: game.player.x,
        abilityTargetY: game.player.y,
      },
    });
  }
  return phantoms;
}

function drawHallucinationPhantom(
  ctx: CanvasRenderingContext2D,
  phantom: { creature: Creature; alpha: number },
  now: number,
  opacity = 1,
) {
  const jitterX = Math.sin(now / 38 + phantom.creature.phase) * 6;
  const jitterY = Math.cos(now / 47 + phantom.creature.phase) * 4;
  ctx.save();
  ctx.globalAlpha = phantom.alpha * opacity;
  ctx.translate(jitterX, jitterY);
  drawCreature(ctx, phantom.creature, now);
  ctx.restore();
}

function drawWorld(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, game: GameState) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const now = game.paused ? game.pausedAt : performance.now();
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
  game.broodWebs.forEach((web) => {
    if (web.realm === game.realm && (web.expiresAt === 0 || web.expiresAt > now)) {
      drawBroodWeb(ctx, web, now);
    }
  });
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
  const phantoms = hallucinationPhantoms(game, now);
  const visibleBuildings = game.buildings.filter((building) => {
    const center = buildingWorldCenter(building);
    return building.realm === game.realm && onScreen(center.x, center.y);
  });
  visibleBuildings.filter((building) => building.kind === "floor").forEach((building) =>
    drawHallucinatingObject(ctx, game, now, 300_000 + building.id, () => drawBuilding(ctx, building, 1, now)),
  );

  const drawables: { y: number; draw: () => void }[] = [];
  game.nodes.forEach((node) => {
    if (node.realm !== game.realm || node.hp <= 0 || !onScreen(node.x, node.y)) return;
    drawables.push({
      y: node.y,
      draw: () => drawHallucinatingObject(ctx, game, now, node.id, () => {
        if (isTree(node.kind)) drawTree(ctx, node);
        else if (node.kind === "berryBush" || node.kind === "grass" || node.kind === "mushroom") drawBush(ctx, node);
        else drawRock(ctx, node);
        drawResourceHealth(ctx, node);
      }),
    });
  });
  game.drops.forEach((drop) => {
    if (drop.realm !== game.realm || !onScreen(drop.x, drop.y)) return;
    drawables.push({
      y: drop.y + 18,
      draw: () => drawHallucinatingObject(ctx, game, now, 100_000 + drop.id, () => drawGroundDrop(ctx, drop, now)),
    });
  });
  game.treasures.forEach((treasure) => {
    if (treasure.realm === game.realm && onScreen(treasure.x, treasure.y)) {
      drawables.push({
        y: treasure.y,
        draw: () => drawHallucinatingObject(ctx, game, now, 200_000 + treasure.id, () => drawTreasure(ctx, treasure, now)),
      });
    }
  });
  visibleBuildings
    .filter((building) => building.kind !== "floor" && building.kind !== "roof")
    .forEach((building) => drawables.push({
      y: buildingWorldCenter(building).y,
      draw: () => drawHallucinatingObject(
        ctx,
        game,
        now,
        300_000 + building.id,
        () => drawBuilding(ctx, building, 1, now),
      ),
    }));
  game.creatures.forEach((creature) => {
    if (creature.realm === game.realm && creature.hp > 0 && onScreen(creature.x, creature.y)) {
      drawables.push({
        y: creature.y,
        draw: () => drawHallucinatingObject(ctx, game, now, 400_000 + creature.id, () => drawCreature(ctx, creature, now)),
      });
    }
  });
  phantoms.forEach((phantom) => {
    if (!isNight(game) && !inCave && onScreen(phantom.creature.x, phantom.creature.y)) {
      drawables.push({
        y: phantom.creature.y,
        draw: () => drawHallucinationPhantom(ctx, phantom, now),
      });
    }
  });
  game.projectiles.forEach((projectile) => {
    if (projectile.realm === game.realm && onScreen(projectile.x, projectile.y)) {
      drawables.push({ y: projectile.y + 40, draw: () => drawProjectile(ctx, projectile, now) });
    }
  });
  drawables.push({ y: game.player.y, draw: () => drawPlayer(ctx, game) });
  drawables.sort((a, b) => a.y - b.y).forEach((item) => item.draw());
  if (game.attackFlash?.realm === game.realm) {
    drawAttackFlash(ctx, game.attackFlash, now);
  }
  visibleBuildings.filter((building) => building.kind === "roof").forEach((building) =>
    drawHallucinatingObject(ctx, game, now, 300_000 + building.id, () => drawBuilding(ctx, building, 0.78, now)),
  );

  if (game.buildMode) {
    const cell = previewCell(game);
    const valid = validPlacement(game, game.buildMode, cell.gx, cell.gy) &&
      (game.mode === "custom" || game.kits[game.buildMode] > 0);
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
      now,
    );
  }
  ctx.restore();

  if (isNight(game) || inCave) {
    drawDarkness(ctx, width, height, dpr, game, scale, offsetX, offsetY, inCave, now);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    drawMonsterEyeGlints(ctx, game, now, onScreen);
    phantoms.forEach((phantom) => {
      if (onScreen(phantom.creature.x, phantom.creature.y)) {
        drawHallucinationPhantom(ctx, phantom, now, 0.58);
      }
    });
    ctx.restore();
  } else if (game.clock > 0.4) {
    ctx.fillStyle = "rgba(210,126,68," + ((game.clock - 0.4) * 0.9) + ")";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.strokeStyle = "rgba(255,255,255,.07)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
}

function nearbyPrompt(game: GameState) {
  if (game.relaxing) return "RESTING · Time and hunger are moving at 5× speed";
  if (game.buildMode) {
    return "BUILD · Place one " + BUILD_DATA[game.buildMode].name + " · hold Shift to keep placing";
  }
  if (game.selected === "hammer") {
    const target = targetBuilding(game, 118);
    if (target) return "TOOL · Deconstruct " + BUILD_DATA[target.kind].name + " · " + Math.ceil(target.hp) + "/" + target.maxHp + " health";
  }
  if (cookedFoodFor(game.selected) && game.resources[game.selected as RawCookableFood] > 0 && nearbyCompletedCampfire(game)) {
    return "E · Cook " + itemLabel(game.selected) + " at Campfire";
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
      ["woodGate", "stoneGate", "door", "crop", "storageChest", "bedroll", "laboratory", "chemicalLab", "mineralGrower"].includes(item.kind) &&
      distanceToBuilding(item, game.player.x, game.player.y) <= buildingInteractionDistance(item),
  );
  if (building) {
    if (building.kind === "storageChest") return "E · Open Storage Chest";
    if (building.kind === "laboratory") return "E · Use Laboratory";
    if (building.kind === "chemicalLab") return "E · Use Chemical Lab";
    if (building.kind === "mineralGrower") return "E · Open Mineral Grower";
    if (building.kind === "bedroll") return "E · Rest at Bedroll";
    if (building.kind === "crop") return "E · " + (building.growth >= 1 ? "Harvest crop" : "Check crop");
    return "E · " + (building.open ? "Close" : "Open") + " " + BUILD_DATA[building.kind].name;
  }
  const creature = nearestFeedableAnimal(game);
  if (creature && isAnimal(creature.kind)) {
    if (isPermanentlyWaryPrey(creature.kind) && creature.waryOfPlayer) {
      return "F · This " + animalName(creature.kind) + " is wary and refuses food";
    }
    if (creature.breedReadyAt > performance.now()) {
      return "F · " + animalName(creature.kind) + " needs time before breeding again";
    }
    const food = animalLureFood(creature.kind);
    if (!isHoldingAnimalLure(game, creature.kind)) {
      return "F · Select " + food + " to feed this " + animalName(creature.kind);
    }
    return "F · Feed " + food + " to " + animalName(creature.kind) + " · " + creature.fed + "/" + ANIMAL_FEEDS_TO_BREED;
  }
  if (isFoodItem(game.selected) && game.resources[game.selected] > 0) return "E · Eat " + itemLabel(game.selected);
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
    detail: "Long reach · 17 damage · 72 durability",
    cost: { wood: 5, stone: 3 },
    action: (game) => {
      game.gear.spear = true;
      game.weapon = "spear";
      addDurableTool(game, "spear");
    },
  },
  {
    id: "sword",
    name: "Iron Sword",
    detail: "Fast swing · 25 damage · 120 durability",
    cost: { wood: 4, iron: 7 },
    requiresBench: true,
    action: (game) => {
      game.gear.sword = true;
      game.weapon = "sword";
      addDurableTool(game, "sword");
    },
  },
  {
    id: "bow",
    name: "Hunting Bow",
    detail: "520 range · 18–32 charged damage · 360 durability",
    cost: { wood: 6, fiber: 4, copper: 2 },
    requiresBench: true,
    action: (game) => {
      game.gear.bow = true;
      game.weapon = "bow";
      addDurableTool(game, "bow");
    },
  },
  {
    id: "ironBow",
    name: "Iron Bow",
    detail: "Tier 2 · 600 range · 28–49 charged damage · 540 durability",
    cost: { wood: 6, fiber: 4, iron: 5 },
    requiresBench: true,
    action: (game) => {
      game.gear.ironBow = true;
      game.weapon = "ironBow";
      addDurableTool(game, "ironBow");
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
    detail: "660 range · 54 damage · 720 durability · stronger per shot than a fully drawn Iron Bow",
    cost: { iron: 8, copper: 6, coal: 3, sulfur: 2 },
    requiresBench: true,
    action: (game) => {
      game.gear.pistol = true;
      game.weapon = "pistol";
      addDurableTool(game, "pistol");
    },
  },
  {
    id: "smg",
    name: "Compact SMG",
    detail: "540 range · 30 damage · 2400 durability · extremely fast automatic fire",
    cost: { iron: 10, copper: 9, sulfur: 2 },
    requiresBench: true,
    prerequisite: (game) => game.gear.pistol,
    prerequisiteLabel: "Need pistol",
    action: (game) => {
      game.gear.smg = true;
      game.weapon = "smg";
      addDurableTool(game, "smg");
    },
  },
  {
    id: "shotgun",
    name: "Scattergun",
    detail: "430 range · five 24-damage pellets · 900 durability · heavy close-range spread",
    cost: { wood: 6, iron: 12, copper: 4, sulfur: 4 },
    requiresBench: true,
    prerequisite: (game) => game.gear.pistol,
    prerequisiteLabel: "Need pistol",
    action: (game) => {
      game.gear.shotgun = true;
      game.weapon = "shotgun";
      addDurableTool(game, "shotgun");
    },
  },
  {
    id: "rifle",
    name: "Assault Rifle",
    detail: "Guardian tier · 760 range · 62 damage · 1200 durability · rapid automatic fire",
    cost: { guardianCore: 1, aetherium: 6, iron: 12, copper: 8 },
    requiresBench: true,
    prerequisite: (game) => game.gear.pistol,
    prerequisiteLabel: "Need pistol",
    action: (game) => {
      game.gear.rifle = true;
      game.weapon = "rifle";
      addDurableTool(game, "rifle");
    },
  },
  {
    id: "sniper",
    name: "Sniper Rifle",
    detail: "1250 range · 145 damage · 900 durability · slow precision shot with a cyan tracer",
    cost: { iron: 18, copper: 10, aetherium: 4 },
    requiresBench: true,
    prerequisite: (game) => game.gear.rifle,
    prerequisiteLabel: "Need Assault Rifle",
    action: (game) => {
      game.gear.sniper = true;
      game.weapon = "sniper";
      addDurableTool(game, "sniper");
    },
  },
  {
    id: "chimera",
    name: "Chimera Cannon",
    detail: "Alien super weapon · 120 impact damage · 52-damage pulse · 1200 durability",
    cost: { aetherium: 6, carapacePlate: 4, neuralGel: 4, livingWeave: 2 },
    requiresBench: true,
    requiresResearch: "xenoBallistics",
    action: (game) => {
      game.gear.chimera = true;
      game.weapon = "chimera";
      addDurableTool(game, "chimera");
    },
  },
  {
    id: "bullets",
    name: "Bullet Bundle ×12",
    detail: "Shared ammunition for every firearm",
    cost: { iron: 2, coal: 1, sulfur: 2 },
    requiresLab: true,
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
    owned: (game) => game.gear.armor === "iron" || game.gear.armor === "blacksteel" || game.gear.armor === "symbiote",
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
    owned: (game) => game.gear.armor === "blacksteel" || game.gear.armor === "symbiote",
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
    id: "carapaceAxe",
    name: "Carapace Axe",
    detail: "6 chopping damage · 30 combat damage · 240 durability",
    cost: { wood: 4, iron: 2, carapacePlate: 3 },
    requiresBench: true,
    requiresResearch: "carapaceAxe",
    action: (game) => {
      addDurableTool(game, "carapaceAxe");
    },
  },
  {
    id: "tendrilBlade",
    name: "Tendril Blade",
    detail: "Living weapon · 36 damage · 112 reach · 240 durability",
    cost: { iron: 4, neuralGel: 3, livingWeave: 2 },
    requiresBench: true,
    requiresResearch: "tendrilBlade",
    action: (game) => {
      game.gear.tendrilBlade = true;
      game.weapon = "tendrilBlade";
      addDurableTool(game, "tendrilBlade");
    },
  },
  {
    id: "symbioteArmor",
    name: "Symbiote Armor",
    detail: "Living armor · reduces incoming damage by 68%",
    cost: { iron: 4, hide: 4, carapacePlate: 2, livingWeave: 4 },
    requiresBench: true,
    requiresResearch: "symbioteArmor",
    owned: (game) => game.gear.armor === "symbiote",
    action: (game) => {
      game.gear.armor = "symbiote";
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
    requiresBench: kind !== "mineralGrower" && !["craftingBench", "storageChest", "bedroll", "torch", "campfire", "woodFence", "floor", "woodWall", "crop"].includes(kind),
    requiresLab: kind === "mineralGrower",
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
      biomass: { head: "#9a4dbc", edge: "#edb5fa", outline: "#3f244b" },
    };
    const palette = colors[material];
    const axeHead: Record<ToolTier, string> = {
      none: "M28 17 L22 13 L8 20 Q14 8 25 2 L32 14 L37 18 L35 26 L29 27 Z",
      wood: "M28 17 L23 14 L10 20 Q15 10 25 4 L32 14 L37 18 L34 26 L29 27 Z",
      stone: "M28 17 L21 13 L7 20 L11 11 L24 2 L32 14 L38 18 L35 27 L29 27 Z",
      iron: "M28 17 L21 12 Q10 13 4 20 Q12 7 25 1 L32 14 L38 18 L35 27 L29 27 Z",
      aetherium: "M28 17 L20 12 L5 20 L10 10 L19 8 L24 0 L31 7 L32 14 L39 18 L35 28 L29 27 Z",
      biomass: "M28 17 L19 13 Q10 15 5 22 Q12 8 23 3 Q28 0 32 8 L33 14 L40 18 L36 29 L29 27 Z",
    };
    const axeEdge: Record<ToolTier, string> = {
      none: "M8 20 Q14 8 25 2",
      wood: "M10 20 Q15 10 25 4",
      stone: "M7 20 L11 11 L24 2",
      iron: "M4 20 Q12 7 25 1",
      aetherium: "M5 20 L10 10 L19 8 L24 0",
      biomass: "M5 22 Q12 8 23 3",
    };
    const pickCurve = material === "wood" ? "M5 21 Q25 8 47 16" : material === "stone" ? "M4 22 Q25 6 48 16" : material === "aetherium" || material === "biomass" ? "M3 23 Q25 4 49 15" : "M4 22 Q25 5 48 15";
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
  if (type === "sword") {
    return (
      <span className={"tool-glyph tool-sword" + (tier ? " tier-" + tier : "")} aria-hidden="true">
        <svg className="tool-svg" viewBox="0 0 52 52" focusable="false">
          {tier === "biomass" ? (
            <g transform="rotate(40 26 26)">
              <path d="M26 1 Q38 9 31 31 L21 31 Q14 10 26 1 Z" fill="#9f52bd" stroke="#3e2549" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M26 5 Q30 17 25 28" fill="none" stroke="#efb9f8" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="29" cy="13" r="2.2" fill="#edb5fa" />
              <rect x="13" y="29" width="26" height="6" rx="3" fill="#795338" stroke="#412f25" strokeWidth="2" />
              <rect x="22" y="34" width="8" height="13" rx="3" fill="#583929" stroke="#35261f" strokeWidth="2" />
              <circle cx="26" cy="48" r="4" fill="#9850b7" stroke="#43264d" strokeWidth="2" />
            </g>
          ) : (
            <g transform="rotate(40 26 26)">
              <path d="M26 1 L33 9 L31 31 L21 31 L19 9 Z" fill="#dce6e3" stroke="#33443f" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M26 5 L26 28 L31 11" fill="none" stroke="#f6faf8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="13" y="29" width="26" height="6" rx="3" fill="#d6a94b" stroke="#5b4525" strokeWidth="2" />
              <rect x="22" y="34" width="8" height="13" rx="3" fill="#68432e" stroke="#35261f" strokeWidth="2" />
              <path d="M22 38 L30 38 M22 42 L30 42" stroke="#d6a94b" strokeWidth="1.5" />
              <circle cx="26" cy="48" r="4" fill="#d6a94b" stroke="#5b4525" strokeWidth="2" />
            </g>
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
          : recipe.id.startsWith("carapace") || recipe.id.startsWith("tendril")
            ? "biomass"
          : undefined;
  if (recipe.id.toLowerCase().includes("axe")) return <ToolGlyph type="axe" tier={tier} />;
  if (recipe.id.toLowerCase().includes("pick")) return <ToolGlyph type="pickaxe" tier={tier} />;
  if (recipe.id === "hammer") return <ToolGlyph type="hammer" />;
  if (recipe.id === "spear") return <ToolGlyph type="spear" />;
  if (recipe.id === "sword" || recipe.id === "tendrilBlade") return <ToolGlyph type="sword" tier={tier} />;
  if (recipe.id === "bow" || recipe.id === "ironBow") return <ToolGlyph type="bow" tier={tier} />;
  if (["pistol", "smg", "shotgun", "rifle", "sniper", "chimera"].includes(recipe.id)) return <ToolGlyph type={recipe.id as Firearm} />;
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
  if (item === "tendrilBlade") {
    return <ToolGlyph type="sword" tier="biomass" />;
  }
  if (["hammer", "spear", "sword", "bow", "pistol", "smg", "shotgun", "rifle", "sniper", "chimera"].includes(item)) {
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
  const pauseResumeRef = useRef<HTMLButtonElement>(null);
  const gameRef = useRef<GameState>(makeGame());
  const [panel, setPanel] = useState<Panel>(null);
  const [started, setStarted] = useState(false);
  const [revision, setRevision] = useState(0);
  const [moveSource, setMoveSource] = useState<SlotAddress | null>(null);
  const [customDayInput, setCustomDayInput] = useState("");
  const game = gameRef.current;
  const openChest = game.buildings.find(
    (building) => building.id === game.openChestId && building.kind === "storageChest",
  );
  const openLaboratory = game.buildings.find(
    (building) => building.id === game.openLaboratoryId && building.kind === "laboratory" && building.construction >= 1,
  );
  const openGrower = game.buildings.find(
    (building) => building.id === game.openGrowerId && building.kind === "mineralGrower" && building.construction >= 1,
  );
  const activeGrowth = openGrower?.processMaterial ? MINERAL_GROWTH_RECIPES[openGrower.processMaterial] : null;
  const growthRemainingSeconds = activeGrowth && openGrower
    ? mineralGrowthSecondsRemaining(game, openGrower)
    : 0;
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const togglePause = useCallback(() => {
    const currentGame = gameRef.current;
    if (!currentGame.started || currentGame.dead) return;
    const nextPaused = !currentGame.paused;
    setGamePaused(currentGame, nextPaused);
    if (nextPaused) {
      currentGame.openChestId = null;
      currentGame.openLaboratoryId = null;
      currentGame.openGrowerId = null;
      setPanel(null);
      setMoveSource(null);
      requestAnimationFrame(() => pauseResumeRef.current?.focus());
    } else {
      canvasRef.current?.focus();
    }
    refresh();
  }, [refresh]);

  const toggleRelaxing = useCallback(() => {
    const currentGame = gameRef.current;
    if (!currentGame.started || currentGame.dead || currentGame.paused) return;
    const nextRelaxing = !currentGame.relaxing;
    setGameRelaxing(currentGame, nextRelaxing);
    currentGame.openChestId = null;
    currentGame.openLaboratoryId = null;
    currentGame.openGrowerId = null;
    setPanel(null);
    setMoveSource(null);
    canvasRef.current?.focus();
    refresh();
  }, [refresh]);

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
      if (game.started && !game.dead && !game.paused) {
        updateGame(game, dt, canvas.clientWidth, canvas.clientHeight);
      }
      drawWorld(context, canvas, game);
      if (now - lastHud > 120) {
        lastHud = now;
        if (!game.paused && game.messageUntil > 0 && now >= game.messageUntil) game.messageUntil = 0;
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
      if (key === "p") {
        event.preventDefault();
        if (!event.repeat) togglePause();
        return;
      }
      if (game.paused) {
        event.preventDefault();
        return;
      }
      if (game.relaxing) {
        event.preventDefault();
        return;
      }
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
        event.preventDefault();
        game.keys.add(key);
      }
      if (key === "shift") game.keys.add(key);
      if (event.repeat) return;
      if (key === "e") {
        const interaction = interact(game);
        if (interaction === "openCrafting") setPanel("craft");
        else if (game.openChestId !== null || game.openLaboratoryId !== null || game.openGrowerId !== null) setPanel(null);
      }
      if (key === " ") {
        event.preventDefault();
        attack(game);
      }
      if (key === "f") {
        event.preventDefault();
        feedAnimal(game);
      }
      if (["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].includes(key)) {
        selectSlot(game, key === "0" ? 9 : Number(key) - 1);
      }
      if (key === "q") {
        game.openChestId = null;
        game.openLaboratoryId = null;
        game.openGrowerId = null;
        setPanel((value) => (value === "build" ? null : "build"));
      }
      if (key === "c") {
        game.openChestId = null;
        game.openLaboratoryId = null;
        game.openGrowerId = null;
        setPanel((value) => (value === "craft" ? null : "craft"));
      }
      if (key === "i") {
        game.openChestId = null;
        game.openLaboratoryId = null;
        game.openGrowerId = null;
        setPanel((value) => (value === "inventory" ? null : "inventory"));
      }
      if (key === "b") {
        game.openChestId = null;
        game.openLaboratoryId = null;
        game.openGrowerId = null;
        setPanel(null);
        toggleNearbyAutoBuild(game);
      }
      if (key === "escape") {
        cancelBuildMode(game);
        game.openChestId = null;
        game.openLaboratoryId = null;
        game.openGrowerId = null;
        setPanel(null);
      }
      if (key === "=" || key === "+") game.zoom = Math.min(1.55, game.zoom + 0.1);
      if (key === "-") game.zoom = Math.max(0.68, game.zoom - 0.1);
      refresh();
    };
    const up = (event: KeyboardEvent) => game.keys.delete(event.key.toLowerCase());
    const releasePrimary = () => releasePrimaryInput(game, true);
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
  }, [game, refresh, togglePause]);

  const start = (mode: GameMode) => {
    game.mode = mode;
    game.started = true;
    game.dead = false;
    game.paused = false;
    game.pausedAt = 0;
    setStarted(true);
    canvasRef.current?.focus();
    notify(
      game,
      mode === "custom"
        ? "CUSTOM MODE — crafting is free, every building is available, and you control the day."
        : "Day 1 — your Wood Axe is ready in hotbar slot 2.",
      4200,
    );
    refresh();
  };

  const restart = () => {
    gameRef.current = makeGame();
    window.location.reload();
  };

  const pointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (game.paused) return;
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
    if (game.relaxing) return;
    const unrestricted = game.mode === "custom";
    if (!unrestricted && recipe.requiresResearch && !game.research[recipe.requiresResearch]) {
      notify(game, "Research " + RESEARCH_DATA[recipe.requiresResearch].name + " at a Laboratory first.");
      refresh();
      return;
    }
    if (!unrestricted && recipe.requiresBench && !nearCraftingBench(game)) {
      notify(game, "Stand near a placed Crafting Bench to make " + recipe.name + ".");
      refresh();
      return;
    }
    if (!unrestricted && recipe.requiresLab && !nearChemicalLab(game)) {
      notify(game, "Stand near a completed Chemical Lab to make " + recipe.name + ".");
      refresh();
      return;
    }
    if (!unrestricted && recipe.prerequisite && !recipe.prerequisite(game)) {
      notify(game, recipe.name + " is locked · " + (recipe.prerequisiteLabel ?? "another item is required") + ".");
      refresh();
      return;
    }
    if (recipe.owned?.(game)) {
      notify(game, recipe.name + " already crafted.");
      refresh();
      return;
    }
    if (!unrestricted && !canAfford(game, recipe.cost)) {
      notify(game, "Not enough materials for " + recipe.name + ".");
      refresh();
      return;
    }
    if (!unrestricted) pay(game, recipe.cost);
    recipe.action(game);
    notify(game, "Crafted " + recipe.name + (unrestricted ? " for free." : "."));
    refresh();
  };

  const chooseBuild = (kind: BuildKind) => {
    if (game.relaxing) return;
    if (game.mode !== "custom" && game.kits[kind] <= 0) {
      notify(game, "Craft " + BUILD_DATA[kind].name + " in the Craft menu first.");
      refresh();
      return;
    }
    game.buildMode = kind;
    game.openChestId = null;
    game.openLaboratoryId = null;
    game.openGrowerId = null;
    game.selected = "build";
    setPanel(null);
    notify(game, BUILD_DATA[kind].name + " selected — click once, or hold Shift while placing several. Right-click cancels.");
    refresh();
    canvasRef.current?.focus();
  };

  const setCustomDay = () => {
    if (game.mode !== "custom") return;
    const requestedDay = Number(customDayInput);
    if (!Number.isInteger(requestedDay) || requestedDay < 1 || requestedDay > MAX_CUSTOM_DAY) {
      notify(game, "Choose a whole-number day from 1 to " + MAX_CUSTOM_DAY + ".");
      refresh();
      return;
    }
    game.day = requestedDay;
    game.wave = requestedDay - 1;
    game.creatures = game.creatures.filter(
      (creature) => !isMonster(creature.kind) || creature.realm === "caveSystem" || creature.boss,
    );
    setCustomDayInput("");
    if (isNight(game)) {
      spawnNightWave(game);
    } else {
      notify(game, "CUSTOM MODE — set to Day " + requestedDay + ". Night " + requestedDay + " will use that day's wave.", 3600);
    }
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

  const closeLaboratory = () => {
    game.openLaboratoryId = null;
    refresh();
    canvasRef.current?.focus();
  };

  const closeGrower = () => {
    game.openGrowerId = null;
    refresh();
    canvasRef.current?.focus();
  };

  const researchProject = (kind: ResearchKind) => {
    const project = RESEARCH_DATA[kind];
    if (game.research[kind]) {
      notify(game, project.name + " is already researched.");
      refresh();
      return;
    }
    if (game.resources.biomass < project.biomassCost) {
      notify(game, "Need " + project.biomassCost + " Alien Biomass for " + project.name + ".");
      refresh();
      return;
    }
    pay(game, { biomass: project.biomassCost });
    game.research[kind] = true;
    notify(game, project.name + " researched. Its recipe is now available in Crafting.", 3600);
    refresh();
  };

  const processBiomassCompound = (compound: BiomassCompound) => {
    if (!openLaboratory) {
      notify(game, "Open a completed Laboratory to process Alien Biomass.");
      refresh();
      return;
    }
    const process = BIOMASS_PROCESS_DATA[compound];
    if (!canAfford(game, process.cost)) {
      notify(game, "Not enough materials to process " + process.name + ".");
      refresh();
      return;
    }
    pay(game, process.cost);
    addMaterial(game, compound, process.output);
    notify(game, "Processed " + process.output + " " + process.name + ".", 2800);
    refresh();
  };

  const loadMineralGrower = (material: GrowableMineral) => {
    notify(game, startMineralGrowth(game, game.openGrowerId, material), 2600);
    refresh();
  };

  const collectMineralGrower = () => {
    notify(game, collectMineralGrowth(game, game.openGrowerId), 2800);
    refresh();
  };

  const zoom = (amount: number) => {
    game.zoom = Math.max(0.68, Math.min(1.55, game.zoom + amount));
    refresh();
  };

  const holdMove = (key: string, active: boolean) => {
    if (active && !game.relaxing) game.keys.add(key);
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

  const bowChargeLabel = game.bowChargeStartedAt !== null
    ? " · draw " + Math.round(bowChargeRatio(game) * 100) + "%"
    : "";
  const ammunitionLabel = isBowTool(game.selected)
    ? " · " + game.resources.arrows + " arrows" + bowChargeLabel
    : isFirearm(game.selected)
      ? " · " + game.resources.bullets + " bullets"
      : "";
  const toolName = isDurableTool(game.selected)
    ? itemLabel(game.selected, game) + ammunitionLabel + " · " + activeToolDurability(game, game.selected) + "/" +
      DURABLE_TOOL_DATA[game.selected].maxDurability + " durability · " + durableToolCount(game, game.selected) +
      (durableToolCount(game, game.selected) === 1 ? " copy" : " copies")
    : isFoodItem(game.selected)
      ? itemLabel(game.selected, game) + " · " + game.resources[game.selected]
      : game.buildMode
        ? BUILD_DATA[game.buildMode].name
        : itemLabel(game.hotbar[game.selectedSlot], game);
  const feedCandidate = nearestFeedableAnimal(game);
  const feedLabel = feedCandidate && isAnimal(feedCandidate.kind)
    ? "Feed " + animalName(feedCandidate.kind)
    : "Feed animal";
  const prompt = nearbyPrompt(game);
  const promptKey = prompt.startsWith("TOOL")
    ? "HOLD LMB"
    : prompt.startsWith("RESTING")
      ? "5×"
    : prompt.startsWith("BUILD")
      ? "LMB / SHIFT+LMB"
      : prompt.startsWith("F")
        ? "F"
        : "E";
  const promptText = prompt.replace(/^(E|F|TOOL|BUILD|RESTING) · /, "");
  const messageVisible = game.messageUntil > 0;
  const phase = isNight(game) ? "NIGHT" : "DAY";
  const lowHealth = game.started && !game.dead && game.player.hp <= LOW_HEALTH_THRESHOLD;
  const lowHunger = game.started && !game.dead && game.player.hunger <= LOW_HUNGER_THRESHOLD;
  const hallucinating = game.started && !game.dead && game.hallucinatingUntil > 0;

  return (
    <main className={"survival-game" + (game.paused ? " game-paused" : "") + (game.relaxing ? " relaxing" : "") + (hallucinating ? " hallucinating" : "")} data-revision={revision}>
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
          if (game.paused || game.relaxing) return;
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
          releasePrimaryInput(game, true);
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

      {hallucinating && (
        <>
          <div className="hallucination-overlay" aria-hidden="true" />
          <div className="hallucination-status" role="status">
            <strong>HALLUCINATING</strong>
            <span>Reality is unreliable. Shapes may vanish, and enemies may not be real.</span>
          </div>
        </>
      )}

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
          <span>Select food and press <kbd>E</kbd>. Cook raw meat or mushrooms at a Campfire first for a safer, stronger meal.</span>
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
          {MATERIALS.filter((material) => ["wood", "stone", "iron", "copper", "aetherium", "biomass", "berries"].includes(material.id)).map((material) => (
            <div key={material.id} title={material.name}>
              <MaterialIcon material={material.id} />
              <b>{game.resources[material.id]}</b>
              <small>{material.name}</small>
            </div>
          ))}
          <button onClick={() => { game.openChestId = null; game.openLaboratoryId = null; game.openGrowerId = null; setPanel("inventory"); }} aria-label="Open inventory">Inventory <kbd>I</kbd></button>
        </section>
      </div>

      <section className="vitals" aria-label="Player status">
        <div className="vital-row"><span>HEALTH</span><b>{Math.ceil(game.player.hp)}</b><i><em style={{ width: game.player.hp + "%" }} /></i></div>
        <div className="vital-row hunger"><span>HUNGER</span><b>{Math.ceil(game.player.hunger)}</b><i><em style={{ width: game.player.hunger + "%" }} /></i></div>
        <small>{game.kills} threats defeated · {babyAnimalCount(game)} babies · wave {game.wave || "—"} · {game.gear.armor === "none" ? "no armor" : game.gear.armor + " armor"}</small>
      </section>

      <div className="game-controls">
        <section className="zoom-panel" aria-label="Camera zoom">
          <button onClick={() => zoom(0.12)} aria-label="Zoom in">+</button>
          <span>{Math.round(game.zoom * 100)}%</span>
          <button onClick={() => zoom(-0.12)} aria-label="Zoom out">−</button>
        </section>
        {started && !game.dead && game.mode === "custom" && (
          <section className="custom-day-control" aria-label="Custom mode day control">
            <div><small>CUSTOM MODE</small><b>Set day</b></div>
            <input
              type="number"
              min="1"
              max={MAX_CUSTOM_DAY}
              inputMode="numeric"
              value={customDayInput}
              placeholder={String(game.day)}
              onChange={(event) => setCustomDayInput(event.target.value)}
              onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === "Enter") setCustomDay();
              }}
              aria-label={"Day number, 1 to " + MAX_CUSTOM_DAY}
            />
            <button type="button" onClick={setCustomDay}>Set</button>
          </section>
        )}
        {started && !game.dead && (
          <button
            className="feed-button"
            type="button"
            onClick={() => {
              feedAnimal(game);
              refresh();
              canvasRef.current?.focus();
            }}
            disabled={game.paused || game.relaxing}
            aria-label={feedLabel}
          >
            <span aria-hidden="true">●</span>
            <b>{feedLabel}</b>
            <kbd>F</kbd>
          </button>
        )}
        {started && !game.dead && (
          <button
            className={"relax-button" + (game.relaxing ? " active" : "")}
            type="button"
            onClick={toggleRelaxing}
            disabled={game.paused}
            aria-label={game.relaxing ? "Stand up and return time to normal" : "Sit down and relax at five times speed"}
            aria-pressed={game.relaxing}
          >
            <span aria-hidden="true">{game.relaxing ? "↑" : "⌁"}</span>
            <b>{game.relaxing ? "Stand up" : "Sit down and relax"}</b>
            <kbd>{game.relaxing ? "1×" : "5×"}</kbd>
          </button>
        )}
        {started && !game.dead && (
          <button
            className={"pause-button" + (game.paused ? " paused" : "")}
            type="button"
            onClick={togglePause}
            aria-label={game.paused ? "Resume game" : "Pause game"}
            aria-pressed={game.paused}
          >
            <span aria-hidden="true">{game.paused ? "▶" : "Ⅱ"}</span>
            <b>{game.paused ? "Resume" : "Pause"}</b>
            <kbd>P</kbd>
          </button>
        )}
      </div>

      {started && game.paused && !game.dead && (
        <div className="pause-scrim">
          <section className="pause-card" role="dialog" aria-modal="true" aria-labelledby="pause-title">
            <small>SIMULATION FROZEN</small>
            <h2 id="pause-title">Game paused</h2>
            <p>Time, hunger, creatures, crops, projectiles, and construction are stopped.</p>
            <button ref={pauseResumeRef} type="button" onClick={togglePause}>
              Resume game <kbd>P</kbd>
            </button>
          </section>
        </div>
      )}

      {messageVisible && <div className="game-toast">{game.message}</div>}
      {prompt && <div className="interact-prompt"><kbd>{promptKey}</kbd><span>{promptText}</span></div>}
      {game.buildMode && <div className="build-mode-banner"><b>GRID BUILD</b><span>{BUILD_DATA[game.buildMode].name} · {game.mode === "custom" ? "∞ ready" : game.kits[game.buildMode] + " ready"}</span><button onClick={() => { cancelBuildMode(game); refresh(); }}>Cancel <kbd>RMB / Esc</kbd></button></div>}

      <nav className="hotbar" aria-label="Equipment hotbar">
        {game.hotbar.map((_, index) => inventorySlot("hotbar", index, false))}
        <button className="hotbar-pack" onClick={() => { game.openChestId = null; game.openLaboratoryId = null; game.openGrowerId = null; setPanel("inventory"); }} aria-label="Open free inventory">
          <kbd>I</kbd><ToolGlyph type="pack" /><span>Inventory</span>
        </button>
        <div className="equipped-label"><small>EQUIPPED</small><strong>{toolName}</strong></div>
      </nav>

      <aside className="key-guide">
        <span><kbd>WASD</kbd> Move</span>
        <span><kbd>E</kbd> Interact</span>
        <span><kbd>F</kbd> Feed animal</span>
        <span><kbd>SPACE</kbd> Attack</span>
        <span><kbd>HOLD LMB</kbd> Use tool</span>
        <span><kbd>SHIFT+LMB</kbd> Keep building</span>
        <span><kbd>B</kbd> Auto-build nearby</span>
        <span><kbd>C</kbd> Craft</span>
        <span><kbd>P</kbd> Pause</span>
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
        <button className="touch-e" onClick={() => { const interaction = interact(game); if (interaction === "openCrafting") setPanel("craft"); else if (game.openLaboratoryId !== null || game.openGrowerId !== null || game.openChestId !== null) setPanel(null); refresh(); }}>E<small>Interact</small></button>
        <button className="touch-feed" onClick={() => { feedAnimal(game); refresh(); }}>F<small>Feed</small></button>
        <button
          className="touch-build"
          aria-pressed={game.autoBuildActive}
          onClick={() => {
            game.openChestId = null;
            game.openLaboratoryId = null;
            game.openGrowerId = null;
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
          onPointerUp={() => releasePrimaryInput(game, true)}
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
                  <div className="breeding-tip"><span>♥</span><div><b>Breeding wildlife · {babyAnimalCount(game)} babies</b><p>Select meat for bears, foxes, and wolves, or berries for other adults. Press F to feed two nearby animals of the same species three times each. Their baby stays small while it grows.</p></div></div>
                </>
              )}
              {panel === "craft" && (
                <>
                  <div className="inventory-help bench-status">
                    <b>{game.mode === "custom" ? "Custom crafting unlocked" : nearCraftingBench(game) && nearChemicalLab(game) ? "Workshop network ready" : nearChemicalLab(game) ? "Chemical Lab in range" : nearCraftingBench(game) ? "Crafting Bench in range" : "Hand crafting"}</b>
                    <span>{game.mode === "custom" ? "Every recipe is free and available anywhere. Stations, research, and item prerequisites are optional." : nearCraftingBench(game) && nearChemicalLab(game) ? "Weapons, advanced structures, bullets, and the Mineral Grower are available." : nearChemicalLab(game) ? "Bullets and the Mineral Grower are available here. A bench is still required for weapons." : nearCraftingBench(game) ? "Advanced tools and weapons are unlocked. Build a Chemical Lab for bullets and a Mineral Grower." : "Craft starter tools and a bench. Advanced production requires placed workstations."}</span>
                  </div>
                  <div className="recipe-list">
                    {CRAFT_RECIPES.map((recipe) => {
                      const owned = Boolean(recipe.owned?.(game));
                      const unrestricted = game.mode === "custom";
                      const needsBench = Boolean(!unrestricted && recipe.requiresBench && !nearCraftingBench(game));
                      const needsLab = Boolean(!unrestricted && recipe.requiresLab && !nearChemicalLab(game));
                      const missingPrerequisite = Boolean(!unrestricted && recipe.prerequisite && !recipe.prerequisite(game));
                      const needsResearch = Boolean(!unrestricted && recipe.requiresResearch && !game.research[recipe.requiresResearch]);
                      return (
                        <article key={recipe.id}>
                          <div className="recipe-badge"><RecipeVisual recipe={recipe} /></div>
                          <div><h3>{recipe.name}</h3><p>{recipe.detail}</p><small>{unrestricted ? "FREE · no station required" : costLabel(recipe.cost) + (recipe.requiresResearch ? " · laboratory research" : "") + (recipe.requiresBench ? " · bench" : "") + (recipe.requiresLab ? " · Chemical Lab" : "")}</small></div>
                          <button disabled={(!unrestricted && !canAfford(game, recipe.cost)) || owned || needsBench || needsLab || needsResearch || missingPrerequisite} onClick={() => craft(recipe)}>{owned ? "Owned" : needsResearch ? "Research first" : missingPrerequisite ? recipe.prerequisiteLabel ?? "Locked" : needsBench ? "Need bench" : needsLab ? "Need Chemical Lab" : unrestricted ? "Craft free" : "Craft"}</button>
                        </article>
                      );
                    })}
                  </div>
                </>
              )}
              {panel === "build" && (
                <>
                  <p className="panel-intro">{game.mode === "custom" ? "Every building piece is infinitely available. Choose one, then place it on the normal 48px grid." : "These are completed pieces from your inventory. Craft more in the Craft menu, then place them on the 48px grid."}</p>
                  <div className="build-grid">
                    {BUILD_ORDER.map((kind) => {
                      const data = BUILD_DATA[kind];
                      return (
                        <article key={kind}>
                          <div className="build-badge"><BuildIcon kind={kind} /></div>
                          <div><h3>{data.name}</h3><p>{data.detail}</p><small>{data.hp} health · 1.5s build time</small></div>
                          <footer><span>{game.mode === "custom" ? "∞ ready" : game.kits[kind] + " ready"}</span><button disabled={game.mode !== "custom" && game.kits[kind] <= 0} onClick={() => chooseBuild(kind)}>{game.mode === "custom" || game.kits[kind] > 0 ? "Place" : "Not crafted"}</button></footer>
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

      {openLaboratory && (
        <div className="panel-scrim laboratory-scrim" onPointerDown={closeLaboratory}>
          <aside className="game-panel laboratory-panel" role="dialog" aria-modal="true" aria-labelledby="laboratory-title" onPointerDown={(event) => event.stopPropagation()}>
            <header>
              <div><small>ALIEN ANALYSIS STATION</small><h2 id="laboratory-title">Laboratory</h2></div>
              <button onClick={closeLaboratory} aria-label="Close laboratory">×</button>
            </header>
            <div className="laboratory-content">
              <div className="laboratory-biomass" aria-label={game.resources.biomass + " Alien Biomass available"}>
                <MaterialIcon material="biomass" />
                <span><small>RAW ALIEN MATERIAL</small><b>{game.resources.biomass} Alien Biomass</b></span>
              </div>
              <p>Analyze raw tissue for blueprints, then combine it with ordinary resources to process specialized compounds. Organic equipment is assembled from those compounds in the normal Crafting menu.</p>
              <section className="biomass-processing" aria-labelledby="biomass-processing-title">
                <div className="laboratory-section-title">
                  <div><small>REPEATABLE PROCESSING</small><h3 id="biomass-processing-title">Stabilize compounds</h3></div>
                  <span>Each batch produces 2</span>
                </div>
                <div className="biomass-process-list">
                  {BIOMASS_PROCESS_ORDER.map((compound) => {
                    const process = BIOMASS_PROCESS_DATA[compound];
                    return (
                      <article key={compound}>
                        <MaterialIcon material={compound} />
                        <div>
                          <small>{game.resources[compound]} IN BACKPACK</small>
                          <h3>{process.name}</h3>
                          <p>{process.detail}</p>
                          <em>{costLabel(process.cost)}</em>
                        </div>
                        <button disabled={!canAfford(game, process.cost)} onClick={() => processBiomassCompound(compound)}>
                          Process ×{process.output}
                        </button>
                      </article>
                    );
                  })}
                </div>
              </section>
              <div className="laboratory-section-title research-title">
                <div><small>ONE-TIME ANALYSIS</small><h3>Stabilize blueprints</h3></div>
                <span>Spend raw biomass</span>
              </div>
              <div className="research-list">
                {RESEARCH_ORDER.map((kind) => {
                  const project = RESEARCH_DATA[kind];
                  const researched = game.research[kind];
                  return (
                    <article key={kind} className={researched ? "researched" : ""}>
                      <div className="research-specimen" aria-hidden="true"><i /><b /></div>
                      <small>{researched ? "BLUEPRINT STABILIZED" : "UNANALYZED SPECIMEN"}</small>
                      <h3>{project.name}</h3>
                      <p>{project.detail}</p>
                      <button disabled={researched || game.resources.biomass < project.biomassCost} onClick={() => researchProject(kind)}>
                        {researched ? "Researched" : "Research · " + project.biomassCost + " biomass"}
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      )}

      {openGrower && (
        <div className="panel-scrim station-scrim" onPointerDown={closeGrower}>
          <aside className="game-panel mineral-grower-panel" role="dialog" aria-modal="true" aria-label="Mineral Grower" onPointerDown={(event) => event.stopPropagation()}>
            <header>
              <div><small>PLACED PROCESSOR</small><h2>Mineral Grower</h2></div>
              <button onClick={closeGrower} aria-label="Close Mineral Grower">×</button>
            </header>
            {openGrower.processMaterial && activeGrowth ? (
              <div className="grower-process">
                <MaterialIcon material={openGrower.processMaterial} />
                <small>{growthRemainingSeconds === 0 ? "BATCH COMPLETE" : "CRYSTAL MATRIX ACTIVE"}</small>
                <h3>{activeGrowth.name}</h3>
                <p>{growthRemainingSeconds === 0 ? activeGrowth.output + " units are ready to collect." : "The " + activeGrowth.name + " catalyst is growing through the loaded Mineral-Rich Rock."}</p>
                <strong>{growthRemainingSeconds === 0 ? "READY" : growthRemainingSeconds + "s remaining"}</strong>
                <button disabled={growthRemainingSeconds > 0} onClick={collectMineralGrower}>{growthRemainingSeconds === 0 ? "Collect " + activeGrowth.output + " " + activeGrowth.name : "Growing…"}</button>
              </div>
            ) : (
              <div className="grower-menu">
                <p>Choose the mineral to use as the catalyst. The Grower consumes one unit of it with Mineral-Rich Rock, then produces a larger batch of that mineral.</p>
                <div className="grower-grid">
                  {GROWABLE_MINERALS.map((material) => {
                    const recipe = MINERAL_GROWTH_RECIPES[material];
                    return (
                      <article key={material}>
                        <MaterialIcon material={material} />
                        <div><h3>{recipe.name} catalyst</h3><p>Produces {recipe.output} {recipe.name} in {Math.round(recipe.durationMs / 1000)} seconds</p><small>{costLabel(recipe.cost)}</small></div>
                        <button disabled={!canAfford(game, recipe.cost)} onClick={() => loadMineralGrower(material)} aria-label={"Load " + recipe.name + " growth batch"}>Load</button>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {!started && !game.dead && (
        <section className="start-card">
          <div className="start-mark"><span>H</span></div>
          <small>DAYLIGHT IS BORROWED</small>
          <h1>HALFLIGHT</h1>
          <p>Gather by day. Build on the grid. Survive larger waves and whatever the dark evolves next.</p>
          <div className="mode-actions">
            <button onClick={() => start("survival")}><b>Begin survival</b><small>The main balanced game</small><span>→</span></button>
            <button className="custom-mode-button" onClick={() => start("custom")}><b>Custom mode</b><small>Free crafting, infinite building, day control</small><span>∞</span></button>
          </div>
          <div><span><kbd>WASD</kbd> Move</span><span><kbd>F</kbd> Feed</span><span><kbd>HOLD LMB</kbd> Use tool</span></div>
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

# Halflight Game Specification

## 1. Game identity

**Halflight** is a single-player, real-time browser survival game. The player
gathers during limited daylight, crafts equipment, organizes a free-form
inventory, builds a base on a grid, explores a cave, tames wild animals, and
survives hostile waves that grow stronger each night.

The game has no final victory state. A run continues across increasingly hard
days until the player's health reaches zero. Death ends the run; choosing
**Try again** starts over from the initial state.

## 2. Core play loop

1. Explore the meadow and forest to gather wood, stone, granite, fiber, food,
   and seeds.
2. Enter the cave to mine iron, copper, coal, sulfur, and additional stone.
3. Craft weapons, ammunition, improved tools, armor, healing, and defenses.
4. Arrange items freely between the 30-slot backpack and 10-slot hotbar.
5. Build walls, floors, roofs, gates, crops, and defenses on the placement grid.
6. Feed wild animals to tame them as companions.
7. Survive the night wave, reach dawn, and prepare for a stronger night.

## 3. Session start and player state

A new run begins in the Meadow on day 1 with:

| State | Starting value |
| --- | ---: |
| Health | 100 / 100 |
| Hunger | 100 / 100 |
| Wood | 8 |
| Stone | 5 |
| Fiber | 4 |
| Berries | 3 |
| Seeds | 2 |
| Ready building pieces | 2 wood fences and 2 wood floors |
| Equipment | Stone axe and stone pickaxe |

The player is drawn as a circular top-down character. The equipped tool,
weapon, food, or build item is drawn beside the circle. Player movement speed
is 190 world units per second. The player is constrained to the world boundary
and cannot walk through standing trees or mineable nodes. Creatures, forage
nodes, and buildings currently do not block movement.

## 4. Controls and inventory

### Keyboard and pointer

| Input | Action |
| --- | --- |
| `WASD` or arrow keys | Move |
| Pointer position | Aim and choose nearby resource or build targets |
| Hold left mouse | Repeatedly use the equipped tool, attack, fire, or place ready building pieces |
| `E` | Enter or exit the cave, feed an animal, eat, harvest a crop, operate a door or gate, or place a building |
| `Space` or `F` | Attack once |
| `1`–`9`, `0` | Select one of the 10 hotbar slots |
| `Q` | Open or close the build panel |
| `C` | Open or close the crafting panel |
| `I` or `B` | Open or close the backpack |
| `Escape` | Cancel build mode and close the current panel |
| `+` / `-` or mouse wheel | Zoom between 68% and 155% |

Trees are chopped by holding left mouse with an axe. Rocks and ores are mined
by holding left mouse with a pickaxe. `E` is not used to chop or mine.

### Inventory

The backpack contains 30 unrestricted slots and the hotbar contains 10 slots.
Tools, weapons, material stacks, food, and ready building pieces may be moved
to any slot. Pointer players may drag items or use the two-click move flow;
touch players may tap an item and then tap its destination. Number keys select
the corresponding hotbar slot, with `0` selecting slot 10.

Materials stack by type and display their quantities. Food is a combined
hotbar item backed by the total berries, mushrooms, and meat carried by the
player.

### Touch

Touch players receive a directional pad, an **Interact** button, and a
holdable **Tool** button. Equipment, crafting, building, inventory, and zoom
controls remain available through on-screen buttons.

## 5. World and time

The game contains two 5,200 by 3,800 world spaces:

- **The Meadow** includes open grassland, a dense forest, oak, pine, birch,
  granite, forage nodes, and six kinds of wildlife.
- **The Caves** contain stone, granite, iron, copper, coal, sulfur, and
  mushrooms and are always dark.

The cave entrance is in the Meadow's northeast area. Pressing `E` near the
entrance transfers the player between realms. Buildings, resource nodes, and
creatures belong to the realm in which they were created or spawned.

A full day/night cycle lasts 110 seconds and is split evenly: 55 seconds of
daylight and 55 seconds of night. The circular tracker in the top-left is split
into equal day and night halves, has a rotating time hand, and shows the day
counter above/beside it. The run begins partway through the first daylight.

Crossing into night immediately spawns that day's wave in the current realm.
At dawn, the day counter increases and the player restores 12 health. Surviving
hostile creatures do not disappear at dawn.

## 6. Survival meters and death

Hunger decreases by 0.5 points per second. At zero hunger, health decreases by
2 points per second. With Food equipped, pressing `E` consumes one berry,
mushroom, or meat, in that order, and restores 24 hunger and 5 health.

The player dies when health reaches zero. The death screen reports the current
day and total threats defeated. Restarting resets the entire run; there is no
saved progression.

## 7. Gathering and resource renewal

The player holds left mouse while close to a node. Trees require an axe and
mineable nodes require a pickaxe. Forage nodes can be gathered with any item.
Depleted nodes respawn after 90 seconds of active real time.

| Node | Durability | Yield when depleted |
| --- | ---: | --- |
| Oak | 8 | 7 wood and 1 fiber |
| Pine | 6 | 6 wood and 2 fiber |
| Birch | 5 | 5 wood and 2 fiber |
| Stone | 6 | 5 stone |
| Granite | 9 | 4 granite and 1 stone |
| Iron ore | 8 | 4 iron and 1 stone |
| Copper ore | 7 | 4 copper and 1 stone |
| Coal | 6 | 4 coal and 1 stone |
| Sulfur | 6 | 3 sulfur and 1 stone |
| Berry bush | 1 | 4 berries, 2 seeds, and 2 fiber |
| Grass | 1 | 3 fiber and 1 seed |
| Mushrooms | 1 | 3 mushrooms |

Basic tools remove 1 durability per use. The iron axe or iron pickaxe removes
2 durability per use and has a shorter use cooldown.

## 8. Crafting

Crafting is immediate when the player can pay the recipe cost. Permanent gear
cannot be crafted twice; ammunition and bandages are repeatable.

| Recipe | Cost | Result |
| --- | --- | --- |
| Stone Spear | 5 wood, 3 stone | Unlocks a 17-damage melee weapon |
| Iron Sword | 4 wood, 7 iron | Unlocks a fast 25-damage melee weapon |
| Hunting Bow | 6 wood, 4 fiber, 2 copper | Unlocks a 520-range bow |
| Arrow Bundle | 2 wood, 1 stone | Adds 12 arrows |
| Scrap Pistol | 8 iron, 6 copper, 3 coal, 2 sulfur | Unlocks a 640-range pistol |
| Bullet Bundle | 2 iron, 1 coal, 2 sulfur | Adds 12 bullets |
| Copper Armor | 12 copper, 5 hide | Reduces incoming damage by 18% |
| Iron Armor | 14 iron, 6 hide | Reduces incoming damage by 35% |
| Blacksteel Armor | 18 iron, 10 coal, 4 sulfur, 8 hide | Reduces incoming damage by 55% |
| Iron Axe | 4 wood, 5 iron | Improves axe combat and gathering |
| Iron Pickaxe | 4 wood, 5 iron | Improves mining speed |
| Field Bandage | 5 fiber, 1 berry | Immediately restores 35 health |

New weapons are placed into the first available hotbar slot when possible,
otherwise into the first available backpack slot.

## 9. Building

Building pieces are crafted into ready-piece stacks and placed on a 48-unit
grid. The target must be within the world boundary and no more than 260 units
from the player. One floor, one roof, and one solid object may share a cell.

| Piece | Cost | Made | Health | Function |
| --- | --- | ---: | ---: | --- |
| Wood Fence | 3 wood | 2 | 55 | Light barrier |
| Granite Fence | 1 stone, 3 granite | 2 | 105 | Durable barrier |
| Wood Gate | 5 wood | 1 | 70 | Opens and closes with `E` |
| Granite Gate | 5 granite, 1 iron | 1 | 130 | Reinforced gate |
| Wood Floor | 2 wood | 2 | 45 | Floor layer |
| House Wall | 4 wood, 3 granite | 1 | 120 | Heavy shelter wall |
| House Door | 4 wood, 1 iron | 1 | 90 | Opens and closes with `E` |
| Roof | 4 wood, 2 fiber | 1 | 75 | Translucent roof layer |
| Spike Trap | 4 wood, 2 iron | 1 | 60 | Deals 10 close-range damage |
| Wire Snare | 5 fiber, 2 copper | 2 | 45 | Deals 8 damage and slows monsters |
| Fire Trap | 4 stone, 3 coal, 2 sulfur | 1 | 70 | Deals 18 area damage on a cooldown |
| Scrap Turret | 6 wood, 7 iron, 5 copper | 1 | 95 | Automatically deals 12 damage within 360 units |
| Crop Plot | 2 wood, 2 fiber, 1 seed | 1 | 45 | Produces berries and seeds |

Crop plots mature in 75 seconds. Pressing `E` on a mature plot yields 4 berries
and 2 seeds, then resets its growth. Night monsters damage nearby buildings.
Solid structures are currently visual defenses and attack targets rather than
movement blockers.

## 10. Player combat

Melee attacks hit every non-tamed creature in the attack arc, knock it back,
and anger wild animals. Ranged weapons select the closest non-tamed target near
the aim direction and spend one unit of ammunition per shot, including misses.

| Equipped item | Damage | Range | Cooldown |
| --- | ---: | ---: | ---: |
| Stone axe | 9 | 78 | 500 ms |
| Iron axe | 14 | 78 | 500 ms |
| Pickaxe | 7 | 78 | 500 ms |
| Stone spear | 17 | 102 | 500 ms |
| Iron sword | 25 | 102 | 380 ms |
| Hunting bow | 18 | 520 | 520 ms |
| Scrap pistol | 34 | 640 | 320 ms |
| Hands, food, or build tool | 3 | 78 | 500 ms |

Holding left mouse repeats attacks at the equipped item's cooldown. Every
defeated creature increments the threat count. Wildlife drops meat and hide;
brutes drop iron, wraiths drop sulfur, and maws drop iron and sulfur.

## 11. Wildlife and taming

The Meadow begins with 24 animals spread around the forest: bears, boars, deer,
rabbits, foxes, and wolves.

| Animal | Health | Speed | Contact damage | Aggro distance |
| --- | ---: | ---: | ---: | ---: |
| Bear | 70 | 48 | 9 | 135 |
| Boar | 44 | 55 | 6 | 90 |
| Deer | 36 | 74 | 4 | 62 |
| Rabbit | 18 | 84 | 2 | 62 |
| Fox | 30 | 78 | 4 | 62 |
| Wolf | 50 | 70 | 8 | 120 |

A wild animal becomes angry when the player enters its aggro distance without
Food equipped or when attacked. It stops chasing beyond 340 units. Equip Food
and press `E` near an animal three times to tame it; each feeding consumes one
food item. Tamed animals follow the player, cannot be hit by the player, seek
night monsters within 230 units, and attack them at close range.

## 12. Night waves

One wave spawns at each transition into night. Wave size is
`min(18, 3 + 2 × day)`, so night 1 begins with 5 monsters. Every monster gains
2 movement speed and 1.4 contact damage per day. Health scaling depends on its
type:

| Monster | Earliest night | Base health | Health per day | Base speed | Base damage |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shade | 1 | 28 | 8 | 66 | 7 |
| Crawler | 2 | 23 | 6 | 91 | 6 |
| Brute | 2 | 54 | 13 | 45 | 12 |
| Wraith | 4 | 42 | 10 | 73 | 10 |
| Maw | 5 | 92 | 17 | 39 | 17 |

All monster types continuously chase the player, remain after dawn, attack at
contact range, and damage nearby buildings. Later-night compositions introduce
the stronger monster types at deterministic intervals in the wave.

## 13. Current scope

The game is run-based and local to one browser session. It includes no
multiplayer, accounts, save files, pause state, equipment durability, building
repair, trading, quests, finite ending, or collision with placed structures.
Panels do not pause the simulation.

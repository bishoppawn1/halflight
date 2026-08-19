# Halflight Game Specification

## 1. Game identity

**Halflight** is an endless, single-player, real-time browser survival game.
The player gathers by day, explores a large meadow, forest, and cave, crafts
equipment and firearms, builds defenses, tames wildlife, and survives night
waves that become larger and stronger forever.

There is no third-night ending or final victory state. Days continue until the
player's health reaches zero. **Try again** resets the complete run.

## 2. Core loop

1. Explore the open Meadow and dense Blackwood forest.
2. Gather wood, stone, fiber, food, seeds, hide, and specialized materials.
3. Enter the cave for granite, iron, copper, coal, sulfur, and mushrooms.
4. Craft tools, armor, melee weapons, bows, guns, ammunition, and healing.
5. Build a shelter, crops, barriers, automated defenses, and multiple traps.
6. Feed wild animals three times to tame them as companions.
7. Survive an increasingly large night wave, recover at dawn, and continue.

## 3. New-run state

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
| Armor | None |

The player is a plain, top-down painted circle. The equipped item appears beside
the circle. Equipping copper, iron, or blacksteel armor adds a small cartoony
helmet whose color and construction match that metal tier.

The player moves at 190 world units per second. Trees and mineable deposits use
their full visible top-down footprint as solid hitboxes. Movement slides along
their edges so the dense forest remains navigable. The player does not collide
with forage nodes, creatures, or placed buildings.

## 4. Controls and inventory

| Input | Action |
| --- | --- |
| `WASD` or arrow keys | Move |
| Pointer position | Aim and choose nearby resource or build targets |
| Hold left mouse | Repeatedly gather, attack, fire, or place at the item's cooldown |
| `E` | Context action: gather once, eat, feed, harvest, operate, enter/exit, or place |
| `Space` or `F` | Attack once |
| `1`–`9`, `0` | Select hotbar slots 1 through 10 |
| `Q` | Open or close building |
| `C` | Open or close crafting |
| `I` or `B` | Open or close inventory |
| `Escape` | Cancel build mode and close panels |
| `+`, `-`, or mouse wheel | Zoom between 68% and 155% |

The backpack has 30 unrestricted slots and the hotbar has 10. Tools, weapons,
food, resource stacks, and ready building pieces can be moved by dragging or by
selecting a source and destination. The hotbar is the only equipment source.
Newly crafted weapons use the first open hotbar slot when possible, then the
first open backpack slot.

Touch players receive a directional pad, an **Interact** button, and a holdable
**Tool** button. Inventory and hotbar moves use the two-tap flow.

## 5. World and time

Both the Meadow and cave are 5,200 by 3,800 world units.

- **The Meadow** contains open grassland, scattered resources, the cave
  entrance, and the Blackwood.
- **The Blackwood** is a large, visibly darker forest biome filled with closely
  spaced oak, pine, and birch trees, forage, bears, and other wildlife.
- **The Caves** are always dark and contain stone, granite, iron, copper, coal,
  sulfur, and mushrooms.

The three tree species and every rock are drawn from directly overhead. A tree
crown covers the same circular area used for its collision and pointer target.
Rocks and ore deposits are intentionally much larger than in the original map.

A full cycle lasts 110 seconds: 55 seconds of day and 55 seconds of night. The
first run begins partway through daylight, leaving about 37 seconds before
night 1. At dawn, the day counter increases and up to 12 health is restored.
Surviving monsters remain after dawn.

## 6. Hunger, food, and death

Hunger falls by 0.5 per second. At zero hunger, health falls by 2 per second.
Food is equipped as one combined hotbar item but stored as three resources.
Eating uses berries first, then mushrooms, then meat:

| Food | Hunger restored | Health restored | Main source |
| --- | ---: | ---: | --- |
| Berries | 18 | 2 | Bushes and crop plots |
| Mushrooms | 26 | 8 | Cave and forest mushroom patches |
| Meat | 38 | 10 | Hunted wildlife |

Health reaching zero ends the run. The death screen reports the current night
and total defeated threats. Nothing persists into a restarted run.

## 7. Gathering

Trees require an axe, and mineable deposits require a pickaxe. Berry bushes,
wild grass, and mushrooms can be gathered with any selected item. Basic tools
remove 1 durability per use with a 320 ms cooldown. Iron tools remove up to 2
durability, grant two hits' worth of material, and use a 190 ms cooldown.

Materials are awarded on every hit, not only when a node breaks. Depleted nodes
return after 120 seconds.

| Node | Durability | Material awarded per hit | Depletion bonus |
| --- | ---: | --- | --- |
| Oak | 8 | 2 wood | 2 fiber |
| Pine | 6 | 1 wood and 1 fiber | — |
| Birch | 5 | 1 wood | 1 fiber |
| Stone | 6 | 1 stone | — |
| Granite | 9 | 1 granite | — |
| Iron ore | 8 | 1 iron | — |
| Copper ore | 7 | 1 copper | — |
| Coal | 6 | 1 coal | — |
| Sulfur | 6 | 1 sulfur | — |
| Berry bush | 1 | 3 berries and 1 seed | — |
| Wild grass | 1 | 2 fiber and 1 seed | — |
| Mushrooms | 1 | 2 mushrooms | — |

## 8. Crafting and equipment

Permanent gear cannot be crafted twice. Ammunition and field bandages are
repeatable.

| Recipe | Cost | Result |
| --- | --- | --- |
| Stone Spear | 5 wood, 3 stone | 17-damage melee weapon |
| Iron Sword | 4 wood, 7 iron | Fast 25-damage melee weapon |
| Hunting Bow | 6 wood, 4 fiber, 2 copper | 18-damage ranged weapon |
| Arrow Bundle | 2 wood, 1 stone | 12 arrows |
| Scrap Pistol | 8 iron, 6 copper, 3 coal, 2 sulfur | 34-damage ranged weapon |
| Bullet Bundle | 2 iron, 1 coal, 2 sulfur | 12 bullets |
| Copper Armor | 12 copper, 5 hide | Copper helmet; 18% damage reduction |
| Iron Armor | 14 iron, 6 hide | Iron helmet; 35% damage reduction |
| Blacksteel Armor | 18 iron, 10 coal, 4 sulfur, 8 hide | Blacksteel helmet; 55% damage reduction |
| Iron Axe | 4 wood, 5 iron | Faster chopping and 14 combat damage |
| Iron Pickaxe | 4 wood, 5 iron | Faster mining |
| Field Bandage | 5 fiber, 1 berry | Immediately restores up to 35 health |

Crafting a higher armor tier replaces the visible helmet and protection tier.
A higher tier cannot be downgraded through the crafting panel.

## 9. Building and traps

Building pieces are crafted into ready stacks and placed on a 48-unit grid.
The target must be within 260 units of the player. A cell can contain one floor,
one roof, and one solid-layer piece. Solid pieces cannot be placed over a live
tree, rock, or deposit.

| Piece | Cost | Made | Health | Function |
| --- | --- | ---: | ---: | --- |
| Wood Fence | 3 wood | 2 | 55 | Light barrier |
| Granite Fence | 1 stone, 3 granite | 2 | 105 | Durable barrier |
| Wood Gate | 5 wood | 1 | 70 | Opens and closes with `E` |
| Granite Gate | 5 granite, 1 iron | 1 | 130 | Reinforced gate |
| Wood Floor | 2 wood | 2 | 45 | Floor layer |
| House Wall | 4 wood, 3 granite | 1 | 120 | Shelter wall |
| House Door | 4 wood, 1 iron | 1 | 90 | Opens and closes with `E` |
| Roof | 4 wood, 2 fiber | 1 | 75 | Roof layer |
| Spike Trap | 4 wood, 2 iron | 1 | 60 | 10 close-range damage |
| Wire Snare | 5 fiber, 2 copper | 2 | 45 | 8 damage and 58% slow for 2.6 seconds |
| Fire Trap | 4 stone, 3 coal, 2 sulfur | 1 | 70 | 18 damage in a wide area; 3.2-second cooldown |
| Scrap Turret | 6 wood, 7 iron, 5 copper | 1 | 95 | 12 damage within 360 units every 700 ms |
| Crop Plot | 2 wood, 2 fiber, 1 seed | 1 | 45 | Produces berries and seeds |

Crop plots mature in 75 seconds. A mature harvest gives 4 berries and 2 seeds,
then resets growth. Monsters damage any building they pass closely enough to
reach. Destroyed buildings are removed.

## 10. Combat

Melee attacks damage every non-tamed creature in the attack arc and apply
knockback. Ranged weapons spend ammunition even on misses and hit the closest
non-tamed target near the aim direction.

| Item | Damage | Range | Cooldown |
| --- | ---: | ---: | ---: |
| Stone axe | 9 | 78 | 500 ms |
| Iron axe | 14 | 78 | 500 ms |
| Pickaxe | 7 | 78 | 500 ms |
| Stone spear | 17 | 102 | 500 ms |
| Iron sword | 25 | 102 | 380 ms |
| Hunting bow | 18 | 520 | 520 ms |
| Scrap pistol | 34 | 640 | 320 ms |
| Hands, food, or build tool | 3 | 78 | 500 ms |

Wildlife drops meat and hide. Brutes drop iron, wraiths drop sulfur, and maws
drop 2 iron and 2 sulfur. Every creature defeated by the player, a tame, or a
trap increases the threat count.

## 11. Wildlife and taming

Twenty-four animals are distributed around the Blackwood at the start:

| Animal | Health | Speed | Contact damage | Aggro distance |
| --- | ---: | ---: | ---: | ---: |
| Bear | 70 | 48 | 9 | 135 |
| Boar | 44 | 55 | 6 | 90 |
| Deer | 36 | 74 | 4 | 62 |
| Rabbit | 18 | 84 | 2 | 62 |
| Fox | 30 | 78 | 4 | 62 |
| Wolf | 50 | 70 | 8 | 120 |

Wild animals become angry when approached without Food equipped or when
attacked, and stop chasing beyond 340 units. Feed an animal three times to tame
it. Each feeding consumes one available food item. Tamed animals follow the
player, cannot be hit by the player, seek night monsters within 230 units, and
attack at close range.

## 12. Endless night progression

Every night spawns `6 + 3 × day` new monsters with no wave-size cap. Night 1
therefore spawns 9; night 10 spawns 36. Each monster gains 2 speed and 1.4
contact damage per day. Health scaling varies by type:

| Monster | Earliest night | Base health | Health per day | Base speed | Base damage |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shade | 1 | 28 | 8 | 66 | 7 |
| Crawler | 2 | 23 | 6 | 91 | 6 |
| Brute | 2 | 54 | 13 | 45 | 12 |
| Wraith | 4 | 42 | 10 | 73 | 10 |
| Maw | 5 | 92 | 17 | 39 | 17 |

Shades are jagged many-eyed forms, crawlers are low toothy horrors, brutes are
horned heavy monsters, wraiths have torn spectral bodies, and maws are large
walking rings of teeth and eyes. All chase continuously and remain after dawn.

## 13. Current scope

The game is local to one browser run. It has no multiplayer, accounts, save
files, true pause, equipment durability, building repair, trading, quests,
finite ending, or collision with placed structures. Panels do not pause the
simulation.

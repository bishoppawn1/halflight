# Halflight Game Specification

## 1. Game identity

**Halflight** is an endless, single-player, real-time browser survival game.
The player gathers by day, explores a large meadow, forest, and several caves, crafts
equipment and firearms, builds defenses, tames wildlife, and survives night
waves that become larger and stronger forever.

There is no third- or fourth-night ending, day cap, or final victory state.
Days continue until the player's health reaches zero. **Try again** resets the
complete run.

## 2. Core loop

1. Explore the open Meadow and dense Blackwood forest.
2. Gather wood, stone, fiber, food, seeds, hide, and specialized materials.
3. Explore three distinct caves for granite, iron, copper, coal, sulfur,
   mushrooms, and rare Aetherium.
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
| Ready building pieces | None |
| Equipment | Wood Axe in hotbar slot 2; berries begin selected in slot 1 |
| Placed structures | One completed campfire beside the spawn point |
| Armor | None |

The player is a plain, top-down painted circle. The equipped item appears beside
the circle. Equipping copper, iron, or blacksteel armor adds a small cartoony
helmet whose color and construction match that metal tier.

Axe and pickaxe heads change both material and silhouette at every tier: wood
is crude and lashed, stone is chunky, iron is forged and tapered, and
Aetherium is crystalline and glowing. Resource stacks, recipes, and ready
building pieces use recognizable miniature illustrations rather than letter
abbreviations.

Axes always use one broad, offset chopping blade. Pickaxes use a narrow,
double-ended head so the two tool families remain distinct at gameplay scale.

Every world object and creature is presented from directly overhead. Wildlife
uses a complete body silhouette with a visible torso, head, legs, and species
details such as ears, antlers, or a tail; animals are never represented as a
front-facing or side-profile face. Creatures turn their whole overhead body in
their direction of travel.

The player moves at 190 world units per second. Trees and mineable deposits use
their full visible top-down footprint as solid hitboxes. Movement slides along
their edges so the dense forest remains navigable. The player does not collide
with forage nodes or creatures. Completed walls, fences, gates, doors, benches,
chests, and other solid structures block the player and creatures; an open gate
or door can be crossed.

## 4. Controls and inventory

| Input | Action |
| --- | --- |
| `WASD` or arrow keys | Move |
| Pointer position | Aim the equipped tool independently of movement and choose targets |
| Hold left mouse | Repeatedly gather, attack, fire, or start hammer deconstruction at the item's cooldown |
| Left click in build mode | Place one ready building piece |
| Hold `Shift` and left-drag | Place ready pieces across each valid grid cell crossed |
| Right click in build mode | Cancel placement without using a ready piece |
| `E` | Context action: eat, feed, harvest, operate, enter/exit, or place once |
| `Space` or `F` | Attack once |
| `1`–`9`, `0` | Select hotbar slots 1 through 10 |
| `Q` | Open or close ready building pieces |
| `C` | Open or close crafting |
| `I` or `B` | Open or close inventory |
| `Escape` | Cancel build mode and close panels |
| `+`, `-`, or mouse wheel | Zoom between 68% and 155% |

The backpack has 30 unrestricted slots and the hotbar has 10. Tools, weapons,
individual foods, resource stacks, and ready building pieces can be moved by dragging or by
selecting a source and destination. The hotbar is the only equipment source.
Newly crafted weapons use the first open hotbar slot when possible, then the
first open backpack slot.

Touch players receive a directional pad, an **Interact** button, and a holdable
**Tool** button. Holding the touch tool also supports continuous building.
Inventory and hotbar moves use the two-tap flow.

## 5. World and time

The Meadow and the connected Deepways cave system are separate 5,200 by 3,800
world spaces.

- **The Meadow** contains open grassland, dense patches of harvestable wild
  grass, eight scattered iron and copper deposits, three cave entrances, one
  rare Aetherium deposit, and the Blackwood.
- **The Blackwood** is a large, visibly darker forest biome filled with closely
  spaced oak, pine, and birch trees, forage, bears, and other wildlife.
- **Granite Hollow** is rich in granite and ordinary rock, with some coal and
  mushrooms.
- **Iron Delve** concentrates iron and copper, with some coal, granite, and
  rare Aetherium.
- **Sulfur Grotto** concentrates sulfur and coal, with mushrooms and some
  copper.

Granite Hollow, Iron Delve, and Sulfur Grotto are large chambers within the same
underground realm. Visible, solid rock walls enclose each chamber, and broad
tunnels connect all three through the central Deepways hub. Each chamber keeps
its own terrain palette and resource mix, but creatures and placed buildings
share one connected cave system. Each chamber has an exit to its matching
Meadow entrance, so the player can enter through one cave, cross the tunnels,
and leave through another. Ore seams are intentionally sparse among the much
more common ordinary rock.

The three tree species and every rock are drawn from directly overhead. A tree
crown covers the same circular area used for its collision and pointer target.
Rocks and ore deposits are intentionally much larger than in the original map.

At night, the Meadow is almost completely opaque beyond light. The player has
only 96 units of close night vision; Standing Torches, Campfires, and Fire Traps
reveal 225, 410, and 115 units respectively. Caves remain dark at every time of
day and give the player 112 units of close vision before placed lights extend it.

A full cycle lasts 110 seconds: 55 seconds of day and 55 seconds of night. The
first run begins partway through daylight, leaving about 37 seconds before
night 1. At dawn, the day counter increases and up to 12 health is restored.
Surviving monsters remain after dawn.

## 6. Hunger, food, and death

Hunger falls by 0.5 per second. At zero hunger, health falls by 2 per second.
Berries, mushrooms, and meat are separate inventory stacks. Move the desired
food to the hotbar, select it, and press `E` to eat that exact type:

| Food | Hunger restored | Health restored | Main source |
| --- | ---: | ---: | --- |
| Berries | 18 | 2 | Bushes and crop plots |
| Mushrooms | 26 | 8 | Cave and forest mushroom patches |
| Meat | 38 | 10 | Hunted wildlife |

Health reaching zero ends the run. The death screen reports the current night
and total defeated threats. Nothing persists into a restarted run.

## 7. Gathering

Trees require an axe, and mineable deposits require a pickaxe. Berry bushes,
wild grass, and mushrooms can be gathered with any selected item. Holding left
mouse repeatedly gathers a reachable resource anywhere under its full visible
footprint; the pointer does not need to touch the resource's center. If the
pointer is slightly off, the tool's aim ray is tested against the complete
footprints of nearby resources and the first intersected footprint is selected.
Pointer coordinates stay synchronized while the camera moves.

| Tool tier | Node durability removed and per-hit yield | Cooldown | Access |
| --- | ---: | ---: | --- |
| Wood | 1 | 400 ms | Trees and ordinary rock |
| Stone | 2 | 320 ms | Trees, granite, iron, copper, coal, and sulfur |
| Iron | 3 | 220 ms | All deposits, including Aetherium |
| Aetherium | 5 | 140 ms | All deposits |

Forage uses a 300 ms cooldown. A tool awards the material for every durability
point it removes, so higher tiers gather several hits' yield at once.

Every axe and pickaxe tier is a separate inventory item. Crafting a Stone
Pickaxe, for example, does not remove or alter an owned Wood Pickaxe. Tools lose
one durability point after each successful gathering use or melee hit, show
their remaining durability in the inventory and equipped-item display, and
break at zero. A broken tool disappears and its recipe becomes available again.

| Tool material | Maximum tool durability |
| --- | ---: |
| Wood | 36 |
| Stone | 72 |
| Iron | 120 |
| Aetherium | 180 |

Materials are awarded on every hit, not only when a node breaks. Depleted nodes
return after 120 seconds.

Every partially damaged resource node shows both a health bar and its remaining
durability as a current/maximum number until it is depleted or fully respawned.

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
| Aetherium ore | 12 | 1 Aetherium | — |
| Berry bush | 1 | 3 berries and 1 seed | — |
| Wild grass | 1 | 2 fiber and 1 seed | — |
| Mushrooms | 1 | 2 mushrooms | — |

## 8. Crafting and equipment

Wood and stone tools, the spear, arrows, bandages, and basic building pieces
can be made anywhere. Place a Crafting Bench and stand within 150 units to make
advanced weapons, armor, metal tools, ammunition, and defenses. Owned durable
tools cannot be duplicated, but can be crafted again after breaking. Crafting a
higher tool tier adds a new item instead of replacing a lower-tier tool.
Permanent weapons and armor cannot be crafted twice or downgraded; ammunition,
bandages, and building pieces are repeatable.

| Recipe | Cost | Result |
| --- | --- | --- |
| Wood Axe | 3 wood | Tier-1 chopping tool; 36 durability |
| Wood Pickaxe | 3 wood | Tier-1 pickaxe for ordinary rock; 36 durability |
| Stone Axe | 3 wood, 4 stone | Tier-2 chopping tool; 72 durability |
| Stone Pickaxe | 3 wood, 4 stone | Tier-2 pickaxe for common ores; 72 durability |
| Deconstruction Hammer | 4 wood, 2 stone | Removes an aimed structure and recovers part of its materials |
| Stone Spear | 5 wood, 3 stone | 17-damage melee weapon |
| Iron Sword | 4 wood, 7 iron | Fast 25-damage melee weapon |
| Hunting Bow | 6 wood, 4 fiber, 2 copper | 18-damage ranged weapon |
| Arrow Bundle | 2 wood, 1 stone | 12 arrows |
| Scrap Pistol | 8 iron, 6 copper, 3 coal, 2 sulfur | 34-damage ranged weapon |
| Bullet Bundle | 2 iron, 1 coal, 2 sulfur | 12 bullets |
| Copper Armor | 12 copper, 5 hide | Copper helmet; 18% damage reduction |
| Iron Armor | 14 iron, 6 hide | Iron helmet; 35% damage reduction |
| Blacksteel Armor | 18 iron, 10 coal, 4 sulfur, 8 hide | Blacksteel helmet; 55% damage reduction |
| Iron Axe | 4 wood, 5 iron | Tier-3 chopping tool, 14 combat damage, and 120 durability |
| Iron Pickaxe | 4 wood, 5 iron | Tier-3 pickaxe for Aetherium; 120 durability |
| Aetherium Axe | 4 wood, 7 Aetherium, 3 iron | Tier-4 chopping tool, 22 combat damage, and 180 durability |
| Aetherium Pickaxe | 4 wood, 7 Aetherium, 3 iron | Tier-4 mining tool, 18 combat damage, and 180 durability |
| Field Bandage | 5 fiber, 1 berry | Immediately restores up to 35 health |

Crafting a higher armor tier replaces the visible helmet and protection tier.
A higher tier cannot be downgraded through the crafting panel.

## 9. Building and traps

Building pieces are crafted into ready stacks and placed on a 48-unit grid.
Grid lines outline each cell, while the preview and completed structure sit at
the exact center of that cell. The target must be within 260 units of the
player. A cell can contain one floor, one roof, and one solid-layer piece.
Solid pieces cannot be placed over a live tree, rock, deposit, player, or
creature. A click places one blueprint and exits single-placement mode. Holding
`Shift` while dragging places one blueprint in each new valid cell crossed,
without repeatedly attempting the same cell. Touch tool-hold provides the same
continuous placement behavior.

Blueprints enter a first-in, first-out work queue. When the player is not giving
movement input, the player walks to the next blueprint and builds it for three
seconds; manual movement pauses that work. A completed solid structure blocks
movement. Equipping the Deconstruction Hammer and aiming with left mouse queues
a nearby structure for 2.25 seconds of deconstruction. This returns half of
each per-piece recipe cost, rounded down to whole materials. Deconstructing a
chest also returns everything stored inside it.

| Piece | Cost | Made | Health | Function |
| --- | --- | ---: | ---: | --- |
| Crafting Bench | 4 wood, 2 stone | 1 | 85 | Enables advanced recipes within 150 units |
| Storage Chest | 5 wood, 2 fiber | 1 | 110 | Opens with `E` and stores resource stacks separately |
| Bedroll | 2 wood, 4 fiber | 1 | 50 | Rest once per day for up to 25 health at a cost of 8 hunger |
| Standing Torch | 2 wood, 1 fiber, 1 coal | 2 | 35 | Permanent 225-unit light radius |
| Campfire | 4 wood, 4 stone, 1 coal | 1 | 80 | Permanent 410-unit light radius |
| Wood Fence | 3 wood | 2 | 55 | Light barrier |
| Stone Fence | 4 stone | 2 | 105 | Durable barrier |
| Wood Gate | 5 wood | 1 | 70 | Opens and closes with `E` |
| Granite Gate | 5 granite, 1 iron | 1 | 130 | Reinforced gate |
| Wood Floor | 2 wood | 2 | 45 | Floor layer |
| Wood Wall | 4 wood | 2 | 90 | Basic shelter wall |
| Stone Wall | 5 stone, 2 granite | 2 | 155 | Strong masonry wall |
| Metal Wall | 6 iron, 1 coal | 2 | 235 | Heavy end-game barrier |
| House Door | 4 wood, 1 iron | 1 | 90 | Opens and closes with `E` |
| Roof | 4 wood, 2 fiber | 1 | 75 | Roof layer |
| Spike Trap | 4 wood, 2 iron | 1 | 60 | 10 close-range damage |
| Wire Snare | 5 fiber, 2 copper | 2 | 45 | 8 damage and 58% slow for 2.6 seconds |
| Fire Trap | 4 stone, 3 coal, 2 sulfur | 1 | 70 | 18 damage in a wide area; 3.2-second cooldown |
| Scrap Turret | 6 wood, 7 iron, 5 copper | 1 | 95 | 12 damage within 360 units every 700 ms |
| Crop Plot | 2 wood, 2 fiber, 1 seed | 1 | 45 | Produces berries and seeds |

Crop plots mature in 75 seconds and always display their current whole-number
growth percentage. A mature harvest gives 4 berries and 2 seeds, then resets
growth. Monsters damage any building they pass closely enough to reach.
Destroyed buildings are removed.

The Storage Chest is a basic hand-crafted piece. Pressing `E` nearby opens a
two-sided container view. Selecting a stack moves its complete quantity between
the backpack and that specific chest. Stored materials cannot be crafted,
consumed, or fired until retrieved. Deliberate hammer deconstruction returns
the stored contents; if monsters destroy the chest, those contents are lost.

## 10. Combat

Melee attacks damage every non-tamed creature in the attack arc and apply
knockback. Ranged weapons spend ammunition even on misses and fire a physical
projectile in the exact pointer-facing direction. A projectile only deals
damage if its path intersects a creature.

| Item | Damage | Range | Cooldown |
| --- | ---: | ---: | ---: |
| Wood axe | 7 | 78 | 500 ms |
| Stone axe | 9 | 78 | 500 ms |
| Iron axe | 14 | 78 | 500 ms |
| Aetherium axe | 22 | 78 | 500 ms |
| Wood / stone / iron / Aetherium pickaxe | 5 / 7 / 11 / 18 | 78 | 500 ms |
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

Each species is drawn as a full overhead animal rather than an animal face.
Body proportions, paws or hooves, ears, tails, antlers, and markings distinguish
the species while it turns and moves.

| Animal | Health | Speed | Contact damage | Aggro distance |
| --- | ---: | ---: | ---: | ---: |
| Bear | 70 | 48 | 9 | 135 |
| Boar | 44 | 55 | 6 | 90 |
| Deer | 36 | 74 | 4 | 62 |
| Rabbit | 18 | 84 | 2 | 62 |
| Fox | 30 | 78 | 4 | 62 |
| Wolf | 50 | 70 | 8 | 120 |

Wild animals become angry when approached without berries, mushrooms, or meat
equipped, or when attacked, and stop chasing beyond 340 units. Feed an animal
three times to tame it. Each feeding consumes one item of the selected food.
Tamed animals follow the
player, cannot be hit by the player, seek night monsters within 230 units, and
attack at close range.

## 12. Endless night progression

Every night spawns `6 + 3 × day` new monsters in the player's current realm,
with no wave-size cap. Night 1 therefore spawns 9; night 10 spawns 36. The game
checks throughout the night whether the current day's wave has spawned, so a
missed transition frame cannot suppress a wave. Each day advances after dawn,
and each monster gains 2 speed and 1.4 contact damage per day.

Each monster's position is sampled independently from valid points across the
current realm, at least 360 units from the player. Waves do not form a ring or
otherwise distribute themselves evenly around the player.

| Monster | Earliest night | Base health | Health per day | Base speed | Base damage | Sense radius |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Shade | 1 | 28 | 8 | 66 | 7 | 320 |
| Crawler | 2 | 23 | 6 | 91 | 6 | 390 |
| Brute | 2 | 54 | 13 | 45 | 12 | 270 |
| Wraith | 4 | 42 | 10 | 73 | 10 | 440 |
| Maw | 5 | 92 | 17 | 39 | 17 | 240 |

Every monster has a round main body surrounded by animated tentacles. Body size,
tentacle count and thickness, color, eyes, horns, and tooth patterns distinguish
shades, crawlers, brutes, wraiths, and maws. Monsters initially prowl instead of
knowing the player's location. They chase after sensing the player or being
attacked, then return to prowling after the player moves beyond 1.8 times that
monster's sense radius. Survivors remain after dawn.

## 13. Current scope

The game is local to one browser run. It has no multiplayer, accounts, save
files, true pause, tool repair, building repair, trading, quests, or finite
ending. Panels do not pause the simulation.

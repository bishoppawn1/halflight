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

1. Explore the open Meadow, its three forests, lakes, and marshes.
2. Gather wood, stone, fiber, food, seeds, hide, and specialized materials.
3. Explore three distinct caves for stone, iron, copper, coal, sulfur,
   mushrooms, and rare Aetherium.
4. Craft tools, armor, melee weapons, bows, guns, ammunition, and healing.
5. Build a shelter, crops, barriers, automated defenses, and multiple traps.
6. Lure wildlife with its preferred bait and make chance-based taming attempts.
7. Survive an increasingly large night wave, recover at dawn, and continue.

## 3. New-run state

| State | Starting value |
| --- | ---: |
| Health | 100 / 100 |
| Hunger | 100 / 100 |
| Wood | 0 |
| Stone | 0 |
| Fiber | 0 |
| Berries | 3 |
| Seeds | 0 |
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

Axes always use one broad, offset chopping blade mounted perpendicular to the
handle. Pickaxes use a narrow, double-ended head so the two tool families remain
distinct at gameplay scale.

Every world object and creature is presented from directly overhead. Wildlife
uses a clean silhouette made from a torso and head. Airborne crows and owls have
compact folded wings and visible beaks until they are actively moving away in a
flee; their escape animation extends both wings beyond the torso and sweeps them
forward and backward in a fast flap. A frightened bird that is stationary or
blocked keeps its wings folded. Grounded wild turkeys have a broad fan tail,
beak, and a small red wattle attached beneath the base of the beak.
Ground animals use coat markings. Legs are
omitted because they would not be clearly visible from this camera height.
Deer have large, branched antlers and visible side ears; wolves have a broad
head, triangular ears, a defined muzzle, and a bushy tail; rabbits have two
long, splayed ears; foxes have pointed ears, a narrow muzzle, and a large bushy
tail with a pale tip; raccoons have rounded ears, a black eye mask, and a long,
dark-ringed tail. These defining features remain prominent at gameplay zoom.
Animals are never represented as a front-facing or side-profile face, and
creatures turn their whole overhead body in their direction of travel.

The player moves at 190 world units per second. Trees and mineable deposits use
their full visible top-down footprint as solid hitboxes for the player, ground
wildlife, monsters, and grounded companions. Movement slides along their edges
so the dense forest remains navigable. The player does not collide with forage
nodes or creatures. Completed walls, fences, gates, doors, benches, chests, and
other solid structures block the player and creatures; an open gate or door can
be crossed. Dark deep water is impassable to the player and every ground
creature. Pale shallow water can be crossed, but reduces their movement speed
to 48%. Flying crows and owls ignore resource, structure, and water collision.

## 4. Controls and inventory

| Input | Action |
| --- | --- |
| `WASD` or arrow keys | Move |
| Pointer position | Aim the equipped tool independently of movement and choose targets |
| Hold left mouse | Repeatedly swing melee tools or gather; hold a bow to draw it, then release to fire; start hammer deconstruction |
| Left click in build mode | Place one ready building piece |
| Hold `Shift` and left-drag | Place ready pieces across each valid grid cell crossed |
| Right click in build mode | Cancel placement without using a ready piece |
| `E` | Context action: eat, feed, harvest, open treasure, operate, enter/exit, or place once |
| `Space` or `F` | Attack once |
| `1`–`9`, `0` | Select hotbar slots 1 through 10 |
| `Q` | Open or close ready building pieces |
| `C` | Open or close crafting |
| `I` | Open or close inventory |
| `B` | Start or stop auto-building unfinished blueprints within three grid squares |
| `P` or the **Pause** button | Pause or resume the game |
| `Escape` | Cancel build mode and close panels |
| `+`, `-`, or mouse wheel | Zoom between 68% and 155% |

Pausing freezes the day/night clock, hunger and health loss, player and creature
movement, attacks and projectiles, crop growth, construction, respawns,
cooldowns, messages, and world animation. The pause screen remains until the
player presses `P` or chooses **Resume game**. Camera zoom remains available
while paused.

The backpack has 30 unrestricted slots and the hotbar has 10. Tools, weapons,
individual foods, resource stacks, and ready building pieces can be moved by dragging or by
selecting a source and destination. The hotbar is the only equipment source.
Every newly acquired item or material uses the first open hotbar slot when
possible, then the first open backpack slot.
Multiple copies of the same durable axe or pickaxe share one inventory slot and
display their copy count on that slot.
Every material stack displays its exact quantity, including a quantity of one.
When a material reaches zero, its hotbar or backpack slot becomes empty
immediately. If that material was selected food, the player switches to hands
and the stale eating prompt disappears.

Touch players receive a directional pad, an **Interact** button, a **Build**
button, and a holdable **Tool** button. Holding the touch tool also supports continuous building.
Inventory and hotbar moves use the two-tap flow.

## 5. World and time

The Meadow and connected cave system are separate 7,200 by 5,200 world spaces.
The caves and their chambers are deliberately unnamed; entrances, exits,
prompts, and the location display identify them only as caves.

- **The Meadow** contains open grassland, sparse clumps of harvestable wild
  grass, eight scattered iron and copper deposits, scattered ordinary rock with
  occasional huge outcrops, three cave entrances, one rare Aetherium deposit,
  three forests, and three bodies of water.
- **The Blackwood** is a large, visibly darker forest biome filled with closely
  spaced oak, pine, and birch trees, forage, bears, and other wildlife.
- **Pine Reach** is a separate northeastern woodland dominated by pines.
- **Birch Grove** is a broad southeastern woodland dominated by birches.
- **Stillwater**, **Eastmere**, and the **Low Marsh** have pale, traversable
  shallows surrounding dark, impassable deep water. Natural resources do not
  generate inside either water depth. Their smoothly irregular shorelines use
  layered shallow-to-deep color, scattered curved ripples, sparse reeds, and
  occasional lily pads instead of perfect concentric rings or dashed markings.
- One chamber is rich in stone, with some coal and
  mushrooms.
- One chamber concentrates iron and copper, with some coal, stone, and rare
  Aetherium.
- One chamber concentrates sulfur and coal, with mushrooms and some copper.
- Four secondary caverns contain sparse pockets of ordinary rock, coal, and
  mushrooms between the three main resource chambers.

The three vast, unnamed resource chambers share one underground realm with a
large central cavern and four secondary caverns. Visible, solid rock walls
enclose every space. Twelve long, variable-width tunnels form multiple loops,
so every entrance has alternate routes to the other two instead of a single
spoke through the center. Each main chamber keeps its own terrain palette and
resource mix, but creatures and placed buildings share the connected cave
system. Each main chamber has an exit to its matching Meadow entrance, so the
player can enter through one cave, cross the network, and leave through another.
Ore seams are intentionally sparse among the much more common ordinary rock.

At the start of each run, one random chamber contains a one-use treasure cache
and one random chamber contains a giant cave guardian. The two selections are
independent, so a chamber can contain the cache, the guardian, both, or neither.
Opening the cache with `E` awards 4 stone, 5 iron, 4 copper, 3 coal, 3 sulfur,
and 2 Aetherium. Its opened chest remains visible.

The three tree species and every rock are drawn from directly overhead. Pines
use overlapping jagged needle whorls at different angles, giving the full crown
a circular silhouette. Birches use airy, bright leaf clusters and oaks use a
broad arrangement of overlapping rounded lobes. No tree exposes a trunk tip
through or beyond its crown. A tree crown covers the same circular area used for
its collision and pointer target.
Each mineable node is one solid, faceted outcrop whose visible spread matches
its collision and pointer footprint. Small, medium, and huge outcrops are
visibly different at a glance and remain individually scattered; world
generation never chains separate deposits into a line.

At night, the Meadow is almost completely opaque beyond light. The player has
only 96 units of close night vision; Standing Torches, Campfires, and Fire Traps
reveal 225, 410, and 115 units respectively. Caves remain dark at every time of
day and give the player 112 units of close vision before placed lights extend
it. Every light follows line of sight. Living tree crowns, completed wood,
stone, and metal walls, closed gates and doors, and cave-rock boundaries stop
light and leave darkness behind them. The first tree or completed structure hit
by a light remains visibly illuminated so the source of each cast shadow is
clear. Open gates and doors pass light, and overlapping sources can illuminate
one another's shadows.

A full cycle lasts 480 seconds: 240 seconds of day and 240 seconds of night. The
first run begins partway through daylight, leaving about 163 seconds before
night 1. At dawn, the day counter increases and up to 12 health is restored.
All ordinary night-wave monsters disappear at dawn. The cave guardian is a
permanent cave encounter and is not removed by the day transition.

## 6. Hunger, food, and death

Hunger falls by 0.5 per second. At zero hunger, health falls by 2 per second.
At 25 hunger or below, a large persistent warning tells the player to select and
eat food; the warning becomes critical at 10 hunger. At 30 health or below, a
pulsing red vignette closes around the edges of the play area.
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

Trees can be punched with empty hands or chopped with an axe. Mineable deposits
require a pickaxe. Berry bushes, wild grass, and mushrooms can be gathered with
any selected item. Holding left mouse repeatedly damages a reachable resource
anywhere under its full visible footprint; the pointer does not need to touch
the resource's center. If the pointer is slightly off, the tool's aim ray is
tested against the complete footprints of nearby resources and the first
intersected footprint is selected. Pointer coordinates stay synchronized while
the camera moves. Once a held use starts on a resource, it stays locked to that
resource despite camera movement until the player releases the control, moves
out of range, or depletes it. Depleting the locked resource ends that held use
instead of turning it into an unintended attack or selecting a different node.

Axes are the exception to resource locking. Every axe input is a normal melee
swing. All non-tamed creatures inside its attack arc take combat damage, while
the nearest tree or forage footprint intersected by that same arc also takes
gathering damage. A tree near or behind an animal never replaces the creature
attack; one swing can hit both. Holding the input repeats complete swings at the
axe's ordinary cooldown.

| Tool tier | Node durability removed per hit | Axe cooldown | Pickaxe cooldown | Access |
| --- | ---: | ---: | ---: | --- |
| Hands | 0.5 | 600 ms | — | Trees only |
| Wood | 1 | 700 ms | 820 ms | Trees and ordinary rock |
| Stone | 2 | 760 ms | 860 ms | Trees, stone, iron, copper, coal, and sulfur |
| Iron | 3 | 700 ms | 800 ms | All deposits, including Aetherium |
| Aetherium | 5 | 620 ms | 700 ms | All deposits |

Each equipped item has one shared action cooldown. An axe or pickaxe uses the
same cooldown against a resource node and a creature, and changing targets does
not bypass that timer. Forage also uses the selected item's cooldown but does
not play its attack animation. A Wood Axe removes twice as much tree durability
per hit as bare hands, so punching remains possible but is substantially
slower. Wild grass is the only natural source of fiber. Higher tiers remove
more node durability per hit and give access to stronger deposits.

Every axe and pickaxe tier is a separate tool type. Crafting a Stone Pickaxe,
for example, does not remove or alter any owned Wood Pickaxes. Each type can be
crafted repeatedly, and every crafted copy has its own durability. The active
copy loses one durability point after each successful gathering use or melee
hit. When it breaks at zero, the next spare of that type is equipped
automatically; the slot disappears only when no copies remain.

| Tool material | Maximum tool durability |
| --- | ---: |
| Wood | 36 |
| Stone | 72 |
| Iron | 120 |
| Aetherium | 180 |

Hits only reduce node durability. When a node is fully depleted, all of its
materials appear as illustrated ground drops near the node. Moving within 36
units automatically collects every nearby stack. Each depleted node rolls an
independent respawn delay measured in complete day/night cycles. Its previous
ground drops remain until collected.

| Node group | Respawn delay |
| --- | ---: |
| Berry bushes, wild grass, and mushrooms | 2–4 days |
| Pine and birch trees | 5–10 days |
| Oak trees | 10–15 days |
| Rock and every mineable deposit | 10–20 days |

Every partially damaged resource node shows a large, outlined health bar with
no numeric durability text until it is depleted or fully respawned.

| Node | Durability | World drops on depletion |
| --- | ---: | --- |
| Oak | 8 | 16 wood |
| Pine | 6 | 6 wood |
| Birch | 5 | 5 wood |
| Stone | 6 | 6 stone |
| Iron ore | 8 | 8 iron |
| Copper ore | 7 | 7 copper |
| Coal | 6 | 6 coal |
| Sulfur | 6 | 6 sulfur |
| Aetherium ore | 12 | 12 Aetherium |
| Berry bush | 1 | 3 berries and 1 seed |
| Wild grass | 1 | 2 fiber and a 10% chance of 1 seed |
| Mushrooms | 1 | 2 mushrooms |

The durability values above are the base values for medium mineable deposits.
Every mineable material appears in three patch sizes:

| Deposit size | Footprint radius | Maximum durability |
| --- | ---: | ---: |
| Small | 68% of base | 60% of base, rounded to the nearest whole point |
| Medium | 100% of base | 100% of base |
| Huge | 162% of base | 200% of base |

New maps contain all three sizes. Patch size changes collision, pointer
targeting, build clearance, and total material dropped; mineable nodes drop one
material for each point of their size-adjusted maximum durability.

## 8. Crafting and equipment

Wood and stone tools, the spear, arrows, bandages, and basic building pieces
can be made anywhere. Place a Crafting Bench and stand within 150 units to make
advanced weapons, armor, metal tools, ammunition, and defenses. Durable axes and
pickaxes can always be crafted again when the material and bench requirements
are met; their recipes never change to **Owned**. Crafting a higher tool tier
adds a new tool stack instead of replacing a lower-tier tool. Permanent weapons
and armor cannot be crafted twice or downgraded; ammunition, bandages, and
building pieces are repeatable. Opening crafting enters a large
screen-wide menu. Every recipe occupies its own square card with a prominent
illustration, name, description, material cost, bench requirement, and craft
button.

| Recipe | Cost | Result |
| --- | --- | --- |
| Wood Axe | 3 wood | 1 node damage per swing; 36 durability |
| Wood Pickaxe | 3 wood | 1 node damage per swing; ordinary rock; 36 durability |
| Stone Axe | 3 wood, 4 stone | 2 node damage per swing; 72 durability |
| Stone Pickaxe | 3 wood, 4 stone | 2 node damage per swing; common ores; 72 durability |
| Deconstruction Hammer | 4 wood, 2 stone | Removes an aimed structure and recovers part of its materials |
| Stone Spear | 5 wood, 3 stone | 17-damage melee weapon |
| Iron Sword | 4 wood, 7 iron | Fast 25-damage melee weapon |
| Hunting Bow | 6 wood, 4 fiber, 2 copper | 18-damage bow; up to 32 damage at full draw |
| Iron Bow | 6 wood, 4 fiber, 5 iron | Tier-two 28-damage bow; up to 49 damage at full draw |
| Arrow Bundle | 2 wood, 1 stone | 12 arrows |
| Scrap Pistol | 8 iron, 6 copper, 3 coal, 2 sulfur | 34-damage ranged weapon |
| Bullet Bundle | 2 iron, 1 coal, 2 sulfur | 12 bullets |
| Copper Armor | 12 copper, 5 hide | Copper helmet; 18% damage reduction |
| Iron Armor | 14 iron, 6 hide | Iron helmet; 35% damage reduction |
| Blacksteel Armor | 18 iron, 10 coal, 4 sulfur, 8 hide | Blacksteel helmet; 55% damage reduction |
| Iron Axe | 4 wood, 5 iron | 3 node damage per swing, 14 combat damage, and 120 durability |
| Iron Pickaxe | 4 wood, 5 iron | 3 node damage per swing; mines Aetherium; 120 durability |
| Aetherium Axe | 4 wood, 7 Aetherium, 3 iron | 5 node damage per swing, 22 combat damage, and 180 durability |
| Aetherium Pickaxe | 4 wood, 7 Aetherium, 3 iron | 5 node damage per swing, 18 combat damage, and 180 durability |
| Field Bandage | 5 fiber, 1 berry | Immediately restores up to 35 health |

Crafting a higher armor tier replaces the visible helmet and protection tier.
A higher tier cannot be downgraded through the crafting panel.

## 9. Building and traps

Building pieces are crafted into ready stacks and placed on a 48-unit grid.
Most previews and completed structures occupy one cell. A Crop Plot is the
exception: it occupies and reserves a two-by-two-cell footprint, with four
joined soil beds shown inside it. The target must be within 260 units of the
player. A cell can contain one floor, one roof, and one solid-layer piece.
Solid pieces cannot be placed over a live tree, rock, deposit, player, or
creature. Standing Torches are completed and lit immediately when placed. Every
other piece is placed as a blueprint. A click places one ready piece and exits
single-placement mode. Holding `Shift` while dragging places one ready piece in
each new valid cell crossed, without repeatedly attempting the same cell. Touch
tool-hold provides the same continuous placement behavior.

Blueprints remain unfinished until the player presses `B` (or the touch
**Build** button). Auto-build constructs the nearest unfinished blueprint whose
footprint is within three grid squares (144 units), takes 1.5 seconds per piece,
and continues through other blueprints in that local range. It never walks the
player toward a distant job. Any movement immediately stops auto-build while
preserving partial progress; pressing `B` after moving resumes from the nearest
eligible blueprint. A movement-blocking blueprint pauses just before completion
if the player overlaps its footprint; auto-build stops until the player moves
clear and presses `B` again. A completed solid structure blocks movement.
Equipping the Deconstruction Hammer and aiming with left mouse queues a nearby
structure for 2.25 seconds of deconstruction. This returns half of each
per-piece recipe cost, rounded down to whole materials. Deconstructing a chest
also returns everything stored inside it.

Every placed layer reserves its footprint as soon as its blueprint appears.
Night monsters choose another spawn point, and depleted resources or wildlife
whose home overlaps a blueprint, floor, roof, wall, or other structure defer
their respawn until that footprint is clear.

| Piece | Cost | Made | Health | Function |
| --- | --- | ---: | ---: | --- |
| Crafting Bench | 4 wood, 2 stone | 1 | 85 | Enables advanced recipes within 150 units |
| Storage Chest | 5 wood, 2 fiber | 1 | 110 | Opens with `E` and stores resource stacks separately |
| Bedroll | 2 wood, 4 fiber | 1 | 50 | Rest once per day for up to 25 health at a cost of 8 hunger |
| Standing Torch | 2 wood, 1 fiber, 1 coal | 2 | 35 | Placed fully built; permanent 225-unit light radius |
| Campfire | 8 wood | 1 | 80 | Permanent 410-unit light radius |
| Wood Fence | 3 wood | 2 | 55 | Light barrier |
| Stone Fence | 4 stone | 2 | 105 | Durable barrier |
| Wood Gate | 5 wood | 1 | 70 | Opens and closes with `E` |
| Stone Gate | 5 stone, 1 iron | 1 | 130 | Reinforced gate |
| Wood Floor | 2 wood | 2 | 45 | Floor layer |
| Wood Wall | 4 wood | 2 | 90 | Basic shelter wall |
| Stone Wall | 7 stone | 2 | 155 | Strong masonry wall |
| Metal Wall | 6 iron, 1 coal | 2 | 235 | Heavy end-game barrier |
| House Door | 4 wood, 1 iron | 1 | 90 | Opens and closes with `E` |
| Roof | 4 wood, 2 fiber | 1 | 75 | Roof layer |
| Spike Trap | 4 wood, 2 iron | 1 | 60 | 10 close-range damage |
| Wire Snare | 5 fiber, 2 copper | 2 | 45 | 8 damage and 58% slow for 2.6 seconds |
| Fire Trap | 4 stone, 3 coal, 2 sulfur | 1 | 70 | 18 damage in a wide area; 3.2-second cooldown |
| Scrap Turret | 6 wood, 7 iron, 5 copper | 1 | 95 | 12 damage within 360 units every 700 ms |
| Crop Plot | 2 wood, 1 seed | 1 | 45 | Single-use 2×2 field that produces berries and seeds |

Crop plots mature in 300 seconds and display only their current whole-number
percentage, such as `59%`, without a repeated growth label. A mature harvest
gives 4 berries and 2 seeds, then removes the harvested crop plot from the map.
Pressing `E` from normal interaction range around any edge of the visible field
harvests or checks it; the player does not have to approach the center. Monsters
damage any building they pass closely enough to reach.
Destroyed buildings are removed.

The Storage Chest is a basic hand-crafted piece. Pressing `E` nearby opens a
two-sided container view. Selecting a stack moves its complete quantity between
the backpack and that specific chest. Stored materials cannot be crafted,
consumed, or fired until retrieved. Deliberate hammer deconstruction returns
the stored contents; if monsters destroy the chest, those contents are lost.

## 10. Combat

Melee attacks damage every non-tamed creature in the attack arc and apply
knockback. An axe swing can simultaneously apply its gathering damage to one
intersected tree or forage node without suppressing any creature hit. Ranged
weapons spend ammunition even on misses and fire a physical
projectile in the exact pointer-facing direction. A projectile only deals
damage if its path intersects a creature. Every completed attack produces a
brief white directional flash. Spears use a narrow straight-ahead hit area and
thrust animation; axes, pickaxes, swords, and improvised attacks use arcs.

Holding the left mouse button with either bow starts a draw that reaches full
strength after 1.2 seconds. The bowstring and nocked arrow visibly pull farther
back while held, and an on-character meter and equipped-item label show charge.
Releasing fires one arrow. Damage scales continuously from the listed base
damage at a quick release to 175% at full draw; arrow speed also rises slightly.
The `Space`/`F` alternate attack remains an immediate base-damage shot.

| Item | Damage | Range | Cooldown |
| --- | ---: | ---: | ---: |
| Wood axe | 7 | 78 | 700 ms |
| Stone axe | 9 | 78 | 760 ms |
| Iron axe | 14 | 78 | 700 ms |
| Aetherium axe | 22 | 78 | 620 ms |
| Wood pickaxe | 5 | 78 | 820 ms |
| Stone pickaxe | 7 | 78 | 860 ms |
| Iron pickaxe | 11 | 78 | 800 ms |
| Aetherium pickaxe | 18 | 78 | 700 ms |
| Stone spear | 17 | 102 | 620 ms |
| Iron sword | 25 | 102 | 480 ms |
| Hunting bow | 18 | 520 | 780 ms |
| Iron bow | 28 | 600 | 780 ms |
| Scrap pistol | 34 | 640 | 460 ms |
| Deconstruction hammer | 3 | 78 | 750 ms |
| Hands, food, or build tool | 3 | 78 | 600 ms |

Night monsters and the cave guardian can land attacks from their listed reach
only with an unobstructed line to the player. Their attacks, along with contact
attacks from aggressive wildlife, can deal damage at most once every 1.25
seconds. Monsters can damage a blocking structure at most once every 1.2
seconds. Tamed companions can attack a nearby horror once every 1.1 seconds.

The fast Meadow crawler fights with two exceptionally long forward arms. Its
142-unit lash is a true ranged melee attack, and the arms visibly extend when it
strikes. A Meadow brute can begin a leap while it is 120–320 units from the
player and has a clear path. A 420 ms wind-up and marked 78-unit landing circle
telegraph the attack before the brute spends 560 ms airborne. Landing in the
circle deals 150% of its normal damage. A brute waits 4.2 seconds before it can
leap again, and a solid structure stops the leap and takes the impact instead.

Wildlife drops species-specific amounts of meat and hide; birds provide meat
but no hide. Brutes drop iron, wraiths drop sulfur, and maws drop 2 iron and 2
sulfur. Every creature defeated by the player, a tame, or a trap increases the
threat count.

The cave guardian is an oversized maw with 240 health, 78 speed, 22 melee
damage, a 114-unit melee reach, and a 540-unit sense radius. From 220 to 520
units away with a clear line to the player, it holds its ground, locks its aim,
and visibly charges for 650 ms before firing a three-orb spread. Each orb moves
at 315 units per second, deals 14 damage before armor, and can be dodged or
blocked by cave rock and completed solid structures; an orb that hits a
structure deals the same 14 damage to it. The charge and moving orbs cast their
own warning light in the cave darkness. The ranged attack begins a new charge at
most once every 2.6 seconds. Closing inside 220 units makes the guardian resume
its faster melee pursuit. Defeating it awards the maw's normal drop plus 5 iron,
5 sulfur, and 3 Aetherium, for a total of 7 iron, 7 sulfur, and 3 Aetherium. Any
remaining guardian orbs disappear when it dies.

## 11. Wildlife and taming

Forty-three animals are distributed between the Blackwood and open Meadow at
the start. Common prey and birds greatly outnumber larger predators.

Each species is drawn as a full overhead animal rather than an animal face.
Body and head proportions, color, markings, wings, beaks, and tails distinguish
the species without relying on visible legs.

| Animal | Population | Habitat | Health | Speed | Contact damage | Wild behavior | Tame chance | Companion hit | Drops |
| --- | ---: | --- | ---: | ---: | ---: | --- | ---: | ---: | --- |
| Rabbit | 10 | Blackwood | 18 | 84 | 0 | Flees within 170 | 60% | 7 | 1 meat, 1 hide |
| Crow | 7 | Meadow | 14 | 102 | 0 | Flies; flees within 85 | 68% | 5 | 1 meat |
| Deer | 7 | Blackwood | 36 | 74 | 0 | Flees within 220 | 42% | 9 | 2 meat, 2 hide |
| Raccoon | 5 | Blackwood | 28 | 72 | 0 | Flees within 115 | 35% | 7 | 1 meat, 1 hide |
| Wild turkey | 4 | Meadow | 34 | 62 | 0 | Flees within 130 | 28% | 8 | 3 meat |
| Fox | 3 | Blackwood | 30 | 78 | 6 | Attacks within 135 | 32% | 7 | 2 meat, 1 hide |
| Owl | 3 | Blackwood | 24 | 82 | 0 | Flies; flees within 105 | 38% | 8 | 1 meat |
| Boar | 2 | Blackwood | 44 | 55 | 6 | Attacks within 90 | 24% | 10 | 2 meat, 1 hide |
| Wolf | 1 | Blackwood | 50 | 70 | 8 | Attacks within 120 | 16% | 14 | 2 meat, 1 hide |
| Bear | 1 | Blackwood | 70 | 48 | 9 | Attacks within 135 | 10% | 16 | 4 meat, 2 hide |

Crows and owls fly over trees, mineable outcrops, water, and player-built
structures while roaming, fleeing, following, or attacking. Their wings remain
folded against the torso during ordinary movement. When a wild flying bird runs
away, both wings extend outside its body and flap forward and backward until it
stops physically moving away; a fear flag alone does not unfold its wings. Wild
turkeys remain on the ground and carry their tail in a
visible fan. Flying birds range farther from their home
point and visibly bob above their softer shadow; all three bird species retain a
body-and-head overhead shape. Crows and owls are compact, turkeys are only
slightly larger, and all three are noticeably smaller than the ground mammals.
Crows have angular blue-black primary feathers and a fanned tail, owls have
broad rounded speckled wings and a pale facial disk, and turkeys have layered
copper wing panels, a banded scalloped tail fan, a blue-gray head, and a small
attached red throat wattle.
Wildlife follows smooth roaming paths and turns progressively instead of
snapping back and forth when it reaches a roaming target or returns home.

Wildlife is lured from up to 360 units away only by its preferred selected food.
Bears, foxes, and wolves are meat-eating predators: they ignore berries, follow
selected meat, and otherwise attack within their notice distance before giving
up beyond 340 units. Boars remain berry-lured but aggressive when unbaited. All
other wildlife follows selected berries. Deer and rabbits approach their berries
slowly and, without bait, flee at the enlarged 220- and 170-unit notice ranges.
An animal following bait stops about 135 units from the player instead of
walking into melee range. It can still be fed with `E` from up to 162 units
while the correct food remains selected. Switching away from the bait restores
the animal's ordinary flee or aggressive behavior, and the stand-off position
keeps it beyond a spear's 102-unit reach at the moment of the switch.

Once the player hits a deer or rabbit, that animal becomes permanently wary for
its current life. It refuses all future bait, runs until it is at least 520 units
from the player, and adopts the distant stopping point as its new territory. A
wary deer flees again when the player comes within 340 units; a wary rabbit does
so within 290 units. Other skittish wildlife remains frightened for five seconds
after a hit and returns to its original territory once safe. Other disengaged
wildlife also returns to its original territory.

Pressing `E` near a lured animal consumes one unit of its preferred food and
makes one independent taming roll. Failed attempts leave the animal wild, so
lower success rates make larger and stronger companions require more bait on
average. The player can have at most five tamed companions. Tamed animals follow
the player, cannot be hit by the player, seek night monsters within 230 units,
and attack at close range. When the player enters or exits a cave, every living
tamed companion transfers to the destination realm and reforms behind the
player at an open position.

Defeated wild animals leave their population slot empty for a randomly selected
2–4 days, then respawn at their original territory with full health and no prior
taming attempts, and no remembered wariness.

## 12. Endless night progression

Every night spawns `6 + 3 × day` new monsters in each realm, with no wave-size
cap. Night 1 therefore spawns 9 in the meadow and 9 in the cave system; night
10 spawns 36 in each. Monsters in the inactive realm remain there while the
player travels, so leaving a cave never makes the outside night empty. Meadow
waves use only shades, crawlers, and brutes. Cave-system waves use only wraiths
and maws; surface horrors never spawn underground and cave horrors never spawn
outside. The game checks throughout the night whether the current day's waves
have spawned, so a missed transition frame cannot suppress them. Each day
advances after dawn, and each monster gains 2 speed and 1.4 contact damage per
day.

Each monster's position is sampled independently from valid points across its
realm, at least 360 units from the player's corresponding world coordinates.
Waves do not form a ring or otherwise distribute themselves evenly around the
player.

Night-wave spawn candidates inside the visible, line-of-sight portion of the
player's close vision or a completed Standing Torch, Campfire, or Fire Trap are
rejected. A 30-unit safety margin keeps the monster's body fully outside the
visible light pool. Darkness behind a light blocker is not protected. Destroyed
lights and unfinished blueprints provide no spawn protection.

| Monster | Realm | Earliest night | Base health | Health per day | Base speed | Base damage | Attack reach | Sense radius |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Shade | Meadow | 1 | 28 | 8 | 84 | 7 | 76 | 320 |
| Crawler | Meadow | 2 | 23 | 6 | 116 | 6 | 142 | 390 |
| Brute | Meadow | 3 | 54 | 13 | 60 | 12 | 88 | 300 |
| Wraith | Cave system | 1 | 42 | 10 | 96 | 10 | 108 | 440 |
| Maw | Cave system | 3 | 92 | 17 | 56 | 17 | 96 | 260 |

Each monster family has a separate overhead silhouette instead of sharing one
round tentacled base. Shades are compact pulsing cores with five short wisps.
Crawlers have narrow carapaces, six jointed limbs, and two much longer striking
arms. Brutes have broad plated bodies, massive forelimbs, and claws that flare
during their leap wind-up. Wraiths are tapered spectral bodies trailing six
flowing ribbons. Maws have a circular toothed mouth and eight short, heavy
limbs; the cave guardian is an oversized maw.

Monsters initially prowl instead of knowing the player's location. They chase
after sensing the player or being attacked, stop at their attack reach when the
path is clear, and close the distance when terrain or a structure blocks the
attack. They return to prowling after the player moves beyond 1.8 times that
monster's sense radius. Any surviving ordinary night-wave monsters disappear at
dawn before the next day begins.

## 13. Current scope

The game is local to one browser run. It has no multiplayer, accounts, save
files, tool repair, building repair, trading, quests, or finite ending. Opening
an inventory, crafting, building, or storage panel does not pause the
simulation; the dedicated Pause control does.

# Halflight Game Specification

## 1. Game identity

**Halflight** is an endless, single-player, real-time browser survival game.
The player gathers by day, explores a large meadow, forest, and several caves, crafts
equipment and firearms, builds defenses, feeds and breeds wildlife, and survives night
waves that grow larger and unlock new fixed-stat horror species forever.

There is no third- or fourth-night ending, day cap, or final victory state.
Days continue until the player's health reaches zero. **Try again** resets the
complete run.

## 2. Core loop

1. Explore the open Meadow, its three forests, lakes, and marshes.
2. Gather wood, stone, fiber, food, seeds, hide, Alien Biomass, and specialized materials.
3. Explore three distinct caves for stone, iron, copper, coal, sulfur,
   mushrooms, and rare Aetherium.
4. Build a Laboratory to research blueprints and process Alien Biomass into specialized compounds.
5. Craft tools, armor, melee weapons, bows, several firearm classes,
   ammunition, chemical feedstock, and healing.
6. Build a shelter, crops, barriers, automated defenses, and multiple traps.
7. Lure and feed adult wildlife, then breed two well-fed animals of the same species.
8. Survive an increasingly large night wave, recover at dawn, and continue.

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
| Alien Biomass | 0 |
| Ready building pieces | None |
| Equipment | Wood Axe in hotbar slot 2; berries begin selected in slot 1 |
| Placed structures | One completed campfire beside the spawn point |
| Armor | None |

### Run modes

**Survival** is the main, balanced mode and uses every material, station,
research, prerequisite, and ready-piece rule in this specification.

**Custom Mode** uses the same generated world, survival simulation, enemies,
combat, placement rules, and construction times, but adds testing and creative
freedoms that never affect Survival:

- The player can set the current day to any whole number from 1 through 999.
  Changing the day during daylight makes that selected day's wave arrive at
  night. Changing it at night replaces the current Meadow wave with the
  selected day's wave. Persistent cave creatures remain in place.
- Every recipe in the Crafting menu costs nothing and can be made anywhere.
  Crafting Bench, Chemical Lab, Laboratory research, and prior-item
  prerequisites are ignored. Normal one-time ownership rules for permanent
  items still apply.
- Every building piece is infinitely available directly from the Ready Pieces
  menu. Placement range, blocked cells, the grid, blueprints, and construction
  time remain unchanged.

The title screen offers separate **Begin survival** and **Custom mode**
buttons. Starting Custom Mode does not alter the default Survival rules.

The player is a plain, top-down painted circle. The equipped item appears beside
the circle. Equipping copper, iron, blacksteel, or symbiote armor adds a small
cartoony helmet whose color and construction match that tier; symbiote armor is
purple, softly glowing, and edged with short living tendrils.

Every held item's forward axis matches the active aim direction exactly. Bow
arrows, gun barrels, spearheads, and idle tool handles point along the same
pointer-facing line used by projectiles, melee hit areas, and gathering rays.
Only a tool's temporary swing or recoil animation may rotate or move it away
from that line, and it returns to the exact aim direction afterward.

Axe and pickaxe heads change both material and silhouette at every tier: wood
is crude and lashed, stone is chunky, iron is forged and tapered, and
Aetherium is crystalline and glowing, while Carapace is purple, curved, and
organic. Resource stacks, recipes, and ready
building pieces use recognizable miniature illustrations rather than letter
abbreviations.

Axes always use one broad, offset chopping blade mounted perpendicular to the
handle. Pickaxes use a narrow, double-ended head so the two tool families remain
distinct at gameplay scale.
The Stone Spear has a long wooden shaft and small triangular stone point. The
Iron Sword instead has a short wrapped grip, pommel, crossguard, and broad
double-edged iron blade in both its held and inventory illustrations.

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

The player moves at 190 world units per second with empty hands. Holding any
tool, weapon, food, or building piece reduces movement to 82% of that speed
(about 156 units per second). Drawing either bow reduces movement further to
35% of empty-hand speed (about 67 units per second) until the arrow is released
or the draw is canceled. These equipment penalties combine with terrain speed
changes. Trees and mineable deposits use
their full visible top-down footprint as solid hitboxes for the player, ground
wildlife, their babies, and monsters. Movement slides along their edges
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
| `E` | Context action: cook selected raw food at a nearby Campfire, eat, harvest, open treasure, operate, enter/exit, or place once |
| `F` or the **Feed animal** button | Feed the nearest reachable adult its preferred selected food |
| `Space` | Attack once |
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
Multiple copies of the same durable axe, pickaxe, or weapon share one inventory
slot and display their copy count on that slot.
Every material stack displays its exact quantity, including a quantity of one.
When a material reaches zero, its hotbar or backpack slot becomes empty
immediately. If that material was selected food, the player switches to hands
and the stale eating prompt disappears.

Touch players receive a directional pad, an **Interact** button, a **Feed**
button, a **Build** button, and a holdable **Tool** button. Holding the touch tool also supports continuous building.
Inventory and hotbar moves use the two-tap flow.

## 5. World and time

The Meadow and connected cave system are separate 7,200 by 5,200 world spaces.
The caves and their chambers are deliberately unnamed; entrances, exits,
prompts, and the location display identify them only as caves.

- **The Meadow** contains open grassland, sparse clumps of harvestable wild
  grass, thirteen scattered metal deposits—eight copper and five iron—scattered
  ordinary rock with occasional huge outcrops, three cave entrances, three
  forests, and three bodies of water.
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
- One chamber concentrates iron and copper, with some coal and stone.
- One chamber concentrates sulfur and coal, with mushrooms and frequent copper.
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
Each main resource chamber has one guaranteed Aetherium patch. Two are medium
and the iron chamber's patch is huge. A dedicated Aether Warden stands beside
each patch; Aetherium does not generate on the Meadow.

At the start of each run, one random main chamber contains a one-use treasure
cache. Opening it with `E` awards 4 stone, 5 iron, 4 copper, 3 coal, 3 sulfur,
and 2 Aetherium. Its opened chest remains visible.

At the start of each run, the central cavern or one of the four ordinary
secondary caverns is selected at random for the Brood Mother. Her nine-pool web
nest appears around the center of that room. She has no dedicated arena, secret
route, fixed escort, or sentry gauntlet; ordinary cave monsters can still roam
through the selected room as part of the shared cave population.

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
144 units of close night vision plus a 51-degree forward cone that reaches
376.25 units in the current aim direction; Standing Torches, Campfires, and
Fire Traps reveal 225, 410, and 115 units respectively. Caves remain dark at
every time of day, give the player 168 units of close vision plus a 402.5-unit
forward cone before placed lights extend visibility, and remain hostile during
both halves of the day/night cycle. The cone fades toward its sides and far
edge. Every light follows line of sight. Living tree crowns, completed wood,
stone, and metal walls, closed gates and doors, and cave-rock boundaries stop
light and leave darkness behind them. The first tree or completed structure hit
by a light remains visibly illuminated so the source of each cast shadow is
clear. Open gates and doors pass light, and overlapping sources can illuminate
one another's shadows.

In darkness, touching any monster with close vision, the forward cone, or a
placed light immediately provokes it into chasing the player. It remains
light-provoked for 12 seconds after leaving illumination. Monster eyes glow;
their faint red glints remain visible from up to 340 units away when there is a
clear line of sight, even when the rest of the creature is still hidden.

A full cycle lasts 480 seconds: 240 seconds of day and 240 seconds of night. The
first run begins partway through daylight, leaving about 163 seconds before
night 1. At dawn, the day counter increases and up to 12 health is restored.
Ordinary Meadow horrors disappear at dawn. Cave horrors and the Brood Mother
survive the day transition and remain underground until defeated.

## 6. Hunger, food, and death

Hunger falls by 0.5 per second. At zero hunger, health falls by 2 per second.
At 25 hunger or below, a large persistent warning tells the player to select and
eat food; the warning becomes critical at 10 hunger. At 30 health or below, a
pulsing red vignette closes around the edges of the play area.
Berries, raw mushrooms, raw meat, cooked mushrooms, and cooked meat are
separate inventory stacks. Move the desired food to the hotbar, select it, and
press `E` to eat that exact type:

| Food | Hunger restored | Health restored | Main source or preparation |
| --- | ---: | ---: | --- |
| Berries | 8 | 0 | Bushes and crop plots |
| Raw mushrooms | 12 | 1 | Cave and forest mushroom patches |
| Raw meat | 16 | 2 | Hunted wildlife |
| Cooked mushrooms | 24 | 5 | Cook raw mushrooms at a Campfire |
| Cooked meat | 32 | 8 | Cook raw meat at a Campfire |

Selecting raw meat or raw mushrooms while within 92 units of a completed,
living Campfire changes the `E` action from eating to cooking one unit. Cooking
takes priority over other food and animal prompts in range. Standing Torches
and other fire-producing structures cannot cook food. The resulting cooked
unit goes into the first available inventory location. When the last selected
raw unit is cooked and the cooked stack is in the hotbar, that cooked stack is
selected automatically.

Raw meat has a 20% chance to cause sickness after eating, removing 28 hunger
after its ordinary restoration. Raw mushrooms have a 14% sickness chance that
removes 20 hunger and, independently, a 12% chance to cause 15 seconds of
hallucinations. Hallucinations make the whole rendered world sway, skew, and
pulse with shifting color while showing an on-screen status warning. Real
resources, drops, structures, treasures, and creatures enter staggered windows
in which they flicker and disappear even though their actual state, collision,
targeting, and behavior continue unchanged. Up to two fake enemy silhouettes
independently appear around the
player, rush inward, jitter, and dissolve. These phantoms are purely visual:
they cannot collide, attack, take damage, or change the threat count. Every
hallucination animation and timer freezes while the game is paused.
Because sickness is applied after the food benefit, either sick raw meal causes
a net hunger loss unless hunger was already close to zero. Berries and cooked
foods are safe.

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
| Carapace | 6 | 620 ms | — | Trees and forage; Laboratory research required |

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
| Carapace | 240 |

Hits only reduce node durability. When a node is fully depleted, all of its
materials appear as illustrated ground drops near the node. Moving within 36
units immediately collects every nearby stack, including a new stack created
while the player is already standing inside that collection radius. Resource
drops have no collection delay. Each depleted node rolls an independent respawn
delay measured in complete day/night cycles. Its previous ground drops remain
until collected.

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
| Stone | 6 | 6 stone, with a chance for separate Mineral-Rich Rock |
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

Destroying an ordinary rock also makes one independent Mineral-Rich Rock roll.
There is a 27% chance to drop one and an 8% chance to drop two, for a 35% total
chance of finding this distinct growth medium. It is a separate illustrated
inventory material, never a renamed stone stack.

## 8. Crafting and equipment

Wood and stone tools, the spear, arrows, bandages, and basic building pieces
can be made anywhere. Place a Crafting Bench and stand within 150 units to make
advanced weapons, armor, metal tools, the Chemical Lab, and defenses. Bullets
can only be made while the player is within 150 units of a completed Chemical
Lab. The Mineral Grower ready piece is also fabricated near that lab. Durable
tools and weapons can always be crafted again when the
material and station requirements are met; their recipes never change to
**Owned**. Each crafted copy joins that item's existing stack at full
durability. Permanent armor cannot be crafted twice or downgraded; ammunition,
bandages, and building pieces are repeatable. Opening crafting enters a large
screen-wide menu. Every recipe occupies its own square card with a prominent
illustration, name, description, material cost, bench requirement, and craft
button.

A completed Laboratory opens with `E`. It presents four independent research
projects, three repeatable processing batches, and the player's current Alien
Biomass. Research permanently spends the listed biomass and unlocks the
matching recipe; it never grants the
finished item. The unlocked item must still be crafted at a Crafting Bench with
its full recipe cost. Locked organic recipes remain visible in Crafting with a
**Research first** state.

| Laboratory research | Biomass cost | Recipe unlocked |
| --- | ---: | --- |
| Carapace Tooling | 2 | Carapace Axe |
| Tendril Weaponry | 3 | Tendril Blade |
| Symbiote Weave | 4 | Symbiote Armor |
| Xenotech Ballistics | 6 | Chimera Cannon |

Laboratory processing is immediate and repeatable. Each batch consumes two raw
Alien Biomass plus ordinary resources and places two units of the finished
compound in the backpack. These compounds are normal inventory materials: they
can be stored in chests and are consumed by the organic equipment recipes.

| Processed compound | Batch input | Batch output |
| --- | --- | ---: |
| Carapace Plate | 2 Alien Biomass, 2 iron, 1 coal | 2 Carapace Plate |
| Neural Gel | 2 Alien Biomass, 2 copper, 1 sulfur | 2 Neural Gel |
| Living Weave | 2 Alien Biomass, 2 hide, 2 fiber | 2 Living Weave |

| Recipe | Cost | Result |
| --- | --- | --- |
| Wood Axe | 3 wood | 1 node damage per swing; 36 durability |
| Wood Pickaxe | 3 wood | 1 node damage per swing; ordinary rock; 36 durability |
| Stone Axe | 3 wood, 4 stone | 2 node damage per swing; 72 durability |
| Stone Pickaxe | 3 wood, 4 stone | 2 node damage per swing; common ores; 72 durability |
| Deconstruction Hammer | 4 wood, 2 stone | Removes an aimed structure and recovers part of its materials |
| Stone Spear | 5 wood, 3 stone | 17-damage melee weapon; 72 durability |
| Iron Sword | 4 wood, 7 iron | Fast 25-damage melee weapon; 120 durability |
| Hunting Bow | 6 wood, 4 fiber, 2 copper | 18-damage bow; up to 32 damage at full draw; 360 durability |
| Iron Bow | 6 wood, 4 fiber, 5 iron | Tier-two 28-damage bow; up to 49 damage at full draw; 540 durability |
| Arrow Bundle | 2 wood, 1 stone | 12 arrows |
| Scrap Pistol | 8 iron, 6 copper, 3 coal, 2 sulfur | 54-damage firearm; stronger per shot than a fully drawn Iron Bow; 720 durability |
| Compact SMG | 10 iron, 9 copper, 2 sulfur | Requires the Scrap Pistol; 30-damage automatic firearm with a 120 ms cooldown; 2,400 durability |
| Scattergun | 6 wood, 12 iron, 4 copper, 4 sulfur | Requires the Scrap Pistol; fires five 24-damage pellets in a spread; 900 durability |
| Assault Rifle | 1 Guardian Core, 6 Aetherium, 12 iron, 8 copper | Requires the Scrap Pistol; 62-damage rapid-fire guardian-tier weapon; 1,200 durability |
| Sniper Rifle | 18 iron, 10 copper, 4 Aetherium | Requires the Assault Rifle; 145-damage precision firearm; 900 durability |
| Chimera Cannon | 6 Aetherium, 4 Carapace Plate, 4 Neural Gel, 2 Living Weave | Alien super weapon; 120 impact damage plus a 52-damage pulse in a 90-unit radius; 1,200 durability; requires Xenotech Ballistics |
| Bullet Bundle | 2 iron, 1 coal, 2 sulfur | Chemical Lab only; 12 shared firearm bullets |
| Copper Armor | 12 copper, 5 hide | Copper helmet; 18% damage reduction |
| Iron Armor | 14 iron, 6 hide | Iron helmet; 35% damage reduction |
| Blacksteel Armor | 18 iron, 10 coal, 4 sulfur, 8 hide | Blacksteel helmet; 55% damage reduction |
| Iron Axe | 4 wood, 5 iron | 3 node damage per swing, 14 combat damage, and 120 durability |
| Iron Pickaxe | 4 wood, 5 iron | 3 node damage per swing; mines Aetherium; 120 durability |
| Aetherium Axe | 4 wood, 7 Aetherium, 3 iron | 5 node damage per swing, 22 combat damage, and 180 durability |
| Aetherium Pickaxe | 4 wood, 7 Aetherium, 3 iron | 5 node damage per swing, 18 combat damage, and 180 durability |
| Carapace Axe | 4 wood, 2 iron, 3 Carapace Plate | 6 node damage per swing, 30 combat damage, and 240 durability; requires Carapace Tooling |
| Tendril Blade | 4 iron, 3 Neural Gel, 2 Living Weave | 36 damage, 112 reach, and 240 durability; requires Tendril Weaponry |
| Symbiote Armor | 4 iron, 4 hide, 2 Carapace Plate, 4 Living Weave | Living helmet; 68% damage reduction; requires Symbiote Weave |
| Field Bandage | 5 fiber, 1 berry | Immediately restores up to 35 health |

Crafting a higher armor tier replaces the visible helmet and protection tier.
A researched Symbiote Armor set is the strongest armor tier. Permanent armor
recipes cannot downgrade it through the crafting panel.

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
| Laboratory | 10 wood, 8 iron, 6 copper | 1 | 145 | Opens with `E` to research organic recipes and process Alien Biomass compounds |
| Chemical Lab | 8 iron, 6 copper, 4 stone | 1 | 135 | Opens Crafting with `E` and enables bullets and Mineral Grower fabrication within 150 units |
| Mineral Grower | 10 iron, 7 copper, 3 Aetherium | 1 | 155 | Opens a compact mineral-growth menu with `E`; its ready piece requires a nearby Chemical Lab |
| Storage Chest | 5 wood, 2 fiber | 1 | 110 | Opens with `E` and stores resource stacks separately |
| Bedroll | 2 wood, 4 fiber | 1 | 50 | Rest once per day for up to 25 health at a cost of 8 hunger |
| Standing Torch | 2 wood, 1 fiber, 1 coal | 2 | 35 | Placed fully built; permanent 225-unit light radius |
| Campfire | 8 wood | 1 | 80 | Cooks raw meat and mushrooms; permanent 410-unit light radius |
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

The Chemical Lab is a solid, grid-built workstation with visible flasks and
tubing. Pressing `E` within 150 units opens the Crafting menu. Its ammunition
and Mineral Grower recipes are enabled while the player remains within 150
units of a completed lab in the current realm. Bullets remain one shared
ammunition stack for every firearm.

Pressing `E` near a completed Mineral Grower opens a compact station menu. It
runs one batch at a time. The chosen mineral itself is the catalyst: starting a
batch immediately consumes one unit of that mineral plus the listed quantity of
Mineral-Rich Rock. The finished output must be collected from the same menu
before another batch can begin. Pausing freezes its timer; destroying or
deconstructing a running Grower loses the loaded inputs.

| Grown mineral | Input | Output | Time |
| --- | --- | ---: | ---: |
| Iron | 1 iron catalyst, 4 Mineral-Rich Rock | 5 iron | 45 seconds |
| Copper | 1 copper catalyst, 4 Mineral-Rich Rock | 5 copper | 45 seconds |
| Coal | 1 coal catalyst, 3 Mineral-Rich Rock | 6 coal | 40 seconds |
| Sulfur | 1 sulfur catalyst, 4 Mineral-Rich Rock | 5 sulfur | 45 seconds |
| Aetherium | 1 Aetherium catalyst, 6 Mineral-Rich Rock | 3 Aetherium | 90 seconds |

## 10. Combat

Melee attacks damage every creature in the attack arc and apply
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
While drawing, movement is limited to 35% of empty-hand speed. Releasing fires
one arrow. Damage scales continuously from the listed base damage at a quick
release to 175% at full draw; arrow speed also rises slightly. The `Space`
alternate attack remains an immediate base-damage shot.

Every melee weapon loses one durability after a swing that hits at least one
creature, even if that swing hits several creatures. A ranged weapon loses one
durability whenever it performs an attack that spends ammunition and fires one
or more projectiles, whether they hit or miss; the Scattergun therefore loses
one point per five-pellet blast. Drawing and canceling a bow costs nothing.
Ranged weapons have much larger durability reserves because their ammunition
and fire rates lead to many more uses. When an active weapon breaks, its next
spare copy equips automatically. With no spare, its inventory entry disappears
and the player switches away from it.

| Item | Damage | Range | Cooldown | Durability |
| --- | ---: | ---: | ---: | ---: |
| Wood axe | 7 | 78 | 700 ms | 36 |
| Stone axe | 9 | 78 | 760 ms | 72 |
| Iron axe | 14 | 78 | 700 ms | 120 |
| Aetherium axe | 22 | 78 | 620 ms | 180 |
| Carapace axe | 30 | 82 | 620 ms | 240 |
| Wood pickaxe | 5 | 78 | 820 ms | 36 |
| Stone pickaxe | 7 | 78 | 860 ms | 72 |
| Iron pickaxe | 11 | 78 | 800 ms | 120 |
| Aetherium pickaxe | 18 | 78 | 700 ms | 180 |
| Stone spear | 17 | 102 | 620 ms | 72 |
| Iron sword | 25 | 102 | 480 ms | 120 |
| Tendril Blade | 36 | 112 | 520 ms | 240 |
| Hunting bow | 18 | 520 | 780 ms | 360 |
| Iron bow | 28 | 600 | 780 ms | 540 |
| Scrap pistol | 54 | 660 | 520 ms | 720 |
| Compact SMG | 30 | 540 | 120 ms | 2,400 |
| Scattergun pellet ×5 | 24 each | 430 | 900 ms | 900 |
| Assault rifle | 62 | 760 | 230 ms | 1,200 |
| Sniper rifle | 145 | 1,250 | 1,550 ms | 900 |
| Chimera Cannon | 120 impact + 52 pulse | 900 | 700 ms | 1,200 |
| Deconstruction hammer | 3 | 78 | 750 ms | — |
| Hands, food, or build tool | 3 | 78 | 600 ms | — |

Night monsters and the Brood Mother can land attacks from their listed reach
only with an unobstructed line to the player. Their attacks, along with contact
attacks from aggressive wildlife, can deal damage at most once every 1.25
seconds. A wraith, maw, or Brood Mother close attack draws a bright directional
swipe across its actual melee reach when the hit lands; the Brood Mother's web
volley retains its charge warning and visible projectiles. Monsters can
damage a blocking structure at most once every 1.2 seconds.

The fast Meadow crawler rests its two exceptionally long striking arms folded
along its sides. Its 142-unit lash is a true ranged melee attack: one arm at a
time keeps its segment lengths and visibly flings in a curved side-to-front
sweep instead of telescoping straight outward. A Meadow brute can begin a leap
while it is 120–320 units from the player and has a clear path. A 420 ms wind-up and marked 78-unit landing circle
telegraph the attack before the brute spends 560 ms airborne. Landing in the
circle deals 150% of its normal damage. A brute waits 4.2 seconds before it can
leap again, and a solid structure stops the leap and takes the impact instead.

The evolved Meadow stalker begins appearing on night 4. It is a compact,
low-bodied horror with six needle-like legs, only 18 health, and a fixed speed
of 206. Its small silhouette, 470-unit sense radius, and sudden close pursuit
make it the fastest ordinary enemy, but it never gains further stat bonuses.

All firearms use the shared bullet stack and always fire as attacks instead of
being captured by nearby resource targeting. Holding the primary input repeats
shots at the equipped weapon's cooldown. The Scrap Pistol's 54 damage exceeds
the fully drawn Iron Bow's 49 damage. The Compact SMG trades per-shot damage and
range for the fastest fire rate. The Scattergun spends one bullet to launch five
separately visible pellets across a short spread, so its full damage requires a
close target. The guardian-tier Assault Rifle combines strong damage with fast
automatic fire. The Sniper Rifle is its precision successor, using a long cyan
tracer, the greatest range, and 145 damage in exchange for the slowest firearm
cooldown. The laboratory-built Chimera Cannon fires a large cyan-and-purple
alien pulse. Its impact deals 120 damage and then deals 52 more damage to every
living creature within 90 units, including the impact target if it survives the
initial hit; a missed shot still detonates at maximum range. Each class has a
distinct held silhouette and inventory illustration.

Wildlife leaves visible, illustrated piles of its species-specific meat and hide
at the death position; birds provide meat but no hide. Monsters always leave
hide, can leave meat, and can leave glowing Alien Biomass. Their existing
mineral rewards are scattered into the same physical loot field. All creature
piles become collectible after 650 ms, then enter the inventory when the player
comes within 36 units. Every creature defeated by the player or a trap increases
the threat count.

Each meat and biomass chance is rolled independently on death. A failed roll
omits that material; hide and listed minerals are guaranteed.

| Monster | Guaranteed hide | Meat chance and amount | Alien Biomass chance and amount | Guaranteed minerals |
| --- | ---: | --- | --- | --- |
| Shade | 1 | 22% for 1 | 18% for 1 | — |
| Crawler | 1 | 32% for 1 | 30% for 1 | — |
| Brute | 2 | 48% for 2 | 38% for 1 | 1 iron |
| Stalker | 1 | 20% for 1 | 40% for 1 | — |
| Wraith | 1 | 18% for 1 | 58% for 1 | 1 sulfur |
| Maw | 3 | 68% for 3 | 76% for 2 | 2 iron and 2 sulfur |
| Aether Warden | 2 | 40% for 2 | 70% for 2 | — |

The **Brood Mother** is a giant spider-like cave boss with twelve long jointed
legs, five separate mouths, many visible teeth, 320 health, 118 speed, 22 melee
damage, a 114-unit melee reach, and a 620-unit sense radius. The permanent nest
contains nine visible web pools.

From 170 to 600 units away with a clear line to the player, the Brood Mother
locks her aim and visibly gathers webbing for 600 ms before spitting a
three-clot spread at 360 units per second. She continues advancing at reduced
speed while charging and closes to about 210 units instead of holding far away.
Each clot deals 3 damage before armor and bursts into a 60-unit web pool when it
hits the player, cave rock, a completed solid structure, or its range limit.
Fired pools last 14 seconds. Standing on any nest or fired web reduces movement
to 42% and deals 2 damage before armor once every 1.6 seconds. A new volley can
begin at most once every 3.2 seconds. Defeating the Brood Mother rolls the maw's
normal hide, meat, and Alien Biomass drops, but awards no ordinary iron, sulfur,
or Aetherium bundle. It instead gives exactly one Guardian Core directly to the
inventory, removes any web projectiles still in flight, and unlocks the Assault
Rifle recipe. Crafting that rifle at a bench consumes the core and requires an
already-crafted Scrap Pistol.

## 11. Wildlife feeding and breeding

Forty-three animals are distributed between the Blackwood and open Meadow at
the start. Common prey and birds greatly outnumber larger predators.

Each species is drawn as a full overhead animal rather than an animal face.
Body and head proportions, color, markings, wings, beaks, and tails distinguish
the species without relying on visible legs.

| Animal | Population | Habitat | Health | Speed | Contact damage | Wild behavior | Drops |
| --- | ---: | --- | ---: | ---: | ---: | --- | --- |
| Rabbit | 10 | Blackwood | 18 | 84 | 0 | Flees within 170 | 1 meat, 1 hide |
| Crow | 7 | Meadow | 14 | 102 | 0 | Flies; flees within 85 | 1 meat |
| Deer | 7 | Blackwood | 36 | 74 | 0 | Flees within 220 | 2 meat, 2 hide |
| Raccoon | 5 | Blackwood | 28 | 72 | 0 | Flees within 115 | 1 meat, 1 hide |
| Wild turkey | 4 | Meadow | 34 | 62 | 0 | Flees within 130 | 3 meat |
| Fox | 3 | Blackwood | 30 | 78 | 6 | Attacks within 135 | 2 meat, 1 hide |
| Owl | 3 | Blackwood | 24 | 82 | 0 | Flies; flees within 105 | 1 meat |
| Boar | 2 | Blackwood | 44 | 55 | 6 | Attacks within 90 | 2 meat, 1 hide |
| Wolf | 1 | Blackwood | 50 | 70 | 8 | Attacks within 120 | 2 meat, 1 hide |
| Bear | 1 | Blackwood | 70 | 48 | 9 | Attacks within 135 | 4 meat, 2 hide |

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
walking into melee range. It can still be fed with `F` or the Feed animal button from up to 162 units
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

There is no taming or companion system. Pressing `F` or choosing the Feed animal
button near a lured adult consumes one unit of its preferred food and increases
that animal's feeding progress, from `1/3` through `3/3`. When two living adults
of the same species are both fully fed and within 260 units of each other, they
produce one baby at a nearby open position. Both parents return to `0/3` and
cannot be fed again for 480 seconds.

A baby is rendered at 58% of its adult species scale, moves at 72% of adult
speed, cannot be fed, and matures after 240 seconds. Maturity restores its full
adult health and movement values. A birth does not occur if the game cannot find
an open nearby position for the baby.

Defeated wild animals leave their population slot empty for a randomly selected
2–4 days, then respawn at their original territory with full adult health, no
feeding progress, and no remembered wariness.

## 12. Endless night progression

The cave system begins with three fixed Aether Wardens and three ordinary
wraiths in addition to the Brood Mother. The Wardens do not respawn
individually, and the Brood Mother has no fixed guards.
Once the surviving non-boss cave population falls below six, ordinary wraith or
maw replacements restore that population floor. If none remain, one replacement
appears immediately at a valid distant point; otherwise at most one appears
every 18 seconds. Surviving cave enemies above the floor are never removed
automatically.

Every night spawns `6 + 3 × day` new Meadow monsters and adds `4 + 2 × day`
reinforcements to the persistent cave population, with no wave-size cap. Night
1 therefore spawns 9 in the Meadow and adds 6 underground; night 10 spawns 36
and adds 24 respectively. Monsters in the inactive realm remain there while the
player travels, so leaving a cave never makes the outside night empty. Meadow
waves use shades, crawlers, brutes, and night-4 stalkers. Cave-system
reinforcements and replacement spawns use only wraiths and maws. Other surface
horrors never spawn underground, and cave horrors never spawn outside. The game
checks throughout the night whether the current
day's reinforcements have spawned, so a missed transition frame cannot suppress
them. Each day advances after dawn. Enemy health, speed, contact damage, attack
reach, and sense radius never scale with the day. Progression comes only from
larger populations and fixed-stat species unlocking on later nights.

Each monster's position is sampled independently from valid points across its
realm, at least 360 units from the player's corresponding world coordinates.
Waves do not form a ring or otherwise distribute themselves evenly around the
player.

Night-wave spawn candidates inside the visible, line-of-sight portion of the
player's close vision, forward cone, or a completed Standing Torch, Campfire,
or Fire Trap are rejected. A 30-unit safety margin keeps the monster's body
fully outside the visible light pool. Darkness behind a light blocker is not
protected. Destroyed lights and unfinished blueprints provide no spawn
protection.

| Monster | Realm | Earliest night | Fixed health | Fixed speed | Fixed contact damage | Attack reach | Sense radius |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Shade | Meadow | 1 | 28 | 84 | 7 | 76 | 320 |
| Crawler | Meadow | 2 | 23 | 116 | 6 | 142 | 390 |
| Brute | Meadow | 3 | 54 | 60 | 12 | 88 | 300 |
| Stalker | Meadow | 4 | 18 | 206 | 7 | 62 | 470 |
| Wraith | Cave system | 1 | 42 | 96 | 10 | 108 | 440 |
| Maw | Cave system | 3 | 92 | 56 | 17 | 96 | 260 |
| Aether Warden | Guarded cave ore only | — | 118 | 70 | 14 | 104 | 380 |

Each monster family has a separate overhead silhouette instead of sharing one
round tentacled base. Shades are compact pulsing cores with five short wisps.
Crawlers have narrow carapaces, six jointed limbs, and two much longer striking
arms. Brutes have broad plated bodies, massive forelimbs, and claws that flare
during their leap wind-up. Stalkers are much smaller, with narrow torsos and six
needle-like legs. Wraiths are tapered spectral bodies trailing six flowing
ribbons. Maws have a circular toothed mouth and eight short, heavy limbs. The
Brood Mother has her own much larger spider silhouette with twelve long legs, a
segmented body, five toothed mouths, many eyes, and web markings. Every organic
family has pulsing red eye
glints that remain aligned with its own overhead face and movement direction.
Aether Wardens are faceted teal constructs ringed with seven luminous crystal
spikes, carry a visible label, and cast a small cyan warning glow; their central
eye glows cyan. They never join random night waves and drop no bonus material;
the Aetherium patch they defend is the reward.

Monsters initially prowl instead of knowing the player's location. They chase
after sensing the player or being attacked, stop at their attack reach when the
path is clear, and close the distance when terrain or a structure blocks the
attack. They return to prowling after the player moves beyond 1.8 times that
monster's sense radius. At dawn, surviving ordinary Meadow horrors disappear
before the next day begins. Cave monsters remain underground through daylight.

## 13. Current scope

The game is local to one browser run. It has no multiplayer, accounts, save
files, tool repair, building repair, trading, quests, or finite ending. Opening
an inventory, crafting, building, storage, or Mineral Grower panel does not
pause the simulation; the dedicated Pause control does.

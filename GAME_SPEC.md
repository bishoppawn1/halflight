# Halflight Game Specification

## 1. Game identity

**Halflight** is a single-player, real-time browser survival game. The player
gathers during limited daylight, crafts equipment, builds a base on a grid,
explores a cave for metal, tames wild animals, and survives hostile waves that
grow stronger each night.

The game has no final victory state. A run continues across increasingly hard
days until the player's health reaches zero. Death ends the run; choosing
**Try again** starts over from the initial state.

## 2. Core play loop

1. Gather wood, stone, fiber, food, seeds, and metal.
2. Use gathered materials to craft weapons, tool upgrades, healing, and
   building pieces.
3. Place defenses, shelter pieces, traps, and renewable crop plots on the grid.
4. Enter the cave when metal is needed.
5. Prepare for the night wave, then fight alongside any tamed animals.
6. Reach dawn, recover some health, and prepare for a stronger night.

## 3. Session start and player state

A new run begins in the Meadow on day 1 with:

| State | Starting value |
| --- | ---: |
| Health | 100 / 100 |
| Hunger | 100 / 100 |
| Wood | 8 |
| Stone | 5 |
| Metal | 0 |
| Fiber | 4 |
| Food | 3 |
| Seeds | 2 |
| Ready building pieces | 2 wood fences and 2 wood floors |
| Equipment | Stone axe and stone pickaxe |

The weapon slot starts empty. The player must craft a spear or sword before
slot 3 can be equipped.

Player movement speed is 190 world units per second. The player is constrained
to the world boundary but currently does not collide with resources, creatures,
or buildings.

## 4. Controls

### Keyboard and pointer

| Input | Action |
| --- | --- |
| `WASD` or arrow keys | Move |
| Pointer position | Aim while standing still and choose a nearby build cell |
| `E` | Perform the contextual interaction or place the selected building |
| `Space` or `F` | Attack |
| Left click | Attack, or place a building while in build mode |
| `1` | Equip axe |
| `2` | Equip pickaxe |
| `3` | Equip the best crafted weapon (sword takes priority over spear) |
| `4` | Equip food |
| `Q` | Open or close the build panel |
| `C` | Open or close the crafting panel |
| `I` or `B` | Open or close the backpack |
| `Escape` | Cancel build mode and close the current panel |
| `+` / `-` or mouse wheel | Zoom between 68% and 155% |

### Touch

Touch players receive a directional pad, an **Interact** button, and an
**Attack** button. Equipment, crafting, building, inventory, and zoom controls
remain available through on-screen buttons.

## 5. World and time

The game contains two 2,200 by 1,600 world spaces:

- **The Meadow** contains trees, stone, berry bushes, one bear, and two boars.
- **The Caves** contain stone and metal ore and are always dark.

The cave entrance is in the Meadow's northeast area. Pressing `E` near the
entrance transfers the player between realms. Buildings, resource nodes, and
creatures belong to the realm in which they were created or spawned.

A full day/night cycle lasts 110 seconds and is split evenly:

- daytime occupies the first 55 seconds of a normal cycle;
- nighttime occupies the next 55 seconds; and
- the initial run begins partway through daylight, leaving about 37 seconds
  before the first night.

Crossing from day into night immediately spawns that day's wave in the
player's current realm. Crossing into a new day increases the day counter and
restores 12 health, up to the 100-health maximum. Surviving hostile creatures
do not disappear at dawn.

## 6. Survival meters and death

Hunger decreases by 0.5 points per second while the run is active. At zero
hunger, health decreases by 2 points per second. Eating one food with `E`
restores 24 hunger and 5 health, without exceeding either maximum.

The player dies when health reaches zero. The death screen reports the current
day and total kills. Restarting resets resources, structures, upgrades, tamed
animals, time, and score; there is no saved progression between runs.

## 7. Gathering and resource renewal

The player must stand within 92 world units of a resource and press `E`.
Trees require the axe, while stone and ore require the pickaxe. Berry bushes
can be gathered with any selected item. Depleted nodes respawn after 90 seconds
of active real time.

| Node | Durability | Yield when depleted |
| --- | ---: | --- |
| Tree | 3 | 5 wood and 1 fiber |
| Stone | 4 | 5 stone |
| Metal ore | 5 | 4 metal and 2 stone |
| Berry bush | 1 | 3 food, 2 seeds, and 2 fiber |

Basic tools remove 1 durability per interaction. The iron axe removes 2 from
trees, and the iron pickaxe removes 2 from stone or ore.

## 8. Crafting

Crafting is immediate when the player can pay the recipe cost. Weapons and tool
upgrades are permanent for the current run and cannot be crafted twice.
Bandages are consumable at the moment of crafting and may be crafted
repeatedly.

| Recipe | Cost | Result |
| --- | --- | --- |
| Stone Spear | 5 wood, 3 stone | Unlocks and equips a 17-damage spear |
| Iron Sword | 4 wood, 7 metal | Unlocks and equips a fast 25-damage sword |
| Iron Axe | 4 wood, 5 metal | Upgrades axe combat damage and doubles tree gathering power |
| Iron Pickaxe | 4 wood, 5 metal | Doubles stone and ore gathering power |
| Field Bandage | 5 fiber, 1 food | Immediately restores 35 health, up to maximum |

## 9. Building

Building pieces are crafted into a ready-piece inventory and then placed. If a
selected piece has none ready, selecting it pays the recipe and creates the
listed quantity before entering build mode.

Placement snaps to a 48-unit grid. The target must be inside the world boundary
and no more than 260 world units from the player. Pointer targeting is honored
within 250 units; otherwise the preview appears 105 units in the facing
direction. A cell may hold one floor, one roof, and one solid-layer object at
the same time, but not two objects on the same layer.

| Piece | Cost | Pieces made | Health | Function |
| --- | --- | ---: | ---: | --- |
| Wood Fence | 3 wood | 2 | 55 | Light barrier |
| Stone Fence | 4 stone | 2 | 105 | Durable barrier |
| Wood Gate | 5 wood | 1 | 70 | Opens and closes with `E` |
| Stone Gate | 5 stone, 1 metal | 1 | 130 | Reinforced gate; opens and closes with `E` |
| Wood Floor | 2 wood | 2 | 45 | Floor layer for structures |
| House Wall | 5 wood, 2 stone | 1 | 120 | Heavy shelter wall |
| House Door | 4 wood, 1 metal | 1 | 90 | Opens and closes with `E` |
| Roof | 4 wood, 2 fiber | 1 | 75 | Translucent roof layer |
| Spike Trap | 4 wood, 2 metal | 1 | 60 | Deals 10 damage to non-tamed creatures in range |
| Crop Plot | 2 wood, 2 fiber, 1 seed | 1 | 45 | Produces renewable food and seeds |

Crop plots mature in 75 seconds while the run is active. Pressing `E` on a
mature plot yields 4 food and 2 seeds, then resets its growth to zero. Pressing
`E` early reports its growth percentage.

Night creatures can damage any building they pass within 36 units of. A
building is destroyed and removed at zero health. In the current prototype,
solid buildings do not block player or creature movement, and opening a gate or
door is a visible state rather than a collision change.

## 10. Player combat

Attacks strike every non-tamed creature inside the attack arc, apply 22 units
of knockback, and make a wild animal angry. The arc extends roughly 66 degrees
to either side of the facing direction.

| Equipped item | Damage | Range | Cooldown |
| --- | ---: | ---: | ---: |
| Stone axe | 9 | 78 | 500 ms |
| Iron axe | 14 | 78 | 500 ms |
| Pickaxe | 7 | 78 | 500 ms |
| Stone spear | 17 | 102 | 500 ms |
| Iron sword | 25 | 102 | 380 ms |
| Food or build tool | 3 | 78 | 500 ms |

Every killed creature increments the threat-defeated count. Bears and boars
drop 2 food. Brutes drop 1 metal. Shades have no resource drop.

## 11. Wild animals and taming

The Meadow starts with these animals:

| Animal | Health | Speed | Contact damage | Aggro distance |
| --- | ---: | ---: | ---: | ---: |
| Bear | 65 | 48 | 8 | 135 |
| Boar | 42 | 54 | 5 | 90 |

A wild animal becomes angry when the player approaches inside its aggro
distance without food selected, or when attacked. It stops chasing after the
player moves more than 340 units away. Contact attacks can occur every 850 ms.

To tame an animal, equip food, approach it, and press `E` three times. Each
feeding consumes 1 food and clears its anger. A tamed animal follows the player
and cannot be hit by the player. It seeks shades and brutes within 230 units and
attacks when within 45 units, at most once every 800 ms:

- a tamed bear deals 16 damage;
- a tamed boar deals 10 damage.

Tamed animals do not target untamed bears or boars.

## 12. Night waves

One wave spawns at the transition into each night. Creatures appear roughly
430 to 710 units from the player, clamped to the current realm's boundary.

Wave size is `min(18, 3 + 2 × day)`. Night 1 therefore spawns 5 shades. From
night 2 onward, every fourth spawn is a brute. Difficulty scales as follows,
where `D` is the current day:

| Creature | Health | Speed | Contact damage |
| --- | --- | --- | --- |
| Shade | `28 + 8D` | `66 + 2D` | `7 + 1.4D` |
| Brute | `54 + 13D` | `45 + 2D` | `12 + 1.4D` |

Shades and brutes continuously chase the player, including after dawn. They
attack at contact range no more than once every 850 ms. They can also damage
nearby buildings. The wave counter shows the most recently spawned day, while
the kill counter tracks all creatures defeated during the run.

## 13. Current scope

The current game is deliberately run-based and local to one browser session.
It includes no multiplayer, accounts, saves, pause state, equipment durability,
inventory capacity, building repair, resource trading, quests, bosses, or
finite ending. Panels do not pause the simulation. These are not implied
features of the present rules.

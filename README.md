# Halflight

A top-down browser survival game. Gather resources and build during the day,
then defend yourself from creatures that grow stronger every night.

## Play

The GitHub Pages deployment is available at:

**https://bishoppawn1.github.io/halflight/**

## Controls

- WASD or arrow keys — move
- Mouse position — aim the equipped tool independently of movement
- Hold left mouse — continuously chop, mine, attack, or fire
- Left click — place one selected building piece
- Shift + left-drag — place selected building pieces across multiple grid cells
- E — interact, tame, eat, rest at bedrolls, enter caves, open gates, chests, and treasure caches, or confirm grid placement
- Space or F — attack
- 1–9 or 0 — select one of 10 hotbar slots
- Q — ready building pieces
- C — crafting menu
- I — open the free 30-slot inventory
- B — auto-build unfinished blueprints within three grid squares; moving stops it
- + / - or mouse wheel — zoom

Move tools, weapons, resources, food, and ready building pieces freely between
the backpack and hotbar by dragging them, or by selecting a source and then a
destination slot.

Craft starter tools and a Crafting Bench from the full-screen, square-card Craft
menu. After placing the
bench, stand near it to unlock advanced tools, weapons, ammunition, and wood,
stone, or metal construction pieces. Construction recipes create stacks in the
inventory; they never place a piece automatically.

Placed pieces begin as blueprints. Press B to build nearby pieces in 1.5 seconds
each; the player never walks toward distant jobs, and moving stops construction.
Craft a Deconstruction Hammer to reclaim part of a structure's cost.
Storage Chests move complete resource stacks into separate storage, making those
supplies unavailable to crafting until you retrieve them.

A Wood Axe and lit campfire are available at spawn. Bedrolls provide one rest
per day, while Standing Torches and Campfires create permanent pools of light.
At night and underground, the world beyond those light pools is hidden. Damaged
resources show a clear health bar, and crop plots show a live growth percent.
Night waves continue without a cap and spawn at random valid points across the map;
surviving wave monsters disappear at dawn.
The caves have no individual names. Each run hides a treasure cache in one
random cave chamber and an oversized guardian in another; both can appear in
the same chamber.

## Local development

    npm install
    npm run dev

Create a production build with:

    npm run build

## GitHub Pages

The workflow in .github/workflows/deploy-pages.yml builds and deploys the game
whenever main is updated. In the repository settings, set **Pages → Build and
deployment → Source** to **GitHub Actions**.

# Halflight

A top-down browser survival game. Gather resources and build during the day,
then defend yourself from creatures that grow stronger every night.

## Play

The GitHub Pages deployment is available at:

**https://bishoppawn1.github.io/halflight/**

## Controls

- WASD or arrow keys — move
- Hold left mouse — continuously chop, mine, attack, fire, or place
- E — gather once, interact, tame, eat, enter caves, open gates, or confirm grid placement
- Space or F — attack
- 1–9 or 0 — select one of 10 hotbar slots
- Q — build menu
- C — crafting menu
- I or B — open the free 30-slot inventory
- + / - or mouse wheel — zoom

Move tools, weapons, resources, food, and ready building pieces freely between
the backpack and hotbar by dragging them, or by selecting a source and then a
destination slot.

## Local development

    npm install
    npm run dev

Create a production build with:

    npm run build

## GitHub Pages

The workflow in .github/workflows/deploy-pages.yml builds and deploys the game
whenever main is updated. In the repository settings, set **Pages → Build and
deployment → Source** to **GitHub Actions**.

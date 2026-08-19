# Halflight

A top-down browser survival game. Gather resources and build during the day,
then defend yourself from creatures that grow stronger every night.

## Play

The GitHub Pages deployment is available at:

**https://bishoppawn1.github.io/halflight/**

## Controls

- WASD or arrow keys — move
- E — interact, gather, tame, open gates, or confirm grid placement
- Space or F — attack
- 1–4 — equip tools, weapon, or food
- Q — build menu
- C — crafting menu
- I or B — inventory
- + / - or mouse wheel — zoom

## Local development

    npm install
    npm run dev

Create a production build with:

    npm run build

## GitHub Pages

The workflow in .github/workflows/deploy-pages.yml builds and deploys the game
whenever main is updated. In the repository settings, set **Pages → Build and
deployment → Source** to **GitHub Actions**.

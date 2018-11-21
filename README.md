# Save the Princess

Built with TypeScript, React and [rot.js](http://ondras.github.io/rot.js/hp/). Tileset courtesy of [0x72](https://0x72.itch.io/dungeontileset-ii).

## To-Do List

- [x] Pathfinding 
- [x] Combat
- [x] FOV
- [ ] Skills
- [ ] Mouse Controls
- [ ] Help Page
- [ ] Floating Health Bars
- [x] Inventory System
- [ ] Variety
- [ ] Shops
- [ ] Animations
- [ ] Menu
- [ ] Online Saves

## Issues

- Monsters don't consider non-optimal routes. Rework using Dijkstra instead of AStar?
- Rewrite actions so they take a callback (the action itself), then execute endTurn -> monsterMove directly? 


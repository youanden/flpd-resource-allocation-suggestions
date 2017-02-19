# Fort Lauderdale Police Deployment Map

The goal of this project is to help in the allocation of police resources by facilitating a visual
overlay of police response times.

## Resources
- [Fort Lauderdale PD Data Portal](https://fortlauderdale.data.socrata.com/)

## Known Bugs
- [ ] (Major) Fix issue where heatmap inacurrately calculates dispatch and arrival crossing over midnight boundary

## Future Plans
- [ ] Deploy to gh pages so that demo is available to public
- [ ] Add threshold slider (so that users can modify the response time cut-off as they wish)
- [ ] Add time of day filtering (different staff / shifts could account for skewing response time averages)
- [ ] Add date range filtering
- [ ] Add quick group views (all accidents, all medical responses, etc.)
- [ ] Add heat map output inversion (instead of red for slowest response, fastest response would show up as red)
- [ ] Add ability to see data for specific police zones
- [ ] Add overlay option for police / fire stations
- [ ] Add leaflet markercluster (to see point maps as clusters)
- [ ] Refactor code (Hackathon got the best of me. I'm not proud of what I did [here](https://github.com/youanden/flpd-resource-allocation-suggestions/blob/master/client/components/Map.vue#L62)) (also completely avoided Vuex)
  - [ ] Use proper Vuex dispatching and storage for components using immutability best practices
  - [ ] Clean up package.json (dev dependencies I'm looking at you)
  - [ ] Clean up source code (I used [vuepack](https://github.com/egoist/vuepack))

## Potential Future Pivots
- Use traffic citation data and stop sign intersections to heatmap potential locations where there is poor visibility of stop signs
- Use traffic citation data for illegal parking + local public / private parking lots to figure out where effort can be spent to put parking signs (parking one block ahead, etc.)
- Use accident data in correlation with weather data to ascertain optimal locations for slippery when wet signs.

## Open source
- Vue.JS / Vuex 2
- Vue2Leaflet
- leaflet.heat
- Open Street Maps
- DateFNS

## Development Instructions

```bash
$ npm install
```

To develop:

```bash
$ npm run dev
```

To build for production:

```bash
$ npm run build
```

To lint your code:

```bash
$ npm run lint
```

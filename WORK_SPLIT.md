# OptiRoute 5-Part Team Split

Use this split if you want five people to work in parallel and push separate changes to the same Git repo.

## Part 1: App Shell and Entry Point
- Files: `src/App.tsx`, `src/main.tsx`
- Owns: top-level app state, tab switching, rendering the shared layout
- Good tasks: add new pages, change global app flow, wire new sections

## Part 2: Landing Page and Navigation
- Files: `src/components/Home.tsx`, `src/components/Navbar.tsx`
- Owns: hero section, feature cards, navigation, home-page copy
- Good tasks: improve landing content, add new nav items, polish the header layout

## Part 3: Route Planner UI
- Files: `src/components/SmartCityPlanner.tsx`
- Owns: controls, city selectors, speed slider, visualization layout
- Good tasks: add UI controls, improve interactions, split planner into smaller subcomponents

## Part 4: Algorithms
- Files: `src/algorithms/city_routes.ts`
- Owns: greedy, Dijkstra, and Floyd-Warshall logic
- Good tasks: improve path calculations, add new algorithms, add tests for algorithm output

## Part 5: Styling and Documentation
- Files: `src/index.css`, `src/App.css`, `README.md`
- Owns: theme, shared visual styles, project documentation
- Good tasks: refine the design system, make the UI responsive, keep docs updated

## Suggested Workflow
1. Create one branch per person.
2. Assign one part to each student.
3. Keep changes inside the owned files whenever possible.
4. Rebase or merge the branches before the final push.

## Example Branch Names
- `feature/app-shell`
- `feature/home-navbar`
- `feature/planner-ui`
- `feature/algorithms`
- `feature/styling-docs`
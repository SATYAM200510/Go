# 🗺️ OptiRoute — Smart City Route Planner Visualizer

> A project demonstrating **Greedy** and **Dynamic Programming** algorithms by finding optimal routes across a city map.

![OptiRoute](https://img.shields.io/badge/Algorithms-Greedy%20%7C%20DP-4ecda4?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3b82f6?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19-06b6d4?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-6.x-f59e0b?style=for-the-badge&logo=vite)

---

## 🚀 Live Features!!

User inputs a map of cities with roads and costs. The app finds the shortest path, cheapest path, and most stops-covered path — all using different algorithms.

### ⚡ Algorithms Used
| Algorithm | Complexity | Key Concept |
|-----------|-----------|-------------|
| **Greedy (Nearest Neighbor)** | O(V²) | Nearest-neighbour path — always pick closest unvisited city |
| **Dijkstra (Greedy + PQ)** | O((V+E) log V) | Optimal single-source shortest path |
| **DP (Floyd-Warshall)** | O(V³) | Find true shortest path between ALL pairs using a 2D matrix |

---

## 🛠 Tech Stack

- **Language:** TypeScript (type-safe algorithm implementations)
- **Framework:** React 19 + Vite 6
- **Styling:** Vanilla CSS (AURORA theme: Smoky Black + Mint Green)
- **Visualization:** Custom SVG mapping, no external UI libraries.

---

## 📦 Run Locally

```bash
git clone https://github.com/YOUR_USERNAME/optiroute.git
cd optiroute
npm install
npm run dev
```

Then open http://localhost:5173

---

## 📁 Project Structure

```
src/
├── algorithms/
│   └── city_routes.ts   # Nearest Neighbor, Dijkstra, Floyd-Warshall DP
├── components/
│   ├── Navbar.tsx        # Navigation
│   ├── Home.tsx          # Landing page
│   └── SmartCityPlanner.tsx  # Map Visualizations
├── index.css            # Design system & global styles
├── App.tsx              # Root component
└── main.tsx             # Entry point
```

---

## 👥 Suggested 5-Part Team Split

If you are sharing this project with five students, use these ownership areas:

1. App shell and entry point: `src/App.tsx`, `src/main.tsx`
2. Landing page and navigation: `src/components/Home.tsx`, `src/components/Navbar.tsx`
3. Route planner UI: `src/components/SmartCityPlanner.tsx`
4. Algorithms: `src/algorithms/city_routes.ts`
5. Styling and documentation: `src/index.css`, `src/App.css`, `README.md`

For a cleaner Git history, create one branch per person and keep changes inside the assigned area when possible.



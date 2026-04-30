// =============================================
// SMART CITY ALGORITHMS
// =============================================

export interface CityNode {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface CityEdge {
  from: string;
  to: string;
  distance: number;
  cost: number;
}

export interface PathStep {
  currentPath: string[];
  visited: Set<string>;
  message: string;
  activeEdges: [string, string][];
  currentLength: number;
}

// 1. Nearest Neighbor (Greedy TSP Approximation)
export function nearestNeighbor(nodes: CityNode[], edges: CityEdge[], startId: string, metric: 'distance' | 'cost' = 'distance'): PathStep[] {
  const steps: PathStep[] = [];
  const visited = new Set<string>();
  const path: string[] = [];
  let currentLength = 0;
  
  let curr = startId;
  visited.add(curr);
  path.push(curr);

  steps.push({
    currentPath: [...path],
    visited: new Set(visited),
    message: `Start at ${nodes.find(n => n.id === startId)?.name}`,
    activeEdges: [],
    currentLength: 0
  });

  while (visited.size < nodes.length) {
    let nearestNode = null;
    let minDistance = Infinity;

    // Find all edges connected to the current node
    const connectedEdges = edges.filter(e => e.from === curr || e.to === curr);
    
    // Find the closest unvisited neighbor
    for (const edge of connectedEdges) {
      const neighborId = edge.from === curr ? edge.to : edge.from;
      if (!visited.has(neighborId) && edge[metric] < minDistance) {
        minDistance = edge[metric];
        nearestNode = neighborId;
      }
    }

    if (!nearestNode) {
        // If we get stuck (no unvisited neighbors), just stop.
        steps.push({
            currentPath: [...path],
            visited: new Set(visited),
            message: `Dead end reached at ${nodes.find(n => n.id === curr)?.name}.`,
            activeEdges: [],
            currentLength
        });
        break;
    }

    visited.add(nearestNode);
    path.push(nearestNode);
    currentLength += minDistance;

    steps.push({
      currentPath: [...path],
      visited: new Set(visited),
      message: `Greedily selected nearest unvisited city: ${nodes.find(n => n.id === nearestNode)?.name} (${metric}: ${minDistance})`,
      activeEdges: [[curr, nearestNode]],
      currentLength
    });

    curr = nearestNode;
  }

  return steps;
}

// 2. Dijkstra's Algorithm (Shortest Path)
export interface DijkstraNodeStep {
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  visited: Set<string>;
  currentNode: string | null;
  message: string;
  activeEdges: [string, string][];
  path: string[];
}

export function dijkstraPath(nodes: CityNode[], edges: CityEdge[], startId: string, endId: string, metric: 'distance' | 'cost' = 'distance'): DijkstraNodeStep[] {
  const steps: DijkstraNodeStep[] = [];
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const unvisited = new Set<string>();
  const visited = new Set<string>();

  nodes.forEach(n => {
    dist[n.id] = Infinity;
    prev[n.id] = null;
    unvisited.add(n.id);
  });
  dist[startId] = 0;

  steps.push({
    distances: { ...dist },
    previous: { ...prev },
    visited: new Set(visited),
    currentNode: null,
    message: `Initialize distances. Start node ${startId} is 0, others are Infinity.`,
    activeEdges: [],
    path: []
  });

  while (unvisited.size > 0) {
    // Greedy choice: pick unvisited node with smallest distance
    let u: string | null = null;
    let minDist = Infinity;
    for (const nodeId of unvisited) {
      if (dist[nodeId] < minDist) {
        minDist = dist[nodeId];
        u = nodeId;
      }
    }

    if (u === null || dist[u] === Infinity) break;
    if (u === endId) break; // Reached target

    unvisited.delete(u);
    visited.add(u);

    const activeEdgesForStep: [string, string][] = [];

    const connectedEdges = edges.filter(e => e.from === u || e.to === u);
    for (const edge of connectedEdges) {
      const v = edge.from === u ? edge.to : edge.from;
      if (!unvisited.has(v)) continue;

      const alt = dist[u] + edge[metric];
      activeEdgesForStep.push([u, v]);
      
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
      }
    }

    steps.push({
      distances: { ...dist },
      previous: { ...prev },
      visited: new Set(visited),
      currentNode: u,
      message: `Visiting ${nodes.find(n=>n.id===u)?.name}. Updating neighbors' distances.`,
      activeEdges: activeEdgesForStep,
      path: []
    });
  }

  // Reconstruct path
  const path: string[] = [];
  let curr: string | null = endId;
  if (prev[curr] !== null || curr === startId) {
      while (curr !== null) {
        path.unshift(curr);
        curr = prev[curr];
      }
  }

  steps.push({
    distances: { ...dist },
    previous: { ...prev },
    visited: new Set(visited),
    currentNode: endId,
    message: path.length > 0 ? `Shortest path found! Total ${metric}: ${dist[endId]}` : `No path found to ${endId}.`,
    activeEdges: [],
    path
  });

  return steps;
}

// 3. Floyd-Warshall (All-Pairs Shortest Path - DP)
export interface FWStep {
    distMatrix: number[][];
    k: number;
    i: number;
    j: number;
    message: string;
    updated: boolean;
}

export function floydWarshall(nodes: CityNode[], edges: CityEdge[], metric: 'distance' | 'cost' = 'distance'): FWStep[] {
    const steps: FWStep[] = [];
    const n = nodes.length;
    const dist: number[][] = Array.from({ length: n }, () => new Array(n).fill(Infinity));
    
    // Map IDs to indices
    const idToIndex: Record<string, number> = {};
    nodes.forEach((node, i) => {
        idToIndex[node.id] = i;
        dist[i][i] = 0; // Distance to self is 0
    });

    edges.forEach(e => {
        const u = idToIndex[e.from];
        const v = idToIndex[e.to];
        dist[u][v] = e[metric];
        dist[v][u] = e[metric]; // Assuming undirected
    });

    steps.push({
        distMatrix: dist.map(row => [...row]),
        k: -1, i: -1, j: -1,
        message: "Initialize Distance Matrix with direct edge weights.",
        updated: false
    });

    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (dist[i][k] !== Infinity && dist[k][j] !== Infinity) {
                    const alt = dist[i][k] + dist[k][j];
                    const updated = alt < dist[i][j];
                    if (updated) {
                        dist[i][j] = alt;
                    }
                    
                    // To avoid too many steps in visualization, only record when an update happens 
                    // or record key iterations. Here we record updates for visual impact.
                    if (updated) {
                       steps.push({
                            distMatrix: dist.map(row => [...row]),
                            k, i, j,
                            message: `Path ${nodes[i].name} → ${nodes[j].name} is shorter via ${nodes[k].name}. New dist: ${alt}`,
                            updated: true
                        });
                    }
                }
            }
        }
        // Push a step at the end of each 'k' phase to summarize
        steps.push({
            distMatrix: dist.map(row => [...row]),
            k, i: -1, j: -1,
            message: `Completed phase k=${k} (using ${nodes[k].name} as intermediate).`,
            updated: false
        });
    }

    return steps;
}

import { useState, useRef, useCallback, useEffect } from 'react';
import { nearestNeighbor, dijkstraPath, floydWarshall } from '../algorithms/city_routes';
import type { CityNode, CityEdge, PathStep, DijkstraNodeStep, FWStep } from '../algorithms/city_routes';

// --- Map Data ---
const CITIES: CityNode[] = [
  { id: 'A', name: 'Seattle', x: 100, y: 100 },
  { id: 'B', name: 'Denver', x: 300, y: 250 },
  { id: 'C', name: 'Chicago', x: 500, y: 150 },
  { id: 'D', name: 'Boston', x: 800, y: 120 },
  { id: 'E', name: 'New York', x: 820, y: 200 },
  { id: 'F', name: 'Austin', x: 450, y: 450 },
  { id: 'G', name: 'Miami', x: 750, y: 500 },
  { id: 'H', name: 'SF', x: 80, y: 350 },
];

const ROADS: CityEdge[] = [
  { from: 'A', to: 'B', distance: 1300, cost: 150 },
  { from: 'A', to: 'H', distance: 800, cost: 90 },
  { from: 'H', to: 'B', distance: 1250, cost: 140 },
  { from: 'H', to: 'F', distance: 1700, cost: 200 },
  { from: 'B', to: 'C', distance: 1000, cost: 120 },
  { from: 'B', to: 'F', distance: 900, cost: 100 },
  { from: 'C', to: 'D', distance: 980, cost: 110 },
  { from: 'C', to: 'E', distance: 790, cost: 95 },
  { from: 'C', to: 'F', distance: 1100, cost: 130 },
  { from: 'D', to: 'E', distance: 215, cost: 30 },
  { from: 'E', to: 'G', distance: 1280, cost: 160 },
  { from: 'F', to: 'G', distance: 1350, cost: 150 },
];

type PlannerAlgo = 'greedy' | 'dijkstra' | 'dp';
type Metric = 'distance' | 'cost';

const ALGOS = [
  { id: 'greedy' as PlannerAlgo, label: 'Greedy (Nearest)', icon: '🏃', complexity: 'O(V²)', concept: 'Nearest-neighbour path — always pick closest unvisited city.' },
  { id: 'dijkstra' as PlannerAlgo, label: 'Dijkstra (Shortest)', icon: '🧭', complexity: 'O((V+E)logV)', concept: 'Optimal single-source shortest path using priority queues.' },
  { id: 'dp' as PlannerAlgo, label: 'DP (Floyd-Warshall)', icon: '🧠', complexity: 'O(V³)', concept: 'Find true shortest path between ALL pairs using a 2D matrix.' },
];

// --- Map Component ---
function CityMap({ 
    activePath = [], 
    visitedNodes = new Set<string>(), 
    activeEdges = [],
    highlightNode = null,
    metric = 'distance'
}: { 
    activePath?: string[], 
    visitedNodes?: Set<string>, 
    activeEdges?: [string, string][],
    highlightNode?: string | null,
    metric?: Metric
}) {
    
    const isEdgeActive = (from: string, to: string) => activeEdges.some(e => (e[0] === from && e[1] === to) || (e[0] === to && e[1] === from));
    const isEdgeInPath = (from: string, to: string) => {
        for (let i = 0; i < activePath.length - 1; i++) {
            if ((activePath[i] === from && activePath[i+1] === to) || (activePath[i] === to && activePath[i+1] === from)) return true;
        }
        return false;
    };

    return (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 16, overflowX: 'auto', position: 'relative' }}>
            <svg width={950} height={550} style={{ maxWidth: '100%' }}>
                {/* Draw Edges */}
                {ROADS.map(edge => {
                    const fromNode = CITIES.find(c => c.id === edge.from)!;
                    const toNode = CITIES.find(c => c.id === edge.to)!;
                    const pathEdge = isEdgeInPath(edge.from, edge.to);
                    const activeEdge = isEdgeActive(edge.from, edge.to);
                    
                    const strokeColor = pathEdge ? 'var(--mint)' : activeEdge ? 'var(--coral)' : 'rgba(255,255,255,0.08)';
                    const strokeWidth = pathEdge || activeEdge ? 3 : 1.5;

                    return (
                        <g key={`${edge.from}-${edge.to}`}>
                            <line 
                                x1={fromNode.x} y1={fromNode.y} 
                                x2={toNode.x} y2={toNode.y}
                                stroke={strokeColor}
                                strokeWidth={strokeWidth}
                                style={{ transition: 'all 0.4s ease' }}
                            />
                            <g transform={`translate(${(fromNode.x + toNode.x) / 2}, ${(fromNode.y + toNode.y) / 2})`}>
                                <rect x={-20} y={-12} width={40} height={20} rx={4} fill="var(--bg-card)" stroke="var(--border)" />
                                <text x={0} y={3} textAnchor="middle" fontSize={11} fill="var(--text-muted)" fontFamily="monospace" fontWeight={600}>
                                    {metric === 'cost' ? '$' : ''}{edge[metric]}
                                </text>
                            </g>
                        </g>
                    );
                })}

                {/* Draw Nodes */}
                {CITIES.map(city => {
                    const isVisited = visitedNodes.has(city.id);
                    const isPathNode = activePath.includes(city.id);
                    const isHighlight = highlightNode === city.id;

                    const fill = isHighlight ? 'var(--coral)' : isPathNode ? 'var(--mint)' : isVisited ? 'var(--mint-dim)' : 'var(--bg-card)';
                    const stroke = isHighlight ? 'var(--coral)' : isPathNode ? 'var(--mint)' : isVisited ? 'var(--mint)' : 'rgba(255,255,255,0.12)';
                    const shadow = isHighlight ? 'drop-shadow(0 0 12px var(--coral))' : isPathNode ? 'drop-shadow(0 0 10px var(--mint))' : 'none';

                    return (
                        <g key={city.id} style={{ transition: 'all 0.4s ease', cursor: 'pointer' }}>
                            <circle cx={city.x} cy={city.y} r={20} fill={fill} stroke={stroke} strokeWidth={2} style={{ filter: shadow }} />
                            <text x={city.x} y={city.y + 5} textAnchor="middle" fill={(isPathNode || isVisited || isHighlight) ? '#0e0f11' : 'var(--text-primary)'} fontSize={14} fontWeight={800} fontFamily="'Outfit',sans-serif">
                                {city.id}
                            </text>
                            <text x={city.x} y={city.y - 25} textAnchor="middle" fill="var(--text-primary)" fontSize={12} fontWeight={600} fontFamily="'Inter',sans-serif">
                                {city.name}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

// --- Visualizer Components ---

function GreedyMapViz({ startCity, metric, speed }: { startCity: string, metric: Metric, speed: number }) {
    const [steps, setSteps] = useState<PathStep[]>([]);
    const [step, setStep] = useState(0);
    const [running, setRunning] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const reset = useCallback(() => {
        clearInterval(timerRef.current!);
        setRunning(false);
        setStep(0);
    }, []);

    useEffect(() => {
        setSteps(nearestNeighbor(CITIES, ROADS, startCity, metric));
        reset();
    }, [startCity, metric, reset]);

    const play = useCallback(() => {
        if (running) { clearInterval(timerRef.current!); setRunning(false); return; }
        setRunning(true);
        timerRef.current = setInterval(() => {
            setStep(s => {
                if (s >= steps.length - 1) { clearInterval(timerRef.current!); setRunning(false); return s; }
                return s + 1;
            });
        }, speed);
    }, [running, steps.length, speed]);

    if (!steps.length) return null;
    const cur = steps[step];

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="message-box">{cur.message}</div>
            
            <CityMap activePath={cur.currentPath} visitedNodes={cur.visited} activeEdges={cur.activeEdges} metric={metric} />

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Path:</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {cur.currentPath.map((node, i) => (
                        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="badge badge-green">{CITIES.find(c=>c.id===node)?.name}</span>
                            {i < cur.currentPath.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
                        </span>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
                 <div className="glass-card" style={{ padding: '10px 20px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total {metric === 'cost' ? 'Cost' : 'Distance'}</div>
                    <div style={{ fontSize: 20, color: 'var(--mint)', fontWeight: 'bold' }}>
                        {metric === 'cost' ? '$' : ''}{cur.currentLength} {metric === 'distance' ? 'km' : ''}
                    </div>
                 </div>
            </div>

            <StepControls step={step} total={steps.length} onPrev={() => setStep(s => s - 1)} onNext={() => setStep(s => s + 1)} onReset={reset} running={running} onPlay={play} />
        </div>
    );
}

function DijkstraMapViz({ startCity, endCity, metric, speed }: { startCity: string, endCity: string, metric: Metric, speed: number }) {
    const [steps, setSteps] = useState<DijkstraNodeStep[]>([]);
    const [step, setStep] = useState(0);
    const [running, setRunning] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const reset = useCallback(() => {
        clearInterval(timerRef.current!);
        setRunning(false);
        setStep(0);
    }, []);

    useEffect(() => {
        setSteps(dijkstraPath(CITIES, ROADS, startCity, endCity, metric));
        reset();
    }, [startCity, endCity, metric, reset]);

    const play = useCallback(() => {
        if (running) { clearInterval(timerRef.current!); setRunning(false); return; }
        setRunning(true);
        timerRef.current = setInterval(() => {
            setStep(s => {
                if (s >= steps.length - 1) { clearInterval(timerRef.current!); setRunning(false); return s; }
                return s + 1;
            });
        }, speed);
    }, [running, steps.length, speed]);

    if (!steps.length) return null;
    const cur = steps[step];

    return (
         <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="message-box">{cur.message}</div>
            
            <CityMap activePath={cur.path} visitedNodes={cur.visited} activeEdges={cur.activeEdges} highlightNode={cur.currentNode} metric={metric} />

            {/* Distances Table */}
             <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CITIES.map(node => (
                <div key={node.id} style={{
                    background: cur.path.includes(node.id) ? 'rgba(78,205,164,0.12)' : cur.currentNode === node.id ? 'rgba(192,104,90,0.15)' : 'var(--bg-card)',
                    border: `1px solid ${cur.path.includes(node.id) ? 'var(--mint)' : cur.currentNode === node.id ? 'var(--coral)' : 'var(--border)'}`,
                    boxShadow: cur.path.includes(node.id) ? '0 0 10px rgba(78,205,164,0.2)' : 'none',
                    borderRadius: 10, padding: '8px 14px', textAlign: 'center',
                    transition: 'all 0.3s',
                }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>{node.id}</div>
                    <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--mint-light)' }}>
                    {cur.distances[node.id] === Infinity ? '∞' : `${metric === 'cost' ? '$' : ''}${cur.distances[node.id]}`}
                    </div>
                </div>
                ))}
            </div>

             {cur.path.length > 0 && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Shortest Path ({startCity} → {endCity}):</span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {cur.path.map((node, i) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span className="badge badge-green">{CITIES.find(c=>c.id===node)?.name}</span>
                                {i < cur.path.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <StepControls step={step} total={steps.length} onPrev={() => setStep(s => s - 1)} onNext={() => setStep(s => s + 1)} onReset={reset} running={running} onPlay={play} />
         </div>
    )
}

function FloydWarshallViz({ metric, speed }: { metric: Metric, speed: number }) {
    const [steps, setSteps] = useState<FWStep[]>([]);
    const [step, setStep] = useState(0);
    const [running, setRunning] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const reset = useCallback(() => {
        clearInterval(timerRef.current!);
        setRunning(false);
        setStep(0);
    }, []);

    useEffect(() => {
        setSteps(floydWarshall(CITIES, ROADS, metric));
        reset();
    }, [metric, reset]);

    const play = useCallback(() => {
        if (running) { clearInterval(timerRef.current!); setRunning(false); return; }
        setRunning(true);
        timerRef.current = setInterval(() => {
            setStep(s => {
                if (s >= steps.length - 1) { clearInterval(timerRef.current!); setRunning(false); return s; }
                return s + 1;
            });
        }, Math.max(100, speed / 3)); // DP has many steps, run faster
    }, [running, steps.length, speed]);

    if (!steps.length) return null;
    const cur = steps[step];

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="message-box">{cur.message}</div>

            {/* Matrix Visualization */}
            <div className="dp-table-wrap" style={{ background: 'var(--bg-secondary)', padding: 20, borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{metric === 'cost' ? 'Cost' : 'Distance'} Matrix (All Pairs)</div>
                <table className="dp-table">
                    <thead>
                        <tr>
                            <th></th>
                            {CITIES.map(c => <th key={c.id}>{c.id}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {cur.distMatrix.map((row, i) => (
                            <tr key={i}>
                                <th>{CITIES[i].id}</th>
                                {row.map((val, j) => {
                                    const isUpdatedCell = cur.updated && cur.i === i && cur.j === j;
                                    const isIntermediateRowCol = cur.k !== -1 && (i === cur.k || j === cur.k);
                                    
                                    let className = '';
                                    if (isUpdatedCell) className = 'active'; 
                                    else if (isIntermediateRowCol) className = 'highlight';

                                    return (
                                        <td key={j} className={className}>
                                            {val === Infinity ? '∞' : val}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

             <StepControls step={step} total={steps.length} onPrev={() => setStep(s => s - 1)} onNext={() => setStep(s => s + 1)} onReset={reset} running={running} onPlay={play} />
        </div>
    )
}

// --- Shared Controls ---
function StepControls({ step, total, onPrev, onNext, onReset, running, onPlay }: any) {
    const pct = total > 1 ? (step / (total - 1)) * 100 : 0;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-ghost" onClick={onReset} disabled={running}>⟳ Reset</button>
                <button className="btn btn-ghost" onClick={onPrev} disabled={step === 0 || running}>‹ Prev</button>
                <button className="btn btn-primary" onClick={onPlay} disabled={step >= total - 1}>
                    {running ? '⏸ Pause' : '▶ Play'}
                </button>
                <button className="btn btn-ghost" onClick={onNext} disabled={step >= total - 1 || running}>Next ›</button>
                <div className="step-counter">Step <span>{step + 1}</span> / <span>{total}</span></div>
            </div>
        </div>
    );
}

// --- Main Route Planner View ---
export default function SmartCityPlanner() {
  const [algo, setAlgo] = useState<PlannerAlgo>('greedy');
  const [metric, setMetric] = useState<Metric>('distance');
  const [startCity, setStartCity] = useState('A');
  const [endCity, setEndCity] = useState('G');
  const [speed, setSpeed] = useState(800);

  const selected = ALGOS.find(a => a.id === algo)!;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="badge badge-orange" style={{ marginBottom: 12 }}>🚀 Smart City Route Planner</div>
        <h1 style={{ fontSize: 32, fontFamily: "'Outfit',sans-serif", marginBottom: 8 }}>Route Optimization Algorithms</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Compare how Greedy, Dijkstra, and Dynamic Programming algorithms solve pathfinding problems differently on a city map.
        </p>
      </div>

      {/* Algo selector */}
      <div className="pill-tabs" style={{ marginBottom: 28, flexWrap: 'wrap' }}>
        {ALGOS.map(a => (
          <button key={a.id} className={`pill-tab ${algo === a.id ? 'active' : ''}`} onClick={() => setAlgo(a.id)}>
            {a.icon} {a.label}
          </button>
        ))}
      </div>

      {/* Info card */}
      <div className="glass-card" style={{ padding: 20, marginBottom: 24, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 36 }}>{selected.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
            <h2 style={{ fontSize: 18, fontFamily: "'Outfit',sans-serif" }}>{selected.label}</h2>
            <span className="badge badge-blue">⏱ {selected.complexity}</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{selected.concept}</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="glass-card" style={{ padding: '16px 24px', marginBottom: 24, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* Metric Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Optimize:</span>
            <div className="pill-tabs" style={{ padding: 2 }}>
                <button className={`pill-tab ${metric === 'distance' ? 'active' : ''}`} style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => setMetric('distance')}>Distance (km)</button>
                <button className={`pill-tab ${metric === 'cost' ? 'active' : ''}`} style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => setMetric('cost')}>Cost ($)</button>
            </div>
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border)' }}></div>

        {/* Start / End Cities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Start:</label>
            <select className="algo-input" style={{ width: 120, padding: '6px 10px' }} value={startCity} onChange={e => setStartCity(e.target.value)} disabled={algo === 'dp'}>
                {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>End:</label>
            <select className="algo-input" style={{ width: 120, padding: '6px 10px' }} value={endCity} onChange={e => setEndCity(e.target.value)} disabled={algo === 'greedy' || algo === 'dp'}>
                {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border)' }}></div>

        {/* Speed Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 150 }}>
             <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Speed:</label>
             <input type="range" min="100" max="1500" step="100" value={1600 - speed} onChange={e => setSpeed(1600 - Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--mint)' }} />
        </div>

      </div>

      {/* Visualizer Container */}
      <div className="glass-card" style={{ padding: 24 }}>
          {algo === 'greedy' && <GreedyMapViz startCity={startCity} metric={metric} speed={speed} />}
          {algo === 'dijkstra' && <DijkstraMapViz startCity={startCity} endCity={endCity} metric={metric} speed={speed} />}
          {algo === 'dp' && <FloydWarshallViz metric={metric} speed={speed} />}
      </div>
    </div>
  );
}

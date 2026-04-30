import type { AlgoTab } from '../App'

interface Props { onNav: (tab: AlgoTab) => void }

const algos = [
  {
    category: 'Algorithms Used',
    badge: 'badge-purple',
    badgeLabel: '🗺️ Map Visualizer',
    glow: 'rgba(78,205,164,0.07)',
    borderColor: 'rgba(78,205,164,0.15)',
    items: [
      { icon: '🏃', name: 'Greedy', desc: 'Nearest-neighbour path — always pick closest unvisited city', complexity: 'O(V²)' },
      { icon: '🧠', name: 'DP (Bellman-Ford / Floyd-Warshall)', desc: 'Find true shortest path even with varied edge weights', complexity: 'O(V³)' },
      { icon: '🧭', name: 'Dijkstra (Greedy + Priority Queue)', desc: 'Optimal single-source shortest path', complexity: 'O((V+E)logV)' },
    ],
    tab: 'planner' as AlgoTab,
  }
]

const stats = [
  { label: 'Map Nodes', value: '8', icon: '📍' },
  { label: 'Pathing Algos', value: '3', icon: '🛣️' },
  { label: 'Complexity', value: 'Shown', icon: '⏱️' },
  { label: 'Interactive', value: 'Yes', icon: '🎮' },
]

export default function Home({ onNav }: Props) {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px 80px' }}>

      {/* ── Hero ── */}
      <div className="fade-in" style={{ textAlign: 'center', marginBottom: 72 }}>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 70px)', lineHeight: 1.08,
          marginBottom: 22, fontFamily: "'Outfit',sans-serif", fontWeight: 900,
        }}>
          Smart City <span className="gradient-text">Route Planner</span>
          <br />Visualizer
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.85 }}>
          User inputs a map of cities with roads and costs. The app finds the shortest path, cheapest path, and most stops-covered path — all using different algorithms.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => onNav('planner')} style={{ fontSize: 15, padding: '13px 30px' }}>
            🗺️ Open Route Planner
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 72 }}>
        {stats.map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '22px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>{s.icon}</div>
            <div style={{
              fontSize: 26, fontWeight: 800, fontFamily: "'Outfit',sans-serif",
              color: '#4ecda4',
            }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Algorithm card groups ── */}
      {algos.map(group => (
        <div key={group.category} style={{ marginBottom: 52 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div className={`badge ${group.badge}`}>{group.badgeLabel}</div>
            <h2 style={{ fontSize: 20, fontFamily: "'Outfit',sans-serif", color: 'var(--text-primary)' }}>{group.category}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 14 }}>
            {group.items.map(item => (
              <div
                key={item.name}
                className="glass-card"
                style={{
                  padding: 24, cursor: 'pointer',
                  background: group.glow,
                  borderColor: group.borderColor,
                }}
                onClick={() => onNav(group.tab)}
              >
                <div style={{ fontSize: 30, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ fontSize: 15, marginBottom: 6, color: 'var(--text-primary)', fontFamily: "'Outfit',sans-serif" }}>{item.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.65 }}>{item.desc}</p>
                <div className="badge badge-blue" style={{ fontSize: 10 }}>⏱ {item.complexity}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
      


      {/* ── Aurora label ── */}
      <div style={{ textAlign: 'center', marginTop: 60, opacity: 0.4 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mint)', fontFamily: "'JetBrains Mono',monospace" }}>
          ● AURORA THEME — Smoky Black + Mint Green
        </span>
      </div>
    </div>
  )
}

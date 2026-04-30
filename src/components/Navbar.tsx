import type { AlgoTab } from '../App'

interface Props {
  activeTab: AlgoTab
  onNav: (tab: AlgoTab) => void
}

const navItems: { id: AlgoTab; label: string; icon: string }[] = [
  { id: 'home',    label: 'Home',    icon: '⬡' },
  { id: 'planner', label: 'Route Planner', icon: '🗺️' },
]

export default function Navbar({ activeTab, onNav }: Props) {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: '68px',
      background: 'rgba(14,15,17,0.92)',
      backdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(78,205,164,0.1)',
      display: 'flex', alignItems: 'center',
      padding: '0 32px',
      gap: '32px',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '0 0 auto' }}>
        <div style={{
          width: 36, height: 36,
          background: '#4ecda4',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px',
          boxShadow: '0 0 18px rgba(78,205,164,0.35)',
          color: '#0e0f11',
          fontWeight: 800,
        }}>⬡</div>
        <div>
          <div style={{
            fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '18px',
            background: 'linear-gradient(135deg, #4ecda4, #62d9bc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            OptiRoute
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            City Network Visualizer
          </div>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flex: 1 }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            style={{
              padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600, fontFamily: "'Inter',sans-serif",
              background: activeTab === item.id ? 'rgba(78,205,164,0.12)' : 'transparent',
              color: activeTab === item.id ? '#4ecda4' : 'var(--text-secondary)',
              borderBottom: activeTab === item.id ? '2px solid #4ecda4' : '2px solid transparent',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>


    </nav>
  )
}

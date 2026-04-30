import { useState, useCallback } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Home from './components/Home'
import SmartCityPlanner from './components/SmartCityPlanner'

export type AlgoTab = 'home' | 'planner'

function App() {
  const [activeTab, setActiveTab] = useState<AlgoTab>('home')

  const handleNav = useCallback((tab: AlgoTab) => setActiveTab(tab), [])

  return (
    <>
      <div className="bg-mesh" />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <Navbar activeTab={activeTab} onNav={handleNav} />
        <main style={{ paddingTop: '72px' }}>
          {activeTab === 'home'    && <Home onNav={handleNav} />}
          {activeTab === 'planner' && <SmartCityPlanner />}
        </main>
      </div>
    </>
  )
}

export default App

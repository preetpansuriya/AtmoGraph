import React from 'react'
import { Network, BarChart3, Brain, Zap } from 'lucide-react'

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-left">
        <Network className="logo-icon" size={32} />
        <h1 className="header-title">Atmo-graph</h1>
        <span className="header-subtitle">Supply Chain Intelligence</span>
      </div>
      <div className="header-right">
        <div className="header-stats">
          <div className="stat-item">
            <BarChart3 size={16} />
            <span>Active Nodes: 1,234</span>
          </div>
          <div className="stat-item">
            <Brain size={16} />
            <span>GNN Accuracy: 94.2%</span>
          </div>
          <div className="stat-item">
            <Zap size={16} />
            <span>Real-time: Active</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

import React, { useState } from 'react'
import { Brain, TrendingUp, AlertTriangle, Activity, Zap, ChevronDown, ChevronUp } from 'lucide-react'

interface Metric {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'stable'
}

const SmartIntelligencePanel: React.FC<{ onOpenGnnMetrics: () => void }> = ({ onOpenGnnMetrics }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [metrics] = useState<Metric[]>([
    { label: 'Network Health', value: '94.2%', change: '+2.1%', trend: 'up' },
    { label: 'Risk Score', value: '3.2/10', change: '-0.5', trend: 'down' },
    { label: 'Efficiency', value: '87.8%', change: '+1.3%', trend: 'up' },
    { label: 'Anomalies', value: '12', change: '+3', trend: 'up' }
  ])

  const [alerts] = useState([
    { id: 1, type: 'warning', message: 'Supply chain disruption detected in APAC region', time: '2 min ago' },
    { id: 2, type: 'critical', message: 'Critical delay in raw material shipment', time: '15 min ago' },
    { id: 3, type: 'info', message: 'New supplier onboarded successfully', time: '1 hour ago' }
  ])

  const [predictions] = useState([
    { id: 1, title: 'Demand Surge', confidence: 89, timeframe: 'Next 7 days' },
    { id: 2, title: 'Supply Shortage', confidence: 76, timeframe: 'Next 14 days' },
    { id: 3, title: 'Price Volatility', confidence: 67, timeframe: 'Next 30 days' }
  ])

  return (
    <aside className={`intelligence-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <Brain size={20} className="panel-icon" />
        <h3>Smart Intelligence</h3>
        {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </div>

      {isExpanded && (
        <div className="panel-content">
          {/* Key Metrics */}
          <div className="metrics-section">
            <h4>Key Metrics</h4>
            <div className="metrics-grid">
              {metrics.map((metric, index) => (
                <div key={index} className="metric-card">
                  <div className="metric-label">{metric.label}</div>
                  <div className="metric-value">{metric.value}</div>
                  <div className={`metric-change ${metric.trend}`}>
                    {metric.trend === 'up' && <TrendingUp size={12} />}
                    {metric.trend === 'down' && <TrendingUp size={12} className="down" />}
                    <span>{metric.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Alerts */}
          <div className="alerts-section">
            <h4>Real-time Alerts</h4>
            <div className="alerts-list">
              {alerts.map(alert => (
                <div key={alert.id} className={`alert-item ${alert.type}`}>
                  <AlertTriangle size={16} className="alert-icon" />
                  <div className="alert-content">
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-time">{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GNN Predictions */}
          <div className="predictions-section">
            <div className="predictions-header">
              <h4>GNN Predictions</h4>
              <button className="view-all-button" onClick={onOpenGnnMetrics}>
                View All
              </button>
            </div>
            <div className="predictions-list">
              {predictions.map(prediction => (
                <div key={prediction.id} className="prediction-item">
                  <div className="prediction-info">
                    <div className="prediction-title">{prediction.title}</div>
                    <div className="prediction-timeframe">{prediction.timeframe}</div>
                  </div>
                  <div className="prediction-confidence">
                    <Activity size={14} />
                    <span>{prediction.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="actions-section">
            <h4>Quick Actions</h4>
            <div className="actions-grid">
              <button className="action-button">
                <Zap size={16} />
                <span>Run Analysis</span>
              </button>
              <button className="action-button">
                <Activity size={16} />
                <span>Generate Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default SmartIntelligencePanel

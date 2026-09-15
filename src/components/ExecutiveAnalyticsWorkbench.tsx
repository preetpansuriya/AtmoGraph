import React, { useState } from 'react'
import { BarChart3, TrendingUp, Users, Truck, DollarSign, AlertTriangle, Download, Filter, Calendar } from 'lucide-react'

interface KPIMetric {
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: React.ReactNode
}

const ExecutiveAnalyticsWorkbench: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [kpiMetrics] = useState<KPIMetric[]>([
    {
      label: 'Total Revenue',
      value: '$2.4M',
      change: '+12.5%',
      trend: 'up',
      icon: <DollarSign size={16} />
    },
    {
      label: 'On-Time Delivery',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: <Truck size={16} />
    },
    {
      label: 'Active Suppliers',
      value: '156',
      change: '+8',
      trend: 'up',
      icon: <Users size={16} />
    },
    {
      label: 'Risk Score',
      value: '3.2/10',
      change: '-0.5',
      trend: 'down',
      icon: <AlertTriangle size={16} />
    }
  ])

  const [chartData] = useState([
    { label: 'Jan', value: 65 },
    { label: 'Feb', value: 78 },
    { label: 'Mar', value: 90 },
    { label: 'Apr', value: 81 },
    { label: 'May', value: 95 },
    { label: 'Jun', value: 88 }
  ])

  const handleExport = () => {
    console.log('Exporting analytics report...')
  }

  return (
    <div className={`executive-analytics ${isMinimized ? 'minimized' : 'expanded'}`}>
      <div className="analytics-header" onClick={() => setIsMinimized(!isMinimized)}>
        <BarChart3 size={20} className="analytics-icon" />
        <h3>Executive Analytics</h3>
        <div className="analytics-actions">
          <button className="action-icon-button" title="Filter">
            <Filter size={16} />
          </button>
          <button className="action-icon-button" title="Calendar">
            <Calendar size={16} />
          </button>
          <button className="action-icon-button" title="Download" onClick={handleExport}>
            <Download size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="analytics-content">
          {/* Period Selector */}
          <div className="period-selector">
            {['7d', '30d', '90d', '1y'].map(period => (
              <button
                key={period}
                className={`period-button ${selectedPeriod === period ? 'active' : ''}`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </button>
            ))}
          </div>

          {/* KPI Metrics */}
          <div className="kpi-grid">
            {kpiMetrics.map((metric, index) => (
              <div key={index} className="kpi-card">
                <div className="kpi-icon">{metric.icon}</div>
                <div className="kpi-label">{metric.label}</div>
                <div className="kpi-value">{metric.value}</div>
                <div className={`kpi-change ${metric.trend}`}>
                  <TrendingUp size={12} className={metric.trend === 'down' ? 'down' : ''} />
                  <span>{metric.change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart Section */}
          <div className="chart-section">
            <h4>Performance Trend</h4>
            <div className="chart-container">
              <div className="chart-bars">
                {chartData.map((item, index) => (
                  <div key={index} className="chart-bar-group">
                    <div 
                      className="chart-bar"
                      style={{ 
                        height: `${item.value}%`,
                        background: `linear-gradient(180deg, #00d4ff 0%, #0099cc 100%)`
                      }}
                    ></div>
                    <span className="chart-label">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="executive-summary">
            <h4>Executive Summary</h4>
            <div className="summary-content">
              <p>
                Supply chain performance has improved by <strong>12.5%</strong> over the selected period. 
                Key drivers include improved supplier relationships and optimized logistics routes. 
                Risk levels have decreased due to proactive mitigation strategies.
              </p>
              <div className="summary-highlights">
                <div className="highlight-item positive">
                  <span className="highlight-icon">✓</span>
                  <span>Revenue growth exceeded targets</span>
                </div>
                <div className="highlight-item positive">
                  <span className="highlight-icon">✓</span>
                  <span>Delivery reliability improved</span>
                </div>
                <div className="highlight-item warning">
                  <span className="highlight-icon">!</span>
                  <span>Monitor raw material costs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExecutiveAnalyticsWorkbench

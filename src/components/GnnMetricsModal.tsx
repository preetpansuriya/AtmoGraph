import React, { useState } from 'react'
import { X, Brain, Activity, Zap, Target, TrendingUp, BarChart3, Download } from 'lucide-react'

interface GnnMetricsModalProps {
  onClose: () => void
}

const GnnMetricsModal: React.FC<GnnMetricsModalProps> = ({ onClose }) => {
  const [selectedModel, setSelectedModel] = useState('gcn')
  const [timeRange, setTimeRange] = useState('24h')

  const modelMetrics = {
    gcn: {
      name: 'Graph Convolutional Network',
      accuracy: 94.2,
      precision: 91.8,
      recall: 89.5,
      f1Score: 90.6,
      trainingTime: '2.4s',
      inferenceTime: '0.8s'
    },
    gat: {
      name: 'Graph Attention Network',
      accuracy: 92.8,
      precision: 90.2,
      recall: 88.7,
      f1Score: 89.4,
      trainingTime: '3.1s',
      inferenceTime: '1.2s'
    },
    graphsage: {
      name: 'GraphSAGE',
      accuracy: 91.5,
      precision: 88.9,
      recall: 87.2,
      f1Score: 88.0,
      trainingTime: '1.8s',
      inferenceTime: '0.6s'
    }
  }

  const currentMetrics = modelMetrics[selectedModel as keyof typeof modelMetrics]

  const performanceData = [
    { label: 'Accuracy', value: currentMetrics.accuracy, color: '#00d4ff' },
    { label: 'Precision', value: currentMetrics.precision, color: '#48bb78' },
    { label: 'Recall', value: currentMetrics.recall, color: '#ecc94b' },
    { label: 'F1 Score', value: currentMetrics.f1Score, color: '#f56565' }
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content gnn-metrics-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Brain size={24} className="modal-icon" />
            <h2>GNN Model Metrics</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Model Selection */}
          <div className="model-selector">
            <h3>Select Model</h3>
            <div className="model-options">
              {Object.entries(modelMetrics).map(([key, model]) => (
                <button
                  key={key}
                  className={`model-option ${selectedModel === key ? 'active' : ''}`}
                  onClick={() => setSelectedModel(key)}
                >
                  <span className="model-name">{model.name}</span>
                  <span className="model-accuracy">{model.accuracy}%</span>
                </button>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="section">
            <div className="section-header">
              <h3>Performance Metrics</h3>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="time-range-select"
              >
                <option value="1h">Last 1 hour</option>
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>
            
            <div className="metrics-cards">
              {performanceData.map((metric, index) => (
                <div key={index} className="metric-card-large">
                  <div className="metric-header">
                    <div className="metric-dot" style={{ backgroundColor: metric.color }}></div>
                    <span className="metric-label">{metric.label}</span>
                  </div>
                  <div className="metric-value-large">{metric.value}%</div>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill" 
                      style={{ 
                        width: `${metric.value}%`,
                        backgroundColor: metric.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Training Statistics */}
          <div className="section">
            <h3>Training Statistics</h3>
            <div className="training-stats">
              <div className="stat-row">
                <Activity size={16} className="stat-icon" />
                <span className="stat-label">Training Time</span>
                <span className="stat-value">{currentMetrics.trainingTime}</span>
              </div>
              <div className="stat-row">
                <Zap size={16} className="stat-icon" />
                <span className="stat-label">Inference Time</span>
                <span className="stat-value">{currentMetrics.inferenceTime}</span>
              </div>
              <div className="stat-row">
                <Target size={16} className="stat-icon" />
                <span className="stat-label">Loss Function</span>
                <span className="stat-value">0.0234</span>
              </div>
              <div className="stat-row">
                <TrendingUp size={16} className="stat-icon" />
                <span className="stat-label">Convergence Rate</span>
                <span className="stat-value">98.2%</span>
              </div>
            </div>
          </div>

          {/* Prediction Accuracy Chart */}
          <div className="section">
            <div className="section-header">
              <h3>Prediction Accuracy Over Time</h3>
              <button className="icon-button" title="Download Chart">
                <Download size={16} />
              </button>
            </div>
            <div className="chart-container-small">
              <div className="accuracy-chart">
                {Array.from({ length: 20 }, (_, i) => (
                  <div 
                    key={i} 
                    className="chart-bar-vertical"
                    style={{ 
                      height: `${70 + Math.random() * 25}%`,
                      background: `linear-gradient(180deg, #00d4ff 0%, #0099cc 100%)`
                    }}
                  ></div>
                ))}
              </div>
              <div className="chart-labels">
                <span>20 epochs ago</span>
                <span>Current</span>
              </div>
            </div>
          </div>

          {/* Model Recommendations */}
          <div className="section">
            <h3>Model Recommendations</h3>
            <div className="recommendations">
              <div className="recommendation-item positive">
                <BarChart3 size={16} className="rec-icon" />
                <div className="rec-content">
                  <span className="rec-title">High accuracy achieved</span>
                  <span className="rec-desc">Current model performs above threshold</span>
                </div>
              </div>
              <div className="recommendation-item warning">
                <Activity size={16} className="rec-icon" />
                <div className="rec-content">
                  <span className="rec-title">Consider fine-tuning</span>
                  <span className="rec-desc">Small improvements possible with hyperparameter tuning</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="action-button secondary" onClick={onClose}>
            Close
          </button>
          <button className="action-button primary">
            Export Report
          </button>
        </div>
      </div>
    </div>
  )
}

export default GnnMetricsModal

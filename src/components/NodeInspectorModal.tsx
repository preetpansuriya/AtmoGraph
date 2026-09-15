import React from 'react'
import { X, MapPin, Link2, Activity, AlertTriangle, TrendingUp, Calendar } from 'lucide-react'
import { Node } from '../types/graph'

interface NodeInspectorModalProps {
  node: Node
  onClose: () => void
}

const NodeInspectorModal: React.FC<NodeInspectorModalProps> = ({ node, onClose }) => {
  // Generate pseudo-random but consistent data based on node ID
  const nodeIdHash = node.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  // Generate dynamic node details based on actual node data
  const getNodeDetails = (node: Node, hash: number) => {
    const locations = ['Shanghai, China', 'New York, USA', 'Mumbai, India', 'Frankfurt, Germany', 'Tokyo, Japan', 'Singapore', 'Dubai, UAE']
    const statuses = ['Active', 'Maintenance', 'Idle', 'Error']
    const riskLevels = ['Low', 'Medium', 'High', 'Critical']
    
    return {
      location: locations[hash % locations.length],
      status: statuses[hash % statuses.length],
      connections: (hash % 30) + 5,
      efficiency: 70 + (hash % 25),
      riskLevel: riskLevels[hash % riskLevels.length],
      lastUpdate: `${(hash % 24) + 1} hours ago`,
      capacity: 60 + (hash % 35),
      throughput: ((hash % 10000) + 1000),
      cost: `$${((hash % 20000) + 5000).toLocaleString()}/month`
    }
  }

  const nodeDetails = getNodeDetails(node, nodeIdHash)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content node-inspector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="node-indicator" style={{ backgroundColor: getNodeColor(node.category || 'default') }}></div>
            <h2>{node.label || node.id}</h2>
            <span className="node-category">{node.category || 'Unknown'}</span>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-item">
              <MapPin size={16} className="metric-icon" />
              <div className="metric-info">
                <span className="metric-label">Location</span>
                <span className="metric-value">{nodeDetails.location}</span>
              </div>
            </div>
            <div className="metric-item">
              <Activity size={16} className="metric-icon" />
              <div className="metric-info">
                <span className="metric-label">Status</span>
                <span className={`metric-value ${nodeDetails.status === 'Active' ? 'status-active' : nodeDetails.status === 'Error' ? 'status-error' : 'status-idle'}`}>{nodeDetails.status}</span>
              </div>
            </div>
            <div className="metric-item">
              <Link2 size={16} className="metric-icon" />
              <div className="metric-info">
                <span className="metric-label">Connections</span>
                <span className="metric-value">{nodeDetails.connections}</span>
              </div>
            </div>
            <div className="metric-item">
              <TrendingUp size={16} className="metric-icon" />
              <div className="metric-info">
                <span className="metric-label">Efficiency</span>
                <span className="metric-value">{nodeDetails.efficiency}%</span>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="section">
            <h3>Risk Assessment</h3>
            <div className="risk-indicator">
              <AlertTriangle size={16} className="risk-icon" />
              <div className="risk-info">
                <span className="risk-level">{nodeDetails.riskLevel}</span>
                <span className="risk-score">Score: {(nodeIdHash % 10) / 10}/10</span>
              </div>
              <div className="risk-bar">
                <div className="risk-fill" style={{ width: `${(nodeIdHash % 10) * 10}%` }}></div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="section">
            <h3>Performance Metrics</h3>
            <div className="performance-metrics">
              <div className="performance-item">
                <span className="perf-label">Capacity Utilization</span>
                <div className="perf-bar">
                  <div className="perf-fill" style={{ width: `${nodeDetails.capacity}%` }}></div>
                </div>
                <span className="perf-value">{nodeDetails.capacity}%</span>
              </div>
              <div className="performance-item">
                <span className="perf-label">Daily Throughput</span>
                <span className="perf-value">{nodeDetails.throughput.toLocaleString()} units</span>
              </div>
              <div className="performance-item">
                <span className="perf-label">Operating Cost</span>
                <span className="perf-value">{nodeDetails.cost}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="section">
            <h3>Activity Timeline</h3>
            <div className="timeline">
              <div className="timeline-item">
                <Calendar size={14} className="timeline-icon" />
                <span className="timeline-time">{nodeDetails.lastUpdate}</span>
                <span className="timeline-event">Last status update</span>
              </div>
              <div className="timeline-item">
                <Calendar size={14} className="timeline-icon" />
                <span className="timeline-time">{(nodeIdHash % 12) + 1} hours ago</span>
                <span className="timeline-event">Throughput peak recorded</span>
              </div>
              <div className="timeline-item">
                <Calendar size={14} className="timeline-icon" />
                <span className="timeline-time">{(nodeIdHash % 3) + 1} day(s) ago</span>
                <span className="timeline-event">Maintenance completed</span>
              </div>
            </div>
          </div>

          {/* Connected Nodes */}
          <div className="section">
            <h3>Connected Nodes</h3>
            <div className="connected-nodes">
              {Array.from({ length: Math.min(4, nodeDetails.connections) }, (_, i) => {
                const connectedNodeId = `node_${(nodeIdHash + i + 1) % 100}`
                const strengths = ['Strong', 'Medium', 'Weak']
                return (
                  <div key={i} className="connected-node">
                    <div className="node-dot"></div>
                    <span>{connectedNodeId}</span>
                    <span className="connection-strength">{strengths[nodeIdHash % strengths.length]}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="action-button secondary" onClick={onClose}>
            Close
          </button>
          <button className="action-button primary">
            View Full Analysis
          </button>
        </div>
      </div>
    </div>
  )
}

function getNodeColor(category: string): string {
  const colors: Record<string, string> = {
    'Manufacturing': '#ff6b6b',
    'Logistics': '#4ecdc4',
    'Raw Materials': '#ffe66d',
    'Technology': '#95e1d3',
    'Services': '#dda0dd',
    'default': '#00d4ff'
  }
  return colors[category] || colors.default
}

export default NodeInspectorModal

import React, { useState } from 'react'
import { Waves, Zap, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

interface CascadeEvent {
  id: number
  type: 'disruption' | 'recovery' | 'warning' | 'info'
  message: string
  timestamp: string
  impact: number
  affectedNodes: string[]
}

const CascadePathViewer: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false)
  const [cascadeEvents] = useState<CascadeEvent[]>([
    {
      id: 1,
      type: 'disruption',
      message: 'Port congestion at Shanghai',
      timestamp: '10:30 AM',
      impact: 85,
      affectedNodes: ['SH_PORT', 'CN_MFG_01', 'CN_MFG_02']
    },
    {
      id: 2,
      type: 'warning',
      message: 'Raw material shortage warning',
      timestamp: '10:45 AM',
      impact: 45,
      affectedNodes: ['RAW_MAT_01', 'RAW_MAT_02']
    },
    {
      id: 3,
      type: 'recovery',
      message: 'Alternative route activated',
      timestamp: '11:00 AM',
      impact: 30,
      affectedNodes: ['ALT_ROUTE_01']
    },
    {
      id: 4,
      type: 'info',
      message: 'Inventory buffer utilized',
      timestamp: '11:15 AM',
      impact: 20,
      affectedNodes: ['INV_BUFFER_01']
    }
  ])

  const [selectedEvent, setSelectedEvent] = useState<CascadeEvent | null>(null)

  const getEventIcon = (type: CascadeEvent['type']) => {
    switch (type) {
      case 'disruption':
        return <XCircle size={16} className="event-icon disruption" />
      case 'recovery':
        return <CheckCircle size={16} className="event-icon recovery" />
      case 'warning':
        return <AlertCircle size={16} className="event-icon warning" />
      case 'info':
        return <Zap size={16} className="event-icon info" />
    }
  }

  const getImpactColor = (impact: number) => {
    if (impact >= 70) return '#f56565'
    if (impact >= 40) return '#ecc94b'
    return '#48bb78'
  }

  return (
    <div className={`cascade-path-viewer ${isMinimized ? 'minimized' : ''}`}>
      <div className="cascade-header" onClick={() => setIsMinimized(!isMinimized)}>
        <Waves size={20} className="cascade-icon" />
        <h3>Cascade Path Analysis</h3>
        <div className="cascade-stats">
          <span className="stat-badge active">{cascadeEvents.filter(e => e.type === 'disruption').length} Active</span>
          <span className="stat-badge resolved">{cascadeEvents.filter(e => e.type === 'recovery').length} Resolved</span>
        </div>
      </div>

      {!isMinimized && (
        <div className="cascade-content">
          <div className="cascade-timeline">
            {cascadeEvents.map((event) => (
              <div 
                key={event.id}
                className={`cascade-event ${selectedEvent?.id === event.id ? 'selected' : ''}`}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="event-marker">
                  <div className="event-line"></div>
                  <div className="event-dot" style={{ backgroundColor: getImpactColor(event.impact) }}></div>
                </div>
                <div className="event-details">
                  <div className="event-header">
                    {getEventIcon(event.type)}
                    <span className="event-type">{event.type}</span>
                    <span className="event-time">{event.timestamp}</span>
                  </div>
                  <div className="event-message">{event.message}</div>
                  <div className="event-impact">
                    <div className="impact-bar">
                      <div 
                        className="impact-fill" 
                        style={{ 
                          width: `${event.impact}%`,
                          backgroundColor: getImpactColor(event.impact)
                        }}
                      ></div>
                    </div>
                    <span className="impact-label">{event.impact}% impact</span>
                  </div>
                  <div className="affected-nodes">
                    <span className="nodes-label">Affected:</span>
                    {event.affectedNodes.map(node => (
                      <span key={node} className="node-tag">{node}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedEvent && (
            <div className="cascade-details">
              <h4>Event Details</h4>
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{selectedEvent.type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Impact Level:</span>
                <span 
                  className="detail-value"
                  style={{ color: getImpactColor(selectedEvent.impact) }}
                >
                  {selectedEvent.impact}%
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Affected Nodes:</span>
                <div className="detail-nodes">
                  {selectedEvent.affectedNodes.map(node => (
                    <span key={node} className="detail-node">{node}</span>
                  ))}
                </div>
              </div>
              <div className="detail-row">
                <span className="detail-label">Timestamp:</span>
                <span className="detail-value">{selectedEvent.timestamp}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CascadePathViewer

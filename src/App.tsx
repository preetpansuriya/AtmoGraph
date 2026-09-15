import { useState, useEffect } from 'react'
import Header from './components/Header'
import NavigationDrawer from './components/NavigationDrawer'
import NetworkGraph from './components/NetworkGraph'
import SmartIntelligencePanel from './components/SmartIntelligencePanel'
import TimelineSlider from './components/TimelineSlider'
import CascadePathViewer from './components/CascadePathViewer'
import NewsIngestionBar from './components/NewsIngestionBar'
import ExecutiveAnalyticsWorkbench from './components/ExecutiveAnalyticsWorkbench'
import NodeInspectorModal from './components/NodeInspectorModal'
import GnnMetricsModal from './components/GnnMetricsModal'
import CypherConsole from './components/CypherConsole'
import ErrorBoundary from './components/ErrorBoundary'
import { GraphData, Node } from './types/graph'
import { loadCSVData } from './utils/csvLoader'
import { convertCSVToGraphData } from './data/csvDataConverter'

function App() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] })
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false)
  const [isGnnModalOpen, setIsGnnModalOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [timelineData, setTimelineData] = useState<GraphData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load training data with fallback
      let trainCSV
      try {
        trainCSV = await loadCSVData('/GMRID_v3-train.csv')
      } catch (csvError) {
        console.warn('Failed to load CSV, using sample data:', csvError)
        trainCSV = [] // Will trigger sample data creation
      }
      
      const graphData = convertCSVToGraphData(trainCSV)
      
      setGraphData(graphData)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      setError(errorMessage)
      console.error('Error loading data:', err)
      
      // Fallback to sample data on error
      try {
        const sampleData = convertCSVToGraphData([])
        setGraphData(sampleData)
        setError(null) // Clear error since we have fallback data
      } catch (fallbackError) {
        console.error('Fallback data creation failed:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node)
    setIsNodeModalOpen(true)
  }

  const handleTimelineChange = (time: number) => {
    setCurrentTime(time)
    if (timelineData[time]) {
      setGraphData(timelineData[time])
    }
  }

  // Add actual timeline data with node variations
  useEffect(() => {
    if (graphData.nodes.length > 0) {
      const enhancedTimelineData = Array.from({ length: 10 }, (timeIndex) => ({
        nodes: graphData.nodes.map(node => ({
          ...node,
          value: (node.value || 10) * (0.7 + (timeIndex * 0.1) + Math.random() * 0.2),
          // Add some property changes over time
          x: node.x ? node.x + (Math.random() - 0.5) * 50 : Math.random() * 800,
          y: node.y ? node.y + (Math.random() - 0.5) * 50 : Math.random() * 600
        })),
        edges: graphData.edges
      }))
      setTimelineData(enhancedTimelineData)
    }
  }, [graphData])

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Data</h2>
        <p>{error}</p>
        <button onClick={loadData}>Retry</button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading supply chain data...</p>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <Header />
        <div className="main-content">
          <NavigationDrawer />
          <div className="center-panel">
            <NewsIngestionBar />
            <TimelineSlider 
              currentTime={currentTime}
              totalTime={timelineData.length}
              onTimeChange={handleTimelineChange}
            />
            <NetworkGraph 
              data={graphData}
              onNodeClick={handleNodeClick}
            />
            <CascadePathViewer />
          </div>
          <SmartIntelligencePanel 
            onOpenGnnMetrics={() => setIsGnnModalOpen(true)}
          />
        </div>
        <ExecutiveAnalyticsWorkbench />
        <CypherConsole />
        
        {isNodeModalOpen && selectedNode && (
          <NodeInspectorModal
            node={selectedNode}
            onClose={() => setIsNodeModalOpen(false)}
          />
        )}
        
        {isGnnModalOpen && (
          <GnnMetricsModal
            onClose={() => setIsGnnModalOpen(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App

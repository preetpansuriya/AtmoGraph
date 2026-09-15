export interface Node {
  id: string
  label?: string
  category?: string
  value?: number
  x?: number
  y?: number
  [key: string]: any
}

export interface Edge {
  id: string
  source: string
  target: string
  weight?: number
  label?: string
  [key: string]: any
}

export interface GraphData {
  nodes: Node[]
  edges: Edge[]
}

export interface GraphFilters {
  region?: string[]
  category?: string[]
  riskLevel?: string[]
  timeRange?: string
}

export interface GraphMetrics {
  totalNodes: number
  totalEdges: number
  averageDegree: number
  density: number
  connectedComponents: number
}

export interface TimelineData {
  timestamp: number
  graphData: GraphData
  metrics: GraphMetrics
}

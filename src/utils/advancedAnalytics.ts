import { GraphData, Node, GraphMetrics } from '../types/graph'

export interface NetworkAnalysis {
  centrality: Map<string, number>
  communities: Map<string, string>
  shortestPaths: Map<string, number>
  clusteringCoefficient: number
}

export interface RiskAssessment {
  nodeId: string
  riskScore: number
  riskFactors: string[]
  recommendations: string[]
}

export interface AnomalyDetection {
  nodeId: string
  anomalyType: string
  severity: 'low' | 'medium' | 'high'
  confidence: number
  timestamp: Date
}

export class AdvancedAnalytics {
  public static calculateGraphMetrics(graphData: GraphData): GraphMetrics {
    const totalNodes = graphData.nodes.length
    const totalEdges = graphData.edges.length

    // Calculate average degree
    const degreeMap = new Map<string, number>()
    graphData.nodes.forEach(node => {
      degreeMap.set(node.id, 0)
    })

    graphData.edges.forEach(edge => {
      degreeMap.set(edge.source, (degreeMap.get(edge.source) || 0) + 1)
      degreeMap.set(edge.target, (degreeMap.get(edge.target) || 0) + 1)
    })

    const totalDegree = Array.from(degreeMap.values()).reduce((sum, degree) => sum + degree, 0)
    const averageDegree = totalNodes > 0 ? totalDegree / totalNodes : 0

    // Calculate density
    const maxPossibleEdges = (totalNodes * (totalNodes - 1)) / 2
    const density = maxPossibleEdges > 0 ? totalEdges / maxPossibleEdges : 0

    // Calculate connected components (simplified)
    const connectedComponents = this.countConnectedComponents(graphData)

    return {
      totalNodes,
      totalEdges,
      averageDegree,
      density,
      connectedComponents
    }
  }

  public static analyzeNetwork(graphData: GraphData): NetworkAnalysis {
    const centrality = this.calculateBetweennessCentrality(graphData)
    const communities = this.detectCommunities(graphData)
    const shortestPaths = this.calculateAllShortestPaths(graphData)
    const clusteringCoefficient = this.calculateGlobalClusteringCoefficient(graphData)

    return {
      centrality,
      communities,
      shortestPaths,
      clusteringCoefficient
    }
  }

  public static assessRisks(graphData: GraphData): RiskAssessment[] {
    const riskAssessments: RiskAssessment[] = []

    graphData.nodes.forEach(node => {
      const riskScore = this.calculateNodeRiskScore(node, graphData)
      const riskFactors = this.identifyRiskFactors(node, graphData)
      const recommendations = this.generateRecommendations(riskScore, riskFactors)

      riskAssessments.push({
        nodeId: node.id,
        riskScore,
        riskFactors,
        recommendations
      })
    })

    return riskAssessments.sort((a, b) => b.riskScore - a.riskScore)
  }

  public static detectAnomalies(graphData: GraphData, baseline?: GraphData): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = []
    const metrics = this.calculateGraphMetrics(graphData)

    // Compare with baseline if provided
    if (baseline) {
      const baselineMetrics = this.calculateGraphMetrics(baseline)
      
      // Detect significant changes
      const nodeChange = Math.abs(metrics.totalNodes - baselineMetrics.totalNodes)
      const edgeChange = Math.abs(metrics.totalEdges - baselineMetrics.totalEdges)

      if (nodeChange > metrics.totalNodes * 0.1) {
        anomalies.push({
          nodeId: 'graph',
          anomalyType: 'node_count_change',
          severity: nodeChange > metrics.totalNodes * 0.2 ? 'high' : 'medium',
          confidence: 0.8,
          timestamp: new Date()
        })
      }

      if (edgeChange > metrics.totalEdges * 0.1) {
        anomalies.push({
          nodeId: 'graph',
          anomalyType: 'edge_count_change',
          severity: edgeChange > metrics.totalEdges * 0.2 ? 'high' : 'medium',
          confidence: 0.8,
          timestamp: new Date()
        })
      }
    }

    // Detect node-level anomalies
    graphData.nodes.forEach(node => {
      const nodeDegree = this.getNodeDegree(node.id, graphData)
      const avgDegree = metrics.averageDegree

      if (nodeDegree > avgDegree * 3) {
        anomalies.push({
          nodeId: node.id,
          anomalyType: 'high_degree',
          severity: 'medium',
          confidence: 0.7,
          timestamp: new Date()
        })
      }
    })

    return anomalies
  }

  public static calculateSupplyChainEfficiency(graphData: GraphData): {
    overallEfficiency: number
    bottleneckNodes: string[]
    criticalPaths: string[][]
  } {
    const centrality = this.calculateBetweennessCentrality(graphData)
    const sortedNodes = Array.from(centrality.entries())
      .sort((a, b) => b[1] - a[1])

    // Identify bottleneck nodes (high betweenness centrality)
    const bottleneckNodes = sortedNodes
      .filter(([_, centrality]) => centrality > 0.7)
      .map(([nodeId]) => nodeId)

    // Calculate overall efficiency (inverse of average path length)
    const shortestPaths = this.calculateAllShortestPaths(graphData)
    const avgPathLength = Array.from(shortestPaths.values())
      .reduce((sum, length) => sum + length, 0) / shortestPaths.size
    
    const overallEfficiency = avgPathLength > 0 ? 1 / avgPathLength : 0

    // Identify critical paths (simplified)
    const criticalPaths = this.identifyCriticalPaths(graphData, bottleneckNodes)

    return {
      overallEfficiency,
      bottleneckNodes,
      criticalPaths
    }
  }

  private static calculateBetweennessCentrality(graphData: GraphData): Map<string, number> {
    const centrality = new Map<string, number>()
    
    // Initialize all nodes with 0 centrality
    graphData.nodes.forEach(node => {
      centrality.set(node.id, 0)
    })

    // Simplified betweenness centrality calculation
    graphData.nodes.forEach(source => {
      graphData.nodes.forEach(target => {
        if (source.id !== target.id) {
          const path = this.findShortestPath(source.id, target.id, graphData)
          if (path.length > 0) {
            // Increment centrality for intermediate nodes
            path.slice(1, -1).forEach(nodeId => {
              centrality.set(nodeId, (centrality.get(nodeId) || 0) + 1)
            })
          }
        }
      })
    })

    // Normalize
    const maxCentrality = Math.max(...Array.from(centrality.values()))
    if (maxCentrality > 0) {
      centrality.forEach((value, key) => {
        centrality.set(key, value / maxCentrality)
      })
    }

    return centrality
  }

  private static detectCommunities(graphData: GraphData): Map<string, string> {
    const communities = new Map<string, string>()
    
    // Simplified community detection using connected components
    const visited = new Set<string>()
    let communityId = 0

    graphData.nodes.forEach(node => {
      if (!visited.has(node.id)) {
        const component = this.getConnectedComponent(node.id, graphData)
        component.forEach(nodeId => {
          communities.set(nodeId, `community_${communityId}`)
          visited.add(nodeId)
        })
        communityId++
      }
    })

    return communities
  }

  private static calculateAllShortestPaths(graphData: GraphData): Map<string, number> {
    const shortestPaths = new Map<string, number>()

    graphData.nodes.forEach(source => {
      graphData.nodes.forEach(target => {
        if (source.id !== target.id) {
          const path = this.findShortestPath(source.id, target.id, graphData)
          const key = `${source.id}-${target.id}`
          shortestPaths.set(key, path.length)
        }
      })
    })

    return shortestPaths
  }

  private static calculateGlobalClusteringCoefficient(graphData: GraphData): number {
    let totalClustering = 0
    let nodeCount = 0

    graphData.nodes.forEach(node => {
      const neighbors = this.getNodeNeighbors(node.id, graphData)
      if (neighbors.length >= 2) {
        const triangles = this.countTriangles(node.id, neighbors, graphData)
        const possibleTriangles = (neighbors.length * (neighbors.length - 1)) / 2
        totalClustering += possibleTriangles > 0 ? triangles / possibleTriangles : 0
        nodeCount++
      }
    })

    return nodeCount > 0 ? totalClustering / nodeCount : 0
  }

  private static countConnectedComponents(graphData: GraphData): number {
    const visited = new Set<string>()
    let components = 0

    graphData.nodes.forEach(node => {
      if (!visited.has(node.id)) {
        const component = this.getConnectedComponent(node.id, graphData)
        component.forEach(nodeId => visited.add(nodeId))
        components++
      }
    })

    return components
  }

  private static findShortestPath(source: string, target: string, graphData: GraphData): string[] {
    // BFS for shortest path
    const queue: string[][] = [[source]]
    const visited = new Set<string>([source])

    while (queue.length > 0) {
      const path = queue.shift()!
      const current = path[path.length - 1]

      if (current === target) {
        return path
      }

      const neighbors = this.getNodeNeighbors(current, graphData)
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push([...path, neighbor])
        }
      }
    }

    return []
  }

  private static getNodeNeighbors(nodeId: string, graphData: GraphData): string[] {
    const neighbors: string[] = []

    graphData.edges.forEach(edge => {
      if (edge.source === nodeId) {
        neighbors.push(edge.target)
      } else if (edge.target === nodeId) {
        neighbors.push(edge.source)
      }
    })

    return neighbors
  }

  private static getNodeDegree(nodeId: string, graphData: GraphData): number {
    return this.getNodeNeighbors(nodeId, graphData).length
  }

  private static getConnectedComponent(nodeId: string, graphData: GraphData): string[] {
    const component: string[] = []
    const queue: string[] = [nodeId]
    const visited = new Set<string>([nodeId])

    while (queue.length > 0) {
      const current = queue.shift()!
      component.push(current)

      const neighbors = this.getNodeNeighbors(current, graphData)
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push(neighbor)
        }
      }
    }

    return component
  }

  private static countTriangles(_nodeId: string, neighbors: string[], graphData: GraphData): number {
    let triangles = 0

    for (let i = 0; i < neighbors.length; i++) {
      for (let j = i + 1; j < neighbors.length; j++) {
        if (this.areConnected(neighbors[i], neighbors[j], graphData)) {
          triangles++
        }
      }
    }

    return triangles
  }

  private static areConnected(node1: string, node2: string, graphData: GraphData): boolean {
    return graphData.edges.some(edge => 
      (edge.source === node1 && edge.target === node2) ||
      (edge.source === node2 && edge.target === node1)
    )
  }

  private static calculateNodeRiskScore(node: Node, graphData: GraphData): number {
    const degree = this.getNodeDegree(node.id, graphData)
    const metrics = this.calculateGraphMetrics(graphData)
    
    // Higher degree nodes have higher risk
    const degreeRisk = degree / metrics.totalNodes
    
    // Random factors for simulation
    const randomRisk = Math.random() * 0.3
    
    return Math.min(1, degreeRisk * 0.7 + randomRisk)
  }

  private static identifyRiskFactors(node: Node, graphData: GraphData): string[] {
    const factors: string[] = []
    const degree = this.getNodeDegree(node.id, graphData)

    if (degree > 5) {
      factors.push('High connectivity')
    }
    if (node.category === 'Raw Materials') {
      factors.push('Critical supplier dependency')
    }
    if (Math.random() > 0.7) {
      factors.push('Geographic risk factor')
    }

    return factors
  }

  private static generateRecommendations(riskScore: number, riskFactors: string[]): string[] {
    const recommendations: string[] = []

    if (riskScore > 0.7) {
      recommendations.push('Implement backup suppliers')
      recommendations.push('Increase inventory buffer')
    }

    if (riskFactors.includes('High connectivity')) {
      recommendations.push('Monitor node performance closely')
    }

    if (riskScore > 0.5) {
      recommendations.push('Develop contingency plans')
    }

    return recommendations
  }

  private static identifyCriticalPaths(graphData: GraphData, bottleneckNodes: string[]): string[][] {
    const criticalPaths: string[][] = []

    // Generate some sample critical paths through bottleneck nodes
    bottleneckNodes.forEach(bottleneck => {
      const neighbors = this.getNodeNeighbors(bottleneck, graphData)
      if (neighbors.length >= 2) {
        criticalPaths.push([neighbors[0], bottleneck, neighbors[1]])
      }
    })

    return criticalPaths.slice(0, 5) // Limit to 5 paths
  }
}

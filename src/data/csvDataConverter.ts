import { GraphData, Node, Edge } from '../types/graph'

export function convertCSVToGraphData(csvData: any[]): GraphData {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const nodeMap = new Map<string, Node>()
  const edgeSet = new Set<string>()
  
  const categories = ['Manufacturing', 'Logistics', 'Raw Materials', 'Technology', 'Services']

  // Limit data processing for performance
  const maxRows = Math.min(csvData.length, 1000)
  const limitedData = csvData.slice(0, maxRows)

  // Process CSV data to create nodes and edges
  limitedData.forEach((row, index) => {
    // Create source node
    const sourceId = row.source_id || `node_${index}`
    if (!nodeMap.has(sourceId)) {
      // Assign category if not present, using round-robin for variety
      const sourceCategory = row.source_category || categories[index % categories.length]
      const sourceNode: Node = {
        id: sourceId,
        label: row.source_label || `${sourceCategory} ${index}`,
        category: sourceCategory,
        value: row.source_value || Math.random() * 20 + 5,
        x: Math.random() * 800,
        y: Math.random() * 600
      }
      nodeMap.set(sourceId, sourceNode)
      nodes.push(sourceNode)
    }

    // Create target node
    const targetId = row.target_id || `node_${index + 1}`
    if (!nodeMap.has(targetId)) {
      // Assign category if not present
      const targetCategory = row.target_category || categories[(index + 1) % categories.length]
      const targetNode: Node = {
        id: targetId,
        label: row.target_label || `${targetCategory} ${index + 1}`,
        category: targetCategory,
        value: row.target_value || Math.random() * 20 + 5,
        x: Math.random() * 800,
        y: Math.random() * 600
      }
      nodeMap.set(targetId, targetNode)
      nodes.push(targetNode)
    }

    // Create edge
    const edgeId = `${sourceId}-${targetId}`
    if (!edgeSet.has(edgeId)) {
      const edge: Edge = {
        id: edgeId,
        source: sourceId,
        target: targetId,
        weight: row.weight || Math.random() * 5 + 1,
        label: row.edge_label || 'connection'
      }
      edgeSet.add(edgeId)
      edges.push(edge)
    }
  })

  // If no data, create sample graph
  if (nodes.length === 0) {
    return createSampleGraph()
  }

  return { nodes, edges }
}

function createSampleGraph(): GraphData {
  const categories = ['Manufacturing', 'Logistics', 'Raw Materials', 'Technology', 'Services']
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Create 15 sample nodes (reduced for better performance)
  for (let i = 0; i < 15; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]
    nodes.push({
      id: `node_${i}`,
      label: `${category} ${i + 1}`,
      category: category,
      value: Math.random() * 20 + 5,
      x: Math.random() * 800,
      y: Math.random() * 600
    })
  }

  // Create random edges (reduced for better performance)
  for (let i = 0; i < 20; i++) {
    const sourceIndex = Math.floor(Math.random() * nodes.length)
    const targetIndex = Math.floor(Math.random() * nodes.length)
    
    if (sourceIndex !== targetIndex) {
      const source = nodes[sourceIndex].id
      const target = nodes[targetIndex].id
      const edgeId = `${source}-${target}`
      
      if (!edges.find(e => e.id === edgeId)) {
        edges.push({
          id: edgeId,
          source: source,
          target: target,
          weight: Math.random() * 5 + 1,
          label: `connection_${i}`
        })
      }
    }
  }

  return { nodes, edges }
}

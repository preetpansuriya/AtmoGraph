import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { GraphData, Node, Edge } from '../types/graph'

interface NetworkGraphProps {
  data: GraphData
  onNodeClick: (node: Node) => void
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ data, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current?.parentElement) {
        setDimensions({
          width: svgRef.current.parentElement.clientWidth,
          height: svgRef.current.parentElement.clientHeight
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Memoize the simulation to prevent unnecessary recreations
  const simulationRef = useRef<d3.Simulation<any, undefined> | null>(null)

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove()
    
    // Stop previous simulation if exists
    if (simulationRef.current) {
      simulationRef.current.stop()
    }

    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom as any)

    // Create main group
    const g = svg.append('g')

    // Create simulation
    const simulation = d3.forceSimulation(data.nodes as any)
    simulationRef.current = simulation
      .force('link', d3.forceLink(data.edges as any)
        .id((d: any) => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide().radius(30))

    // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(data.edges)
      .enter()
      .append('line')
      .attr('stroke', '#2d3748')
      .attr('stroke-width', (d: Edge) => Math.sqrt(d.weight || 1) * 2)
      .attr('stroke-opacity', 0.6)

    // Create nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('r', (d: Node) => Math.sqrt(d.value || 10) * 5)
      .attr('fill', (d: Node) => {
        const color = getNodeColor(d.category || 'default')
        console.log(`Node ${d.id} category: ${d.category}, color: ${color}`)
        return color
      })
      .attr('stroke', (d: Node) => getNodeColor(d.category || 'default'))
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .style('filter', (d: Node) => `drop-shadow(0 0 8px ${getNodeColor(d.category || 'default')}40)`)
      .on('click', (event: any, d: Node) => {
        event.stopPropagation()
        onNodeClick(d)
      })
      .call(d3.drag<SVGCircleElement, Node>()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded) as any)

    // Add labels
    const labels = g.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(data.nodes)
      .enter()
      .append('text')
      .text((d: Node) => d.label || d.id)
      .attr('font-size', '12px')
      .attr('fill', '#ffffff')
      .attr('text-anchor', 'middle')
      .attr('dy', -20)
      .style('pointer-events', 'none')
      .style('text-shadow', '0 0 4px rgba(0, 0, 0, 0.8)')

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y)

      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y)
    })

    // Drag functions
    function dragStarted(event: any, d: Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event: any, d: Node) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragEnded(event: any, d: Node) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    // Color function
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

    // Cleanup function
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
    }
  }, [data, dimensions, onNodeClick])

  return (
    <div className="network-graph-container">
      <svg ref={svgRef} className="network-graph"></svg>
    </div>
  )
}

export default NetworkGraph

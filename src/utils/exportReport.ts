import { GraphData, Node, Edge } from '../types/graph'

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf'
  includeMetadata: boolean
  includeTimestamp: boolean
}

export class ReportExporter {
  public static exportToCSV(graphData: GraphData, filename: string = 'graph_data.csv'): void {
    const csvContent = this.generateCSVContent(graphData)
    this.downloadFile(csvContent, filename, 'text/csv')
  }

  public static exportToJSON(graphData: GraphData, filename: string = 'graph_data.json'): void {
    const jsonContent = JSON.stringify(graphData, null, 2)
    this.downloadFile(jsonContent, filename, 'application/json')
  }

  public static exportNodesToCSV(nodes: Node[], filename: string = 'nodes.csv'): void {
    const headers = ['id', 'label', 'category', 'value', 'x', 'y']
    const rows = nodes.map(node => 
      headers.map(header => String(node[header] || '')).join(',')
    )
    
    const csvContent = [headers.join(','), ...rows].join('\n')
    this.downloadFile(csvContent, filename, 'text/csv')
  }

  public static exportEdgesToCSV(edges: Edge[], filename: string = 'edges.csv'): void {
    const headers = ['id', 'source', 'target', 'weight', 'label']
    const rows = edges.map(edge => 
      headers.map(header => String(edge[header] || '')).join(',')
    )
    
    const csvContent = [headers.join(','), ...rows].join('\n')
    this.downloadFile(csvContent, filename, 'text/csv')
  }

  public static exportAnalyticsReport(
    metrics: any,
    predictions: any[],
    filename: string = 'analytics_report.json'
  ): void {
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      predictions,
      summary: this.generateSummary(metrics, predictions)
    }

    const jsonContent = JSON.stringify(report, null, 2)
    this.downloadFile(jsonContent, filename, 'application/json')
  }

  private static generateCSVContent(graphData: GraphData): string {
    // Export nodes
    const nodeHeaders = ['id', 'label', 'category', 'value', 'x', 'y']
    const nodeRows = graphData.nodes.map(node => 
      nodeHeaders.map(header => String(node[header] || '')).join(',')
    )

    // Export edges
    const edgeHeaders = ['id', 'source', 'target', 'weight', 'label']
    const edgeRows = graphData.edges.map(edge => 
      edgeHeaders.map(header => String(edge[header] || '')).join(',')
    )

    const nodesCSV = ['NODES', nodeHeaders.join(','), ...nodeRows].join('\n')
    const edgesCSV = ['\nEDGES', edgeHeaders.join(','), ...edgeRows].join('\n')

    return nodesCSV + edgesCSV
  }

  private static generateSummary(metrics: any, predictions: any[]): string {
    const totalNodes = metrics.totalNodes || 0
    const totalEdges = metrics.totalEdges || 0
    const avgAccuracy = predictions.length > 0 
      ? (predictions.reduce((sum: number, p: any) => sum + (p.confidence || 0), 0) / predictions.length).toFixed(2)
      : '0.00'

    return `Report contains ${totalNodes} nodes and ${totalEdges} edges. Average prediction accuracy: ${avgAccuracy}%`
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  public static async exportToPDF(data: any, filename: string = 'report.pdf'): Promise<void> {
    // This would typically use a library like jsPDF
    // For now, we'll create a simple text-based representation
    const textContent = this.generateTextReport(data)
    this.downloadFile(textContent, filename.replace('.pdf', '.txt'), 'text/plain')
  }

  private static generateTextReport(data: any): string {
    const timestamp = new Date().toISOString()
    let report = `SUPPLY CHAIN ANALYTICS REPORT\n`
    report += `Generated: ${timestamp}\n`
    report += `${'='.repeat(50)}\n\n`

    if (data.graphData) {
      report += `GRAPH STATISTICS\n`
      report += `-`.repeat(30) + `\n`
      report += `Total Nodes: ${data.graphData.nodes.length}\n`
      report += `Total Edges: ${data.graphData.edges.length}\n\n`
    }

    if (data.metrics) {
      report += `PERFORMANCE METRICS\n`
      report += `-`.repeat(30) + `\n`
      Object.entries(data.metrics).forEach(([key, value]) => {
        report += `${key}: ${value}\n`
      })
      report += `\n`
    }

    if (data.predictions && data.predictions.length > 0) {
      report += `PREDICTIONS\n`
      report += `-`.repeat(30) + `\n`
      data.predictions.slice(0, 10).forEach((pred: any, index: number) => {
        report += `${index + 1}. ${pred.nodeId}: ${pred.prediction} (${(pred.confidence * 100).toFixed(1)}%)\n`
      })
    }

    return report
  }
}

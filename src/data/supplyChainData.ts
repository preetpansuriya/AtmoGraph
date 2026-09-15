import { GraphData } from '../types/graph'

// Legacy supply chain data - this file is kept for backward compatibility
// New projects should use CSV data loading via csvDataConverter.ts

export const legacySupplyChainData: GraphData = {
  nodes: [
    { id: 'supplier_1', label: 'Raw Material Supplier A', category: 'Raw Materials', value: 15, x: 100, y: 200 },
    { id: 'supplier_2', label: 'Raw Material Supplier B', category: 'Raw Materials', value: 12, x: 150, y: 350 },
    { id: 'manufacturer_1', label: 'Manufacturing Plant 1', category: 'Manufacturing', value: 25, x: 300, y: 250 },
    { id: 'manufacturer_2', label: 'Manufacturing Plant 2', category: 'Manufacturing', value: 20, x: 350, y: 400 },
    { id: 'warehouse_1', label: 'Distribution Center 1', category: 'Logistics', value: 18, x: 500, y: 200 },
    { id: 'warehouse_2', label: 'Distribution Center 2', category: 'Logistics', value: 16, x: 550, y: 350 },
    { id: 'retailer_1', label: 'Retail Store 1', category: 'Services', value: 10, x: 700, y: 150 },
    { id: 'retailer_2', label: 'Retail Store 2', category: 'Services', value: 12, x: 750, y: 300 },
    { id: 'retailer_3', label: 'Retail Store 3', category: 'Services', value: 8, x: 700, y: 450 },
    { id: 'tech_provider', label: 'Technology Provider', category: 'Technology', value: 14, x: 400, y: 100 }
  ],
  edges: [
    { id: 'edge_1', source: 'supplier_1', target: 'manufacturer_1', weight: 3, label: 'steel' },
    { id: 'edge_2', source: 'supplier_2', target: 'manufacturer_1', weight: 2, label: 'plastic' },
    { id: 'edge_3', source: 'supplier_1', target: 'manufacturer_2', weight: 2, label: 'steel' },
    { id: 'edge_4', source: 'manufacturer_1', target: 'warehouse_1', weight: 4, label: 'finished_goods' },
    { id: 'edge_5', source: 'manufacturer_1', target: 'warehouse_2', weight: 3, label: 'finished_goods' },
    { id: 'edge_6', source: 'manufacturer_2', target: 'warehouse_1', weight: 2, label: 'finished_goods' },
    { id: 'edge_7', source: 'warehouse_1', target: 'retailer_1', weight: 2, label: 'distribution' },
    { id: 'edge_8', source: 'warehouse_1', target: 'retailer_2', weight: 3, label: 'distribution' },
    { id: 'edge_9', source: 'warehouse_2', target: 'retailer_2', weight: 2, label: 'distribution' },
    { id: 'edge_10', source: 'warehouse_2', target: 'retailer_3', weight: 2, label: 'distribution' },
    { id: 'edge_11', source: 'tech_provider', target: 'manufacturer_1', weight: 1, label: 'software' },
    { id: 'edge_12', source: 'tech_provider', target: 'manufacturer_2', weight: 1, label: 'software' }
  ]
}

export function getLegacySupplyChainData(): GraphData {
  return legacySupplyChainData
}

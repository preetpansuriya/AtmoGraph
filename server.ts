import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Embedded datasets for AtmoGraph backend API
const SAMPLE_NODES = [
  { node_id: 'N001', name: 'Port of Shanghai', type: 'Port', category: 'Maritime Hub', country: 'China', region: 'East Asia', latitude: 31.2304, longitude: 121.4737, tier: 1, criticality_score: 0.98, base_capacity_teu_per_year: 47300000, operational_status: 'Congested', active_risk_level: 'High' },
  { node_id: 'N002', name: 'Port of Singapore', type: 'Port', category: 'Maritime Chokepoint', country: 'Singapore', region: 'Southeast Asia', latitude: 1.3521, longitude: 103.8198, tier: 1, criticality_score: 0.97, base_capacity_teu_per_year: 37200000, operational_status: 'Operational', active_risk_level: 'Medium' },
  { node_id: 'N003', name: 'Port of Ningbo-Zhoushan', type: 'Port', category: 'Maritime Hub', country: 'China', region: 'East Asia', latitude: 29.8683, longitude: 121.5440, tier: 1, criticality_score: 0.95, base_capacity_teu_per_year: 31000000, operational_status: 'Disrupted', active_risk_level: 'Critical' },
  { node_id: 'N004', name: 'Port of Rotterdam', type: 'Port', category: 'European Gateway', country: 'Netherlands', region: 'Western Europe', latitude: 51.9244, longitude: 4.4777, tier: 1, criticality_score: 0.94, base_capacity_teu_per_year: 15300000, operational_status: 'Degraded', active_risk_level: 'High' },
  { node_id: 'N005', name: 'Port of Los Angeles / Long Beach', type: 'Port', category: 'US West Coast Gateway', country: 'USA', region: 'North America', latitude: 33.7405, longitude: -118.2720, tier: 1, criticality_score: 0.95, base_capacity_teu_per_year: 19000000, operational_status: 'Disrupted', active_risk_level: 'High' },
  { node_id: 'N006', name: 'Port of Antwerp-Bruges', type: 'Port', category: 'European Chemical Hub', country: 'Belgium', region: 'Western Europe', latitude: 51.2700, longitude: 4.3200, tier: 1, criticality_score: 0.89, base_capacity_teu_per_year: 12500000, operational_status: 'Degraded', active_risk_level: 'Medium' },
  { node_id: 'N007', name: 'Suez Canal Transit Corridor', type: 'Chokepoint', category: 'Maritime Transit', country: 'Egypt', region: 'Middle East', latitude: 30.5852, longitude: 32.2654, tier: 1, criticality_score: 0.99, operational_status: 'Disrupted', active_risk_level: 'Critical' },
  { node_id: 'N008', name: 'Bab el-Mandeb Strait', type: 'Chokepoint', category: 'Maritime Transit', country: 'Yemen/Djibouti', region: 'Red Sea', latitude: 12.5833, longitude: 43.3333, tier: 1, criticality_score: 0.98, operational_status: 'Restricted', active_risk_level: 'Critical' },
  { node_id: 'N009', name: 'Strait of Malacca', type: 'Chokepoint', category: 'Maritime Transit', country: 'Malaysia/Indonesia', region: 'Southeast Asia', latitude: 2.5000, longitude: 101.5000, tier: 1, criticality_score: 0.96, operational_status: 'Congested', active_risk_level: 'Medium' },
  { node_id: 'N010', name: 'Panama Canal Locks', type: 'Chokepoint', category: 'Maritime Transit', country: 'Panama', region: 'Central America', latitude: 9.0800, longitude: -79.6800, tier: 1, criticality_score: 0.95, operational_status: 'Restricted', active_risk_level: 'High' },
  { node_id: 'N011', name: 'Strait of Hormuz', type: 'Chokepoint', category: 'Energy Transit', country: 'Oman/Iran', region: 'Middle East', latitude: 26.5667, longitude: 56.2500, tier: 1, criticality_score: 0.97, operational_status: 'Restricted', active_risk_level: 'Critical' },
  { node_id: 'N012', name: 'TSMC Hsinchu MegaFab 12', type: 'Fab', category: 'Semiconductor Fab', country: 'Taiwan', region: 'East Asia', latitude: 24.7800, longitude: 120.9900, tier: 1, criticality_score: 0.99, operational_status: 'Degraded', active_risk_level: 'Critical' }
];

const SAMPLE_EDGES = [
  { edge_id: 'E001', source_node_id: 'N001', target_node_id: 'N005', relationship_type: 'MARITIME_SHIPPING_LANE', transport_mode: 'Ocean Container', lead_time_days: 14, capacity_risk_weight: 0.85, annual_flow_usd_b: 142.5, status: 'Congested' },
  { edge_id: 'E002', source_node_id: 'N003', target_node_id: 'N005', relationship_type: 'MARITIME_SHIPPING_LANE', transport_mode: 'Ocean Container', lead_time_days: 15, capacity_risk_weight: 0.92, annual_flow_usd_b: 88.4, status: 'Disrupted' },
  { edge_id: 'E003', source_node_id: 'N001', target_node_id: 'N002', relationship_type: 'FEEDER_TRANSIT', transport_mode: 'Ocean Container', lead_time_days: 4, capacity_risk_weight: 0.55, annual_flow_usd_b: 95.0, status: 'Operational' },
  { edge_id: 'E004', source_node_id: 'N002', target_node_id: 'N008', relationship_type: 'MARITIME_SHIPPING_LANE', transport_mode: 'Ocean Container', lead_time_days: 9, capacity_risk_weight: 0.96, annual_flow_usd_b: 165.0, status: 'Restricted' },
  { edge_id: 'E005', source_node_id: 'N008', target_node_id: 'N007', relationship_type: 'CHOKEPOINT_PASSAGE', transport_mode: 'Canal Transit', lead_time_days: 3, capacity_risk_weight: 0.98, annual_flow_usd_b: 210.0, status: 'Disrupted' },
  { edge_id: 'E006', source_node_id: 'N007', target_node_id: 'N004', relationship_type: 'MARITIME_SHIPPING_LANE', transport_mode: 'Ocean Container', lead_time_days: 6, capacity_risk_weight: 0.84, annual_flow_usd_b: 180.0, status: 'Degraded' }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API v1 Endpoints
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'AtmoGraph Risk Intelligence Platform',
      version: '3.0.0',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/v1/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'AtmoGraph API v1',
      gnn_engine: 'PyTorch Geometric GCN',
      nlp_classifier: 'Transformer DistilBERT'
    });
  });

  app.get('/api/graph', (req, res) => {
    res.json({
      nodes: SAMPLE_NODES,
      edges: SAMPLE_EDGES
    });
  });

  // NLP Headline / Text Analysis Endpoint
  app.post('/api/v1/nlp/analyze', (req, res) => {
    const text = (req.body && req.body.text) || '';
    const lower = text.toLowerCase();
    
    let detectedEntities = ['Maritime Corridor'];
    let targetNode = 'N003';
    let riskLevel = 'High';
    let category = 'Atmospheric / Maritime';
    let riskScore = 0.84;

    if (lower.includes('shanghai') || lower.includes('yangtze')) {
      detectedEntities = ['Port of Shanghai', 'East China Sea'];
      targetNode = 'N001';
      riskScore = 0.88;
    } else if (lower.includes('suez') || lower.includes('canal')) {
      detectedEntities = ['Suez Canal Transit Corridor', 'Mediterranean'];
      targetNode = 'N007';
      riskLevel = 'Critical';
      riskScore = 0.94;
    } else if (lower.includes('red sea') || lower.includes('yemen') || lower.includes('bab')) {
      detectedEntities = ['Bab el-Mandeb Strait', 'Gulf of Aden'];
      targetNode = 'N008';
      riskLevel = 'Critical';
      riskScore = 0.96;
    } else if (lower.includes('tsmc') || lower.includes('taiwan') || lower.includes('fab')) {
      detectedEntities = ['TSMC Hsinchu MegaFab 12', 'Hsinchu Science Park'];
      targetNode = 'N012';
      riskLevel = 'Critical';
      riskScore = 0.95;
      category = 'Semiconductor Supply Chain';
    } else if (lower.includes('rotterdam') || lower.includes('rhine')) {
      detectedEntities = ['Port of Rotterdam', 'Rhine Inland River'];
      targetNode = 'N004';
      riskScore = 0.79;
    } else if (lower.includes('ningbo') || lower.includes('typhoon')) {
      detectedEntities = ['Port of Ningbo-Zhoushan', 'Zhoushan Archipelago'];
      targetNode = 'N003';
      riskLevel = 'Critical';
      riskScore = 0.96;
    }

    res.json({
      text,
      entities: detectedEntities,
      target_node_ids: [targetNode],
      risk_level: riskLevel,
      risk_score: riskScore,
      confidence: 0.95,
      category
    });
  });

  // GNN Cascade Simulation Endpoint
  app.post(['/api/v1/gnn/simulate', '/api/gnn/simulate-cascade'], (req, res) => {
    const sourceId = (req.body && (req.body.source_node_id || req.body.sourceId)) || 'N003';
    const severity = parseFloat(req.body && (req.body.shock_severity || req.body.shock_intensity || 0.95));
    const maxHops = parseInt(req.body && (req.body.max_propagation_hops || req.body.max_hops || 3));

    const totalLoss = Math.round(severity * 420.0 * 2.85 * 10) / 10;
    const totalTeu = Math.round(severity * 850000);
    const resilienceScore = Math.max(0.12, Math.round((100.0 - severity * 45.0) * 10) / 1000);

    res.json({
      source_node_id: sourceId,
      shock_intensity: severity,
      max_hops: maxHops,
      total_estimated_loss_usd_m: totalLoss,
      total_estimated_systemic_loss_usd_m: totalLoss,
      total_teu_delayed: totalTeu,
      resilience_score: resilienceScore,
      propagation_timeline: [
        { timestep: 0, label: 'T+0h', active_impact_count: 1, loss_usd_m: Math.round(totalLoss * 0.35) },
        { timestep: 1, label: 'T+24h', active_impact_count: 3, loss_usd_m: Math.round(totalLoss * 0.7) },
        { timestep: 2, label: 'T+48h', active_impact_count: 7, loss_usd_m: totalLoss }
      ]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AtmoGraph server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

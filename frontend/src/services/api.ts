import {
  GraphNode,
  GraphEdge,
  AisVessel,
  AisPort,
  NlpNewsArticle,
  GnnSimulationState,
  RiskLevel
} from '../types/models';

export const initialNodes: GraphNode[] = [
  {
    id: 'NODE-TSMC-01',
    name: 'TSMC Fab 18 - GigaFab',
    code: 'TSMC-TW',
    type: 'semiconductor_fab',
    country: 'Taiwan',
    region: 'East Asia',
    coordinates: [18, 12, -8],
    geo: { lat: 23.1, lng: 120.3 },
    tier: 1,
    baselineRisk: 34,
    currentRisk: 68,
    riskLevel: 'high',
    gnnEmbeddings: [0.88, 0.42, 0.91, 0.15, 0.77],
    attentionScore: 0.94,
    inventoryBufferDays: 14,
    singleSourceVulnerability: true,
    activeDisruptions: ['Typhoon Malakas Sea Warning', 'Strait Maritime Traffic Delay'],
    capacityUtilization: 96,
    financialExposureUsd: 1420,
    products: ['3nm/5nm Wafer Processing', 'AI Accelerator ASICs'],
    connectionsCount: 8,
  },
  {
    id: 'NODE-ASML-02',
    name: 'ASML Veldhoven Facility',
    code: 'ASML-NL',
    type: 'supplier_tier2',
    country: 'Netherlands',
    region: 'Western Europe',
    coordinates: [-22, 18, 6],
    geo: { lat: 51.4, lng: 5.4 },
    tier: 2,
    baselineRisk: 18,
    currentRisk: 32,
    riskLevel: 'low',
    gnnEmbeddings: [0.45, 0.89, 0.31, 0.62, 0.84],
    attentionScore: 0.78,
    inventoryBufferDays: 45,
    singleSourceVulnerability: true,
    activeDisruptions: [],
    capacityUtilization: 91,
    financialExposureUsd: 890,
    products: ['High-NA EUV Photolithography Systems', 'Precision Optics'],
    connectionsCount: 5,
  },
  {
    id: 'NODE-FOX-03',
    name: 'Foxconn Zhengzhou Complex',
    code: 'FOX-CN',
    type: 'manufacturing_hub',
    country: 'China',
    region: 'East Asia',
    coordinates: [14, 16, -14],
    geo: { lat: 34.7, lng: 113.6 },
    tier: 1,
    baselineRisk: 42,
    currentRisk: 74,
    riskLevel: 'high',
    gnnEmbeddings: [0.72, 0.63, 0.85, 0.28, 0.93],
    attentionScore: 0.88,
    inventoryBufferDays: 9,
    singleSourceVulnerability: false,
    activeDisruptions: ['Port of Ningbo Feeder Congestion', 'Labor Shift Re-allocation'],
    capacityUtilization: 88,
    financialExposureUsd: 2100,
    products: ['Sub-assembly Integration', 'Motherboard SMT', 'Finished Electronics'],
    connectionsCount: 11,
  },
  {
    id: 'NODE-SAMS-04',
    name: 'Samsung Electronics Pyeongtaek',
    code: 'SEC-KR',
    type: 'semiconductor_fab',
    country: 'South Korea',
    region: 'East Asia',
    coordinates: [22, 19, -4],
    geo: { lat: 37.0, lng: 127.1 },
    tier: 1,
    baselineRisk: 26,
    currentRisk: 48,
    riskLevel: 'medium',
    gnnEmbeddings: [0.65, 0.77, 0.54, 0.39, 0.61],
    attentionScore: 0.71,
    inventoryBufferDays: 21,
    singleSourceVulnerability: false,
    activeDisruptions: ['Nand Flash Component Lead Time Spike'],
    capacityUtilization: 94,
    financialExposureUsd: 1150,
    products: ['V-NAND Flash', 'DDR5 Memory Modules'],
    connectionsCount: 7,
  },
  {
    id: 'NODE-PORT-SGP-05',
    name: 'Port of Singapore Maritime Hub',
    code: 'PSA-SGP',
    type: 'port_terminal',
    country: 'Singapore',
    region: 'Southeast Asia',
    coordinates: [12, -2, -18],
    geo: { lat: 1.28, lng: 103.85 },
    tier: 0,
    baselineRisk: 22,
    currentRisk: 82,
    riskLevel: 'critical',
    gnnEmbeddings: [0.93, 0.95, 0.87, 0.79, 0.99],
    attentionScore: 0.98,
    inventoryBufferDays: 5,
    singleSourceVulnerability: true,
    activeDisruptions: ['Malacca Strait Bunkering Congestion', 'Berth Delay: 42hrs Avg'],
    capacityUtilization: 98,
    financialExposureUsd: 3800,
    products: ['Transshipment Hub', 'Container Freight Consolidation'],
    connectionsCount: 14,
  },
  {
    id: 'NODE-PORT-ROT-06',
    name: 'Port of Rotterdam Maasvlakte',
    code: 'PORT_RTM',
    type: 'port_terminal',
    country: 'Netherlands',
    region: 'Western Europe',
    coordinates: [-24, 21, 10],
    geo: { lat: 51.95, lng: 4.13 },
    tier: 0,
    baselineRisk: 15,
    currentRisk: 72,
    riskLevel: 'high',
    gnnEmbeddings: [0.38, 0.51, 0.44, 0.29, 0.58],
    attentionScore: 0.65,
    inventoryBufferDays: 12,
    singleSourceVulnerability: false,
    activeDisruptions: ['Rhine Logistics Outage', 'Low Water Level Navigation Draft Throttle'],
    capacityUtilization: 84,
    financialExposureUsd: 1650,
    products: ['Deep Sea Container Terminal', 'Automated Rail Freight Link'],
    connectionsCount: 9,
  },
  {
    id: 'NODE-PORT-LA-07',
    name: 'Port of Los Angeles & Long Beach',
    code: 'POLA-US',
    type: 'port_terminal',
    country: 'United States',
    region: 'North America',
    coordinates: [-26, 8, -24],
    geo: { lat: 33.74, lng: -118.27 },
    tier: 0,
    baselineRisk: 28,
    currentRisk: 55,
    riskLevel: 'medium',
    gnnEmbeddings: [0.58, 0.62, 0.71, 0.48, 0.69],
    attentionScore: 0.82,
    inventoryBufferDays: 8,
    singleSourceVulnerability: false,
    activeDisruptions: ['Drayage Truck Chassis Shortage'],
    capacityUtilization: 89,
    financialExposureUsd: 2900,
    products: ['Intermodal Inbound Terminal', 'West Coast Gateway'],
    connectionsCount: 10,
  },
  {
    id: 'NODE-ALB-08',
    name: 'Albemarle Lithium Processing',
    code: 'ALB-CL',
    type: 'raw_material_mine',
    country: 'Chile',
    region: 'South America',
    coordinates: [-18, -24, 14],
    geo: { lat: -23.8, lng: -69.1 },
    tier: 3,
    baselineRisk: 38,
    currentRisk: 62,
    riskLevel: 'high',
    gnnEmbeddings: [0.77, 0.35, 0.81, 0.64, 0.72],
    attentionScore: 0.85,
    inventoryBufferDays: 30,
    singleSourceVulnerability: true,
    activeDisruptions: ['Atacama Brine Extraction Regulation Audit'],
    capacityUtilization: 95,
    financialExposureUsd: 740,
    products: ['Battery-Grade Lithium Hydroxide', 'Lithium Carbonate'],
    connectionsCount: 4,
  },
  {
    id: 'NODE-CATL-09',
    name: 'CATL Battery Mega-Hub Yibin',
    code: 'CATL-CN',
    type: 'supplier_tier2',
    country: 'China',
    region: 'East Asia',
    coordinates: [8, 10, -12],
    geo: { lat: 28.7, lng: 104.6 },
    tier: 2,
    baselineRisk: 30,
    currentRisk: 58,
    riskLevel: 'medium',
    gnnEmbeddings: [0.69, 0.74, 0.68, 0.52, 0.80],
    attentionScore: 0.81,
    inventoryBufferDays: 16,
    singleSourceVulnerability: false,
    activeDisruptions: ['Raw Material Rail Transit Throttle'],
    capacityUtilization: 92,
    financialExposureUsd: 1850,
    products: ['LFP & NMC Battery Cells', 'BMS Pack Modules'],
    connectionsCount: 6,
  },
  {
    id: 'NODE-TESLA-10',
    name: 'Giga Texas Austin Final Assembly',
    code: 'TSLA-US',
    type: 'distribution_center',
    country: 'United States',
    region: 'North America',
    coordinates: [-12, 6, -18],
    geo: { lat: 30.22, lng: -97.62 },
    tier: 0,
    baselineRisk: 20,
    currentRisk: 64,
    riskLevel: 'high',
    gnnEmbeddings: [0.81, 0.66, 0.89, 0.57, 0.90],
    attentionScore: 0.91,
    inventoryBufferDays: 4,
    singleSourceVulnerability: true,
    activeDisruptions: ['Inbound Sub-tier Chipset Stockout Alert'],
    capacityUtilization: 94,
    financialExposureUsd: 3400,
    products: ['EV Final Powertrain & Robotics Assembly'],
    connectionsCount: 9,
  }
];

export const initialEdges: GraphEdge[] = [
  { id: 'EDGE-01', source: 'NODE-ASML-02', target: 'NODE-TSMC-01', transportMode: 'air', transitTimeDays: 3, flowVolumeMonthlyTons: 120, dependencyWeight: 0.95, chokepoint: null, activeShockwave: false, shockDelayDays: 0 },
  { id: 'EDGE-02', source: 'NODE-TSMC-01', target: 'NODE-FOX-03', transportMode: 'air', transitTimeDays: 1, flowVolumeMonthlyTons: 1200, dependencyWeight: 0.89, chokepoint: null, activeShockwave: true, shockDelayDays: 3 },
  { id: 'EDGE-03', source: 'NODE-FOX-03', target: 'NODE-PORT-LA-07', transportMode: 'maritime', transitTimeDays: 14, flowVolumeMonthlyTons: 24500, dependencyWeight: 0.90, chokepoint: 'Great Circle Route', activeShockwave: true, shockDelayDays: 4 },
  { id: 'EDGE-04', source: 'NODE-PORT-LA-07', target: 'NODE-TESLA-10', transportMode: 'rail', transitTimeDays: 4, flowVolumeMonthlyTons: 6200, dependencyWeight: 0.84, chokepoint: 'Southwest Freight Rail Corridor', activeShockwave: true, shockDelayDays: 3 },
  { id: 'EDGE-05', source: 'NODE-ALB-08', target: 'NODE-CATL-09', transportMode: 'maritime', transitTimeDays: 24, flowVolumeMonthlyTons: 8900, dependencyWeight: 0.89, chokepoint: 'Pacific Rim South Route', activeShockwave: false, shockDelayDays: 0 },
  { id: 'EDGE-06', source: 'NODE-CATL-09', target: 'NODE-FOX-03', transportMode: 'road', transitTimeDays: 2, flowVolumeMonthlyTons: 3400, dependencyWeight: 0.76, chokepoint: null, activeShockwave: false, shockDelayDays: 0 },
  { id: 'EDGE-07', source: 'NODE-PORT-SGP-05', target: 'NODE-PORT-ROT-06', transportMode: 'maritime', transitTimeDays: 22, flowVolumeMonthlyTons: 16800, dependencyWeight: 0.89, chokepoint: 'Suez Canal / Red Sea / Bab-el-Mandeb', activeShockwave: true, shockDelayDays: 14 }
];

export const initialVessels: AisVessel[] = [
  {
    id: 'VESSEL-EVER-GIVEN',
    mmsi: '353136000',
    imo: '9811000',
    name: 'EVER APEX (Ultra Large Container)',
    flag: 'Panama 🇵🇦',
    type: 'container_ship',
    coordinates: [10, -1, -16],
    geo: { lat: 1.25, lng: 103.9 },
    speedKnots: 4.8,
    headingDeg: 124,
    draughtM: 16.2,
    originPort: 'Port of Shanghai',
    destinationPort: 'Port of Rotterdam',
    eta: '2026-09-04 18:00 UTC',
    delayHours: 46,
    riskStatus: 'critical',
    cargoDescription: '23,992 TEU Semiconductor & Precision Components',
    cargoValueUsdM: 412,
    connectedSupplyNodeId: 'NODE-PORT-SGP-05',
    weatherCondition: 'Squall / 3.4m Swells',
  },
  {
    id: 'VESSEL-MAERSK-MC',
    mmsi: '219018501',
    imo: '9632064',
    name: 'MAERSK MC-KINNEY MOLLER',
    flag: 'Denmark 🇩🇰',
    type: 'container_ship',
    coordinates: [-22, 6, -22],
    geo: { lat: 31.8, lng: -121.4 },
    speedKnots: 18.2,
    headingDeg: 82,
    draughtM: 15.8,
    originPort: 'Port of Kaohsiung',
    destinationPort: 'Port of Los Angeles',
    eta: '2026-08-28 06:30 UTC',
    delayHours: 12,
    riskStatus: 'medium',
    cargoDescription: '18,270 TEU Sub-assemblies & EV Battery Packs',
    cargoValueUsdM: 285,
    connectedSupplyNodeId: 'NODE-PORT-LA-07',
    weatherCondition: 'Moderate Breeze / Calm',
  }
];

export const initialPorts: AisPort[] = [
  {
    id: 'PORT-SGP',
    name: 'Port of Singapore (PSA)',
    code: 'SGSIN',
    country: 'Singapore',
    coordinates: [12, -2, -18],
    geo: { lat: 1.28, lng: 103.85 },
    congestionIndex: 86,
    waitingVesselsCount: 48,
    avgTurnaroundHours: 41.5,
    status: 'severe_bottleneck',
    connectedNodeId: 'NODE-PORT-SGP-05',
  },
  {
    id: 'PORT-ROT',
    name: 'Port of Rotterdam',
    code: 'NLRTM',
    country: 'Netherlands',
    coordinates: [-24, 21, 10],
    geo: { lat: 51.95, lng: 4.13 },
    congestionIndex: 44,
    waitingVesselsCount: 16,
    avgTurnaroundHours: 19.8,
    status: 'normal',
    connectedNodeId: 'NODE-PORT-ROT-06',
  }
];

export const initialNewsArticles: NlpNewsArticle[] = [
  {
    id: 'NEWS-01',
    title: 'Severe Bunkering Delays & Red Sea Diversions Compound at Singapore Transshipment Terminals',
    source: 'Lloyds Maritime Intelligence',
    timestamp: '18 mins ago',
    snippet: 'Vessel queue times at Port of Singapore have escalated to 42 hours as container ships rerouting around Africa converge simultaneously. Transshipment dwell time for sensitive wafer freight increased by 310%.',
    sentiment: -0.84,
    riskCategory: 'port_congestion',
    riskSeverity: 'critical',
    confidence: 0.96,
    extractedEntities: {
      locations: ['Singapore', 'Strait of Malacca', 'Red Sea'],
      organizations: ['PSA International', 'Evergreen', 'Maersk Line'],
      materials: ['Semiconductors', 'Electronics Sub-assemblies'],
      transportHubs: ['PSA Terminal 4', 'Jurong Island'],
    },
    impactedNodeIds: ['NODE-PORT-SGP-05', 'NODE-TSMC-01', 'NODE-TESLA-10'],
    cypherQuery: `MATCH (p:Port {code: 'PSA-SGP'})-[:MARITIME_LANE*1..2]->(target)
SET p.congestionIndex = 86, p.risk = 'critical'
RETURN p, target;`,
  }
];

export const initialSimState: GnnSimulationState = {
  currentDay: 3,
  isRunning: false,
  propagationRate: 1.45,
  overallNetworkResilience: 64.2,
  totalNodesAtRisk: 6,
  estimatedFinancialLossUsdM: 418.5,
  highestRiskPath: ['NODE-TSMC-01', 'NODE-PORT-SGP-05', 'NODE-PORT-LA-07', 'NODE-TESLA-10'],
  activeChokepointAlerts: ['Malacca Strait Bunkering Queue', 'Taiwan Weather Corridor'],
};

export const AtmoGraphService = {
  getGraphNodes: async (): Promise<GraphNode[]> => [...initialNodes],
  getGraphEdges: async (): Promise<GraphEdge[]> => [...initialEdges],
  getAisVessels: async (): Promise<AisVessel[]> => [...initialVessels],
  getAisPorts: async (): Promise<AisPort[]> => [...initialPorts],
  getNewsArticles: async (): Promise<NlpNewsArticle[]> => [...initialNewsArticles],
  getSimulationState: async (): Promise<GnnSimulationState> => ({ ...initialSimState }),

  // Call FastAPI /api/simulate with fallback to local calculation
  triggerBackendSimulation: async (
    disturbedNodeId: string,
    nodes: GraphNode[],
    edges: GraphEdge[],
    shockMagnitude: number = 85.0
  ): Promise<{ nodes: GraphNode[]; global_system_entropy?: number; estimated_recovery_days?: number } | null> => {
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disturbed_node_id: disturbedNodeId,
          shock_magnitude: shockMagnitude,
          nodes,
          edges,
        }),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Graceful fallback to client-side propagation engine
    }
    return null;
  },

  // Call FastAPI /api/nlp/process-news with fallback
  processNewsThroughBackend: async (
    title: string,
    content: string,
    source: string = 'Live Feed'
  ): Promise<any | null> => {
    try {
      const response = await fetch('/api/nlp/process-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, source }),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Graceful fallback
    }
    return null;
  },

  calculateGnnPropagation: (
    nodes: GraphNode[],
    edges: GraphEdge[],
    day: number,
    shockFactor: number = 1.0
  ): { updatedNodes: GraphNode[]; updatedEdges: GraphEdge[]; resilience: number; financialLoss: number } => {
    const updatedNodes = nodes.map(node => {
      let riskDelta = (day * 3.8 * shockFactor);
      if (node.singleSourceVulnerability) riskDelta *= 1.4;
      if (node.type === 'port_terminal') riskDelta *= 1.25;

      const dynamicRisk = Math.min(98, Math.max(10, Math.round(node.baselineRisk + riskDelta)));
      let riskLevel: RiskLevel = 'low';
      if (dynamicRisk >= 75) riskLevel = 'critical';
      else if (dynamicRisk >= 60) riskLevel = 'high';
      else if (dynamicRisk >= 40) riskLevel = 'medium';

      return {
        ...node,
        currentRisk: dynamicRisk,
        riskLevel,
        attentionScore: Math.min(0.99, Number((node.attentionScore + (day * 0.02)).toFixed(2))),
      };
    });

    const updatedEdges = edges.map(edge => {
      const isShocked = day > 1 && (edge.dependencyWeight > 0.8 || edge.chokepoint !== null);
      return {
        ...edge,
        activeShockwave: isShocked,
        shockDelayDays: isShocked ? Math.min(14, Math.round(edge.transitTimeDays * 0.4 * day)) : 0,
      };
    });

    const avgRisk = updatedNodes.reduce((acc, n) => acc + n.currentRisk, 0) / updatedNodes.length;
    const resilience = Math.max(15, Number((100 - avgRisk * 0.75).toFixed(1)));
    const financialLoss = Number((updatedNodes.reduce((sum, n) => sum + (n.financialExposureUsd * (n.currentRisk / 100)), 0) * 0.35).toFixed(1));

    return { updatedNodes, updatedEdges, resilience, financialLoss };
  },

  injectSyntheticDisruption: (
    title: string,
    category: NlpNewsArticle['riskCategory'],
    severity: RiskLevel,
    targetNodeId: string,
    allNodes: GraphNode[]
  ): NlpNewsArticle => {
    const targetNode = allNodes.find(n => n.id === targetNodeId) || allNodes[0];
    return {
      id: `NEWS-${Date.now().toString().slice(-4)}`,
      title,
      source: 'AtmoGraph NLP Live Stream',
      timestamp: 'Just now',
      snippet: `Automated NLP entity extraction detected ${category.replace('_', ' ')} incident impacting ${targetNode.name}.`,
      sentiment: severity === 'critical' ? -0.92 : severity === 'high' ? -0.74 : -0.45,
      riskCategory: category,
      riskSeverity: severity,
      confidence: 0.95,
      extractedEntities: {
        locations: [targetNode.region, targetNode.country],
        organizations: [targetNode.name],
        materials: targetNode.products,
        transportHubs: [targetNode.code],
      },
      impactedNodeIds: [targetNode.id],
      cypherQuery: `MATCH (n {id: '${targetNode.id}'}) SET n.riskLevel = '${severity}' RETURN n;`,
    };
  }
};

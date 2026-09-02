/**
 * AtmoGraph Supply Chain & Maritime Risk Intelligence Types
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type NodeType = 'supplier_tier1' | 'supplier_tier2' | 'supplier_tier3' | 'manufacturing_hub' | 'port_terminal' | 'distribution_center' | 'semiconductor_fab' | 'raw_material_mine';
export type VesselType = 'container_ship' | 'oil_tanker' | 'bulk_carrier' | 'lng_carrier' | 'cargo_vessel';
export type DisruptionCategory = 'geopolitical' | 'extreme_weather' | 'port_congestion' | 'labor_strike' | 'cyber_incident' | 'raw_material_shortage' | 'chokepoint_blockage';

export interface GraphNode {
  id: string;
  name: string;
  code: string;
  type: NodeType;
  country: string;
  region: string;
  coordinates: [number, number, number]; // 3D coordinates [x, y, z]
  geo: { lat: number; lng: number };
  tier: 1 | 2 | 3 | 0; // 0 for hubs/ports
  baselineRisk: number; // 0 - 100
  currentRisk: number; // Dynamic GNN risk score
  riskLevel: RiskLevel;
  gnnEmbeddings: number[];
  attentionScore: number;
  inventoryBufferDays: number;
  singleSourceVulnerability: boolean;
  activeDisruptions: string[];
  capacityUtilization: number; // percentage
  financialExposureUsd: number; // in Millions USD
  products: string[];
  connectionsCount: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  transportMode: 'maritime' | 'air' | 'rail' | 'road' | 'intermodal';
  transitTimeDays: number;
  flowVolumeMonthlyTons: number;
  dependencyWeight: number; // 0.0 - 1.0 (GNN edge weight)
  chokepoint: string | null; // e.g. "Strait of Malacca", "Suez Canal", "Panama Canal"
  activeShockwave: boolean;
  shockDelayDays: number;
}

export interface AisVessel {
  id: string;
  mmsi: string;
  imo: string;
  name: string;
  flag: string;
  type: VesselType;
  coordinates: [number, number, number]; // 3D sphere coordinates
  geo: { lat: number; lng: number };
  speedKnots: number;
  headingDeg: number;
  draughtM: number;
  originPort: string;
  destinationPort: string;
  eta: string;
  delayHours: number;
  riskStatus: RiskLevel;
  cargoDescription: string;
  cargoValueUsdM: number;
  connectedSupplyNodeId: string;
  weatherCondition: string;
}

export interface AisPort {
  id: string;
  name: string;
  code: string;
  country: string;
  coordinates: [number, number, number];
  geo: { lat: number; lng: number };
  congestionIndex: number; // 0 - 100
  waitingVesselsCount: number;
  avgTurnaroundHours: number;
  status: 'normal' | 'congested' | 'severe_bottleneck' | 'closed';
  connectedNodeId: string;
}

export interface NlpNewsArticle {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  snippet: string;
  sentiment: number; // -1.0 to 1.0
  riskCategory: DisruptionCategory;
  riskSeverity: RiskLevel;
  confidence: number;
  extractedEntities: {
    locations: string[];
    organizations: string[];
    materials: string[];
    transportHubs: string[];
  };
  impactedNodeIds: string[];
  cypherQuery: string;
}

export interface GnnSimulationState {
  currentDay: number; // 0 to 14
  isRunning: boolean;
  propagationRate: number;
  overallNetworkResilience: number; // 0 - 100%
  totalNodesAtRisk: number;
  estimatedFinancialLossUsdM: number;
  highestRiskPath: string[];
  activeChokepointAlerts: string[];
}

export interface CypherExecutionLog {
  query: string;
  executionTimeMs: number;
  nodesMatched: number;
  relationshipsTraversed: number;
}

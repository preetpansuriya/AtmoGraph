// AtmoGraph Knowledge Graph Schema Definition
CREATE CONSTRAINT supply_node_id_unique IF NOT EXISTS
FOR (n:SupplyNode) REQUIRE n.id IS UNIQUE;

CREATE INDEX supply_node_risk_idx IF NOT EXISTS
FOR (n:SupplyNode) ON (n.currentRisk);

CREATE INDEX supply_node_type_idx IF NOT EXISTS
FOR (n:SupplyNode) ON (n.type);

CREATE INDEX supply_node_tier_idx IF NOT EXISTS
FOR (n:SupplyNode) ON (n.tier);

CREATE INDEX supply_node_country_idx IF NOT EXISTS
FOR (n:SupplyNode) ON (n.country);

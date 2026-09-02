import pandas as pd
from typing import List, Dict, Any
from .neo4j_client import Neo4jClient

class SupplyChainGraphBuilder:
    """
    Constructs multi-tier supply chain knowledge graphs from tabular datasets
    into Neo4j nodes and relational edges.
    """
    def __init__(self, neo4j_client: Neo4jClient = None):
        self.client = neo4j_client or Neo4jClient()

    def build_from_csv(self, nodes_csv_path: str, edges_csv_path: str):
        nodes_df = pd.read_csv(nodes_csv_path)
        edges_df = pd.read_csv(edges_csv_path)
        
        print(f"Ingesting {len(nodes_df)} nodes and {len(edges_df)} edges into Neo4j...")
        
        # Batch insert nodes
        for _, row in nodes_df.iterrows():
            query = """
            MERGE (n:SupplyNode {id: $id})
            SET n.name = $name,
                n.type = $type,
                n.tier = $tier,
                n.country = $country,
                n.currentRisk = $currentRisk,
                n.inventoryBufferDays = $inventoryBufferDays,
                n.financialExposureUsd = $financialExposureUsd
            """
            self.client.run_query(query, row.to_dict())
            
        # Batch insert edges
        for _, row in edges_df.iterrows():
            query = """
            MATCH (a:SupplyNode {id: $source})
            MATCH (b:SupplyNode {id: $target})
            MERGE (a)-[r:FLOWS_TO {relation: $relation_type}]->(b)
            SET r.weight = $weight,
                r.latency_days = $latency_days
            """
            self.client.run_query(query, row.to_dict())
            
        print("Graph construction completed.")

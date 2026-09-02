#!/usr/bin/env python3
import os
import sys

# Append project root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.graph.graph_builder import SupplyChainGraphBuilder

def main():
    print("--- Ingesting AtmoGraph Knowledge Graph into Neo4j ---")
    nodes_csv = "data/processed/graph_nodes.csv"
    edges_csv = "data/processed/graph_edges.csv"
    
    if not (os.path.exists(nodes_csv) and os.path.exists(edges_csv)):
        print("Processed graph CSV files not found. Run preprocess_data.py first.")
        return
        
    builder = SupplyChainGraphBuilder()
    builder.build_from_csv(nodes_csv, edges_csv)
    print("Graph ingestion completed successfully.")

if __name__ == "__main__":
    main()

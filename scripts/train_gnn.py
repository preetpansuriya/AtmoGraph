#!/usr/bin/env python3
import os
import sys
import torch
import pandas as pd

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.gnn.dataset import SupplyChainGraphDataset
from backend.gnn.train import train_supply_chain_gnn

def main():
    print("--- Initiating GNN Training Pipeline ---")
    nodes_csv = "data/processed/graph_nodes.csv"
    edges_csv = "data/processed/graph_edges.csv"
    
    nodes_df = pd.read_csv(nodes_csv)
    edges_df = pd.read_csv(edges_csv)
    
    nodes_list = nodes_df.to_dict(orient="records")
    edges_list = edges_df.to_dict(orient="records")
    
    dataset = SupplyChainGraphDataset()
    x, adj, edge_weights, _ = dataset.load_from_memory(nodes_list, edges_list)
    
    # Synthetic target vector for demonstration [risk, buffer, exposure, cascade]
    y_true = torch.randn((x.size(0), 4))
    
    print(f"Loaded Graph: {x.size(0)} Nodes, Feature Dim: {x.size(1)}")
    train_supply_chain_gnn(x, adj, edge_weights, y_true, epochs=100)
    print("Training finished.")

if __name__ == "__main__":
    main()

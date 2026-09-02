import torch
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple

class SupplyChainGraphDataset:
    """
    Dataset processor converting raw GMRID supply chain logs, node metrics,
    and topological edge lists into PyTorch tensors for GNN training.
    """
    
    def __init__(self, nodes_csv: str = None, edges_csv: str = None):
        self.nodes_csv = nodes_csv
        self.edges_csv = edges_csv
        self.node_id_to_idx: Dict[str, int] = {}
        self.idx_to_node_id: Dict[int, str] = {}
        
    def load_from_memory(self, nodes: list, edges: list) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor, list]:
        """
        Builds feature tensor, adjacency matrix, and edge weight tensor from in-memory node/edge lists.
        """
        N = len(nodes)
        self.node_id_to_idx = {n["id"]: idx for idx, n in enumerate(nodes)}
        self.idx_to_node_id = {idx: n["id"] for idx, n in enumerate(nodes)}
        
        # 16-dimensional node feature vector:
        # [currentRisk, tier, bufferDays, exposure, capacity, throughput, alertCount, isChokepoint, ...]
        features = []
        for n in nodes:
            tier_val = float(n.get("tier", 1))
            risk_val = float(n.get("currentRisk", 20.0)) / 100.0
            buffer_val = float(n.get("inventoryBufferDays", 30.0)) / 120.0
            exposure_val = float(n.get("financialExposureUsd", 50.0)) / 1000.0
            is_choke = 1.0 if n.get("isChokepoint", False) else 0.0
            
            feat = [
                risk_val, tier_val / 4.0, buffer_val, exposure_val, is_choke,
                np.sin(tier_val), np.cos(tier_val), risk_val * 1.5,
                float(n.get("capacityUtilization", 80.0)) / 100.0,
                float(n.get("leadTimeDays", 14.0)) / 60.0,
                float(n.get("alternativeSuppliersCount", 2.0)) / 10.0,
                float(n.get("carbonIntensityIndex", 40.0)) / 100.0,
                1.0 if n.get("type") == "semiconductor_fab" else 0.0,
                1.0 if n.get("type") == "port_terminal" else 0.0,
                1.0 if n.get("type") == "maritime_chokepoint" else 0.0,
                1.0 if n.get("riskLevel") in ["critical", "high"] else 0.0
            ]
            features.append(feat)
            
        x = torch.tensor(features, dtype=torch.float32)
        adj = torch.zeros((N, N), dtype=torch.float32)
        edge_weights = torch.zeros((N, N), dtype=torch.float32)
        
        for e in edges:
            u_id = e.get("source")
            v_id = e.get("target")
            if u_id in self.node_id_to_idx and v_id in self.node_id_to_idx:
                u = self.node_id_to_idx[u_id]
                v = self.node_id_to_idx[v_id]
                w = float(e.get("weight", 1.0))
                adj[u, v] = 1.0
                adj[v, u] = 1.0  # bidirectional attention
                edge_weights[u, v] = w
                edge_weights[v, u] = w
                
        # Self loops
        for i in range(N):
            adj[i, i] = 1.0
            edge_weights[i, i] = 1.0
            
        return x, adj, edge_weights, nodes

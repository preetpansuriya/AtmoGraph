import torch
import numpy as np
from typing import List, Dict, Any
from .model import SupplyChainGNN
from .dataset import SupplyChainGraphDataset

class GNNShockwavePredictor:
    """
    Online shockwave & cascade predictor executing multi-tier disturbance propagation.
    """
    def __init__(self, model_path: str = None):
        self.dataset = SupplyChainGraphDataset()
        self.model = SupplyChainGNN(in_dim=16, hidden_dim=64, out_dim=4)
        self.model.eval()
        if model_path:
            try:
                self.model.load_state_dict(torch.load(model_path, map_location="cpu"))
                print(f"Loaded GNN model weights from {model_path}")
            except Exception as e:
                print(f"GNN weights not found at {model_path}, using randomized pretrained initialization: {e}")

    def simulate_shock(
        self,
        nodes: List[Dict[str, Any]],
        edges: List[Dict[str, Any]],
        disturbed_node_id: str,
        shock_magnitude: float = 85.0
    ) -> Dict[str, Any]:
        """
        Executes GNN inference with injected disturbance vector on the graph.
        """
        x, adj, edge_weights, original_nodes = self.dataset.load_from_memory(nodes, edges)
        
        # Inject shock into target node
        if disturbed_node_id in self.dataset.node_id_to_idx:
            idx = self.dataset.node_id_to_idx[disturbed_node_id]
            x[idx, 0] = min(1.0, float(shock_magnitude) / 100.0) # Boost risk feature
            x[idx, 2] = max(0.05, x[idx, 2] * 0.2) # Deplete inventory buffer
            
        with torch.no_grad():
            predictions, attention_matrix = self.model(x, adj, edge_weights)
            
        preds_np = predictions.numpy()
        att_np = attention_matrix.numpy()
        
        propagated_nodes = []
        for i, n in enumerate(original_nodes):
            updated = dict(n)
            # Risk %
            predicted_risk = float(np.clip(preds_np[i, 0] * 100.0, 5.0, 99.0))
            # If target node, force high
            if n["id"] == disturbed_node_id:
                predicted_risk = max(predicted_risk, shock_magnitude)
                
            updated["currentRisk"] = round(predicted_risk, 1)
            updated["attentionScore"] = round(float(np.mean(att_np[i, :])), 4)
            
            # Risk Level
            if predicted_risk >= 80:
                updated["riskLevel"] = "critical"
            elif predicted_risk >= 60:
                updated["riskLevel"] = "high"
            elif predicted_risk >= 40:
                updated["riskLevel"] = "medium"
            else:
                updated["riskLevel"] = "low"
                
            propagated_nodes.append(updated)
            
        return {
            "disturbed_node_id": disturbed_node_id,
            "shock_magnitude": shock_magnitude,
            "nodes": propagated_nodes,
            "edges": edges,
            "global_system_entropy": round(float(np.mean(preds_np[:, 0])), 3),
            "estimated_recovery_days": int(14 + (shock_magnitude / 100.0) * 45)
        }

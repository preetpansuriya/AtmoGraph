import pytest
import torch
from backend.gnn.model import SupplyChainGNN
from backend.gnn.predict import GNNShockwavePredictor

def test_gnn_model_shapes():
    model = SupplyChainGNN(in_dim=16, hidden_dim=64, out_dim=4)
    N = 10
    x = torch.randn((N, 16))
    adj = torch.ones((N, N))
    weights = torch.ones((N, N))
    
    out, att = model(x, adj, weights)
    assert out.shape == (N, 4)
    assert att.shape == (N, N)

def test_shockwave_predictor():
    predictor = GNNShockwavePredictor()
    nodes = [
        {"id": "node-1", "name": "Fab Alpha", "tier": 1, "currentRisk": 20.0, "type": "semiconductor_fab"},
        {"id": "node-2", "name": "Assembler Beta", "tier": 2, "currentRisk": 15.0, "type": "tier1_assembler"}
    ]
    edges = [
        {"source": "node-1", "target": "node-2", "weight": 0.9}
    ]
    
    res = predictor.simulate_shock(nodes, edges, "node-1", shock_magnitude=90.0)
    assert res["disturbed_node_id"] == "node-1"
    assert len(res["nodes"]) == 2
    assert res["nodes"][0]["currentRisk"] >= 90.0

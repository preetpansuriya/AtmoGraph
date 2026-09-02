import torch
import torch.nn as nn
import torch.optim as optim
import os
from .model import SupplyChainGNN

def train_supply_chain_gnn(
    x: torch.Tensor,
    adj: torch.Tensor,
    edge_weights: torch.Tensor,
    y_true: torch.Tensor,
    epochs: int = 200,
    lr: float = 0.005,
    save_path: str = "models/gnn/supply_chain_gnn.pt"
) -> SupplyChainGNN:
    """
    Trains the Graph Neural Network on historical supply chain disruption shockwaves.
    """
    in_dim = x.size(1)
    model = SupplyChainGNN(in_dim=in_dim, hidden_dim=64, out_dim=4)
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    criterion = nn.SmoothL1Loss()
    
    model.train()
    for epoch in range(epochs):
        optimizer.zero_grad()
        out, att = model(x, adj, edge_weights)
        loss = criterion(out, y_true)
        loss.backward()
        optimizer.step()
        
        if (epoch + 1) % 50 == 0:
            print(f"Epoch [{epoch+1}/{epochs}] - GNN Loss: {loss.item():.4f}")
            
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    torch.save(model.state_dict(), save_path)
    print(f"Model saved successfully to {save_path}")
    return model

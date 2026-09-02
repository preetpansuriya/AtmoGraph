import torch
import torch.nn as nn
import torch.nn.functional as F

class GraphAttentionLayer(nn.Module):
    """
    Custom Graph Attention Layer with edge feature integration and inventory elasticity.
    """
    def __init__(self, in_features: int, out_features: int, dropout: float = 0.1, alpha: float = 0.2):
        super(GraphAttentionLayer, self).__init__()
        self.in_features = in_features
        self.out_features = out_features
        self.dropout = dropout
        self.alpha = alpha

        self.W = nn.Linear(in_features, out_features, bias=False)
        self.a = nn.Parameter(torch.empty(size=(2 * out_features + 1, 1)))
        nn.init.xavier_uniform_(self.W.weight.data, gain=1.414)
        nn.init.xavier_uniform_(self.a.data, gain=1.414)

        self.leakyrelu = nn.LeakyReLU(self.alpha)

    def forward(self, h: torch.Tensor, adj: torch.Tensor, edge_weights: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        Wh = self.W(h)  # [N, out_features]
        N = Wh.size(0)

        # Broadcast concatenation for attention coefficients
        Wh_repeat_i = Wh.repeat_interleave(N, dim=0)
        Wh_repeat_j = Wh.repeat(N, 1)
        edge_w_flat = edge_weights.view(N * N, 1)
        
        all_combinations = torch.cat([Wh_repeat_i, Wh_repeat_j, edge_w_flat], dim=1)
        e = self.leakyrelu(torch.matmul(all_combinations, self.a).squeeze(1))
        e = e.view(N, N)

        # Mask non-connected edges
        zero_vec = -9e15 * torch.ones_like(e)
        attention = torch.where(adj > 0, e, zero_vec)
        attention = F.softmax(attention, dim=1)
        attention = F.dropout(attention, self.dropout, training=self.training)

        h_prime = torch.matmul(attention, Wh)
        return F.elu(h_prime), attention

class SupplyChainGNN(nn.Module):
    """
    Multi-hop Deep Graph Neural Network for Supply Chain Shockwave & Chokepoint Simulation.
    """
    def __init__(self, in_dim: int = 16, hidden_dim: int = 64, out_dim: int = 4, dropout: float = 0.1):
        super(SupplyChainGNN, self).__init__()
        self.gat1 = GraphAttentionLayer(in_dim, hidden_dim, dropout=dropout)
        self.gat2 = GraphAttentionLayer(hidden_dim, hidden_dim, dropout=dropout)
        self.gat3 = GraphAttentionLayer(hidden_dim, hidden_dim // 2, dropout=dropout)
        
        # Risk Prediction & Inventory Depletion Head
        self.risk_head = nn.Sequential(
            nn.Linear(hidden_dim // 2, 32),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(32, out_dim)  # [Risk %, Days Buffer Remaining, Financial Exposure, Cascade Probability]
        )

    def forward(self, x: torch.Tensor, adj: torch.Tensor, edge_weights: torch.Tensor):
        x1, att1 = self.gat1(x, adj, edge_weights)
        x2, att2 = self.gat2(x1, adj, edge_weights)
        x3, att3 = self.gat3(x2, adj, edge_weights)
        
        out = self.risk_head(x3)
        return out, att3

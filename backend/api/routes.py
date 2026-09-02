from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from backend.nlp.nlp_engine import NLPEngine
from backend.gnn.predict import GNNShockwavePredictor

router = APIRouter()
nlp_engine = NLPEngine()
gnn_predictor = GNNShockwavePredictor()

class SimulationRequest(BaseModel):
    disturbed_node_id: str
    shock_magnitude: float = 85.0
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

class NewsIngestionRequest(BaseModel):
    title: str
    content: str
    source: Optional[str] = "Live Feed"

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AtmoGraph AI Engine",
        "gnn_engine": "online",
        "nlp_extractor": "ready"
    }

@router.post("/simulate")
def run_gnn_simulation(request: SimulationRequest):
    """
    Executes deep GNN multi-hop shockwave propagation.
    """
    result = gnn_predictor.simulate_shock(
        nodes=request.nodes,
        edges=request.edges,
        disturbed_node_id=request.disturbed_node_id,
        shock_magnitude=request.shock_magnitude
    )
    return result

@router.post("/nlp/process-news")
def process_news_intelligence(request: NewsIngestionRequest):
    """
    Parses unstructured text, identifies supply chain entities and classifies risk severity.
    """
    payload = {
        "title": request.title,
        "content": request.content,
        "source": request.source
    }
    result = nlp_engine.process_news_feed(payload)
    return result

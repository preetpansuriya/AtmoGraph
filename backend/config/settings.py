import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AtmoGraph AI - Autonomous Supply Chain Shockwave Engine"
    API_V1_STR: str = "/api"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    # Neo4j Graph Database
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "atmograph_password")
    
    # GNN Model Configuration
    GNN_MODEL_PATH: str = os.getenv("GNN_MODEL_PATH", "models/gnn/supply_chain_gnn.pt")
    GNN_INPUT_DIM: int = 16
    GNN_HIDDEN_DIM: int = 64
    GNN_OUTPUT_DIM: int = 4
    GNN_HEADS: int = 4
    GNN_DROPOUT: float = 0.1
    
    # NLP Engine Configuration
    SPACY_MODEL: str = "en_core_web_sm"
    TRANSFORMER_MODEL: str = "distilbert-base-uncased"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Realtime Simulation Telemetry
    SIMULATION_INTERVAL_SEC: float = 2.0
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

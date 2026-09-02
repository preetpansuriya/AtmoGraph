from typing import List, Dict, Any
from .entity_extractor import SupplyChainEntityExtractor
from .risk_classifier import SupplyChainRiskClassifier

class NLPEngine:
    """
    Unified NLP Pipeline: Takes unstructured news intelligence, social reports,
    or satellite disruption feeds, extracts critical nodes, classifies severity,
    and returns graph disruption payload for GNN shock propagation.
    """
    
    def __init__(self):
        self.extractor = SupplyChainEntityExtractor()
        self.classifier = SupplyChainRiskClassifier()
        
    def process_news_feed(self, article: Dict[str, Any]) -> Dict[str, Any]:
        title = article.get("title", "")
        content = article.get("content", article.get("summary", ""))
        
        entities = self.extractor.extract_entities(f"{title} {content}")
        classification = self.classifier.classify_article(title, content)
        
        impacted_node_ids = [e["node_id"] for e in entities]
        
        return {
            "id": article.get("id", "news-dynamic"),
            "title": title,
            "source": article.get("source", "Global Maritime & Semiconductor Wire"),
            "timestamp": article.get("timestamp", "Just now"),
            "entities": entities,
            "impacted_node_ids": impacted_node_ids,
            "category": classification["primary_category"],
            "severity": classification["severity"],
            "risk_score": classification["risk_score"],
            "confidence": classification["confidence"],
            "gnn_disturbance_vector": {
                "direct_risk_delta": classification["risk_score"] * 0.8,
                "target_nodes": impacted_node_ids
            }
        }

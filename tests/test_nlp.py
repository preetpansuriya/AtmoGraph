import pytest
from backend.nlp.nlp_engine import NLPEngine
from backend.nlp.entity_extractor import SupplyChainEntityExtractor
from backend.nlp.risk_classifier import SupplyChainRiskClassifier

def test_entity_extractor():
    extractor = SupplyChainEntityExtractor()
    text = "ASML and TSMC reported supply chain disruptions near Port of Shanghai."
    entities = extractor.extract_entities(text)
    node_ids = [e["node_id"] for e in entities]
    assert "supp-asml-veldhoven" in node_ids
    assert "fab-tsmc-hsinchu" in node_ids
    assert "port-shanghai" in node_ids

def test_risk_classifier():
    classifier = SupplyChainRiskClassifier()
    res = classifier.classify_article(
        title="Catastrophic Typhoon forces shutdown of main container berths",
        content="Indefinite halt on all port operations."
    )
    assert res["severity"] == "critical"
    assert res["risk_score"] > 80.0

def test_nlp_engine_pipeline():
    engine = NLPEngine()
    res = engine.process_news_feed({
        "title": "Suez Canal draft restrictions due to military incident",
        "content": "Multiple container vessels blocked in Suez Canal."
    })
    assert "choke-suez" in res["impacted_node_ids"]
    assert res["severity"] in ["high", "critical"]

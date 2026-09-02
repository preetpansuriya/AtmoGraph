import re
from typing import Dict, Any

class SupplyChainRiskClassifier:
    """
    Disturbance taxonomy classifier categorizing global intelligence events
    into Geopolitical, Climate/Meteorological, Maritime Chokepoint, Labor, Cyber, or Capacity bottlenecks.
    """
    
    CATEGORIES = {
        "geopolitical": [
            "tariff", "sanction", "export control", "blockade", "military", "embargo", "trade war", "taiwan strait", "red sea"
        ],
        "climate_weather": [
            "typhoon", "cyclone", "hurricane", "drought", "flood", "freeze", "monsoon", "earthquake", "volcanic"
        ],
        "maritime_chokepoint": [
            "canal closure", "anchorage delay", "berth congestion", "draft restriction", "vessel queue", "chokepoint", "strait blocked"
        ],
        "labor_strike": [
            "dockworker strike", "union slowdown", "port walkout", "labor dispute", "trucker protest", "factory picket"
        ],
        "cyber_incident": [
            "ransomware", "terminal scada outage", "port system hack", "firmware compromise", "ddos"
        ],
        "capacity_shortage": [
            "wafer shortage", "foundry yield drop", "lithography delay", "inventory stockout", "raw material quota"
        ]
    }
    
    SEVERITY_KEYWORDS = {
        "critical": ["shutdown", "force majeure", "indefinite halt", "blocked", "catastrophic", "blackout", "devastating", "evacuation"],
        "high": ["severe delay", "suspended", "50% capacity", "embargoed", "diverted", "emergency protocol"],
        "medium": ["slowdown", "congestion", "minor disruption", "monitoring", "inspected", "rerouted"],
        "low": ["advisory", "nominal", "drill", "update", "scheduled maintenance"]
    }

    def classify_article(self, title: str, content: str) -> Dict[str, Any]:
        combined = f"{title} {content}".lower()
        
        # Category scores
        scores = {}
        for category, terms in self.CATEGORIES.items():
            count = sum(1 for term in terms if term in combined)
            scores[category] = count
            
        best_category = max(scores, key=scores.get) if any(scores.values()) else "general_disruption"
        
        # Severity calculation
        severity = "low"
        risk_score = 25.0
        
        if any(w in combined for w in self.SEVERITY_KEYWORDS["critical"]):
            severity = "critical"
            risk_score = 92.0
        elif any(w in combined for w in self.SEVERITY_KEYWORDS["high"]):
            severity = "high"
            risk_score = 75.0
        elif any(w in combined for w in self.SEVERITY_KEYWORDS["medium"]):
            severity = "medium"
            risk_score = 48.0
        else:
            severity = "low"
            risk_score = 20.0
            
        return {
            "primary_category": best_category,
            "severity": severity,
            "risk_score": risk_score,
            "confidence": 0.88 if any(scores.values()) else 0.45
        }

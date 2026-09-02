import re
from typing import List, Dict, Any

class SupplyChainEntityExtractor:
    """
    Named Entity Recognition & Linker specialized for semiconductor,
    maritime chokepoints, critical minerals, and global assembly hubs.
    """
    
    KNOWN_FACILITIES = {
        "tsmc": {"node_id": "fab-tsmc-hsinchu", "name": "TSMC Fab 18 / 12", "type": "semiconductor_fab", "country": "TW"},
        "asml": {"node_id": "supp-asml-veldhoven", "name": "ASML Veldhoven EUV Fab", "type": "lithography_supplier", "country": "NL"},
        "intel": {"node_id": "fab-intel-oregon", "name": "Intel D1X Ronler Acres", "type": "semiconductor_fab", "country": "US"},
        "samsung": {"node_id": "fab-samsung-pyeongtaek", "name": "Samsung Pyeongtaek Fab", "type": "semiconductor_fab", "country": "KR"},
        "foxconn": {"node_id": "tier1-foxconn-zhengzhou", "name": "Foxconn Zhengzhou Mega Complex", "type": "tier1_assembler", "country": "CN"},
        "pegatron": {"node_id": "tier1-pegatron-shanghai", "name": "Pegatron Shanghai Assembly", "type": "tier1_assembler", "country": "CN"},
        "port of shanghai": {"node_id": "port-shanghai", "name": "Port of Shanghai (Yangshan)", "type": "port_terminal", "country": "CN"},
        "port of rotterdam": {"node_id": "port-rotterdam", "name": "Port of Rotterdam Maasvlakte", "type": "port_terminal", "country": "NL"},
        "port of los angeles": {"node_id": "port-la", "name": "Port of Los Angeles (Pier 400)", "type": "port_terminal", "country": "US"},
        "suez canal": {"node_id": "choke-suez", "name": "Suez Canal Maritime Corridor", "type": "maritime_chokepoint", "country": "EG"},
        "malacca strait": {"node_id": "choke-malacca", "name": "Strait of Malacca", "type": "maritime_chokepoint", "country": "SG"},
        "panama canal": {"node_id": "choke-panama", "name": "Panama Canal Locks", "type": "maritime_chokepoint", "country": "PA"},
        "congo cobalt": {"node_id": "mine-congo-cobalt", "name": "Katanga Cobalt Mine", "type": "raw_material_mine", "country": "CD"},
        "atacama lithium": {"node_id": "mine-atacama-lithium", "name": "Salar de Atacama Brine", "type": "raw_material_mine", "country": "CL"},
        "shin-etsu": {"node_id": "supp-shinetsu-gunma", "name": "Shin-Etsu Silicon Ingot Plant", "type": "tier2_supplier", "country": "JP"}
    }
    
    def __init__(self):
        self.facility_patterns = {
            k: re.compile(rf"\b{re.escape(k)}\b", re.IGNORECASE) for k in self.KNOWN_FACILITIES.keys()
        }

    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        extracted = []
        lowered_text = text.lower()
        
        for key, pattern in self.facility_patterns.items():
            if pattern.search(lowered_text):
                meta = self.KNOWN_FACILITIES[key]
                extracted.append({
                    "entity_name": meta["name"],
                    "matched_token": key,
                    "node_id": meta["node_id"],
                    "node_type": meta["type"],
                    "country": meta["country"]
                })
        return extracted

# GMRID v3 Supply Chain Disruption Benchmark Dataset

## Data Schema
- `disruption_id`: Unique identifier (e.g. DSR-001)
- `timestamp`: UTC ISO-8601 timestamp of incident
- `facility_id`: Node ID referenced in the knowledge graph
- `severity`: critical | high | medium | low
- `disruption_type`: seismic_event | typhoon_lockdown | geopolitical | labor_strike
- `financial_exposure_m_usd`: Estimated monetary risk
- `recovery_status`: active | monitoring | recovered

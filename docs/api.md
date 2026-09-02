# AtmoGraph REST & WebSocket API Specification

## Endpoints

### `GET /api/health`
Health check status of FastAPI, GNN and NLP services.

### `POST /api/simulate`
Executes deep GNN shockwave propagation.
- **Request Body**:
```json
{
  "disturbed_node_id": "fab-tsmc-hsinchu",
  "shock_magnitude": 90.0,
  "nodes": [...],
  "edges": [...]
}
```

### `POST /api/nlp/process-news`
Ingests unstructured news articles for entity extraction and severity categorization.

### `WS /ws/telemetry`
Real-time telemetry and AIS transponder streaming.

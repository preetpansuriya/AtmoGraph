import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                pass

manager = ConnectionManager()

@router.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            # Echo or stream back synthetic AIS vessel / GNN ping
            action = payload.get("action")
            if action == "ping":
                await websocket.send_text(json.dumps({"type": "pong", "status": "active"}))
            elif action == "subscribe_ais":
                await websocket.send_text(json.dumps({
                    "type": "ais_stream_active",
                    "channel": "maritime_live_vessels"
                }))
    except WebSocketDisconnect:
        manager.disconnect(websocket)

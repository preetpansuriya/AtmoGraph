import { AisVessel, NlpNewsArticle, GraphNode } from '../types/models';

type Listener<T> = (data: T) => void;

class AtmoGraphWebSocketMock {
  private vesselListeners: Set<Listener<AisVessel[]>> = new Set();
  private newsListeners: Set<Listener<NlpNewsArticle>> = new Set();
  private gnnPulseListeners: Set<Listener<{ timestamp: string; activeNodeId: string; attentionPulse: number }>> = new Set();
  private intervalId: number | null = null;
  private isConnected: boolean = false;

  public connect(getVessels: () => AisVessel[], getNodes: () => GraphNode[]) {
    if (this.isConnected) return;
    this.isConnected = true;

    // Simulate regular stream pulses every 4.5 seconds
    this.intervalId = window.setInterval(() => {
      const currentVessels = getVessels();
      const currentNodes = getNodes();

      if (currentVessels.length > 0) {
        // Jitter vessel coordinates and speeds slightly to simulate real-time AIS dynamic movement
        const updated = currentVessels.map(v => {
          const deltaLat = (Math.random() - 0.5) * 0.05;
          const deltaLng = (Math.random() - 0.5) * 0.05;
          const deltaSpeed = (Math.random() - 0.5) * 0.4;
          return {
            ...v,
            geo: {
              lat: Number((v.geo.lat + deltaLat).toFixed(4)),
              lng: Number((v.geo.lng + deltaLng).toFixed(4)),
            },
            speedKnots: Math.max(1, Number((v.speedKnots + deltaSpeed).toFixed(1))),
          };
        });

        this.vesselListeners.forEach(fn => fn(updated));
      }

      if (currentNodes.length > 0) {
        const randomNode = currentNodes[Math.floor(Math.random() * currentNodes.length)];
        const pulse = {
          timestamp: new Date().toISOString().substring(11, 19),
          activeNodeId: randomNode.id,
          attentionPulse: Number((0.6 + Math.random() * 0.38).toFixed(3)),
        };
        this.gnnPulseListeners.forEach(fn => fn(pulse));
      }
    }, 4500);
  }

  public disconnect() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isConnected = false;
  }

  public subscribeVessels(fn: Listener<AisVessel[]>) {
    this.vesselListeners.add(fn);
    return () => this.vesselListeners.delete(fn);
  }

  public subscribeNews(fn: Listener<NlpNewsArticle>) {
    this.newsListeners.add(fn);
    return () => this.newsListeners.delete(fn);
  }

  public subscribeGnnPulse(fn: Listener<{ timestamp: string; activeNodeId: string; attentionPulse: number }>) {
    this.gnnPulseListeners.add(fn);
    return () => this.gnnPulseListeners.delete(fn);
  }

  public broadcastNews(article: NlpNewsArticle) {
    this.newsListeners.forEach(fn => fn(article));
  }

  public getStatus() {
    return this.isConnected ? 'connected' : 'disconnected';
  }
}

export const socketService = new AtmoGraphWebSocketMock();

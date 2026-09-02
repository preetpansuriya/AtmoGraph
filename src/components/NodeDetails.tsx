import React from 'react';
import { GraphNode, GraphEdge } from '../types/models';
import {
  X,
  Building2,
  AlertTriangle,
  Cpu,
  TrendingUp,
  Boxes,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  Zap,
  Terminal,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface NodeDetailsProps {
  node: GraphNode | null;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  onClose: () => void;
  onSelectNode: (node: GraphNode) => void;
  isDark: boolean;
}

export const NodeDetails: React.FC<NodeDetailsProps> = ({
  node,
  edges,
  allNodes,
  onClose,
  onSelectNode,
  isDark,
}) => {
  if (!node) return null;

  // Inbound & Outbound connected edges
  const inboundEdges = edges.filter(e => e.target === node.id);
  const outboundEdges = edges.filter(e => e.source === node.id);

  // Cypher query for this specific node
  const cypherQuery = `MATCH (n {id: '${node.id}'})-[r]-(connected)
RETURN n, type(r), connected
LIMIT 25;`;

  return (
    <div className={`w-full rounded-2xl border p-5 transition-all space-y-5 shadow-2xl ${
      isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between border-b pb-4 border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            node.currentRisk >= 75 ? 'bg-red-500/20 border-red-500/40 text-red-400' :
            node.currentRisk >= 60 ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' :
            node.currentRisk >= 40 ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400' :
            'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
          }`}>
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {node.type.replace('_', ' ')} • Tier {node.tier}
              </span>
              {node.singleSourceVulnerability && (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                  Single Source Risk
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold font-orbitron mt-1 text-slate-100">{node.name}</h3>
            <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>{node.country} ({node.region}) • Code: {node.code}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close Inspector"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Real-time Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-[10px] font-mono text-slate-400 uppercase">Dynamic GNN Risk</div>
          <div className={`text-xl font-bold font-orbitron mt-0.5 ${
            node.currentRisk >= 75 ? 'text-red-400' :
            node.currentRisk >= 60 ? 'text-orange-400' :
            node.currentRisk >= 40 ? 'text-yellow-400' : 'text-emerald-400'
          }`}>
            {node.currentRisk}%
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Baseline: {node.baselineRisk}%</div>
        </div>

        <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-[10px] font-mono text-slate-400 uppercase">Buffer Days</div>
          <div className={`text-xl font-bold font-orbitron mt-0.5 ${node.inventoryBufferDays <= 7 ? 'text-red-400' : 'text-cyan-400'}`}>
            {node.inventoryBufferDays} Days
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Capacity: {node.capacityUtilization}%</div>
        </div>

        <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-[10px] font-mono text-slate-400 uppercase">Financial Exposure</div>
          <div className="text-xl font-bold font-orbitron mt-0.5 text-emerald-400">
            ${node.financialExposureUsd}M
          </div>
          <div className="text-[10px] text-slate-400 font-mono">USD In-Flight</div>
        </div>

        <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-[10px] font-mono text-slate-400 uppercase">GNN Attention</div>
          <div className="text-xl font-bold font-orbitron mt-0.5 text-indigo-400">
            {node.attentionScore}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Weight Rank: High</div>
        </div>
      </div>

      {/* GNN 5D Embedding Vectors Breakdown */}
      <div className={`p-3.5 rounded-xl border space-y-2 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            GNN Hidden State Latent Embeddings (dim=5)
          </span>
          <span className="text-cyan-400 text-[11px]">GAT Layer 2 Output</span>
        </div>
        <div className="grid grid-cols-5 gap-2 pt-1">
          {node.gnnEmbeddings.map((val, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-[9px] font-mono text-slate-400 text-center">h_{idx + 1}</div>
              <div className="h-12 bg-slate-800 rounded-lg overflow-hidden flex flex-col justify-end p-0.5">
                <div
                  className="w-full bg-gradient-to-t from-cyan-500 to-indigo-500 rounded"
                  style={{ height: `${val * 100}%` }}
                />
              </div>
              <div className="text-[10px] font-mono text-center font-bold text-slate-200">{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Products & Active Disruptions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className={`p-3 rounded-xl border space-y-1.5 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="font-mono text-slate-400 uppercase text-[10px]">Manufactured / Handled Products</div>
          <div className="flex flex-wrap gap-1.5">
            {node.products.map(p => (
              <span key={p} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px]">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className={`p-3 rounded-xl border space-y-1.5 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="font-mono text-slate-400 uppercase text-[10px]">Active Disruptions & Alerts</div>
          {node.activeDisruptions.length > 0 ? (
            <div className="space-y-1">
              {node.activeDisruptions.map(d => (
                <div key={d} className="flex items-center gap-1.5 text-red-300 font-mono text-[11px]">
                  <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                  <span>{d}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-emerald-400 font-mono text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> No active direct alarms
            </div>
          )}
        </div>
      </div>

      {/* Connected Network Lanes (Inbound / Outbound) */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-slate-400 uppercase font-bold">
          Connected Logistics Lanes ({inboundEdges.length + outboundEdges.length})
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {inboundEdges.map(e => {
            const sourceNode = allNodes.find(n => n.id === e.source);
            return (
              <div
                key={e.id}
                onClick={() => sourceNode && onSelectNode(sourceNode)}
                className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-xs font-mono flex items-center justify-between hover:border-cyan-500/40 cursor-pointer"
              >
                <div>
                  <div className="text-[10px] text-slate-400">INBOUND from</div>
                  <div className="font-bold text-slate-200">{sourceNode?.name || e.source}</div>
                  <div className="text-[10px] text-cyan-400 uppercase">{e.transportMode} • {e.transitTimeDays}d transit</div>
                </div>
                {e.activeShockwave && (
                  <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                    +{e.shockDelayDays}d Delay
                  </span>
                )}
              </div>
            );
          })}

          {outboundEdges.map(e => {
            const targetNode = allNodes.find(n => n.id === e.target);
            return (
              <div
                key={e.id}
                onClick={() => targetNode && onSelectNode(targetNode)}
                className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-xs font-mono flex items-center justify-between hover:border-cyan-500/40 cursor-pointer"
              >
                <div>
                  <div className="text-[10px] text-slate-400">OUTBOUND to</div>
                  <div className="font-bold text-slate-200">{targetNode?.name || e.target}</div>
                  <div className="text-[10px] text-sky-400 uppercase">{e.transportMode} • {e.transitTimeDays}d transit</div>
                </div>
                {e.activeShockwave && (
                  <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                    +{e.shockDelayDays}d Delay
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cypher Query box */}
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase mb-1">
          <Terminal className="w-3 h-3 text-cyan-400" /> Neo4j Cypher Traversal
        </div>
        <pre className="text-emerald-300 text-[11px] overflow-x-auto">{cypherQuery}</pre>
      </div>
    </div>
  );
};

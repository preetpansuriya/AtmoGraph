import React, { useState } from 'react';
import { GraphNode, GraphEdge, GnnSimulationState } from '../types/models';
import {
  ShieldAlert,
  Zap,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Flame,
  CheckCircle2,
  RefreshCw,
  Layers,
  ArrowUpRight,
  Sliders,
  Cpu,
  BarChart3
} from 'lucide-react';

interface RiskPanelProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  simState: GnnSimulationState;
  onTriggerSimulation: (factor: number) => void;
  onSelectNode: (node: GraphNode) => void;
  isDark: boolean;
}

export const RiskPanel: React.FC<RiskPanelProps> = ({
  nodes,
  edges,
  simState,
  onTriggerSimulation,
  onSelectNode,
  isDark,
}) => {
  const [shockIntensity, setShockIntensity] = useState<number>(1.2);
  const [activeTab, setActiveTab] = useState<'matrix' | 'stress_test' | 'cascade_path'>('matrix');

  // Sorted nodes by risk
  const highRiskNodes = [...nodes].sort((a, b) => b.currentRisk - a.currentRisk);

  // Group by Tier
  const tier1Risk = nodes.filter(n => n.tier === 1).reduce((acc, n) => acc + n.currentRisk, 0) / (nodes.filter(n => n.tier === 1).length || 1);
  const tier2Risk = nodes.filter(n => n.tier === 2).reduce((acc, n) => acc + n.currentRisk, 0) / (nodes.filter(n => n.tier === 2).length || 1);
  const tier3Risk = nodes.filter(n => n.tier === 3).reduce((acc, n) => acc + n.currentRisk, 0) / (nodes.filter(n => n.tier === 3).length || 1);

  return (
    <div className={`w-full rounded-2xl border p-5 transition-all space-y-6 ${
      isDark ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
    }`}>
      {/* Top Header & Simulation Triggers */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-slate-700/50">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-bold font-orbitron">GNN Risk & Cascade Vulnerability Engine</h3>
          </div>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Graph Attention Network (GATv2) Multi-Hop Shockwave Diffusion Model
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Shock Multiplier:</span>
            <span className="font-bold text-cyan-400">{shockIntensity}x</span>
          </div>
          <button
            onClick={() => onTriggerSimulation(shockIntensity)}
            id="btn-trigger-gnn-shock"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-500 to-amber-600 hover:from-red-600 hover:to-amber-700 shadow-md shadow-red-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Flame className="w-4 h-4" />
            <span>Run GNN Shock Ingestion</span>
          </button>
        </div>
      </div>

      {/* Top 3 KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 card-perspective">
        {/* Network Resilience Gauge */}
        <div className={`p-4 rounded-xl border card-tilt-hover flex items-center justify-between ${
          isDark ? 'bg-slate-950/70 border-slate-800 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase text-slate-400">Network Resilience</div>
            <div className="text-2xl font-extrabold font-orbitron text-cyan-400">
              {simState.overallNetworkResilience}%
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Fault tolerance optimal</span>
            </div>
          </div>
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className={isDark ? 'text-slate-800' : 'text-slate-300'}
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-cyan-400"
                strokeDasharray={`${simState.overallNetworkResilience}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-mono font-bold">{Math.round(simState.overallNetworkResilience)}%</span>
          </div>
        </div>

        {/* Estimated Value at Risk */}
        <div className={`p-4 rounded-xl border card-tilt-hover flex items-center justify-between ${
          isDark ? 'bg-slate-950/70 border-slate-800 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase text-slate-400">Financial Value at Risk</div>
            <div className="text-2xl font-extrabold font-orbitron text-amber-400">
              ${simState.estimatedFinancialLossUsdM}M
            </div>
            <div className="text-[11px] text-amber-500/80 flex items-center gap-1 font-mono">
              <span>Single-source exposure: $1.42B</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* High Risk Nodes & Bottlenecks */}
        <div className={`p-4 rounded-xl border card-tilt-hover flex items-center justify-between ${
          isDark ? 'bg-slate-950/70 border-slate-800 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase text-slate-400">Critical Shock Nodes</div>
            <div className="text-2xl font-extrabold font-orbitron text-red-400">
              {nodes.filter(n => n.currentRisk >= 60).length} / {nodes.length}
            </div>
            <div className="text-[11px] text-red-400 flex items-center gap-1 font-mono">
              <span>{edges.filter(e => e.activeShockwave).length} Active Shock Lanes</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/60 gap-4">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-2.5 text-xs font-bold font-mono transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'matrix'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          NODE RISK RANKING
        </button>

        <button
          onClick={() => setActiveTab('stress_test')}
          className={`pb-2.5 text-xs font-bold font-mono transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'stress_test'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          TIER MULTI-HOP SENSITIVITY
        </button>

        <button
          onClick={() => setActiveTab('cascade_path')}
          className={`pb-2.5 text-xs font-bold font-mono transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'cascade_path'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          HIGHEST-RISK CASCADE PATH
        </button>
      </div>

      {/* Tab Content 1: Node Risk Ranking */}
      {activeTab === 'matrix' && (
        <div className="space-y-3">
          <div className="grid grid-cols-12 text-[11px] font-mono text-slate-400 uppercase pb-2 border-b border-slate-800">
            <div className="col-span-5">Supply Node / Facility</div>
            <div className="col-span-2 text-center">Type</div>
            <div className="col-span-2 text-center">Buffer Days</div>
            <div className="col-span-3 text-right">GNN Risk Score</div>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {highRiskNodes.map(node => (
              <div
                key={node.id}
                onClick={() => onSelectNode(node)}
                className={`grid grid-cols-12 items-center p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  isDark ? 'bg-slate-950/50 border-slate-800 hover:border-cyan-500/50' : 'bg-slate-50 border-slate-200 hover:border-cyan-500'
                }`}
              >
                <div className="col-span-5 flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    node.currentRisk >= 75 ? 'bg-red-500 animate-ping' :
                    node.currentRisk >= 60 ? 'bg-orange-500' :
                    node.currentRisk >= 40 ? 'bg-yellow-500' : 'bg-emerald-500'
                  }`} />
                  <div>
                    <div className="font-bold text-slate-100 font-mono">{node.name}</div>
                    <div className="text-[11px] text-slate-400">{node.country} • {node.code}</div>
                  </div>
                </div>

                <div className="col-span-2 text-center">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {node.type.replace('_', ' ')}
                  </span>
                </div>

                <div className="col-span-2 text-center font-mono">
                  <span className={node.inventoryBufferDays <= 7 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                    {node.inventoryBufferDays}d
                  </span>
                </div>

                <div className="col-span-3 flex items-center justify-end gap-3">
                  <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden hidden sm:block">
                    <div
                      className={`h-full rounded-full ${
                        node.currentRisk >= 75 ? 'bg-red-500' :
                        node.currentRisk >= 60 ? 'bg-orange-500' :
                        node.currentRisk >= 40 ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${node.currentRisk}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-sm text-cyan-300">{node.currentRisk}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 2: Multi-Hop Tier Sensitivity */}
      {activeTab === 'stress_test' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-xs font-mono text-slate-400">TIER-1 SUPPLIERS & HUBS</div>
              <div className="text-2xl font-bold font-orbitron text-amber-400 mt-1">{Math.round(tier1Risk)}%</div>
              <p className="text-[11px] text-slate-400 mt-2">Assembly & GigaFab direct feed. Buffer avg: 12 days.</p>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-xs font-mono text-slate-400">TIER-2 SUB-TIER VENDORS</div>
              <div className="text-2xl font-bold font-orbitron text-indigo-400 mt-1">{Math.round(tier2Risk)}%</div>
              <p className="text-[11px] text-slate-400 mt-2">Photolithography & specialized components.</p>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-xs font-mono text-slate-400">TIER-3 RAW EXTRACTION</div>
              <div className="text-2xl font-bold font-orbitron text-pink-400 mt-1">{Math.round(tier3Risk)}%</div>
              <p className="text-[11px] text-slate-400 mt-2">Lithium brine & rare-earth supply.</p>
            </div>
          </div>

          {/* Shock Multiplier Slider */}
          <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-bold text-slate-200">GNN Graph Attention Weight Perturbation Factor</span>
              <span className="text-cyan-400 font-bold">{shockIntensity}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={shockIntensity}
              onChange={e => setShockIntensity(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0.5x (Mild weather perturbation)</span>
              <span>1.5x (Chokepoint blockage)</span>
              <span>2.5x (Catastrophic multi-point shock)</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Cascade Path */}
      {activeTab === 'cascade_path' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl border border-red-500/40 bg-red-950/20 text-xs text-red-300">
            <span className="font-bold">Critical Disruption Vector: </span>
            A 42-hour maritime queue at Singapore ripples into Taiwan semiconductor export delays and halts central Texas robotic manufacturing line within 9.4 days.
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {simState.highestRiskPath.map((nodeId, idx) => {
              const node = nodes.find(n => n.id === nodeId);
              return (
                <React.Fragment key={nodeId}>
                  <div
                    onClick={() => node && onSelectNode(node)}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-700 hover:border-cyan-400 text-xs font-mono cursor-pointer transition-all flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <div>
                      <div className="font-bold text-slate-100">{node?.name || nodeId}</div>
                      <div className="text-[10px] text-slate-400">{node?.country} • Risk {node?.currentRisk}%</div>
                    </div>
                  </div>
                  {idx < simState.highestRiskPath.length - 1 && (
                    <ArrowUpRight className="w-4 h-4 text-cyan-400 shrink-0 rotate-45" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

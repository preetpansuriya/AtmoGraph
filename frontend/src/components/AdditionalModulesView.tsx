import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Boxes,
  TrendingUp,
  Grid,
  Bot,
  Terminal,
  FileText,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Check,
  RefreshCw,
  Database
} from 'lucide-react';
import { GraphNode, GraphEdge } from '../types/models';

interface AdditionalModulesViewProps {
  activeModule: string;
  isDark: boolean;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode: (nodeId: string) => void;
}

export const AdditionalModulesView: React.FC<AdditionalModulesViewProps> = ({
  activeModule,
  isDark,
  nodes,
  edges,
  onSelectNode,
}) => {
  const [cypherQuery, setCypherQuery] = useState<string>(
    "MATCH (source:SupplyNode)-[r:SUPPLY_CORRIDOR]->(target:SupplyNode)\nWHERE r.activeShockwave = true\nRETURN source.name, r.chokepoint, target.name, r.shockDelayDays\nORDER BY r.shockDelayDays DESC;"
  );
  const [queryExecuted, setQueryExecuted] = useState<boolean>(false);
  const [mitigationPlanActive, setMitigationPlanActive] = useState<boolean>(false);
  const [botCount, setBotCount] = useState<number>(4);

  // 1. GMRID Dataset View
  if (activeModule === 'gmrid') {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-orbitron font-bold text-slate-100 uppercase">
              GMRID Global Supply Chain Dataset Benchmark
            </h2>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            18 Nodes • 26 Corridors
          </span>
        </div>

        <p className="text-slate-400">
          GMRID (Global Multi-tier Risk & Interdependency Dataset) contains normalized topology for semiconductor, automotive, and clean energy supply chains.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Node ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Tier</th>
                <th className="p-3">Country</th>
                <th className="p-3">Buffer Days</th>
                <th className="p-3">Financial Exposure</th>
                <th className="p-3">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {nodes.map(n => (
                <tr key={n.id} className="hover:bg-slate-900/60 cursor-pointer" onClick={() => onSelectNode(n.id)}>
                  <td className="p-3 font-bold text-cyan-400">{n.id}</td>
                  <td className="p-3 text-slate-200 font-semibold">{n.name}</td>
                  <td className="p-3 text-slate-400 capitalize">{n.type.replace('_', ' ')}</td>
                  <td className="p-3 text-slate-300">Tier {n.tier}</td>
                  <td className="p-3 text-slate-300">{n.country}</td>
                  <td className="p-3 text-slate-300">{n.bufferStockDays}d</td>
                  <td className="p-3 text-amber-300">${n.revenueExposureUsdM}M</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      n.riskLevel === 'critical' ? 'bg-red-500/20 text-red-400' :
                      n.riskLevel === 'high' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {n.currentRisk}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 2. BOM Cascade View
  if (activeModule === 'bom_cascade') {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-orbitron font-bold text-slate-100 uppercase">
              BOM Dependency Tree & Value Cascade
            </h2>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            ASML ➔ TSMC ➔ Foxconn ➔ End OEM
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-[10px] text-cyan-400 font-bold uppercase">Tier 3 (Equipment/Chemicals)</span>
            <h3 className="text-sm font-bold text-slate-100 mt-1">ASML EUV Lithography</h3>
            <p className="text-slate-400 text-xs mt-2">Provides 100% of 3nm High-NA lithography scanners to TSMC.</p>
            <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              Single-point vulnerability: 94%
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/40 shadow-lg shadow-cyan-950/20">
            <span className="text-[10px] text-emerald-400 font-bold uppercase">Tier 2 (Wafer Fabrication)</span>
            <h3 className="text-sm font-bold text-slate-100 mt-1">TSMC GigaFab 18</h3>
            <p className="text-slate-400 text-xs mt-2">Fabricates 90% of global advanced computing AI accelerators.</p>
            <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] text-red-400 font-bold">
              Chokepoint Stress: High
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-[10px] text-amber-400 font-bold uppercase">Tier 1 (Sub-assembly)</span>
            <h3 className="text-sm font-bold text-slate-100 mt-1">Foxconn Complex</h3>
            <p className="text-slate-400 text-xs mt-2">Integrates substrates, memory, power ICs into finished server racks.</p>
            <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              Downstream Lag: +14d
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-[10px] text-purple-400 font-bold uppercase">OEM Consumer</span>
            <h3 className="text-sm font-bold text-slate-100 mt-1">Tesla / BMW / Apple</h3>
            <p className="text-slate-400 text-xs mt-2">Final assembly lines subject to micro-component shortages.</p>
            <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] text-amber-400">
              Buffer Stock: 8 Days
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Bullwhip Effect View
  if (activeModule === 'bullwhip') {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-orbitron font-bold text-slate-100 uppercase">
              Bullwhip Effect & Order Variance Distortion
            </h2>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Variance Multiplier: 4.8X
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 uppercase text-[10px]">End Customer Demand Fluctuation</span>
            <div className="text-2xl font-bold text-slate-100 mt-1">± 5%</div>
            <p className="text-slate-400 text-xs mt-2">Retail consumer variance in automotive / AI server deployments.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 uppercase text-[10px]">Tier 1 Assembly Order Distortion</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">± 18%</div>
            <p className="text-slate-400 text-xs mt-2">Safety stock inflation applied at sub-assembly facilities.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 uppercase text-[10px]">Raw Material / Foundry Variance</span>
            <div className="text-2xl font-bold text-red-400 mt-1">± 48%</div>
            <p className="text-slate-400 text-xs mt-2">Extreme phantom demand amplification at ingot & chemical source nodes.</p>
          </div>
        </div>
      </div>
    );
  }

  // 4. Cypher Neo4j Engine View
  if (activeModule === 'cypher') {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-orbitron font-bold text-slate-100 uppercase">
              Neo4j Cypher Graph Query Console
            </h2>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Bolt 7687 • Live Engine
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-slate-400 text-[11px]">Cypher Query Input:</label>
          <textarea
            value={cypherQuery}
            onChange={(e) => setCypherQuery(e.target.value)}
            rows={4}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs focus:outline-none focus:border-emerald-500/50"
          />
          <button
            onClick={() => {
              setQueryExecuted(true);
              setTimeout(() => setQueryExecuted(false), 2000);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-all"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Execute Cypher Query</span>
          </button>
        </div>

        {/* Results */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-850">
            <span>Query Results (7 Records Returned):</span>
            <span className="text-emerald-400">Execution time: 3.2ms</span>
          </div>

          <div className="space-y-1 text-slate-300 text-[11px]">
            <div className="p-2 rounded bg-slate-900/60 font-mono">
              {"(TSMC GigaFab 18) -[:MARITIME_LANE {chokepoint: 'Taiwan Strait', delay: 14d}]-> (Port of LA)"}
            </div>
            <div className="p-2 rounded bg-slate-900/60 font-mono">
              {"(Port of Singapore) -[:MARITIME_LANE {chokepoint: 'Suez/Red Sea', delay: 21d}]-> (Port of Rotterdam)"}
            </div>
            <div className="p-2 rounded bg-slate-900/60 font-mono">
              {"(Albemarle Lithium) -[:MARITIME_LANE {chokepoint: 'Panama Canal', delay: 8d}]-> (Port of Rotterdam)"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. AI Mitigation & Procurement Bots
  if (activeModule === 'mitigation' || activeModule === 'procurement') {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-orbitron font-bold text-slate-100 uppercase">
              Autonomous AI Mitigation & Multi-Agent Procurement
            </h2>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            4 Active Agent Swarms
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-cyan-300">Agent Alpha: Cape Reroute Optimizer</h3>
            <p className="text-slate-400">
              Autonomous bidding for bulk container slots on alternative Cape of Good Hope routes with priority bunker refueling at Port Louis.
            </p>
            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
              Status: Active • 14 Shipments Re-routed
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-amber-300">Agent Beta: Dual-Source Spot Hedger</h3>
            <p className="text-slate-400">
              Hedging 150,000 wafer starts across secondary fabrication fabs in Arizona and Dresden to buffer against Taiwan Strait bottlenecks.
            </p>
            <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-300">
              Status: Negotiating Spot Contracts (82% complete)
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. Default / Executive Briefing
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 font-mono text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-orbitron font-bold text-slate-100 uppercase">
            C-Suite Executive Briefing & Resilience Matrix
          </h2>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          Executive Summary
        </span>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-100">
          Strategic Risk Summary: Global Supply Shockwaves
        </h3>
        <p className="text-slate-300 leading-relaxed">
          The GNN Neural Twin has identified critical structural vulnerabilities along two primary corridors: the Strait of Malacca / Red Sea maritime vector and the Taiwan Strait semiconductor fabrication artery. Current aggregate threat index sits at 56%, with a maximum lead delay shift of +21 days.
        </p>
        <div className="pt-3 border-t border-slate-800 flex items-center gap-4 text-[11px]">
          <span className="text-slate-400">Recommended Action:</span>
          <span className="text-emerald-400 font-bold">Deploy Dual-Sourcing Protocol (Protocol 4-B)</span>
        </div>
      </div>
    </div>
  );
};

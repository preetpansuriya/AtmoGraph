import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  Zap,
  Activity,
  Copy,
  Check,
  Radio,
  Clock,
  Ship,
  AlertTriangle,
  Flame,
  Globe,
  Layers,
  ArrowRight,
  Terminal,
  Cpu,
  Sparkles,
  RefreshCw,
  Server,
  Play
} from 'lucide-react';
import { GraphNode, GraphEdge, AisVessel, AisPort } from '../types/models';

interface MissionControlViewProps {
  isDark: boolean;
  nodes: GraphNode[];
  edges: GraphEdge[];
  vessels: AisVessel[];
  ports: AisPort[];
  onNavigateTab: (tabId: string) => void;
  onInjectShockScenario: (scenarioTitle: string, epicentreId: string, shockMagnitude: number) => void;
  onApplyMitigation: () => void;
  horizon: string;
}

export const MissionControlView: React.FC<MissionControlViewProps> = ({
  isDark,
  nodes,
  edges,
  vessels,
  ports,
  onNavigateTab,
  onInjectShockScenario,
  onApplyMitigation,
  horizon,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [mitigationApplied, setMitigationApplied] = useState<boolean>(false);
  const [activeShockId, setActiveShockId] = useState<string | null>(null);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleMitigationClick = () => {
    setMitigationApplied(true);
    onApplyMitigation();
    setTimeout(() => setMitigationApplied(false), 3000);
  };

  const shockScenarios = [
    {
      id: 'shock-redsea',
      type: 'CRITICAL SHOCK',
      typeColor: 'bg-red-500/20 text-red-400 border-red-500/40',
      duration: '+28d Duration',
      title: 'Red Sea & Bab-el-Mandeb Chokepoint Blockade',
      description: 'Missile strikes and maritime blockades force Cape of Good Hope rerouting (+14d maritime).',
      epicentre: 'PORT_ROT',
      epicentreNodeId: 'NODE-PORT-ROT-06',
      shockMagnitude: 85,
    },
    {
      id: 'shock-taiwan',
      type: 'CRITICAL SHOCK',
      typeColor: 'bg-red-500/20 text-red-400 border-red-500/40',
      duration: '+35d Duration',
      title: 'Taiwan Strait Maritime & Air Exclusion Zone',
      description: 'Naval drills halt 60% of global advanced node silicon wafers from TSMC GigaFab 18.',
      epicentre: 'PORT_KHH',
      epicentreNodeId: 'NODE-TSMC-01',
      shockMagnitude: 95,
    },
    {
      id: 'shock-rotterdam',
      type: 'HIGH SHOCK',
      typeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      duration: '+14d Duration',
      title: 'Port of Rotterdam & Rhine Logistics Outage',
      description: 'Severe low water levels and labor strikes halt ASML lithography & chemical shipments.',
      epicentre: 'PORT_RTM',
      epicentreNodeId: 'NODE-PORT-ROT-06',
      shockMagnitude: 70,
    },
    {
      id: 'shock-dresden',
      type: 'HIGH SHOCK',
      typeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      duration: '+21d Duration',
      title: 'Dresden Power Substation Cyber Blackout',
      description: 'Automotive microcontrollers line halted, triggering downstream assembly stalls at BMW & Bosch.',
      epicentre: 'MFG_INFINEON',
      epicentreNodeId: 'NODE-INFINEON-11',
      shockMagnitude: 75,
    },
  ];

  const eventLogs = [
    {
      type: 'INFO',
      subsystem: 'AIS_SATELLITE',
      message: 'AIS Feed Stream synchronized with 4 global container vessels.',
      time: '10:24:16 AM',
    },
    {
      type: 'INFO',
      subsystem: 'LOCAL_ENGINE',
      message: 'FastAPI not detected on :8000. Running Embedded Client Neural Twin.',
      time: '10:24:16 AM',
    },
    {
      type: 'INFO',
      subsystem: 'GNN_GATV2',
      message: 'Attention weight propagation computed across 18 multi-tier nodes and 26 supply corridors.',
      time: '10:24:15 AM',
    },
    {
      type: 'INFO',
      subsystem: 'AIS_SATELLITE',
      message: 'EVER APEX (IMO: 9811000) reporting 46hr queuing delay at Singapore Strait.',
      time: '10:24:14 AM',
    },
    {
      type: 'INFO',
      subsystem: 'LOCAL_ENGINE',
      message: 'Dual-engine failover active: Client WebGL Shader Engine online (60 FPS).',
      time: '10:24:12 AM',
    },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-7xl mx-auto font-sans">
      {/* 1. TOP BANNER: MISSION CONTROL COMMAND CENTER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`p-5 rounded-2xl border backdrop-blur-xl relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-cyan-950/40 border-cyan-500/30 shadow-xl shadow-cyan-950/20'
            : 'bg-white border-slate-200 shadow-lg'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 shrink-0">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-orbitron font-extrabold text-base sm:text-lg tracking-wider text-slate-100 uppercase">
                  MISSION CONTROL COMMAND CENTER
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                  DEFCON 2
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Autonomous Global Supply Chain Neural Digital Twin • 18 Hubs • GMRID Benchmark Topology
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateTab('gnn_diffusion')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Diagnostics</span>
            </button>

            <button
              onClick={handleMitigationClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold text-white transition-all cursor-pointer shadow-lg active:scale-95 ${
                mitigationApplied
                  ? 'bg-emerald-600 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/20'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${mitigationApplied ? 'animate-spin' : ''}`} />
              <span>{mitigationApplied ? 'Mitigation Active!' : 'Apply Global Mitigation'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. FOUR MAIN HERO METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Network Threat Index */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-900/70 border-slate-800/80 shadow-md' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Network Threat Index
            </span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-orbitron font-extrabold text-red-400">56%</span>
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">AGGREGATE</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-red-500 h-1.5 rounded-full w-[56%]" />
          </div>
        </motion.div>

        {/* Metric 2: Critical Chokepoints */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-900/70 border-slate-800/80 shadow-md' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Critical Chokepoints</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-orbitron font-extrabold text-amber-400">3</span>
            <span className="text-xs font-mono text-slate-400">/ 18 Hubs Disrupted</span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-2">12 hubs at elevated stress</p>
        </motion.div>

        {/* Metric 3: Max Lead Delay */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-900/70 border-slate-800/80 shadow-md' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Max Lead Delay</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-orbitron font-extrabold text-cyan-400">+21</span>
            <span className="text-xs font-mono text-slate-400">Days</span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-2">Horizon: {horizon}</p>
        </motion.div>

        {/* Metric 4: AIS Maritime Vessels */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-900/70 border-slate-800/80 shadow-md' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>AIS Maritime Vessels</span>
            <Ship className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-orbitron font-extrabold text-blue-400">4</span>
            <span className="text-xs font-mono text-slate-400">Tracked</span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-2">2 Rerouted via Cape of Good Hope</p>
        </motion.div>
      </div>

      {/* 3. SUBSYSTEM TELEMETRY MATRIX */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className={`p-4 rounded-2xl border ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Subsystem Telemetry Matrix</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            CLIENT TWIN
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 py-3 text-xs font-mono">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              PyTorch GNN Diffusion
            </span>
            <span className="text-cyan-400 font-bold">42ms Latency</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Neo4j Graph Topology
            </span>
            <span className="text-cyan-400 font-bold">18 Nodes / 26 Edges</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              AIS Maritime Satellite
            </span>
            <span className="text-cyan-400 font-bold">4 Vessels Real-Time</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              NLP News Extractor
            </span>
            <span className="text-emerald-400 font-bold">Listening</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
          <span>Runtime: Node.js + Vite + WebGL</span>
          <span className="text-emerald-400 font-bold">100% OPERATIONAL</span>
        </div>
      </motion.div>

      {/* 4. RAPID SHOCKWAVE INJECTION LAB */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-orbitron font-bold text-slate-100">
              Rapid Shockwave Injection Lab
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Inject global geopolitical or logistical shocks into the neural twin
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {shockScenarios.map((scenario) => {
            const isInjecting = activeShockId === scenario.id;
            return (
              <motion.div
                key={scenario.id}
                whileHover={{ scale: 1.01 }}
                className={`p-4 rounded-2xl border transition-all ${
                  isDark
                    ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${scenario.typeColor}`}>
                    {scenario.type}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/60 px-2 py-0.5 rounded">
                    {scenario.duration}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-100 mb-1.5">
                  {scenario.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {scenario.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-mono text-slate-400">
                    Epicentre: <span className="text-slate-200 font-bold">{scenario.epicentre}</span>
                  </span>

                  <button
                    onClick={() => {
                      setActiveShockId(scenario.id);
                      onInjectShockScenario(scenario.title, scenario.epicentreNodeId, scenario.shockMagnitude);
                      setTimeout(() => setActiveShockId(null), 1500);
                    }}
                    disabled={isInjecting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-white bg-red-600 hover:bg-red-500 border border-red-500/50 shadow-md shadow-red-600/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Play className={`w-3 h-3 ${isInjecting ? 'animate-spin' : ''}`} />
                    <span>{isInjecting ? 'Simulating...' : 'Inject Shock'}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 5. LOCAL LAPTOP EXECUTION DIAGNOSTICS */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className={`p-5 rounded-2xl border ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>&gt;_ Local Laptop Execution Diagnostics</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            1-Click Ready
          </span>
        </div>

        <p className="text-xs font-mono text-slate-400 mt-3 mb-3">
          Jab aap is project zip ko apne laptop par extract karein, aap ise turant run kar sakte hain:
        </p>

        <div className="space-y-2.5 font-mono text-xs">
          {/* Step 1 */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-slate-400 text-[11px]">1. Run Frontend (Zero-config, works on all laptops):</span>
              <code className="text-cyan-300 font-bold mt-0.5">npm install && npm run dev</code>
            </div>
            <button
              onClick={() => copyToClipboard('npm install && npm run dev', 1)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Copy Command"
            >
              {copiedIndex === 1 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Step 2 */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-slate-400 text-[11px]">2. (Optional) Run Python FastAPI Backend:</span>
              <code className="text-cyan-300 font-bold mt-0.5">pip install -r backend/requirements.txt && python backend/main.py</code>
            </div>
            <button
              onClick={() => copyToClipboard('pip install -r backend/requirements.txt && python backend/main.py', 2)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Copy Command"
            >
              {copiedIndex === 2 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Step 3 */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-slate-400 text-[11px]">3. Windows One-Click Batch Script:</span>
              <code className="text-emerald-400 font-bold mt-0.5">Double-click run_local.bat</code>
            </div>
          </div>
        </div>

        <div className="mt-3 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-[11px] font-mono text-cyan-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>Frontend includes a complete offline high-fidelity GNN engine, so it runs seamlessly even without Python installed!</span>
        </div>
      </motion.div>

      {/* 6. LIVE INCIDENT STREAM & EVENT BUS */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
        className={`p-5 rounded-2xl border ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Live Incident Stream & Event Bus</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {eventLogs.length} Events
          </span>
        </div>

        <div className="space-y-2 mt-3 font-mono text-xs">
          {eventLogs.map((log, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {log.type}
                </span>
                <span className="text-[11px] font-bold text-slate-300">
                  {log.subsystem}:
                </span>
                <span className="text-slate-400 text-xs">
                  {log.message}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">
                {log.time}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Footer Links */}
        <div className="flex flex-wrap items-center justify-between pt-4 mt-4 border-t border-slate-800 text-xs font-mono">
          <button
            onClick={() => onNavigateTab('globe')}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 cursor-pointer font-bold"
          >
            <span>Open 3D Globe Twin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onNavigateTab('topology')}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 cursor-pointer font-bold"
          >
            <span>Inspect BOM Cascade & Topology</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

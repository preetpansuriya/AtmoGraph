import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraphNode,
  GraphEdge,
  AisVessel,
  AisPort,
  NlpNewsArticle,
  GnnSimulationState
} from '../types/models';
import {
  AtmoGraphService,
  initialNodes,
  initialEdges,
  initialVessels,
  initialPorts,
  initialNewsArticles,
  initialSimState
} from '../services/api';
import { socketService } from '../services/websocket';
import { NetworkGraph } from './NetworkGraph';
import { AisMaritimeView } from './AisMaritimeView';
import { RiskPanel } from './RiskPanel';
import { NewsPanel } from './NewsPanel';
import { TimelineSlider } from './TimelineSlider';
import { NodeDetails } from './NodeDetails';
import { MissionControlView } from './MissionControlView';
import { AdditionalModulesView } from './AdditionalModulesView';
import {
  Network,
  Globe,
  ShieldAlert,
  Newspaper,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  Sparkles,
  Zap,
  Activity,
  Layers,
  Cpu,
  Radio,
  RefreshCw,
  Home,
  Boxes,
  TrendingUp,
  Ship,
  Flame,
  AlertTriangle,
  Clock,
  Building,
  CheckCircle2,
  Sliders,
  Database,
  Bot,
  Terminal,
  FileText,
  Power
} from 'lucide-react';

interface DashboardProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onReturnToHero: () => void;
}

export type ActiveTab =
  | 'mission_control'
  | 'globe'
  | 'topology'
  | 'gmrid'
  | 'shockwave'
  | 'gnn_diffusion'
  | 'bom_cascade'
  | 'bullwhip'
  | 'sector_matrix'
  | 'mitigation'
  | 'procurement'
  | 'cypher'
  | 'briefing';

export const Dashboard: React.FC<DashboardProps> = ({
  isDark,
  onToggleTheme,
  onReturnToHero,
}) => {
  // Navigation & Layout State (Default to Mission Control as in reference image)
  const [activeTab, setActiveTab] = useState<ActiveTab>('mission_control');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Time horizon selector (NOW, +30D, +60D, +90D)
  const [horizon, setHorizon] = useState<'NOW (T+0)' | '+30D' | '+60D' | '+90D'>('NOW (T+0)');
  const [timelineDay, setTimelineDay] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Core Datasets State initialized with complete datasets immediately
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  const [edges, setEdges] = useState<GraphEdge[]>(initialEdges);
  const [vessels, setVessels] = useState<AisVessel[]>(initialVessels);
  const [ports, setPorts] = useState<AisPort[]>(initialPorts);
  const [newsArticles, setNewsArticles] = useState<NlpNewsArticle[]>(initialNewsArticles);
  const [simState, setSimState] = useState<GnnSimulationState | null>(initialSimState);

  // Selection & UI Filters
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(initialNodes[0] || null);
  const [selectedVessel, setSelectedVessel] = useState<AisVessel | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [isInferencing, setIsInferencing] = useState<boolean>(false);
  const [livePulse, setLivePulse] = useState<{ timestamp: string; activeNodeId: string; attentionPulse: number } | null>(null);

  // Initial Data Fetch & WebSocket Setup
  useEffect(() => {
    socketService.connect(
      () => vessels,
      () => nodes
    );

    const unsubVessels = socketService.subscribeVessels(updated => {
      setVessels(updated);
    });

    const unsubNews = socketService.subscribeNews(newArticle => {
      setNewsArticles(prev => [newArticle, ...prev]);
    });

    const unsubPulse = socketService.subscribeGnnPulse(pulse => {
      setLivePulse(pulse);
    });

    return () => {
      unsubVessels();
      unsubNews();
      unsubPulse();
      socketService.disconnect();
    };
  }, []);

  // Handle Horizon change
  useEffect(() => {
    let day = 0;
    if (horizon === '+30D') day = 4;
    else if (horizon === '+60D') day = 8;
    else if (horizon === '+90D') day = 14;
    setTimelineDay(day);
    handleApplyTimelineDay(day);
  }, [horizon]);

  // Timeline playback loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelineDay(prev => {
          const next = prev >= 14 ? 0 : prev + 1;
          handleApplyTimelineDay(next);
          return next;
        });
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isPlaying, nodes, edges]);

  const handleApplyTimelineDay = (day: number) => {
    const { updatedNodes, updatedEdges, resilience, financialLoss } = AtmoGraphService.calculateGnnPropagation(
      nodes,
      edges,
      day,
      1.0
    );
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    if (simState) {
      setSimState({
        ...simState,
        currentDay: day,
        overallNetworkResilience: resilience,
        estimatedFinancialLossUsdM: financialLoss,
        totalNodesAtRisk: updatedNodes.filter(n => n.riskLevel === 'high' || n.riskLevel === 'critical').length,
      });
    }
    if (selectedNode) {
      const refreshed = updatedNodes.find(n => n.id === selectedNode.id);
      if (refreshed) setSelectedNode(refreshed);
    }
  };

  const handleRunInference = (shockMultiplier: number = 1.0) => {
    setIsInferencing(true);
    setTimeout(() => {
      const { updatedNodes, updatedEdges, resilience, financialLoss } = AtmoGraphService.calculateGnnPropagation(
        nodes,
        edges,
        timelineDay,
        shockMultiplier
      );
      setNodes(updatedNodes);
      setEdges(updatedEdges);
      if (simState) {
        setSimState({
          ...simState,
          overallNetworkResilience: resilience,
          estimatedFinancialLossUsdM: financialLoss,
          totalNodesAtRisk: updatedNodes.filter(n => n.riskLevel === 'high' || n.riskLevel === 'critical').length,
        });
      }
      setIsInferencing(false);
    }, 600);
  };

  const handleInjectNews = (newArticle: NlpNewsArticle) => {
    setNewsArticles(prev => [newArticle, ...prev]);
    socketService.broadcastNews(newArticle);
    const targetId = newArticle.impactedNodeIds[0];
    if (targetId) {
      const updatedNodes = nodes.map(n => {
        if (n.id === targetId) {
          return {
            ...n,
            currentRisk: Math.min(99, n.currentRisk + 30),
            riskLevel: 'critical' as const,
            activeDisruptions: [newArticle.title, ...n.activeDisruptions],
          };
        }
        return n;
      });
      setNodes(updatedNodes);
      const target = updatedNodes.find(n => n.id === targetId);
      if (target) setSelectedNode(target);
      handleRunInference(1.4);
    }
  };

  const handleInjectShockScenario = (scenarioTitle: string, epicentreId: string, shockMagnitude: number) => {
    const newArticle: NlpNewsArticle = {
      id: `SHOCK-${Date.now()}`,
      title: scenarioTitle,
      source: 'Global Shock Lab',
      timestamp: 'Just now',
      snippet: `Simulated geopolitical / logistical shock wave active at node ${epicentreId}.`,
      sentiment: -0.92,
      riskCategory: 'geopolitical',
      riskSeverity: 'critical',
      confidence: 0.98,
      extractedEntities: {
        locations: [epicentreId],
        organizations: ['Maritime Command', 'Supply Network'],
        materials: ['Silicon Wafers', 'Sub-assemblies'],
        transportHubs: [epicentreId],
      },
      impactedNodeIds: [epicentreId],
      cypherQuery: `MATCH (n:SupplyNode {id: '${epicentreId}'}) SET n.risk = ${shockMagnitude};`,
    };
    handleInjectNews(newArticle);
  };

  const handleApplyMitigation = () => {
    const mitigatedNodes = nodes.map(n => ({
      ...n,
      currentRisk: Math.max(12, Math.round(n.currentRisk * 0.65)),
      riskLevel: (n.currentRisk > 70 ? 'medium' : 'low') as any,
    }));
    setNodes(mitigatedNodes);
    handleRunInference(0.7);
  };

  const handleSelectNodeById = (nodeId: string) => {
    const found = nodes.find(n => n.id === nodeId);
    if (found) {
      setSelectedNode(found);
      setActiveTab('topology');
    }
  };

  // Grouped Navigation Modules (Exact 13 modules from reference image)
  const navSections = [
    {
      title: 'COMMAND & CONTROL',
      items: [
        {
          id: 'mission_control' as ActiveTab,
          label: 'Mission Control',
          icon: <Sliders className="w-4 h-4" />,
          badge: 'LIVE',
          badgeColor: 'bg-cyan-500/20 text-cyan-300',
        },
      ],
    },
    {
      title: 'GEOSPATIAL & TWIN',
      items: [
        {
          id: 'globe' as ActiveTab,
          label: '3D Globe Twin',
          icon: <Globe className="w-4 h-4" />,
          badge: 'LIVE AIS',
          badgeColor: 'bg-blue-500/20 text-blue-300',
        },
        {
          id: 'topology' as ActiveTab,
          label: 'Graph Topology',
          icon: <Network className="w-4 h-4" />,
          badge: 'TIER 1-3',
          badgeColor: 'bg-emerald-500/20 text-emerald-300',
        },
      ],
    },
    {
      title: 'SIMULATION & SHOCKWAVE',
      items: [
        {
          id: 'gmrid' as ActiveTab,
          label: 'GMRID Dataset',
          icon: <Boxes className="w-4 h-4" />,
          badge: '18 HUBS',
          badgeColor: 'bg-indigo-500/20 text-indigo-300',
        },
        {
          id: 'shockwave' as ActiveTab,
          label: 'Shockwave Lab',
          icon: <Flame className="w-4 h-4" />,
          badge: 'GNN',
          badgeColor: 'bg-red-500/20 text-red-400',
        },
        {
          id: 'gnn_diffusion' as ActiveTab,
          label: 'GNN Diffusion',
          icon: <Zap className="w-4 h-4" />,
          badge: 'PYTORCH',
          badgeColor: 'bg-amber-500/20 text-amber-300',
        },
      ],
    },
    {
      title: 'MANUFACTURING IMPACT',
      items: [
        {
          id: 'bom_cascade' as ActiveTab,
          label: 'BOM Cascade',
          icon: <Layers className="w-4 h-4" />,
          badge: 'ASML/TSMC',
          badgeColor: 'bg-sky-500/20 text-sky-300',
        },
        {
          id: 'bullwhip' as ActiveTab,
          label: 'Bullwhip Effect',
          icon: <TrendingUp className="w-4 h-4" />,
          badge: '4.8X',
          badgeColor: 'bg-amber-500/20 text-amber-300',
        },
        {
          id: 'sector_matrix' as ActiveTab,
          label: 'Sector Matrix',
          icon: <Building className="w-4 h-4" />,
          badge: 'MATRIX',
          badgeColor: 'bg-purple-500/20 text-purple-300',
        },
      ],
    },
    {
      title: 'AUTONOMOUS AI & ARCHITECTURE',
      items: [
        {
          id: 'mitigation' as ActiveTab,
          label: 'AI Mitigation',
          icon: <Bot className="w-4 h-4" />,
          badge: 'AUTO-REROUTE',
          badgeColor: 'bg-teal-500/20 text-teal-300',
        },
        {
          id: 'procurement' as ActiveTab,
          label: 'Procurement Bots',
          icon: <Bot className="w-4 h-4" />,
          badge: 'MULTI-AGENT',
          badgeColor: 'bg-cyan-500/20 text-cyan-300',
        },
        {
          id: 'cypher' as ActiveTab,
          label: 'Cypher Engine',
          icon: <Terminal className="w-4 h-4" />,
          badge: 'NEO4J',
          badgeColor: 'bg-emerald-500/20 text-emerald-300',
        },
        {
          id: 'briefing' as ActiveTab,
          label: 'Executive Briefing',
          icon: <FileText className="w-4 h-4" />,
          badge: 'C-SUITE',
          badgeColor: 'bg-slate-500/20 text-slate-300',
        },
      ],
    },
  ];

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row relative overflow-x-hidden ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* 1. ENTERPRISE SIDEBAR NAVIGATION */}
      <motion.aside
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`hidden lg:flex flex-col fixed top-0 bottom-0 left-0 z-40 border-r backdrop-blur-2xl transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${
          isDark
            ? 'bg-slate-950/95 border-slate-800/80 shadow-2xl shadow-cyan-950/20'
            : 'bg-white/95 border-slate-200/90 shadow-xl'
        }`}
      >
        {/* Brand & Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5 overflow-hidden cursor-pointer" onClick={onReturnToHero}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 shrink-0 hover:scale-105 transition-transform">
              <Cpu className="w-4 h-4" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-orbitron font-extrabold text-xs tracking-wider bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">
                  ATMOGRAPH
                </span>
                <span className="text-[8px] font-mono text-slate-400 uppercase tracking-tight">
                  MISSION CONTROL TWIN
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Categorized Navigation Menu (13 Active Modules) */}
        <div className="flex-1 py-3 px-2.5 space-y-4 overflow-y-auto font-mono text-xs custom-scrollbar">
          <div className="flex items-center justify-between px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {!sidebarCollapsed && <span>OPERATIONAL MODULES</span>}
            {!sidebarCollapsed && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                13 Active
              </span>
            )}
          </div>

          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5">
                  {section.title}
                </div>
              )}
              {section.items.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold cursor-pointer relative group transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/10'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <div className={`shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'}`}>
                      {item.icon}
                    </div>

                    {!sidebarCollapsed && (
                      <div className="flex-1 flex items-center justify-between overflow-hidden">
                        <span className="truncate text-left text-[11px]">{item.label}</span>
                        {item.badge && (
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono uppercase font-bold border border-current/20 ${
                            item.badgeColor || 'bg-slate-800 text-slate-400'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/60 space-y-2">
          <button
            onClick={onToggleTheme}
            className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700' : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-mono font-medium">
              {isDark ? <Moon className="w-3.5 h-3.5 text-cyan-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              {!sidebarCollapsed && <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>}
            </div>
            {!sidebarCollapsed && (
              <div className={`w-8 h-4.5 rounded-full p-0.5 flex items-center ${
                isDark ? 'bg-cyan-500 justify-end' : 'bg-slate-300 justify-start'
              }`}>
                <div className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
              </div>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed inset-0 z-50 lg:hidden flex"
          >
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className={`relative w-72 h-full flex flex-col p-4 border-r overflow-y-auto ${
              isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="font-orbitron font-bold text-cyan-400">ATMOGRAPH TWIN</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 py-4 space-y-4 font-mono text-xs">
                {navSections.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-1">
                    <div className="text-[9px] font-bold text-slate-400 uppercase px-2">{section.title}</div>
                    {section.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl ${
                          activeTab === item.id
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        {item.badge && <span className="text-[8px] font-bold">{item.badge}</span>}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. RESPONSIVE MAIN CONTENT AREA */}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        {/* Top Header */}
        <header className={`sticky top-0 z-30 h-16 px-4 sm:px-6 flex items-center justify-between border-b backdrop-blur-xl transition-colors ${
          isDark ? 'bg-slate-950/85 border-slate-800/80' : 'bg-white/85 border-slate-200/80'
        }`}>
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-orbitron font-extrabold text-sm sm:text-base tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                  ATMOGRAPH
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  MISSION CONTROL TWIN
                </span>
              </div>
            </div>
          </div>

          {/* Time Horizon Selector (NOW, +30D, +60D, +90D) & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono">
              <span className="text-slate-400 px-1 hidden md:inline text-[10px]">Horizon:</span>
              {(['NOW (T+0)', '+30D', '+60D', '+90D'] as const).map(h => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    horizon === h
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>

            {/* Quick Trigger Shock Button */}
            <button
              onClick={() => handleInjectShockScenario('Red Sea Bab-el-Mandeb Blockade', 'NODE-PORT-ROT-06', 85)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-md shadow-red-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Inject Shock</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Power / Return to Hero */}
            <button
              onClick={onReturnToHero}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Return to Hero Screen"
            >
              <Power className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        </header>

        {/* Dynamic Viewport */}
        <div className="flex-1 pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {/* 1. MISSION CONTROL COMMAND CENTER (DEFAULT SCREEN) */}
              {activeTab === 'mission_control' && (
                <MissionControlView
                  isDark={isDark}
                  nodes={nodes}
                  edges={edges}
                  vessels={vessels}
                  ports={ports}
                  onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
                  onInjectShockScenario={handleInjectShockScenario}
                  onApplyMitigation={handleApplyMitigation}
                  horizon={horizon}
                />
              )}

              {/* 2. 3D GLOBAL SUPPLY NETWORK TOPOLOGY */}
              {activeTab === 'topology' && (
                <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto font-sans">
                  <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}>
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search fab, port, hub, country..."
                        value={searchFilter}
                        onChange={e => setSearchFilter(e.target.value)}
                        className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                          isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto font-mono text-xs">
                      <span className="text-slate-400">Tier Filter:</span>
                      {(['all', '1', '2', '3', '0'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setTierFilter(t)}
                          className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                            tierFilter === t
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {t === 'all' ? 'All' : t === '0' ? 'Hubs/Ports' : `T${t}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl relative">
                    <NetworkGraph
                      nodes={nodes.filter(n => {
                        const matchesSearch = !searchFilter || n.name.toLowerCase().includes(searchFilter.toLowerCase()) || n.country.toLowerCase().includes(searchFilter.toLowerCase());
                        const matchesTier = tierFilter === 'all' || String(n.tier) === tierFilter;
                        return matchesSearch && matchesTier;
                      })}
                      edges={edges}
                      selectedNode={selectedNode}
                      onSelectNode={setSelectedNode}
                      isDark={isDark}
                      activeTimelineDay={timelineDay}
                    />
                  </div>

                  {selectedNode && (
                    <NodeDetails
                      node={selectedNode}
                      edges={edges}
                      allNodes={nodes}
                      onClose={() => setSelectedNode(null)}
                      onSelectNode={setSelectedNode}
                      isDark={isDark}
                    />
                  )}
                </div>
              )}

              {/* 3. AIS MARITIME GLOBE */}
              {activeTab === 'globe' && (
                <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                  <AisMaritimeView
                    vessels={vessels}
                    ports={ports}
                    selectedVessel={selectedVessel}
                    onSelectVessel={setSelectedVessel}
                    isDark={isDark}
                  />
                </div>
              )}

              {/* 4. GNN SHOCKWAVE / RISK PANEL */}
              {activeTab === 'shockwave' && simState && (
                <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                  <RiskPanel
                    nodes={nodes}
                    edges={edges}
                    simState={simState}
                    onTriggerSimulation={handleRunInference}
                    onSelectNode={n => {
                      setSelectedNode(n);
                      setActiveTab('topology');
                    }}
                    isDark={isDark}
                  />
                </div>
              )}

              {/* 5. GNN DIFFUSION / NLP NEWS WIRE */}
              {activeTab === 'gnn_diffusion' && (
                <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                  <NewsPanel
                    articles={newsArticles}
                    nodes={nodes}
                    onInjectNews={handleInjectNews}
                    onSelectNodeById={handleSelectNodeById}
                    isDark={isDark}
                  />
                </div>
              )}

              {/* 6. ADDITIONAL MODULES (GMRID, BOM CASCADE, BULLWHIP, SECTOR MATRIX, AI MITIGATION, CYPHER, BRIEFING) */}
              {[
                'gmrid',
                'bom_cascade',
                'bullwhip',
                'sector_matrix',
                'mitigation',
                'procurement',
                'cypher',
                'briefing'
              ].includes(activeTab) && (
                <AdditionalModulesView
                  activeModule={activeTab}
                  isDark={isDark}
                  nodes={nodes}
                  edges={edges}
                  onSelectNode={handleSelectNodeById}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3. FLOATING BOTTOM TIMELINE CONTROLLER */}
        <div className={`fixed bottom-4 left-4 right-4 lg:left-68 z-30 max-w-5xl mx-auto transition-all ${
          sidebarCollapsed ? 'lg:left-24' : 'lg:left-68'
        }`}>
          <TimelineSlider
            currentDay={timelineDay}
            isPlaying={isPlaying}
            onChangeDay={day => {
              setTimelineDay(day);
              handleApplyTimelineDay(day);
            }}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onReset={() => {
              setTimelineDay(0);
              handleApplyTimelineDay(0);
              setIsPlaying(false);
            }}
            isDark={isDark}
          />
        </div>
      </main>
    </div>
  );
};

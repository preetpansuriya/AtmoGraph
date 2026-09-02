import React, { useState } from 'react';
import { NlpNewsArticle, GraphNode, RiskLevel, DisruptionCategory } from '../types/models';
import {
  Newspaper,
  Tag,
  MapPin,
  Building,
  Box,
  Terminal,
  Plus,
  Send,
  Radio,
  Zap,
  TrendingDown,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface NewsPanelProps {
  articles: NlpNewsArticle[];
  nodes: GraphNode[];
  onInjectNews: (article: NlpNewsArticle) => void;
  onSelectNodeById: (nodeId: string) => void;
  isDark: boolean;
}

export const NewsPanel: React.FC<NewsPanelProps> = ({
  articles,
  nodes,
  onInjectNews,
  onSelectNodeById,
  isDark,
}) => {
  const [showInjectModal, setShowInjectModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<DisruptionCategory>('port_congestion');
  const [newSeverity, setNewSeverity] = useState<RiskLevel>('high');
  const [selectedTargetNode, setSelectedTargetNode] = useState<string>(nodes[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'feed' | 'entities' | 'cypher'>('feed');

  const handleCreateSyntheticNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const targetNode = nodes.find(n => n.id === selectedTargetNode) || nodes[0];
    const generatedArticle: NlpNewsArticle = {
      id: `NEWS-${Date.now().toString().slice(-4)}`,
      title: newTitle,
      source: 'AtmoGraph NLP Live Stream',
      timestamp: 'Just now',
      snippet: `Automated NLP stream extracted disruption event in ${targetNode.region} (${targetNode.country}). Real-time GNN node attention recalculating.`,
      sentiment: newSeverity === 'critical' ? -0.88 : newSeverity === 'high' ? -0.65 : -0.35,
      riskCategory: newCategory,
      riskSeverity: newSeverity,
      confidence: 0.94,
      extractedEntities: {
        locations: [targetNode.region, targetNode.country],
        organizations: [targetNode.name, 'Maritime Freight Logistics'],
        materials: targetNode.products,
        transportHubs: [targetNode.code],
      },
      impactedNodeIds: [targetNode.id],
      cypherQuery: `MATCH (n {id: '${targetNode.id}'})
SET n.risk = '${newSeverity}', n.activeDisruptions = n.activeDisruptions + ['${newTitle.slice(0, 30)}...']
RETURN n;`,
    };

    onInjectNews(generatedArticle);
    setNewTitle('');
    setShowInjectModal(false);
  };

  return (
    <div className={`w-full rounded-2xl border p-5 transition-all space-y-6 ${
      isDark ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-slate-700/50">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold font-orbitron">NLP Disruption Intelligence & Entity Extractor</h3>
          </div>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Automated entity NER, sentiment shock analysis & Cypher graph synchronizer
          </p>
        </div>

        {/* Inject Synthetic News button */}
        <button
          onClick={() => setShowInjectModal(true)}
          id="btn-inject-disruption"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Inject Synthetic NLP Signal</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/60 gap-4">
        <button
          onClick={() => setActiveTab('feed')}
          className={`pb-2 text-xs font-bold font-mono transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'feed'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          LIVE DISRUPTION FEED ({articles.length})
        </button>

        <button
          onClick={() => setActiveTab('entities')}
          className={`pb-2 text-xs font-bold font-mono transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'entities'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          NER ENTITY TAXONOMY
        </button>

        <button
          onClick={() => setActiveTab('cypher')}
          className={`pb-2 text-xs font-bold font-mono transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'cypher'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          NEO4J CYPHER LOGS
        </button>
      </div>

      {/* Tab Content: News Feed */}
      {activeTab === 'feed' && (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 card-perspective">
          {articles.map(article => (
            <div
              key={article.id}
              className={`p-4 rounded-xl border space-y-3 card-tilt-hover ${
                isDark ? 'bg-slate-950/60 border-slate-800 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {article.source}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">• {article.timestamp}</span>
                </div>

                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                  article.riskSeverity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  article.riskSeverity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                  'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {article.riskCategory.replace('_', ' ')} • {article.riskSeverity}
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-100 leading-snug">{article.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{article.snippet}</p>

              {/* Extracted Entities Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mr-1">
                  <Tag className="w-3 h-3 text-cyan-400" /> Extracted:
                </span>
                {article.extractedEntities.locations.map(loc => (
                  <span key={loc} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-300 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" /> {loc}
                  </span>
                ))}
                {article.extractedEntities.organizations.map(org => (
                  <span key={org} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300 flex items-center gap-1">
                    <Building className="w-2.5 h-2.5" /> {org}
                  </span>
                ))}
                {article.extractedEntities.materials.map(mat => (
                  <span key={mat} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 flex items-center gap-1">
                    <Box className="w-2.5 h-2.5" /> {mat}
                  </span>
                ))}
              </div>

              {/* Impacted Supply Nodes */}
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Impacted Nodes:</span>
                  {article.impactedNodeIds.map(nId => {
                    const node = nodes.find(n => n.id === nId);
                    return (
                      <button
                        key={nId}
                        onClick={() => onSelectNodeById(nId)}
                        className="text-[11px] font-bold text-cyan-400 hover:underline cursor-pointer"
                      >
                        {node?.name || nId}
                      </button>
                    );
                  })}
                </div>
                <div className="text-slate-400">
                  NLP Confidence: <span className="text-emerald-400 font-bold">{(article.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Entities Taxonomy */}
      {activeTab === 'entities' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Named Entity Recognition (NER) pipeline automatically structures free-form shipping bulletins into graph relations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-xs font-mono text-sky-400 font-bold mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> LOCATIONS (GPE)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Singapore', 'Taiwan Strait', 'Kaohsiung', 'Los Angeles', 'Rotterdam', 'Salar de Atacama'].map(l => (
                  <span key={l} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                    {l}
                  </span>
                ))}
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-xs font-mono text-purple-400 font-bold mb-2 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" /> ENTERPRISES (ORG)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['TSMC', 'ASML', 'Foxconn', 'PSA Port', 'Albemarle', 'Maersk Line'].map(o => (
                  <span key={o} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                    {o}
                  </span>
                ))}
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-xs font-mono text-amber-400 font-bold mb-2 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5" /> COMMODITIES & MAT
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['3nm Wafers', 'EUV Litho', 'Lithium Carbonate', 'DDR5 Memory', 'LFP Cells'].map(m => (
                  <span key={m} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-xs font-mono text-emerald-400 font-bold mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> DISRUPTION TYPES
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Port Congestion', 'Extreme Weather', 'Chasis Shortage', 'Brine Audit'].map(d => (
                  <span key={d} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Neo4j Cypher */}
      {activeTab === 'cypher' && (
        <div className="space-y-3">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
            <div className="text-slate-500 mb-2">// Automated Cypher Graph Sync for AtmoGraph Neo4j Database</div>
            {articles.map((a, i) => (
              <div key={a.id} className="mb-3 border-b border-slate-800/80 pb-2">
                <span className="text-slate-400"># Signal {i + 1} ({a.source}):</span>
                <pre className="text-emerald-300 mt-1 whitespace-pre-wrap">{a.cypherQuery}</pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Synthetic Disruption Injection Modal */}
      {showInjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="flex justify-between items-center border-b pb-3 border-slate-700">
              <h4 className="font-bold text-base font-orbitron flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Inject Synthetic NLP Disruption Event
              </h4>
              <button
                onClick={() => setShowInjectModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSyntheticNews} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Incident Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Severe Typhoon Warning Closes Kaohsiung Shipping Feeder Lines..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Disruption Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as DisruptionCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="port_congestion">Port Congestion</option>
                    <option value="extreme_weather">Extreme Weather</option>
                    <option value="chokepoint_blockage">Chokepoint Blockage</option>
                    <option value="raw_material_shortage">Raw Material Shortage</option>
                    <option value="labor_strike">Labor Strike</option>
                    <option value="cyber_incident">Cyber Incident</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Impact Severity</label>
                  <select
                    value={newSeverity}
                    onChange={e => setNewSeverity(e.target.value as RiskLevel)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="critical">Critical (Catastrophic)</option>
                    <option value="high">High (Major Delay)</option>
                    <option value="medium">Medium (Moderate Friction)</option>
                    <option value="low">Low (Monitored)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Target Supply Chain Facility</label>
                <select
                  value={selectedTargetNode}
                  onChange={e => setSelectedTargetNode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.country} - {n.type.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowInjectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md cursor-pointer"
                >
                  Publish & Recalculate GNN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

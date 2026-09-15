# 🌐 Atmo-graph

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0.0-blue.svg)
![React](https://img.shields.io/badge/react-18.2.0-cyan.svg)

> **Advanced Supply Chain Network Visualization Platform**  
> Powered by Graph Neural Networks (GNN), Natural Language Processing (NLP), and Interactive D3.js Visualizations

---

## 🚀 Overview

Atmo-graph is a cutting-edge supply chain intelligence platform that transforms complex network data into actionable insights through advanced visualization and machine learning technologies. Built with React, TypeScript, and state-of-the-art graph algorithms, it provides real-time analytics, predictive modeling, and collaborative decision-making capabilities for modern supply chain management.

### 🎯 Key Capabilities

- **🔮 Predictive Analytics** - GNN-powered forecasting and anomaly detection
- **🧠 Intelligent Processing** - NLP-based news analysis and sentiment extraction  
- **📊 Interactive Visualization** - Real-time D3.js network graphs with zoom, pan, and filtering
- **⏱️ Temporal Analysis** - Timeline-based exploration of network evolution
- **🎯 Executive Dashboards** - Comprehensive KPIs and performance metrics
- **🔍 Advanced Querying** - Neo4j Cypher console for graph database operations

---

## ✨ Features

### 🌐 Interactive Network Graph
- **D3.js-powered visualization** with force-directed layouts
- **Real-time interaction** - zoom, pan, drag, and click-to-inspect
- **Dynamic color coding** based on node categories and risk levels
- **Performance optimized** rendering for large-scale networks
- **Responsive design** adapting to different screen sizes

### 🧠 Smart Intelligence Panel
- **Real-time metrics** - Network health, risk scores, efficiency indicators
- **GNN predictions** - ML-powered forecasting with confidence scores
- **Alert system** - Automated disruption detection and notifications
- **Quick actions** - One-click analysis and report generation

### ⏱️ Timeline Analysis
- **Temporal exploration** - Track network changes over time
- **Playback controls** - Play, pause, and adjust playback speed
- **Visual indicators** - Color-coded stability, warning, and critical states
- **Data comparison** - Compare network states across different time periods

### 🌊 Cascade Path Viewer
- **Ripple effect visualization** - Track impact propagation through networks
- **Real-time event tracking** - Monitor disruptions and recovery patterns
- **Impact quantification** - Measure affected nodes and severity levels
- **Historical analysis** - Review past cascade events and outcomes

### 📰 News Ingestion & NLP
- **Natural language processing** - Extract insights from news articles
- **Sentiment analysis** - Classify supply chain impact (positive/negative/neutral)
- **Entity recognition** - Identify organizations, locations, and products
- **Automated categorization** - Classify events by type and severity

### 📈 Executive Analytics Workbench
- **KPI dashboards** - Revenue, delivery rates, supplier performance
- **Trend analysis** - Visual performance charts and comparisons
- **Executive summaries** - AI-generated insights and recommendations
- **Export capabilities** - Generate comprehensive reports in multiple formats

### 🧪 GNN Integration
- **Multiple model support** - GCN, GAT, GraphSAGE architectures
- **Real-time predictions** - Node classification and link prediction
- **Model metrics** - Accuracy, precision, recall, F1 scores
- **Training dashboard** - Monitor model performance and convergence

### 🔍 Cypher Console
- **Neo4j query interface** - Execute Cypher graph queries
- **Sample queries** - Pre-built templates for common operations
- **Query history** - Track and reuse previous queries
- **Results visualization** - Tabular display of query results

---

## 🛠️ Technology Stack

### Frontend
- **React 18.2** - Modern UI framework with hooks
- **TypeScript 5.0** - Type-safe development
- **Vite 4.4** - Fast build tool and dev server
- **D3.js 7.8** - Data visualization library
- **Lucide React** - Modern icon library

### Data Processing
- **PapaParse** - CSV parsing and handling
- **Custom Algorithms** - Graph analytics and ML utilities

### Development Tools
- **ESLint** - Code quality and linting
- **TypeScript Compiler** - Static type checking
- **Vite HMR** - Hot module replacement for fast development

---

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 or **bun** >= 1.0.0
- **Git** (for version control)
- **Modern web browser** (Chrome, Firefox, Edge, Safari)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Atmo-graph
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using bun (faster alternative)
bun install
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Add API keys, database URLs, etc.
```

### 4. Start Development Server

```bash
# Start Vite dev server
npm run dev

# Application will be available at http://localhost:3000
```

### 5. Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
Atmo-graph/
├── 📄 Configuration Files
│   ├── package.json                 # Dependencies & scripts
│   ├── package-lock.json           # Dependency lock file
│   ├── tsconfig.json               # TypeScript configuration
│   ├── vite.config.ts             # Vite build configuration
│   ├── index.html                 # HTML entry point
│   ├── metadata.json              # Project metadata
│   ├── .env.example               # Environment variables template
│   └── README.md                  # Project documentation
│
├── 📁 public/                     # Static assets & CSV data
│   ├── GMRID_v3-train.csv        # Training dataset (8.2MB)
│   └── GMRID_v3-test.csv         # Test dataset (2.3MB)
│
├── 📁 src/                        # Source code
│   ├── 📄 Main Files
│   │   ├── main.tsx              # Application entry point
│   │   ├── App.tsx               # Main application component
│   │   └── index.css             # Global styles & animations
│   │
│   ├── 📁 components/            # React components
│   │   ├── Header.tsx                    # Top navigation header
│   │   ├── NavigationDrawer.tsx         # Left sidebar with filters
│   │   ├── NetworkGraph.tsx             # D3.js graph visualization
│   │   ├── SmartIntelligencePanel.tsx   # Right analytics panel
│   │   ├── TimelineSlider.tsx           # Time-based analysis slider
│   │   ├── CascadePathViewer.tsx        # Ripple effect visualization
│   │   ├── NewsIngestionBar.tsx         # NLP news input bar
│   │   ├── ExecutiveAnalyticsWorkbench.tsx  # Advanced analytics
│   │   ├── NodeInspectorModal.tsx       # Node detail modal
│   │   ├── GnnMetricsModal.tsx          # GNN model metrics
│   │   ├── CypherConsole.tsx            # Neo4j query console
│   │   └── ErrorBoundary.tsx            # Error handling component
│   │
│   ├── 📁 data/                  # Data processing
│   │   ├── csvDataConverter.ts  # CSV to graph data conversion
│   │   └── supplyChainData.ts   # Legacy supply chain data
│   │
│   ├── 📁 types/                 # TypeScript type definitions
│   │   └── graph.ts             # Graph-related interfaces
│   │
│   └── 📁 utils/                 # Utility functions
│       ├── csvLoader.ts         # CSV file loading & parsing
│       ├── gnnEngine.ts         # Graph Neural Network engine
│       ├── nlpPipeline.ts       # Natural Language Processing
│       ├── exportReport.ts      # CSV export functionality
│       └── advancedAnalytics.ts # Advanced analytics functions
│
└── 📁 node_modules/             # Installed dependencies
```

---

## 🎮 Usage Guide

### Basic Navigation

1. **Network Interaction**
   - **Click nodes** to view detailed information
   - **Drag nodes** to reposition in the graph
   - **Scroll** to zoom in/out
   - **Click and drag** on background to pan

2. **Timeline Analysis**
   - Use **play/pause** button for automatic timeline progression
   - **Drag slider** to manually navigate through time periods
   - **Adjust speed** control for faster/slower playback
   - Observe **color changes** indicating network state transitions

3. **Filtering & Search**
   - Use **left sidebar** to filter by region, category, risk level
   - **Search bar** to find specific nodes by name or ID
   - **Apply filters** to focus on relevant network segments

4. **News Analysis**
   - **Type or paste** news articles in the input bar
   - Press **Enter** or click **Analyze** for NLP processing
   - View **sentiment**, **entities**, and **summary** results
   - Track **analysis history** for reference

### Advanced Features

#### GNN Model Training
```typescript
// Access GNN engine programmatically
import { gnnEngine } from './utils/gnnEngine'

// Train a new model
const model = await gnnEngine.trainModel(graphData, 'GCN')

// Make predictions
const predictions = await gnnEngine.predict(graphData, 'gcn')
```

#### Custom Analytics
```typescript
// Run advanced network analysis
import { AdvancedAnalytics } from './utils/advancedAnalytics'

// Calculate graph metrics
const metrics = AdvancedAnalytics.calculateGraphMetrics(graphData)

// Assess network risks
const risks = AdvancedAnalytics.assessRisks(graphData)

// Detect anomalies
const anomalies = AdvancedAnalytics.detectAnomalies(graphData)
```

#### Data Export
```typescript
// Export analysis results
import { ReportExporter } from './utils/exportReport'

// Export to CSV
ReportExporter.exportToCSV(graphData, 'supply_chain.csv')

// Export to JSON
ReportExporter.exportToJSON(graphData, 'network_data.json')

// Generate analytics report
ReportExporter.exportAnalyticsReport(metrics, predictions, 'report.json')
```

---

## 📊 Data Format

### CSV Data Structure

The application expects CSV data with the following structure:

```csv
source_id,source_label,source_category,source_value,target_id,target_label,target_category,target_value,weight,edge_label
node_1,Supplier A,Manufacturing,15,node_2,Factory B,Logistics,20,3.5,steel_transport
node_3,Warehouse X,Services,12,node_4,Retailer Y,Technology,8,2.1,distribution
```

### Graph Data Schema

```typescript
interface Node {
  id: string           // Unique node identifier
  label?: string       // Display label
  category?: string    // Node category (Manufacturing, Logistics, etc.)
  value?: number       // Node size/importance value
  x?: number          // X coordinate (optional)
  y?: number          // Y coordinate (optional)
}

interface Edge {
  id: string          // Unique edge identifier
  source: string      // Source node ID
  target: string      // Target node ID
  weight?: number     // Edge weight/strength
  label?: string      // Edge label
}
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=30000

# Neo4j Configuration (optional)
VITE_NEO4J_URI=bolt://localhost:7687
VITE_NEO4J_USER=neo4j
VITE_NEO4J_PASSWORD=your_password

# GNN Model Configuration
VITE_GNN_MODEL_PATH=/models/gnn-model
VITE_GNN_BATCH_SIZE=32

# NLP Configuration
VITE_NLP_API_KEY=your_api_key
VITE_NLP_MODEL=gpt-4

# Application Settings
VITE_MAX_NODES=1000
VITE_MAX_EDGES=5000
VITE_ANIMATION_DURATION=500
```

### Vite Configuration

Customize build settings in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          d3: ['d3']
        }
      }
    }
  }
})
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue: Port 3000 already in use**
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port in vite.config.ts
```

**Issue: CSV loading fails**
- Verify CSV file format matches expected structure
- Check file permissions in `public/` directory
- Ensure file size is within limits (recommend < 50MB)

**Issue: Graph rendering slow**
- Reduce node count using `VITE_MAX_NODES` env variable
- Disable animations in settings
- Use browser developer tools to identify bottlenecks

**Issue: TypeScript compilation errors**
- Ensure all dependencies are installed: `npm install`
- Check TypeScript version compatibility
- Verify `tsconfig.json` configuration

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Use meaningful commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **D3.js** - Powerful data visualization library
- **React** - Modern UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next-generation build tool
- **Lucide** - Beautiful icon library

---

## 📞 Support & Contact

- **Issues**: Report bugs and feature requests on GitHub Issues
- **Discussions**: Join community discussions for questions and ideas
- **Email**: contact@atmo-graph.com
- **Documentation**: Full documentation available at docs.atmo-graph.com

---

## 🗺️ Roadmap

### Upcoming Features

- [ ] **Real-time collaboration** - Multi-user network editing
- [ ] **Mobile app** - Native iOS and Android applications
- [ ] **Cloud deployment** - AWS/Azure/GCP deployment templates
- [ ] **Advanced ML models** - Transformer-based GNN architectures
- [ ] **API integration** - REST and GraphQL API endpoints
- [ ] **Custom themes** - User-customizable color schemes and layouts
- [ ] **Plugin system** - Extensible architecture for custom components
## Frontend Architecture

The AtmoGraph frontend is built with React, TypeScript, and Vite.
The interface is organized into reusable components for network
visualization, analytics, node inspection, and supply-chain analysis.
## Network Visualization

AtmoGraph provides an interactive network visualization to represent
relationships between suppliers, manufacturers, logistics nodes, and
other connected supply-chain entities.
## Frontend Architecture

The AtmoGraph frontend is built with React, TypeScript, and Vite. The interface is organized into reusable components for network visualization, analytics, node inspection, and supply-chain analysis.
## Network Visualization

AtmoGraph provides an interactive network visualization to represent relationships between suppliers, manufacturers, logistics nodes, and other connected supply-chain entities.
## NLP Processing

The NLP pipeline processes disruption-related information and extracts relevant entities and events that can be used for supply-chain risk analysis.
## Graph Neural Network Analysis

The project includes a graph-based analysis workflow for evaluating relationships and potential ripple effects across the supply-chain network.
## Risk Analysis

AtmoGraph analyzes connected supply-chain entities to help identify potentially affected nodes and visualize the propagation of disruption.
## Analytics Dashboard

The analytics workspace provides an overview of network activity, risk indicators, disruption impact, and graph-based insights.
## Data Processing

CSV-based supply-chain datasets can be loaded, converted, validated, and transformed into structures used by the application's graph and analysis components.
## AtmoGraph Development Summary

AtmoGraph brings together supply-chain network visualization, AI-assisted analysis, graph processing, NLP workflows, and analytics into a unified interface for exploring disruption ripple effects.

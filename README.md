# 🌐 AtmoGraph

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)
![React](https://img.shields.io/badge/React-18.2-cyan.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![Vite](https://img.shields.io/badge/Vite-4.x-646CFF.svg)

**An interactive supply-chain network intelligence and ripple-effect analysis platform.**

AtmoGraph is a web application concept for exploring supply-chain relationships, examining disruption signals, and understanding how risks may propagate across connected suppliers, facilities, routes, and markets. It combines an interactive React interface with graph visualizations and data-processing utilities to make complex network information easier to explore.

> **Project status:** This repository contains the frontend application. Features that require a trained machine-learning model, a live news feed, or a connected Neo4j database need the relevant implementation and configuration before they can provide live production results.

## Contents

- [Highlights](#-highlights)
- [Technology stack](#-technology-stack)
- [Getting started](#-getting-started)
- [Available scripts](#-available-scripts)
- [Project structure](#-project-structure)
- [Working with supply-chain data](#-working-with-supply-chain-data)
- [Using the application](#-using-the-application)
- [Configuration notes](#-configuration-notes)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Highlights

### Interactive network exploration
- Explore supply-chain nodes and their relationships in a graph view.
- Inspect nodes and relationships, and use graph interactions supported by the interface.
- View network information with visual distinctions for categories or risk states where implemented.

### Supply-chain ripple-effect analysis
- Explore how a disruption affecting one part of a network could affect connected organizations or routes.
- Review cascade paths and impact information supported by the available application data.
- Use timeline-oriented views to examine changes when suitable historical data is provided.

### News and text analysis interface
- Submit supply-chain news or event text through the interface where supported.
- Explore extracted entities, sentiment, or event classifications when those processing utilities are available.
- Automated analysis quality depends on the implementation and models configured in the project.

### Analytics and reporting
- Review network indicators and charts available in the dashboard.
- Use supported export utilities to save analysis data.
- Explore graph metrics and risk indicators produced by the application's implemented utilities.

### Graph-learning direction
The project is designed around graph-based supply-chain analysis. Graph Neural Network (GNN) model training or inference should only be considered active when a real model, training pipeline, and prediction integration are present and configured. A visualization or sample score alone is not evidence of a trained model's predictive accuracy.

## 🛠️ Technology stack

| Area | Technologies |
|---|---|
| UI | React 18, TypeScript |
| Development server and build | Vite |
| Network visualization | D3.js |
| CSV parsing | PapaParse |
| Icons | Lucide React |
| Code quality | ESLint, TypeScript |

## 📋 Requirements

Install the following before running the project:

- [Node.js](https://nodejs.org/) 18 or newer
- npm (included with Node.js)
- [Git](https://git-scm.com/) for cloning and version control
- A modern browser such as Chrome, Firefox, Edge, or Safari

## 🚀 Getting started

### 1. Clone the repository

```bash
git clone https://github.com/preetpansuriya/AtmoGraph.git
cd AtmoGraph
```

If you already downloaded the project as a ZIP, extract it and open a terminal in the folder containing `package.json`.

### 2. Install dependencies

```bash
npm install
```

Do not commit or upload the `node_modules/` directory. It is generated locally by npm and can be recreated from `package.json` and the lock file.

### 3. Start the development server

```bash
npm run dev
```

Vite prints the local URL in the terminal. Open that URL in your browser. The default Vite port is usually `http://localhost:5173`; if the port is busy, Vite may select another available port.

### 4. Create a production build

```bash
npm run build
```

The optimized output is generated in the `dist/` directory.

### 5. Preview the production build locally

```bash
npm run preview
```

Use the URL printed in the terminal to preview the build.

## 📜 Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Run TypeScript checks and create a production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint checks |

## 📁 Project structure

The following is a guide to the main application files. Some files or folders may differ as the project evolves.

```text
AtmoGraph/
├── public/
│   └──                         # Static assets and public data files
├── src/
│   ├── components/             # Dashboard and visualization components
│   ├── data/                   # Data conversion and supply-chain data helpers
│   ├── types/                  # TypeScript types and interfaces
│   ├── utils/                  # CSV, graph, analytics, and export utilities
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles
├── .env.example                # Optional environment template, if present
├── index.html                  # HTML entry point
├── package.json                # Dependencies and npm scripts
├── package-lock.json           # Locked npm dependency versions, if present
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── LICENSE                     # Project license
└── README.md                   # Project documentation
```

## 📊 Working with supply-chain data

The application can use structured data to represent entities and connections. The exact columns accepted depend on the CSV loader and converter implemented in the current version.

An example edge-list CSV format is:

```csv
source_id,source_label,source_category,source_value,target_id,target_label,target_category,target_value,weight,edge_label
supplier_1,Supplier A,Manufacturing,15,factory_1,Factory B,Manufacturing,20,3.5,component_supply
warehouse_1,Warehouse X,Logistics,12,retailer_1,Retailer Y,Retail,8,2.1,distribution
```

Before using your own dataset:

1. Check the column names expected by the current CSV loader.
2. Keep node identifiers consistent across source and target columns.
3. Confirm that numeric fields contain valid numbers.
4. Test with a small sample before loading a large dataset.
5. Confirm dataset licensing and attribution requirements before redistributing data.

If the repository includes GMRID dataset files, follow the dataset's original terms and attribution requirements. Do not assume that a dataset can be redistributed under this project's MIT license.

## 🎮 Using the application

The exact controls depend on the current UI implementation. Common workflows may include:

1. **Explore the network:** Select a node or relationship to inspect its available details.
2. **Find relevant entities:** Use the search or filtering controls if available.
3. **Review a disruption:** Enter event or news text in the analysis interface if that feature is enabled.
4. **Inspect potential propagation:** Review the cascade or impact view where data is available.
5. **Review analytics:** Use the dashboard metrics and charts to explore the displayed results.
6. **Export results:** Use the available export controls when you need a local copy of supported data.

Treat model-generated or sample risk indicators as exploratory outputs unless they have been validated against real-world outcomes.

## ⚙️ Configuration notes

The application is built with Vite. Environment variables exposed to browser code must use the `VITE_` prefix. Only put values in frontend environment variables that are safe to expose publicly.

If a backend, external NLP service, or Neo4j database is added, keep private credentials on the server side. Never commit `.env` files containing passwords, API keys, tokens, or other secrets. Use `.env.example` only for placeholder values.

The frontend package configuration is the source of truth for the scripts and dependencies available in this repository. Refer to the current code before assuming that optional services or integrations are active.

## 🐛 Troubleshooting

### `npm` is not recognized
Install Node.js 18 or newer from [nodejs.org](https://nodejs.org/), then close and reopen the terminal. Check the installation with:

```bash
node --version
npm --version
```

### Dependencies fail to install
Try a clean dependency install from the project folder:

```bash
npm install
```

If the issue continues, check the Node.js version and the error message before deleting lock files.

### The development server uses a different port
Use the local URL printed by Vite in the terminal. If the default port is occupied, Vite may choose another port.

### CSV data does not appear
- Confirm that the file is in the location expected by the code.
- Check the CSV headers and delimiter.
- Open the browser developer console and terminal to inspect errors.
- Try a small, valid CSV sample first.

### The production build fails
Run:

```bash
npm run build
```

Read the first TypeScript or build error shown in the terminal and resolve it before retrying.

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature
   ```

3. Make and test your changes.
4. Commit with a clear message:

   ```bash
   git add .
   git commit -m "Describe your change"
   ```

5. Push your branch and open a Pull Request.

Please avoid committing generated folders such as `node_modules/` and `dist/`, local environment files, credentials, or unrelated large files.

## 📄 License

This project is distributed under the MIT License. See the [`LICENSE`](LICENSE) file for details.

Third-party datasets and assets may have their own licenses and conditions, which remain separate from the project's license.

## 🙌 Acknowledgements

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [D3.js](https://d3js.org/)
- [PapaParse](https://www.papaparse.com/)
- [Lucide](https://lucide.dev/)

## 🔗 Repository

Source code: [github.com/preetpansuriya/AtmoGraph](https://github.com/preetpansuriya/AtmoGraph)

For bugs, questions, or feature requests, please use the repository's [Issues](https://github.com/preetpansuriya/AtmoGraph/issues) page.

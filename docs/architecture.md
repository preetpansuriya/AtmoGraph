# AtmoGraph System Architecture

## Overview
AtmoGraph is an autonomous supply chain shockwave simulation and chokepoint intelligence engine. It continuously fuses unstructured news feeds, AIS maritime transponder signals, and multi-tier supply chain knowledge graphs to predict ripple effects.

## Core Pipelines
1. **NLP Ingestion Pipeline**:
   - spaCy NER & DistilBERT classifier for real-time disruption monitoring.
2. **Graph Database Layer (Neo4j)**:
   - Poly-relational graph storing multi-tier bill-of-materials and freight logistics lanes.
3. **Graph Neural Network (PyTorch Geometric)**:
   - 3-layer Graph Attention Network with edge features predicting inventory depletion and financial exposure.
4. **Interactive 3D Web Visualization (React + Three.js)**:
   - 3D graph orbital topology, AIS maritime globe, and shockwave timeline scrubber.

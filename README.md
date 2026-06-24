# KCI-OS — Karnataka Crime Intelligence Operating System

Intelligent Conversational AI & Crime Analytics Platform for Karnataka State Police Datathon 2026.

## Challenge

Design an Intelligent Conversational AI and Crime Analytics Platform that enables investigators, analysts, and policymakers to interact with the state crime database using natural language, while providing advanced analytical capabilities grounded in criminology and sociological insights.

## Architecture

- **Platform:** Zoho Catalyst (Functions, Event Listeners, Data Store, Search, Auth, Cron, File Store, API Gateway, SmartBrowz, AI Services)
- **Graph Engine:** FalkorDB (orchestrated by Catalyst Functions)
- **NLU:** Bilingual English + Kannada with code-mix support
- **Core Feature:** Crime DNA Engine — proactive intelligence from every new FIR

## Project Structure

```
kci-os/
├── backend/
│   ├── catalyst/          # Catalyst Functions
│   ├── graph/             # FalkorDB operations
│   ├── engines/           # 5 intelligence engines
│   ├── nlu/               # NLU pipeline
│   └── utils/             # Shared utilities
├── frontend/
│   ├── src/
│   │   ├── components/    # Chat, Graph Viz, Dashboard
│   │   ├── pages/
│   │   └── services/      # API calls
│   └── public/
├── data/
│   ├── synthetic/         # Generated FIR data
│   ├── schema/            # Graph schema definitions
│   └── seeds/             # Seed data scripts
├── docs/
├── scripts/
└── tests/
```

## Core Engines

1. **Crime DNA Engine** — MO extraction + similarity search + pattern detection
2. **GraphRAG Conversational Intelligence** — Schema-grounded query + cited responses
3. **Criminal Network Analysis** — Community detection + centrality + link prediction
4. **Crime Forecasting & Early Warning** — Hotspot prediction + anomaly alerts
5. **Investigation Support** — Similar case retrieval + outcome linkage

## Demo

15-minute live demo:
1. FIR ingestion cascade (Crime DNA Engine)
2. Bilingual conversational investigation (GraphRAG)
3. Network & pattern analysis
4. Explainability & governance

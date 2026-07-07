# KCI-OS: Karnataka Crime Intelligence Operating System

## Executive Summary

The Karnataka Crime Intelligence Operating System (KCI-OS) is an enterprise-grade, Intelligent Conversational AI and Crime Analytics Platform designed for the Karnataka State Police. The system empowers investigators, crime analysts, and policymakers to interface directly with the state crime database using bilingual natural language queries (English and Kannada).

Built upon a robust, CCTNS-compliant knowledge graph architecture, KCI-OS transforms unstructured police narratives and disparate records into actionable, predictive intelligence. The platform leverages advanced natural language understanding, graph analytics, and machine learning to accelerate investigations, predict emerging threat hotspots, and uncover latent criminal networks.

## System Architecture

The solution is engineered as a highly scalable, event-driven microservices architecture hosted entirely on the Zoho Catalyst cloud platform.

### Frontend Presentation Layer
- Framework: React 19 with TypeScript, utilizing Vite for optimized bundling.
- User Interface: Tailored for varied roles (Investigator, Analyst, Policymaker) using a rigorous, accessible component system (Shadcn UI, Radix UI).
- Visualization: Integrated D3 and Canvas-based graph visualization engines for rendering complex criminal network topologies and geographic hotspot mapping.

### Backend Application Layer
- Runtime: Node.js (Express) hosted within Catalyst AppSail managed container environments.
- Microservices: 9 distinct Catalyst Serverless Functions managing discrete analytical workloads.
- Event Orchestration: Catalyst Signals and Circuits manage multi-step intelligence pipelines triggered by real-time First Information Report (FIR) ingestion.

### Data & Persistence Layer
- Relational Store: Catalyst Data Store maintaining a 26-table CCTNS-compliant schema.
- Graph Store: High-performance, in-memory Redis Graph architecture enabling sub-millisecond multi-hop relationship traversals (e.g., Suspect -> Location -> Vehicle -> Accomplice).
- Caching & Storage: Catalyst Cache for high-frequency queries and Catalyst Stratus for secure evidentiary blob storage.

## Core Intelligence Engines

KCI-OS is driven by five proprietary analytical engines, each designed to address specific criminological and operational requirements.

### 1. Crime DNA Engine
Operates autonomously upon the ingestion of new FIRs to extract a unique "Crime DNA" profile. This includes Modus Operandi (MO) vectorization, temporal-spatial clustering, and weapon/vehicle profiling, allowing the system to immediately identify structural similarities to unsolved historical cases.

### 2. Conversational NLU & GraphRAG Pipeline
A bilingual processing pipeline utilizing localized Natural Language Understanding (NLU). It translates intent from natural Kannada and English queries into optimized Cypher graph queries. The Retrieval-Augmented Generation (RAG) module guarantees that all generated intelligence is strictly grounded in verifiable, cited police records.

### 3. Criminal Network Analysis Engine
Applies advanced graph theory metrics (Betweenness Centrality, PageRank, and Louvain Community Detection) to map syndicate hierarchies. This engine identifies critical communication bridges, financial nodes, and latent connections between seemingly unrelated criminal entities.

### 4. Forecasting & Early Warning System
Utilizes Catalyst Zia AutoML and historical spatial clustering to project emerging crime hotspots. The engine calculates risk scores for specific geographic sectors based on seasonal trends, historical density, and recent anomalies, triggering automated alerts to relevant jurisdictional supervisors.

### 5. Investigation Support & Similarity Retrieval
Provides tactical decision support for active investigators by instantly retrieving historical cases with identical behavioral signatures, recommending proven investigative pathways, and linking current suspects to historical acquittals or convictions.

## Security, Governance & Compliance

- Role-Based Access Control (RBAC): Strict cryptographic segregation of data access based on personnel rank and departmental assignment (Investigator vs. Supervisor vs. Analyst), managed via Catalyst Authentication.
- Audit Logging: Immutable, append-only transaction logs tracking all queries, data exports, and intelligence retrievals for strict evidentiary and judicial compliance.
- Infrastructure Security: Enforced SSL/TLS encryption in transit, Catalyst API Gateway throttling to mitigate denial-of-service, and encrypted persistence at rest.

## Deployment & Operations

The application requires the Zoho Catalyst CLI for deployment. Ensure the environment is authenticated and the active project is configured to the designated KCI-OS Datathon environment.

### Initialization
1. Ensure Node.js (v18+) and Catalyst CLI are installed.
2. Execute \`npm install\` within both the \`/frontend\` and \`/backend\` directories.
3. Authenticate with Zoho Catalyst using \`catalyst login\`.

### Local Development
- Frontend: Execute \`npm run dev\` within the \`/frontend\` directory to launch the Vite development server.
- Backend: Execute \`npm run dev\` within the \`/backend\` directory to launch the API runtime.

### Production Deployment
Execute the deployment pipeline using the Catalyst CLI:
\`\`\`bash
catalyst deploy --only client,functions,app_sail
\`\`\`

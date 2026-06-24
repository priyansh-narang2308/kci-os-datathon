# KCI-OS — Master Task List

## 48 Tasks | 11 Phases | End-to-End Build

---

## PHASE 0: PROJECT SETUP
*Get the foundation right. No code until this is done.*

### Task 0.1 — Initialize Git Repository
- Create repo: `kci-os`
- Set up `.gitignore` (node_modules, .env, __pycache__, *.pyc, .DS_Store)
- Create branch structure: `main`, `dev`, `feature/*`
- Add README with project overview
- **Owner:** All | **Time:** 30 min

### Task 0.2 — Set Up Zoho Catalyst Project
- Create Catalyst project via Zoho Console
- Enable: Functions, Data Store, Search, Authentication, File Store, API Gateway, Cron, Event Listeners, SmartBrowz, AI Services
- Configure local dev environment with Catalyst CLI
- Test basic Function deployment (hello world)
- Verify API Gateway routing works
- **Owner:** Backend 1 | **Time:** 2 hours

### Task 0.3 — Set Up FalkorDB Instance
- Deploy FalkorDB (Docker locally or cloud free tier)
- Verify Redis-compatible API works
- Create initial database
- Test basic graph operations: `CREATE`, `MATCH`, `MERGE`
- Document connection config (host, port, password)
- **Owner:** Backend 2 | **Time:** 1 hour

### Task 0.4 — Set Up Project Structure
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
│   ├── architecture.md
│   └── api.md
├── scripts/               # Build, deploy, seed scripts
└── tests/
```
- **Owner:** Backend 1 | **Time:** 30 min

### Task 0.5 — Set Up Development Dependencies
- Backend: Node.js/Python (depending on team preference), FalkorDB client, LLM API client
- Frontend: React/Next.js, D3.js or vis-network for graph visualization, Web Speech API
- AI/ML: sentence-transformers, scikit-learn, numpy, pandas
- Create `package.json` / `requirements.txt` with all dependencies
- **Owner:** All | **Time:** 30 min

---

## PHASE 1: DATA LAYER
*Schema first. Synthetic data second. Entity resolution third.*

### Task 1.1 — Define Graph Node Schema
- Define all 8 node types: FIR, Accused, Victim, Location, Phone, Vehicle, Police_Station, Investigation
- For each node: properties, data types, constraints, unique keys
- Create schema definition file (JSON/YAML)
- Validate schema against plan Part 3.1
- **Owner:** Backend 2 | **Time:** 1 hour

### Task 1.2 — Define Graph Edge Schema
- Define all 8 edge types: involved_in, arrested_with, linked_to, called, visited, operates_at, similar_MO_to, filed_at
- For each edge: direction, properties, confidence score field, provenance source field
- Create edge schema definition file
- Validate against plan Part 3.2
- **Owner:** Backend 2 | **Time:** 1 hour

### Task 1.3 — Build Synthetic FIR Data Generator
- Create 500 FIR records across 6 Karnataka districts
- Distribution: Bengaluru (150), Mysuru (100), Hubli-Dharwad (75), Mangaluru (75), Kalaburagi (50), Belagavi (50)
- Crime types: theft, chain-snatching, burglary, robbery, cyber-fraud, drug offenses, assault
- Include temporal spread across 12 months
- **Owner:** Backend 2 | **Time:** 3 hours

### Task 1.4 — Build FIR Narrative Generator
- Create template-based narrative generator using LLM
- Templates for each crime type with variable slots (MO, location, time, victim description)
- Generate varied narratives — different writing styles, detail levels, vocabulary
- Ensure some narratives are in Kannada-English code-mix
- **Owner:** AI/ML | **Time:** 3 hours

### Task 1.5 — Build Synthetic Entity Data
- Generate 200+ unique accused records with:
  - Realistic names (Kannada + English variants)
  - 15% have alias variants (entity resolution demo)
  - Some with prior conviction counts
- Generate 150+ victim records
- Generate 100+ location records with real Karnataka lat/long coordinates
- Generate 80+ phone records with IMEI/MSISDN
- **Owner:** Backend 2 | **Time:** 2 hours

### Task 1.6 — Build Cross-Link Synthetic Data
- Create 3 "gangs" of 4-6 members each connected via:
  - Shared phone records (same IMEI used by multiple accused)
  - Co-accusal in multiple FIRs
  - Shared location presence
- Create 2 repeat offenders with 5+ FIRs each
- Create 1 financial trail (shared bank account between 2 suspects)
- Ensure 8% of accused have cross-district phone links
- Ensure 5% of FIRs share MO signatures across stations
- **Owner:** Backend 2 | **Time:** 2 hours

### Task 1.7 — Build Data Seeding Script
- Script to populate FalkorDB with all synthetic data
- Creates all nodes, edges, properties
- Validates: node count, edge count, connectivity, no orphan nodes
- Idempotent: can re-run without duplicates (uses MERGE)
- **Owner:** Backend 2 | **Time:** 2 hours

### Task 1.8 — Build Entity Resolution Pipeline
- Name variant merging: Levenshtein + Jaro-Winkler similarity
- Phone deduplication: same IMEI → merge if confidence > 0.8
- Location normalization: "Mysuru"/"Mysore"/"ಮೈಸೂರು" → canonical node
- FIR deduplication: same FIR number at different stations → merge
- Test with the 15% name-variant synthetic data
- **Owner:** Backend 2 | **Time:** 3 hours

### Task 1.9 — Build Catalyst Data Store Schema
- Create Data Store collections for: FIR, Accused, Victim, Location, Phone, Vehicle, Police_Station, Investigation
- Map properties to Data Store fields
- Create indexes on key fields (fir_no, accused_id, location_id)
- Write CRUD helper functions for each collection
- **Owner:** Backend 1 | **Time:** 2 hours

---

## PHASE 2: KNOWLEDGE GRAPH OPERATIONS
*The graph is the backbone. Get this right and everything else is possible.*

### Task 2.1 — Build FalkorDB Client Library
- Create reusable client module with connection pooling
- Functions: `connect()`, `query(cypher)`, `executeTransaction(operations)`, `close()`
- Error handling: connection failures, query timeouts, syntax errors
- Test with basic CRUD operations
- **Owner:** Backend 1 | **Time:** 1 hour

### Task 2.2 — Build Graph CRUD Operations
- Create functions for each node type: `createFIR()`, `createAccused()`, `createVictim()`, `createLocation()`, etc.
- Create functions for each edge type: `linkInvolvedIn()`, `linkArrestedWith()`, `linkCalled()`, etc.
- All functions use parameterized Cypher (never string interpolation — prevent injection)
- All functions include confidence_score and provenance on edges
- **Owner:** Backend 1 | **Time:** 2 hours

### Task 2.3 — Build Graph Query Helpers
- `getAccusedFIRs(accused_id)` — all FIRs linked to an accused
- `getFIRAccused(fir_no)` — all accused in a FIR
- `getNetworkHop(node_id, edge_types, hops)` — N-hop expansion from a node
- `getRepeatOffenders(min_firs, district)` — accused with ≥N FIRs
- `getMOClusters(district, time_range)` — FIRs grouped by MO similarity
- `searchByCrimeType(crime_type, filters)` — filtered FIR search
- **Owner:** Backend 1 | **Time:** 2 hours

### Task 2.4 — Build Graph Schema Validator
- Function to validate that a Cypher query only references existing node/edge types
- Function to validate that all required properties are present on create/update
- Function to check for orphan nodes (no edges)
- Run validation after data seeding
- **Owner:** Backend 1 | **Time:** 1 hour

### Task 2.5 — Build Graph Statistics Dashboard (CLI)
- Script to output: node counts by type, edge counts by type, connectivity metrics
- Identify: most-connected nodes, isolated nodes, community count
- Useful for debugging and demo prep
- **Owner:** Backend 1 | **Time:** 1 hour

---

## PHASE 3: NLU LAYER
*This is how users talk to the system. Bilingual. Code-mixed. Voice-ready.*

### Task 3.1 — Design Intent Taxonomy
- Define all supported intents:
  - `retrieve_fir` — "show FIR 123"
  - `show_network` — "show network around this accused"
  - `find_similar` — "find similar cases"
  - `predict_hotspot` — "predict crime hotspots"
  - `show_trend` — "show theft trends in Mysuru"
  - `compare_cases` — "compare these two cases"
  - `search_offender` — "repeat offenders in Bengaluru"
  - `export_pdf` — "save this conversation"
  - `general_query` — fallback
- Document example queries for each intent
- **Owner:** AI/ML | **Time:** 1 hour

### Task 3.2 — Design Slot/Entity Taxonomy
- Define all slot types:
  - `accused_name` — person name
  - `victim_name` — person name
  - `fir_number` — FIR ID
  - `crime_type` — theft, robbery, etc.
  - `location` — district, taluk, city
  - `time_range` — "last 30 days", "2024", "since January"
  - `section_of_law` — IPC/BNS section
- Define slot extraction patterns (regex + NLU)
- **Owner:** AI/ML | **Time:** 1 hour

### Task 3.3 — Build English NLU Pipeline
- Use multilingual NLU model (XLM-R or mBERT)
- Fine-tune on 200+ annotated English queries covering all intents
- Intent classification: ~90% accuracy target
- Slot extraction: named entity recognition for police-domain entities
- **Owner:** AI/ML | **Time:** 4 hours

### Task 3.4 — Build Kannada NLU Pipeline
- Annotate 300+ Kannada queries (pure Kannada + code-mixed)
- Fine-tune multilingual model on Kannada data
- Handle Kannada-specific challenges: compound words, postpositions, verb endings
- Test with code-mixed queries: "ಈ accused ಗೆ prior cases ಇದೆಯಾ?"
- **Owner:** AI/ML | **Time:** 4 hours

### Task 3.5 — Build Code-Mix Handler
- Token-level language detection (not sentence-level)
- Segmentation: split code-mixed input into language-tagged runs
- Map Kannada police terms to English schema labels:
  - "ಕಳ್ಳತನ" → theft
  - "ಸರಳು ಕಳ್ಳತನ" → chain-snatching
  - "ಎಫ್ಐಆರ್" → FIR
  - "ಆರೋಪಿ" → accused
- Integrate with intent classifier: combined intent + slot extraction on code-mixed input
- **Owner:** AI/ML | **Time:** 3 hours

### Task 3.6 — Build NLU-to-Query Router
- Given classified intent + extracted slots, determine which engine handles the query:
  - `retrieve_fir`, `show_network`, `search_offender` → GraphRAG
  - `predict_hotspot` → Forecasting Engine
  - `find_similar` → Investigation Support Engine
  - `show_trend` → GraphRAG (aggregation query)
  - `export_pdf` → PDF Export Function
- Handle edge cases: ambiguous intent, missing required slots, out-of-scope queries
- **Owner:** Backend 1 | **Time:** 2 hours

---

## PHASE 4: GRAGH RAG PIPELINE
*The core intelligence. Schema-grounded. Citation-tagged. Reasoning-path visualized.*

### Task 4.1 — Build Query Planner (Schema-Grounded)
- Given intent + slots, generate a Cypher traversal plan
- **Constraint:** Model can ONLY reference real node/edge types from the schema
- Implementation: provide schema as context to LLM, constrain output to valid Cypher patterns
- Validate generated query against schema before execution
- **Owner:** Backend 1 | **Time:** 3 hours

### Task 4.2 — Build Structured Graph Retrieval
- Execute the Cypher query against FalkorDB
- Return the matching subgraph (nodes + edges + properties)
- Include confidence scores and provenance on every returned edge
- Handle: empty results, timeout, traversal too large
- **Owner:** Backend 1 | **Time:** 2 hours

### Task 4.3 — Build Vector Retrieval Layer
- Embed all FIR narratives using sentence-transformers
- Store embeddings in a vector index (FAISS or similar)
- Given a query or case narrative, find top-K nearest FIR narratives
- Combine with MO feature vector similarity for hybrid scoring
- **Owner:** AI/ML | **Time:** 3 hours

### Task 4.4 — Build Hybrid Retrieval Merger
- Combine results from structured graph traversal + vector retrieval
- Deduplicate (same FIR from both paths)
- Rank by: graph relevance × vector similarity × recency
- **Owner:** Backend 1 | **Time:** 2 hours

### Task 4.5 — Build Context Assembler
- Take the merged retrieval results
- Serialize into citation-tagged context blocks:
  ```
  [FIR 2024/MSR/1234, accused: Ravi Kumar, crime: theft, 
   date: 2024-03-15, status: chargesheeted,
   edge: involved_in (confidence: 0.95, source: FIR record)]
  ```
- Compress context to fit LLM window while preserving all citations
- **Owner:** Backend 1 | **Time:** 2 hours

### Task 4.6 — Build Grounded Response Generator
- LLM generates natural-language answer from assembled context ONLY
- Inline citations: "[FIR 2024/MSR/1234, confidence: 0.87]"
- Fact vs hypothesis labeling:
  - Court-verified facts → "✅ Verified: ..."
  - AI-inferred links → "🔍 Investigative Lead (not verified): ..."
- Confidence qualifier on every claim
- **Owner:** AI/ML | **Time:** 3 hours

### Task 4.7 — Build Reasoning Path Extractor
- From the graph traversal, extract the literal path: which nodes visited, in what order, which edges traversed
- Format as structured data for frontend visualization:
  ```json
  {
    "path": [
      {"node": "Accused:Ravi", "action": "start"},
      {"edge": "involved_in", "target": "FIR:1234", "confidence": 0.95},
      {"edge": "called", "target": "Phone:89xxxx", "confidence": 0.87},
      {"edge": "visited", "target": "Location:Mysuru_Central", "confidence": 0.72}
    ]
  }
  ```
- **Owner:** Backend 1 | **Time:** 1 hour

### Task 4.8 — Build GraphRAG End-to-End Test
- Test with 10 representative queries from Part 6 walkthroughs
- Validate: correct engine routing, correct graph traversal, correct citations, correct fact/hypothesis labeling
- Document any failure modes
- **Owner:** All | **Time:** 2 hours

---

## PHASE 5: CRIME DNA ENGINE
*The killer feature. Proactive intelligence from every new FIR.*

### Task 5.1 — Build MO Feature Extractor
- From FIR narrative + structured fields, extract:
  - Entry method, time of day, target type, weapon/tool, victim profile, location type, escape method, crime type code
- Use NLU + regex + rule-based extraction
- Output: structured MO feature dictionary per FIR
- **Owner:** AI/ML | **Time:** 3 hours

### Task 5.2 — Build MO Feature Vector Builder
- Convert MO feature dictionary into a numerical vector
- Categorical features: one-hot encoding
- Text features: embedding from sentence-transformers
- Combined vector: categorical + text embedding concatenated
- **Owner:** AI/ML | **Time:** 2 hours

### Task 5.3 — Build MO Similarity Search
- Pre-compute MO vectors for all historical FIRs
- Store in FAISS index for fast nearest-neighbor search
- Given new FIR's MO vector, find top-N most similar historical FIRs
- Apply geographic proximity filter (same district or within X km)
- Apply time decay weighting (more recent = higher weight)
- **Owner:** AI/ML | **Time:** 2 hours

### Task 5.4 — Build Pattern Detection Engine
- If ≥3 FIRs in top-N matches share high similarity AND are in geographic cluster:
  - Flag as "Emerging MO Pattern"
  - Assign pattern ID
  - Calculate cluster center and radius
- Cross-reference against known accused/phone/location links in the graph
- If linked accused nodes exist → "Likely same crew"
- **Owner:** Backend 2 | **Time:** 2 hours

### Task 5.5 — Build Crime DNA Analysis Output
- Format the analysis as a structured report:
  - MO Signature summary
  - Similar Cases Found (with similarity scores and link status)
  - Pattern Alert (if triggered)
  - Network connections (if any)
  - Recommended investigative leads
  - Geographic cluster summary
- **Owner:** Backend 2 | **Time:** 1 hour

### Task 5.6 — Build Crime DNA Catalyst Function
- Function: `crime_dna_analyzer`
- Triggered by Event Listener on new FIR insertion
- Calls: MO extraction → vector building → similarity search → pattern detection → output
- Stores analysis result in Data Store
- **Owner:** Backend 1 | **Time:** 2 hours

### Task 5.7 — Build Crime DNA End-to-End Test
- Insert a new FIR that matches known patterns
- Verify: MO extracted correctly,相似cases found, pattern alert triggered, recommended leads generated
- Test with FIR that has no matches (clean bill)
- Test with FIR that triggers a new pattern alert
- **Owner:** All | **Time:** 2 hours

---

## PHASE 6: CRIMINAL NETWORK ANALYSIS
*Surface hidden structures. Community detection. Centrality. Link prediction.*

### Task 6.1 — Implement Community Detection
- Install FalkorDB graph algorithms (Louvain/Leiden) or implement via Python (networkx/igraph)
- Run community detection on the full graph
- Label each node with its community ID
- Identify communities with ≥3 accused members → potential gang/crew
- **Owner:** AI/ML | **Time:** 3 hours

### Task 6.2 — Implement Centrality Analysis
- Compute PageRank on accused nodes
- Compute betweenness centrality on accused nodes
- Rank accused by centrality score
- Output: top-N "key players" per community
- **Owner:** AI/ML | **Time:** 2 hours

### Task 6.3 — Build Network Query Handler
- `getNetworkAround(node_id, hops=2)` — expand from any node
- `getCommunityDetails(community_id)` — all members, edges, stats
- `getKeyPlayers(community_id, top_n)` — ranked by centrality
- `findHiddenLinks(node_a, node_b)` — shortest path between two nodes
- **Owner:** Backend 1 | **Time:** 2 hours

### Task 6.4 — Build Network Visualization Data Formatter
- Convert graph query results to frontend-compatible format:
  ```json
  {
    "nodes": [{"id": "Ravi", "type": "Accused", "centrality": 0.85, "community": 2}],
    "edges": [{"source": "Ravi", "target": "Phone:89xx", "type": "called", "confidence": 0.87}]
  }
  ```
- Include community color-coding data
- Include centrality-based node sizing data
- **Owner:** Backend 1 | **Time:** 1 hour

### Task 6.5 — Build Network Analysis Integration with GraphRAG
- When user asks "show network around X", route to Network Analysis
- Combine community detection + centrality with graph traversal
- Include network insights in the response: "This person is a key player in community #2 (centrality: 0.85), connected to 4 other accused"
- **Owner:** Backend 1 | **Time:** 1 hour

---

## PHASE 7: FORECASTING + EARLY WARNING
*From reactive to proactive. Predict hotspots. Alert before crime clusters mature.*

### Task 7.1 — Build KDE Baseline Hotspot Model
- Divide each district into grid cells (e.g., 1km x 1km)
- Compute kernel density estimation of historical crime counts per cell
- Output: baseline hotspot probability surface
- **Owner:** AI/ML | **Time:** 3 hours

### Task 7.2 — Build Temporal Forecasting Model
- Use Prophet or ARIMA per grid cell
- Features: day of week, month, festival dates, historical crime velocity
- Output: 7-day and 30-day forecast per grid cell
- **Owner:** AI/ML | **Time:** 4 hours

### Task 7.3 — Build Forecast Backtester
- Split historical data into train/test
- Run forecast on test period
- Compute: MAE, RMSE, precision@k (of top-N predicted hotspots that actually had crime)
- Output: backtest accuracy metrics
- **Owner:** AI/ML | **Time:** 2 hours

### Task 7.4 — Build Early Warning Rule Engine
- Rules:
  - ≥3 similar MOs in 7 days in same area → "Emerging Pattern Alert"
  - Crime count > 2x historical average for a cell in a week → "Anomaly Alert"
  - Known offender active in area after long absence → "Repeat Offender Alert"
- Each rule has severity tier: INFO, WARNING, CRITICAL
- **Owner:** Backend 2 | **Time:** 2 hours

### Task 7.5 — Build Alert Notification System
- When rule triggers, generate alert with:
  - Alert type, severity, affected area, relevant FIRs, recommended action
- Push alert to relevant station/officer (based on jurisdiction)
- Store alert in Data Store with timestamp and status (new/acknowledged/resolved)
- **Owner:** Backend 2 | **Time:** 2 hours

### Task 7.6 — Build Forecasting Catalyst Cron Job
- Nightly Cron job: recompute KDE baseline, retrain Prophet models, regenerate 30-day forecasts
- Trigger early warning rule evaluation against latest forecasts
- **Owner:** Backend 1 | **Time:** 1 hour

### Task 7.7 — Build Forecasting API Endpoint
- Given district + time range, return forecast data:
  - Grid cells with probability scores
  - Confidence intervals
  - Contributing factors (recent MO cluster, gang territory, seasonal pattern)
  - Backtest accuracy displayed
- **Owner:** Backend 1 | **Time:** 1 hour

---

## PHASE 8: INVESTIGATION SUPPORT
*Turn case history into reusable intelligence.*

### Task 8.1 — Build Case Embedding Index
- Embed all FIR narratives using sentence-transformers
- Store embeddings with metadata (fir_no, crime_type, district, date, outcome)
- Build FAISS index for fast similarity search
- **Owner:** AI/ML | **Time:** 2 hours

### Task 8.2 — Build Similar Case Retriever
- Given a current case, find top-5 similar historical cases
- Similarity scoring: text embedding cosine similarity + MO feature similarity + entity overlap
- Pre-filter by district and crime category for relevance
- **Owner:** AI/ML | **Time:** 2 hours

### Task 8.3 — Build Outcome Linkage
- For each similar case, retrieve its outcome:
  - chargesheeted / convicted / closed undetected / under investigation
- Link outcome to investigative technique (if available in synthetic data)
- Format: "3 of 5 similar cases were solved using mobile tower-dump analysis"
- **Owner:** Backend 2 | **Time:** 2 hours

### Task 8.4 — Build Investigation Support Response Formatter
- Format results as side-by-side case cards:
  - Case FIR number, date, crime type, similarity score
  - Outcome badge (color-coded)
  - Shared features with current case
  - Investigative technique that worked
- **Owner:** Backend 2 | **Time:** 1 hour

### Task 8.5 — Build Investigation Support Catalyst Function
- Function: `find_similar_cases`
- Takes: current FIR details
- Calls: embedding search → similarity ranking → outcome linkage → formatting
- Returns: ranked similar cases with outcomes
- **Owner:** Backend 1 | **Time:** 1 hour

---

## PHASE 9: FRONTEND
*The interface wins or loses the demo. Make it beautiful, fast, and intuitive.*

### Task 9.1 — Build Chat UI Shell
- React component: message list, input box, send button
- Support: text input, voice input button, language toggle (EN/KN)
- Message types: user query, system response, alert notification
- Responsive design (works on laptop for demo)
- **Owner:** Frontend | **Time:** 3 hours

### Task 9.2 — Build Graph Visualization Component
- Use vis-network or D3.js force-directed graph
- Node types color-coded: FIR (blue), Accused (red), Victim (green), Location (yellow), Phone (gray)
- Edge types styled: solid (verified), dashed (AI-inferred), dotted (investigator-asserted)
- Interactive: click node to expand, hover for details
- Community color-coding overlay
- **Owner:** Frontend | **Time:** 4 hours

### Task 9.3 — Build Reasoning Path Visualizer
- Animated graph traversal rendering
- Nodes light up in order as the system "thinks"
- Each edge labeled with: relationship type, confidence score, source
- Side panel shows the textual reasoning alongside the visual traversal
- **Owner:** Frontend | **Time:** 4 hours

### Task 9.4 — Build Fact vs Hypothesis Toggle
- Toggle switch: "Show Verified Facts Only" / "Show All (Including AI Inference)"
- When "Verified Only": only show edges with high confidence from court/official records
- When "Show All": show all edges, with AI-inferred edges visually distinct (dashed, lower opacity)
- Every AI answer in the chat also labels facts vs hypotheses inline
- **Owner:** Frontend | **Time:** 2 hours

### Task 9.5 — Build Hotspot Map Component
- Leaflet or Mapbox integration
- Show Karnataka district boundaries
- Overlay: heatmap of predicted crime probability
- Overlay: FIR pins with crime-type color coding
- Overlay: known offender locations
- Time slider for animated forecast
- **Owner:** Frontend | **Time:** 3 hours

### Task 9.6 — Build Alert Feed Component
- Real-time alert list with severity badges (INFO/WARNING/CRITICAL)
- Click alert → expand details → linked FIRs → recommended action
- Acknowledge/resolve buttons
- **Owner:** Frontend | **Time:** 2 hours

### Task 9.7 — Build RBAC UI
- Login page with role selection (investigator/analyst/supervisor/policymaker)
- Jurisdiction selector (district-level for investigators, state-level for policymakers)
- Show how available features and data scope change based on role
- **Owner:** Frontend | **Time:** 2 hours

### Task 9.8 — Build Audit Log View
- Table: timestamp, officer ID, query text, engine used, results count
- Filterable by date, officer, query type
- Immutable — no delete/edit options
- **Owner:** Frontend | **Time:** 1 hour

---

## PHASE 10: VOICE, PDF, RBAC, AUDIT
*The supporting features that complete the platform.*

### Task 10.1 — Build Voice Input Integration
- Web Speech API for STT
- Language auto-detect (Kannada/English)
- Confidence threshold: if < 80%, display transcription + ask "Did you mean...?"
- Fallback to text input if voice fails
- **Owner:** AI/ML | **Time:** 2 hours

### Task 10.2 — Build Voice Output Integration
- TTS for response reading
- Same language as query
- Optional — user can toggle voice output on/off
- **Owner:** AI/ML | **Time:** 1 hour

### Task 10.3 — Build PDF Export
- Catalyst Function: `export_conversation`
- Takes: conversation history, officer ID, timestamp
- Generates PDF with:
  - Officer ID + timestamp at top
  - Each query + response with citations
  - Source FIR numbers and node IDs
  - Confidence scores
  - Disclaimer: "AI-generated analysis — verify with official records before operational use"
- Save to Catalyst File Store
- **Owner:** Backend 1 | **Time:** 2 hours

### Task 10.4 — Build RBAC Enforcement
- Catalyst Authentication setup: 4 roles (investigator, analyst, supervisor, policymaker)
- Middleware: before each query, check:
  - Officer role allows this query type?
  - Officer jurisdiction covers the requested data?
  - If cross-jurisdiction query, is it approved?
- Graph query rewriting: inject jurisdiction filter for investigators
- **Owner:** Backend 1 | **Time:** 2 hours

### Task 10.5 — Build Audit Logger
- Every query logged immutably:
  - Timestamp, officer ID, query text, intent classified, engine used, results count, response time
- Store in Catalyst Data Store (append-only collection)
- API to retrieve audit logs (filtered by officer, date, query type)
- **Owner:** Backend 1 | **Time:** 1 hour

### Task 10.6 — Build Event Listener Chain
- Catalyst Event Listener: `on_fir_insert`
- Chain: FIR insert → entity resolution → graph update → Crime DNA analysis → early warning evaluation
- Each step is a separate Function call
- Chain is idempotent (re-running doesn't create duplicates)
- **Owner:** Backend 1 | **Time:** 2 hours

---

## PHASE 11: DEMO POLISH
*This is where hackathons are won or lost. 40% of time should be here.*

### Task 11.1 — Write 15-Minute Demo Script
- Minute-by-minute narration with exact queries, exact expected outputs
- Identify 3 "wow moments" and their exact trigger actions
- Identify 2 "fallback moments" — what to do if something fails live
- Print physical copies for each team member
- **Owner:** Lead | **Time:** 2 hours

### Task 11.2 — Rehearse Demo #1 (Full Run)
- Run the complete 15-minute demo end-to-end
- Time each segment
- Note: where does it lag? where does it confuse? where does it fail?
- Fix top 3 issues identified
- **Owner:** All | **Time:** 3 hours

### Task 11.3 — Rehearse Demo #2 (With Fallbacks)
- Run demo again, this time deliberately trigger 2 failure scenarios
- Practice graceful fallback: voice fails → text, graph query times out → cached result
- Ensure fallbacks feel intentional, not panicked
- **Owner:** All | **Time:** 2 hours

### Task 11.4 — Rehearse Demo #3 (Timing + Polish)
- Final full run-through, timed
- Smooth transitions between segments
- Practice the "closing line"
- Confirm all team members know their roles during demo
- **Owner:** All | **Time:** 2 hours

### Task 11.5 — Build "What's Mocked vs Real" Slide
- Honest breakdown:
  - ✅ Real: GraphRAG pipeline, entity resolution, network analysis, Crime DNA matching, bilingual NLU
  - ⚠️ Mocked: CCTNS integration (synthetic data), forecasting (limited data), voice (demo conditions)
  - 🗺️ Roadmap: live banking data, cross-state analysis, mobile app
- This slide builds trust with judges
- **Owner:** Lead | **Time:** 1 hour

### Task 11.6 — Build Architecture Slide
- One-slide Catalyst architecture diagram (from plan Part 7)
- Show all 10 services with their roles
- Honest disclosure: "Catalyst orchestrates, FalkorDB stores the graph"
- **Owner:** Lead | **Time:** 1 hour

### Task 11.7 — Build Presentation Deck
- Slide 1: Title + team
- Slide 2: The problem (KSP's pain points)
- Slide 3: Our solution (KCI-OS overview)
- Slide 4: Live demo transition
- [DEMO: 15 minutes]
- Slide 5: Architecture (Catalyst + FalkorDB)
- Slide 6: What's mocked vs real
- Slide 7: Roadmap (Phase 2 features)
- Slide 8: Why KSP would use this
- Slide 9: Thank you + Q&A
- **Owner:** Lead | **Time:** 2 hours

### Task 11.8 — Final Pre-Demo Checklist
- [ ] FalkorDB instance running and seeded
- [ ] Catalyst Functions deployed and tested
- [ ] Frontend build working
- [ ] Voice I/O tested
- [ ] PDF export tested
- [ ] Demo script printed for all team members
- [ ] Presentation deck ready
- [ ] Backup plan for voice failure
- [ ] Backup plan for graph query timeout
- [ ] Team roles confirmed for demo
- **Owner:** All | **Time:** 1 hour

---

## TASK SUMMARY

| Phase | Tasks | Total Time |
|-------|-------|------------|
| Phase 0: Project Setup | 5 tasks | ~4.5 hours |
| Phase 1: Data Layer | 9 tasks | ~17 hours |
| Phase 2: Knowledge Graph | 5 tasks | ~7 hours |
| Phase 3: NLU Layer | 6 tasks | ~14 hours |
| Phase 4: GraphRAG Pipeline | 8 tasks | ~16 hours |
| Phase 5: Crime DNA Engine | 7 tasks | ~13 hours |
| Phase 6: Network Analysis | 5 tasks | ~9 hours |
| Phase 7: Forecasting + Early Warning | 7 tasks | ~13 hours |
| Phase 8: Investigation Support | 5 tasks | ~8 hours |
| Phase 9: Frontend | 8 tasks | ~21 hours |
| Phase 10: Voice, PDF, RBAC, Audit | 6 tasks | ~9 hours |
| Phase 11: Demo Polish | 8 tasks | ~14 hours |
| **TOTAL** | **48 tasks** | **~125 hours** |

**For a 4-person team with 10 days:** ~3 hours/person/day average. Feasible if focused.

**Critical path:** Phase 0 → Phase 1 → Phase 2 → Phase 4 (GraphRAG) → Phase 9 (Frontend) → Phase 11 (Demo)

**Parallelizable:** Phase 3 (NLU) and Phase 5 (Crime DNA) can run alongside Phase 4. Phase 6, 7, 8 can run in parallel once Phase 2 is done.

---

*Task List Version: 1.0*
*Created: June 2026*

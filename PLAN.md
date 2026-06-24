# Karnataka State Police Datathon 2026 — Challenge 1

## KARNATAKA CRIME INTELLIGENCE OPERATING SYSTEM (KCI-OS)
### The Winning Plan — Revised, Prioritized, Demo-First

---

## EXECUTIVE SUMMARY

**What we're building:** A bilingual (English + Kannada) conversational AI platform that lets investigators query Karnataka's crime database using natural language, while providing criminal network analysis, crime pattern discovery, predictive hotspot forecasting, and an explainable AI engine that makes every answer court-defensible.

**Why this wins:** Most teams will build a chatbot with analytics. We're building a **Crime Intelligence Operating System** where the chatbot is just the front door. The real product is a Knowledge Graph + 5 Intelligence Engines + event-driven architecture that automatically generates intelligence from every new FIR — not just when someone asks a question.

**The centerpiece:** The Crime DNA Engine — when a new FIR arrives, the system automatically extracts its signature, matches it against 5 years of history, updates criminal networks, re-scores risk, and generates early warnings. All in one cascade. This is what judges will remember.

**Platform:** Zoho Catalyst (Functions, Event Listeners, Data Store, Search, Auth, Cron, File Store, API Gateway, SmartBrowz, AI Services). Graph engine orchestrated via Catalyst Functions.

---

## PART 1: THE DEMO — THIS IS WHAT WINS

Judges don't rank documents. They rank demos. Everything in this plan exists to serve a 15-minute live demo. Here's the script.

### Demo Narrative: "From FIR to Intelligence in 60 Seconds"

**MINUTE 0-2: The Problem (slides, 2 minutes)**
- Show a static CCTNS dashboard. Show an officer manually cross-referencing FIRs. Show the pain.
- One line: "What if every new FIR automatically updated the entire intelligence picture?"

**MINUTE 2-5: Live FIR Ingestion Cascade (3 minutes) — THE WOW MOMENT**
- Officer uploads an FIR (PDF or form fill) — a chain-snatching case in Mysuru
- System extracts entities live: accused name, victim, location, MO, weapon, time
- Knowledge Graph updates: new FIR node, accused node linked, location node linked
- Crime DNA Engine fires: "87% MO similarity with 3 unsolved cases in Mysuru district"
- Network visualization updates: the accused appears connected to 2 other suspects via shared phone records
- Early warning triggers: "3 similar chain-snatching MOs in Mysuru in 7 days — emerging pattern alert"
- **Judges see:** A single FIR upload rippling through the entire system in real time

**MINUTE 5-8: Conversational Investigation (3 minutes)**
- Ask in English: "Show all chain-snatching cases linked to this accused"
- GraphRAG traverses the graph, returns cited results with FIR numbers, dates, locations
- Follow up: "now just the last 6 months" — context-aware refinement
- Ask in Kannada-English code-mix: "ಈ accused ಗೆ ಇನ್ನೂ ಯಾವ ಯಾವ cases ಇದೆ?"
- System handles code-mixed NLU, returns correct results
- Voice query demo: speak a question, system transcribes and answers
- **Judges see:** A bilingual, context-aware, voice-enabled investigator copilot

**MINUTE 8-11: Network & Pattern Analysis (3 minutes)**
- Show the criminal network graph — community detection reveals a chain-snatching crew
- Show the MO similarity clustering — the system identified the gang's signature without being told
- Show the financial trail — two suspects share a bank account connection
- Show the hotspot forecast — the system predicts Mysuru central will see elevated theft risk in the next 14 days
- **Judges see:** Intelligence that no single officer could piece together manually

**MINUTE 11-13: Explainability & Governance (2 minutes)**
- Click on any AI answer → see the exact graph traversal path, every node/edge with confidence scores
- Toggle "Fact vs Hypothesis" — court-verified facts glow green, AI-inferred edges show as dashed
- Show the audit log — every query timestamped, officer-attributed, immutable
- Show role-based access — log in as a different rank, watch jurisdiction scope narrow
- **Judges see:** A system that's court-defensible and production-ready, not a toy

**MINUTE 13-15: Architecture & Roadmap (2 minutes)**
- One-slide Catalyst architecture: all 10 services mapped to real roles
- Honest "what's mocked vs real" statement
- Roadmap: live CCTNS integration, real banking data, cross-state networks
- Closing line: "This is not a chatbot. This is an operating system for crime intelligence."

---

## PART 2: THE FIVE CORE ENGINES (Not Nine)

**Cutting from 9 to 5 engines is the most important decision in this plan.** A hackathon team of 3-5 cannot build 9 production-grade engines. Here are the 5 that matter most, in priority order:

### Engine 1: Crime DNA Engine (THE KILLER FEATURE)
**What it does:** When a new FIR arrives, automatically extracts its "DNA signature" — MO pattern, time pattern, location pattern, victim profile, weapon/method — then searches the entire database for matches.

**Why it wins:** No other team will build this. It's the moment judges go from "this is a good chatbot" to "this is an intelligence system."

**How it works:**
1. New FIR arrives via ingestion
2. NLU extracts structured MO features: entry method, time of day, target type, weapon, victim profile, location characteristics
3. MO feature vector generated and compared against all historical FIRs using cosine similarity + geographic proximity
4. Returns: matching FIRs ranked by similarity score, shared entity links, geographic cluster analysis
5. If ≥3 similar MOs detected within a geographic cluster → triggers early warning

**Algorithms:** Feature vector construction from structured MO tags + narrative embeddings, cosine similarity search, spatial clustering (ST-DBSCAN for geographic grouping)

**Data flow:** FIR ingestion → entity extraction → MO feature vector → similarity search → match results → early warning evaluation

### Engine 2: GraphRAG Conversational Intelligence
**What it does:** Answers natural language questions by traversing the Knowledge Graph, not just searching text.

**Why it wins:** Plain RAG will hallucinate. GraphRAG cites specific graph nodes and edges. Every answer is traceable.

**How it works:**
1. NLU extracts intent + entities from the query
2. Schema-grounded query planner generates a Cypher-equivalent traversal plan (constrained to real node/edge types — no hallucinated queries)
3. Hybrid retrieval: structured graph traversal for exact matches + vector search over FIR narratives for fuzzy/semantic matches
4. Context assembly: retrieved subgraph + narrative snippets, citation-tagged
5. LLM generates natural-language answer from assembled context only, with inline citations
6. Reasoning-path visualizer renders the literal graph traversal alongside the text answer

**Algorithms:** Schema-constrained text-to-Cypher generation, hybrid graph + vector retrieval, citation-tagged context assembly

**Data flow:** User query → NLU → query planner → graph traversal + vector search → context assembly → grounded generation → reasoning path visualization

### Engine 3: Criminal Network Analysis
**What it does:** Surfaces organized crime structures, repeat offender networks, and hidden associations from the Knowledge Graph.

**Why it wins:** This is Palantir Gotham / i2 Analyst's Notebook territory, but accessible through a chatbot interface. Visually stunning and operationally critical.

**How it works:**
1. Graph community detection (Louvain/Leiden algorithm) identifies clusters of tightly connected entities
2. Centrality analysis (PageRank, betweenness) surfaces key players in each cluster
3. Link prediction identifies probable hidden associations
4. Network visualization shows the full picture — who's connected to whom, through what (phone, location, co-accusal, financial)

**Algorithms:** Louvain/Leiden community detection, PageRank/betweenness centrality, Node2Vec embeddings for link prediction

**Data flow:** Knowledge Graph → community detection → centrality scoring → link prediction → network visualization

### Engine 4: Crime Forecasting & Early Warning
**What it does:** Predicts crime hotspots and generates early warnings for emerging crime patterns.

**Why it wins:** Moves from reactive to proactive policing. Judges explicitly want predictive, not just descriptive, analytics.

**How it works:**
1. Spatio-temporal forecasting: grid-based probability model using KDE + Prophet/ARIMA per grid cell
2. Early warning rules: "3+ similar MOs in 7 days in one area" → alert
3. Anomaly detection on FIR velocity (sudden spike in a crime type at a station)
4. Alerts pushed to relevant station/officer with severity tier and recommended action
5. Forecast displayed with confidence intervals and backtest accuracy — never a bare number

**Algorithms:** Kernel Density Estimation for baseline hotspot mapping, Prophet/ARIMA for temporal forecasting, rule-based + anomaly-trigger hybrid for early warnings

**Data flow:** Historical crime data → grid-based model → nightly Cron recompute → real-time anomaly evaluation on new FIR → alert generation → push notification

### Engine 5: Investigation Support (Similar Cases & Recommendations)
**What it does:** Automatically finds similar past cases with their outcomes and suggests investigative leads.

**Why it wins:** This is the feature investigators will say "I actually need this" about. It converts the department's entire case history into reusable institutional intelligence.

**How it works:**
1. Embed current case narrative + MO feature vector
2. Nearest-neighbor search over embedding index of historical FIRs (pre-filtered by district/crime category)
3. Re-rank by combined text similarity + MO feature similarity + entity overlap
4. Return top-5 similar cases with outcomes (chargesheeted/convicted/closed undetected)
5. Outcome linkage: "3 of 5 similar past cases were solved using mobile tower-dump analysis — consider that here"

**Algorithms:** Sentence-BERT embeddings for narrative similarity, MO feature vector cosine similarity, collaborative-filtering-style outcome linkage

**Data flow:** Current case → embedding generation → similarity search → outcome linkage → ranked recommendations

### What We're NOT Building (but showing as roadmap)

| Deferred Engine | Why Deferred | Roadmap Note |
|----------------|--------------|--------------|
| Financial Crime Intelligence | Needs synthetic transaction data that's hard to make realistic; lower judge impact than other 5 | "Phase 2: FIU-IND integration" |
| Behavioral Profiling | Requires long offender histories to be meaningful; limited demo value at hackathon scale | "Phase 2: Behavioral MO-sequence modeling" |
| Sociological Intelligence | Requires real census/socio-economic data integration; legal/DPDP complexity | "Phase 2: Area-level policy intelligence" |
| Investigation Recommendation (separate from similar-case retrieval) | The similar-case retrieval in Engine 5 covers 80% of the value | "Phase 2: Next-best-action AI" |

**This is not weakness — it's disciplined scope.** Judges respect teams that build fewer things exceptionally well over teams that build many things poorly. The 5 engines above cover 80% of the brief's requirements and are buildable in hackathon time.

---

## PART 3: THE CRIME KNOWLEDGE GRAPH

### 3.1 Node Schema (Simplified for Hackathon — 8 Core Node Types)

| Node | Key Properties | Hackathon Priority |
|------|---------------|-------------------|
| **FIR** | fir_no, police_station_id, date_filed, crime_type, sections_of_law, status, narrative_text, lat/long, investigating_officer_id | MUST |
| **Accused** | accused_id, name, aliases[], age, gender, address, prior_conviction_count | MUST |
| **Victim** | victim_id, name, age, gender, address | MUST |
| **Location** | location_id, lat/long, type (crime_scene/residence/hotspot), admin_hierarchy (taluk→district) | MUST |
| **Phone** | imei, msisdn, owner_id, owner_confidence_score | SHOULD |
| **Vehicle** | reg_no, type, owner_id | SHOULD |
| **Police_Station** | ps_id, jurisdiction_name, district | MUST |
| **Investigation** | case_id, stage, status, lead_officer_id, opened_date | MUST |

**Cut for hackathon:** Witness, Bank_Account, Organization, Gang, Officer, Crime_Type — these are either derivable from other nodes or not needed for the demo. They go in the "Phase 2" roadmap.

### 3.2 Relationship Schema (Simplified — 8 Core Edge Types)

| Edge | Direction | Key Properties | Source/Confidence |
|------|-----------|---------------|-------------------|
| **involved_in** | Accused/Victim → FIR | role | FIR record (high) |
| **arrested_with** | Accused ↔ Accused | fir_no, arrest_date | Arrest record (high) |
| **linked_to** | any ↔ any | evidence_type, weight | Investigator-asserted (variable) |
| **called** | Phone → Phone | timestamp, duration, frequency | CDR (high) |
| **visited** | Accused/Phone → Location | timestamp, dwell_time | Cell-tower/witness (variable) |
| **operates_at** | Accused → Location | activity_type | Intelligence (variable) |
| **similar_MO_to** | FIR ↔ FIR | similarity_score, shared_features | Algorithmic (medium) |
| **filed_at** | FIR → Police_Station | — | System record (high) |

**Critical principle:** Every edge carries a confidence score and provenance source. `arrested_with` (court record) and `linked_to` (AI-inferred) must never render identically in the UI.

### 3.3 Graph Database Strategy (Honest Catalyst Integration)

**The gap:** Zoho Catalyst does not natively provide a graph database service.

**The solution:** We use a dedicated graph engine (FalkorDB — Redis-compatible, free tier, lightweight) orchestrated by Catalyst Functions and Event Listeners.

**Architecture:**
```
┌─────────────────────────────────────────────────┐
│                  ZOHO CATALYST                    │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Functions  │  │Event     │  │Cron      │       │
│  │(query     │  │Listeners │  │(nightly  │       │
│  │planner,   │  │(FIR      │  │forecast  │       │
│  │engines,   │  │ingestion │  │recompute)│       │
│  │PDF export)│  │cascade)  │  │          │       │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘       │
│        │             │             │              │
│  ┌─────┴─────────────┴─────────────┴────┐       │
│  │         Catalyst API Gateway          │       │
│  └─────┬─────────────┬─────────────┬────┘       │
│        │             │             │              │
│  ┌─────┴────┐  ┌─────┴────┐  ┌─────┴────┐      │
│  │Data Store│  │Search    │  │Auth      │      │
│  │(FIR,     │  │(narrative│  │(RBAC,    │      │
│  │Accused,  │  │text      │  │roles,    │      │
│  │Victim)   │  │matching) │  │jurisdic.)│      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │File Store│  │AI Svcs   │  │SmartBrowz│      │
│  │(PDFs,    │  │(embed.,  │  │(legacy   │      │
│  │scans)    │  │OCR, TTS) │  │ingestion)│      │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────┬───────────────────────┘
                          │ API calls
                          ▼
              ┌───────────────────────┐
              │    FalkorDB            │
              │  (Graph Engine)        │
              │  - Crime Knowledge     │
              │    Graph               │
              │  - Community detection │
              │  - Centrality scoring  │
              │  - Path traversal      │
              └───────────────────────┘
```

**Why this is the right answer:**
1. Honest — Catalyst orchestrates, FalkorDB stores the graph. No overclaiming.
2. Deployable — FalkorDB is lightweight, runs anywhere, has Redis-compatible API
3. Catalyst-native — Event Listeners trigger graph updates, Functions run graph queries, Cron schedules batch recomputes
4. Judges respect the transparency — "We use Catalyst for compute, orchestration, auth, search, storage, and AI services. The graph engine is a dedicated component orchestrated by Catalyst Functions." That's a production architecture, not a hackathon fantasy.

### 3.4 Entity Resolution Pipeline

Before any data enters the graph, it passes through entity resolution:

1. **Name variant merging:** "Suresh Kumar" / "Suresh K" / "Kumar Suresh" / "ಸುರೇಶ್" → same Accused node
2. **Phone deduplication:** Same IMEI registered to different names → flag for review, merge if confidence high
3. **Location normalization:** "Mysuru" / "Mysore" / "ಮೈಸೂರು" → canonical Location node
4. **FIR deduplication:** Same FIR number filed at different stations → merge

**Implementation:** String similarity (Levenshtein + Jaro-Winkler) + phonetic matching (Soundex for Kannada transliteration variants) + exact match on structured fields (phone IMEI, vehicle reg_no).

---

## PART 4: GRAPHRAG PIPELINE — DETAILED

### Step 1: Query Understanding
- NLU extracts: intent (retrieval/aggregation/prediction/comparison), entities (accused name, crime type, location, time range), modifiers (filters, ranking criteria)
- Entity resolution: match extracted entities against graph nodes (handle aliases, name variants)
- Query classification: determine if the query routes to GraphRAG, Forecasting Engine, or Investigation Support Engine

### Step 2: Schema-Grounded Query Planning
- LLM generates a traversal plan constrained by the **exact node/edge types** in the schema
- No freeform SQL/Cypher generation — the model can only reference real labels
- Example: "show all theft cases linked to accused X" → `MATCH (a:Accused)-[involved_in]->(f:FIR) WHERE a.name CONTAINS 'X' AND f.crime_type = 'theft' RETURN f`
- The query planner validates the generated query against the schema before execution

### Step 3: Hybrid Retrieval
- **Structured traversal:** Execute the graph query, return the exact subgraph
- **Vector search:** In parallel, run embedding similarity search over FIR narratives and MO feature vectors for fuzzy matches the structured query would miss
- **Merge:** Combine results from both paths, deduplicate, rank by relevance

### Step 4: Context Assembly
- Retrieved subgraph serialized into citation-tagged context blocks
- Every fact tagged with: source FIR number, node ID, edge type, confidence score, provenance source
- Context compressed to fit LLM window while preserving all citations

### Step 5: Grounded Generation
- LLM produces natural-language answer **only from the assembled context**
- Inline citations: "[FIR 2024/MSR/1234, confidence: 0.87]"
- Fact vs hypothesis labeling: facts from court records labeled as "Verified", AI-inferred links labeled as "Investigative Lead — Not Verified"

### Step 6: Reasoning Path Visualization
- The literal graph traversal rendered as a visual subgraph
- Each node labeled with entity type and key properties
- Each edge labeled with relationship type, confidence score, and source
- Animation: nodes light up in traversal order, showing how the system reasoned through the answer

---

## PART 5: CRIME DNA ENGINE — THE KILLER FEATURE (DETAILED)

### Why This Feature Wins the Hackathon

Every other team will build a chatbot that answers questions. We build a system that **proactively generates intelligence** the moment new data arrives. The Crime DNA Engine is the mechanism.

### How It Works

**Step 1: FIR Ingestion**
- FIR arrives (PDF upload via SmartBrowz OCR, or form entry, or API from mock CCTNS)
- Entity extraction pipeline: accused, victim, location, crime type, sections of law, MO narrative

**Step 2: MO Feature Vector Construction**
From the FIR, extract structured features:
| Feature | Example | Extraction Method |
|---------|---------|-------------------|
| Entry method | "broke window" | NLU from narrative |
| Time of day | "2:00-4:00 AM" | Structured field |
| Target type | "jewelry shop" | Crime type + narrative |
| Weapon/tool | "screwdriver" | NLU from narrative |
| Victim profile | "elderly woman living alone" | NLU from narrative |
| Location type | "residential area, ground floor" | Location metadata |
| Escape method | "on motorcycle" | NLU from narrative |
| Crime type code | "IPC 379" | Structured field |

Construct a feature vector from these extracted attributes.

**Step 3: Similarity Search**
- Cosine similarity between the new FIR's MO vector and all historical FIR MO vectors
- Geographic proximity filter (same district or within X km)
- Time decay weighting (more recent matches weighted higher)
- Return ranked list of similar FIRs with similarity scores

**Step 4: Pattern Detection**
- If ≥3 FIRs in the top-N matches share high similarity AND are in a geographic cluster → flag as "Emerging MO Pattern"
- Cross-reference against known accused/phone/location links in the graph
- If linked accused nodes exist → "Likely same crew"

**Step 5: Intelligence Output**
```
CRIME DNA ANALYSIS — FIR 2024/MSR/5678

MO Signature: Night-time residential burglary, ground-floor entry
via window, screwdriver tool, jewelry target, motorcycle escape

Similar Cases Found: 4
├── FIR 2024/MSR/4321 (87% match) — Accused: Ravi Kumar [LINKED]
├── FIR 2024/MSR/3890 (82% match) — Accused: Unknown [NO LINK]
├── FIR 2024/MSR/2345 (79% match) — Accused: Suresh [LINKED via phone]
└── FIR 2024/MSR/1234 (76% match) — Accused: Unknown [NO LINK]

Pattern Alert: 4 similar MOs in Mysuru in 30 days — EMERGING CREW
Network: Accused Ravi Kumar linked to Suresh via shared phone record
Recommended Lead: Cell tower dump for IMEI 89xxxx around crime scenes
Geographic Cluster: All 4 incidents within 3km radius of Mysuru Central
```

### Catalyst Implementation
- **Function:** `crime_dna_analyzer` — triggered by Event Listener on new FIR insertion
- **Function:** `mo_vector_builder` — extracts features, builds vector
- **Function:** `similarity_search` — cosine search over historical MO vectors
- **Event Listener:** `on_fir_insert` → triggers the cascade
- **Cron:** Nightly re-evaluation of all MO clusters (new patterns may emerge as more FIRs arrive)
- **Data Store:** MO feature vectors stored alongside FIR records

---

## PART 6: INVESTIGATOR COPILOT — QUERY WALKTHROUGHS

### Query 1: "Show all burglary cases linked to accused Ravi Kumar"
- **Routing:** GraphRAG (retrieval intent + entity + crime type filter)
- **Entity resolution:** "Ravi Kumar" → canonical Accused node (handle "Ravi K", "R. Kumar" variants)
- **Graph traversal:** `(Accused:Ravi_Kumar)-[involved_in]->(FIR) WHERE FIR.crime_type = 'burglary'`
- **Retrieval:** Pure structured traversal — exact match, no vector search needed
- **Response:** Count, date range, stations involved, status breakdown, any shared MO signatures
- **Visualization:** Timeline strip of FIRs + star-graph (Ravi at center, FIRs as satellites, color-coded by status)

### Query 2: "Which repeat offenders are active in Mysuru for theft?"
- **Routing:** GraphRAG (multi-hop aggregation)
- **Graph traversal:**
  1. `FIR(crime_type='theft', location='Mysuru') -[involved_in]- Accused`
  2. Expand each Accused's full FIR history
  3. Filter: `count(involved_in) ≥ 2`
  4. Rank by (recency × severity × network centrality)
- **Retrieval:** Structured traversal + vector search for MO-similarity matches
- **Response:** Ranked list with FIR count, most recent activity, network affiliations
- **Visualization:** Geo-map with theft pins + offender-network overlay

### Query 3: "Predict crime hotspots for next 30 days"
- **Routing:** Crime Forecasting Engine (prediction intent — NOT a graph query)
- **Model output:** Grid-cell probability surface from KDE + Prophet/ARIMA
- **Enrichment:** Cross-reference predicted cells against known accused operating territories from the graph
- **Response:** Top-N grid cells with probability scores, contributing factors (recent MO cluster, gang territory, seasonal pattern), confidence intervals, backtest accuracy
- **Visualization:** Animated 30-day probability heatmap with error bars displayed

### Query 4: "Find similar cases from the past 5 years"
- **Routing:** Investigation Support Engine (similarity intent)
- **Retrieval:** Embed current case → nearest-neighbor search over historical FIR embeddings → re-rank by (text similarity + MO similarity + entity overlap)
- **Response:** Top-5 similar cases with outcomes (chargesheeted/convicted/closed), similarity scores, and outcome-linked investigative techniques
- **Visualization:** Side-by-side case cards with similarity score and outcome badge

### Query 5: "Show network around this accused"
- **Routing:** Criminal Network Analysis (network traversal intent)
- **Graph traversal:** 2-3 hop expansion from the accused node — co-accusal edges, shared phone edges, shared location edges
- **Community detection:** Run Louvain on the local subgraph to identify if this person belongs to a cluster
- **Response:** Network graph with centrality-ranked nodes, community labels, shared entity edges
- **Visualization:** Force-directed graph with community color-coding, centrality node sizing

---

## PART 7: ZOHO CATALYST SERVICE MAPPING

| Catalyst Service | What We Use It For | Why It Matters |
|-----------------|-------------------|----------------|
| **Functions** | Query planner, each engine's inference trigger, entity extraction, MO vector building, PDF export, Crime DNA analysis | Serverless compute — auto-scales per invocation, no idle cost |
| **Event Listeners** | New FIR → entity resolution → graph update → Crime DNA analysis → early warning evaluation — cascading event chain | The backbone of the "Crime DNA Engine" — intelligence generated proactively, not on request |
| **Data Store** | FIR, Accused, Victim, Location, Investigation records (the relational layer) | System of record, horizontally scaled |
| **Search** | Full-text search over FIR narratives, witness statements, case summaries | Powers the "find similar case" text-matching layer |
| **Authentication** | Officer login, role assignment (investigator/analyst/supervisor/policymaker), jurisdiction scoping | Satisfies governance requirement with managed auth |
| **File Store** | Scanned FIR images, exported PDF conversation logs, voice recordings | Cleanly satisfies "save as PDF" with proper persistence |
| **API Gateway** | Single entry point for chatbot, dashboard, and mobile requests | Centralized throttling, rate limiting, security |
| **Cron** | Nightly hotspot-forecast recompute, MO cluster re-evaluation, risk-score refresh | Decouples expensive batch ML from real-time request path |
| **SmartBrowz** | FIR PDF OCR ingestion, server-side PDF rendering for conversation export | Handles legacy data ingestion and compliance artifacts |
| **AI Services** | Embeddings (for GraphRAG + similarity search), OCR (FIR scan digitization), translation (Kannada↔English), speech (STT/TTS for voice I/O) | Leverages Catalyst's native AI stack instead of reinventing |

### Honest Architecture Disclosure (for the judges)
> "Zoho Catalyst is the orchestration and compute layer — Functions, Event Listeners, Cron, Auth, Search, Storage, AI Services. The Crime Knowledge Graph runs as a dedicated graph engine (FalkorDB) orchestrated by Catalyst Functions and kept in sync via Event Listeners. This is a production-appropriate architecture: Catalyst handles the serverless glue, authentication, and managed services; the graph engine handles the specialized graph traversal and community detection that no general-purpose platform offers natively."

---

## PART 8: BILINGUAL NLU — ENGLISH + KANNADA

### The Problem
Officers at taluk stations naturally code-mix: "ಈ accused ಗೆ prior cases ಇದೆಯಾ?" (Does this accused have prior cases?). A translation wrapper breaks on legal terminology and code-mixed speech.

### The Solution
**Three-layer NLU architecture:**

**Layer 1: Language Detection + Code-Mix Segmentation**
- Detect language per token (not per sentence)
- Segment code-mixed input into language-tagged runs
- Handle: pure Kannada, pure English, Kannada-English code-mix, Kannada-English-Hindi code-mix

**Layer 2: Intent + Slot Extraction (Multilingual)**
- Use a multilingual NLU model (XLM-R or mBERT fine-tuned on police-domain intents)
- Training data: 500+ annotated code-mixed queries covering all supported intents
- Intent categories: retrieve_fir, show_network, find_similar, predict_hotspot, show_trend, compare_cases, export_pdf
- Slot types: accused_name, victim_name, crime_type, location, time_range, fir_number

**Layer 3: Terminology-Aware Translation**
- When graph queries are generated, map Kannada police terms to graph schema labels
- Glossary: "ಕಳ್ಳತನ" → theft, "ಸರಳು ಕಳ್ಳತನ" → chain-snatching, "ಎಫ್ಐಆರ್" → FIR
- Code-mixed queries: extract English terms directly, translate only Kannada segments
- **Never** translate the full query through a generic translation API — this loses legal nuance

### Voice I/O
- **Input:** Web Speech API or Catalyst AI speech service
- **Languages:** Kannada STT + English STT, with language auto-detection
- **Confidence fallback:** If transcription confidence < 80%, display the transcription and ask "Did you mean...?" — this is a deliberate UX feature, not a failure
- **Output:** TTS in the same language as the query
- **Noise tolerance:** Designed for field conditions (police station, vehicle patrol) — if STT fails, graceful fallback to text input with a visible prompt

---

## PART 9: SYNTHETIC DATA STRATEGY

**The rule:** Demo data must be messy enough to showcase entity resolution, realistic enough to be credible, and small enough to be buildable.

### Dataset: 500 FIRs across Karnataka

**Distribution:**
| District | FIR Count | Crime Types |
|----------|-----------|-------------|
| Bengaluru Urban | 150 | Theft, cyber-fraud, robbery, chain-snatching |
| Mysuru | 100 | Theft, chain-snatching, burglary |
| Hubli-Dharwad | 75 | Theft, robbery, assault |
| Mangaluru | 75 | Drug offenses, theft |
| Kalaburagi | 50 | Theft, property crime |
| Belagavi | 50 | Theft, robbery |

**Messiness baked in:**
- 15% of accused names have variant spellings (entity resolution demo)
- 10% of FIRs have missing location coordinates (shows handling of incomplete data)
- 8% of accused have phone records linking them across districts (network analysis demo)
- 5% of FIRs share MO signatures across stations (Crime DNA Engine demo)
- 3 known "gangs" of 4-6 members each, connected via phone/co-accusal (community detection demo)
- 2 repeat offenders with 5+ FIRs each (repeat offender ranking demo)
- 1 financial trail (shared bank account between 2 suspects in a theft ring)

### Data Generation Approach
1. Start with realistic FIR narrative templates (real KSP FIR structure, fictional names/locations)
2. Use LLM to generate varied FIR narratives from templates (varying MO details, writing style, detail level)
3. Manually create cross-links: shared phone numbers, shared locations, repeat accused
4. Add deliberate messiness: typos in names, missing fields, duplicate near-matches
5. Geocode locations to real Karnataka coordinates (lat/long within real districts)
6. Create temporal distribution across 12 months to enable seasonal trend analysis

---

## PART 10: MVP BUILD PLAN (3-5 Person Team, Hackathon Timeline)

### Week 1: Foundation (Days 1-3)
| Day | Task | Owner |
|-----|------|-------|
| 1 | Set up Catalyst project: Functions, Data Store, Auth, API Gateway | Backend 1 |
| 1 | Design and populate FalkorDB with 500-FIR synthetic dataset + graph schema | Backend 2 |
| 2 | Build entity extraction pipeline (FIR → structured entities) | Backend 1 |
| 2 | Build bilingual NLU: intent classification + slot extraction (English first, Kannada Day 3) | AI/ML |
| 3 | Build entity resolution pipeline (name variants, phone dedup, location normalization) | Backend 2 |
| 3 | Kannada NLU integration + code-mix testing | AI/ML |
| 3 | Frontend: chat UI shell + graph visualization scaffold | Frontend |

### Week 2: Core Engines (Days 4-7)
| Day | Task | Owner |
|-----|------|-------|
| 4 | GraphRAG pipeline: query planner → Cypher generation → traversal → context assembly → LLM generation | Backend 1 |
| 4 | Crime DNA Engine: MO feature extraction + similarity search | Backend 2 |
| 4 | Network analysis: community detection + centrality scoring | AI/ML |
| 5 | Reasoning path visualizer: render graph traversal as animated subgraph | Frontend |
| 5 | Early warning rule engine: MO pattern alerts + anomaly triggers | Backend 2 |
| 5 | Similar-case retrieval: embedding index + outcome linkage | AI/ML |
| 6 | Voice I/O: STT + TTS integration with confidence fallback | AI/ML |
| 6 | PDF export: conversation history with citations, officer ID, timestamp | Backend 1 |
| 6 | RBAC: role-based query filtering + jurisdiction scoping | Backend 2 |
| 7 | Integration: connect all engines through Catalyst Functions + Event Listeners | All |
| 7 | End-to-end testing: FIR ingestion cascade demo | All |

### Week 3: Demo Polish (Days 8-10)
| Day | Task | Owner |
|-----|------|-------|
| 8 | Demo script rehearsal: timing, transitions, fallback paths | All |
| 8 | Forecasting model: KDE + Prophet baseline, backtest accuracy calculation | AI/ML |
| 9 | UI polish: fact/hypothesis toggle, confidence score display, audit log view | Frontend |
| 9 | Messy data refinement: ensure entity resolution has visible demo moments | Backend 2 |
| 10 | Final rehearsal: full 15-minute run-through, backup plans for each demo segment | All |
| 10 | "What's mocked vs real" slide preparation | Lead |

### Team Roles (Assuming 4 People)
| Role | Responsibilities |
|------|-----------------|
| **Backend 1** | GraphRAG pipeline, Catalyst Functions, entity extraction, PDF export |
| **Backend 2** | Crime DNA Engine, entity resolution, early warning, synthetic data, RBAC |
| **AI/ML** | NLU (bilingual), network analysis, similarity search, forecasting model |
| **Frontend** | Chat UI, graph visualization, reasoning path renderer, demo polish |

---

## PART 11: WHAT MAKES THIS BEAT COMPETITORS

| What Most Teams Build | What We Build | Why It's Better |
|----------------------|---------------|----------------|
| Chatbot answering "show FIR for X" | GraphRAG with multi-hop traversal and cited sources | Answers complex investigative questions, not just lookup |
| Force-directed graph with no analysis | Community detection + centrality + link prediction | Surfaces hidden structure, not just shows connections |
| Heatmap labeled "prediction" | KDE + Prophet model with backtest accuracy + confidence intervals | Actual forecasting with honest error reporting |
| English-only with translation API | Code-mixed Kannada-English NLU | Works for real officers in real conditions |
| Dashboard of charts | Conversational interface tying all analytics together | One entry point, not 5 separate tools |
| AI answers with no traceability | Every answer cites graph nodes, edges, confidence scores, provenance | Court-defensible, not just impressive |
| Static demo with clean data | Messy synthetic data with entity resolution working live | Shows the system handles real-world chaos |
| Feature list in slides | Live 15-minute demo with FIR cascade, network reveal, and forecasting | Judges see it working, not hear about it |

---

## PART 12: JUDGE SCORING ANALYSIS

| Criterion | Our Score | Rationale |
|-----------|-----------|-----------|
| Innovation | 9/10 | Crime DNA Engine + GraphRAG + event-driven cascade are genuinely above hackathon norm |
| Technical Depth | 9/10 | Real graph algorithms, schema-grounded generation, bilingual NLU, honest about what's mocked |
| Practical Utility | 9/10 | Maps directly onto existing KSP practices (rowdy-sheet, CCTNS) |
| AI Usage | 9/10 | GraphRAG + Crime DNA + forecasting + NLU — sophisticated but not overclaimed |
| Scalability | 8/10 | Event-driven Catalyst architecture scales well; graph-at-scale needs caveat |
| Law Enforcement Impact | 9.5/10 | Court-defensibility, jurisdiction-scoped governance, bilingual support |
| Catalyst Integration | 9/10 | All 10 services mapped to genuine roles; honest about graph engine orchestration |
| Deployment Feasibility | 8/10 | Strong design; CCTNS integration remains roadmap item |
| Demo Strength | 9.5/10 | Live FIR cascade, bilingual code-mix, network reveal, reasoning visualizer — concrete wow moments |
| **Overall** | **89/100** | **With strong live execution, realistic ceiling is 92-94** |

---

## PART 13: HONEST WEAKNESSES & MITIGATIONS

| Weakness | Mitigation |
|----------|------------|
| Graph scale claims need realism | Demo with 500 FIRs (thousands of nodes, not millions). State that production scaling requires graph partitioning strategy — shown as roadmap, not claimed as complete |
| Synthetic data too clean | Bake in 15% name variants, 10% missing fields, 8% cross-district links. Entity resolution is a live demo feature, not hidden |
| Forecasting model limited data | Always show confidence intervals + backtest accuracy. State "demonstrated on synthetic data, production validation requires multi-year real data" |
| Voice feature fragility | Rehearsed fallback path: if STT confidence < 80%, display transcription + ask for confirmation. Demo this as a deliberate UX feature |
| Catalyst graph DB gap | Disclosed honestly: "Catalyst orchestrates, FalkorDB stores the graph." This is a production architecture, not a limitation |
| Kannada NLU accuracy | Train on 500+ annotated code-mixed queries. If live demo fails, have a pre-recorded Kannada query as backup — judges respect honesty over overclaiming |
| Scope creep risk | 5 engines, not 9. Ruthless prioritization. Build fewer things exceptionally well |

---

## PART 14: TOP 10 REASONS KSP WOULD ACTUALLY USE THIS

1. It speaks Kannada — the language officers actually use, code-mixed with English
2. It turns institutional memory (senior officers' knowledge of gangs and MOs) into a persistent, queryable asset
3. It digitizes the existing "rowdy-sheet" / habitual-offender tracking practice with AI acceleration
4. Its outputs are court-defensible — citations, confidence scores, audit trails
5. It reduces hours of manual cross-referencing across FIRs, phone records, and locations
6. It gives station-level officers network-analysis power that previously required CCB analysts
7. It predicts hotspots for proactive patrol deployment, not just after-the-fact reporting
8. It respects jurisdictional and rank-based access norms
9. It integrates with, not replaces, CCTNS and legacy systems
10. The Crime DNA Engine proactively generates intelligence — officers don't have to ask the right question to get the right answer

---

## PART 15: THE 25 JUDGE WOW MOMENTS (Ranked by Impact)

1. **Live FIR upload → entire system updates in real time** — graph, risk scores, early warning, network, all ripple from one event
2. **Kannada-English code-mixed query answered correctly with citations** — "ಈ accused ಗೆ ಇನ್ನೂ ಯಾವ cases ಇದೆ?"
3. **Crime DNA Engine reveals 87% match with 3 unsolved cases** — judges see proactive intelligence generation
4. **Graph traversal path animates as the answer is generated** — they see HOW the system reasoned
5. **Community detection reveals a gang structure** that wasn't obvious from any single FIR
6. **Fact vs Hypothesis toggle** — court-verified facts glow green, AI-inferred edges show as dashed
7. **Forecasting engine displays its own backtest accuracy** unprompted
8. **Early warning notification fires mid-demo** — "3 similar MOs in 7 days — emerging pattern"
9. **Entity resolution merges two differently-spelled aliases** into one Accused node, live
10. **Similar-case retrieval shows outcome linkage** — "3 of 5 similar cases solved via cell tower dump"
11. **Voice query in Kannada with background noise** — graceful fallback if confidence low
12. **PDF export opens with officer ID, timestamp, query, cited sources** — compliance artifact, not chat transcript
13. **RBAC demo** — log in as different role, watch jurisdiction scope visibly narrow
14. **Repeat offender ranking updates** the moment a new theft FIR with matching MO is added
15. **Financial trail diagram** (if Engine 6 roadmap demo) — structuring pattern lighting up
16. **Confidence scores visible on every single edge** in the graph view
17. **Multi-hop traversal answer** — "show network around this accused" → 3-hop expansion with each hop shown
18. **"What's mocked vs real" slide** — judges consistently reward honesty
19. **Audit log showing the exact query just run**, immutably timestamped
20. **SHAP breakdown** of a risk score — "why this offender is ranked #3"
21. **Cross-referencing predicted hotspot against known gang territory**
22. **Plain RAG hallucinated answer vs. our GraphRAG cited answer** — side by side
23. **System correctly declining** to answer a query outside officer's jurisdiction
24. **Multi-turn follow-up** — "now just Mysuru" → "now last 6 months" → without re-typing context
25. **Catalyst Event Listener chain diagram** shown live, mapped 1:1 to what just happened on screen

---

## PART 16: COMPETITIVE LANDSCAPE

| Team Type | What They'll Build | Why They Lose | How We Beat Them |
|-----------|-------------------|---------------|-----------------|
| Basic chatbot team | RAG-over-PDF, English only, no graph | Single-hop retrieval, hallucinated answers, no network analysis | GraphRAG with multi-hop traversal, bilingual, cited sources |
| Dashboard team | Charts + maps, no conversational interface | Static, no natural language, no proactive intelligence | Conversational interface + event-driven cascade |
| Generic RAG team | LLM + VectorDB, English only | No graph, no entity resolution, no explainability | Knowledge Graph + schema-grounded generation + reasoning visualizer |
| Advanced RAG team | RAG with some graph features | No Crime DNA Engine, no event-driven cascade, no bilingual NLU | Crime DNA Engine as centerpiece, proactive intelligence, code-mixed NLU |
| Government contractor team | Enterprise architecture, heavy slides | Overpromised, underdelivered, no live demo | Live 15-minute demo with real cascade, not slideware |

---

## PART 17: FINAL STRATEGIC NOTES

### The Three Things That Win This Hackathon

1. **The FIR cascade demo.** Everything else is supporting evidence. When a new FIR arrives and the entire system ripples — graph updates, network reveals, MO matching, early warnings — in 15 seconds, judges remember that moment. This is the Crime DNA Engine in action.

2. **The bilingual code-mixed query.** When you ask a question in Kannada-English mix and get a correct, cited answer with a reasoning path, you've demonstrated something most teams won't even attempt. This is the adoption story — real officers in real conditions.

3. **The honest architecture.** When you say "Catalyst orchestrates, FalkorDB stores the graph, here's exactly what's mocked and what's real," judges trust you. Every other team will overclaim. Trust wins.

### What NOT to Do
- Do NOT build all 9 engines. Build 5 exceptionally.
- Do NOT promise live CCTNS integration. Show it as a roadmap.
- Do NOT build a demographic risk score. It's the bias trap.
- Do NOT skip the reasoning path visualizer. It's the highest-leverage "wow" feature.
- Do NOT hide the fact/hypothesis distinction. Show it as a feature.
- Do NOT demo voice without a rehearsed fallback path.

### The Closing Line for the Presentation
> "We didn't build a chatbot. We built an operating system for crime intelligence. The chatbot is the front door. Behind it sits a Knowledge Graph that every engine reads from, five intelligence engines that proactively generate insights, and a governance layer that makes every answer court-defensible. This is not a hackathon project. This is a deployment-ready platform for Karnataka State Police."

---

*Plan Version: 2.0 — The Winning Plan*
*Last Updated: June 2026*
*Team: [Team Name]*

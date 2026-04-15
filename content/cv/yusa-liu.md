# Yusa Liu 劉于莎
**Software Engineer | Distributed Systems | Fintech / SaaS**

📍 Taiwan, Global Remote
🐙 https://github.com/yusaanthya

---

## Summary

Backend Engineer with 2+ years of production experience in microservices, event-driven architecture, and fintech infrastructure. At HTC VIVERSE, owned core services in a 100+ microservice ecosystem, applied Domain-Driven Design, and made critical technical decisions under delivery pressure — including defining idempotency boundaries, rollback scope, and failover handling for a vendor-dependent feature under ambiguous requirements. Currently contributing to a compliant crypto exchange with GCP-based EDA (Pub/Sub, 27 topics), dual wallet provider architecture (Fireblocks + Cybavo), and KYC/AML integration. Proactive in identifying architectural gaps and proposing systematic improvements.

---

## Experience

### Backend Engineer
**ZONE WALLET** | Mar 2026 – Present | Taipei, TW

- Onboarded into production fintech system with event-driven architecture: GCP Pub/Sub (27 topics, dead letter handling), 4 Cloud Run services, and gRPC-based microservice topology
- Produced cross-service architecture documentation within first week covering CICD flow, data flow, Pub/Sub ownership model, and deprecated service inventory — filling a gap not covered by in-code docs
- Identified auth coupling risk in main server; proposed extracting a dedicated authentication service with OAuth 2.0 to replace cookie-based account management, motivated by ongoing third-party integration expansion and future RBAC extensibility
- Stack: Go, gRPC, GCP (Cloud Run / Pub/Sub / Cloud Scheduler / Secret Manager), PostgreSQL, Redis, Fireblocks, Sumsub (KYC), Elliptic (AML)

---

### Software Engineer
**HTC VIVERSE** | Nov 2022 – Dec 2024 | Taipei, TW

- Owned avatar core service (Go/Gin + MySQL) serving 5k+ monthly organic visits within a 100+ microservice ecosystem; maintained 6+ legacy services (Scala/Finatra + MongoDB) across 4 business divisions
- Led multi-region rollout (Global / CN / UAE) for avatar service through semantic versioning and OpenAPI spec; defined location-based routing requirements for DevOps-implemented NGINX policy with centralized RBAC auth
- Designed reusable event-driven architecture with AWS SNS/SQS + Lambda, enabling two business units to share the same event triggers and Go handler package, reducing duplicate code by ~800 LOC
- **VIVERSE Avatar Service Optimization**
  - POC: Migrated avatar assembly + AES-GCM encryption from FE Three.js to BE k8s job (Node.js + Basisu/KTX2), cutting texture storage 30–70% and boosting resolution 16x
  - Improved gameplay latency for VIVERSE World by extending existing endpoints to accept resolution-level query param (20 levels) with full backward compatibility, preserving Redis 5-min pre-signed S3 cache
- **VIVERSE Closet 2.0 — Delivered in 8 months (vs. 2-year plan)**
  - Led DDD architecture evolution: retained Avatar as mutable aggregate while redefining Asset as immutable, expanded types 1 → 3 with backward compatibility to support future gifting scenario
  - Under compressed timeline and vendor unavailability, defined idempotency strategy and scoped atomic transaction boundaries; decoupled state into existing DB schema without new tables, and preserved manual intervention interfaces for retry and revert — ensuring failures remained visible and recoverable without full rollback automation
  - Determined beta launch scope independently: shipped first iteration without vendor integration while designing clear extension points for full feature completion in subsequent releases
  - Proposed and drove `asset_ownership` MySQL normalization table, enabling upcoming NFT marketplace and gifting features
  - Extended repository layer with GORM + targeted raw SQL for complex, use-case-specific queries while preserving clean domain/persistence separation
  - Delivered vendor integration and mobile animation editor; coordinated 7 internal + 2 vendor collaborators
  - Reverse-engineered legacy Android manifest validation node to ensure backward-compatible auth flow
- Stack: Go/Gin, Node.js, Scala/Finatra, MySQL, MongoDB, Redis, AWS (Lambda / SNS / SQS / S3), Docker, k8s

---

### SWE Skill Enhancement (Gap Year)
**Self-directed** | Dec 2024 – Mar 2026

- Designed and implemented Quorum Election Simulator in Go: heartbeat-based leader election with automatic dead-node detection and majority-vote removal, context-driven graceful shutdown, CLI with Cobra, structured logging via Logrus, test coverage with Testify
- Refactoring into fully decentralized RAFT-style consensus: eliminating central quorum entity, migrating to follower/candidate/leader state machine with term-based message ordering, log replication, and leader-driven node culling

---

## Skills

**Languages:** Go, Node.js, Java/Scala, Python

**Technologies:** RESTful APIs, gRPC, MySQL / MongoDB / Redis, AWS (Lambda / SNS / SQS / S3), GCP (Cloud Run / Pub/Sub / Cloud Scheduler), Docker, k8s

**Practices:** DDD, Clean Architecture, Event-Driven Architecture, OAuth 2.0, Idempotency Design

**Tools:** Git, Swagger/OpenAPI, Vim

---

## Languages

- Mandarin Chinese — Native
- English — Fluent
- Japanese — Advanced

---

## Selected Achievements

- VIVERSE Avatar Closet 2.0 showcased at **MWC 2024**
- Led 6-developer team to ship full-stack MVP in 2 months during III Engineering Bootcamp (2022)
- Self-studied Harvard CS50 in parallel with bootcamp to strengthen CS fundamentals
- Sole Taiwanese reviewer for AAA titles incl. FFXII at Testronic Ltd. (London, on-site)
- EGX Rezzed 2019 — indie game prototype with international team (PT, AU, UK)

---

## Education

**MA in Computer Game Design**
Goldsmiths College, London UK | Jul 2018 – Nov 2019

**BA in Digital Technology Design**
National Taipei University of Education | Sep 2012 – Jun 2016

Taipei First Girls' High School | Sep 2009 – Jun 2012

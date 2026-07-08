# Yusa Liu 劉于莎
**Backend Software Engineer | Distributed Systems | SaaS / Fintech**

📍 Taiwan, Global Remote
🐙 https://github.com/yusaanthya

---

## Summary

Backend Software Engineer with 2+ years of production experience across SaaS/metaverse and fintech systems. Strongest in backend API design, distributed workflow reliability, Domain-Driven Design boundaries, event-driven architecture, and pragmatic delivery in large existing codebases. Recent work includes corporate redemption order flows with DDD aggregate state transitions, transactional outbox, Pub/Sub-based asynchronous delivery, webhook audit logs, read-side DTO design, and production-oriented QA handoff.

---

## Experience

### Backend Engineer
**ZONE WALLET** | Mar 2026 – Present | Taipei, TW

- Contributed to corporate redemption order workflows spanning Backstage list/detail/review APIs, DDD aggregate state transitions, review audit logs, transactional outbox domain events, Pub/Sub retry semantics, and partner webhook delivery boundaries.
- Implemented redemption order read APIs and payment-page order information APIs by assembling focused read-side DTOs from existing order/payment-proof data without over-extending write-side domain aggregates.
- Designed and implemented corporate fiat/crypto refund history APIs with pagination, one-year time range validation, status binding, Fireblocks refund filters, and focused unit tests.
- Removed an N+1-style response assembly path in refund history APIs by prefetching token/chain data into maps before formatting records.
- Improved operational data APIs for CIB and Backstage workflows with graceful fallback behavior when dependent market/order-book data was unavailable, separating empty dependency data from true system errors.
- Produced QA handoff and self-test documentation covering request examples, SQL verification, state transitions, domain event persistence, event relay publication, and asynchronous webhook delivery checks in TST.
- Stack: Go, Gin, gRPC, GCP (Cloud Run / Pub/Sub / Cloud Scheduler / Secret Manager), PostgreSQL, Redis, Fireblocks, Sumsub (KYC), Elliptic (AML)

---

### Software Engineer
**HTC VIVERSE** | Nov 2022 – Dec 2024 | Taipei, TW

- Owned avatar core service (Go/Gin + MySQL) serving 5k+ monthly organic visits within a 100+ microservice ecosystem; maintained 6+ legacy services (Scala/Finatra + MongoDB) across 4 business divisions.
- Led multi-region rollout (Global / CN / UAE) for avatar service through semantic versioning and OpenAPI spec; defined location-based routing requirements for DevOps-implemented NGINX policy with centralized RBAC auth.
- Designed reusable event-driven architecture with AWS SNS/SQS + Lambda, enabling two business units to share the same event triggers and Go handler package, reducing duplicate code by ~800 LOC.
- Led DDD boundary refinement for VIVERSE Closet 2.0 by retaining Avatar as a mutable aggregate while redefining Asset as immutable, expanding asset types 1 -> 3 with backward compatibility for future gifting and marketplace scenarios.
- Defined idempotency strategy and scoped transaction boundaries under compressed timeline and vendor unavailability; preserved manual retry/revert paths so failures stayed visible and recoverable without full rollback automation.
- Proposed and drove `asset_ownership` MySQL normalization table, enabling upcoming NFT marketplace and gifting features.
- Extended repository layer with GORM plus targeted raw SQL for complex use-case-specific queries while preserving clean domain/persistence separation.
- Delivered vendor integration and mobile animation editor; coordinated 7 internal and 2 vendor collaborators.
- Stack: Go/Gin, Node.js, Scala/Finatra, MySQL, MongoDB, Redis, AWS (Lambda / SNS / SQS / S3), Docker, Kubernetes

---

### SWE Skill Enhancement
**Self-directed** | Dec 2024 – Mar 2026

- Built Go-based distributed systems practice projects, including a quorum election simulator with heartbeat-based leader election, dead-node detection, majority-vote removal, context-driven shutdown, Cobra CLI, Logrus logging, and Testify-based tests.
- Continued backend fundamentals training through algorithm practice, Clean Architecture exercises, and system design reading focused on consensus, event-driven workflows, and reliability tradeoffs.

---

## Skills

**Languages:** Go, Node.js, Java/Scala, Python

**Backend:** REST APIs, gRPC, event-driven architecture, transactional outbox, webhook delivery, idempotency design

**Data / Infra:** PostgreSQL, MySQL, MongoDB, Redis, GCP Pub/Sub, AWS SNS/SQS/Lambda/S3, Docker, Kubernetes

**Practices:** Domain-Driven Design, Clean Architecture, API design, reliability-oriented testing, QA handoff, technical writing

**Tools:** Git, Swagger/OpenAPI, Vim

---

## Languages

- Mandarin Chinese — Native
- English — Fluent
- Japanese — Advanced

---

## Selected Achievements

- VIVERSE Avatar Closet 2.0 showcased at **MWC 2024**.
- Led 6-developer team to ship a full-stack MVP in 2 months during III Engineering Bootcamp (2022).
- Self-studied Harvard CS50 in parallel with bootcamp to strengthen CS fundamentals.
- Sole Taiwanese reviewer for AAA titles including FFXII at Testronic Ltd. (London, on-site).
- EGX Rezzed 2019 — indie game prototype with international team (PT, AU, UK).

---

## Education

**MA in Computer Game Design**
Goldsmiths College, London UK | Jul 2018 – Nov 2019

**BA in Digital Technology Design**
National Taipei University of Education | Sep 2012 – Jun 2016

Taipei First Girls' High School | Sep 2009 – Jun 2012

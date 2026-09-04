# Yusa Liu 劉于莎
**Backend Software Engineer | Go | Fintech Backend | Distributed Workflows**

Taiwan, Global Remote
GitHub: https://github.com/yusaanthya

---

## Summary

Backend Engineer with production experience in fintech and metaverse platforms, focused on Go services, domain modeling, transactional consistency, idempotent event-driven workflows, and end-to-end feature ownership. Known for turning ambiguous product requirements into executable API contracts, state machines, data models, tests, and cross-functional delivery plans.

---

## Experience

### Backend Software Engineer
**ZONE WALLET** | Mar 2026 – Present | Taipei, TW

- Extended corporate stablecoin redemption review and refund workflows within an existing DDD / transactional-outbox architecture, keeping order state, audit logs, and domain events atomic while downstream refunds, partner webhooks, and address release remained retryable and idempotent.
- Implemented payee eligibility validation for corporate redemption deposits, integrating blacklist, freeze, and KYB checks in business-priority order and separating business-rule failures from infrastructure errors; identified an uncovered duplicate-deposit edge case, aligned its refund behavior with PM and technical stakeholders, and validated the behavior with 30 integration tests.
- Drove the adopted Phase 1 design for fraud-return accounting settlement, reducing initial scope from a multi-system payout workflow to an idempotent post-bank command on existing asset tables while preserving ledger, trust reconciliation, and future crypto-liquidation boundaries.
- Implemented redemption fee calculation with explicit rounding and formatting boundaries, preserving the accounting invariant `gross = fee + net` in storage while keeping API monetary outputs consistent across create and query paths.
- Improved payment-page availability by moving slow external calendar lookups off the request path into a validated Redis last-known-good snapshot with bounded fail-open enrichment.
- Modeled external transfer completion facts in their owning records rather than the redemption order aggregate, keeping order state stable while making operational display, filtering, and sorting consistent.
- Stack: Go, Gin, gRPC, GCP (Cloud Run / Pub/Sub / Cloud Scheduler / Secret Manager), PostgreSQL, Redis, Fireblocks, Sumsub (KYC), Elliptic (AML)

---

### Software Engineer
**HTC VIVERSE** | Nov 2022 – Dec 2024 | Taipei, TW

- Led end-to-end backend design for VIVERSE avatar accessory creation and animation systems, turning UI mocks into service-boundary decisions, resource lifecycles, API contracts, DB schemas, AWS infrastructure needs, and FE / vendor work breakdowns while coordinating 7 cross-functional internal contributors and 2 vendor developers.
- Evaluated new microservice vs. existing asset-service extension paths, choosing a compatibility-preserving design for new accessory and animation resource types while keeping existing avatar and legacy service contracts stable.
- Refined Closet 2.0 domain boundaries by keeping Avatar as mutable editor state, treating Asset as immutable master data, and introducing normalized `asset_ownership` to separate inventory / marketplace / gifting ownership from avatar edits, helping ship Closet 2.0 in 8 months against an original 2-year plan.
- Owned Go/Gin avatar core service and Scala/Finatra legacy integrations across Global / CN / UAE deployments, using OpenAPI specs and semantic versioning to preserve backward-compatible contracts in a 100+ microservice environment.
- Designed a reusable SNS/SQS + Lambda event-handling package shared by two business units, reducing duplicated handler code by approximately 800 lines while standardizing event trigger behavior.
- Prototyped backend avatar assembly and texture optimization using Kubernetes jobs, Node.js, and Basisu/KTX2, reducing texture storage by 30-70% and increasing supported texture resolution from 512x512 to 2K (16x the pixel count) while preserving existing service compatibility.
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
- Diablo II: Resurrected launch campaign drove 400,000+ launch-day engagements before transitioning into software engineering.

---

## Education

**MA in Computer Game Design**
Goldsmiths College, London UK | Jul 2018 – Nov 2019

**BA in Digital Technology Design**
National Taipei University of Education | Sep 2012 – Jun 2016

Taipei First Girls' High School | Sep 2009 – Jun 2012

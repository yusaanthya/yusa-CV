# Yusa Liu

**Backend Software Engineer | Go | Cloud Services & Event-Driven Systems**

Taiwan / Global Remote | [LinkedIn](https://www.linkedin.com/in/yusa-liu-784749176/) | [GitHub](https://github.com/yusaanthya)

## Summary

Go backend engineer building transactional and event-driven services across fintech and platform products. Leads scoped feature and security workstreams across engineering, QA, and operations: clarifies requirements with product, exposes architecture gaps, sequences and delegates work, and stays hands-on in the core implementation.

## Experience

### Backend Software Engineer - ZONE WALLET

Mar 2026 - Present | Taipei / Remote

- Led delivery of the OTC manual-review workflow, clarifying requirements with product management and exposing infrastructure gaps through an architecture diagram; aligned scope and frontend/backend sequencing amid workloads spanning **4 release targets**, built the application-list API and outbox infrastructure, published the review API contract, and delegated review API implementation and self-testing; the workflow passed acceptance testing.
- Led the backend security remediation workstream, translating **82 scan findings into 9 severity-prioritized tickets** and allocating work across a backend, operations, and QA team that grew to 7 people on the same plan, with execution instructions and acceptance criteria.
- Drove requirements-to-QA practices: partnered with the engineering manager to adopt pre-refinement technical review and capacity planning across an **18-person engineering, QA, and product team**, surfacing blockers and deferring unresolved work before sprint commitments, and established structured backend-to-QA handoffs adopted through retrospectives.
- Designed a fraud-return capability from the ground up, separating crypto liquidation from fiat settlement and defining idempotency, reconciliation, and manual-recovery boundaries; **adopted as the baseline for implementation planning**.
- Handled **2 concurrent security workstreams within 3 days**: delivered an API hotfix enforcing user-level authorization on 7 write endpoints and removing 27 obsolete or operational routes, while upgrading Go across 8 repositories through CI blockers, an OpenTelemetry startup incompatibility, and a Cloud Run rollout failure.
- Delivered **2 fiat-refund rule changes** in a reconciliation-sensitive deposit flow, recording bank-failure completion times for audit lookups and blocking refunds at or below the 30 TWD bank fee by reusing an existing review state; after the first merge, traced a 30 TWD-per-deposit trust-account reconciliation shortfall to how blocked records were netted and narrowed the block scope with product and QA.
- Built a **Go/Pub/Sub reminder pipeline reused by 2 campaigns**, combining cancellation-aware publisher rate limiting with a uniquely keyed send-history ledger to suppress retries of recorded deliveries.

### Software Engineer - HTC VIVERSE

Nov 2022 - Dec 2024 | Taipei

- Designed database schemas, resource lifecycles, and API contracts for avatar accessories and animations, with state-based idempotency guards for AWS SQS-driven vendor integration; enabled parallel implementation across **7 internal contributors and 2 vendor developers**.
- Redefined Closet 2.0's avatar, asset, and ownership boundaries to separate mutable editor state from reusable assets and inventory ownership, helping deliver the release in **8 months against an original 2-year plan**. Showcased at MWC 2024.
- Integrated an AWS SNS/SQS/Lambda event flow and built a reusable Lambda handler; the integration approach and handler were **adopted by 2 business units**.
- Implemented an API-triggered texture-conversion workflow using on-demand Kubernetes Jobs and EFS scratch storage; repackaged GLB textures with Basis Universal UASTC encoding in KTX2 containers, increasing supported resolution from **512×512 to 2K**.
- Developed and maintained the Go/Gin avatar service within a **100+ microservice ecosystem**, using layered design and mockable repository interfaces for testing while preserving backward-compatible contracts through OpenAPI and semantic versioning.

## Projects

### AI-Assisted Engineering Harness

- Built reusable Claude Code and Codex workflows spanning requirements, specifications, task planning, and implementation, with **independent critic review** grounded in code evidence and acceptance criteria, bounded review rounds, and human confirmation gates; applied the workflows in backend development at ZONE WALLET.

### NiCE2 Event Navigation PWA

Aug 2026

- Productized a community-built navigation tool for a 3,000-stall event into an offline-capable PWA on Cloudflare Pages, hardening JSON import and rendering against malformed input and XSS and managing cache expiry and retirement; served **51.67k HTTP requests over 4 public days**.

### Go Quorum Election Simulator

Dec 2024 - Mar 2026; refactored Oct 2026 | [GitHub repository](https://github.com/yusaanthya/quorum-election-simulator)

- Refactored a Go (Golang) leader-election simulator by **separating Raft state transitions from goroutines, timers, and messaging**, enabling deterministic unit tests and fixing same-term double voting and concurrent state-access races.

## Skills

- **Languages & APIs:** Go (Golang), Gin, Java/Scala, Node.js, Python, REST APIs, OpenAPI
- **Cloud & Data:** PostgreSQL, MySQL, MongoDB, Redis, GCP Pub/Sub, Cloud Scheduler, AWS SNS/SQS/Lambda, Docker, Kubernetes
- **Engineering Practices:** Transactional outbox, idempotency, unit and integration testing, API compatibility, Claude Code and Codex workflows

## Education and Languages

- MA, Computer Game Design - Goldsmiths, University of London | 2018-2019
- BA, Digital Technology Design - National Taipei University of Education | 2012-2016
- Taipei First Girls' High School | 2009-2012
- Mandarin Chinese: Native | English: Fluent | Japanese: Advanced

## Earlier Career Highlight

- Diablo II: Resurrected launch campaign drove **400,000+ launch-day engagements** before transitioning into software engineering.

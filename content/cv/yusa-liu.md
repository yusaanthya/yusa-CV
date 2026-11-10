# Yusa Liu

**Backend Software Engineer | Go | Cloud Services & Event-Driven Systems**

Taiwan / Global Remote | [LinkedIn](https://www.linkedin.com/in/yusa-liu-784749176/) | [GitHub](https://github.com/yusaanthya)

## Summary

Go (Golang) backend engineer building new features, REST APIs, and event-driven integrations across fintech and metaverse platforms. Uses test-driven development (TDD) and leads cross-functional delivery, with experience maintaining an avatar service in a 100+ microservice ecosystem.

## Experience

### Backend Software Engineer - ZONE WALLET

Mar 2026 - Present | Taipei / Remote

- Led a backend vulnerability-remediation workstream across a 7-person backend, operations, and QA team, triaging source-scan findings into prioritized tickets with assignments and acceptance criteria; High-priority tickets passed QA ahead of the policy deadline, and the team implemented the remaining changes **2 sprints ahead of plan**.
- Led an OTC manual-review workflow **through acceptance testing**, identifying missing event infrastructure and sequencing frontend/backend work with product; built the Go application-list API and extended the existing transactional outbox pattern to a new domain, published the review API contract, and delegated review API implementation and self-testing to another backend engineer.
- Drove requirements-to-QA practices: partnered with the engineering manager to adopt pre-refinement technical review and capacity planning across an **18-person engineering, QA, and product team**, surfacing blockers and deferring unresolved work before sprint commitments, and established structured backend-to-QA handoffs adopted through retrospectives.
- Built a reusable Go reminder pipeline on Google Cloud Pub/Sub and PostgreSQL, supporting **2 production campaigns** with cancellation-aware publisher rate limiting and a uniquely keyed campaign/user send-history ledger, checked before sending so retries skip already-recorded sends.
- Designed a fraud-return capability from the ground up, separating crypto liquidation from fiat settlement and defining idempotency, reconciliation, and manual-recovery boundaries; **adopted as the baseline for implementation planning**.
- Delivered **2 concurrent security workstreams within 3 days**: strengthened user-level API authorization across 7 write endpoints and retired 27 route registrations while upgrading Go microservices and internal tools across 8 repositories, resolving CI, OpenTelemetry startup, and Cloud Run deployment compatibility issues.
- Delivered **2 fiat-refund changes** covering audit timestamps and fee handling, reusing an existing review state; before production release, traced downstream reconciliation effects of the state reuse and refined the implementation scope with product and QA.

### Software Engineer - HTC VIVERSE

Nov 2022 - Dec 2024 | Taipei

- Designed new avatar outfit and animation-library backend capabilities from the ground up, defining schemas, resource lifecycles, and API contracts for parallel work across **7 internal contributors and 2 vendor developers**; integrated avatar/outfit state synchronization with the vendor's backend using AWS SQS and state-based idempotency guards.
- Designed the backend domain model for the new Closet 2.0 feature, separating mutable avatar state from reusable assets and inventory ownership; helped the team deliver Closet 2.0 in **8 months against an original 2-year plan**. Showcased at MWC 2024.
- Integrated an AWS SNS/SQS/Lambda event flow and built a reusable Lambda handler; the integration approach and handler were adopted by **2 engineering teams: platform and feature**.
- Built a Node.js texture-conversion job for a new avatar feature, started as a Kubernetes Job only on API request so compute-intensive processing runs on demand; used Three.js to extract and repackage GLB textures with Basis Universal UASTC encoding in KTX2, expanding supported resolution from **512×512 to 2K**.
- Developed and maintained the Go/Gin avatar service in a **100+ microservice ecosystem** using test-driven development (TDD) and mockable repository interfaces; preserved backward compatibility through OpenAPI contracts and semantic versioning.

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

- **Languages & APIs:** Go (Golang), Gin, Java/Scala, Node.js, Python, REST APIs, gRPC, OpenAPI
- **Cloud & Data:** SQL, PostgreSQL, MySQL, MongoDB, Redis, GCP Pub/Sub, Cloud Scheduler, Cloud Run, AWS SNS/SQS/Lambda, Docker, Kubernetes
- **Engineering Practices:** Idempotency, API compatibility, Claude Code and Codex workflows
- **Testing:** Test-driven development (TDD), behavior-driven development (BDD), scenario-based feature testing, change-impact analysis, unit and integration testing, mocking
- **3D Processing & Rendering:** Three.js, GLB, KTX2 / Basis Universal, 3D model and texture rendering fundamentals
- **Domain Experience:** VR / metaverse platforms

## Education and Languages

- MA, Computer Game Design - Goldsmiths, University of London | 2018-2019
- BA, Digital Technology Design - National Taipei University of Education | 2012-2016
- Taipei First Girls' High School | 2009-2012
- Mandarin Chinese: Native | English: Fluent | Japanese: Advanced

## Earlier Career Highlight

- Diablo II: Resurrected launch campaign drove **400,000+ launch-day engagements** before transitioning into software engineering.

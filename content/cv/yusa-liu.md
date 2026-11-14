# Yusa Liu

**Backend Software Engineer | Go | Fintech | Distributed Workflows**

Taiwan / Global Remote | [LinkedIn](https://www.linkedin.com/in/yusa-liu-784749176/) | [GitHub](https://github.com/yusaanthya)

## Summary

Go (Golang) backend engineer building new features, REST APIs, and event-driven integrations across fintech and metaverse platforms. Uses test-driven development (TDD) and leads cross-functional delivery, with experience as primary backend engineer for an avatar service in a 100+ microservice ecosystem.

## Experience

### Backend Software Engineer - ZONE WALLET

Mar 2026 - Present | Taipei / Remote

- Led a backend vulnerability-remediation workstream across a 7-person backend, operations, and QA team, triaging source-scan findings into prioritized tickets with assignments and acceptance criteria; High-priority tickets passed QA ahead of the policy deadline, and the team implemented the remaining changes **2 sprints ahead of plan**.
- Led delivery of an OTC manual-review workflow **through acceptance testing**, resolving missing event dependencies and sequencing frontend/backend work with product. Built the Go application-list API, extended the existing transactional outbox to the new domain, and published the review API contract before delegating review implementation and self-testing to another backend engineer.
- Drove requirements-to-QA practices: partnered with the engineering manager to adopt pre-refinement technical review and capacity planning across an **18-person engineering, QA, and product team**, surfacing blockers and deferring unresolved work before sprint commitments, and established structured backend-to-QA handoffs adopted through retrospectives.
- Built a reusable Go reminder pipeline on Google Cloud Pub/Sub and PostgreSQL, supporting **2 production campaigns** with cancellation-aware publisher rate limiting and a uniquely keyed campaign/user send-history ledger, checked before sending so retries skip already-recorded sends.
- Delivered **2 concurrent security workstreams within 3 days**: strengthened user-level API authorization across 7 write endpoints and retired 27 route registrations while upgrading Go microservices and internal tools across 8 repositories, resolving CI, OpenTelemetry startup, and Cloud Run deployment compatibility issues.
- Designed a fraud-return capability from the ground up, separating crypto liquidation from fiat settlement and defining idempotency, reconciliation, and manual-recovery boundaries; **adopted as the baseline for implementation planning**.
- Delivered **2 fiat-refund changes** covering audit timestamps and fee handling, reusing an existing review state; before production release, traced downstream reconciliation effects of the state reuse and refined the implementation scope with product and QA.

### Software Engineer - HTC VIVERSE

Nov 2022 - Dec 2024 | Taipei

- Designed avatar outfit and animation-library backend features from the ground up, defining database schemas, resource lifecycles, and API contracts that let **7 internal contributors and 2 vendor developers** work in parallel; synchronized avatar/outfit state with the vendor's backend over AWS SQS with state-based idempotency guards.
- Led backend domain modeling for the new Closet 2.0 feature, applying domain-driven design (DDD) to promote Asset from an avatar attribute to a standalone entity with normalized ownership records, separating mutable avatar state from inventory ownership; helped the team deliver Closet 2.0 in **8 months against an original 2-year plan**. Showcased at MWC 2024.
- Delivered the backend changes that let the Closet 2.0 beta meet a 1-month launch deadline while vendor APIs were still pending: integrated the internal point service, redesigned the frontend-initiated request sequence, and, with product, prioritized asset-data integrity over deduction timing, accepting a bounded manual-refund path for the free-credit beta.
- Proposed and designed an event-driven AWS SNS/SQS/Lambda fan-out for a regional partner's account-deletion requirement, **adopted by both owning teams** after design review: defined the deletion-event contract the account service publishes, delivered the avatar-side deletion, and built a Lambda handler that the feature team reused by subscribing to the same topic.
- Designed an asynchronous texture-conversion pipeline to raise avatar texture support from **512×512 to 2K**, with AWS SQS feeding on-demand Kubernetes Jobs off the API request path; built the Node.js proof of concept, implemented part of the Three.js/KTX2 conversion, and handed it over through documentation and a knowledge-transfer session.
- Developed and maintained the Go/Gin and MySQL avatar service as its primary backend engineer, serving REST APIs to internal and vendor backend-for-frontend (BFF) services in a **100+ microservice ecosystem**; applied TDD with mockable repository interfaces and kept changes backward compatible through OpenAPI contracts and semantic versioning.

## Projects

### AI-Assisted Engineering Harness

- Built reusable Claude Code and Codex workflows spanning requirements, specifications, task planning, and implementation, with **independent critic review** grounded in code evidence and acceptance criteria, bounded review rounds, and human confirmation gates; applied the workflows in backend development at ZONE WALLET.

### NiCE2 Event Navigation PWA

Aug 2026

- Productized a community-built navigation tool for a 3,000-stall event into an installable offline PWA on Cloudflare Pages; secured JSON import and rendering against malformed input and XSS, managed Service Worker cache expiry and retirement, and served **51.67k HTTP requests over 4 public days**.

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

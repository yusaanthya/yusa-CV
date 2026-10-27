# Yusa Liu

**Backend Software Engineer | Go | Cloud Services & Event-Driven Systems**

Taiwan / Global Remote | [LinkedIn](https://www.linkedin.com/in/yusa-liu-784749176/) | [GitHub](https://github.com/yusaanthya)

## Summary

Go backend engineer building transactional and event-driven services across fintech and platform products. Turns ambiguous requirements into system designs and testable APIs, with cross-functional feature ownership and team-adopted delivery practices.

## Experience

### Backend Software Engineer - ZONE WALLET

Mar 2026 - Present | Taipei / Remote

- Implemented corporate redemption review and refund flows within an existing **transactional outbox**, keeping state, audit logs, and events atomic; clarified duplicate-deposit handling and separated eligibility failures from infrastructure retries in the deposit webhook path, validated by 30 eligibility integration tests.
- Fixed **2 KYC data-consistency defects** in a vendor-integrated draft-first workflow, preserving operator-edited due-diligence fields and routing SMS to the current draft contact; verified with preservation tests and a UAT webhook regression.
- Led the backend workstream of a quarterly security scan, translating **82 findings into 9 severity-prioritized tickets** and defining execution steps and acceptance criteria across backend, operations, and QA.
- Designed a fraud-return capability from the ground up, separating crypto liquidation from fiat settlement and defining idempotency, reconciliation, and manual-recovery boundaries; **adopted as the baseline for implementation planning**.
- Improved requirements-to-QA delivery by partnering with the engineering manager on pre-refinement technical review and capacity planning across an **18-person engineering, QA, and product team**, and establishing backend-to-QA handoffs adopted through retrospectives.
- Built a **Go/Pub/Sub reminder pipeline reused by 2 campaigns**, combining cancellation-aware publisher rate limiting with a uniquely keyed send-history ledger to suppress retries of recorded deliveries.

### Software Engineer - HTC VIVERSE

Nov 2022 - Dec 2024 | Taipei

- Developed and maintained the Go/Gin avatar service within a **100+ microservice ecosystem**, using layered design and mockable repository interfaces for testing while preserving backward-compatible contracts through OpenAPI and semantic versioning.
- Redefined Closet 2.0's avatar, asset, and ownership boundaries to separate mutable editor state from reusable assets and inventory ownership, helping deliver the release in **8 months against an original 2-year plan**. Showcased at MWC 2024.
- Designed database schemas, resource lifecycles, and API contracts for avatar accessories and animations, with state-based idempotency guards for AWS SQS-driven vendor integration; enabled parallel implementation across **7 internal contributors and 2 vendor developers**.
- Implemented an API-triggered texture-conversion workflow using on-demand Kubernetes Jobs and EFS scratch storage; repackaged GLB textures with Basis Universal UASTC encoding in KTX2 containers, increasing supported resolution from **512×512 to 2K**.
- Integrated an AWS SNS/SQS/Lambda event flow and built a reusable Lambda handler; the integration approach and handler were **adopted by 2 business units**.

## Projects

### AI-Assisted Engineering Harness

- Built reusable Claude Code and Codex workflows spanning requirements, specifications, task planning, and implementation, with **independent critic review** grounded in code evidence and acceptance criteria, bounded review rounds, and human confirmation gates; applied the workflows in backend development at ZONE WALLET.

### NiCE2 Event Navigation PWA

Aug 2026

- Productized a community-built navigation tool for a 3,000-stall event into an offline-capable PWA on Cloudflare Pages, hardening JSON import and rendering against malformed input and XSS and managing cache expiry and retirement; served **51.67k HTTP requests over 4 public days**.

### Go Quorum Election Simulator

Dec 2024 - Mar 2026

- Built a **Go concurrency simulator** modeling heartbeat-based failure detection, vote-based member removal, and leader reselection, with injectable timing and messaging interfaces for node-failure and insufficient-vote tests.

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

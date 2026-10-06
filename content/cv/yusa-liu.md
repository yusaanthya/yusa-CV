# Yusa Liu

**Backend Software Engineer | Go | Fintech | Distributed Workflows**

Taiwan / Global Remote | [github.com/yusaanthya](https://github.com/yusaanthya)

## Summary

Go backend engineer with fintech and platform experience, owning feature design, cross-functional delivery, and team workflow improvements. Builds transactional and event-driven services within complex existing systems.

## Experience

### Backend Software Engineer - ZONE WALLET

Mar 2026 - Present | Taipei / Remote

- Designed a new fraud-return capability from the ground up, separating crypto liquidation from fiat settlement and defining idempotency, reconciliation, and manual-recovery boundaries; the design was adopted as the baseline for subsequent research and implementation planning.
- Drove adoption of pre-refinement technical review and capacity planning across an 18-person engineering, QA, and product team, partnering with the engineering manager to help the team prioritize ready work, identify blockers, and defer unresolved tickets before sprint commitments.
- Implemented corporate redemption review and refund flows within an existing transactional outbox, keeping state, audit logs, and events atomic; separated eligibility failures from retryable infrastructure errors and resolved duplicate-deposit precedence, validated by 30 eligibility integration tests.
- Built a Go/Pub/Sub reminder pipeline reused by two campaigns, combining cancellation-aware publisher rate limiting, persistent send-history deduplication, and explicit retry boundaries to throttle publishing and suppress repeat sends without retrying successful sends solely on recording failures.

### Software Engineer - HTC VIVERSE

Nov 2022 - Dec 2024 | Taipei

- Designed backend database schemas, resource lifecycles, and API contracts for avatar accessories and animations, with state-based idempotency guards for AWS SQS-driven vendor integration; enabled parallel implementation across 7 internal contributors and 2 vendor developers.
- Developed and maintained the Go/Gin avatar service within a 100+ microservice ecosystem, applying layered design and mockable repository interfaces for business-logic testing while preserving backward-compatible contracts through OpenAPI and semantic versioning.
- Redefined Closet 2.0's avatar, asset, and ownership boundaries to separate mutable editor state from reusable assets and inventory ownership, helping deliver the release in 8 months against an original 2-year plan.
- Built a shared SNS/SQS and Lambda event-handling package adopted by two business units, replacing duplicated handlers and removing approximately 800 lines of repeated code.

## Projects

### NiCE2 Event Navigation PWA

Aug 2026

- Productized a community-built navigation tool for a 3,000-stall event into an offline-capable PWA on Cloudflare Pages, hardening JSON import and rendering against malformed input and XSS and managing cache expiry and retirement; served 51.67k HTTP requests over four public days.

### Go Quorum Election Simulator

Dec 2024 - Mar 2026

- Built a Go concurrency simulator modeling heartbeat-based failure detection, vote-based member removal, and leader reselection, with injectable timing and messaging interfaces for node-failure and insufficient-vote tests.

## Skills

- Go, Java/Scala, Node.js, Python | REST, Gin, API contracts, transactional outbox, idempotency
- PostgreSQL, MySQL, MongoDB, Redis | GCP Pub/Sub, Cloud Scheduler, AWS SNS/SQS/Lambda, Docker, Kubernetes

## Education and Languages

- MA, Computer Game Design - Goldsmiths, University of London | 2018-2019
- BA, Digital Technology Design - National Taipei University of Education | 2012-2016
- Taipei First Girls' High School | 2009-2012
- Mandarin Chinese: Native | English: Fluent | Japanese: Advanced

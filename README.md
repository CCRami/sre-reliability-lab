# SRE Reliability Lab

SRE Reliability Lab is a reproducible Kubernetes portfolio environment for practicing service-level objectives, telemetry correlation, actionable alerting, capacity analysis, bounded fault injection, incident response, and disaster recovery.

The implementation is intentionally evidence-driven: performance and reliability claims are documented only after a repeatable test or drill produces an artifact.

> The application, platform, and lab exercises are being delivered through milestone pull requests. See the repository pull requests for the implementation history.

## Safety

Fault injection is disabled by default and may run only against the lab's explicitly marked disposable kind cluster. Never use the lab's chaos commands against production or an unknown Kubernetes context.

## License

Apache-2.0.

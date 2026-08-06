# Bounded chaos

Chaos Mesh is absent from normal bootstrap and is installed only through the acknowledged `make chaos-install` target. Experiments are allow-listed, target `sre-lab`, have a manifest duration no longer than 60 seconds, and are deleted by a shell trap after a maximum 90-second observation window.

The runner verifies all of these independent guards:

1. current context is exactly `kind-sre-reliability-lab`;
2. the named kind cluster exists and uses the `sre-reliability-lab` prefix;
3. namespace `sre-lab` has `sre-lab/disposable=true`;
4. `CHAOS_ACK=I_UNDERSTAND_SRE_LAB_IS_DISPOSABLE` is explicit;
5. the experiment name is in the committed allow-list;
6. the critical journey is healthy before injection.

Three consecutive gateway readiness failures abort an experiment. Every manifest records a hypothesis, abort threshold, expected telemetry, namespace/label blast radius, and duration. Use `chaos/results/TEMPLATE.md` immediately after a run; never infer an outcome from the intended hypothesis.

```bash
CHAOS_ACK=I_UNDERSTAND_SRE_LAB_IS_DISPOSABLE make chaos-install
CHAOS_ACK=I_UNDERSTAND_SRE_LAB_IS_DISPOSABLE make chaos-run EXPERIMENT=pod-termination
```

Toxiproxy is provided as an optional, non-routed deployment for future dependency-specific drills. Applications are never silently switched through it; a drill must explicitly change and restore the relevant dependency URL.

# Capacity methodology

Capacity statements in this repository must come from `scripts/run-load.sh`; the ignored raw directory contains the k6 summary and an environment manifest for every run. Curated reports copy only aggregate values and retain the `classification`, git SHA, timestamps, cluster topology, rate, and duration.

## Profiles

| Profile  | Purpose                     | Default shape             |
| -------- | --------------------------- | ------------------------- |
| smoke    | CI and routing validation   | 5 iterations              |
| baseline | steady-state reference      | 2 orders/s for 5 minutes  |
| stress   | locate throughput knee      | 5, 15, then 30 orders/s   |
| spike    | recovery from discontinuity | 2 to 40 to 2 orders/s     |
| soak     | leaks and slow saturation   | 3 orders/s for 30 minutes |

The throughput knee is the first stage where acceptance p95 or the 1% failure threshold is crossed, queue age grows throughout a constant-rate stage, or CPU/database-pool saturation stops tracking throughput linearly. The safe per-replica range is at most 70% of the last stage below that knee and must be rerun after resource, concurrency, or dependency changes.

No portfolio performance number is valid until a measured report exists under `evidence/load/`. Hardware and virtualized Docker limits make results comparable only when their metadata matches.

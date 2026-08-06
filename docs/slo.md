# Service objectives

The primary journey is order acceptance and the asynchronous journey is fulfillment freshness. All objectives use a rolling 28-day period.

| SLO          | Objective | Good event                              | Reasoning                                                                                   |
| ------------ | --------: | --------------------------------------- | ------------------------------------------------------------------------------------------- |
| Availability |       99% | Eligible `POST /api/orders` returns 2xx | Meaningful budget for a single-node teaching lab with deliberate faults                     |
| Latency      |       95% | Successful order request ≤ 500 ms       | Tight enough to expose dependency latency without pretending to be an internet-scale target |
| Fulfillment  |       99% | Completed work finishes ≤ 30 s          | Detects degraded async processing separately from acceptance                                |

Client `4xx` responses are excluded from availability. Alerts require at least five eligible events in their evaluation window. Queue backlog separately covers the zero-completion blind spot of a completion-based fulfillment SLI.

Sloth generates recording and multi-window alert rules. Page windows are 5m/1h at 14.4× and 30m/6h at 6×; ticket windows are 2h/1d at 3× and 6h/3d at 1×. Promtool tests validate minimum-volume and fast-burn behavior.

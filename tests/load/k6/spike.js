import { commonThresholds, orderJourney } from "./journey.js";

export const options = {
  scenarios: {
    spike: {
      executor: "ramping-arrival-rate",
      startRate: 1,
      timeUnit: "1s",
      preAllocatedVUs: Number(__ENV.PREALLOCATED_VUS || 30),
      maxVUs: Number(__ENV.MAX_VUS || 200),
      stages: [
        { target: Number(__ENV.NORMAL_RATE || 2), duration: __ENV.WARMUP_DURATION || "2m" },
        { target: Number(__ENV.SPIKE_RATE || 40), duration: __ENV.SPIKE_DURATION || "1m" },
        { target: Number(__ENV.NORMAL_RATE || 2), duration: __ENV.RECOVERY_DURATION || "3m" },
      ],
    },
  },
  thresholds: commonThresholds,
};

export default orderJourney;

import { commonThresholds, orderJourney } from "./journey.js";

export const options = {
  scenarios: {
    stress: {
      executor: "ramping-arrival-rate",
      startRate: Number(__ENV.START_RATE || 1),
      timeUnit: "1s",
      preAllocatedVUs: Number(__ENV.PREALLOCATED_VUS || 20),
      maxVUs: Number(__ENV.MAX_VUS || 150),
      stages: [
        { target: Number(__ENV.STAGE1_RATE || 5), duration: __ENV.STAGE_DURATION || "3m" },
        { target: Number(__ENV.STAGE2_RATE || 15), duration: __ENV.STAGE_DURATION || "3m" },
        { target: Number(__ENV.STAGE3_RATE || 30), duration: __ENV.STAGE_DURATION || "3m" },
        { target: 0, duration: __ENV.RECOVERY_DURATION || "2m" },
      ],
    },
  },
  thresholds: commonThresholds,
};

export default orderJourney;

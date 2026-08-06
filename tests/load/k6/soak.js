import { commonThresholds, orderJourney } from "./journey.js";

export const options = {
  scenarios: {
    soak: {
      executor: "constant-arrival-rate",
      rate: Number(__ENV.RATE || 3),
      timeUnit: "1s",
      duration: __ENV.DURATION || "30m",
      preAllocatedVUs: Number(__ENV.PREALLOCATED_VUS || 20),
      maxVUs: Number(__ENV.MAX_VUS || 100),
    },
  },
  thresholds: commonThresholds,
};

export default orderJourney;

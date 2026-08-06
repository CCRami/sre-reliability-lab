import { orderJourney } from "./journey.js";

export const options = {
  vus: 1,
  iterations: Number(__ENV.ITERATIONS || 5),
  thresholds: { http_req_failed: ["rate<0.01"], checks: ["rate>0.99"] },
};

export default orderJourney;

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 1,
  iterations: 5,
  thresholds: { http_req_failed: ["rate<0.01"], http_req_duration: ["p(95)<1000"] },
};

const baseUrl = __ENV.BASE_URL || "http://localhost:8080";

export default function () {
  const response = http.post(
    `${baseUrl}/api/orders`,
    JSON.stringify({ productId: "11111111-1111-4111-8111-111111111111", quantity: 1 }),
    { headers: { "content-type": "application/json" }, tags: { journey: "order-acceptance" } },
  );
  check(response, { "order accepted": (r) => r.status === 202 });
  sleep(0.2);
}

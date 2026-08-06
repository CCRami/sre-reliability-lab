import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = __ENV.BASE_URL || "http://host.docker.internal:8080";
const productId = __ENV.PRODUCT_ID || "11111111-1111-4111-8111-111111111111";

export function orderJourney() {
  const accepted = http.post(
    `${baseUrl}/api/orders`,
    JSON.stringify({ productId, quantity: Number(__ENV.QUANTITY || 1) }),
    {
      headers: { "content-type": "application/json" },
      tags: { journey: "order-acceptance", normalized_route: "/api/orders" },
    },
  );
  const acceptedOk = check(accepted, { "order accepted": (response) => response.status === 202 });
  if (!acceptedOk) return;

  const orderId = accepted.json("orderId");
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const order = http.get(`${baseUrl}/api/orders/${orderId}`, {
      tags: { journey: "fulfillment", normalized_route: "/api/orders/:id" },
    });
    if (check(order, { "order lookup succeeds": (response) => response.status === 200 })) {
      const status = order.json("status");
      if (status === "fulfilled") {
        check(order, { "order fulfilled": () => true });
        return;
      }
      if (status === "failed") {
        check(order, { "order not failed": () => false });
        return;
      }
    }
    sleep(0.25);
  }
  check(null, { "order fulfilled before timeout": () => false });
}

export const commonThresholds = {
  http_req_failed: ["rate<0.01"],
  "http_req_duration{journey:order-acceptance}": ["p(95)<500"],
  checks: ["rate>0.99"],
};

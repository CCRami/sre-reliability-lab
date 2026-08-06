import { createServer, DependencyError, listen, requiredEnv } from "@lab/common";

const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>SRE Reliability Lab</title><style>body{font:16px system-ui;max-width:780px;margin:4rem auto;padding:0 1rem;background:#0b1220;color:#dbeafe}button,input{font:inherit;padding:.6rem}pre{background:#111827;padding:1rem;border-radius:.5rem;overflow:auto}.card{border:1px solid #334155;padding:1.2rem;border-radius:.7rem}</style></head>
<body><h1>SRE Reliability Lab</h1><div class="card"><p>Create an order through the instrumented critical journey.</p><label>Quantity <input id="q" type="number" min="1" max="20" value="1"></label> <button id="go">Create order</button><pre id="out">Ready.</pre></div>
<script>document.getElementById('go').onclick=async()=>{const out=document.getElementById('out');out.textContent='Submitting…';const r=await fetch('/api/orders',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({productId:'11111111-1111-4111-8111-111111111111',quantity:Number(document.getElementById('q').value)})});const v=await r.json();out.textContent=JSON.stringify(v,null,2);if(v.orderId){let done=false;while(!done){await new Promise(x=>setTimeout(x,500));const s=await fetch('/api/orders/'+v.orderId).then(x=>x.json());out.textContent=JSON.stringify(s,null,2);done=s.status!=='pending'}}};</script></body></html>`;

async function proxy(url: string, init?: RequestInit): Promise<{ status: number; body: unknown }> {
  try {
    const response = await fetch(url, { ...init, signal: AbortSignal.timeout(2_000) });
    const body = await response.json();
    return { status: response.status, body };
  } catch (error) {
    throw new DependencyError(`Upstream request to ${new URL(url).host} failed`, { cause: error });
  }
}

export async function start(): Promise<void> {
  const catalogUrl = requiredEnv("CATALOG_URL");
  const ordersUrl = requiredEnv("ORDERS_URL");
  const app = createServer("gateway", async () => {
    const responses = await Promise.all([
      fetch(`${catalogUrl}/health/ready`, { signal: AbortSignal.timeout(1_000) }),
      fetch(`${ordersUrl}/health/ready`, { signal: AbortSignal.timeout(1_000) }),
    ]);
    if (responses.some((response) => !response.ok)) throw new Error("upstream not ready");
  });

  app.get("/", async (_request, reply) => reply.type("text/html").send(page));
  app.get("/api/products/:id", async (request, reply) => {
    const result = await proxy(`${catalogUrl}/products/${(request.params as { id: string }).id}`);
    return reply.code(result.status).send(result.body);
  });
  app.post("/api/orders", async (request, reply) => {
    const result = await proxy(`${ordersUrl}/orders`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request.body),
    });
    return reply.code(result.status).send(result.body);
  });
  app.get("/api/orders/:id", async (request, reply) => {
    const result = await proxy(`${ordersUrl}/orders/${(request.params as { id: string }).id}`);
    return reply.code(result.status).send(result.body);
  });
  await listen(app, 8080);
}

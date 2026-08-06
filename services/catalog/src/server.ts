import { createDatabasePool, createServer, listen, NotFoundError } from "@lab/common";
import { z } from "zod";

const productParams = z.object({ id: z.uuid() });

export async function start(): Promise<void> {
  const pool = createDatabasePool();
  const app = createServer("catalog", async () => {
    await pool.query("SELECT 1");
  });

  app.get("/products/:id", async (request) => {
    const { id } = productParams.parse(request.params);
    const result = await pool.query<{
      id: string;
      name: string;
      price_cents: number;
    }>("SELECT id, name, price_cents FROM products WHERE id = $1", [id]);
    const product = result.rows[0];
    if (!product) throw new NotFoundError(`Product ${id} does not exist`);
    return { id: product.id, name: product.name, priceCents: product.price_cents };
  });

  app.addHook("onClose", async () => pool.end());
  await listen(app, 8081);
}

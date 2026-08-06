export const fulfillmentUpdateSql = `UPDATE orders SET status = 'fulfilled', updated_at = now()
WHERE id = $1 AND status = 'pending' RETURNING created_at`;

export function retryDelayMs(attempt: number): number {
  return Math.min(5_000, 100 * 2 ** attempt);
}

export function shouldDeadLetter(nextAttempt: number, maxAttempts: number): boolean {
  return nextAttempt >= maxAttempts;
}

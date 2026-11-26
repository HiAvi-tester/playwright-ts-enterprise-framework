import { randomUUID } from 'node:crypto';

/**
 * Short unique token for test data on shared public demos, e.g. "a3f9c2e1".
 * UUID-based, so it is collision-safe across parallel workers and CI shards.
 */
export function uid(length = 8): string {
  return randomUUID().replace(/-/g, '').slice(0, length);
}

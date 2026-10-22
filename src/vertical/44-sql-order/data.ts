/**
 * A shop's orders table: 1,000 orders from 100 customers, seeded so the
 * same rows come out every time. `scripts/measure-sql-order.mjs` loads
 * exactly these rows into Postgres and runs the query on them, and the
 * Blender scene draws exactly these rows, one card each, so the picture
 * and the database are the same data.
 */

export const ORDERS = 1000;

/** One hundred first names, one per customer. */
export const CUSTOMERS = [
  "Aiko",
  "Amara",
  "Ana",
  "Arjun",
  "Ava",
  "Ben",
  "Bilal",
  "Bo",
  "Carla",
  "Chen",
  "Chloe",
  "Dara",
  "David",
  "Diego",
  "Elena",
  "Eli",
  "Emma",
  "Erik",
  "Esra",
  "Fatima",
  "Felix",
  "Grace",
  "Hana",
  "Hugo",
  "Ines",
  "Isaac",
  "Ivy",
  "Jade",
  "Jamal",
  "Jin",
  "Jonas",
  "Julia",
  "Kai",
  "Kemal",
  "Kiran",
  "Lara",
  "Leo",
  "Lina",
  "Luca",
  "Mai",
  "Malik",
  "Maria",
  "Mateo",
  "Maya",
  "Mei",
  "Mia",
  "Milan",
  "Mina",
  "Musa",
  "Nadia",
  "Nia",
  "Nico",
  "Noah",
  "Nora",
  "Olga",
  "Omar",
  "Owen",
  "Paolo",
  "Priya",
  "Quinn",
  "Rafael",
  "Rami",
  "Rhea",
  "Rosa",
  "Ruby",
  "Sam",
  "Sara",
  "Sean",
  "Sina",
  "Sofia",
  "Suki",
  "Tara",
  "Teo",
  "Theo",
  "Tomas",
  "Uma",
  "Vera",
  "Victor",
  "Wen",
  "Will",
  "Xena",
  "Yara",
  "Yuki",
  "Yusuf",
  "Zara",
  "Zoe",
  "Adil",
  "Bea",
  "Cyrus",
  "Dina",
  "Ezra",
  "Femi",
  "Gita",
  "Hiro",
  "Iris",
  "Joel",
  "Kofi",
  "Lena",
  "Mira",
  "Nils",
] as const;

export type Status = "paid" | "pending" | "refunded";

export type Order = {
  readonly id: number;
  readonly customer: string;
  readonly status: Status;
  /** Cents, so the sums are exact. */
  readonly amount: number;
};

/** A small seeded generator (mulberry32). */
const random = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Six orders in ten are paid; the rest are waiting or refunded. */
export const orders = (): Order[] => {
  const rng = random(44);
  return Array.from({ length: ORDERS }, (_, i) => {
    const customer = CUSTOMERS[Math.floor(rng() * CUSTOMERS.length)];
    const s = rng();
    const status: Status = s < 0.6 ? "paid" : s < 0.85 ? "pending" : "refunded";
    const amount = 500 + Math.floor(rng() * 19501);
    return { id: i + 1, customer, status, amount };
  });
};

/** The query the reel is about, as it is written. */
export const QUERY = [
  "SELECT customer, sum(amount) AS total",
  "FROM orders",
  "WHERE status = 'paid'",
  "GROUP BY customer",
  "HAVING count(*) >= 8",
  "ORDER BY total DESC",
  "LIMIT 5;",
] as const;

/** The order Postgres works through those lines: SELECT is fifth. */
export const STEP_OF_LINE = [5, 1, 2, 3, 4, 6, 7] as const;

/**
 * The same query worked through by hand, step by step, in the order
 * Postgres does it. The script checks every count against Postgres.
 */
export const steps = (rows: readonly Order[] = orders()) => {
  const where = rows.filter((o) => o.status === "paid");
  const groups = new Map<string, Order[]>();
  for (const o of where)
    groups.set(o.customer, [...(groups.get(o.customer) ?? []), o]);
  const having = [...groups].filter(([, g]) => g.length >= 8);
  const select = having.map(([customer, g]) => ({
    customer,
    total: g.reduce((a, o) => a + o.amount, 0),
    count: g.length,
  }));
  const ordered = [...select].sort((a, b) => b.total - a.total);
  const limit = ordered.slice(0, 5);
  return {
    from: rows.length,
    where: where.length,
    groups: groups.size,
    having: having.length,
    ordered,
    limit,
    groupOf: groups,
  };
};

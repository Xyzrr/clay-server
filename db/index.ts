import { Pool } from "pg";

const pool = new Pool(
  process.env.DATABASE_URL == null
    ? { host: "localhost" }
    : {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
);

export const query = (text: string, params: any) => {
  return pool.query(text, params);
};

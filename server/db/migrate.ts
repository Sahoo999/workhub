import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { pool } from "../src/db/client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDirectory = path.join(__dirname, "migrations");

const runMigrations = async (): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const files = (await fs.readdir(migrationsDirectory))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const { rows: executedMigrations } = await pool.query<{
    filename: string;
  }>("SELECT filename FROM schema_migrations ORDER BY id");

  const executed = new Set(
    executedMigrations.map((migration) => migration.filename),
  );

  for (const filename of files) {
    if (executed.has(filename)) {
      continue;
    }

    const filePath = path.join(migrationsDirectory, filename);
    const sql = await fs.readFile(filePath, "utf8");

    console.log(`Running migration: ${filename}`);

    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(sql);

      await client.query(
        "INSERT INTO schema_migrations (filename) VALUES ($1)",
        [filename],
      );

      await client.query("COMMIT");

      console.log(`Completed migration: ${filename}`);
    } catch (error) {
      await client.query("ROLLBACK");

      console.error(`Failed migration: ${filename}`);
      throw error;
    } finally {
      client.release();
    }
  }

  console.log("Migrations complete.");
};

runMigrations()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
// Script para aplicar migraciones en Turso (libsql)
// Uso: node scripts/migrate-turso.mjs
import { createClient } from "@libsql/client";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("❌ TURSO_DATABASE_URL no está definida en .env");
  process.exit(1);
}

const client = createClient({ url, authToken });

// Crear tabla de control de migraciones (si no existe)
await client.execute(`
  CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                  TEXT PRIMARY KEY NOT NULL,
    "checksum"            TEXT NOT NULL,
    "finished_at"         DATETIME,
    "migration_name"      TEXT NOT NULL,
    "logs"                TEXT,
    "rolled_back_at"      DATETIME,
    "started_at"          DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
  )
`);

// Leer migraciones ya aplicadas
const applied = await client.execute(
  `SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL`
);
const appliedNames = new Set(applied.rows.map((r) => r.migration_name));

// Leer carpeta de migraciones
const migrationsDir = join(__dirname, "../prisma/migrations");
const folders = readdirSync(migrationsDir)
  .filter((f) => !f.startsWith(".") && f !== "migration_lock.toml")
  .sort();

let applied_count = 0;

for (const folder of folders) {
  if (appliedNames.has(folder)) {
    console.log(`⏭  Ya aplicada: ${folder}`);
    continue;
  }

  const sqlPath = join(migrationsDir, folder, "migration.sql");
  const sql = readFileSync(sqlPath, "utf-8");

  console.log(`⏳ Aplicando: ${folder}`);

  try {
    // Ejecutar cada sentencia SQL por separado
    // Primero quitar las líneas de comentario (--), luego separar por ;
    const sqlSinComentarios = sql
      .split("\n")
      .filter((line) => !line.trimStart().startsWith("--"))
      .join("\n");

    const statements = sqlSinComentarios
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      await client.execute(stmt);
    }

    // Registrar migración como aplicada
    await client.execute({
      sql: `INSERT INTO "_prisma_migrations" (id, checksum, migration_name, finished_at, applied_steps_count)
            VALUES (?, ?, ?, datetime('now'), 1)`,
      args: [
        crypto.randomUUID(),
        folder, // checksum simplificado
        folder,
      ],
    });

    console.log(`✅ Aplicada: ${folder}`);
    applied_count++;
  } catch (err) {
    console.error(`❌ Error en ${folder}:`, err.message);
    process.exit(1);
  }
}

if (applied_count === 0) {
  console.log("✅ La base de datos ya está al día.");
} else {
  console.log(`\n🎉 ${applied_count} migración(es) aplicada(s) correctamente.`);
}

client.close?.();

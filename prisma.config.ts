import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  // `prisma generate` (postinstall, CI) needs no database, so a missing URL is allowed there;
  // migrate/seed against the placeholder fail with a connection error.
  datasource: { url: process.env.DATABASE_URL ?? "postgresql://unset@localhost:5432/unset" },
});

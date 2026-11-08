import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { disconnectPrisma } from "./lib/prisma.js";

const app = createApp();
const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`LedgerFlow API listening on http://localhost:${env.PORT}`);
});

async function shutdown(signal: string) {
  // eslint-disable-next-line no-console
  console.log(`Shutting down (${signal})...`);
  server.close(async () => {
    await disconnectPrisma().catch(() => undefined);
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

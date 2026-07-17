import Fastify from "fastify";
import { env } from "./config/telegram.js";
import webhookRoute from "./routes/webhook.js";

export const app = Fastify({ logger: true });

app.register(webhookRoute, { prefix: "/webhook" });

export default async (req: any, res: any) => {
  await app.ready();
  app.server.emit("request", req, res);

  return new Promise((resolve, reject) => {
    res.once("finish", resolve);
    res.once("error", reject);
  });
};

if (process.env.VERCEL !== "1") {
  const start = async () => {
    try {
      await app.listen({ port: env.PORT, host: "0.0.0.0" });
      app.log.info(`Server running on port ${env.PORT}`);
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  };

  start();
}

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { handleUpdate } from "../bot/handlers.js";
import { env } from "../config/telegram.js";

export default async function webhookRoute(fastify: FastifyInstance) {
  fastify.post<{ Body: { message?: unknown } }>(
    `/${env.WEBHOOK_SECRET}`,
    async (_request: FastifyRequest, reply: FastifyReply) => {
      await handleUpdate(_request, reply);
      return reply.status(200).send();
    }
  );
}

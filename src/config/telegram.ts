import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import { z } from "zod";

const EnvSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  WEBHOOK_SECRET: z.string().min(1),
  WEBHOOK_URL: z.string().url().optional().default(""),
  PORT: z.coerce.number().default(3000),
});

const env = EnvSchema.parse({
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
  WEBHOOK_URL: process.env.WEBHOOK_URL,
  PORT: process.env.PORT,
});

const bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, { polling: false });

export { bot, env };

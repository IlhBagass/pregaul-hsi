import { bot, env } from "../config/telegram.js";

export async function setWebhook() {
  const webhookUrl = `${env.WEBHOOK_URL}/${env.WEBHOOK_SECRET}`;
  await bot.setWebHook(webhookUrl);
  console.log(`Webhook set to ${webhookUrl}`);
}

export async function removeWebhook() {
  await bot.deleteWebHook();
  console.log("Webhook removed");
}

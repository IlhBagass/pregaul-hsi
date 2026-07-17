import { FastifyRequest, FastifyReply } from "fastify";
import { bot } from "../config/telegram.js";
import { botService } from "../services/bot.service.js";
import { UploadService } from "../services/upload.service.js";

const uploadService = new UploadService();

export async function handleUpdate(request: FastifyRequest, _reply: FastifyReply) {
  try {
    const body = request.body as { message?: unknown };
    const message = body.message as
      | {
          chat?: { id?: number };
          document?: { file_name?: string; file_id?: string };
          text?: string;
        }
      | undefined;

    if (!message || !message.chat?.id) {
      return;
    }

    const chatId = message.chat.id;
    const text = message.text?.trim();

    if (text === "/start" || text === "/analyzelos") {
      await botService.resetSession(chatId);
      await bot.sendMessage(chatId, "Silakan upload file PREGAUL.xlsx");
      return;
    }

    if (message.document) {
      const fileName = message.document.file_name ?? "";
      if (!uploadService.validateExcel(fileName)) {
        await bot.sendMessage(chatId, "Hanya file Excel (.xlsx) yang diperbolehkan.");
        return;
      }

      const fileId = message.document.file_id;
      if (!fileId) {
        await bot.sendMessage(chatId, "Upload gagal.");
        return;
      }

      try {
        const buffer = await uploadService.downloadFile(bot, fileId);
        await botService.handleUpload(chatId, buffer);
      } catch {
        await bot.sendMessage(chatId, "Upload gagal.");
      }

      return;
    }

    await bot.sendMessage(chatId, "Kirim /analyzelos untuk memulai.");
  } catch (error) {
    console.error("Handler error", error);
  }
}

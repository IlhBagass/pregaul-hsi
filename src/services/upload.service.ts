import { readFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import TelegramBot from "node-telegram-bot-api";

export class UploadService {
  async downloadFile(bot: TelegramBot, fileId: string): Promise<Buffer> {
    const tempDir = tmpdir();
    const localPath = await bot.downloadFile(fileId, tempDir);
    const buffer = await readFile(localPath);
    await unlink(localPath);
    return buffer;
  }

  validateExcel(fileName: string): boolean {
    return fileName.toLowerCase().endsWith(".xlsx");
  }
}

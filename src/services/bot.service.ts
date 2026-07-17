import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { PregaulService } from "./pregaul.service.js";
import { IBoosterService } from "./ibooster.service.js";
import { AnalyzeLosService } from "./analyze.service.js";
import { ExcelService } from "./excel.service.js";
import { pregaulRepository } from "../repositories/pregaul.repository.js";
import { iboosterRepository } from "../repositories/ibooster.repository.js";
import { SessionState } from "../types/index.js";
import { bot } from "../config/telegram.js";

const sessions = new Map<number, SessionState>();

export class BotService {
  private pregaulService: PregaulService;
  private iboosterService: IBoosterService;
  private analyzeService: AnalyzeLosService;
  private excelService: ExcelService;

  constructor() {
    this.pregaulService = new PregaulService();
    this.iboosterService = new IBoosterService();
    this.analyzeService = new AnalyzeLosService(pregaulRepository, iboosterRepository);
    this.excelService = new ExcelService();
  }

  async resetSession(chatId: number) {
    sessions.set(chatId, { step: "awaiting_pregaul", pregaulBuffer: undefined, iboosterBuffer: undefined });
  }

  async handleUpload(chatId: number, buffer: Buffer) {
    const session = sessions.get(chatId) ?? { step: "awaiting_pregaul" as const };

    if (session.step === "awaiting_pregaul") {
      sessions.set(chatId, { step: "awaiting_ibooster", pregaulBuffer: buffer, iboosterBuffer: undefined });
      await bot.sendMessage(chatId, "PREGAUL berhasil diterima.\n\nSilakan upload file IBOOSTER.xlsx");
      return;
    }

    if (session.step === "awaiting_ibooster") {
      sessions.set(chatId, {
        step: "idle",
        pregaulBuffer: session.pregaulBuffer,
        iboosterBuffer: buffer,
      });
      await bot.sendMessage(chatId, "IBOOSTER berhasil diterima.\n\nMemulai proses analisis...");
      await this.processAnalysis(chatId, session.pregaulBuffer!, buffer);
      return;
    }

    await bot.sendMessage(chatId, "Kirim /analyzelos untuk memulai.");
  }

  private async processAnalysis(chatId: number, pregaulBuffer: Buffer, iboosterBuffer: Buffer) {
    const totalStart = Date.now();
    try {
      await bot.sendMessage(chatId, "📄 Reading PREGAUL...");
      const t1 = Date.now();
      const pregaulRows = await this.pregaulService.parse(pregaulBuffer);
      console.log(`Upload PREGAUL selesai: ${pregaulRows.length} rows (${Date.now() - t1}ms)`);

      await bot.sendMessage(chatId, "📄 Reading IBOOSTER...");
      const t2 = Date.now();
      const iboosterRows = await this.iboosterService.parse(iboosterBuffer);
      console.log(`Upload IBOOSTER selesai: ${iboosterRows.length} rows (${Date.now() - t2}ms)`);

      await bot.sendMessage(chatId, "💾 Saving Database...");
      const t3 = Date.now();
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await pregaulRepository.clear(tx);
        await pregaulRepository.createMany(pregaulRows, tx);
        await iboosterRepository.clear(tx);
        await iboosterRepository.createMany(iboosterRows, tx);
      });
      console.log(`Database saved: ${pregaulRows.length} PREGAUL + ${iboosterRows.length} IBOOSTER (${Date.now() - t3}ms)`);

      await bot.sendMessage(chatId, "🔍 Analyze LOS...");
      const t4 = Date.now();
      const results = await this.analyzeService.analyze();
      console.log(`Analyze LOS selesai: ${results.length} results (${Date.now() - t4}ms)`);

      await bot.sendMessage(chatId, "📊 Generate Excel...");
      const t5 = Date.now();
      const excelBuffer = await this.excelService.generate(results);
      console.log(`Generate Excel selesai (${Date.now() - t5}ms)`);

      await bot.sendMessage(chatId, "📤 Sending Result...");
      await bot.sendDocument(chatId, Buffer.from(excelBuffer), undefined, { filename: "AnalyzeLOS.xlsx" });

      console.log(`Total durasi: ${Date.now() - totalStart}ms`);
    } catch (error) {
      console.error("Analysis error", error);
      const message = error instanceof Error ? error.message : "Terjadi kesalahan.";
      if (this.isDatabaseError(error)) {
        await bot.sendMessage(chatId, "Database Error.");
      } else {
        await bot.sendMessage(chatId, message);
      }
    } finally {
      sessions.set(chatId, { step: "idle", pregaulBuffer: undefined, iboosterBuffer: undefined });
    }
  }

  private isDatabaseError(error: unknown): boolean {
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      return (
        msg.includes("database") ||
        msg.includes("prisma") ||
        msg.includes("connection") ||
        msg.includes("query")
      );
    }
    return false;
  }
}

export const botService = new BotService();

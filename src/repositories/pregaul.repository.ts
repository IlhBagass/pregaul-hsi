import { PrismaClient, Prisma } from "@prisma/client";
import { PregaulRow } from "../types/index.js";

export class PregaulRepository {
  async createMany(rows: PregaulRow[], tx: Prisma.TransactionClient) {
    if (rows.length === 0) return;
    await tx.staging_pregaul.createMany({
      data: rows.map((r) => ({
        service_no: r.service_no,
        reported_date: r.reported_date,
      })),
      skipDuplicates: true,
    });
  }

  async clear(tx: Prisma.TransactionClient) {
    await tx.staging_pregaul.deleteMany();
  }
}

export const pregaulRepository = new PregaulRepository();

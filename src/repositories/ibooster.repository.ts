import { Prisma } from "@prisma/client";
import { IBoosterRowInput } from "../types/index.js";

export class IBoosterRepository {
  async createMany(rows: IBoosterRowInput[], tx: Prisma.TransactionClient) {
    if (rows.length === 0) return;
    await tx.staging_ibooster.createMany({
      data: rows.map((r) => ({
        nd: r.nd,
        onu_link_status: r.onu_link_status,
      })),
      skipDuplicates: true,
    });
  }

  async clear(tx: Prisma.TransactionClient) {
    await tx.staging_ibooster.deleteMany();
  }
}

export const iboosterRepository = new IBoosterRepository();

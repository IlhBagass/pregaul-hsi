import { Prisma } from "@prisma/client";
import { PregaulRepository } from "../repositories/pregaul.repository.js";
import { IBoosterRepository } from "../repositories/ibooster.repository.js";
import { LosResult } from "../types/index.js";

const RESULT_MAP: Record<string, string> = {
  LOS: "LOS",
  Online: "NORMAL",
  "Dying Gasp": "DYING GASP",
  "Power Off": "POWER OFF",
};

interface RawJoinRow {
  service_no: string;
  reported_date: string;
  onu_link_status: string | null;
}

export class AnalyzeLosService {
  constructor(
    private pregaulRepo: PregaulRepository,
    private iboosterRepo: IBoosterRepository
  ) {}

  async analyze(): Promise<LosResult[]> {
    const rows = await this.queryJoin();
    return rows.map((r) => ({
      service_no: r.service_no,
      reported_date: r.reported_date,
      onu_link_status: r.onu_link_status ?? "NULL",
      result: r.onu_link_status ? (RESULT_MAP[r.onu_link_status] ?? "NOT FOUND") : "NOT FOUND",
    }));
  }

  private async queryJoin(): Promise<
    { service_no: number; reported_date: string; onu_link_status: string | null }[]
  > {
    const { prisma } = await import("../config/prisma.js");
    const result: RawJoinRow[] = await prisma.$queryRaw<RawJoinRow[]>`
      SELECT p.service_no, p.reported_date, i.onu_link_status
      FROM staging_pregaul p
      LEFT JOIN staging_ibooster i ON p.service_no = i.nd
    `;

    return result.map((r) => ({
      service_no: Number(r.service_no),
      reported_date: r.reported_date,
      onu_link_status: r.onu_link_status,
    }));
  }
}

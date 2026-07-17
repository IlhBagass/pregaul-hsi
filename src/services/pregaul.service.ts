import { PregaulRow } from "../types/index.js";
import { parsePregaul } from "../utils/parser.js";

export class PregaulService {
  async parse(buffer: Buffer): Promise<PregaulRow[]> {
    const rows = await parsePregaul(buffer);
    if (rows.length === 0) {
      throw new Error("Data kosong.");
    }
    return rows;
  }
}

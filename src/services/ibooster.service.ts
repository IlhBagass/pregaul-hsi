import { IBoosterRowInput } from "../types/index.js";
import { parseIBooster } from "../utils/parser.js";

export class IBoosterService {
  async parse(buffer: Buffer): Promise<IBoosterRowInput[]> {
    const rows = await parseIBooster(buffer);
    if (rows.length === 0) {
      throw new Error("Data kosong.");
    }
    return rows;
  }
}

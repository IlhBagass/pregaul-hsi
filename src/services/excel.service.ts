import { LosResult } from "../types/index.js";
import { generateLosExcel } from "../utils/excel.js";

export class ExcelService {
  async generate(results: LosResult[]): Promise<Buffer> {
    if (results.length === 0) {
      throw new Error("Data kosong.");
    }
    return await generateLosExcel(results);
  }
}

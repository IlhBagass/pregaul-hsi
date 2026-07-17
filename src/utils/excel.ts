import ExcelJS from "exceljs";
import { LosResult } from "../types/index.js";

export async function generateLosExcel(results: LosResult[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("AnalyzeLOS");

  sheet.columns = [
    { header: "SERVICE_NO", key: "service_no", width: 20 },
    { header: "REPORTED_DATE", key: "reported_date", width: 20 },
    { header: "ONU_LINK_STATUS", key: "onu_link_status", width: 20 },
    { header: "RESULT", key: "result", width: 20 },
  ];

  sheet.getRow(1).font = { bold: true };

  for (const row of results) {
    sheet.addRow({
      service_no: row.service_no,
      reported_date: row.reported_date,
      onu_link_status: row.onu_link_status,
      result: row.result,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

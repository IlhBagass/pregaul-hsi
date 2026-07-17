import ExcelJS from "exceljs";
import { PregaulRow } from "../types/index.js";

export async function parsePregaul(buffer: Buffer): Promise<PregaulRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);

  const sheet = workbook.getWorksheet(1);
  if (!sheet) {
    return [];
  }

  const headers = getHeaders(sheet);
  const serviceNoIdx = headers.findIndex((h) => h.toLowerCase() === "service_no");
  const reportedDateIdx = headers.findIndex((h) => h.toLowerCase() === "reported_date");

  if (serviceNoIdx === -1) {
    throw new Error("Missing SERVICE_NO column");
  }
  if (reportedDateIdx === -1) {
    throw new Error("Missing REPORTED_DATE column");
  }

  const rows: PregaulRow[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const serviceNoCell = row.getCell(serviceNoIdx + 1);
    const reportedDateCell = row.getCell(reportedDateIdx + 1);

    const serviceNo = Number(serviceNoCell.value);
    const reportedDateVal = reportedDateCell.value;

    if (!serviceNo || Number.isNaN(serviceNo)) {
      return;
    }

    let reportedDate: Date;
    if (reportedDateVal instanceof Date) {
      reportedDate = reportedDateVal;
    } else if (typeof reportedDateVal === "number") {
      const date = new Date((reportedDateVal - 25569) * 86400 * 1000);
      reportedDate = date;
    } else if (typeof reportedDateVal === "string") {
      reportedDate = new Date(reportedDateVal);
    } else {
      reportedDate = new Date(String(reportedDateVal));
    }

    rows.push({
      service_no: serviceNo,
      reported_date: reportedDate,
    });
  });

  return rows;
}

export async function parseIBooster(buffer: Buffer): Promise<{
  nd: number;
  onu_link_status: string;
}[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);

  const sheet = workbook.getWorksheet(1);
  if (!sheet) {
    return [];
  }

  const headers = getHeaders(sheet);
  const ndIdx = headers.findIndex((h) => h.toLowerCase() === "nd");
  const onuLinkIdx = headers.findIndex((h) => h.toLowerCase() === "onu link status");

  if (ndIdx === -1) {
    throw new Error("Missing ND column");
  }
  if (onuLinkIdx === -1) {
    throw new Error("Missing ONU Link Status column");
  }

  const rows: { nd: number; onu_link_status: string }[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const ndCell = row.getCell(ndIdx + 1);
    const onuLinkCell = row.getCell(onuLinkIdx + 1);

    const nd = Number(ndCell.value);
    const onuLinkStatus = String(onuLinkCell.value || "").trim();

    if (!nd || Number.isNaN(nd)) {
      return;
    }

    rows.push({
      nd,
      onu_link_status: onuLinkStatus,
    });
  });

  return rows;
}

function getHeaders(sheet: ExcelJS.Worksheet): string[] {
  const headers: string[] = [];
  const firstRow = sheet.getRow(1);
  firstRow.eachCell((cell) => {
    headers.push(String(cell.value ?? "").trim());
  });
  return headers;
}

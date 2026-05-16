import { google } from "googleapis";
import type { Order } from "@prisma/client";

function isSheetsConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.GOOGLE_SHEETS_ID
  );
}

const SHEET_NAME = "접수목록";
const HEADERS = [
  "고유코드", "접수일시", "고객명", "연락처", "이메일",
  "필름종류", "포맷", "수량", "EI", "스캔타입",
  "현상프로세스", "증감", "수령방법", "상태", "메모",
];

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheets() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

export async function ensureSheetHeaders() {
  if (!isSheetsConfigured()) return;
  const sheets = getSheets();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!A1:O1`,
  });

  if (!res.data.values || res.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [HEADERS] },
    });
  }
}

export async function appendOrderToSheet(order: Order): Promise<number> {
  if (!isSheetsConfigured()) return -1;
  const sheets = getSheets();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  const row = [
    order.uniqueCode,
    new Date(order.createdAt).toLocaleString("ko-KR"),
    order.customerName,
    order.phone,
    order.email,
    order.filmType,
    order.format,
    order.quantity,
    order.ei ?? "",
    order.scanType,
    order.process,
    order.pushPull,
    order.pickupMethod,
    order.status,
    order.notes ?? "",
  ];

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET_NAME}!A:O`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });

  const updatedRange = res.data.updates?.updatedRange ?? "";
  const match = updatedRange.match(/(\d+)$/);
  return match ? parseInt(match[1]) : -1;
}

export async function updateOrderStatusInSheet(rowIndex: number, status: string) {
  if (rowIndex < 0 || !isSheetsConfigured()) return;
  const sheets = getSheets();
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
    range: `${SHEET_NAME}!N${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: { values: [[status]] },
  });
}

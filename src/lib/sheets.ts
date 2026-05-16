import { google } from "googleapis";
import type { Order } from "@prisma/client";
import type { FilmItem } from "@/types/order";

const SHEET_NAME = "접수목록";
const HEADERS = [
  "고유코드", "접수일시", "고객명", "연락처", "이메일",
  "필름목록", "수령방법", "반송주소", "상태", "메모",
];

function isSheetsConfigured(): boolean {
  return !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SHEETS_ID);
}

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
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.GOOGLE_SHEETS_ID!, range: `${SHEET_NAME}!A1:J1` });
  if (!res.data.values || res.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [HEADERS] },
    });
  }
}

export async function appendOrderToSheet(order: Order): Promise<number> {
  if (!isSheetsConfigured()) return -1;
  const sheets = getSheets();
  const items = (order.filmItems ?? []) as FilmItem[];
  const filmSummary = items.map((i) => `${i.filmType}(${i.format})×${i.quantity} ${i.process}`).join(" | ");

  const row = [
    order.uniqueCode,
    new Date(order.createdAt).toLocaleString("ko-KR"),
    order.customerName, order.phone, order.email,
    filmSummary, order.pickupMethod,
    order.deliveryAddress ?? "",
    order.status,
    order.notes ?? "",
  ];

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
    range: `${SHEET_NAME}!A:J`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });

  const match = (res.data.updates?.updatedRange ?? "").match(/(\d+)$/);
  return match ? parseInt(match[1]) : -1;
}

export async function updateOrderStatusInSheet(rowIndex: number, status: string) {
  if (rowIndex < 0 || !isSheetsConfigured()) return;
  await getSheets().spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
    range: `${SHEET_NAME}!I${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: { values: [[status]] },
  });
}

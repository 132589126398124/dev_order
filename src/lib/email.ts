import { Resend } from "resend";
import { SHOP_NAME } from "@/lib/shop";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function isEmailConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function emailWrapper(body: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;padding:32px">
<tr><td>
${body}
<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
<p style="color:#94a3b8;font-size:12px;margin:0">본 메일은 자동 발송되었습니다.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function sendEditLink(email: string, customerName: string, uniqueCode: string, editToken: string) {
  const link = `${APP_URL}/order/edit/${editToken}`;
  if (!isEmailConfigured()) {
    console.log(`[EMAIL SKIP] edit link for ${email}: ${link}`);
    return;
  }
  await getResend().emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: `[${SHOP_NAME}] 접수 내역 수정 링크 - ${uniqueCode}`,
    html: emailWrapper(`
      <p style="margin:0 0 16px">${escapeHtml(customerName)}님, 안녕하세요.</p>
      <p style="margin:0 0 8px">접수 내역 수정 링크입니다. <strong>48시간</strong> 이내에 사용해주세요.</p>
      <p style="margin:0 0 16px">고유코드: <strong style="font-family:monospace">${escapeHtml(uniqueCode)}</strong></p>
      <a href="${link}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600">접수 내역 수정하기</a>
    `),
  });
}

export async function sendStatusNotification(
  email: string,
  customerName: string,
  uniqueCode: string,
  orderId: string,
  status: string
) {
  const trackingUrl = `${APP_URL}/order/${orderId}`;
  const messages: Record<string, { subject: string; body: string }> = {
    SHIPPED: {
      subject: `[${SHOP_NAME}] 필름 수령 확인 - ${uniqueCode}`,
      body: `<p style="margin:0 0 12px">${escapeHtml(customerName)}님의 필름이 도착했습니다.</p><p style="margin:0 0 16px">현상 작업을 곧 시작할 예정입니다. 진행 상황은 아래 링크에서 확인하실 수 있습니다.</p>`,
    },
    PROCESSING: {
      subject: `[${SHOP_NAME}] 현상 작업 시작 - ${uniqueCode}`,
      body: `<p style="margin:0 0 12px">${escapeHtml(customerName)}님의 필름 현상 작업을 시작했습니다.</p><p style="margin:0 0 16px">완료되면 다시 안내 드리겠습니다.</p>`,
    },
    DONE: {
      subject: `[${SHOP_NAME}] 현상 완료 - ${uniqueCode}`,
      body: `<p style="margin:0 0 12px">${escapeHtml(customerName)}님의 현상이 완료되었습니다.</p><p style="margin:0 0 16px">선택하신 수령 방법에 따라 발송 또는 방문 준비가 완료되었습니다.</p>`,
    },
    CANCELLED: {
      subject: `[${SHOP_NAME}] 접수 취소 - ${uniqueCode}`,
      body: `<p style="margin:0 0 12px">${escapeHtml(customerName)}님의 접수(${escapeHtml(uniqueCode)})가 취소되었습니다.</p><p style="margin:0 0 16px">문의사항이 있으시면 연락 주세요.</p>`,
    },
    EXPIRED: {
      subject: `[${SHOP_NAME}] 접수 만료 안내 - ${uniqueCode}`,
      body: `<p style="margin:0 0 12px">${escapeHtml(customerName)}님의 접수(${escapeHtml(uniqueCode)})가 만료되었습니다.</p><p style="margin:0 0 16px">접수 후 일정 기간 내 필름이 도착하지 않아 자동으로 만료 처리되었습니다. 재접수를 원하시면 다시 신청해주세요.</p>`,
    },
  };

  const msg = messages[status];
  if (!msg) return;

  if (!isEmailConfigured()) {
    console.log(`[EMAIL SKIP] status notification: ${email} → ${status}`);
    return;
  }

  await getResend().emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: msg.subject,
    html: emailWrapper(`
      ${msg.body}
      <a href="${trackingUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600">접수 상세 보기</a>
      <p style="margin:16px 0 0;color:#64748b;font-size:13px">고유코드: <strong style="font-family:monospace">${escapeHtml(uniqueCode)}</strong></p>
    `),
  });
}

export async function sendNewOrderNotification(
  adminEmail: string,
  order: { customerName: string; uniqueCode: string; id: string; phone: string }
) {
  if (!isEmailConfigured()) {
    console.log(`[EMAIL SKIP] new order notification to admin ${adminEmail}: ${order.uniqueCode}`);
    return;
  }
  const detailUrl = `${APP_URL}/order/${order.id}`;
  await getResend().emails.send({
    from: process.env.EMAIL_FROM!,
    to: adminEmail,
    subject: `[${SHOP_NAME}] 신규 접수 - ${order.uniqueCode}`,
    html: emailWrapper(`
      <p style="margin:0 0 16px;font-weight:600">새 현상 의뢰가 접수되었습니다.</p>
      <table style="border-collapse:collapse;width:100%;margin-bottom:20px">
        <tr><td style="padding:6px 12px 6px 0;color:#64748b;font-size:13px;white-space:nowrap">고유코드</td><td style="padding:6px 0;font-weight:700;font-family:monospace">${escapeHtml(order.uniqueCode)}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#64748b;font-size:13px;white-space:nowrap">고객명</td><td style="padding:6px 0">${escapeHtml(order.customerName)}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#64748b;font-size:13px;white-space:nowrap">연락처</td><td style="padding:6px 0">${escapeHtml(order.phone)}</td></tr>
      </table>
      <a href="${detailUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600">접수 상세 보기</a>
    `),
  });
}

export async function sendPinResetLink(email: string, username: string, resetToken: string) {
  const link = `${APP_URL}/reset-pin/${resetToken}`;
  if (!isEmailConfigured()) {
    console.log(`[EMAIL SKIP] PIN reset link for ${email}: ${link}`);
    return;
  }
  await getResend().emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: `[${SHOP_NAME}] PIN 재설정 링크`,
    html: emailWrapper(`
      <p style="margin:0 0 16px">${escapeHtml(username)}님, 안녕하세요.</p>
      <p style="margin:0 0 8px">PIN 재설정 링크입니다. <strong>1시간</strong> 이내에 사용해주세요.</p>
      <p style="margin:0 0 16px;color:#64748b;font-size:13px">본인이 요청하지 않았다면 이 이메일을 무시해주세요.</p>
      <a href="${link}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600">PIN 재설정하기</a>
    `),
  });
}

export async function sendOrderConfirmation(email: string, customerName: string, uniqueCode: string) {
  if (!isEmailConfigured()) {
    console.log(`[EMAIL SKIP] confirmation for ${email}, code: ${uniqueCode}`);
    return;
  }
  await getResend().emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: `[${SHOP_NAME}] 접수 완료 - ${uniqueCode}`,
    html: emailWrapper(`
      <p style="margin:0 0 12px">${escapeHtml(customerName)}님, 접수가 완료되었습니다.</p>
      <p style="margin:0 0 8px">고유코드: <strong style="font-family:monospace;font-size:18px;letter-spacing:2px">${escapeHtml(uniqueCode)}</strong></p>
      <p style="margin:0 0 16px;color:#64748b;font-size:13px">택배 발송 시 박스에 고유코드와 연락처를 기재해주세요.</p>
      ${process.env.EMAIL_FROM ? `<p style="margin:0;color:#64748b;font-size:12px">문의: ${escapeHtml(process.env.EMAIL_FROM)}</p>` : ""}
    `),
  });
}

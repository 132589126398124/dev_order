import { Resend } from "resend";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function isEmailConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEditLink(email: string, customerName: string, uniqueCode: string, editToken: string) {
  const link = `${APP_URL}/order/edit/${editToken}`;
  if (!isEmailConfigured()) {
    console.log(`[EMAIL SKIP] edit link for ${email}: ${link}`);
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM = process.env.EMAIL_FROM!;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `[KDL현상소] 접수 내역 수정 링크 - ${uniqueCode}`,
    html: `
      <p>${customerName}님, 안녕하세요.</p>
      <p>접수 내역 수정 링크입니다. <strong>48시간</strong> 이내에 사용해주세요.</p>
      <p><a href="${link}">${link}</a></p>
      <p>고유코드: <strong>${uniqueCode}</strong></p>
      <hr/>
      <p style="color:#888;font-size:12px;">본 메일은 자동 발송되었습니다.</p>
    `,
  });
}

export async function sendOrderConfirmation(email: string, customerName: string, uniqueCode: string) {
  if (!isEmailConfigured()) {
    console.log(`[EMAIL SKIP] confirmation for ${email}, code: ${uniqueCode}`);
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM = process.env.EMAIL_FROM!;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `[KDL현상소] 접수 완료 - ${uniqueCode}`,
    html: `
      <p>${customerName}님, 접수가 완료되었습니다.</p>
      <p>고유코드: <strong>${uniqueCode}</strong></p>
      <p>택배 발송 시 박스에 고유코드와 연락처를 기재해주세요.</p>
      <hr/>
      <p style="color:#888;font-size:12px;">문의: ${FROM}</p>
    `,
  });
}

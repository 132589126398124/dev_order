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
      subject: `[KDL현상소] 필름 수령 확인 - ${uniqueCode}`,
      body: `<p>${customerName}님의 필름이 도착했습니다.</p><p>현상 작업을 곧 시작할 예정입니다. 진행 상황은 아래 링크에서 확인하실 수 있습니다.</p>`,
    },
    PROCESSING: {
      subject: `[KDL현상소] 현상 작업 시작 - ${uniqueCode}`,
      body: `<p>${customerName}님의 필름 현상 작업을 시작했습니다.</p><p>완료되면 다시 안내 드리겠습니다.</p>`,
    },
    DONE: {
      subject: `[KDL현상소] 현상 완료 - ${uniqueCode}`,
      body: `<p>${customerName}님의 현상이 완료되었습니다.</p><p>선택하신 수령 방법에 따라 발송 또는 방문 준비가 완료되었습니다.</p>`,
    },
    CANCELLED: {
      subject: `[KDL현상소] 접수 취소 - ${uniqueCode}`,
      body: `<p>${customerName}님의 접수(${uniqueCode})가 취소되었습니다.</p><p>문의사항이 있으시면 연락 주세요.</p>`,
    },
  };

  const msg = messages[status];
  if (!msg) return; // PENDING / EXPIRED 등은 알림 없음

  if (!isEmailConfigured()) {
    console.log(`[EMAIL SKIP] status notification: ${email} → ${status}`);
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM = process.env.EMAIL_FROM!;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: msg.subject,
    html: `
      ${msg.body}
      <p><a href="${trackingUrl}">접수 상세 보기</a></p>
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

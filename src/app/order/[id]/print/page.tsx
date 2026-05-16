import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PrintPage({ params }: Props) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) notFound();

  const createdAt = format(order.createdAt, "yyyy년 MM월 dd일 HH:mm", { locale: ko });

  return (
    <html lang="ko">
      <head>
        <title>의뢰서 - {order.uniqueCode}</title>
        <style>{`
          @page { size: A4; margin: 20mm; }
          @media print { .no-print { display: none; } body { -webkit-print-color-adjust: exact; } }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Apple SD Gothic Neo', sans-serif; font-size: 13px; color: #111; }
          .header { border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 16px; }
          .title { font-size: 20px; font-weight: 700; }
          .code { font-size: 28px; font-weight: 900; font-family: monospace; letter-spacing: 4px; margin: 8px 0; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 16px; }
          .field label { font-size: 10px; color: #666; display: block; }
          .field span { font-weight: 600; font-size: 14px; }
          .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #666; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 10px; }
          .notes { border: 1px solid #ddd; padding: 10px; border-radius: 4px; min-height: 60px; font-size: 12px; }
          .qr-hint { font-size: 10px; color: #888; margin-top: 24px; text-align: center; }
          .print-btn { position: fixed; bottom: 20px; right: 20px; background: #111; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; }
        `}</style>
      </head>
      <body style={{ padding: "0", background: "white" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "24px" }}>
          <div className="header">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="title">KDL 현상소 — 필름 현상 의뢰서</div>
                <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>{createdAt}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "10px", color: "#666" }}>고유 코드</div>
                <div className="code">{order.uniqueCode}</div>
              </div>
            </div>
          </div>

          <div className="section-title">고객 정보</div>
          <div className="grid" style={{ marginBottom: "20px" }}>
            <div className="field"><label>고객명</label><span>{order.customerName}</span></div>
            <div className="field"><label>연락처</label><span>{order.phone}</span></div>
            <div className="field" style={{ gridColumn: "1/-1" }}><label>이메일</label><span>{order.email}</span></div>
          </div>

          <div className="section-title">필름 정보</div>
          <div className="grid" style={{ marginBottom: "20px" }}>
            <div className="field"><label>필름 종류</label><span>{order.filmType}</span></div>
            <div className="field"><label>포맷</label><span>{order.format}</span></div>
            <div className="field"><label>수량</label><span>{order.quantity}롤</span></div>
            <div className="field"><label>EI (감도)</label><span>{order.ei || "기본값"}</span></div>
          </div>

          <div className="section-title">현상/스캔</div>
          <div className="grid" style={{ marginBottom: "20px" }}>
            <div className="field"><label>현상 프로세스</label><span>{order.process}</span></div>
            <div className="field"><label>스캔 타입</label><span>{order.scanType}</span></div>
            <div className="field"><label>증감</label><span>{order.pushPull === "0" ? "표준" : `${order.pushPull} stop`}</span></div>
            <div className="field"><label>수령 방법</label><span>{order.pickupMethod}</span></div>
          </div>

          {order.notes && (
            <>
              <div className="section-title">요청사항</div>
              <div className="notes">{order.notes}</div>
            </>
          )}

          <div className="qr-hint">
            이 의뢰서를 필름과 함께 동봉해주세요 — 고유 코드: {order.uniqueCode}
          </div>
        </div>

        <button className="print-btn no-print" onClick={() => window.print()}>인쇄</button>
        <script dangerouslySetInnerHTML={{ __html: "document.querySelector('.print-btn').addEventListener('click', () => window.print())" }} />
      </body>
    </html>
  );
}

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { FilmItem } from "@/types/order";
import PrintTrigger from "@/components/order/PrintTrigger";

interface Props { params: Promise<{ id: string }> }

export default async function PrintPage({ params }: Props) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) notFound();

  const filmItems = (order.filmItems ?? []) as FilmItem[];
  const createdAt = format(order.createdAt, "yyyy년 MM월 dd일 HH:mm", { locale: ko });

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
        }
        @page { size: A4; margin: 20mm; }
        body { font-family: -apple-system, 'Apple SD Gothic Neo', sans-serif; background: white; }
      `}</style>

      <PrintTrigger />

      <div style={{ maxWidth: 700, margin: "0 auto", padding: 32 }}>
        {/* Header */}
        <div style={{ borderBottom: "2px solid #111", paddingBottom: 14, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>KDL 현상소 — 필름 현상 의뢰서</div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{createdAt}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#888" }}>고유 코드</div>
            <div style={{ fontSize: 26, fontWeight: 900, fontFamily: "monospace", letterSpacing: 3, marginTop: 2 }}>{order.uniqueCode}</div>
          </div>
        </div>

        {/* 고객 정보 */}
        <div style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>고객 정보</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", marginBottom: 20 }}>
          <div><div style={{ fontSize: 10, color: "#888" }}>고객명</div><div style={{ fontWeight: 600, fontSize: 14 }}>{order.customerName}</div></div>
          <div><div style={{ fontSize: 10, color: "#888" }}>연락처</div><div style={{ fontWeight: 600, fontSize: 14 }}>{order.phone}</div></div>
          <div style={{ gridColumn: "1/-1" }}><div style={{ fontSize: 10, color: "#888" }}>이메일</div><div style={{ fontWeight: 600, fontSize: 13 }}>{order.email}</div></div>
        </div>

        {/* 필름 목록 */}
        <div style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>필름 정보</div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ddd", color: "#888" }}>
              {["#", "필름 종류", "포맷", "수량", "프로세스", "스캔", "증감"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "4px 8px 6px", fontSize: 10, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filmItems.map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "6px 8px", color: "#888" }}>{i + 1}</td>
                <td style={{ padding: "6px 8px", fontWeight: 600 }}>{item.filmType}</td>
                <td style={{ padding: "6px 8px" }}>{item.format}</td>
                <td style={{ padding: "6px 8px" }}>{item.quantity}롤</td>
                <td style={{ padding: "6px 8px" }}>{item.process}</td>
                <td style={{ padding: "6px 8px" }}>{item.scanType}</td>
                <td style={{ padding: "6px 8px" }}>{item.pushPull === "0" ? "표준" : `${item.pushPull} stop`}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 수령/요청 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", marginBottom: 20 }}>
          <div><div style={{ fontSize: 10, color: "#888" }}>수령 방법</div><div style={{ fontWeight: 600, fontSize: 14 }}>{order.pickupMethod}</div></div>
          {order.deliveryAddress && (
            <div><div style={{ fontSize: 10, color: "#888" }}>반송 주소</div><div style={{ fontWeight: 600, fontSize: 13 }}>{order.deliveryAddress}</div></div>
          )}
        </div>

        {order.notes && (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>요청사항</div>
            <div style={{ border: "1px solid #ddd", borderRadius: 6, padding: 10, fontSize: 12, minHeight: 50 }}>{order.notes}</div>
          </>
        )}

        <div style={{ marginTop: 24, textAlign: "center", fontSize: 10, color: "#aaa" }}>
          이 의뢰서를 필름과 함께 동봉해주세요 — 고유 코드: {order.uniqueCode}
        </div>
      </div>

      <div className="no-print" style={{ position: "fixed", bottom: 24, right: 24 }}>
        <button
          onClick={() => window.print()}
          style={{ background: "#111", color: "white", border: "none", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}
        >
          인쇄
        </button>
      </div>
    </>
  );
}

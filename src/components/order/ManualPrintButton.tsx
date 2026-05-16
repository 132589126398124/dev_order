"use client";

export default function ManualPrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{ background: "#111", color: "white", border: "none", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}
    >
      인쇄
    </button>
  );
}

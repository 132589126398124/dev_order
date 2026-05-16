import OrderForm from "@/components/order/OrderForm";
import Script from "next/script";

export const metadata = { title: "접수 신청" };

export default function NewOrderPage() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  return (
    <>
      {siteKey && !siteKey.includes("your-site") && (
        <Script src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`} strategy="beforeInteractive" />
      )}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">필름 현상 접수</h1>
          <p className="text-slate-500 text-sm mt-1">접수 후 필름을 택배로 발송해주세요</p>
        </div>
        <OrderForm />
      </main>
    </>
  );
}

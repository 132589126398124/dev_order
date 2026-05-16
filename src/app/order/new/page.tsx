import OrderForm from "@/components/order/OrderForm";
import Script from "next/script";

export default function NewOrderPage() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  return (
    <>
      {siteKey && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
          strategy="beforeInteractive"
        />
      )}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">필름 현상 접수</h1>
        <p className="text-gray-500 text-sm mb-8">
          접수 후 필름을 택배로 발송해주세요. 접수 확인 이메일이 발송됩니다.
        </p>
        <OrderForm />
      </main>
    </>
  );
}

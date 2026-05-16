"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { orderSchema, OrderFormData } from "@/types/order";

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

interface Props {
  defaultValues?: Partial<OrderFormData>;
  editToken?: string;
}

export default function OrderForm({ defaultValues, editToken }: Props) {
  const router = useRouter();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      pushPull: "0",
      scanType: "JPG",
      process: "C-41",
      format: "135",
      pickupMethod: "택배",
      quantity: 1,
      ...defaultValues,
      recaptchaToken: "pending",
    },
  });

  const onSubmit = async (data: OrderFormData) => {
    let token = "dev-token";
    if (siteKey && siteKey !== "your-site-key") {
      token = await new Promise<string>((resolve) =>
        window.grecaptcha.ready(async () => {
          const t = await window.grecaptcha.execute(siteKey, { action: "submit_order" });
          resolve(t);
        })
      );
    }

    setValue("recaptchaToken", token);
    const payload = { ...data, recaptchaToken: token };

    const url = editToken ? `/api/orders/edit/${editToken}` : "/api/orders";
    const method = editToken ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok) {
      alert(json.error ?? "오류가 발생했습니다");
      return;
    }

    if (editToken) {
      alert("수정이 완료되었습니다.");
      return;
    }

    router.push(`/order/complete/${json.id}?code=${json.uniqueCode}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">고객 정보</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="고객명 *" error={errors.customerName?.message}>
            <input {...register("customerName")} className={inputCls} placeholder="홍길동" />
          </Field>
          <Field label="연락처 *" error={errors.phone?.message}>
            <input {...register("phone")} className={inputCls} placeholder="01012345678" />
          </Field>
        </div>

        <Field label="이메일 *" error={errors.email?.message}>
          <input {...register("email")} type="email" className={inputCls} placeholder="example@email.com" />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">필름 정보</h2>

        <Field label="필름 종류 *" error={errors.filmType?.message}>
          <input {...register("filmType")} className={inputCls} placeholder="Kodak Portra 400, Fuji Superia 등" />
        </Field>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="포맷 *" error={errors.format?.message}>
            <select {...register("format")} className={inputCls}>
              <option value="135">135 (35mm)</option>
              <option value="120">120 (중형)</option>
              <option value="4x5">4x5 (대형)</option>
              <option value="8x10">8x10 (대형)</option>
              <option value="기타">기타</option>
            </select>
          </Field>

          <Field label="수량 *" error={errors.quantity?.message}>
            <input {...register("quantity", { valueAsNumber: true })} type="number" min={1} max={100} className={inputCls} />
          </Field>

          <Field label="EI (감도)" error={errors.ei?.message}>
            <input {...register("ei")} className={inputCls} placeholder="800, 1600..." />
          </Field>

          <Field label="증감" error={errors.pushPull?.message}>
            <select {...register("pushPull")} className={inputCls}>
              <option value="-3">-3 stop</option>
              <option value="-2">-2 stop</option>
              <option value="-1">-1 stop</option>
              <option value="0">표준</option>
              <option value="+1">+1 stop</option>
              <option value="+2">+2 stop</option>
              <option value="+3">+3 stop</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">현상/스캔 옵션</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="현상 프로세스 *" error={errors.process?.message}>
            <select {...register("process")} className={inputCls}>
              <option value="C-41">C-41 (컬러네거티브)</option>
              <option value="ECN-2">ECN-2 (시네마)</option>
              <option value="B&W">B&W (흑백)</option>
              <option value="E-6">E-6 (슬라이드)</option>
              <option value="기타">기타</option>
            </select>
          </Field>

          <Field label="스캔 타입 *" error={errors.scanType?.message}>
            <select {...register("scanType")} className={inputCls}>
              <option value="없음">스캔 없음</option>
              <option value="JPG">JPG</option>
              <option value="TIFF">TIFF</option>
              <option value="JPG+TIFF">JPG + TIFF</option>
            </select>
          </Field>
        </div>

        <Field label="수령 방법 *" error={errors.pickupMethod?.message}>
          <div className="flex gap-4">
            {["택배", "방문", "폐기"].map((v) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input {...register("pickupMethod")} type="radio" value={v} className="accent-black" />
                <span>{v}</span>
              </label>
            ))}
          </div>
        </Field>

        <Field label="요청사항" error={errors.notes?.message}>
          <textarea {...register("notes")} rows={3} className={inputCls} placeholder="특이사항, 현상 요청사항 등" />
        </Field>
      </section>

      <input type="hidden" {...register("recaptchaToken")} />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? "접수 중..." : editToken ? "수정 완료" : "접수 신청"}
      </button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls = "border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent w-full";

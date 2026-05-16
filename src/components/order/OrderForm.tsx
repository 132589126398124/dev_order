"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { orderSchema, OrderFormData, FilmItem, DEFAULT_FILM_ITEM } from "@/types/order";

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

const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-400";
const selectCls = inputCls;
const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";

function FilmItemRow({
  item,
  index,
  onChange,
  onRemove,
  canRemove,
  errors,
}: {
  item: FilmItem;
  index: number;
  onChange: (index: number, key: keyof FilmItem, value: string | number) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  errors: Record<string, string>;
}) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          필름 {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
          >
            삭제
          </button>
        )}
      </div>

      <div>
        <label className={labelCls}>필름 종류 *</label>
        <input
          value={item.filmType}
          onChange={(e) => onChange(index, "filmType", e.target.value)}
          className={`${inputCls} ${errors.filmType ? "!border-red-300 !bg-red-50" : ""}`}
          placeholder="Kodak Portra 400, Fuji Superia 200 등"
        />
        {errors.filmType && <p className="text-xs text-red-500 mt-1">{errors.filmType}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>포맷 *</label>
          <select
            value={item.format}
            onChange={(e) => onChange(index, "format", e.target.value)}
            className={selectCls}
          >
            <option value="135">135 (35mm)</option>
            <option value="120">120 (중형)</option>
            <option value="4x5">4x5 (대형)</option>
            <option value="8x10">8x10 (대형)</option>
            <option value="기타">기타</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>수량 *</label>
          <input
            type="number"
            min={1}
            max={100}
            value={item.quantity}
            onChange={(e) => onChange(index, "quantity", parseInt(e.target.value) || 1)}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>현상 프로세스 *</label>
          <select
            value={item.process}
            onChange={(e) => onChange(index, "process", e.target.value)}
            className={selectCls}
          >
            <option value="C-41">C-41 (컬러 네거티브)</option>
            <option value="ECN-2">ECN-2 (시네마)</option>
            <option value="B&W">B&W (흑백)</option>
            <option value="E-6">E-6 (슬라이드)</option>
            <option value="기타">기타</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>스캔 타입 *</label>
          <select
            value={item.scanType}
            onChange={(e) => onChange(index, "scanType", e.target.value)}
            className={selectCls}
          >
            <option value="없음">스캔 없음</option>
            <option value="JPG">JPG</option>
            <option value="TIFF">TIFF</option>
            <option value="JPG+TIFF">JPG + TIFF</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>증감</label>
          <select
            value={item.pushPull}
            onChange={(e) => onChange(index, "pushPull", e.target.value)}
            className={selectCls}
          >
            <option value="-3">-3 stop</option>
            <option value="-2">-2 stop</option>
            <option value="-1">-1 stop</option>
            <option value="0">표준</option>
            <option value="+1">+1 stop</option>
            <option value="+2">+2 stop</option>
            <option value="+3">+3 stop</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>EI (감도)</label>
          <input
            value={item.ei ?? ""}
            onChange={(e) => onChange(index, "ei", e.target.value)}
            className={inputCls}
            placeholder="800, 1600..."
          />
        </div>
      </div>
    </div>
  );
}

export default function OrderForm({ defaultValues, editToken }: Props) {
  const router = useRouter();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const [customerName, setCustomerName] = useState(defaultValues?.customerName ?? "");
  const [phone, setPhone] = useState(defaultValues?.phone ?? "");
  const [email, setEmail] = useState(defaultValues?.email ?? "");
  const [filmItems, setFilmItems] = useState<FilmItem[]>(
    defaultValues?.filmItems?.length ? defaultValues.filmItems : [{ ...DEFAULT_FILM_ITEM }]
  );
  const [pickupMethod, setPickupMethod] = useState<"택배" | "방문" | "폐기">(
    defaultValues?.pickupMethod ?? "택배"
  );
  const [deliveryAddress, setDeliveryAddress] = useState(defaultValues?.deliveryAddress ?? "");
  const [notes, setNotes] = useState(defaultValues?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  const updateFilmItem = (index: number, key: keyof FilmItem, value: string | number) => {
    setFilmItems((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const addFilmItem = () => setFilmItems((prev) => [...prev, { ...DEFAULT_FILM_ITEM }]);

  const removeFilmItem = (index: number) =>
    setFilmItems((prev) => prev.filter((_, i) => i !== index));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      customerName,
      phone,
      email,
      filmItems,
      pickupMethod,
      deliveryAddress: pickupMethod === "택배" ? deliveryAddress : undefined,
      notes,
      recaptchaToken: "pending",
    };

    const parsed = orderSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      let token = "dev-token";
      if (siteKey && !siteKey.includes("your-site")) {
        token = await new Promise<string>((resolve) =>
          window.grecaptcha.ready(async () => {
            resolve(await window.grecaptcha.execute(siteKey, { action: "submit" }));
          })
        );
      }

      const url = editToken ? `/api/orders/edit/${editToken}` : "/api/orders";
      const method = editToken ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, recaptchaToken: token }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrors({ _: json.error ?? "오류가 발생했습니다" });
        return;
      }

      if (editToken) {
        setEditSuccess(true);
        return;
      }

      router.push(`/order/complete/${json.id}`);
    } catch {
      setErrors({ _: "서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요." });
    } finally {
      setSubmitting(false);
    }
  };

  if (editSuccess) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8 text-center">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">수정 완료</h2>
        <p className="text-sm text-slate-500 mb-6">접수 내역이 성공적으로 수정되었습니다.</p>
        <Link href="/" className="inline-block bg-slate-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {errors._ && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {errors._}
        </div>
      )}

      {/* 고객 정보 */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 space-y-4">
        <h2 className="font-semibold text-slate-900">고객 정보</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>고객명 *</label>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputCls} placeholder="홍길동" />
            {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
          </div>
          <div>
            <label className={labelCls}>연락처 *</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))}
              inputMode="tel"
              className={inputCls}
              placeholder="01012345678 (하이픈 없이)"
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>
        </div>
        <div>
          <label className={labelCls}>이메일 *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="example@email.com" />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
      </section>

      {/* 필름 정보 */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 space-y-4">
        <h2 className="font-semibold text-slate-900">필름 정보</h2>
        {errors.filmItems && <p className="text-xs text-red-500">{errors.filmItems}</p>}
        {filmItems.map((item, i) => {
          const itemErrors = Object.fromEntries(
            Object.entries(errors)
              .filter(([k]) => k.startsWith(`filmItems.${i}.`))
              .map(([k, v]) => [k.replace(`filmItems.${i}.`, ""), v])
          );
          return (
            <FilmItemRow
              key={i}
              item={item}
              index={i}
              onChange={updateFilmItem}
              onRemove={removeFilmItem}
              canRemove={filmItems.length > 1}
              errors={itemErrors}
            />
          );
        })}
        <button
          type="button"
          onClick={addFilmItem}
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-all"
        >
          + 필름 추가
        </button>
      </section>

      {/* 수령 방법 */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 space-y-4">
        <h2 className="font-semibold text-slate-900">수령 방법</h2>
        <div className="flex gap-3">
          {(["택배", "방문", "폐기"] as const).map((v) => (
            <label
              key={v}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${
                pickupMethod === v
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-600 hover:border-slate-400"
              }`}
            >
              <input
                type="radio"
                name="pickupMethod"
                value={v}
                checked={pickupMethod === v}
                onChange={() => setPickupMethod(v)}
                className="sr-only"
              />
              {v}
            </label>
          ))}
        </div>

        {pickupMethod === "택배" && (
          <div>
            <label className={labelCls}>반송 주소 *</label>
            <input
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className={inputCls}
              placeholder="현상 완료 후 필름/스캔 파일을 받을 주소"
            />
            {errors.deliveryAddress && <p className="text-xs text-red-500 mt-1">{errors.deliveryAddress}</p>}
          </div>
        )}

        <div>
          <label className={labelCls}>요청사항</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={inputCls}
            placeholder="특이사항, 현상 요청사항 등"
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-semibold hover:bg-slate-800 active:scale-95 disabled:opacity-50 transition-all text-sm"
      >
        {submitting ? "접수 중..." : editToken ? "수정 완료" : "접수 신청"}
      </button>
    </form>
  );
}

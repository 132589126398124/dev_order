"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { orderSchema, OrderFormData, FilmItem, DEFAULT_FILM_ITEM } from "@/types/order";

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
    daum: {
      Postcode: new (options: {
        oncomplete: (data: { address: string; zonecode: string }) => void;
      }) => { open: () => void };
    };
  }
}

const DRAFT_KEY = "film-order-draft";

const FILM_PRESETS = [
  "Kodak Portra 400",
  "Kodak Gold 200",
  "Kodak Ultramax 400",
  "Fuji Superia 200",
  "Fuji Pro 400H",
  "Ilford HP5",
  "Ilford Delta 3200",
  "CineStill 800T",
] as const;

const PROCESS_DESC: Record<string, string> = {
  "C-41": "일반 컬러 네거티브 필름",
  "ECN-2": "시네마 필름 (Kodak Vision3 등)",
  "B&W": "흑백 네거티브 필름",
  "E-6": "슬라이드 / 리버설 필름",
  "기타": "담당자와 별도 협의",
};

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
  onDuplicate,
  canRemove,
  errors,
}: {
  item: FilmItem;
  index: number;
  onChange: (index: number, key: keyof FilmItem, value: string | number) => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
  canRemove: boolean;
  errors: Record<string, string>;
}) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          필름 {index + 1}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDuplicate(index)}
            className="text-xs text-slate-400 hover:text-slate-700 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
          >
            복사
          </button>
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
      </div>

      <div>
        <label className={labelCls}>필름 종류 *</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {FILM_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset}
              onClick={() => onChange(index, "filmType", preset)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                item.filmType === preset
                  ? "bg-slate-900 text-white border-slate-900"
                  : "border-slate-200 text-slate-600 hover:border-slate-400 bg-white"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
        <input
          value={item.filmType}
          onChange={(e) => onChange(index, "filmType", e.target.value)}
          className={`${inputCls} ${errors.filmType ? "!border-red-300 !bg-red-50" : ""}`}
          placeholder="직접 입력 또는 위에서 선택"
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
          <div className="flex items-center gap-2 mt-0.5">
            <button
              type="button"
              onClick={() => onChange(index, "quantity", Math.max(1, item.quantity - 1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-100 transition-all font-semibold text-base select-none"
            >
              −
            </button>
            <span className="flex-1 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
            <button
              type="button"
              onClick={() => onChange(index, "quantity", Math.min(100, item.quantity + 1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-100 transition-all font-semibold text-base select-none"
            >
              +
            </button>
          </div>
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
          <p className="text-xs text-slate-400 mt-1">{PROCESS_DESC[item.process]}</p>
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
  const formRef = useRef<HTMLFormElement>(null);
  const draftSaveRef = useRef(false);

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
  const [draftBanner, setDraftBanner] = useState<Partial<OrderFormData> | null>(null);

  // Load draft on mount
  useEffect(() => {
    if (editToken) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<OrderFormData>;
        if (draft.customerName || draft.phone || (draft.filmItems?.length ?? 0) > 1 || draft.filmItems?.[0]?.filmType) {
          setDraftBanner(draft);
          return; // don't enable saving until user decides
        }
      }
    } catch {}
    // Enable saving after 100ms to avoid overwriting draft on initial render
    const t = setTimeout(() => { draftSaveRef.current = true; }, 100);
    return () => clearTimeout(t);
  }, [editToken]);

  // Save draft on state changes
  useEffect(() => {
    if (!draftSaveRef.current || editToken) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ customerName, phone, email, filmItems, pickupMethod, deliveryAddress, notes }));
  }, [customerName, phone, email, filmItems, pickupMethod, deliveryAddress, notes, editToken]);

  const restoreDraft = () => {
    if (!draftBanner) return;
    if (draftBanner.customerName) setCustomerName(draftBanner.customerName);
    if (draftBanner.phone) setPhone(draftBanner.phone);
    if (draftBanner.email) setEmail(draftBanner.email);
    if (draftBanner.filmItems?.length) setFilmItems(draftBanner.filmItems);
    if (draftBanner.pickupMethod) setPickupMethod(draftBanner.pickupMethod as "택배" | "방문" | "폐기");
    if (draftBanner.deliveryAddress) setDeliveryAddress(draftBanner.deliveryAddress);
    if (draftBanner.notes) setNotes(draftBanner.notes);
    setDraftBanner(null);
    draftSaveRef.current = true;
  };

  const dismissDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setDraftBanner(null);
    draftSaveRef.current = true;
  };

  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const blurValidate = (key: string, value: string) => {
    const validators: Record<string, () => string | null> = {
      customerName: () => !value.trim() ? "고객명을 입력해주세요" : null,
      phone: () => !/^01[0-9]{8,9}$/.test(value) ? "올바른 휴대폰 번호를 입력해주세요 (예: 01012345678)" : null,
      email: () => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "올바른 이메일을 입력해주세요" : null,
      deliveryAddress: () => pickupMethod === "택배" && !value.trim() ? "반송 주소를 입력해주세요" : null,
    };
    const error = validators[key]?.();
    setErrors((prev) => {
      const next = { ...prev };
      if (error) next[key] = error;
      else delete next[key];
      return next;
    });
  };

  const updateFilmItem = (index: number, key: keyof FilmItem, value: string | number) =>
    setFilmItems((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));

  const addFilmItem = () => setFilmItems((prev) => [...prev, { ...DEFAULT_FILM_ITEM }]);

  const removeFilmItem = (index: number) =>
    setFilmItems((prev) => prev.filter((_, i) => i !== index));

  const duplicateFilmItem = (index: number) =>
    setFilmItems((prev) => [
      ...prev.slice(0, index + 1),
      { ...prev[index] },
      ...prev.slice(index + 1),
    ]);

  const openPostcode = () => {
    if (typeof window === "undefined" || !window.daum?.Postcode) return;
    new window.daum.Postcode({
      oncomplete: (data) => {
        setDeliveryAddress(`(${data.zonecode}) ${data.address}`);
        clearError("deliveryAddress");
      },
    }).open();
  };

  const scrollToFirstError = (fieldErrors: Record<string, string>) => {
    const sectionMap: Array<{ keys: string[]; id: string }> = [
      { keys: ["customerName", "phone", "email"], id: "section-customer" },
      { keys: ["filmItems"], id: "section-films" },
      { keys: ["deliveryAddress"], id: "section-pickup" },
    ];
    for (const { keys, id } of sectionMap) {
      if (keys.some((k) => Object.keys(fieldErrors).some((e) => e.startsWith(k)))) {
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
        break;
      }
    }
  };

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
      scrollToFirstError(fieldErrors);
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

      localStorage.removeItem(DRAFT_KEY);
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
    <>
      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="lazyOnload" />

      {draftBanner && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-amber-800">임시 저장된 내용이 있습니다.</p>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={restoreDraft}
              className="text-xs font-semibold text-amber-900 hover:text-amber-950 underline underline-offset-2"
            >
              불러오기
            </button>
            <button
              type="button"
              onClick={dismissDraft}
              className="text-xs text-amber-500 hover:text-amber-700 transition-colors"
            >
              무시
            </button>
          </div>
        </div>
      )}

      <form ref={formRef} onSubmit={onSubmit} className={`space-y-6 ${!editToken ? "pb-24 sm:pb-0" : ""}`}>
        {errors._ && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {errors._}
          </div>
        )}

        <section id="section-customer" className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">고객 정보</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>고객명 *</label>
              <input
                value={customerName}
                onChange={(e) => { setCustomerName(e.target.value); clearError("customerName"); }}
                onBlur={(e) => blurValidate("customerName", e.target.value)}
                className={`${inputCls} ${errors.customerName ? "!border-red-300 !bg-red-50" : ""}`}
                placeholder="홍길동"
              />
              {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
            </div>
            <div>
              <label className={labelCls}>연락처 *</label>
              <input
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 11)); clearError("phone"); }}
                onBlur={(e) => blurValidate("phone", e.target.value)}
                inputMode="tel"
                className={`${inputCls} ${errors.phone ? "!border-red-300 !bg-red-50" : ""}`}
                placeholder="01012345678 (하이픈 없이)"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>
          <div>
            <label className={labelCls}>이메일 *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
              onBlur={(e) => blurValidate("email", e.target.value)}
              className={`${inputCls} ${errors.email ? "!border-red-300 !bg-red-50" : ""}`}
              placeholder="example@email.com"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
        </section>

        <section id="section-films" className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 space-y-4">
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
                onDuplicate={duplicateFilmItem}
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

        <section id="section-pickup" className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 space-y-4">
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
              <div className="flex gap-2">
                <input
                  value={deliveryAddress}
                  onChange={(e) => { setDeliveryAddress(e.target.value); clearError("deliveryAddress"); }}
                  onBlur={(e) => blurValidate("deliveryAddress", e.target.value)}
                  className={`${inputCls} flex-1 ${errors.deliveryAddress ? "!border-red-300 !bg-red-50" : ""}`}
                  placeholder="현상 완료 후 반송 받을 주소"
                />
                <button
                  type="button"
                  onClick={openPostcode}
                  className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                >
                  주소 검색
                </button>
              </div>
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
          className={`w-full bg-slate-900 text-white py-3.5 rounded-2xl font-semibold hover:bg-slate-800 active:scale-95 disabled:opacity-50 transition-all text-sm ${!editToken ? "hidden sm:block" : ""}`}
        >
          {submitting ? "접수 중..." : editToken ? "수정 완료" : "접수 신청"}
        </button>
      </form>

      {!editToken && (
        <div className="fixed bottom-0 left-0 right-0 sm:hidden z-40 bg-white/95 backdrop-blur-sm border-t border-slate-100 px-4 pb-6 pt-3">
          <button
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={submitting}
            className="w-full bg-slate-900 text-white py-3 rounded-2xl font-semibold disabled:opacity-50 transition-all text-sm"
          >
            {submitting ? "접수 중..." : "접수 신청"}
          </button>
        </div>
      )}
    </>
  );
}

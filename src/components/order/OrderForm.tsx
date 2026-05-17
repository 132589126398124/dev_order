"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { orderSchema, OrderFormData, FilmItem, DEFAULT_FILM_ITEM } from "@/types/order";
import FilmSearch from "./FilmSearch";
import type { FilmEntry } from "@/data/films";
import type { ShopSettings } from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/types/settings";

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
  userId?: string;
  settings?: ShopSettings;
}

const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-400";
const selectCls = inputCls;
const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";

interface SavedProfile {
  profileName?: string | null;
  profilePhone?: string | null;
  profileEmail?: string | null;
  profileAddress?: string | null;
}

const ALL_PROCESSES = ["C-41", "ECN-2", "B&W", "E-6", "기타"] as const;
const ALL_SCAN_TYPES = ["없음", "JPG", "TIFF", "JPG+TIFF"] as const;
const ALL_RESOLUTIONS = ["standard", "high", "ultra"] as const;
const RESOLUTION_LABELS: Record<string, string> = { standard: "표준", high: "고해상도", ultra: "초고해상도" };

function FilmItemRow({
  item,
  index,
  onChange,
  onRemove,
  onDuplicate,
  canRemove,
  errors,
  settings,
}: {
  item: FilmItem;
  index: number;
  onChange: (index: number, key: keyof FilmItem, value: string | number | boolean) => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
  canRemove: boolean;
  errors: Record<string, string>;
  settings: ShopSettings;
}) {
  const availableProcesses = ALL_PROCESSES.filter((p) => !settings.disabledProcesses.includes(p));
  const availableScanTypes = ALL_SCAN_TYPES.filter((t) => !settings.disabledScanTypes.includes(t));
  const rc = settings.resolutionConfig;
  const availableResolutions = ALL_RESOLUTIONS.filter((r) => {
    if (rc) return rc[r]?.enabled ?? (r !== "ultra");
    return !settings.disabledResolutions.includes(r);
  });

  const isFilmBlocked = settings.blockedFilms.includes(item.filmType);
  const filmNotice = settings.filmNotices[item.filmType];

  useEffect(() => {
    if (availableProcesses.length > 0 && !availableProcesses.includes(item.process as typeof ALL_PROCESSES[number])) {
      onChange(index, "process", availableProcesses[0]);
    }
    if (availableScanTypes.length > 0 && !availableScanTypes.includes(item.scanType as typeof ALL_SCAN_TYPES[number])) {
      onChange(index, "scanType", availableScanTypes[0]);
    }
    const res = (item.scanResolution ?? "standard") as typeof ALL_RESOLUTIONS[number];
    if (availableResolutions.length > 0 && !availableResolutions.includes(res)) {
      onChange(index, "scanResolution", availableResolutions[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.disabledProcesses, settings.disabledScanTypes, settings.disabledResolutions]);

  const handleFilmSelect = (film: FilmEntry) => {
    onChange(index, "filmType", film.name);
    onChange(index, "process", film.process);
    if (film.formats.includes(item.format as "135" | "120" | "4x5" | "8x10")) {
      // keep current format if compatible
    } else {
      onChange(index, "format", film.formats[0]);
    }
  };

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
        <FilmSearch
          value={item.filmType}
          onChange={(v) => onChange(index, "filmType", v)}
          onSelect={handleFilmSelect}
          error={!!errors.filmType}
        />
        {errors.filmType && <p className="text-xs text-red-500 mt-1">{errors.filmType}</p>}
        {isFilmBlocked && (
          <div className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
            <span>⚠</span>
            <span>{filmNotice || "해당 필름은 현재 접수가 제한될 수 있습니다. 접수 전 문의 바랍니다."}</span>
          </div>
        )}
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
            {availableProcesses.includes("C-41") && <option value="C-41">C-41 (컬러 네거티브)</option>}
            {availableProcesses.includes("ECN-2") && <option value="ECN-2">ECN-2 (시네마)</option>}
            {availableProcesses.includes("B&W") && <option value="B&W">B&W (흑백)</option>}
            {availableProcesses.includes("E-6") && <option value="E-6">E-6 (슬라이드)</option>}
            {availableProcesses.includes("기타") && <option value="기타">기타</option>}
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
            {availableScanTypes.includes("없음") && <option value="없음">스캔 없음</option>}
            {availableScanTypes.includes("JPG") && <option value="JPG">JPG</option>}
            {availableScanTypes.includes("TIFF") && <option value="TIFF">TIFF</option>}
            {availableScanTypes.includes("JPG+TIFF") && <option value="JPG+TIFF">JPG + TIFF</option>}
          </select>
        </div>
      </div>

      {item.scanType !== "없음" && availableResolutions.length > 1 && (
        <div>
          <label className={labelCls}>스캔 해상도</label>
          <div className="flex gap-2">
            {availableResolutions.map((res) => {
              const desc = rc?.[res]?.description;
              return (
                <label
                  key={res}
                  className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl border-2 cursor-pointer transition-all text-xs font-medium ${
                    item.scanResolution === res
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  <input
                    type="radio"
                    name={`scanResolution-${index}`}
                    value={res}
                    checked={item.scanResolution === res}
                    onChange={() => onChange(index, "scanResolution", res)}
                    className="sr-only"
                  />
                  <span>{RESOLUTION_LABELS[res]}</span>
                  {desc && <span className={`text-[10px] mt-0.5 ${item.scanResolution === res ? "text-white/70" : "text-slate-400"}`}>{desc}</span>}
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div className={`grid gap-3 ${settings.acceptPushPull ? "grid-cols-2" : "grid-cols-1"}`}>
        {settings.acceptPushPull && (
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
        )}
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

      {settings.acceptHalfFrame && (
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={item.halfFrame}
            onChange={(e) => onChange(index, "halfFrame", e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 accent-slate-900 cursor-pointer"
          />
          <span className="text-sm text-slate-700">하프 프레임 촬영</span>
          <span className="text-xs text-slate-400">(한 컷을 두 장으로 분할 촬영)</span>
        </label>
      )}
    </div>
  );
}

export default function OrderForm({ defaultValues, editToken, userId, settings = DEFAULT_SETTINGS }: Props) {
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
  const [deliveryAddressDetail, setDeliveryAddressDetail] = useState("");
  const [notes, setNotes] = useState(defaultValues?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [draftBanner, setDraftBanner] = useState<Partial<OrderFormData> | null>(null);

  // Saved profile state
  const [savedProfile, setSavedProfile] = useState<SavedProfile | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const pricingEnabled = useMemo(() => {
    const p = settings.pricing;
    const procs = Object.values(p.processes ?? {}) as Array<{ develop?: number; jpgScan?: number; tiffScan?: number }>;
    return (
      procs.some((v) => (v?.develop ?? 0) > 0 || (v?.jpgScan ?? 0) > 0 || (v?.tiffScan ?? 0) > 0) ||
      (p.scanHighExtra ?? 0) > 0 ||
      (p.scanUltraExtra ?? 0) > 0 ||
      (p.halfFrameExtra ?? 0) > 0
    );
  }, [settings.pricing]);

  const estimatedTotal = useMemo(() => {
    if (!pricingEnabled) return 0;
    return filmItems.reduce((sum, item) => {
      const pp = settings.pricing?.processes?.[item.process] as { develop?: number; jpgScan?: number; tiffScan?: number } | undefined;
      const develop = pp?.develop ?? 0;
      const jpgScan = pp?.jpgScan ?? 0;
      const tiffScan = pp?.tiffScan ?? 0;
      const scanCost =
        item.scanType === "JPG" ? jpgScan :
        item.scanType === "TIFF" ? tiffScan :
        item.scanType === "JPG+TIFF" ? jpgScan + tiffScan : 0;
      const highExtra = item.scanResolution === "high" ? (settings.pricing?.scanHighExtra ?? 0) : 0;
      const ultraExtra = item.scanResolution === "ultra" ? (settings.pricing?.scanUltraExtra ?? 0) : 0;
      const halfExtra = item.halfFrame ? (settings.pricing?.halfFrameExtra ?? 0) : 0;
      return sum + (develop + scanCost + highExtra + ultraExtra + halfExtra) * item.quantity;
    }, 0);
  }, [filmItems, settings.pricing, pricingEnabled]);

  // Load draft on mount (new orders only)
  useEffect(() => {
    if (editToken) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<OrderFormData>;
        if (draft.customerName || draft.phone || (draft.filmItems?.length ?? 0) > 1 || draft.filmItems?.[0]?.filmType) {
          setDraftBanner(draft);
          return;
        }
      }
    } catch {}
    const t = setTimeout(() => { draftSaveRef.current = true; }, 100);
    return () => clearTimeout(t);
  }, [editToken]);

  // Load saved profile (logged-in users, new orders only)
  useEffect(() => {
    if (!userId || editToken) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: SavedProfile) => {
        if (data.profileName || data.profilePhone || data.profileEmail) {
          setSavedProfile(data);
        }
      })
      .catch(() => {});
  }, [userId, editToken]);

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

  const loadProfile = () => {
    if (!savedProfile) return;
    if (savedProfile.profileName) setCustomerName(savedProfile.profileName);
    if (savedProfile.profilePhone) setPhone(savedProfile.profilePhone);
    if (savedProfile.profileEmail) setEmail(savedProfile.profileEmail);
    if (savedProfile.profileAddress) setDeliveryAddress(savedProfile.profileAddress);
    setSavedProfile(null);
  };

  const saveProfile = async () => {
    if (!userId || savingProfile) return;
    setSavingProfile(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileName: customerName || null,
          profilePhone: phone || null,
          profileEmail: email || null,
          profileAddress: deliveryAddress || null,
        }),
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch {}
    setSavingProfile(false);
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

  const updateFilmItem = (index: number, key: keyof FilmItem, value: string | number | boolean) =>
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

    const fullAddress = deliveryAddress
      ? deliveryAddressDetail.trim()
        ? `${deliveryAddress} ${deliveryAddressDetail.trim()}`
        : deliveryAddress
      : "";

    const payload = {
      customerName,
      phone,
      email,
      filmItems,
      pickupMethod,
      deliveryAddress: pickupMethod === "택배" ? fullAddress : undefined,
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
      if (siteKey && !siteKey.includes("your-site") && typeof window !== "undefined" && window.grecaptcha) {
        try {
          token = await new Promise<string>((resolve) =>
            window.grecaptcha.ready(async () => {
              resolve(await window.grecaptcha.execute(siteKey, { action: "submit" }));
            })
          );
        } catch {
          // reCAPTCHA 로드 실패 시 dev-token으로 진행 (서버에서 RECAPTCHA_SECRET_KEY 미설정 시 무시됨)
        }
      }

      const url = editToken ? `/api/orders/edit/${editToken}` : "/api/orders";
      const method = editToken ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, recaptchaToken: token }),
      });

      let json: { id?: string; uniqueCode?: string; error?: string } = {};
      try {
        json = await res.json();
      } catch {
        setErrors({ _: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." });
        return;
      }

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

      {/* Order notice from admin */}
      {settings.orderNotice && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          {settings.orderNotice}
        </div>
      )}

      {/* Draft restore banner */}
      {draftBanner && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-amber-800">임시 저장된 내용이 있습니다.</p>
          <div className="flex items-center gap-3 shrink-0">
            <button type="button" onClick={restoreDraft} className="text-xs font-semibold text-amber-900 hover:text-amber-950 underline underline-offset-2">불러오기</button>
            <button type="button" onClick={dismissDraft} className="text-xs text-amber-500 hover:text-amber-700 transition-colors">무시</button>
          </div>
        </div>
      )}

      {/* Saved profile banner */}
      {savedProfile && !draftBanner && (
        <div className="mb-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-blue-800">
            저장된 고객 정보가 있습니다.
            <span className="ml-1 text-blue-600 font-medium">{savedProfile.profileName}</span>
          </p>
          <button
            type="button"
            onClick={loadProfile}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline underline-offset-2 shrink-0"
          >
            불러오기
          </button>
        </div>
      )}

      <form ref={formRef} onSubmit={onSubmit} className={`space-y-6 ${!editToken ? "pb-24 sm:pb-0" : ""}`}>
        {errors._ && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {errors._}
          </div>
        )}

        {/* 고객 정보 */}
        <section id="section-customer" className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">고객 정보</h2>
            {userId && (
              <button
                type="button"
                onClick={saveProfile}
                disabled={savingProfile}
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
              >
                {profileSaved ? "저장 완료 ✓" : savingProfile ? "저장 중..." : "정보 저장"}
              </button>
            )}
          </div>
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

        {/* 필름 정보 */}
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
                settings={settings}
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
                <input type="radio" name="pickupMethod" value={v} checked={pickupMethod === v} onChange={() => setPickupMethod(v)} className="sr-only" />
                {v}
              </label>
            ))}
          </div>

          {pickupMethod === "택배" && (
            <div>
              <label className={labelCls}>반송 주소 *</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={deliveryAddress}
                  readOnly
                  onClick={openPostcode}
                  className={`${inputCls} flex-1 cursor-pointer ${errors.deliveryAddress ? "!border-red-300 !bg-red-50" : ""}`}
                  placeholder="주소 검색 버튼을 눌러주세요"
                />
                <button
                  type="button"
                  onClick={openPostcode}
                  className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                >
                  주소 검색
                </button>
              </div>
              {deliveryAddress && (
                <input
                  value={deliveryAddressDetail}
                  onChange={(e) => setDeliveryAddressDetail(e.target.value)}
                  className={inputCls}
                  placeholder="상세 주소 입력 (동/호수 등)"
                />
              )}
              {errors.deliveryAddress && <p className="text-xs text-red-500 mt-1">{errors.deliveryAddress}</p>}
            </div>
          )}

          <div>
            <label className={labelCls}>요청사항</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputCls} placeholder="특이사항, 현상 요청사항 등" />
          </div>
        </section>

        {pricingEnabled && (
          <section className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">예상 금액</h2>
              <span className="text-lg font-bold text-slate-900">{estimatedTotal.toLocaleString()}원</span>
            </div>
            {filmItems.length > 1 && (
              <div className="mt-3 space-y-1 border-t border-slate-100 pt-3">
                {filmItems.map((item, i) => {
                  const pp2 = settings.pricing?.processes?.[item.process] as { develop?: number; jpgScan?: number; tiffScan?: number } | undefined;
                  const scanCost2 = item.scanType === "JPG" ? (pp2?.jpgScan ?? 0) : item.scanType === "TIFF" ? (pp2?.tiffScan ?? 0) : item.scanType === "JPG+TIFF" ? (pp2?.jpgScan ?? 0) + (pp2?.tiffScan ?? 0) : 0;
                  const itemTotal = ((pp2?.develop ?? 0) + scanCost2 + (item.scanResolution === "high" ? (settings.pricing?.scanHighExtra ?? 0) : 0) + (item.scanResolution === "ultra" ? (settings.pricing?.scanUltraExtra ?? 0) : 0) + (item.halfFrame ? (settings.pricing?.halfFrameExtra ?? 0) : 0)) * item.quantity;
                  return (
                    <div key={i} className="flex justify-between text-xs text-slate-500">
                      <span>필름 {i + 1} {item.filmType ? `(${item.filmType} × ${item.quantity}롤)` : `(× ${item.quantity}롤)`}</span>
                      <span>{itemTotal.toLocaleString()}원</span>
                    </div>
                  );
                })}
              </div>
            )}
            {settings.pricing?.note && (
              <p className="text-xs text-slate-500 mt-2">{settings.pricing.note}</p>
            )}
            <p className="text-xs text-slate-400 mt-1.5">※ 실제 금액은 접수 확인 후 안내됩니다</p>
          </section>
        )}

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
          {pricingEnabled && (
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-xs text-slate-500">예상 금액</span>
              <span className="text-sm font-bold text-slate-900">{estimatedTotal.toLocaleString()}원</span>
            </div>
          )}
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

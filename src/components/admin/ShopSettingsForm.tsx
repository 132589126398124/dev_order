"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { searchFilms } from "@/data/films";
import type { FilmEntry } from "@/data/films";
import type { ShopSettings } from "@/types/settings";
import { DEFAULT_PRICING } from "@/types/settings";

const ALL_PROCESSES = ["C-41", "ECN-2", "B&W", "E-6", "기타"] as const;
const ALL_SCAN_TYPES = ["없음", "JPG", "TIFF", "JPG+TIFF"] as const;

export default function ShopSettingsForm({ initialSettings }: { initialSettings: ShopSettings }) {
  const [s, setStateS] = useState(initialSettings);
  const [isDirty, setIsDirty] = useState(false);
  const setS: typeof setStateS = useCallback((v) => {
    setStateS(v);
    setIsDirty(true);
  }, [setStateS, setIsDirty]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [pinForm, setPinForm] = useState({ current: "", next: "", confirm: "" });
  const [pinSaving, setPinSaving] = useState(false);
  const [pinResult, setPinResult] = useState<{ ok?: boolean; error?: string } | null>(null);

  const changePin = useCallback(async () => {
    if (pinSaving) return;
    if (!/^\d{6}$/.test(pinForm.next)) { setPinResult({ error: "새 PIN은 숫자 6자리여야 합니다" }); return; }
    if (pinForm.next !== pinForm.confirm) { setPinResult({ error: "새 PIN이 일치하지 않습니다" }); return; }
    setPinSaving(true);
    setPinResult(null);
    try {
      const res = await fetch("/api/admin/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPin: pinForm.current, newPin: pinForm.next }),
      });
      const json = await res.json();
      if (res.ok) {
        setPinResult({ ok: true });
        setPinForm({ current: "", next: "", confirm: "" });
      } else {
        setPinResult({ error: json.error ?? "오류가 발생했습니다" });
      }
    } catch {
      setPinResult({ error: "서버 연결 실패" });
    } finally {
      setPinSaving(false);
    }
  }, [pinForm, pinSaving]);

  const [filmQuery, setFilmQuery] = useState("");
  const [filmResults, setFilmResults] = useState<FilmEntry[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [filmResultIndex, setFilmResultIndex] = useState(-1);
  const filmInputRef = useRef<HTMLInputElement>(null);

  // Unsaved changes warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleFilmSearch = (q: string) => {
    setFilmQuery(q);
    setFilmResultIndex(-1);
    if (q.trim().length === 0) {
      setFilmResults([]);
      setShowResults(false);
      return;
    }
    setFilmResults(searchFilms(q));
    setShowResults(true);
  };

  const handleFilmKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || filmResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFilmResultIndex((i) => Math.min(i + 1, filmResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFilmResultIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filmResultIndex >= 0) {
      e.preventDefault();
      addBlockedFilm(filmResults[filmResultIndex]);
    } else if (e.key === "Escape") {
      setShowResults(false);
      setFilmResultIndex(-1);
    }
  };

  const addBlockedFilm = (film: FilmEntry) => {
    if (!s.blockedFilms.includes(film.name)) {
      setS((prev) => ({ ...prev, blockedFilms: [...prev.blockedFilms, film.name] }));
    }
    setFilmQuery("");
    setFilmResults([]);
    setShowResults(false);
    filmInputRef.current?.focus();
  };

  const removeBlockedFilm = (name: string) => {
    setS((prev) => {
      const notices = { ...prev.filmNotices };
      delete notices[name];
      return { ...prev, blockedFilms: prev.blockedFilms.filter((n) => n !== name), filmNotices: notices };
    });
  };

  const updateFilmNotice = (name: string, notice: string) => {
    setS((prev) => ({ ...prev, filmNotices: { ...prev.filmNotices, [name]: notice } }));
  };

  const toggleDisabled = <K extends "disabledProcesses" | "disabledScanTypes" | "disabledResolutions">(
    field: K,
    value: string
  ) => {
    setS((prev) => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter((x) => x !== value) : [...prev[field], value],
    }));
  };

  const save = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setIsDirty(false);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  const cardCls = "bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 space-y-4";
  const numInputCls = "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:bg-white focus:border-slate-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  const toggleSwitch = (active: boolean, onToggle: () => void, label: string, desc: string, id: string) => (
    <div className="flex items-center justify-between gap-4">
      <div id={id}>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-labelledby={id}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${
          active ? "bg-slate-900" : "bg-slate-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            active ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  const optionToggle = (label: string, value: string, disabledList: string[], field: "disabledProcesses" | "disabledScanTypes" | "disabledResolutions") => {
    const isDisabled = disabledList.includes(value);
    return (
      <button
        key={value}
        type="button"
        onClick={() => toggleDisabled(field, value)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
          isDisabled
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
        }`}
      >
        <span className="text-[10px]">{isDisabled ? "✕" : "✓"}</span>
        {isDisabled ? <s>{label}</s> : label}
      </button>
    );
  };

  return (
    <div className="space-y-5">
      {/* 기본 설정 */}
      <div className={cardCls}>
        <h2 className="font-semibold text-slate-900">기본 설정</h2>
        {toggleSwitch(
          s.acceptPushPull,
          () => setS((p) => ({ ...p, acceptPushPull: !p.acceptPushPull })),
          "증감 현상 접수 허용",
          "Push / Pull 현상 의뢰를 받을지 여부",
          "toggle-pushpull"
        )}
        {toggleSwitch(
          s.acceptHalfFrame,
          () => setS((p) => ({ ...p, acceptHalfFrame: !p.acceptHalfFrame })),
          "하프 프레임 접수 허용",
          "하프 프레임 촬영 의뢰를 받을지 여부",
          "toggle-halfframe"
        )}
        <div className="flex items-center justify-between gap-4">
          <div id="label-autoexpire">
            <p className="text-sm font-medium text-slate-700">접수 자동 만료 기간</p>
            <p className="text-xs text-slate-500 mt-0.5">접수 후 이 기간이 지나면 PENDING 상태가 자동으로 만료됩니다</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <input
              type="text"
              inputMode="numeric"
              aria-labelledby="label-autoexpire"
              value={s.autoExpireDays ?? 7}
              onChange={(e) => setS((p) => ({ ...p, autoExpireDays: Math.max(1, parseInt(e.target.value) || 1) }))}
              className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-center focus:bg-white focus:border-slate-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-sm text-slate-500">일</span>
          </div>
        </div>
      </div>

      {/* 현상 프로세스 */}
      <div className={cardCls}>
        <div>
          <h2 className="font-semibold text-slate-900">현상 프로세스</h2>
          <p className="text-xs text-slate-400 mt-0.5">취소선 항목은 접수 폼에서 비활성화됩니다</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {ALL_PROCESSES.map((p) => optionToggle(p, p, s.disabledProcesses, "disabledProcesses"))}
        </div>
        <p className="text-xs text-slate-400">
          활성:{" "}
          <span className="text-slate-600 font-medium">
            {ALL_PROCESSES.filter((p) => !s.disabledProcesses.includes(p)).join(", ") || "없음"}
          </span>
        </p>
      </div>

      {/* 스캔 설정 */}
      <div className={cardCls}>
        <h2 className="font-semibold text-slate-900">스캔 설정</h2>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">스캔 타입</p>
          <div className="flex gap-2 flex-wrap">
            {ALL_SCAN_TYPES.map((t) => optionToggle(t, t, s.disabledScanTypes, "disabledScanTypes"))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-1">스캔 해상도</p>
          <p className="text-xs text-slate-400 mb-3">접수 폼에 표시할 해상도 옵션을 설정합니다. 해상도 설명을 입력하면 고객에게 그대로 노출됩니다.</p>
          <div className="space-y-2">
            {(["standard", "high", "ultra"] as const).map((key) => {
              const labels = { standard: "표준", high: "고해상도", ultra: "초고해상도" };
              const opt = s.resolutionConfig?.[key] ?? { enabled: key !== "ultra", description: "" };
              return (
                <div key={key} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setS((prev) => ({
                        ...prev,
                        resolutionConfig: {
                          ...(prev.resolutionConfig ?? { standard: { enabled: true, description: "" }, high: { enabled: true, description: "" }, ultra: { enabled: false, description: "" } }),
                          [key]: { ...opt, enabled: !opt.enabled },
                        },
                      }))
                    }
                    className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-xl border transition-all ${
                      opt.enabled
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-400"
                    }`}
                  >
                    {opt.enabled ? "✓" : "○"} {labels[key]}
                  </button>
                  <input
                    value={opt.description}
                    onChange={(e) =>
                      setS((prev) => ({
                        ...prev,
                        resolutionConfig: {
                          ...(prev.resolutionConfig ?? { standard: { enabled: true, description: "" }, high: { enabled: true, description: "" }, ultra: { enabled: false, description: "" } }),
                          [key]: { ...opt, description: e.target.value },
                        },
                      }))
                    }
                    placeholder={`예: ${key === "standard" ? "2048px" : key === "high" ? "4096px" : "8000px"} 장변`}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:bg-white focus:border-slate-400 focus:outline-none placeholder:text-slate-300"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 의뢰 불가 필름 */}
      <div className={cardCls}>
        <div>
          <h2 className="font-semibold text-slate-900">의뢰 불가 필름</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            선택된 필름 선택 시 경고를 표시합니다. 툴팁 문구를 직접 입력할 수 있습니다.
          </p>
        </div>

        <div className="relative">
          <input
            ref={filmInputRef}
            value={filmQuery}
            onChange={(e) => handleFilmSearch(e.target.value)}
            onBlur={() => setTimeout(() => { setShowResults(false); setFilmResultIndex(-1); }, 150)}
            onFocus={() => filmQuery && setShowResults(true)}
            onKeyDown={handleFilmKeyDown}
            placeholder="필름 이름 검색 후 추가..."
            aria-label="의뢰 불가 필름 검색"
            aria-autocomplete="list"
            aria-expanded={showResults && filmResults.length > 0}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-400"
          />
          {showResults && filmResults.length > 0 && (
            <div role="listbox" className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg z-10 max-h-48 overflow-y-auto">
              {filmResults.map((f, idx) => (
                <button
                  key={f.id}
                  type="button"
                  role="option"
                  aria-selected={filmResultIndex === idx}
                  onMouseDown={() => addBlockedFilm(f)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left ${filmResultIndex === idx ? "bg-slate-100" : "hover:bg-slate-50"}`}
                >
                  <span className="font-medium text-slate-900">{f.name}</span>
                  <span className="text-xs text-slate-500 shrink-0 ml-2 whitespace-nowrap">{f.brand} · {f.process}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {s.blockedFilms.length > 0 ? (
          <div className="space-y-2">
            {s.blockedFilms.map((name) => (
              <div key={name} className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                <div className="flex-1 space-y-2 min-w-0">
                  <p className="text-sm font-semibold text-red-700">{name}</p>
                  <input
                    value={s.filmNotices[name] ?? ""}
                    onChange={(e) => updateFilmNotice(name, e.target.value)}
                    placeholder="툴팁 안내 문구 (선택사항)"
                    className="w-full bg-white border border-red-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-red-400 transition-colors placeholder:text-red-300"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeBlockedFilm(name)}
                  className="text-red-400 hover:text-red-600 transition-colors text-xs px-2 py-1 hover:bg-red-100 rounded-lg shrink-0 mt-0.5"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-3">의뢰 불가 필름 없음</p>
        )}
      </div>

      {/* 접수 공지 */}
      <div className={cardCls}>
        <div>
          <h2 className="font-semibold text-slate-900">접수 공지</h2>
          <p className="text-xs text-slate-400 mt-0.5">접수 페이지 상단에 표시될 공지사항. 비워두면 표시 안 됨.</p>
        </div>
        <textarea
          value={s.orderNotice ?? ""}
          onChange={(e) => setS((p) => ({ ...p, orderNotice: e.target.value || null }))}
          rows={3}
          placeholder="공지사항 입력..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-slate-400 focus:outline-none transition-all resize-none placeholder:text-slate-400"
        />
      </div>

      {/* 요금 설정 */}
      <div className={cardCls}>
        <div>
          <h2 className="font-semibold text-slate-900">요금 설정</h2>
          <p className="text-xs text-slate-400 mt-0.5 break-keep">프로세스별로 현상·스캔 요금을 설정합니다. 0원 항목은 접수 폼에 표시되지 않습니다.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-400 pb-2 pr-3">프로세스</th>
                <th className="text-left text-xs font-medium text-slate-400 pb-2 px-2">현상 (원/롤)</th>
                <th className="text-left text-xs font-medium text-slate-400 pb-2 px-2">JPG 스캔 (원/롤)</th>
                <th className="text-left text-xs font-medium text-slate-400 pb-2 pl-2">TIFF 스캔 (원/롤)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ALL_PROCESSES.map((proc) => {
                const pp = (s.pricing?.processes?.[proc] as { develop?: number; jpgScan?: number; tiffScan?: number } | undefined);
                const updateProc = (field: "develop" | "jpgScan" | "tiffScan", val: number) =>
                  setS((prev) => ({
                    ...prev,
                    pricing: {
                      ...(prev.pricing ?? DEFAULT_PRICING),
                      processes: {
                        ...(prev.pricing?.processes ?? {}),
                        [proc]: { develop: 0, jpgScan: 0, tiffScan: 0, ...(prev.pricing?.processes?.[proc] ?? {}), [field]: val },
                      },
                    },
                  }));
                return (
                  <tr key={proc}>
                    <td className="py-2 pr-3 text-xs font-semibold text-slate-600 whitespace-nowrap">{proc}</td>
                    {(["develop", "jpgScan", "tiffScan"] as const).map((field) => (
                      <td key={field} className="py-2 px-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={pp?.[field] ?? 0}
                          onChange={(e) => updateProc(field, parseInt(e.target.value) || 0)}
                          className={numInputCls}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">고해상도 추가금 (원/롤)</label>
            <input
              type="text"
              inputMode="numeric"
              value={s.pricing?.scanHighExtra ?? 0}
              onChange={(e) =>
                setS((prev) => ({
                  ...prev,
                  pricing: { ...(prev.pricing ?? DEFAULT_PRICING), scanHighExtra: parseInt(e.target.value) || 0 },
                }))
              }
              className={numInputCls}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">초고해상도 추가금 (원/롤)</label>
            <input
              type="text"
              inputMode="numeric"
              value={s.pricing?.scanUltraExtra ?? 0}
              onChange={(e) =>
                setS((prev) => ({
                  ...prev,
                  pricing: { ...(prev.pricing ?? DEFAULT_PRICING), scanUltraExtra: parseInt(e.target.value) || 0 },
                }))
              }
              className={numInputCls}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">하프프레임 추가금 (원/롤)</label>
            <input
              type="text"
              inputMode="numeric"
              value={s.pricing?.halfFrameExtra ?? 0}
              onChange={(e) =>
                setS((prev) => ({
                  ...prev,
                  pricing: { ...(prev.pricing ?? DEFAULT_PRICING), halfFrameExtra: parseInt(e.target.value) || 0 },
                }))
              }
              className={numInputCls}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">증감 추가금 (원/stop)</label>
            <input
              type="text"
              inputMode="numeric"
              value={s.pricing?.pushPullPerStop ?? 0}
              onChange={(e) =>
                setS((prev) => ({
                  ...prev,
                  pricing: { ...(prev.pricing ?? DEFAULT_PRICING), pushPullPerStop: parseInt(e.target.value) || 0 },
                }))
              }
              className={numInputCls}
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1 block">요금 안내 추가 문구</label>
          <input
            value={s.pricing?.note ?? ""}
            onChange={(e) =>
              setS((prev) => ({
                ...prev,
                pricing: { ...(prev.pricing ?? DEFAULT_PRICING), note: e.target.value },
              }))
            }
            placeholder="예: 부속 추가 시 별도 협의 / 최소 요금 5,000원"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* 알림 설정 */}
      <div className={cardCls}>
        <div>
          <h2 className="font-semibold text-slate-900">알림 설정</h2>
          <p className="text-xs text-slate-400 mt-0.5">신규 접수 시 이메일로 알림을 받습니다</p>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">관리자 알림 이메일</label>
          <input
            type="email"
            autoComplete="off"
            value={s.adminEmail ?? ""}
            onChange={(e) => setS((p) => ({ ...p, adminEmail: e.target.value || null }))}
            placeholder="example@email.com"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {saveError && <p className="text-sm text-red-500 text-center">{saveError}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-semibold hover:bg-slate-800 active:scale-95 disabled:opacity-50 transition-all text-sm"
        >
          {saved ? "저장 완료 ✓" : saving ? "저장 중..." : "설정 저장"}
        </button>
        {isDirty && !saved && (
          <span className="text-xs text-amber-600 font-medium shrink-0">저장되지 않은 변경사항</span>
        )}
      </div>

      {/* 어드민 PIN 변경 — 별도 저장 버튼 사용 */}
      <div className={cardCls}>
        <div>
          <h2 className="font-semibold text-slate-900">관리자 PIN 변경</h2>
          <p className="text-xs text-slate-400 mt-0.5">숫자 6자리. 변경 후 즉시 적용됩니다.</p>
        </div>
        <div className="space-y-2">
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pinForm.current}
            onChange={(e) => setPinForm((p) => ({ ...p, current: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
            placeholder="현재 PIN"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-400 tracking-widest"
          />
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pinForm.next}
            onChange={(e) => setPinForm((p) => ({ ...p, next: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
            placeholder="새 PIN (6자리)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-400 tracking-widest"
          />
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pinForm.confirm}
            onChange={(e) => setPinForm((p) => ({ ...p, confirm: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
            placeholder="새 PIN 확인"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-400 tracking-widest"
          />
        </div>
        {pinResult?.error && <p className="text-xs text-red-500">{pinResult.error}</p>}
        {pinResult?.ok && <p className="text-xs text-emerald-600">PIN이 변경되었습니다</p>}
        <button
          type="button"
          onClick={changePin}
          disabled={pinSaving || !pinForm.current || !pinForm.next || !pinForm.confirm}
          className="w-full bg-slate-800 text-white py-2.5 rounded-xl font-medium hover:bg-slate-700 active:scale-95 disabled:opacity-40 transition-all text-sm"
        >
          {pinSaving ? "변경 중..." : "PIN 변경"}
        </button>
      </div>
    </div>
  );
}

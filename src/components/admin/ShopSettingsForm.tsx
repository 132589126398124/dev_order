"use client";

import { useState, useRef } from "react";
import { searchFilms } from "@/data/films";
import type { FilmEntry } from "@/data/films";
import type { ShopSettings } from "@/types/settings";
import { DEFAULT_PRICING } from "@/types/settings";

const ALL_PROCESSES = ["C-41", "ECN-2", "B&W", "E-6", "기타"] as const;
const ALL_SCAN_TYPES = ["없음", "JPG", "TIFF", "JPG+TIFF"] as const;
const ALL_RESOLUTIONS = [
  { value: "standard", label: "표준" },
  { value: "high", label: "고해상도" },
] as const;

export default function ShopSettingsForm({ initialSettings }: { initialSettings: ShopSettings }) {
  const [s, setS] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [filmQuery, setFilmQuery] = useState("");
  const [filmResults, setFilmResults] = useState<FilmEntry[]>([]);
  const [showResults, setShowResults] = useState(false);
  const filmInputRef = useRef<HTMLInputElement>(null);

  const handleFilmSearch = (q: string) => {
    setFilmQuery(q);
    if (q.trim().length === 0) {
      setFilmResults([]);
      setShowResults(false);
      return;
    }
    setFilmResults(searchFilms(q));
    setShowResults(true);
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
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  const cardCls = "bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 space-y-4";
  const numInputCls = "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:bg-white focus:border-slate-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  const toggleSwitch = (active: boolean, onToggle: () => void, label: string, desc: string) => (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={active}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
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
          "Push / Pull 현상 의뢰를 받을지 여부"
        )}
        {toggleSwitch(
          s.acceptHalfFrame,
          () => setS((p) => ({ ...p, acceptHalfFrame: !p.acceptHalfFrame })),
          "하프 프레임 접수 허용",
          "하프 프레임 촬영 의뢰를 받을지 여부"
        )}
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
          <p className="text-sm font-medium text-slate-700 mb-2">스캔 해상도</p>
          <div className="flex gap-2 flex-wrap">
            {ALL_RESOLUTIONS.map(({ value, label }) =>
              optionToggle(label, value, s.disabledResolutions, "disabledResolutions")
            )}
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
            onBlur={() => setTimeout(() => setShowResults(false), 150)}
            onFocus={() => filmQuery && setShowResults(true)}
            placeholder="필름 이름 검색 후 추가..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-400"
          />
          {showResults && filmResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg z-10 max-h-48 overflow-y-auto">
              {filmResults.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onMouseDown={() => addBlockedFilm(f)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors text-left"
                >
                  <span className="font-medium text-slate-900">{f.name}</span>
                  <span className="text-xs text-slate-400 shrink-0 ml-2">{f.brand} · {f.process}</span>
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
          <p className="text-xs text-slate-400 mt-0.5">접수 폼에 요금 안내로 표시됩니다. 0원 항목은 표시 안 됨.</p>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">현상 프로세스 (원/롤)</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_PROCESSES.map((p) => (
              <div key={p}>
                <label className="text-xs text-slate-500 mb-1 block">{p}</label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={s.pricing?.processes?.[p] ?? 0}
                  onChange={(e) =>
                    setS((prev) => ({
                      ...prev,
                      pricing: {
                        ...(prev.pricing ?? DEFAULT_PRICING),
                        processes: {
                          ...(prev.pricing?.processes ?? {}),
                          [p]: parseInt(e.target.value) || 0,
                        },
                      },
                    }))
                  }
                  className={numInputCls}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">스캔 타입 (원/롤)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ALL_SCAN_TYPES.map((t) => (
              <div key={t}>
                <label className="text-xs text-slate-500 mb-1 block">{t}</label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={s.pricing?.scanTypes?.[t] ?? 0}
                  onChange={(e) =>
                    setS((prev) => ({
                      ...prev,
                      pricing: {
                        ...(prev.pricing ?? DEFAULT_PRICING),
                        scanTypes: {
                          ...(prev.pricing?.scanTypes ?? {}),
                          [t]: parseInt(e.target.value) || 0,
                        },
                      },
                    }))
                  }
                  className={numInputCls}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">고해상도 추가금 (원/롤)</label>
            <input
              type="number"
              min={0}
              step={100}
              value={s.pricing?.scanHighExtra ?? 0}
              onChange={(e) =>
                setS((prev) => ({
                  ...prev,
                  pricing: { ...(prev.pricing ?? DEFAULT_PRICING), scanHighExtra: parseInt(e.target.value) || 0 },
                }))
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:bg-white focus:border-slate-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">하프프레임 추가금 (원/롤)</label>
            <input
              type="number"
              min={0}
              step={100}
              value={s.pricing?.halfFrameExtra ?? 0}
              onChange={(e) =>
                setS((prev) => ({
                  ...prev,
                  pricing: { ...(prev.pricing ?? DEFAULT_PRICING), halfFrameExtra: parseInt(e.target.value) || 0 },
                }))
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:bg-white focus:border-slate-400 focus:outline-none"
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

      {saveError && <p className="text-sm text-red-500 text-center">{saveError}</p>}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="w-full bg-slate-900 text-white py-3 rounded-2xl font-semibold hover:bg-slate-800 active:scale-95 disabled:opacity-50 transition-all text-sm"
      >
        {saved ? "저장 완료 ✓" : saving ? "저장 중..." : "설정 저장"}
      </button>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { searchFilms, FilmEntry } from "@/data/films";

interface Props {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (film: FilmEntry) => void;
  error?: boolean;
}

export default function FilmSearch({ id, value, onChange, onSelect, error }: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = searchFilms(value);
  const showDropdown = open && results.length > 0;


  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = (film: FilmEntry) => {
    onSelect(film);
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    if (e.key === "Enter") { e.preventDefault(); pick(results[highlighted]); }
    if (e.key === "Escape") setOpen(false);
  };

  const PROCESS_BADGE: Record<string, string> = {
    "C-41": "bg-amber-100 text-amber-700",
    "ECN-2": "bg-purple-100 text-purple-700",
    "B&W": "bg-slate-200 text-slate-700",
    "E-6": "bg-emerald-100 text-emerald-700",
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls="film-search-listbox"
        aria-autocomplete="list"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setHighlighted(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-400 ${
          error ? "border-red-300 bg-red-50" : "border-slate-200"
        }`}
        placeholder="필름명 또는 별명으로 검색 (예: 울맥, portra, 골드)"
        autoComplete="off"
      />

      {showDropdown && (
        <div id="film-search-listbox" role="listbox" className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {results.map((film, i) => (
            <button
              key={film.id}
              type="button"
              role="option"
              aria-selected={i === highlighted}
              onMouseDown={() => pick(film)}
              onMouseEnter={() => setHighlighted(i)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                i === highlighted ? "bg-slate-50" : "hover:bg-slate-50"
              }`}
            >
              <div>
                <span className="font-medium text-slate-900">{film.name}</span>
                {film.discontinued && (
                  <span className="ml-1.5 text-xs text-slate-400">(단종)</span>
                )}
                <span className="ml-2 text-xs text-slate-400">ISO {film.iso}</span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${PROCESS_BADGE[film.process] ?? "bg-slate-100 text-slate-600"}`}>
                {film.process}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Globe,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import {
  toEthiopianDate,
  toGregorianDate,
  formatDualDate,
  getEthiopianDaysInMonth,
  EC_MONTHS_AMHARIC,
  EC_MONTHS_ENGLISH,
  EC_WEEKDAYS_AMHARIC,
  EC_WEEKDAYS_ENGLISH,
  type EthiopianDateInfo,
} from "@betflow/shared";
import { useTranslation } from "@/lib/i18n/language-context";

export type DualDatePickerProps = {
  value?: string | Date | null;
  onChange?: (dateIso: string, ecInfo: EthiopianDateInfo | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
  required?: boolean;
  error?: string;
  name?: string;
  id?: string;
  defaultMode?: "gc" | "ec";
};

export function DualDatePicker({
  value,
  onChange,
  label,
  placeholder,
  disabled = false,
  className = "",
  required = false,
  error,
  id,
  defaultMode,
}: DualDatePickerProps) {
  const { lang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [calendarMode, setCalendarMode] = useState<"gc" | "ec">(
    defaultMode || (lang === "am" ? "ec" : "gc")
  );

  // Parse current value
  const selectedDateObj = useMemo(() => {
    if (!value) return null;
    if (typeof value === "string") {
      const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (match) {
        return new Date(
          parseInt(match[1], 10),
          parseInt(match[2], 10) - 1,
          parseInt(match[3], 10)
        );
      }
    }
    const d = typeof value === "string" ? new Date(value) : value;
    return Number.isNaN(d.getTime()) ? null : d;
  }, [value]);

  const selectedIso = useMemo(() => {
    if (!selectedDateObj) return "";
    const y = selectedDateObj.getFullYear();
    const m = String(selectedDateObj.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [selectedDateObj]);

  const selectedEcInfo = useMemo(() => {
    if (!selectedDateObj) return null;
    return toEthiopianDate(selectedDateObj);
  }, [selectedDateObj]);

  // View state for Gregorian view
  const [gcYear, setGcYear] = useState(() =>
    selectedDateObj ? selectedDateObj.getFullYear() : new Date().getFullYear()
  );
  const [gcMonth, setGcMonth] = useState(() =>
    selectedDateObj ? selectedDateObj.getMonth() : new Date().getMonth()
  );

  // View state for Ethiopian view
  const [ecYear, setEcYear] = useState(() =>
    selectedEcInfo ? selectedEcInfo.ecYear : (toEthiopianDate(new Date())?.ecYear || 2018)
  );
  const [ecMonth, setEcMonth] = useState(() =>
    selectedEcInfo ? selectedEcInfo.ecMonth : (toEthiopianDate(new Date())?.ecMonth || 1)
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Sync calendar mode with app language when opened
  useEffect(() => {
    if (isOpen && !defaultMode) {
      setCalendarMode(lang === "am" ? "ec" : "gc");
    }
  }, [isOpen, lang, defaultMode]);

  const handleSelectGregorianDay = (day: number) => {
    const newDate = new Date(gcYear, gcMonth, day);
    const iso = `${gcYear}-${String(gcMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const ec = toEthiopianDate(newDate);
    onChange?.(iso, ec);
    setIsOpen(false);
  };

  const handleSelectEthiopianDay = (day: number) => {
    const gc = toGregorianDate(ecYear, ecMonth, day);
    const y = gc.getFullYear();
    const m = String(gc.getMonth() + 1).padStart(2, "0");
    const d = String(gc.getDate()).padStart(2, "0");
    const iso = `${y}-${m}-${d}`;
    const ec = toEthiopianDate(gc);
    onChange?.(iso, ec);
    setIsOpen(false);
  };

  const applyPreset = (daysOffset: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysOffset);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, "0");
    const d = String(target.getDate()).padStart(2, "0");
    const iso = `${y}-${m}-${d}`;
    const ec = toEthiopianDate(target);
    onChange?.(iso, ec);
    setIsOpen(false);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("", null);
  };

  // Gregorian month calculation
  const gcDaysInMonth = useMemo(() => {
    return new Date(gcYear, gcMonth + 1, 0).getDate();
  }, [gcYear, gcMonth]);

  const gcFirstDayWeekday = useMemo(() => {
    return new Date(gcYear, gcMonth, 1).getDay();
  }, [gcYear, gcMonth]);

  // Ethiopian month calculation
  const ecDaysInMonth = useMemo(() => {
    return getEthiopianDaysInMonth(ecYear, ecMonth);
  }, [ecYear, ecMonth]);

  const ecFirstDayWeekday = useMemo(() => {
    const firstGc = toGregorianDate(ecYear, ecMonth, 1);
    return firstGc.getDay();
  }, [ecYear, ecMonth]);

  const GC_MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5"
        >
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}

      {/* Input Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          error
            ? "border-destructive/60 bg-destructive/5 text-destructive focus:border-destructive"
            : "border-border bg-card text-foreground hover:border-primary/50 focus:border-primary"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-muted" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
          {selectedDateObj ? (
            <div className="flex items-center gap-2 truncate text-left">
              <span className="font-medium text-foreground">
                {formatDualDate(selectedDateObj, lang)}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">
              {placeholder || (lang === "am" ? "ቀን ይምረጡ (Dual Calendar)" : "Select date (Dual Calendar)")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {selectedDateObj && !disabled && (
            <button
              type="button"
              onClick={clearSelection}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title={lang === "am" ? "ቀን አጥፋ" : "Clear date"}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            {calendarMode === "ec" ? "ዓ.ም" : "GC"}
          </span>
        </div>
      </button>

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 rounded-xl border border-border bg-card shadow-2xl w-[320px] sm:w-[350px] animate-in fade-in zoom-in-95 duration-150">
          {/* Calendar System Switcher Header */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/80 mb-3">
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/50 text-xs">
              <button
                type="button"
                onClick={() => setCalendarMode("ec")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  calendarMode === "ec"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>🇪🇹 የኢትዮጵያ</span>
                <span className="text-[10px] opacity-80">(ዓ.ም)</span>
              </button>

              <button
                type="button"
                onClick={() => setCalendarMode("gc")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  calendarMode === "gc"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>Gregorian</span>
                <span className="text-[10px] opacity-80">(GC)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => applyPreset(0)}
              className="px-2.5 py-1 rounded-md bg-secondary/60 hover:bg-primary/15 hover:text-primary font-medium text-foreground transition-all shrink-0 border border-border/50"
            >
              {lang === "am" ? "ዛሬ (Today)" : "Today"}
            </button>
            <button
              type="button"
              onClick={() => applyPreset(1)}
              className="px-2.5 py-1 rounded-md bg-secondary/60 hover:bg-primary/15 hover:text-primary font-medium text-foreground transition-all shrink-0 border border-border/50"
            >
              {lang === "am" ? "ነገ (+1d)" : "Tomorrow (+1d)"}
            </button>
            <button
              type="button"
              onClick={() => applyPreset(7)}
              className="px-2.5 py-1 rounded-md bg-secondary/60 hover:bg-primary/15 hover:text-primary font-medium text-foreground transition-all shrink-0 border border-border/50"
            >
              +7d
            </button>
            <button
              type="button"
              onClick={() => applyPreset(14)}
              className="px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-semibold transition-all shrink-0 border border-primary/20"
              title={lang === "am" ? "የመያዣ ጊዜ (14 ቀናት)" : "Reservation Hold (14 days)"}
            >
              +14d (Hold)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(30)}
              className="px-2.5 py-1 rounded-md bg-secondary/60 hover:bg-primary/15 hover:text-primary font-medium text-foreground transition-all shrink-0 border border-border/50"
            >
              +30d
            </button>
          </div>

          {/* Ethiopian Calendar View */}
          {calendarMode === "ec" && (
            <div>
              {/* Navigation Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <button
                  type="button"
                  onClick={() => {
                    if (ecMonth === 1) {
                      setEcMonth(13);
                      setEcYear((y) => y - 1);
                    } else {
                      setEcMonth((m) => m - 1);
                    }
                  }}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5">
                  <select
                    value={ecMonth}
                    onChange={(e) => setEcMonth(parseInt(e.target.value, 10))}
                    className="bg-transparent font-semibold text-sm text-foreground focus:outline-none cursor-pointer py-1 px-1.5 rounded hover:bg-muted"
                  >
                    {EC_MONTHS_AMHARIC.map((name, idx) => (
                      <option key={name} value={idx + 1} className="bg-card text-foreground">
                        {name} ({EC_MONTHS_ENGLISH[idx]})
                      </option>
                    ))}
                  </select>

                  <select
                    value={ecYear}
                    onChange={(e) => setEcYear(parseInt(e.target.value, 10))}
                    className="bg-transparent font-semibold text-sm text-foreground focus:outline-none cursor-pointer py-1 px-1.5 rounded hover:bg-muted"
                  >
                    {Array.from({ length: 20 }, (_, i) => 2012 + i).map((y) => (
                      <option key={y} value={y} className="bg-card text-foreground">
                        {y} ዓ.ም
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (ecMonth === 13) {
                      setEcMonth(1);
                      setEcYear((y) => y + 1);
                    } else {
                      setEcMonth((m) => m + 1);
                    }
                  }}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Weekdays Header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted-foreground mb-1">
                {EC_WEEKDAYS_AMHARIC.map((w, idx) => (
                  <div key={w} className="py-1" title={EC_WEEKDAYS_ENGLISH[idx]}>
                    {w[0]}
                  </div>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: ecFirstDayWeekday }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8" />
                ))}

                {Array.from({ length: ecDaysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected =
                    selectedEcInfo &&
                    selectedEcInfo.ecYear === ecYear &&
                    selectedEcInfo.ecMonth === ecMonth &&
                    selectedEcInfo.ecDay === day;

                  // Corresponding GC date tooltip
                  const gcDate = toGregorianDate(ecYear, ecMonth, day);
                  const gcLabel = gcDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleSelectEthiopianDay(day)}
                      title={`${EC_MONTHS_AMHARIC[ecMonth - 1]} ${day}, ${ecYear} ዓ.ም = ${gcLabel}`}
                      className={`h-8 flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-all relative group ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold shadow-sm"
                          : "text-foreground hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      <span>{day}</span>
                      <span className={`text-[8px] leading-none opacity-60 ${isSelected ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                        {gcDate.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Gregorian Calendar View */}
          {calendarMode === "gc" && (
            <div>
              {/* Navigation Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <button
                  type="button"
                  onClick={() => {
                    if (gcMonth === 0) {
                      setGcMonth(11);
                      setGcYear((y) => y - 1);
                    } else {
                      setGcMonth((m) => m - 1);
                    }
                  }}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5">
                  <select
                    value={gcMonth}
                    onChange={(e) => setGcMonth(parseInt(e.target.value, 10))}
                    className="bg-transparent font-semibold text-sm text-foreground focus:outline-none cursor-pointer py-1 px-1.5 rounded hover:bg-muted"
                  >
                    {GC_MONTH_NAMES.map((name, idx) => (
                      <option key={name} value={idx} className="bg-card text-foreground">
                        {name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={gcYear}
                    onChange={(e) => setGcYear(parseInt(e.target.value, 10))}
                    className="bg-transparent font-semibold text-sm text-foreground focus:outline-none cursor-pointer py-1 px-1.5 rounded hover:bg-muted"
                  >
                    {Array.from({ length: 15 }, (_, i) => 2023 + i).map((y) => (
                      <option key={y} value={y} className="bg-card text-foreground">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (gcMonth === 11) {
                      setGcMonth(0);
                      setGcYear((y) => y + 1);
                    } else {
                      setGcMonth((m) => m + 1);
                    }
                  }}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Weekdays Header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted-foreground mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((w) => (
                  <div key={w} className="py-1">
                    {w}
                  </div>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: gcFirstDayWeekday }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8" />
                ))}

                {Array.from({ length: gcDaysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected =
                    selectedDateObj &&
                    selectedDateObj.getFullYear() === gcYear &&
                    selectedDateObj.getMonth() === gcMonth &&
                    selectedDateObj.getDate() === day;

                  const testDate = new Date(gcYear, gcMonth, day);
                  const ecInfo = toEthiopianDate(testDate);

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleSelectGregorianDay(day)}
                      title={`${GC_MONTH_NAMES[gcMonth]} ${day}, ${gcYear} = ${ecInfo?.formattedAmharic}`}
                      className={`h-8 flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-all relative group ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold shadow-sm"
                          : "text-foreground hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      <span>{day}</span>
                      <span className={`text-[8px] leading-none opacity-60 ${isSelected ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                        {ecInfo?.ecDay}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer with Synchronized Dual Date */}
          {selectedDateObj && (
            <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Sparkles className="w-3 h-3 text-primary" />
                {lang === "am" ? "የተመረጠ:" : "Selected:"}
              </span>
              <span className="font-semibold text-primary">
                {formatDualDate(selectedDateObj, lang)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

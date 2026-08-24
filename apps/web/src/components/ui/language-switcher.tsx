"use client";

import { useTranslation, type Language } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";

type LanguageSwitcherProps = {
  variant?: "dark" | "light";
  className?: string;
};

export function LanguageSwitcher({
  variant = "dark",
  className,
}: LanguageSwitcherProps) {
  const { lang, setLang } = useTranslation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectLanguage = (newLang: Language) => {
    setLang(newLang);
    setOpen(false);
  };

  const isDark = variant === "dark";

  return (
    <div ref={dropdownRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs border",
          isDark
            ? "border-slate-800 bg-slate-900/90 text-slate-200 hover:bg-slate-800 hover:text-white"
            : "border-slate-200 bg-slate-100/90 text-slate-700 hover:bg-slate-200 hover:text-slate-900",
        )}
        aria-label="Select language"
        aria-expanded={open}
      >
        <Globe className={cn("size-3.5", isDark ? "text-primary/80" : "text-[#233b66]")} />
        <span className="font-bold">{lang === "am" ? "🇪🇹 አማርኛ" : "🇺🇸 EN"}</span>
        <ChevronDown className="size-3 opacity-60" />
      </button>

      {open && (
        <div
          className={cn(
            "absolute right-0 top-full z-50 mt-1.5 w-36 rounded-xl border p-1 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150",
            isDark
              ? "border-slate-800 bg-slate-950 text-slate-200 shadow-slate-950/80"
              : "border-slate-200 bg-white text-slate-800 shadow-slate-300/50",
          )}
        >
          <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Language / ቋንቋ
          </div>
          <button
            type="button"
            onClick={() => selectLanguage("en")}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
              lang === "en"
                ? isDark
                  ? "bg-primary/30 text-primary/80 font-bold"
                  : "bg-primary/10 text-[#233b66] font-bold"
                : isDark
                ? "hover:bg-slate-900 hover:text-white"
                : "hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <span className="flex items-center gap-2">
              <span>🇺🇸</span>
              <span>English</span>
            </span>
            {lang === "en" && <Check className="size-3.5 text-primary/80" />}
          </button>

          <button
            type="button"
            onClick={() => selectLanguage("am")}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
              lang === "am"
                ? isDark
                  ? "bg-primary/30 text-primary/80 font-bold"
                  : "bg-primary/10 text-[#233b66] font-bold"
                : isDark
                ? "hover:bg-slate-900 hover:text-white"
                : "hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <span className="flex items-center gap-2">
              <span>🇪🇹</span>
              <span>አማርኛ</span>
            </span>
            {lang === "am" && <Check className="size-3.5 text-primary/80" />}
          </button>
        </div>
      )}
    </div>
  );
}

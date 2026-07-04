import { useEffect, useState } from "react";
import { Globe2, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: "en", label: "English", short: "EN", sub: "Default" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)", short: "KN", sub: "Karnataka" },
];

interface LanguageSelectorProps {
  className?: string;
  variant?: "light" | "dark";
}

export function LanguageSelector({
  className = "",
  variant = "light",
}: LanguageSelectorProps) {
  const [currentLang, setCurrentLang] = useState<string>("en");

  useEffect(() => {
    const saved = localStorage.getItem("kci_lang");
    if (saved === "en" || saved === "kn") {
      setCurrentLang(saved);
    }
  }, []);

  const switchLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    localStorage.setItem("kci_lang", langCode);
  };

  const activeLang =
    languages.find((l) => l.code === currentLang) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`inline-flex cursor-pointer min-h-9 items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-medium transition-all duration-200 active:scale-[0.96] ${
            variant === "light"
              ? "text-emerald-950/90 hover:bg-emerald-900/5 hover:text-emerald-950"
              : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
          } ${className}`}
        >
          <Globe2 className="size-4 text-emerald-600" />
          <span className="font-semibold tracking-wide">
            {activeLang.short}
          </span>
          <ChevronDown className="size-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 p-1.5 shadow-lg rounded-xl border border-stone-200/80 bg-white z-50"
      >
        <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400 border-b border-stone-100 mb-1">
          Select NLU Response Language
        </div>
        {languages.map((lang) => {
          const isSelected = currentLang === lang.code;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`flex items-center justify-between rounded-lg px-2.5 py-2 cursor-pointer transition-colors ${
                isSelected
                  ? "bg-emerald-50 text-emerald-900 font-semibold"
                  : "text-stone-700 hover:bg-stone-100"
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-medium">{lang.label}</span>
                <span className="text-[10px] text-stone-400">{lang.sub}</span>
              </div>
              {isSelected && (
                <Check className="size-4 text-emerald-600 shrink-0" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

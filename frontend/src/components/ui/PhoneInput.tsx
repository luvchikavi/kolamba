"use client";

import { useState } from "react";
import { Phone, ChevronDown } from "lucide-react";

const COUNTRY_CODES = [
  { code: "+1", country: "US/CA", flag: "🇺🇸" },
  { code: "+972", country: "IL", flag: "🇮🇱" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+7", country: "RU", flag: "🇷🇺" },
  { code: "+34", country: "ES", flag: "🇪🇸" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+27", country: "ZA", flag: "🇿🇦" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
}

export default function PhoneInput({
  value,
  onChange,
  error,
  label,
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Parse existing value to get country code and number
  const parseValue = () => {
    for (const cc of COUNTRY_CODES) {
      if (value.startsWith(cc.code)) {
        return {
          countryCode: cc,
          number: value.slice(cc.code.length).trim(),
        };
      }
    }
    return {
      countryCode: COUNTRY_CODES[0],
      number: value.replace(/^\+\d+\s*/, ""),
    };
  };

  const { countryCode, number } = parseValue();

  const handleCountryChange = (cc: (typeof COUNTRY_CODES)[0]) => {
    onChange(`${cc.code} ${number}`);
    setIsOpen(false);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/[^\d\s-]/g, "");
    onChange(`${countryCode.code} ${newNumber}`);
  };

  return (
    <div>
      {label && (
        <label className="block font-medium text-slate-700 mb-2">
          <Phone className="inline-block mr-2" size={18} />
          {label}
        </label>
      )}

      <div className="flex gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`h-[46px] px-3 border rounded-xl flex items-center gap-2 bg-white hover:bg-slate-50 transition-colors min-w-[100px]
              ${error ? "border-red-400" : "border-slate-200"}`}
          >
            <span className="text-lg">{countryCode.flag}</span>
            <span className="text-sm text-slate-700">{countryCode.code}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {isOpen && (
            <div className="absolute z-50 w-48 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
              {COUNTRY_CODES.map((cc) => (
                <button
                  key={cc.code}
                  type="button"
                  onClick={() => handleCountryChange(cc)}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-3 transition-colors first:rounded-t-xl last:rounded-b-xl
                    ${cc.code === countryCode.code ? "bg-primary-50" : ""}`}
                >
                  <span className="text-lg">{cc.flag}</span>
                  <span className="font-medium">{cc.code}</span>
                  <span className="text-slate-500">{cc.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="tel"
          value={number}
          onChange={handleNumberChange}
          placeholder="555-123-4567"
          className={`input flex-1 ${error ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

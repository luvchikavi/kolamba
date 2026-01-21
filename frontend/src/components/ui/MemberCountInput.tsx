"use client";

import { Users } from "lucide-react";

interface MemberCountInputProps {
  minValue: number | null;
  maxValue: number | null;
  onChange: (min: number | null, max: number | null) => void;
  error?: string;
  label?: string;
}

export default function MemberCountInput({
  minValue,
  maxValue,
  onChange,
  error,
  label,
}: MemberCountInputProps) {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? parseInt(e.target.value, 10) : null;
    onChange(val, maxValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? parseInt(e.target.value, 10) : null;
    onChange(minValue, val);
  };

  return (
    <div>
      {label && (
        <label className="block font-medium text-slate-700 mb-2">
          <Users className="inline-block mr-2" size={18} />
          {label}
        </label>
      )}

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="number"
            value={minValue ?? ""}
            onChange={handleMinChange}
            placeholder="Min"
            min={0}
            max={100000}
            className={`input text-center ${error ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
          />
        </div>

        <span className="text-slate-400 font-medium">to</span>

        <div className="flex-1">
          <input
            type="number"
            value={maxValue ?? ""}
            onChange={handleMaxChange}
            placeholder="Max"
            min={0}
            max={100000}
            className={`input text-center ${error ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
          />
        </div>

        <span className="text-slate-500 text-sm">members</span>
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      <p className="mt-1.5 text-xs text-slate-500">
        Approximate number of community members
      </p>
    </div>
  );
}

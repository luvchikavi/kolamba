"use client";

import { DiscoverParams } from "@/lib/api";

interface DiscoverFiltersProps {
  eventTypes: string[];
  selectedEventTypes: string[];
  onEventTypesChange: (types: string[]) => void;
  params: DiscoverParams;
  onParamsChange: (params: DiscoverParams) => void;
}

const PRICE_TIERS = [
  { label: "All", min: undefined, max: undefined },
  { label: "$", min: 0, max: 2000 },
  { label: "$$", min: 2000, max: 10000 },
  { label: "$$$", min: 10000, max: undefined },
];

const RADIUS_OPTIONS = [100, 200, 500];

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "distance", label: "Distance" },
  { value: "name", label: "Name" },
];

export default function DiscoverFilters({
  eventTypes,
  selectedEventTypes,
  onEventTypesChange,
  params,
  onParamsChange,
}: DiscoverFiltersProps) {
  const toggleEventType = (et: string) => {
    const next = selectedEventTypes.includes(et)
      ? selectedEventTypes.filter((t) => t !== et)
      : [...selectedEventTypes, et];
    onEventTypesChange(next);
  };

  const activePriceTier = PRICE_TIERS.find(
    (t) => t.min === params.min_price && t.max === params.max_price
  ) || PRICE_TIERS[0];

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Interest chips */}
      {eventTypes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {eventTypes.map((et) => {
            const active = selectedEventTypes.includes(et);
            return (
              <button
                key={et}
                onClick={() => toggleEventType(et)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  active
                    ? "bg-pink-500 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-pink-300"
                }`}
              >
                {et} {active && "\u2713"}
              </button>
            );
          })}
        </div>
      )}

      {/* Divider */}
      {eventTypes.length > 0 && (
        <div className="w-px h-6 bg-slate-200 hidden sm:block" />
      )}

      {/* Price tier buttons */}
      <div className="flex gap-1">
        {PRICE_TIERS.map((tier) => (
          <button
            key={tier.label}
            onClick={() =>
              onParamsChange({
                ...params,
                min_price: tier.min,
                max_price: tier.max,
              })
            }
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activePriceTier.label === tier.label
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
            }`}
          >
            {tier.label}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-slate-200 hidden sm:block" />

      {/* Touring nearby toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            onParamsChange({ ...params, touring_only: !params.touring_only })
          }
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            params.touring_only ? "bg-pink-500" : "bg-slate-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              params.touring_only ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-xs text-slate-600 font-medium">Touring nearby</span>
        {params.touring_only && (
          <select
            value={params.radius_km || 500}
            onChange={(e) =>
              onParamsChange({ ...params, radius_km: Number(e.target.value) })
            }
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600"
          >
            {RADIUS_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r} km
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="w-px h-6 bg-slate-200 hidden sm:block" />

      {/* Sort dropdown */}
      <select
        value={params.sort_by || "relevance"}
        onChange={(e) => onParamsChange({ ...params, sort_by: e.target.value })}
        className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-600 font-medium"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            Sort: {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

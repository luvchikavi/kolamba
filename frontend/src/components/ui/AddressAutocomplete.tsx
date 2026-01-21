"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";

interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  error?: string;
  label?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Start typing an address...",
  error,
  label,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Sync inputValue with value prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Using OpenStreetMap Nominatim for free geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      const data = await response.json();
      setSuggestions(data);
      setIsOpen(true);
    } catch (err) {
      console.error("Address search failed:", err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    // Debounce the search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      searchAddress(newValue);
    }, 300);
  };

  const handleSelect = (suggestion: AddressResult) => {
    const formattedAddress = formatAddress(suggestion);
    setInputValue(formattedAddress);
    onChange(formattedAddress, parseFloat(suggestion.lat), parseFloat(suggestion.lon));
    setIsOpen(false);
    setSuggestions([]);
  };

  const formatAddress = (result: AddressResult): string => {
    const parts = [];
    const { address } = result;

    const city = address.city || address.town || address.village;
    if (city) parts.push(city);
    if (address.state) parts.push(address.state);
    if (address.country) parts.push(address.country);

    return parts.length > 0 ? parts.join(", ") : result.display_name.split(",").slice(0, 3).join(",");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block font-medium text-slate-700 mb-2">
          <MapPin className="inline-block mr-2" size={18} />
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={`input pr-10 ${error ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 size={18} className="animate-spin text-slate-400" />
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.lat}-${suggestion.lon}-${index}`}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-start gap-3 transition-colors first:rounded-t-xl last:rounded-b-xl border-b border-slate-100 last:border-b-0"
            >
              <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {formatAddress(suggestion)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                  {suggestion.display_name}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <p className="mt-1.5 text-xs text-slate-500">
        Start typing to search for your location
      </p>
    </div>
  );
}

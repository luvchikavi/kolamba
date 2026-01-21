"use client";

import { useState, useRef, useEffect } from "react";
import { X, Check } from "lucide-react";

interface TagInputProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  label?: string;
  error?: string;
}

export default function TagInput({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  maxTags = 10,
  label,
  error,
}: TagInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(
    (option) =>
      option.toLowerCase().includes(search.toLowerCase()) &&
      !selected.includes(option)
  );

  const handleSelect = (option: string) => {
    if (selected.length < maxTags) {
      onChange([...selected, option]);
      setSearch("");
      inputRef.current?.focus();
    }
  };

  const handleRemove = (option: string) => {
    onChange(selected.filter((s) => s !== option));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && search === "" && selected.length > 0) {
      handleRemove(selected[selected.length - 1]);
    }
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === "Enter" && filteredOptions.length > 0) {
      e.preventDefault();
      handleSelect(filteredOptions[0]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block font-medium text-slate-700 mb-2">{label}</label>
      )}

      <div
        className={`min-h-[46px] border rounded-xl p-2 flex flex-wrap gap-2 cursor-text transition-all
          ${isOpen ? "border-primary-400 ring-2 ring-primary-100" : "border-slate-200"}
          ${error ? "border-red-400 focus-within:ring-red-100" : ""}
          bg-white`}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        {selected.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(tag);
              }}
              className="hover:bg-primary-100 rounded-full p-0.5 transition-colors"
            >
              <X size={14} />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm placeholder:text-slate-400"
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center justify-between transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              <span>{option}</span>
              {selected.includes(option) && (
                <Check size={16} className="text-primary-600" />
              )}
            </button>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <p className="mt-1.5 text-xs text-slate-500">
          {selected.length} of {maxTags} selected
        </p>
      )}
    </div>
  );
}

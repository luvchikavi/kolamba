"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Download, MapPin } from "lucide-react";
import { API_URL } from "@/lib/api";

interface TourDate {
  id: number;
  location: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  is_booked: boolean;
}

interface TourDatesCalendarProps {
  artistId: number;
  artistName: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function TourDatesCalendar({ artistId, artistName }: TourDatesCalendarProps) {
  const [tourDates, setTourDates] = useState<TourDate[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchTourDates = async () => {
      try {
        const res = await fetch(
          `${API_URL}/talents/${artistId}/tour-dates?include_past=false`
        );
        if (res.ok) {
          const data = await res.json();
          setTourDates(data);
        }
      } catch {
        // Silent fail - calendar just shows empty
      }
    };
    fetchTourDates();
  }, [artistId]);

  // Build a set of dates that have tour dates
  const tourDateMap = useMemo(() => {
    const map = new Map<string, TourDate[]>();
    for (const td of tourDates) {
      const start = new Date(td.start_date);
      const end = td.end_date ? new Date(td.end_date) : start;
      const current = new Date(start);
      while (current <= end) {
        const key = current.toISOString().split("T")[0];
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(td);
        current.setDate(current.getDate() + 1);
      }
    }
    return map;
  }, [tourDates]);

  const selectedTourDates = selectedDate ? tourDateMap.get(selectedDate) || [] : [];

  // Calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date().toISOString().split("T")[0];

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const handleExportIcal = () => {
    window.open(`${API_URL}/talents/${artistId}/tour-dates/ical`, "_blank");
  };

  if (tourDates.length === 0) {
    return null; // Don't render if no tour dates
  }

  return (
    <section className="card p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">Tour Schedule</h2>
        <button
          onClick={handleExportIcal}
          className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          <Download size={16} />
          Export iCal
        </button>
      </div>
      <div className="divider-gradient mb-6" />

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <h3 className="text-lg font-semibold text-slate-900">
          {MONTHS[currentMonth]} {currentYear}
        </h3>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronRight size={20} className="text-slate-600" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-slate-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const hasTour = tourDateMap.has(dateStr);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={day}
              onClick={() => hasTour ? setSelectedDate(isSelected ? null : dateStr) : undefined}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center text-sm
                transition-colors relative
                ${hasTour ? "cursor-pointer font-semibold" : "cursor-default"}
                ${isSelected ? "bg-primary-500 text-white" : ""}
                ${hasTour && !isSelected ? "bg-primary-50 text-primary-700 hover:bg-primary-100" : ""}
                ${isToday && !isSelected ? "ring-2 ring-primary-300" : ""}
                ${!hasTour && !isToday ? "text-slate-600" : ""}
              `}
            >
              {day}
              {hasTour && (
                <span
                  className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                    isSelected ? "bg-white" : "bg-primary-500"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date details */}
      {selectedDate && selectedTourDates.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="h-px bg-slate-200" />
          {selectedTourDates.map((td) => (
            <div
              key={td.id}
              className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
            >
              <MapPin size={18} className="text-primary-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">{td.location}</p>
                <p className="text-sm text-slate-500">
                  {new Date(td.start_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                  {td.end_date && td.end_date !== td.start_date && (
                    <>
                      {" - "}
                      {new Date(td.end_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </>
                  )}
                  {td.is_booked && (
                    <span className="ml-2 text-xs text-amber-600 font-medium">Booked</span>
                  )}
                </p>
                {td.description && (
                  <p className="text-sm text-slate-500 mt-1">{td.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

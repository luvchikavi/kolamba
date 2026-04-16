"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Download, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/lib/api";

interface TourDate {
  id: number;
  location: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  is_booked: boolean;
}

interface ScheduleItem {
  type: "booking" | "tour_stop";
  date: string;
  location: string | null;
  status: string;
  booking_id: number | null;
  tour_id: number | null;
  tour_name: string | null;
}

interface TourSummary {
  id: number;
  name: string;
  region: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
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

// Status display config
const statusConfig: Record<string, { label: string; color: string; selectedColor: string }> = {
  confirmed: { label: "Confirmed", color: "bg-emerald-100 text-emerald-700", selectedColor: "text-emerald-200" },
  approved: { label: "Confirmed", color: "bg-emerald-100 text-emerald-700", selectedColor: "text-emerald-200" },
  completed: { label: "Completed", color: "bg-slate-100 text-slate-600", selectedColor: "text-slate-300" },
  open: { label: "Open Slot", color: "bg-amber-100 text-amber-700", selectedColor: "text-amber-200" },
  inquiry: { label: "Inquiry", color: "bg-blue-100 text-blue-700", selectedColor: "text-blue-200" },
  recommended: { label: "Recommended", color: "bg-violet-100 text-violet-700", selectedColor: "text-violet-200" },
  rest_day: { label: "Rest Day", color: "bg-slate-100 text-slate-400", selectedColor: "text-slate-300" },
};

export default function TourDatesCalendar({ artistId, artistName }: TourDatesCalendarProps) {
  const [tourDates, setTourDates] = useState<TourDate[]>([]);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [activeTours, setActiveTours] = useState<TourSummary[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    // Fetch tour date announcements
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
        // Silent fail
      }
    };

    // Fetch public schedule (approved bookings + tour stops)
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`${API_URL}/talents/${artistId}/schedule`);
        if (res.ok) {
          const data = await res.json();
          setScheduleItems(data.items || []);
          setActiveTours(data.tours || []);
        }
      } catch {
        // Silent fail
      }
    };

    fetchTourDates();
    fetchSchedule();
  }, [artistId]);

  // Build a map of tour date announcements by calendar day
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

  // Build a map of schedule items (bookings + tour stops) by date
  const scheduleMap = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    for (const item of scheduleItems) {
      const key = item.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return map;
  }, [scheduleItems]);

  // Combined: does a date have any event?
  const hasEvent = (dateStr: string) => tourDateMap.has(dateStr) || scheduleMap.has(dateStr);

  // Determine visual style for a calendar cell
  const getCellStyle = (dateStr: string): { bg: string; text: string } => {
    const schedItems = scheduleMap.get(dateStr);
    if (schedItems) {
      const hasConfirmed = schedItems.some(s => s.status === "confirmed" || s.status === "approved");
      const isRestDay = schedItems.some(s => s.status === "rest_day");
      const isOpen = schedItems.some(s => s.status === "open");
      if (hasConfirmed) return { bg: "bg-emerald-100", text: "text-emerald-700" };
      if (isRestDay) return { bg: "bg-slate-100", text: "text-slate-400" };
      if (isOpen) return { bg: "bg-amber-100", text: "text-amber-700" };
      return { bg: "bg-blue-100", text: "text-blue-700" };
    }
    if (tourDateMap.has(dateStr)) {
      return { bg: "bg-primary-100", text: "text-primary-700" };
    }
    return { bg: "", text: "text-slate-600" };
  };

  // Range position for tour date announcements (multi-day ranges)
  const getRangePosition = (dateStr: string): "start" | "middle" | "end" | "single" | null => {
    const tours = tourDateMap.get(dateStr);
    if (!tours) return null;
    for (const td of tours) {
      const start = td.start_date.split("T")[0];
      const end = td.end_date ? td.end_date.split("T")[0] : start;
      if (start === end) return "single";
      if (dateStr === start) return "start";
      if (dateStr === end) return "end";
      return "middle";
    }
    return "single";
  };

  // Get short location label for display in cell
  const getLocationLabel = (dateStr: string): string | null => {
    // Prefer schedule items (actual bookings/stops)
    const schedItems = scheduleMap.get(dateStr);
    if (schedItems && schedItems.length > 0) {
      const loc = schedItems[0].location;
      if (!loc) return null;
      const short = loc.split(",")[0].trim();
      return short.length > 10 ? short.slice(0, 9) + "\u2026" : short;
    }
    // Fall back to tour date announcements
    const tours = tourDateMap.get(dateStr);
    if (tours && tours.length > 0) {
      const loc = tours[0].location;
      const short = loc.split(",")[0].trim();
      return short.length > 10 ? short.slice(0, 9) + "\u2026" : short;
    }
    return null;
  };

  // All events for selected date
  const selectedTourDates = selectedDate ? tourDateMap.get(selectedDate) || [] : [];
  const selectedScheduleItems = selectedDate ? scheduleMap.get(selectedDate) || [] : [];

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

  // Don't render if no data at all
  if (tourDates.length === 0 && scheduleItems.length === 0) {
    return null;
  }

  return (
    <section className="card p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">Tour Schedule</h2>
        {tourDates.length > 0 && (
          <button
            onClick={handleExportIcal}
            className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            <Download size={16} />
            Export iCal
          </button>
        )}
      </div>
      <div className="divider-gradient mb-6" />

      {/* Active tours summary */}
      {activeTours.length > 0 && (
        <div className="mb-6 space-y-2">
          {activeTours.map((tour) => (
            <Link
              key={tour.id}
              href={`/tours/${tour.id}`}
              className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <Calendar size={16} className="text-primary-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-primary-900 text-sm truncate">{tour.name}</p>
                <p className="text-xs text-primary-600">
                  {tour.region}
                  {tour.start_date && (
                    <> &middot; {new Date(tour.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {tour.end_date && (
                      <> – {new Date(tour.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</>
                    )}</>
                  )}
                </p>
              </div>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                tour.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}>
                {tour.status === "approved" ? "Active" : "Open"}
              </span>
            </Link>
          ))}
        </div>
      )}

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
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const hasAny = hasEvent(dateStr);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const cellStyle = getCellStyle(dateStr);
          const rangePos = getRangePosition(dateStr);
          const locationLabel = getLocationLabel(dateStr);

          // Range-aware rounding (only for tour date announcement ranges)
          const hasScheduleItem = scheduleMap.has(dateStr);
          const roundingClass = !hasScheduleItem && rangePos === "start"
            ? "rounded-l-lg rounded-r-none"
            : !hasScheduleItem && rangePos === "end"
            ? "rounded-r-lg rounded-l-none"
            : !hasScheduleItem && rangePos === "middle"
            ? "rounded-none"
            : "rounded-lg";

          return (
            <button
              key={day}
              onClick={() => hasAny ? setSelectedDate(isSelected ? null : dateStr) : undefined}
              className={`
                min-h-[3rem] flex flex-col items-center justify-center text-sm
                transition-colors relative py-1
                ${roundingClass}
                ${hasAny ? "cursor-pointer font-semibold" : "cursor-default"}
                ${isSelected ? "bg-primary-500 text-white" : ""}
                ${hasAny && !isSelected ? `${cellStyle.bg} ${cellStyle.text} hover:opacity-80` : ""}
                ${isToday && !isSelected ? "ring-2 ring-primary-300" : ""}
                ${!hasAny && !isToday ? "text-slate-600" : ""}
              `}
            >
              <span>{day}</span>
              {hasAny && locationLabel && (
                <span
                  className={`text-[9px] leading-tight truncate max-w-full px-0.5 ${
                    isSelected ? "text-white/80" : cellStyle.text
                  }`}
                >
                  {locationLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" />
          Confirmed
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />
          Open Slot
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-primary-100 border border-primary-200" />
          Tour Dates
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
          Rest Day
        </div>
      </div>

      {/* Selected date details */}
      {selectedDate && (selectedScheduleItems.length > 0 || selectedTourDates.length > 0) && (
        <div className="mt-4 space-y-3">
          <div className="h-px bg-slate-200" />

          {/* Schedule items (bookings + tour stops) */}
          {selectedScheduleItems.map((item, idx) => {
            const config = statusConfig[item.status] || { label: item.status, color: "bg-slate-100 text-slate-600" };
            return (
              <div
                key={`sched-${idx}`}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
              >
                <MapPin size={18} className="text-primary-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-slate-900">
                      {item.location || "Location TBD"}
                    </p>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {new Date(item.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                    {item.tour_name && (
                      <span className="ml-2 text-primary-600">
                        &middot; {item.tour_name}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Tour date announcements (only show if no schedule items for this date) */}
          {selectedScheduleItems.length === 0 && selectedTourDates.map((td) => (
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

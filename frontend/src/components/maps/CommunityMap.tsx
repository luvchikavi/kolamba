"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

interface MapLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  type: "community" | "tour_date";
  details?: string;
}

interface CommunityMapProps {
  locations: MapLocation[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

// Dynamically import Leaflet components (no SSR)
const MapInner = dynamic(() => import("./MapInner"), { ssr: false });

export default function CommunityMap({
  locations,
  center = [39.8, -98.5], // Center of US
  zoom = 4,
  height = "400px",
}: CommunityMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ height }} className="bg-slate-100 rounded-xl flex items-center justify-center">
        <p className="text-slate-400">Loading map...</p>
      </div>
    );
  }

  return <MapInner locations={locations} center={center} zoom={zoom} height={height} />;
}

export type { MapLocation };

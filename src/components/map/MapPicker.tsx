"use client";

// MapPicker — used on Add Property form
// Supports TWO input methods seamlessly:
// 1. Paste a Google Maps / Location link (automatically extracts coordinates & moves map pin)
// 2. Click / Drag pin directly on the Leaflet map

import { useEffect, useRef, useState } from "react";
import { MapPin, Link as LinkIcon, Check, ExternalLink } from "lucide-react";

interface MapPickerProps {
  lat: number | null;
  lng: number | null;
  mapUrl?: string;
  onChange: (lat: number, lng: number) => void;
  onUrlChange?: (url: string) => void;
}

const TUM_LAT = -4.0435;
const TUM_LNG = 39.6682;

// Utility to extract coordinates from common map URLs
function parseCoordinatesFromUrl(url: string): { lat: number; lng: number } | null {
  if (!url) return null;

  // Format 1: @lat,lng e.g. google.com/maps/@-4.0435,39.6682,17z
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  }

  // Format 2: q=lat,lng or ll=lat,lng e.g. maps.google.com/?q=-4.0435,39.6682
  const qMatch = url.match(/[?&](?:q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  }

  // Format 3: raw coordinates in string "-4.0435, 39.6682"
  const rawMatch = url.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (rawMatch) {
    return { lat: parseFloat(rawMatch[1]), lng: parseFloat(rawMatch[2]) };
  }

  return null;
}

export default function MapPicker({ lat, lng, mapUrl = "", onChange, onUrlChange }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [inputUrl, setInputUrl] = useState(mapUrl);
  const [parseSuccess, setParseSuccess] = useState(false);

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    // Guard against React StrictMode double-invoke: if Leaflet already stamped
    // a _leaflet_id on the container, a map is (or was) already initialised there.
    if ((mapRef.current as any)._leaflet_id) return;
    if (mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      // Double-check after async import resolves (StrictMode fires effects twice)
      if (!mapRef.current || (mapRef.current as any)._leaflet_id || mapInstanceRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const initLat = lat ?? TUM_LAT;
      const initLng = lng ?? TUM_LNG;

      const map = L.map(mapRef.current!, {
        center: [initLat, initLng],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // TUM campus reference pin
      const tumIcon = L.divIcon({
        className: "",
        html: `<div style="background:#15803D;color:#fff;font-size:10px;font-weight:bold;padding:4px 8px;border-radius:8px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);">🎓 TUM Mombasa</div>`,
        iconAnchor: [50, 10],
      });
      L.marker([TUM_LAT, TUM_LNG], { icon: tumIcon }).addTo(map);

      // Add property pin if coordinates already exist
      if (lat && lng) {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
        markerRef.current.on("dragend", (e: any) => {
          const pos = e.target.getLatLng();
          onChange(parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6)));
        });
      }

      // Click to place/move pin
      map.on("click", (e: any) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        const newLat = parseFloat(clickLat.toFixed(6));
        const newLng = parseFloat(clickLng.toFixed(6));

        if (markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng]);
        } else {
          markerRef.current = L.marker([newLat, newLng], { draggable: true }).addTo(map);
          markerRef.current.on("dragend", (evt: any) => {
            const pos = evt.target.getLatLng();
            onChange(parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6)));
          });
        }
        onChange(newLat, newLng);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markerRef.current = null;
      // Clear the _leaflet_id Leaflet stamps onto the container so a fresh
      // mount (React StrictMode double-invoke) doesn't see a "stale" id.
      if (mapRef.current) {
        delete (mapRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // Update map marker when lat/lng change from external source (e.g. pasted URL)
  useEffect(() => {
    if (!mapInstanceRef.current || !lat || !lng) return;

    import("leaflet").then((L) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(mapInstanceRef.current);
        markerRef.current.on("dragend", (evt: any) => {
          const pos = evt.target.getLatLng();
          onChange(parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6)));
        });
      }
      mapInstanceRef.current.setView([lat, lng], 16);
    });
  }, [lat, lng]);

  const handleUrlInputChange = (val: string) => {
    setInputUrl(val);
    if (onUrlChange) onUrlChange(val);

    const coords = parseCoordinatesFromUrl(val);
    if (coords) {
      onChange(coords.lat, coords.lng);
      setParseSuccess(true);
      setTimeout(() => setParseSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin="anonymous"
      />

      {/* Option 1: Paste Google Maps Link */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          <LinkIcon className="w-3.5 h-3.5 text-primary-600" />
          Paste Google Maps Link (Optional)
        </label>
        <div className="relative">
          <input
            type="url"
            placeholder="https://maps.google.com/?q=-4.0435,39.6682"
            value={inputUrl}
            onChange={(e) => handleUrlInputChange(e.target.value)}
            className="input text-sm pr-10"
          />
          {parseSuccess && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 flex items-center text-xs font-bold gap-1 bg-emerald-50 px-2 py-0.5 rounded-md">
              <Check className="w-3.5 h-3.5" /> Pinned!
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-400">
          Paste a Google Maps share link, or drop a pin directly on the interactive map below.
        </p>
      </div>

      {/* Option 2: Interactive Leaflet Map */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary-600" />
          Interactive Map Pin
        </label>
        <div
          ref={mapRef}
          className="h-56 w-full rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm"
          style={{ zIndex: 0 }}
        />

        {lat && lng ? (
          <div className="flex items-center justify-between text-xs text-primary-700 font-medium bg-primary-50 px-3 py-2 rounded-xl border border-primary-100">
            <span className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              Pin set at {lat}, {lng}
            </span>
            <span className="text-gray-400 font-normal">drag pin to adjust</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            Click anywhere on the map above to drop your location pin
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

// PropertyMap — used on Listing Detail page
// Displays location on interactive Leaflet map AND provides a direct Google Maps directions button.
// If exact lat/lng not stored, geocodes the area via OpenStreetMap Nominatim to get real area coordinates.

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Navigation, MapPin } from "lucide-react";

interface PropertyMapProps {
  lat: number | null;
  lng: number | null;
  mapUrl?: string | null;
  title: string;
  area: string;
  subcounty?: string;
  county?: string;
}

// Fallback: Mombasa city center (used only if geocoding also fails)
const DEFAULT_LAT = -4.0435;
const DEFAULT_LNG = 39.6682;

// Custom SVG house/pin icon markup
function buildPropertyIcon(label: string, exact: boolean) {
  const bg = exact ? "#15803D" : "#f59e0b";
  const shadow = exact ? "rgba(21,128,61,0.45)" : "rgba(245,158,11,0.4)";
  return `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="
        background:${bg};
        color:#fff;
        font-family:'Inter',sans-serif;
        font-size:11px;
        font-weight:700;
        padding:5px 10px;
        border-radius:10px;
        white-space:nowrap;
        box-shadow:0 4px 12px ${shadow};
        border:2px solid white;
        letter-spacing:0.01em;
      ">
        ${label}
      </div>
      <div style="
        width:0;height:0;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:8px solid ${bg};
        margin-top:-1px;
      "></div>
    </div>
  `;
}

// Geocode an area string using OSM Nominatim
async function geocodeArea(area: string, subcounty: string, county: string): Promise<[number, number] | null> {
  try {
    const query = `${area}, ${subcounty}, ${county}, Kenya`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=ke`;
    const res = await fetch(url, {
      headers: { "User-Agent": "CampusKey/1.0 (campuskey.co.ke)" },
    });
    const data = await res.json();
    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch {
    // silently ignore
  }
  return null;
}

export default function PropertyMap({ lat, lng, mapUrl, title, area, subcounty = "", county = "Mombasa" }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasExactLocation = !!(lat && lng);

  // State for geocoded coords (used when exact lat/lng not stored)
  const [resolvedLat, setResolvedLat] = useState<number>(lat ?? DEFAULT_LAT);
  const [resolvedLng, setResolvedLng] = useState<number>(lng ?? DEFAULT_LNG);
  const [isGeolocated, setIsGeolocated] = useState(hasExactLocation);
  const [geocoding, setGeocoding] = useState(!hasExactLocation);

  // Google Maps link: prefer stored mapUrl, fallback to coords, fallback to area search
  const googleMapsUrl = mapUrl ||
    (lat && lng ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` :
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${area}, ${subcounty}, ${county}, Kenya`)}`);

  // Geocode if no exact coordinates
  useEffect(() => {
    if (hasExactLocation) return;
    setGeocoding(true);
    geocodeArea(area, subcounty, county).then((coords) => {
      if (coords) {
        setResolvedLat(coords[0]);
        setResolvedLng(coords[1]);
        setIsGeolocated(true);
      }
      setGeocoding(false);
    });
  }, [area, subcounty, county, hasExactLocation]);

  // Build/rebuild map when resolved coordinates change
  useEffect(() => {
    if (geocoding) return; // wait until geocoding done
    if (typeof window === "undefined" || !mapRef.current) return;

    // Tear down existing map first
    const container = mapRef.current as HTMLDivElement & { _leaflet_id?: number };
    if (mapInstanceRef.current) {
      (mapInstanceRef.current as unknown as { remove: () => void }).remove();
      mapInstanceRef.current = null;
    }
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    import("leaflet").then((L) => {
      if (!mapRef.current) return;
      const c = mapRef.current as HTMLDivElement & { _leaflet_id?: number };
      if (c._leaflet_id) return;

      const map = L.map(mapRef.current!, {
        center: [resolvedLat, resolvedLng],
        zoom: hasExactLocation ? 16 : 15,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Marker icon
      const pinIcon = L.divIcon({
        className: "",
        html: buildPropertyIcon(
          hasExactLocation ? area : `${area} (area)`,
          hasExactLocation
        ),
        iconSize: [0, 0],
        iconAnchor: [60, 32],
      });

      L.marker([resolvedLat, resolvedLng], { icon: pinIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:Inter,sans-serif;font-size:13px;">
            <strong>${title}</strong><br>
            <span style="color:#555;">${area}, ${subcounty}</span>
            ${hasExactLocation ? "" : "<br><em style='color:#f59e0b;font-size:11px;'>Area approximation</em>"}
          </div>`,
          { maxWidth: 220 }
        )
        .openPopup();

      mapInstanceRef.current = map as unknown as ReturnType<typeof setTimeout>;
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as unknown as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
      if (mapRef.current) {
        delete (mapRef.current as HTMLDivElement & { _leaflet_id?: number })._leaflet_id;
      }
    };
  }, [resolvedLat, resolvedLng, hasExactLocation, area, subcounty, title, geocoding]);

  return (
    <div className="space-y-3">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin="anonymous"
      />

      {/* Map container */}
      <div className="relative">
        <div
          ref={mapRef}
          className="h-64 w-full rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
          style={{ zIndex: 0 }}
        />
        {/* Geocoding loader overlay */}
        {geocoding && (
          <div className="absolute inset-0 rounded-2xl bg-gray-50/80 flex items-center justify-center gap-2 text-gray-400 text-sm backdrop-blur-sm">
            <div className="w-4 h-4 border-2 border-[#15803D] border-t-transparent rounded-full animate-spin" />
            Locating area...
          </div>
        )}
      </div>

      {/* Footer row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${hasExactLocation ? "text-[#15803D]" : "text-amber-500"}`} />
          {hasExactLocation ? (
            <span className="text-gray-600">Exact property location pinned in {area}.</span>
          ) : isGeolocated ? (
            <span className="text-amber-600">
              Showing <strong>{area}</strong> area location — partner hasn&apos;t pinned an exact spot yet.
            </span>
          ) : (
            <span className="text-gray-400">Showing approximate Mombasa area.</span>
          )}
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline py-2 px-4 text-xs font-semibold flex items-center gap-1.5 rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-800 flex-shrink-0"
        >
          <Navigation className="w-3.5 h-3.5 text-primary-700" />
          Open in Google Maps
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </a>
      </div>
    </div>
  );
}

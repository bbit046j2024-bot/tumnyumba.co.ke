"use client";

// PropertyMap — used on Listing Detail page
// Displays location on interactive Leaflet map AND provides a direct Google Maps directions button if mapUrl or coordinates exist.

import { useEffect, useRef } from "react";
import { ExternalLink, Navigation } from "lucide-react";

interface PropertyMapProps {
  lat: number | null;
  lng: number | null;
  mapUrl?: string | null;
  title: string;
  area: string;
}

const TUM_LAT = -4.0435;
const TUM_LNG = 39.6682;

export default function PropertyMap({ lat, lng, mapUrl, title, area }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const centerLat = lat ?? TUM_LAT;
  const centerLng = lng ?? TUM_LNG;
  const hasExactLocation = !!(lat && lng);

  // Generate Google Maps Directions link if coordinates exist but no explicit mapUrl passed
  const googleMapsDirectionsUrl = mapUrl || (lat && lng ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(area + " Mombasa")}`);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    // Guard against React StrictMode double-invoke
    if ((mapRef.current as any)._leaflet_id) return;
    if (mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      // Re-check after async import resolves
      if (!mapRef.current || (mapRef.current as any)._leaflet_id || mapInstanceRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [centerLat, centerLng],
        zoom: hasExactLocation ? 16 : 14,
        zoomControl: true,
        scrollWheelZoom: false,
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

      if (hasExactLocation) {
        // Property Pin
        const propIcon = L.divIcon({
          className: "",
          html: `<div style="background:#15803D;color:#fff;font-size:11px;font-weight:600;padding:6px 10px;border-radius:10px;white-space:nowrap;box-shadow:0 3px 10px rgba(21,128,61,0.4);border:2px solid white;">
            📍 ${area}
          </div>`,
          iconAnchor: [40, 20],
        });
        L.marker([centerLat, centerLng], { icon: propIcon })
          .addTo(map)
          .bindPopup(`<strong>${title}</strong><br>${area}`)
          .openPopup();

        // 1km radius circle relative to TUM
        L.circle([TUM_LAT, TUM_LNG], {
          radius: 1000,
          color: "#15803D",
          fillColor: "#15803D",
          fillOpacity: 0.05,
          dashArray: "6, 8",
          weight: 1.5,
        }).addTo(map);
      } else {
        // Approximate location marker
        const areaIcon = L.divIcon({
          className: "",
          html: `<div style="background:#f59e0b;color:#fff;font-size:10px;font-weight:bold;padding:4px 8px;border-radius:8px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);">📍 ${area} (approximate)</div>`,
          iconAnchor: [60, 10],
        });
        L.marker([centerLat, centerLng], { icon: areaIcon }).addTo(map);
      }

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      // Clear _leaflet_id so the next remount (StrictMode) finds a clean container
      if (mapRef.current) {
        delete (mapRef.current as any)._leaflet_id;
      }
    };
  }, [centerLat, centerLng]);

  return (
    <div className="space-y-3">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin="anonymous"
      />

      <div
        ref={mapRef}
        className="h-64 w-full rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
        style={{ zIndex: 0 }}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        {!hasExactLocation ? (
          <p className="text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-100 flex-1">
            📍 Showing general {area} area near TUM.
          </p>
        ) : (
          <p className="text-gray-500 flex-1">
            📍 Pinned location near TUM Mombasa Campus.
          </p>
        )}

        <a
          href={googleMapsDirectionsUrl}
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

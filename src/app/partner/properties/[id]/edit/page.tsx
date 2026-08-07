"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  MapPin, Check, Loader2, ArrowLeft, Upload, X, Image as ImageIcon, PhoneCall
} from "lucide-react";
import Link from "next/link";
import { containsPhone } from "@/lib/moderation";

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-56 w-full rounded-2xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-400 text-sm">
      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading map...
    </div>
  ),
});

interface UploadedImage {
  url: string;
  publicId: string;
  preview: string;
}

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("BEDSITTER");
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [county, setCounty] = useState("Mombasa");
  const [subcounty, setSubcounty] = useState("Kisauni");
  const [area, setArea] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [description, setDescription] = useState("");
  const [availability, setAvailability] = useState("AVAILABLE");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [mapUrl, setMapUrl] = useState("");

  const [amenities, setAmenities] = useState({
    wifi: false, water: false, electricity: false, parking: false, security: false,
  });

  const [autoRelist, setAutoRelist] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!propertyId) return;
    setLoading(true);
    fetch(`/api/partner/properties/${propertyId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Property not found");
        return r.json();
      })
      .then((data) => {
        setTitle(data.title || "");
        setCategory(data.category || "BEDSITTER");
        setRent(data.rent?.toString() || "");
        setDeposit(data.deposit?.toString() || "");
        setCounty(data.county || "Mombasa");
        setSubcounty(data.subcounty || "Kisauni");
        setArea(data.area || "");
        setContactPerson(data.contactPerson || "");
        setContactPhone(data.contactPhone || "");
        setDescription(data.description || "");
        setAvailability(data.availabilityStatus || "AVAILABLE");
        setAutoRelist(!!data.autoRelist);
        setLatitude(data.latitude || null);
        setLongitude(data.longitude || null);
        setMapUrl(data.mapUrl || "");
        setAmenities({
          wifi: !!data.wifi,
          water: !!data.water,
          electricity: !!data.electricity,
          parking: !!data.parking,
          security: !!data.security,
        });

        if (Array.isArray(data.images)) {
          setImages(
            data.images.map((img: { url: string; publicId: string }) => ({
              url: img.url,
              publicId: img.publicId || "",
              preview: img.url,
            }))
          );
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load property details.");
      })
      .finally(() => setLoading(false));
  }, [propertyId]);

  const toggleAmenity = (key: keyof typeof amenities) => {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (images.length + files.length > 5) {
      setError("Maximum 5 images allowed.");
      return;
    }

    setUploading(true);
    setError("");

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) {
          const preview = URL.createObjectURL(file);
          setImages((prev) => [...prev, { url: data.url, publicId: data.publicId, preview }]);
        } else {
          setError(data.error || "Image upload failed. Please try again.");
        }
      } catch {
        setError("Upload error. Check your connection and try again.");
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/partner/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, category, rent, deposit, county, subcounty, area,
          contactPerson, contactPhone,
          description, availabilityStatus: availability, autoRelist, amenities,
          latitude, longitude, mapUrl,
          images: images.map(({ url, publicId }) => ({ url, publicId })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update property.");
        return;
      }
      router.push("/partner/properties");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <p className="text-sm text-gray-500 font-medium">Loading listing details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <Link href="/partner/properties" className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <div>
          <h1 className="page-title">Edit Property Details</h1>
          <p className="page-subtitle">Update information, caretaker details, and pricing for this listing</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-8 space-y-6">
        {/* Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="input-label">Property Title</label>
            <input type="text" placeholder="e.g. Spacious Bedsitter near TUM" value={title} onChange={(e) => setTitle(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="input-label">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="select">
              <option value="SINGLE_ROOM">Single Room</option>
              <option value="BEDSITTER">Bedsitter</option>
              <option value="STUDIO">Studio</option>
              <option value="ONE_BED">1 Bedroom</option>
              <option value="TWO_BED">2 Bedroom</option>
              <option value="HOSTEL">Hostel</option>
              <option value="SHARED_ROOM">Shared Room</option>
              <option value="BNB">AirBnB / BNB</option>
            </select>
          </div>
        </div>

        {/* Rent & Deposit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="input-label">Monthly Rent (KSh)</label>
            <input type="number" placeholder="6000" value={rent} onChange={(e) => setRent(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="input-label">Deposit (KSh)</label>
            <input type="number" placeholder="6000" value={deposit} onChange={(e) => setDeposit(e.target.value)} className="input" required />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="input-label">County</label>
            <input type="text" value={county} onChange={(e) => setCounty(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="input-label">Sub-County</label>
            <input type="text" value={subcounty} onChange={(e) => setSubcounty(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="input-label">Area / Estate</label>
            <input type="text" placeholder="e.g. Tononoka" value={area} onChange={(e) => setArea(e.target.value)} className="input" required />
          </div>
        </div>

        {/* Property Specific Contact / Caretaker Information */}
        <div className="bg-primary-50/50 p-5 rounded-2xl border border-primary-100/70 space-y-4">
          <div>
            <h3 className="font-poppins font-bold text-sm text-gray-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-primary-700" /> Direct Property Contact / Caretaker (Optional)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Provide caretaker or agent contact details for this specific property.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label text-xs">Caretaker / Contact Name</label>
              <input
                type="text"
                placeholder="e.g. Caretaker Omari or Agent Sarah"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="input bg-white text-sm"
              />
            </div>
            <div>
              <label className="input-label text-xs">Direct Contact Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. 0712345678"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="input bg-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Map Picker */}
        <div>
          <label className="input-label flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary-700" /> Property Location on Map
            <span className="text-xs text-gray-400 font-normal">(click map to update pin)</span>
          </label>
          <MapPicker
            lat={latitude}
            lng={longitude}
            mapUrl={mapUrl}
            onChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); }}
            onUrlChange={setMapUrl}
          />
        </div>

        {/* Description */}
        <div>
          <label className="input-label">Description</label>
          <textarea rows={4} placeholder="Spacious bedsitter with water, Wi-Fi, and secure environment..." value={description} onChange={(e) => setDescription(e.target.value)} className="input resize-none" required />
          {(containsPhone(title) || containsPhone(description)) && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium flex items-start gap-2">
              <PhoneCall className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                Phone numbers are not allowed in titles or descriptions. Please use the dedicated Caretaker / Contact input fields above.
              </span>
            </div>
          )}
        </div>

        {/* Amenities */}
        <div>
          <label className="input-label mb-3">Amenities Included</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { key: "wifi", label: "Wi-Fi" },
              { key: "water", label: "Water 24/7" },
              { key: "electricity", label: "Electricity" },
              { key: "parking", label: "Parking" },
              { key: "security", label: "Security" },
            ].map(({ key, label }) => {
              const checked = amenities[key as keyof typeof amenities];
              return (
                <button type="button" key={key} onClick={() => toggleAmenity(key as keyof typeof amenities)}
                  className={`p-3 rounded-xl border font-medium text-sm flex items-center justify-center gap-2 transition-all ${checked ? "bg-primary-50 border-primary-600 text-primary-800 shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  <div className={`w-4 h-4 rounded flex items-center justify-center text-white ${checked ? "bg-primary-600" : "border border-gray-300"}`}>
                    {checked && <Check className="w-3 h-3" />}
                  </div>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="input-label mb-2">Property Photos (Max 5)</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {images.map((img, i) => (
              <div key={i} className="relative h-28 rounded-xl overflow-hidden border border-gray-200 group">
                <img src={img.preview} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className={`h-28 rounded-xl border-2 border-dashed ${uploading ? "border-gray-200 bg-gray-50" : "border-primary-300 bg-primary-50/50 hover:bg-primary-50 cursor-pointer"} flex flex-col items-center justify-center transition-all gap-1 text-primary-700`}>
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span className="text-xs font-semibold">Add Photo</span>
                  </>
                )}
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
              </label>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <div>
            <label className="input-label mb-1">Availability Status</label>
            <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="select w-48 text-sm">
              <option value="AVAILABLE">Available</option>
              <option value="TAKEN">Taken / Occupied</option>
              <option value="PAUSED">Paused</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer mt-2 sm:mt-0">
            <input type="checkbox" checked={autoRelist} onChange={(e) => setAutoRelist(e.target.checked)} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
            <span className="text-sm font-medium text-gray-700">Auto-relist when unit is freed</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
          <Link href="/partner/properties" className="btn-ghost text-sm">Cancel</Link>
          <button type="submit" className="btn-primary" disabled={submitting || uploading || containsPhone(title) || containsPhone(description)}>
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...</> : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

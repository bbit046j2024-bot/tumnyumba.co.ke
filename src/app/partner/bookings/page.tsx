"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarCheck, Phone, Mail, Home, Loader2, RefreshCw, User, MapPin, Trash2 } from "lucide-react";

interface Lead {
  id: string;
  message: string | null;
  status: string;
  createdAt: string;
  property: { id: string; title: string; category: string; area: string };
  student: { id: string; name: string; email: string; phone: string | null };
}

const CATEGORY_LABELS: Record<string, string> = {
  BEDSITTER: "Bedsitter", ONE_BEDROOM: "1 Bedroom", TWO_BEDROOM: "2 Bedroom",
  THREE_BEDROOM: "3 Bedroom", STUDIO: "Studio", SINGLE_ROOM: "Single Room",
  BNB: "BnB / AirBnB", HOSTEL: "Hostel", SHARED: "Shared",
};

export default function PartnerBookingsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/partner/leads");
      const data = await res.json();
      if (Array.isArray(data)) setLeads(data);
      else setError("Failed to load enquiries.");
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleDeleteLead = async (leadId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to remove ${studentName}'s enquiry?`)) return;

    setDeletingId(leadId);
    try {
      const res = await fetch(`/api/partner/leads/${leadId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to remove enquiry.");
      }
    } catch {
      alert("Network error. Could not delete enquiry.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Student Enquiries</h1>
          <p className="page-subtitle">Student interest requests submitted for your properties.</p>
        </div>
        <button onClick={fetchLeads} className="btn-secondary flex items-center gap-2 text-sm self-start">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
        </div>
      ) : leads.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <CalendarCheck className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="font-semibold text-gray-500">No enquiries yet</p>
          <p className="text-xs mt-1">Student interest submissions will appear here once students contact you.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div key={lead.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Student info */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-4.5 h-4.5 text-primary-700" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 font-poppins">{lead.student.name}</div>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.student.email}</span>
                      {lead.student.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.student.phone}</span>}
                    </div>
                    {lead.message && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 italic">
                        "{lead.message}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Property info & actions */}
                <div className="flex flex-col md:items-end gap-2 flex-shrink-0">
                  <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 bg-primary-50 border border-primary-100 px-3 py-1.5 rounded-xl">
                    <Home className="w-3.5 h-3.5" />
                    {lead.property.title}
                  </div>
                  <div className="flex items-center md:justify-end gap-1 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    {CATEGORY_LABELS[lead.property.category] || lead.property.category} · {lead.property.area}
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-3 w-full mt-1">
                    <span className="text-xs text-gray-400">
                      {new Date(lead.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <button
                      onClick={() => handleDeleteLead(lead.id, lead.student.name)}
                      disabled={deletingId === lead.id}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                      title="Remove student enquiry"
                    >
                      {deletingId === lead.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

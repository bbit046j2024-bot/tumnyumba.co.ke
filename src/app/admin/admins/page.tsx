"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Mail, Phone, Loader2, RefreshCw, ShieldCheck, UserPlus, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  createdAt: string;
  emailVerified: string | null;
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Deletion modal state
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/admins?${params}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.admins)) {
        setAdmins(data.admins);
        setCurrentAdminId(data.currentAdminId || "");
      } else {
        setError(data.error || "Failed to load admin accounts.");
      }
    } catch {
      setError("Network error fetching admin accounts.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchAdmins, 300);
    return () => clearTimeout(t);
  }, [fetchAdmins]);

  const handleDelete = async () => {
    if (!adminToDelete) return;
    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/admins/${adminToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to delete admin account.");
      } else {
        setSuccess(`Admin account "${adminToDelete.name}" deleted successfully.`);
        setAdmins((prev) => prev.filter((a) => a.id !== adminToDelete.id));
        setAdminToDelete(null);
        setTimeout(() => setSuccess(""), 4000);
      }
    } catch {
      setError("Network error deleting admin account.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-primary-700" /> Admin Accounts
          </h1>
          <p className="page-subtitle">View, create, and manage authorized platform administrator accounts.</p>
        </div>
        <div className="flex items-center gap-3 self-start">
          <button onClick={fetchAdmins} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <Link href="/auth/register/admin" className="btn-primary flex items-center gap-2 text-sm">
            <UserPlus className="w-4 h-4" /> Add Admin Account
          </Link>
        </div>
      </div>

      <div className="card p-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search admins by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 text-sm"
          />
        </div>
        <span className="text-sm text-gray-500 font-medium">{admins.length} admin{admins.length !== 1 ? "s" : ""}</span>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl px-4 py-3 font-medium">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase font-poppins">
                  <th className="p-4">Administrator</th>
                  <th className="p-4">Phone Contact</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {admins.map((a) => {
                  const isCurrentSessionAdmin = a.id === currentAdminId;
                  return (
                    <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                            {a.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 font-poppins flex items-center gap-2">
                              {a.name}
                              {isCurrentSessionAdmin && (
                                <span className="bg-primary-100 text-primary-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {a.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">
                        {a.phone ? (
                          <div className="flex items-center gap-1.5 text-sm">
                            <Phone className="w-3.5 h-3.5 text-gray-400" /> {a.phone}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs italic">No phone</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Active Admin
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-xs">
                        {new Date(a.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="p-4 text-right">
                        {isCurrentSessionAdmin ? (
                          <span className="text-xs text-gray-400 italic px-2" title="You cannot delete your active logged in account">
                            Current Session
                          </span>
                        ) : (
                          <button
                            onClick={() => setAdminToDelete(a)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Admin Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {admins.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400 text-sm">
                      No admin accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Admin Confirmation Modal */}
      {adminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-poppins font-bold text-lg text-gray-900">Delete Admin Account</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Are you sure you want to revoke admin privileges and delete <span className="font-semibold text-gray-800">{adminToDelete.name}</span> ({adminToDelete.email})? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAdminToDelete(null)}
                disabled={deleting}
                className="btn-secondary flex-1 py-2.5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-xl py-2.5 px-4 flex-1 transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                ) : (
                  "Yes, Delete Admin"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

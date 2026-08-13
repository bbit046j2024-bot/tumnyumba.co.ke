"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Mail, Phone, Bookmark, Loader2, RefreshCw, User, Trash2, AlertTriangle } from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  _count: { savedProperties: number };
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Deletion modal state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/students?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setStudents(data);
      else setError("Failed to load students.");
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchStudents, 300);
    return () => clearTimeout(t);
  }, [fetchStudents]);

  const handleDelete = async () => {
    if (!studentToDelete) return;
    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/students/${studentToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to delete student account.");
      } else {
        setSuccess(`Student "${studentToDelete.name}" deleted successfully.`);
        setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
        setStudentToDelete(null);
        setTimeout(() => setSuccess(""), 4000);
      }
    } catch {
      setError("Network error deleting student account.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Student Management</h1>
          <p className="page-subtitle">View and manage registered students on CampusKey Mombasa.</p>
        </div>
        <button onClick={fetchStudents} className="btn-secondary flex items-center gap-2 text-sm self-start">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="card p-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 text-sm"
          />
        </div>
        <span className="text-sm text-gray-500 font-medium">{students.length} student{students.length !== 1 ? "s" : ""}</span>
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
                  <th className="p-4">Student</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Saved</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary-700" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 font-poppins">{s.name}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {s.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {s.phone ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> {s.phone}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs italic">No phone</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-primary-700 font-semibold">
                        <Bookmark className="w-3.5 h-3.5" /> {s._count.savedProperties}
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(s.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setStudentToDelete(s)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Student Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400 text-sm">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-poppins font-bold text-lg text-gray-900">Delete Student Account</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-gray-800">{studentToDelete.name}</span> ({studentToDelete.email})? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
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
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

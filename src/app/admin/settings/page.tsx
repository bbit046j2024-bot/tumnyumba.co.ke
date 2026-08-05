"use client";

import { useState } from "react";
import { Settings, Save, Shield, CreditCard, Bell, Key } from "lucide-react";

export default function AdminSettingsPage() {
  const [leadFee, setLeadFee] = useState("50");
  const [supportEmail, setSupportEmail] = useState("support@campuskey.co.ke");
  const [mpesaPaybill, setMpesaPaybill] = useState("400200");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h1 className="page-title">Platform Settings</h1>
        <p className="page-subtitle">Configure system options, lead generation fees, and integration parameters.</p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl p-4 font-medium flex items-center justify-between">
          <span>✅ System settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Billing & Fees */}
        <div className="card p-6 space-y-4">
          <h3 className="font-poppins font-bold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <CreditCard className="w-5 h-5 text-primary-700" /> Lead Fee & Payment Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Standard Lead Fee (KSh)</label>
              <input
                type="number"
                value={leadFee}
                onChange={(e) => setLeadFee(e.target.value)}
                className="input"
              />
              <span className="text-xs text-gray-400 mt-1 block">Billed to partners per student contact unlock.</span>
            </div>
            <div>
              <label className="input-label">M-Pesa Business Paybill No.</label>
              <input
                type="text"
                value={mpesaPaybill}
                onChange={(e) => setMpesaPaybill(e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Support & System Email */}
        <div className="card p-6 space-y-4">
          <h3 className="font-poppins font-bold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Bell className="w-5 h-5 text-primary-700" /> Platform System Email
          </h3>
          <div>
            <label className="input-label">Official Support Email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary py-3 px-6 flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </form>
    </div>
  );
}

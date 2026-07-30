"use client";

import { useState } from "react";
import { Settings, Save, Bell, Shield, Lock } from "lucide-react";

export default function PartnerSettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h1 className="page-title">Account Settings</h1>
        <p className="page-subtitle">Manage notification preferences and security settings for UrbanPoint Properties.</p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl p-4 font-medium">
          ✅ Account settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h3 className="font-poppins font-bold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Bell className="w-5 h-5 text-primary-700" /> Student Lead Notifications
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-gray-800">Email alerts for new viewing requests</span>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-gray-800">SMS notifications for direct student calls</span>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
            </label>
          </div>
        </div>

        <button type="submit" className="btn-primary py-3 px-6 flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Preferences
        </button>
      </form>
    </div>
  );
}

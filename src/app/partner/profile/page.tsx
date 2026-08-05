"use client";

import { useState } from "react";
import { Building2, Mail, Phone, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

export default function PartnerProfilePage() {
  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h1 className="page-title">Company Profile</h1>
        <p className="page-subtitle">Your verified business details and housing agency identity on CampusKey Mombasa.</p>
      </div>

      <div className="card p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center font-bold text-2xl text-primary-800 font-poppins">
            UP
          </div>
          <div>
            <h2 className="font-poppins font-bold text-xl text-gray-900 flex items-center gap-2">
              UrbanPoint Properties <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </h2>
            <span className="badge-success mt-1">VERIFIED PARTNER</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase">Contact Person</label>
            <div className="font-semibold text-gray-900 mt-1">Kelly Victor</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase">License Number</label>
            <div className="font-mono text-gray-900 mt-1">UPP-2026-889</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase">Email Address</label>
            <div className="text-gray-900 mt-1">partner@urbanpoint.co.ke</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase">Phone Number</label>
            <div className="text-gray-900 mt-1">0722987654</div>
          </div>
        </div>
      </div>
    </div>
  );
}

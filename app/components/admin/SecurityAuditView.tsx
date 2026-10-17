"use client";

import React from "react";
import {
  ShieldCheck,
  Lock,
  Database,
  Cpu,
  Key,
  Flame,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Server,
} from "lucide-react";

export const SecurityAuditView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-gray-200 p-5 rounded">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-green-50 border border-green-200 flex items-center justify-center text-green-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Laporan Kepatuhan & Audit Keamanan Siber (Cybersecurity Audit)
              </h2>
              <p className="text-xs text-gray-500 font-mono">
                SIKARYA Enterprise Architecture &bull; ISO/IEC 27001 & OWASP Top 10 Aligned
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold font-mono bg-emerald-700 text-white rounded">
            AUDIT: PASSED (100%)
          </span>
        </div>
      </div>

      {/* 6 Core Security Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Pillar 1: Zero Raw SQL */}
        <div className="bg-white border border-gray-200 p-4 rounded space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-600" />
              <span>Zero Raw SQL (SQLi Immunity)</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              VERIFIED
            </span>
          </div>
          <p className="text-xs text-gray-600">
            100% interaksi basis data menggunakan SQLAlchemy 2.0 Async ORM dengan parameterized binding. Tidak ada satupun string concatenation SQL dalam sistem.
          </p>
          <div className="pt-2 border-t border-gray-100 font-mono text-[11px] text-gray-500">
            Target: Neon Postgres Serverless
          </div>
        </div>

        {/* Pillar 2: Strict XSS Sanitization */}
        <div className="bg-white border border-gray-200 p-4 rounded space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Strict Pydantic Sanitizer (XSS)</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              ACTIVE
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Setiap payload mutasi dibersihkan otomatis via custom validator: penghilangan script tag berbahaya, HTML entity escaping, serta penolakan karakter kontrol.
          </p>
          <div className="pt-2 border-t border-gray-100 font-mono text-[11px] text-gray-500">
            Validator: html.escape + Regex Stripper
          </div>
        </div>

        {/* Pillar 3: Passwords & JWT HttpOnly */}
        <div className="bg-white border border-gray-200 p-4 rounded space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-600" />
              <span>Bcrypt / Argon2 & HttpOnly Cookies</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              ENFORCED
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Password di-hash dengan Bcrypt 12 rounds. Token JWT disimpan dalam cookie bertanda <code>HttpOnly</code>, <code>Secure</code>, dan <code>SameSite=Lax</code> (kebal XSS token theft).
          </p>
          <div className="pt-2 border-t border-gray-100 font-mono text-[11px] text-gray-500">
            Short-lived Token: 60 Menit Expire
          </div>
        </div>

        {/* Pillar 4: Rate Limiting & Anti Brute-Force */}
        <div className="bg-white border border-gray-200 p-4 rounded space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-600" />
              <span>Sliding-Window Rate Limiter</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              ARMED
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Endpoint login dibatasi maksimal 10 request/menit per IP. Endpoint mutasi dibatasi 60 request/menit untuk mencegah spamming transaksi dan DoS.
          </p>
          <div className="pt-2 border-t border-gray-100 font-mono text-[11px] text-gray-500">
            Status: HTTP 429 Too Many Requests
          </div>
        </div>

        {/* Pillar 5: Clean Architecture Separation */}
        <div className="bg-white border border-gray-200 p-4 rounded space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>Strict Clean Architecture</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              ISOLATED
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Pemisahan ketat layer: <code>/api</code> (routers), <code>/services</code> (atomic business logic), <code>/models</code> (SQLAlchemy ORM), dan <code>/schemas</code> (Pydantic validation).
          </p>
          <div className="pt-2 border-t border-gray-100 font-mono text-[11px] text-gray-500">
            No Logic Bleed across boundaries
          </div>
        </div>

        {/* Pillar 6: File Upload Sandbox & Path Traversal */}
        <div className="bg-white border border-gray-200 p-4 rounded space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-gray-800" />
              <span>Path Traversal & Extension Whitelist</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              PROTECTED
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Berkas bukti otomatis dinamai ulang (Auto-Receipt Naming Standard). Verifikasi ekstensi ketat (.png, .jpg, .jpeg, .pdf) dan pemeriksaan sanitasi path direktori.
          </p>
          <div className="pt-2 border-t border-gray-100 font-mono text-[11px] text-gray-500">
            Sandbox: uploads/receipts/
          </div>
        </div>
      </div>

      {/* Role-Based Access Control Matrix (RBAC) */}
      <div className="bg-white border border-gray-200 rounded p-4 space-y-3">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Matriks Otorisasi Berbasis Peran (RBAC Matrix)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold text-[11px]">
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Akses Kas Umum</th>
                <th className="py-2 px-3">Akses Seksi Sendiri</th>
                <th className="py-2 px-3">Auto-Ledger Sync</th>
                <th className="py-2 px-3">Pencatatan Punia</th>
                <th className="py-2 px-3">Audit Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-mono text-[11px]">
              <tr>
                <td className="py-2 px-3 font-bold text-gray-900">super_admin</td>
                <td className="py-2 px-3 text-emerald-700">Full Access</td>
                <td className="py-2 px-3 text-emerald-700">Full Access</td>
                <td className="py-2 px-3 text-emerald-700">Ya</td>
                <td className="py-2 px-3 text-emerald-700">Ya</td>
                <td className="py-2 px-3 text-emerald-700">Ya</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-blue-900">bendahara_umum</td>
                <td className="py-2 px-3 text-emerald-700">Full Access</td>
                <td className="py-2 px-3 text-gray-500">Read Only</td>
                <td className="py-2 px-3 text-emerald-700">Ya (Otomatis)</td>
                <td className="py-2 px-3 text-gray-500">Read Only</td>
                <td className="py-2 px-3 text-emerald-700">Ya</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-amber-900">bendahara_seksi</td>
                <td className="py-2 px-3 text-red-600">Dilarang</td>
                <td className="py-2 px-3 text-emerald-700">Seksi Terdaftar</td>
                <td className="py-2 px-3 text-red-600">Tidak Berhak</td>
                <td className="py-2 px-3 text-gray-500">Read Only</td>
                <td className="py-2 px-3 text-gray-500">Read Only</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-emerald-900">panitia_punia</td>
                <td className="py-2 px-3 text-gray-500">Read Only</td>
                <td className="py-2 px-3 text-gray-500">Read Only</td>
                <td className="py-2 px-3 text-red-600">Tidak Berhak</td>
                <td className="py-2 px-3 text-emerald-700">Full Access</td>
                <td className="py-2 px-3 text-gray-500">Read Only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  HeartHandshake,
  Users,
  UserPlus,
  Coins,
  PackageCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Printer,
  Download,
} from "lucide-react";
import { PuniaDonation, User } from "@/app/types";
import { ApiClient } from "@/app/lib/api";
import { initialPuniaDonations, initialUsers } from "@/app/lib/mock-data";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { PuniaTable } from "@/app/components/admin/PuniaTable";
import { PuniaModal } from "@/app/components/admin/PuniaModal";
import { PuniaReportModal } from "@/app/components/admin/PuniaReportModal";

export default function DashboardPanitiaPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"monitoring" | "users">("monitoring");

  // Punia state
  const [puniaList, setPuniaList] = useState<PuniaDonation[]>(initialPuniaDonations);
  const [isPuniaModalOpen, setIsPuniaModalOpen] = useState(false);
  const [isPuniaReportModalOpen, setIsPuniaReportModalOpen] = useState(false);

  // User management state
  const [petugasUsers, setPetugasUsers] = useState<User[]>(
    initialUsers.filter((u) => u.role === "petugas_punia" || u.role === "panitia_punia")
  );
  const [newUsername, setNewUsername] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [userMsg, setUserMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const user = ApiClient.getCurrentUser();
    if (!user || (user.role !== "panitia_punia" && user.role !== "super_admin")) {
      router.replace("/login");
      return;
    }
    setCurrentUser(user);
    refreshData();
  }, [router]);

  const refreshData = async () => {
    const [punias, users] = await Promise.all([
      ApiClient.getPuniaDonations(),
      ApiClient.getUsers("petugas_punia"),
    ]);
    if (punias) setPuniaList(punias);
    if (users && users.length > 0) {
      setPetugasUsers(users);
    } else {
      setPetugasUsers(initialUsers.filter((u) => u.role === "petugas_punia"));
    }
  };

  const handleCreatePetugas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword) {
      setUserMsg({ type: "error", text: "Username dan password wajib diisi." });
      return;
    }
    setIsSubmitting(true);
    setUserMsg(null);

    try {
      const created = await ApiClient.createUser({
        username: newUsername.trim().toLowerCase(),
        password: newPassword,
        role: "petugas_punia",
        full_name: newFullName.trim() || newUsername.trim(),
      });
      setUserMsg({
        type: "success",
        text: `Akun Petugas '${created.username}' (${created.full_name}) berhasil disimpan ke database dan langsung aktif! Petugas dapat login di halaman login.`,
      });
      setNewUsername("");
      setNewFullName("");
      setNewPassword("");
      await refreshData();
    } catch (err: any) {
      setUserMsg({ type: "error", text: err.message || "Gagal membuat akun petugas." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId: number) => {
    await ApiClient.toggleUserStatus(userId);
    await refreshData();
  };

  const handleSavePunia = async (data: any) => {
    const saved = await ApiClient.createPunia(data);
    if (saved) {
      setPuniaList((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
    }
    await refreshData();
  };

  // Calculations for KPI
  let totalMoney = 0;
  let totalGoods = 0;
  puniaList.forEach((p) => {
    if (p.donation_type === "money" && p.amount_money) {
      totalMoney += Number(p.amount_money) || 0;
    } else if (p.donation_type === "goods") {
      totalGoods += 1;
    }
  });

  if (!currentUser) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-gray-500 font-medium">Memverifikasi otentikasi...</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      pageTitle="Monitoring Dana Punia & Manajemen Petugas"
      pageSubtitle="Panitia Utama Dana Punia Karya Pura Dalem Metra"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("monitoring")}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "monitoring"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Monitoring Dana Punia</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
              {puniaList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "users"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manajemen Akun Petugas Loket</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
              {petugasUsers.length}
            </span>
          </button>
        </div>

        {/* TAB 1: MONITORING DANA PUNIA */}
        {activeTab === "monitoring" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded border border-gray-200 bg-white">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Total Dana Punia Uang</span>
                </div>
                <div className="text-xl font-bold font-mono text-emerald-700">
                  Rp {totalMoney.toLocaleString("id-ID")}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Punia tunai & transfer umat krama
                </p>
              </div>

              <div className="p-4 rounded border border-gray-200 bg-white">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <PackageCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Total Donasi Barang Upakara</span>
                </div>
                <div className="text-xl font-bold font-mono text-blue-700">
                  {totalGoods} Entri Logistik
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Beras suci, minyak, dupa, tikar, dll.
                </p>
              </div>

              <div className="p-4 rounded border border-gray-200 bg-white">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Status Transparansi Publik
                </div>
                <div className="text-xl font-bold font-mono text-gray-900">
                  Live Sync
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Tersinkronisasi ke Layar TV & Portal Mobile
                </p>
              </div>
            </div>

            {/* Punia Table View */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Daftar Rekapitulasi Seluruh Dana Punia (Uang & Barang)
                </h3>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setIsPuniaReportModalOpen(true)}
                    className="w-full sm:w-auto px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-none"
                    title="Unduh Laporan Dana Punia Harian, Mingguan, Bulanan & Rekap Akhir (PDF)"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Unduh Laporan Punia</span>
                  </button>
                </div>
              </div>
              <PuniaTable
                puniaList={puniaList}
                onOpenNewPunia={() => setIsPuniaModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* TAB 2: MANAJEMEN AKUN PETUGAS PUNIA (USERS CRUD) */}
        {activeTab === "users" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Form: Create Petugas Account */}
            <div className="md:col-span-5 bg-white border border-gray-200 p-5 rounded space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-mono font-medium mb-2 border border-blue-200">
                  <UserPlus className="w-3 h-3" />
                  <span>Buat Akun Petugas Loket</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  Registrasi Petugas Punia Baru
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Akun ini akan memiliki akses khusus ke <code>/dashboard/petugas</code> untuk entri donasi di posko.
                </p>
              </div>

              {userMsg && (
                <div
                  className={`p-3 rounded border text-xs flex items-start gap-2 ${
                    userMsg.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {userMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  )}
                  <div>{userMsg.text}</div>
                </div>
              )}

              <form onSubmit={handleCreatePetugas} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Username Petugas
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Contoh: petugas_kasir2"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-600 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Lengkap Petugas
                  </label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Contoh: Ni Ketut Ratih (Petugas Shift Pagi)"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Password Awal Petugas
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewPassword("dalemmetra2026")}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-mono hover:underline cursor-pointer"
                    >
                      + Pasang dalemmetra2026
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Contoh: dalemmetra2026 atau lainnya"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-600 font-mono"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Kata sandi disimpan terenkripsi Bcrypt di database Neon PostgreSQL.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-none"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Menyimpan..." : "Buat Akun Petugas"}</span>
                </button>
              </form>
            </div>

            {/* Right Table: Petugas List (CRUD Read & Toggle) */}
            <div className="md:col-span-7 bg-white border border-gray-200 p-5 rounded space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Daftar Petugas Punia Terdaftar
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Kelola status keaktifan petugas yang bertugas di posko dana punia.
                </p>
              </div>

              <div className="border border-gray-200 rounded overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold font-mono uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Username</th>
                      <th className="py-2.5 px-3">Nama Petugas</th>
                      <th className="py-2.5 px-3">Peran</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {petugasUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-gray-900">
                          {u.username}
                        </td>
                        <td className="py-2.5 px-3 text-gray-800">
                          {u.full_name || "-"}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {u.is_active ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Aktif</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                              <XCircle className="w-3 h-3 text-gray-400" />
                              <span>Nonaktif</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u.id)}
                            className={`px-2 py-1 text-[10px] font-semibold rounded border transition-colors cursor-pointer ${
                              u.is_active
                                ? "border-gray-200 text-gray-600 hover:bg-gray-100"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {u.is_active ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Punia Modal */}
      <PuniaModal
        isOpen={isPuniaModalOpen}
        onClose={() => setIsPuniaModalOpen(false)}
        onSave={handleSavePunia}
      />

      {/* Official Multi-Period Punia Report Modal */}
      {isPuniaReportModalOpen && (
        <PuniaReportModal
          isOpen={isPuniaReportModalOpen}
          onClose={() => setIsPuniaReportModalOpen(false)}
          puniaList={puniaList}
          currentUser={currentUser || ApiClient.getCurrentUser()}
        />
      )}
    </DashboardLayout>
  );
}

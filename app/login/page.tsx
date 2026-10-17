"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Tv,
  Smartphone,
} from "lucide-react";
import { ApiClient } from "@/app/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleRedirect = (role: string) => {
    switch (role) {
      case "bendahara_umum":
      case "super_admin":
        router.push("/dashboard/umum");
        break;
      case "bendahara_seksi":
        router.push("/dashboard/seksi");
        break;
      case "panitia_punia":
        router.push("/dashboard/panitia");
        break;
      case "petugas_punia":
        router.push("/dashboard/petugas");
        break;
      default:
        router.push("/dashboard/umum");
    }
  };

  const validate = () => {
    const errors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      errors.username = "Username wajib diisi.";
    }
    if (!password) {
      errors.password = "Password wajib diisi.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    const res = await ApiClient.login(username.trim(), password);
    setIsLoading(false);

    if (res.success && res.user) {
      handleRoleRedirect(res.user.role);
    } else {
      setErrorMsg(res.error || "Username atau password salah.");
    }
  };

  return (
    <div className="relative h-[100dvh] lg:min-h-screen w-full flex flex-col lg:flex-row items-stretch justify-end overflow-hidden lg:overflow-x-hidden bg-white">
      {/* DESKTOP BACKGROUND: loginpict2.png */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none hidden lg:block">
        <Image
          src="/loginpict2.png"
          alt="Latar Belakang Karya Pura Dalem Desa Adat Metra"
          fill
          priority
          quality={100}
          className="object-cover object-left"
        />
      </div>

      {/* MOBILE BACKGROUND: Background terkunci (fixed) agar tidak bisa terscroll, opasitas diperhalus agar tidak terlalu nampak */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none lg:hidden bg-white overflow-hidden">
        <div className="absolute -bottom-2 -left-4 w-[88vw] max-w-[360px] h-[48vh] max-h-[420px] opacity-25">
          <Image
            src="/pict11.png"
            alt="Ilustrasi Karya Pura Dalem Desa Adat Metra"
            fill
            priority
            quality={100}
            className="object-contain object-left-bottom"
          />
        </div>
      </div>

      {/* TOP HEADER: Logo SiKarya dinaikkan ke paling atas sebagai header */}
      <header className="lg:hidden w-full px-5 pt-4 pb-2 sm:pt-6 bg-transparent flex items-center justify-center gap-2.5 z-20 shrink-0">
        <Image
          src="/logo_hitam.png"
          alt="Logo SIKARYA"
          width={40}
          height={34}
          className="h-8 w-auto object-contain shrink-0"
          priority
        />
        <div className="text-left">
          <h2 className="text-sm font-extrabold text-gray-900 tracking-tight leading-none">
            SIKARYA METRA
          </h2>
          <span className="text-[10px] text-gray-500 font-medium">
            Pura Dalem Desa Adat Metra
          </span>
        </div>
      </header>

      {/* FULL-HEIGHT LOGIN FORM CONTAINER (TERKUNCI SATU LAYAR DI MOBILE, PERSIS ASLINYA DI DESKTOP) */}
      <div className="relative z-10 flex-1 lg:flex-none w-full lg:w-[480px] xl:w-[540px] 2xl:w-[580px] lg:min-h-screen lg:mr-[4vw] xl:mr-[6vw] 2xl:mr-[8vw] flex flex-col justify-center px-6 py-2 sm:p-10 lg:p-12 xl:p-16 overflow-hidden">
        <div className="w-full max-w-sm sm:max-w-md mx-auto lg:max-w-none my-auto py-0 lg:py-0">
          {/* Header / Brand - Tampil rapi di desktop seperti semula */}
          <div className="hidden lg:flex items-center justify-center gap-2.5 pt-2 sm:pt-0 mb-3 sm:mb-4">
            <Image
              src="/logo_hitam.png"
              alt="Logo SIKARYA"
              width={44}
              height={38}
              className="h-8 sm:h-9 w-auto object-contain shrink-0"
              priority
            />
            <div className="text-left">
              <h2 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight leading-none">
                SIKARYA METRA
              </h2>
              <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium">
                Pura Dalem Desa Adat Metra
              </span>
            </div>
          </div>

          {/* Asset Gambar tes12 - Proporsional dan rapi di bawah header tanpa saling bertabrakan */}
          <div className="flex justify-center items-center my-2 sm:my-3 lg:my-5">
            <Image
              src="/tes12.png"
              alt="Ilustrasi Upacara Adat Bali"
              width={400}
              height={340}
              className="h-32 sm:h-40 md:h-48 w-auto object-contain"
              priority
            />
          </div>

          {/* Form Title & Subtitle - Rapi di tengah di bawah asset seperti pada gambar */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Masuk ke Sistem
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xs sm:max-w-sm mx-auto leading-relaxed">
              Silakan masukkan kredensial akun kepanitiaan Anda untuk mengakses dashboard pengelolaan.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="mb-5 p-3.5 sm:p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-red-600 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5" noValidate>
            {/* Username Input */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                Username Kepanitiaan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (fieldErrors.username) {
                      setFieldErrors((prev) => ({ ...prev, username: undefined }));
                    }
                  }}
                  placeholder="Contoh: bendahara_umum"
                  className={`w-full pl-10 sm:pl-11 pr-4 py-3 sm:py-3.5 text-sm bg-white/95 border rounded-2xl text-gray-900 placeholder:text-gray-400 transition-all shadow-sm focus:outline-none focus:bg-white focus:ring-2 ${
                    fieldErrors.username
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-200 focus:border-blue-600 focus:ring-blue-100"
                  }`}
                />
              </div>
              {fieldErrors.username && (
                <p className="text-xs text-red-600 font-medium mt-1.5">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* Password Input with Show/Hide Toggle */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  placeholder="Masukkan password Anda..."
                  className={`w-full pl-10 sm:pl-11 pr-11 py-3 sm:py-3.5 text-sm bg-white/95 border rounded-2xl text-gray-900 placeholder:text-gray-400 transition-all shadow-sm focus:outline-none focus:bg-white focus:ring-2 ${
                    fieldErrors.password
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-200 focus:border-blue-600 focus:ring-blue-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 sm:top-3 text-gray-400 hover:text-gray-700 transition-colors p-1 rounded cursor-pointer"
                  title={showPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-600 font-medium mt-1.5">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 sm:py-4 px-5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm sm:text-base font-bold rounded-2xl transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-md hover:shadow-lg shadow-blue-500/20 disabled:opacity-60"
            >
              {isLoading ? (
                <span>Memverifikasi Kredensial...</span>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </>
              )}
            </button>
          </form>

          {/* Akses Cepat Publik: Portal Krama & TV Kiosk */}
          <div className="mt-6 sm:mt-7">
            <p className="text-center text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
              Layanan Publik
            </p>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              <Link
                href="/"
                className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 rounded-2xl border border-gray-200 hover:border-blue-400 bg-gray-50/70 hover:bg-blue-50/60 text-gray-700 hover:text-blue-700 font-bold text-xs sm:text-sm transition-all shadow-2xs group cursor-pointer"
                title="Buka Portal Transparansi Krama"
              >
                <Smartphone className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform shrink-0" />
                <span>Portal Krama</span>
              </Link>
              <Link
                href="/kiosk"
                className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 rounded-2xl border border-gray-200 hover:border-amber-400 bg-gray-50/70 hover:bg-amber-50/60 text-gray-700 hover:text-amber-700 font-bold text-xs sm:text-sm transition-all shadow-2xs group cursor-pointer"
                title="Buka Layar TV Kiosk"
              >
                <Tv className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform shrink-0" />
                <span>Layar Kiosk</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

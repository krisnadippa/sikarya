"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Landmark,
  Shield,
  Smartphone,
  Tv,
  ArrowRight,
  Sparkles,
  HeartHandshake,
  Receipt,
  CheckCircle2,
} from "lucide-react";
import { ApiClient } from "@/app/lib/api";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const user = ApiClient.getCurrentUser();
    if (user && user.role) {
      switch (user.role) {
        case "bendahara_umum":
        case "super_admin":
          router.replace("/dashboard/umum");
          break;
        case "bendahara_seksi":
          router.replace("/dashboard/seksi");
          break;
        case "panitia_punia":
          router.replace("/dashboard/panitia");
          break;
        case "petugas_punia":
          router.replace("/dashboard/petugas");
          break;
        default:
          router.replace("/login");
      }
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center p-6">
      <div className="text-center space-y-3">
        <Image
          src="/logo_hitam.png"
          alt="Logo SIKARYA"
          width={88}
          height={70}
          className="h-20 w-auto object-contain mx-auto"
          priority
        />
        <h1 className="text-base font-bold text-gray-900">
          SIKARYA PURA DALEM METRA
        </h1>
        <p className="text-xs text-gray-500 font-mono">
          Mengarahkan ke rute dashboard sesuai wewenang peran...
        </p>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  LogOut,
  Tv,
  Smartphone,
  User as UserIcon,
  Shield,
  Layers,
} from "lucide-react";
import { User } from "@/app/types";
import { ApiClient } from "@/app/lib/api";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  actions?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  pageTitle,
  pageSubtitle,
  actions,
}) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const user = ApiClient.getCurrentUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    setCurrentUser(user);
  }, [router]);

  const handleLogout = async () => {
    await ApiClient.logout();
    router.replace("/login");
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "bendahara_umum":
        return { label: "Bendahara Umum", bg: "bg-blue-50 text-blue-700 border-blue-200" };
      case "bendahara_seksi":
        return { label: "Bendahara Seksi", bg: "bg-gray-100 text-gray-800 border-gray-300" };
      case "panitia_punia":
        return { label: "Panitia Utama Punia", bg: "bg-purple-50 text-purple-700 border-purple-200" };
      case "petugas_punia":
        return { label: "Petugas Loket Punia", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "super_admin":
        return { label: "Super Admin", bg: "bg-gray-900 text-white border-gray-900" };
      default:
        return { label: "Pengguna", bg: "bg-gray-100 text-gray-700 border-gray-200" };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      {/* Sidebar Component */}
      <Sidebar
        currentUser={currentUser}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Column Wrapper */}
      <div
        className={`flex-1 flex flex-col min-w-0 overflow-x-hidden transition-all duration-200 ease-in-out ${
          isCollapsed ? "md:pl-16" : "md:pl-64"
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 md:px-8 py-3 flex items-center justify-between">
          {/* Left: Mobile Hamburger & Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-1.5 rounded border border-gray-200 hover:bg-gray-50 text-gray-700"
              aria-label="Buka menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-gray-900 tracking-tight">
                  {pageTitle || "SIKARYA METRA"}
                </h1>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${roleInfo.bg}`}
                >
                  {roleInfo.label}
                </span>
              </div>
              {pageSubtitle && (
                <p className="text-[11px] text-gray-500 font-mono hidden sm:block">
                  {pageSubtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Quick Links, User Info & Logout */}
          <div className="flex items-center gap-3 text-xs">
            {/* Quick Access to Public Views */}
            <div className="hidden lg:flex items-center gap-2 border-r border-gray-200 pr-3">
              <a
                href="/"
                target="_blank"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                title="Buka Portal Publik Krama"
              >
                <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                <span>Portal Krama</span>
              </a>
              <a
                href="/kiosk"
                target="_blank"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                title="Buka Tampilan TV Kiosk"
              >
                <Tv className="w-3.5 h-3.5 text-gray-400" />
                <span>TV Kiosk</span>
              </a>
            </div>

            {/* User display */}
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-gray-900 leading-tight">
                {currentUser?.full_name || currentUser?.username || "Panitia"}
              </div>
              <div className="text-[10px] text-gray-400 font-mono">
                @{currentUser?.username || "user"}
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* Page Action Bar (Optional, rendered below header if actions passed) */}
        {actions && (
          <div className="bg-gray-50 border-b border-gray-200 px-4 md:px-8 py-3 flex items-center justify-between">
            {actions}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6 min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Landmark,
  Sparkles,
  HeartHandshake,
  Receipt,
  Users,
  FileSpreadsheet,
  Tv,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  X,
} from "lucide-react";
import { User, UserRole } from "@/app/types";

interface SidebarProps {
  currentUser: User | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const role = currentUser?.role;

  // Navigation items based on role
  const getNavItems = (): NavItem[] => {
    switch (role) {
      case "bendahara_umum":
      case "super_admin":
        return [
          {
            label: "Kas Induk & Alokasi",
            href: "/dashboard/umum",
            icon: Landmark,
            badge: "KAS-01",
          },
          {
            label: "Buku Kas Seksi",
            href: "/dashboard/seksi",
            icon: Sparkles,
            badge: "Seksi",
          },
          {
            label: "Monitoring Punia",
            href: "/dashboard/panitia",
            icon: HeartHandshake,
            badge: "Punia",
          },
        ];
      case "bendahara_seksi":
        return [
          {
            label: "Buku Kas Seksi",
            href: "/dashboard/seksi",
            icon: Sparkles,
            badge: "Ledger",
          },
        ];
      case "panitia_punia":
        return [
          {
            label: "Monitoring & Petugas",
            href: "/dashboard/panitia",
            icon: HeartHandshake,
            badge: "Utama",
          },
        ];
      case "petugas_punia":
        return [
          {
            label: "Loket Entri Punia",
            href: "/dashboard/petugas",
            icon: Receipt,
            badge: "Kasir",
          },
        ];
      default:
        return [
          {
            label: "Dashboard Kas",
            href: "/dashboard/umum",
            icon: Landmark,
          },
        ];
    }
  };

  const navItems = getNavItems();

  const publicItems = [
    {
      label: "Portal Publik Krama",
      href: "/",
      icon: Smartphone,
      external: true,
    },
    {
      label: "Layar TV Kiosk",
      href: "/kiosk",
      icon: Tv,
      external: true,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Brand Header */}
      <div className={`p-4 border-b border-gray-200 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`} suppressHydrationWarning>
        <div className="flex items-center gap-3 overflow-hidden" suppressHydrationWarning>
          <Image
            src="/logo_hitam.png"
            alt="Logo SIKARYA"
            width={44}
            height={36}
            className="h-9 w-auto object-contain shrink-0"
            priority
          />
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-xs font-bold text-gray-900 tracking-tight leading-none truncate">
                SIKARYA METRA
              </h1>
              <p className="text-[10px] text-gray-500 font-mono mt-1 truncate">
                Pura Dalem Desa Adat Metra
              </p>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1 text-gray-500 hover:text-gray-900"
          aria-label="Tutup menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Nav Section */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        <div>
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Menu Wewenang
            </div>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? "justify-center px-2" : "justify-between px-3"
                  } py-2 text-xs font-medium rounded transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Public & Display Views */}
        <div>
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Tampilan Publik
            </div>
          )}
          <nav className="space-y-1">
            {publicItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? "justify-center px-2" : "gap-2.5 px-3"
                  } py-2 text-xs font-medium rounded text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-gray-400" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer System Status & Collapse Toggle */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        {!isCollapsed && (
          <div className="mb-2 text-[11px] text-gray-600">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="font-semibold text-gray-700">Neon Postgres</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-600"></span>
            </div>
            <p className="text-[9px] text-gray-500 font-mono mt-0.5">
              SSL Enforced • Fast-Pool Active
            </p>
          </div>
        )}

        {/* Desktop Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex w-full items-center justify-center p-1.5 rounded border border-gray-200 hover:bg-white text-gray-500 hover:text-gray-900 transition-colors text-xs font-medium"
          title={isCollapsed ? "Perluas Sidebar" : "Lipat Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-1.5 text-[11px]">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Lipat Menu</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden md:block fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-200 transition-all duration-200 ease-in-out ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Slide-out Panel */}
          <div className="relative w-64 max-w-xs bg-white h-full border-r border-gray-200 shadow-none z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

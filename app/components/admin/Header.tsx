"use client";

import React from "react";
import { Plus, UserCheck, Shield, ChevronDown } from "lucide-react";
import { User } from "@/app/types";
import { initialUsers } from "@/app/lib/mock-data";

interface HeaderProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  onOpenNewTransaction: () => void;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchUser,
  onOpenNewTransaction,
  title,
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return { label: "Super Admin", color: "bg-gray-900 text-white" };
      case "bendahara_umum":
        return { label: "Bendahara Umum", color: "bg-blue-700 text-white" };
      case "bendahara_seksi":
        return { label: "Bendahara Seksi", color: "bg-amber-700 text-white" };
      case "panitia_punia":
        return { label: "Panitia Punia", color: "bg-emerald-700 text-white" };
      default:
        return { label: role, color: "bg-gray-600 text-white" };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 select-none">
      <div>
        <h2 className="text-base font-bold text-gray-900 tracking-tight">{title}</h2>
        <p className="text-xs text-gray-500">
          Sistem Informasi Pembukuan & Dana Punia Terintegrasi
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Switcher for Interactive RBAC Testing */}
        <div className="flex items-center gap-2 border border-gray-200 rounded px-2.5 py-1 bg-gray-50 text-xs">
          <Shield className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <span className="text-gray-500 text-[11px]">Simulasi Akun:</span>
          <select
            value={currentUser.id}
            onChange={(e) => {
              const u = initialUsers.find((user) => user.id === Number(e.target.value));
              if (u) onSwitchUser(u);
            }}
            className="bg-transparent font-medium text-gray-900 text-xs focus:outline-none cursor-pointer"
          >
            {initialUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name} ({u.username})
              </option>
            ))}
          </select>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="text-right">
            <div className="text-xs font-semibold text-gray-900">{currentUser.username}</div>
            <span
              className={`inline-block px-1.5 py-0.5 text-[9px] font-mono uppercase font-bold rounded ${badge.color}`}
            >
              {badge.label}
            </span>
          </div>
          <div className="w-8 h-8 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-xs">
            {currentUser.username.substring(0, 2).toUpperCase()}
          </div>
        </div>

        {/* Action Button: Input Transaksi (Solid flat blue) */}
        <button
          onClick={onOpenNewTransaction}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Input Transaksi</span>
        </button>
      </div>
    </header>
  );
};

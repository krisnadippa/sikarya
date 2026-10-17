import {
  DashboardKPISummary,
  ExpenseDistributionItem,
  PuniaDonation,
  Section,
  Transaction,
  User,
} from "@/app/types";
import {
  initialExpenseDistribution,
  initialKPISummary,
  initialPuniaDonations,
  initialSections,
  initialTransactions,
  initialUsers,
} from "./mock-data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export interface TransactionInput {
  section_id: number;
  date: string;
  description: string;
  type: "income" | "expense";
  amount: number;
  target_section_id?: number | null;
  receipt_file_url?: string | null;
}

export class ApiClient {
  private static transactions: Transaction[] = [...initialTransactions];
  private static puniaList: PuniaDonation[] = [...initialPuniaDonations];
  private static usersList: User[] = [...initialUsers];
  private static currentUser: User | null = null;
  private static cache: Map<string, { data: any; expiry: number }> = new Map();

  private static getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && entry.expiry > Date.now()) {
      return entry.data as T;
    }
    return null;
  }

  private static setCached<T>(key: string, data: T, ttlMs: number = 5000) {
    this.cache.set(key, { data, expiry: Date.now() + ttlMs });
  }

  static invalidateCache() {
    this.cache.clear();
  }

  static getToken(): string | null {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("sikarya_token");
      } catch {}
    }
    return null;
  }

  static setToken(token: string | null) {
    if (typeof window !== "undefined") {
      try {
        if (token) localStorage.setItem("sikarya_token", token);
        else localStorage.removeItem("sikarya_token");
      } catch {}
    }
  }

  static getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = { ...extraHeaders };
    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  static async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();

    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    if (res.status === 401) {
      this.setToken(null);
      this.setCurrentUser(null);
    }

    return res;
  }

  static setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (typeof window !== "undefined") {
      try {
        if (user) {
          localStorage.setItem("sikarya_user", JSON.stringify(user));
        } else {
          localStorage.removeItem("sikarya_user");
        }
      } catch {}
    }
  }

  static getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("sikarya_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.username) {
            this.currentUser = parsed;
            return parsed;
          }
        } else {
          this.currentUser = null;
          return null;
        }
      } catch {
        this.currentUser = null;
        return null;
      }
    }
    return this.currentUser;
  }

  static async login(username: string, password?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!username || !username.trim()) {
      return { success: false, error: "Username wajib diisi." };
    }
    if (!password || !password.trim()) {
      return { success: false, error: "Password wajib diisi." };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        if (data.access_token) {
          this.setToken(data.access_token);
        }
        if (data.user) {
          this.setCurrentUser(data.user);
          return { success: true, user: data.user };
        }
      } else {
        // Return exact rejection message from backend (401, 403, 429)
        return { success: false, error: data.detail || "Username atau password salah." };
      }
    } catch {
      // Backend offline fallback - strictly check against dalemmetra2026
    }

    // STRICT Offline Validation: Password MUST match 'dalemmetra2026' or 'DalemMetra2026!'
    const isValidOffline = password === "dalemmetra2026" || password === "DalemMetra2026!";
    if (!isValidOffline) {
      return { success: false, error: "Username atau password salah." };
    }

    // Match in local users
    const found = this.usersList.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (found) {
      this.setCurrentUser(found);
      return { success: true, user: found };
    }

    return { success: false, error: "Pengguna tidak terdaftar." };
  }

  static async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: this.getHeaders(),
        credentials: "include",
      });
    } catch {}
    this.setToken(null);
    this.setCurrentUser(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("sikarya_user");
        localStorage.removeItem("sikarya_token");
      } catch {}
    }
    this.currentUser = null;
  }

  static async getSections(): Promise<Section[]> {
    const cached = this.getCached<Section[]>("sections");
    if (cached) return cached;

    try {
      const res = await this.fetchWithAuth(`${API_BASE_URL}/sections`);
      if (res.ok) {
        const data = await res.json();
        this.setCached("sections", data, 60000); // 60s cache for master sections
        return data;
      }
    } catch {
      // fallback
    }
    return initialSections;
  }

  static async getTransactions(params?: {
    section_id?: number;
    type?: string;
    search?: string;
  }): Promise<{ items: Transaction[]; total: number }> {
    try {
      const query = new URLSearchParams();
      if (params?.section_id) query.set("section_id", String(params.section_id));
      if (params?.type) query.set("type", params.type);
      if (params?.search) query.set("search", params.search);

      const res = await this.fetchWithAuth(`${API_BASE_URL}/transactions?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return { items: data.items, total: data.total };
      }
    } catch {
      // fallback
    }

    let filtered = [...this.transactions];
    if (params?.section_id) {
      filtered = filtered.filter((t) => t.section_id === params.section_id);
    }
    if (params?.type) {
      filtered = filtered.filter((t) => t.type === params.type);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (t) => t.description.toLowerCase().includes(q) || t.ref_no.toLowerCase().includes(q)
      );
    }

    return { items: filtered, total: filtered.length };
  }

  static async createTransaction(data: TransactionInput): Promise<Transaction> {
    this.invalidateCache();
    try {
      const res = await this.fetchWithAuth(`${API_BASE_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    // Client-side execution of Auto-Ledger Sync logic matching FastAPI backend
    const sec = initialSections.find((s) => s.id === data.section_id) || initialSections[0];
    const prevSectionTxs = this.transactions.filter((t) => t.section_id === data.section_id);
    const lastBal = prevSectionTxs.length > 0 ? prevSectionTxs[prevSectionTxs.length - 1].balance : 0;
    const newBal = data.type === "income" ? lastBal + data.amount : lastBal - data.amount;

    const countSec = prevSectionTxs.length + 1;
    const isKas = sec.section_code.includes("KAS");
    const ref_no = isKas
      ? `KW-${String(countSec).padStart(2, "0")}`
      : `${sec.section_code.replace("-", "")}-${data.type === "expense" ? "NT" : "TR"}${String(countSec).padStart(2, "0")}`;

    const maxId = this.transactions.reduce((max, t) => (t.id > max ? t.id : max), 0);
    const activeUser = this.getCurrentUser();
    const newId = maxId + 1;
    const newTx: Transaction = {
      id: newId,
      section_id: data.section_id,
      user_id: activeUser ? activeUser.id : 1,
      date: data.date,
      description: data.description,
      ref_no: ref_no,
      type: data.type,
      amount: data.amount,
      balance: newBal,
      receipt_file_url: data.receipt_file_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      section: sec,
      user: activeUser || undefined,
    };

    // Auto-Ledger Sync: If Kas Umum expense has target_section_id
    if (data.target_section_id && data.type === "expense") {
      const targetSec = initialSections.find((s) => s.id === data.target_section_id);
      if (targetSec) {
        const targetPrevTxs = this.transactions.filter((t) => t.section_id === targetSec.id);
        const targetLastBal = targetPrevTxs.length > 0 ? targetPrevTxs[targetPrevTxs.length - 1].balance : 0;
        const targetNewBal = targetLastBal + data.amount;
        const targetCount = targetPrevTxs.length + 1;
        const targetRefNo = `${targetSec.section_code.replace("-", "")}-TR${String(targetCount).padStart(2, "0")}`;

        const linkedTxId = newId + 1;
        const linkedTx: Transaction = {
          id: linkedTxId,
          section_id: targetSec.id,
          user_id: activeUser ? activeUser.id : 1,
          date: data.date,
          description: `[Alokasi dari Kas Umum - Ref: ${newTx.ref_no}] ${data.description}`,
          ref_no: targetRefNo,
          type: "income",
          amount: data.amount,
          balance: targetNewBal,
          linked_transaction_id: newId,
          receipt_file_url: data.receipt_file_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          section: targetSec,
          user: activeUser || undefined,
          linked_transaction: {
            id: newId,
            ref_no: newTx.ref_no,
            section_id: newTx.section_id,
            type: "expense",
            amount: newTx.amount,
          },
        };

        newTx.linked_transaction_id = linkedTxId;
        newTx.linked_transaction = {
          id: linkedTxId,
          ref_no: linkedTx.ref_no,
          section_id: linkedTx.section_id,
          type: "income",
          amount: linkedTx.amount,
        };

        this.transactions.unshift(linkedTx);
      }
    }

    this.transactions.unshift(newTx);
    return newTx;
  }

  static async updateTransaction(
    id: number,
    data: Partial<TransactionInput>
  ): Promise<Transaction | null> {
    this.invalidateCache();
    try {
      const res = await this.fetchWithAuth(`${API_BASE_URL}/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    const index = this.transactions.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.transactions[index] = {
        ...this.transactions[index],
        description: data.description ?? this.transactions[index].description,
        amount: data.amount ?? this.transactions[index].amount,
        date: data.date ?? this.transactions[index].date,
        type: data.type ?? this.transactions[index].type,
        updated_at: new Date().toISOString(),
      };
      return this.transactions[index];
    }
    return null;
  }

  static async deleteTransaction(id: number): Promise<boolean> {
    this.invalidateCache();
    try {
      const res = await this.fetchWithAuth(`${API_BASE_URL}/transactions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        return true;
      }
    } catch {}

    const index = this.transactions.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.transactions.splice(index, 1);
      return true;
    }
    return false;
  }

  static async getKPISummary(): Promise<DashboardKPISummary> {
    const cached = this.getCached<DashboardKPISummary>("kpi_summary");
    if (cached) return cached;

    try {
      const res = await fetch(`${API_BASE_URL}/public/kpi`);
      if (res.ok) {
        const data = await res.json();
        this.setCached("kpi_summary", data, 5000); // 5s cache
        return data;
      }
    } catch {
      // fallback
    }

    // Dynamic calculation from local transactions
    let generalBal = 0;
    let sectionsBal = 0;
    let totalInc = 0;
    let totalExp = 0;

    const summaries = initialSections.map((sec) => {
      const secTxs = this.transactions.filter((t) => t.section_id === sec.id);
      let inc = 0;
      let exp = 0;
      secTxs.forEach((t) => {
        if (t.type === "income") inc += t.amount;
        else exp += t.amount;
      });
      const bal = secTxs.length > 0 ? secTxs[0].balance : inc - exp;
      if (sec.section_code.includes("KAS")) {
        generalBal += bal;
      } else {
        sectionsBal += bal;
      }
      totalInc += inc;
      totalExp += exp;
      return {
        section_id: sec.id,
        section_code: sec.section_code,
        section_name: sec.section_name,
        current_balance: bal,
        total_income: inc,
        total_expense: exp,
        transaction_count: secTxs.length,
      };
    });

    let puniaMoneyTotal = 0;
    let puniaGoodsCount = 0;
    this.puniaList.forEach((p) => {
      if (p.donation_type === "money" && p.amount_money) {
        puniaMoneyTotal += Number(p.amount_money) || 0;
      } else if (p.donation_type === "goods") {
        puniaGoodsCount++;
      }
    });

    return {
      total_general_balance: generalBal,
      total_sections_balance: sectionsBal,
      grand_total_cash: generalBal + sectionsBal,
      total_income_all: totalInc,
      total_expense_all: totalExp,
      total_punia_money: puniaMoneyTotal,
      total_punia_goods_count: puniaGoodsCount,
      section_summaries: summaries,
    };
  }

  static async getExpenseDistribution(): Promise<ExpenseDistributionItem[]> {
    const cached = this.getCached<ExpenseDistributionItem[]>("expense_dist");
    if (cached) return cached;

    try {
      const res = await fetch(`${API_BASE_URL}/public/expense-distribution`);
      if (res.ok) {
        const data = await res.json();
        this.setCached("expense_dist", data, 10000); // 10s cache
        return data;
      }
    } catch {
      // fallback
    }
    return initialExpenseDistribution;
  }

  static async getPuniaDonations(search?: string): Promise<PuniaDonation[]> {
    try {
      const q = search ? `?nama=${encodeURIComponent(search)}&limit=100` : "?limit=100";
      const res = await fetch(`${API_BASE_URL}/punia/search${q}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.items) {
          if (!search) {
            this.puniaList = data.items;
          }
          return data.items;
        }
      }
    } catch {
      // fallback
    }

    if (!search) return this.puniaList;
    const term = search.toLowerCase();
    return this.puniaList.filter(
      (p) =>
        p.donor_name.toLowerCase().includes(term) ||
        (p.goods_name && p.goods_name.toLowerCase().includes(term))
    );
  }

  static async createPunia(data: {
    donor_name: string;
    donation_type: "money" | "goods";
    date: string;
    amount_money?: number;
    goods_name?: string;
    goods_quantity?: string;
    notes?: string;
  }): Promise<PuniaDonation> {
    this.invalidateCache();
    try {
      const res = await this.fetchWithAuth(`${API_BASE_URL}/punia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const saved = await res.json();
        this.puniaList = [saved, ...this.puniaList.filter((p) => p.id !== saved.id)];
        return saved;
      } else {
        const errJson = await res.json().catch(() => null);
        console.error("Gagal simpan punia ke backend:", res.status, errJson);
      }
    } catch (e) {
      console.warn("Backend offline atau fetch gagal:", e);
    }

    const maxId = this.puniaList.reduce((max, p) => (p.id > max ? p.id : max), 0);
    const activeUser = this.getCurrentUser();
    const newId = maxId + 1;
    const newEntry: PuniaDonation = {
      id: newId,
      user_id: activeUser ? activeUser.id : 1,
      date: data.date,
      donor_name: data.donor_name,
      donation_type: data.donation_type,
      amount_money: data.amount_money || null,
      goods_name: data.goods_name || null,
      goods_quantity: data.goods_quantity || null,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
      staff: activeUser
        ? {
            id: activeUser.id,
            username: activeUser.username,
            full_name: activeUser.full_name,
            role: activeUser.role,
          }
        : undefined,
    };
    this.puniaList.unshift(newEntry);
    return newEntry;
  }

  static async getUsers(role?: string): Promise<User[]> {
    try {
      const q = role ? `?role=${role}` : "";
      const res = await this.fetchWithAuth(`${API_BASE_URL}/users${q}`);
      if (res.ok) {
        const data: User[] = await res.json();
        if (Array.isArray(data)) {
          // Sync local usersList with DB data
          data.forEach((u) => {
            const idx = this.usersList.findIndex((x) => x.id === u.id);
            if (idx >= 0) this.usersList[idx] = u;
            else this.usersList.push(u);
          });
          return data;
        }
      }
    } catch {}

    if (role) {
      return this.usersList.filter((u) => u.role === role);
    }
    return this.usersList;
  }

  static async createUser(payload: {
    username: string;
    password: string;
    role: string;
    full_name?: string;
  }): Promise<User> {
    try {
      const res = await this.fetchWithAuth(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created: User = await res.json();
        this.usersList = [created, ...this.usersList.filter((u) => u.id !== created.id)];
        return created;
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || "Gagal membuat pengguna di database.");
      }
    } catch (err: any) {
      if (err.message && err.message !== "Failed to fetch") {
        throw err;
      }
    }

    // Check duplicate in local list if backend is completely offline
    const exists = this.usersList.some((u) => u.username.toLowerCase() === payload.username.trim().toLowerCase());
    if (exists) {
      throw new Error("Username sudah terdaftar.");
    }

    const newId = this.usersList.reduce((max, u) => Math.max(max, u.id), 0) + 1;
    const newUser: User = {
      id: newId,
      username: payload.username.trim().toLowerCase(),
      role: payload.role as any,
      full_name: payload.full_name || payload.username,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.usersList.push(newUser);
    return newUser;
  }

  static async toggleUserStatus(userId: number): Promise<boolean> {
    try {
      const res = await this.fetchWithAuth(`${API_BASE_URL}/users/${userId}/toggle-status`, {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const u = this.usersList.find((x) => x.id === userId);
        if (u) {
          u.is_active = typeof data.is_active === "boolean" ? data.is_active : !u.is_active;
        }
        return true;
      }
    } catch {}

    const u = this.usersList.find((x) => x.id === userId);
    if (u) {
      u.is_active = !u.is_active;
      return true;
    }
    return false;
  }
}


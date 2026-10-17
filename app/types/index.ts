export type UserRole = "super_admin" | "bendahara_umum" | "bendahara_seksi" | "panitia_punia" | "petugas_punia";

export interface User {
  id: number;
  username: string;
  role: UserRole;
  section_id?: number | null;
  full_name?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: number;
  section_code: string;
  section_name: string;
  description?: string | null;
  created_at: string;
}

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: number;
  section_id: number;
  user_id: number;
  date: string;
  description: string;
  ref_no: string;
  type: TransactionType;
  amount: number;
  balance: number;
  linked_transaction_id?: number | null;
  receipt_file_url?: string | null;
  created_at: string;
  updated_at: string;
  section?: Section;
  user?: {
    id: number;
    username: string;
    full_name?: string | null;
    role: string;
  };
  linked_transaction?: {
    id: number;
    ref_no: string;
    section_id: number;
    type: string;
    amount: number;
  } | null;
}

export type PuniaType = "money" | "goods";

export interface PuniaDonation {
  id: number;
  user_id: number;
  date: string;
  donor_name: string;
  donation_type: PuniaType;
  amount_money?: number | null;
  goods_name?: string | null;
  goods_quantity?: string | null;
  notes?: string | null;
  created_at: string;
  staff?: {
    id: number;
    username: string;
    full_name?: string | null;
    role: string;
  };
}

export interface SectionBalanceSummary {
  section_id: number;
  section_code: string;
  section_name: string;
  current_balance: number;
  total_income: number;
  total_expense: number;
  transaction_count: number;
}

export interface DashboardKPISummary {
  total_general_balance: number;
  total_sections_balance: number;
  grand_total_cash: number;
  total_income_all: number;
  total_expense_all: number;
  total_punia_money: number;
  total_punia_goods_count: number;
  section_summaries: SectionBalanceSummary[];
}

export interface ExpenseDistributionItem {
  section_name: string;
  section_code: string;
  amount: number;
}

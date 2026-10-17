import { NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';

export async function GET() {
  try {
    const sectionSummaries = await sql`
      SELECT 
        s.id as section_id,
        s.section_code,
        s.section_name,
        COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0)::numeric as total_income,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0)::numeric as total_expense,
        COUNT(t.id)::int as transaction_count,
        COALESCE((
          SELECT balance::numeric FROM transactions t2 
          WHERE t2.section_id = s.id 
          ORDER BY t2.id DESC LIMIT 1
        ), 0)::numeric as current_balance
      FROM sections s
      LEFT JOIN transactions t ON t.section_id = s.id
      GROUP BY s.id, s.section_code, s.section_name
      ORDER BY s.id ASC;
    `;

    const puniaSummary = await sql`
      SELECT
        COALESCE(SUM(CASE WHEN donation_type = 'money' THEN amount_money ELSE 0 END), 0)::numeric as total_punia_money,
        COUNT(CASE WHEN donation_type = 'goods' THEN 1 END)::int as total_punia_goods_count
      FROM punia_donations;
    `;

    let totalGeneralBalance = 0;
    let totalSectionsBalance = 0;
    let totalIncomeAll = 0;
    let totalExpenseAll = 0;

    const formattedSummaries = sectionSummaries.map((s: any) => {
      const currBal = Number(s.current_balance || 0);
      const inc = Number(s.total_income || 0);
      const exp = Number(s.total_expense || 0);
      const count = Number(s.transaction_count || 0);

      if (s.section_code.toUpperCase().includes('KAS')) {
        totalGeneralBalance += currBal;
      } else {
        totalSectionsBalance += currBal;
      }
      totalIncomeAll += inc;
      totalExpenseAll += exp;

      return {
        section_id: s.section_id,
        section_code: s.section_code,
        section_name: s.section_name,
        current_balance: currBal,
        total_income: inc,
        total_expense: exp,
        transaction_count: count,
      };
    });

    const totalPuniaMoney = Number(puniaSummary[0]?.total_punia_money || 0);
    const totalPuniaGoods = Number(puniaSummary[0]?.total_punia_goods_count || 0);
    const grandTotalCash = totalGeneralBalance + totalSectionsBalance;

    return NextResponse.json(
      {
        total_general_balance: totalGeneralBalance,
        total_sections_balance: totalSectionsBalance,
        grand_total_cash: grandTotalCash,
        total_income_all: totalIncomeAll,
        total_expense_all: totalExpenseAll,
        total_punia_money: totalPuniaMoney,
        total_punia_goods_count: totalPuniaGoods,
        section_summaries: formattedSummaries,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching KPI:', error);
    return NextResponse.json({ detail: 'Gagal memuat ringkasan KPI.' }, { status: 500 });
  }
}

import { useExpenses } from "@/hooks/use-expenses";
import { formatMMK } from "@/lib/utils";
import { openAddExpenseDrawer } from "@/lib/open-add-expense";
import { parseISO, isThisMonth, isToday } from "date-fns";
import { ArrowUpRight, TrendingUp, CalendarDays, Loader2, Plus } from "lucide-react";
import { Link } from "wouter";
import { ExpenseItem } from "@/components/expense-item";

export default function Dashboard() {
  const { data: expenses, isLoading } = useExpenses();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const expensesList = expenses || [];

  const thisMonthExpenses = expensesList.filter(e => isThisMonth(parseISO(e.date)));
  const todayExpenses = expensesList.filter(e => isToday(parseISO(e.date)));

  const totalThisMonth = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalToday = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const isEmpty = expensesList.length === 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Hero — Today's Spending */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-7 text-primary-foreground shadow-xl shadow-primary/20">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-black/10 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 opacity-80 text-sm font-medium">
            <TrendingUp size={15} />
            <span>Today's Spending</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-3">
            {formatMMK(totalToday)}
          </h1>
          <p className="text-sm opacity-70">
            {todayExpenses.length === 0
              ? isEmpty
                ? "Start by adding your first expense"
                : "No expenses recorded today"
              : `${todayExpenses.length} transaction${todayExpenses.length === 1 ? "" : "s"} today`}
          </p>
          {isEmpty && (
            <button
              type="button"
              onClick={() => openAddExpenseDrawer()}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary-foreground px-5 py-3 text-sm font-bold text-primary shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            >
              <Plus size={18} strokeWidth={2.5} />
              Add first expense
            </button>
          )}
        </div>
      </div>

      {/* This Month summary */}
      <div className="rounded-2xl bg-card p-5 shadow-sm border border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <CalendarDays size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">This Month</p>
            <p className="text-xl font-bold text-foreground">{formatMMK(totalThisMonth)}</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {thisMonthExpenses.length} transaction{thisMonthExpenses.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Recent Transactions — full width */}
      <div className="rounded-3xl bg-card p-6 shadow-sm border border-border/60">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-foreground">Recent</h3>
          <Link
            href={`/expenses?date=${new Date().toISOString().split("T")[0]}`}
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            View All <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="space-y-3">
          {expensesList.length > 0 ? (
            expensesList.slice(0, 6).map(expense => (
              <ExpenseItem key={expense.id} expense={expense} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
              <p className="text-sm font-medium text-foreground">No transactions yet</p>
              <p className="text-xs text-muted-foreground max-w-[260px]">
                Your data stays on this phone or browser. Add an expense anytime with the + button or below.
              </p>
              <button
                type="button"
                onClick={() => openAddExpenseDrawer()}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
              >
                <Plus size={16} strokeWidth={2.5} />
                Add expense
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

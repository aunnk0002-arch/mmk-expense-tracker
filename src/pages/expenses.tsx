import { useState } from "react";
import { useSearch } from "wouter";
import { useExpenses } from "@/hooks/use-expenses";
import { ExpenseItem } from "@/components/expense-item";
import { FileQuestion, Loader2, ChevronDown, CalendarDays, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, isToday, isYesterday, subDays } from "date-fns";
import { formatMMK } from "@/lib/utils";
import { openAddExpenseDrawer } from "@/lib/open-add-expense";

function formatDayLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMM d, yyyy");
}

function formatDayShort(dateStr: string): string {
  return format(parseISO(dateStr), "EEE");
}

function formatDayNum(dateStr: string): string {
  return format(parseISO(dateStr), "d");
}

export default function Expenses() {
  const { data: expenses, isLoading } = useExpenses();
  const search = useSearch();
  const initialDate = new URLSearchParams(search).get("date") ?? "";
  const [dateFilter, setDateFilter] = useState<string>(initialDate);
  const [expandedDay, setExpandedDay] = useState<string | null>(initialDate || null);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const expensesList = expenses || [];

  // Group non-today expenses by date
  const grouped = expensesList
    .filter(e => !isToday(parseISO(e.date)))
    .reduce<Record<string, typeof expensesList>>((acc, e) => {
      (acc[e.date] = acc[e.date] || []).push(e);
      return acc;
    }, {});

  // When date filter is active: show only that date (even if today or older than 5 days)
  // When no filter: show last 5 days excluding today
  const daysToShow = dateFilter
    ? [dateFilter]
    : Array.from({ length: 5 }, (_, i) => subDays(new Date(), i + 1).toISOString().split("T")[0]);

  // For date filter mode, also include today's expenses in the grouped map
  const groupedAll = expensesList.reduce<Record<string, typeof expensesList>>((acc, e) => {
    (acc[e.date] = acc[e.date] || []).push(e);
    return acc;
  }, {});

  const activeGrouped = dateFilter ? groupedAll : grouped;
  const anyData = daysToShow.some(d => (activeGrouped[d]?.length ?? 0) > 0);

  const toggleDay = (date: string) => {
    setExpandedDay(prev => (prev === date ? null : date));
  };

  const handleDateChange = (val: string) => {
    setDateFilter(val);
    setExpandedDay(val || null); // auto-expand the selected day
  };

  const handleClear = () => {
    setDateFilter("");
    setExpandedDay(null);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">History</h1>
        <p className="text-muted-foreground text-sm">
          {dateFilter ? "Showing results for selected date." : "Last 5 days — tap a day to see details."}
        </p>
      </div>

      {/* Date filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <CalendarDays
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={e => handleDateChange(e.target.value)}
            className={`w-full rounded-2xl border-2 bg-card py-3 pl-10 pr-4 text-sm cursor-pointer focus:outline-none transition-all shadow-sm ${
              dateFilter
                ? "border-primary text-foreground focus:ring-4 focus:ring-primary/10"
                : "border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
            }`}
          />
        </div>
        <AnimatePresence>
          {dateFilter && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-border bg-card text-muted-foreground hover:text-destructive hover:border-destructive transition-all shrink-0"
            >
              <X size={15} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Day cards */}
      {anyData ? (
        <div className="space-y-3">
          {daysToShow.map((date, idx) => {
            const dayExpenses = activeGrouped[date] || [];
            const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
            const isExpanded = expandedDay === date;
            const hasData = dayExpenses.length > 0;

            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className={`rounded-2xl border-2 overflow-hidden transition-colors ${
                  hasData
                    ? isExpanded
                      ? "border-primary/30 bg-card shadow-md"
                      : "border-border/60 bg-card shadow-sm hover:border-primary/20"
                    : "border-border/30 bg-muted/30"
                }`}
              >
                <button
                  onClick={() => hasData && toggleDay(date)}
                  disabled={!hasData}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all ${
                    hasData ? "cursor-pointer" : "cursor-default opacity-50"
                  }`}
                >
                  {/* Date badge */}
                  <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0 ${
                    isExpanded ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}>
                    <span className="text-[10px] font-semibold uppercase leading-none opacity-70">
                      {formatDayShort(date)}
                    </span>
                    <span className="text-xl font-bold leading-tight">
                      {formatDayNum(date)}
                    </span>
                  </div>

                  {/* Label + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {formatDayLabel(date)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {hasData
                        ? `${dayExpenses.length} transaction${dayExpenses.length === 1 ? "" : "s"}`
                        : "No expenses"}
                    </p>
                  </div>

                  {/* Total + chevron */}
                  {hasData && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-base font-bold text-foreground">
                        {formatMMK(dayTotal)}
                      </span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} className="text-muted-foreground" />
                      </motion.div>
                    </div>
                  )}
                </button>

                {/* Expanded expense list */}
                <AnimatePresence initial={false}>
                  {isExpanded && hasData && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2 border-t border-border/40 pt-3">
                        {dayExpenses.map(expense => (
                          <ExpenseItem key={expense.id} expense={expense} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <FileQuestion className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No expenses found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
            {dateFilter
              ? "No expenses were recorded on this date."
              : expensesList.length === 0
                ? "Nothing saved yet. Add your first expense to build your history."
                : "No entries in the last few days. Try another date or add a new expense."}
          </p>
          {!dateFilter && expensesList.length === 0 && (
            <button
              type="button"
              onClick={() => openAddExpenseDrawer()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
            >
              <Plus size={18} strokeWidth={2.5} />
              Add expense
            </button>
          )}
        </div>
      )}
    </div>
  );
}

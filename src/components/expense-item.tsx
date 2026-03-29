import { useState } from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Trash2, Pencil } from "lucide-react";
import { type Expense, useDeleteExpense } from "@/hooks/use-expenses";
import { CategoryIcon } from "@/components/category-icon";
import { EditExpenseDrawer } from "@/components/edit-expense-drawer";
import { formatMMK } from "@/lib/utils";

export function ExpenseItem({ expense }: { expense: Expense }) {
  const { mutate: deleteExpense, isPending } = useDeleteExpense();
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -2 }}
        className="group relative flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm border border-border/50 hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center gap-4 overflow-hidden">
          <CategoryIcon category={expense.category} size={24} className="h-12 w-12 shrink-0" />
          <div className="flex flex-col overflow-hidden min-w-0">
            <span className="font-semibold text-foreground truncate">
              {expense.note || expense.category}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              {expense.note ? (
                <span className="truncate max-w-full">{expense.category}</span>
              ) : null}
              {expense.note ? <span className="text-border">·</span> : null}
              <span>{format(parseISO(expense.date), "MMM d, yyyy")}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pl-2">
          <span className="font-bold font-display text-foreground">
            {formatMMK(expense.amount)}
          </span>
          <button
            onClick={() => setEditOpen(true)}
            className="flex h-9 w-9 lg:h-8 lg:w-8 items-center justify-center rounded-full bg-primary/10 text-primary opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground transition-all focus:opacity-100 active:scale-90"
            aria-label="Edit expense"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => deleteExpense(expense.id)}
            disabled={isPending}
            className="flex h-9 w-9 lg:h-8 lg:w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all focus:opacity-100 active:scale-90 disabled:opacity-50"
            aria-label="Delete expense"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </motion.div>

      <EditExpenseDrawer
        expense={expense}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}

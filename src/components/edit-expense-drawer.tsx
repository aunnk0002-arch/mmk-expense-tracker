import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdateExpense, categories, expenseSchema, type Expense } from "@/hooks/use-expenses";
import { useToast } from "@/hooks/use-toast";

const formSchema = expenseSchema.omit({ id: true });
type FormValues = z.infer<typeof formSchema>;

interface EditExpenseDrawerProps {
  expense: Expense;
  isOpen: boolean;
  onClose: () => void;
}

export function EditExpenseDrawer({ expense, isOpen, onClose }: EditExpenseDrawerProps) {
  const { mutateAsync: updateExpense, isPending } = useUpdateExpense();
  const { toast } = useToast();

  const isStandardCategory = (categories as readonly string[]).includes(expense.category);
  const initialDropdown = isStandardCategory ? expense.category : "Other";
  const initialCustom = isStandardCategory ? "" : expense.category;

  const [customCategory, setCustomCategory] = useState(initialCustom);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: expense.amount,
      category: initialDropdown,
      note: expense.note || "",
      date: expense.date,
    },
  });

  useEffect(() => {
    if (isOpen) {
      const isStd = (categories as readonly string[]).includes(expense.category);
      form.reset({
        amount: expense.amount,
        category: isStd ? expense.category : "Other",
        note: expense.note || "",
        date: expense.date,
      });
      setCustomCategory(isStd ? "" : expense.category);
    }
  }, [isOpen, expense]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const selectedCategory = form.watch("category");
  const isOther = selectedCategory === "Other";

  const onSubmit = async (data: FormValues) => {
    const finalCategory =
      isOther && customCategory.trim() ? customCategory.trim() : data.category;

    if (!finalCategory || finalCategory === "Other") {
      form.setError("category", { message: "Please enter a custom category name" });
      return;
    }

    try {
      await updateExpense({ ...data, id: expense.id, category: finalCategory });
      toast({ title: "Expense updated", description: "Changes saved successfully." });
      onClose();
    } catch {
      toast({ title: "Error", description: "Failed to update expense.", variant: "destructive" });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-expense-title"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl bg-card p-6 pb-8 shadow-2xl md:bottom-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:pb-6"
            style={{ maxHeight: "min(90vh, 100dvh - env(safe-area-inset-bottom, 0px))" }}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-full bg-muted md:hidden" />

            <div className="flex items-center justify-between mb-6">
              <h2 id="edit-expense-title" className="text-2xl font-bold text-foreground">
                Edit expense
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 overflow-y-auto pb-4">
              {/* Amount */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Amount (MMK)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
                    K
                  </span>
                  <input
                    type="number"
                    autoFocus
                    {...form.register("amount", { valueAsNumber: true })}
                    className="w-full rounded-2xl border-2 border-border bg-background py-4 pl-10 pr-4 text-xl font-bold focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    placeholder="0"
                  />
                </div>
                {form.formState.errors.amount && (
                  <p className="mt-1 text-sm text-destructive">
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Category
                </label>
                <div className="relative">
                  <select
                    {...form.register("category")}
                    onChange={(e) => {
                      form.setValue("category", e.target.value, { shouldValidate: true });
                      if (e.target.value !== "Other") setCustomCategory("");
                    }}
                    className="w-full appearance-none rounded-xl border-2 border-border bg-background px-4 py-3 pr-10 text-sm font-medium focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
                {form.formState.errors.category && (
                  <p className="mt-1 text-sm text-destructive">
                    {form.formState.errors.category.message}
                  </p>
                )}

                <AnimatePresence>
                  {isOther && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        maxLength={40}
                        className="w-full rounded-xl border-2 border-primary bg-background px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder="Enter custom category name..."
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Note */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  {...form.register("note")}
                  className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                  placeholder="What was this for?"
                />
                {form.formState.errors.note && (
                  <p className="mt-1 text-sm text-destructive">
                    {form.formState.errors.note.message}
                  </p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Date
                </label>
                <input
                  type="date"
                  {...form.register("date")}
                  className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                />
                {form.formState.errors.date && (
                  <p className="mt-1 text-sm text-destructive">
                    {form.formState.errors.date.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-xl bg-primary py-4 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

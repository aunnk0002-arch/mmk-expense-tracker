import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, ChevronDown, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAddExpense, categories, expenseSchema } from "@/hooks/use-expenses";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { OPEN_ADD_EXPENSE_EVENT } from "@/lib/open-add-expense";

const formSchema = expenseSchema.omit({ id: true });
type FormValues = z.infer<typeof formSchema>;

export function AddExpenseDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const { mutateAsync: addExpense, isPending } = useAddExpense();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      category: "",
      note: "",
      date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const selectedCategory = form.watch("category");
  const isOther = selectedCategory === "Other";

  const onSubmit = async (data: FormValues) => {
    const finalCategory =
      isOther && customCategory.trim() ? customCategory.trim() : data.category;

    if (!finalCategory) {
      form.setError("category", { message: "Please select a category" });
      return;
    }

    try {
      await addExpense({ ...data, category: finalCategory });
      toast({
        title: (
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Expense added
          </span>
        ),
        description: "Successfully tracked K " + data.amount.toLocaleString(),
        variant: "success",
      });
      handleClose();
    } catch {
      toast({
        title: "Error",
        description: "Failed to add expense.",
        variant: "destructive",
      });
    }
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setCustomCategory("");
    form.reset({
      amount: undefined,
      category: "",
      note: "",
      date: format(new Date(), "yyyy-MM-dd"),
    });
  }, [form]);

  useEffect(() => {
    const onOpen = () => setIsOpen(true);
    window.addEventListener(OPEN_ADD_EXPENSE_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_ADD_EXPENSE_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, handleClose]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-8 right-4 md:right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#062B55] via-[#083B73] to-[#0A4A8C] text-white shadow-xl shadow-primary/30 ring-1 ring-white/10 transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
        aria-label="Add expense"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-expense-title"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl bg-card p-6 pb-8 shadow-2xl md:bottom-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:pb-6"
              style={{ maxHeight: "min(90vh, 100dvh - env(safe-area-inset-bottom, 0px))" }}
            >
              <div className="mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-full bg-muted md:hidden" />

              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <h2 id="add-expense-title" className="text-2xl font-bold text-foreground">
                    Add expense
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Saved on this device only.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pb-6">
                  {/* Amount */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground/80">
                      Amount (MMK)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
                        K
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        enterKeyHint="done"
                        autoFocus
                        {...form.register("amount", { valueAsNumber: true })}
                        className="w-full rounded-2xl border-2 border-border bg-background py-4 pl-10 pr-4 text-xl font-bold text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder="0"
                      />
                    </div>
                    {form.formState.errors.amount && (
                      <p className="mt-1 text-sm text-destructive">
                        {form.formState.errors.amount.message}
                      </p>
                    )}
                  </div>

                  {/* Category Dropdown */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground/80">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        {...form.register("category")}
                        onChange={(e) => {
                          form.setValue("category", e.target.value, { shouldValidate: true });
                          if (e.target.value !== "Other") setCustomCategory("");
                        }}
                        className="w-full appearance-none rounded-xl border-2 border-border bg-background px-4 py-3 pr-10 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                      >
                        <option value="" disabled>
                          Select a category...
                        </option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
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

                    {/* Custom category input — shown only when "Other" is selected */}
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
                            autoFocus
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            maxLength={40}
                            className="w-full rounded-xl border-2 border-primary bg-background px-4 py-3 text-sm font-semibold text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                            placeholder="Enter custom category name..."
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground/80">
                      Note (Optional)
                    </label>
                    <input
                      type="text"
                      enterKeyHint="done"
                      {...form.register("note")}
                      className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
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
                    <label className="mb-2 block text-sm font-semibold text-foreground/80">
                      Date
                    </label>
                    <input
                      type="date"
                      {...form.register("date")}
                      className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                    {form.formState.errors.date && (
                      <p className="mt-1 text-sm text-destructive">
                        {form.formState.errors.date.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="sticky bottom-0 -mx-6 mt-2 border-t border-border/60 bg-card/95 px-6 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-3 backdrop-blur">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full rounded-xl bg-gradient-to-br from-[#062B55] via-[#083B73] to-[#0A4A8C] py-4 font-bold text-white shadow-xl shadow-primary/30 ring-1 ring-white/10 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary/35 active:translate-y-0 active:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
                  >
                    {isPending ? "Saving..." : "Save Expense"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

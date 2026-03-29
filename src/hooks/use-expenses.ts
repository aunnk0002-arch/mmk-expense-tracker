import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export const categories = ['Food', 'Transport', 'Bills', 'Shopping', 'Other'] as const;
export type Category = typeof categories[number];

export const expenseSchema = z.object({
  id: z.string(),
  amount: z.number().positive("Amount must be greater than 0"),
  category: z.string().min(1, "Please select a category"),
  note: z.string().max(100, "Note is too long").optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

export type Expense = z.infer<typeof expenseSchema>;

const STORAGE_KEY = 'mmk-expenses';

const initializeData = (): Expense[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return z.array(expenseSchema).parse(parsed);
    } catch (e) {
      console.error("Failed to parse local storage expenses:", e);
    }
  }

  // Fresh install: start with zero data (offline-first, personal use).
  return [];
};

const getExpenses = async (): Promise<Expense[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return initializeData();
};

const saveExpenses = (expenses: Expense[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
};

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses,
  });
}

export function useAddExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newExpense: Omit<Expense, 'id'>) => {
      await new Promise(resolve => setTimeout(resolve, 400));
      const expenses = await getExpenses();
      const expense: Expense = { ...newExpense, id: uuidv4() };
      const updatedExpenses = [expense, ...expenses];
      updatedExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      saveExpenses(updatedExpenses);
      return expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updated: Expense) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const expenses = await getExpenses();
      const updatedExpenses = expenses.map(e => e.id === updated.id ? updated : e);
      updatedExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      saveExpenses(updatedExpenses);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const expenses = await getExpenses();
      const updatedExpenses = expenses.filter(e => e.id !== id);
      saveExpenses(updatedExpenses);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

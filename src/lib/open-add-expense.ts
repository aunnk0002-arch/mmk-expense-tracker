/** Dispatched globally so any screen can open the add-expense drawer. */
export const OPEN_ADD_EXPENSE_EVENT = "mmk-open-add-expense";

export function openAddExpenseDrawer(): void {
  window.dispatchEvent(new CustomEvent(OPEN_ADD_EXPENSE_EVENT));
}

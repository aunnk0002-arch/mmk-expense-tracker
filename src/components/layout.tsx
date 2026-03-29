import { Link, useRoute } from "wouter";
import { LayoutDashboard, ReceiptText, Wallet } from "lucide-react";
import { AddExpenseDrawer } from "./add-expense-drawer";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isHome] = useRoute("/");
  const [isExpenses] = useRoute("/expenses");

  return (
    <div className="min-h-screen bg-background pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0 md:pl-64">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-card p-6 md:flex">
        <div className="flex items-center gap-3 mb-10 text-primary">
          <Wallet size={32} className="shrink-0" />
          <span className="text-xl font-display font-bold text-foreground">MMK Tracker</span>
        </div>
        
        <nav className="flex flex-col gap-2">
          <Link 
            href="/" 
            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${
              isHome ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link 
            href="/expenses" 
            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${
              isExpenses ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <ReceiptText size={20} />
            All Expenses
          </Link>
        </nav>
        
        <div className="mt-auto rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 border border-primary/10">
          <h3 className="font-bold text-primary text-sm mb-1">On this device</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Expenses are stored locally in this browser. Clear site data or uninstall to remove them unless you export a backup.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="mx-auto max-w-3xl p-4 md:p-8">
        <div className="md:hidden flex items-start justify-between gap-4 mb-6 pb-2 pt-[env(safe-area-inset-top,0px)]">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Wallet size={24} className="shrink-0" />
              <span className="text-lg font-display font-bold text-foreground">MMK Tracker</span>
            </div>
            <p className="mt-1 pl-8 text-xs text-muted-foreground leading-snug">
              Personal spending — stored offline on this device.
            </p>
          </div>
        </div>
        
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 min-h-[4rem] items-center justify-around border-t border-border bg-card/85 px-6 backdrop-blur-md md:hidden pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))] pt-1">
        <Link 
          href="/" 
          className={`flex flex-col items-center gap-1 transition-colors ${isHome ? "text-primary" : "text-muted-foreground"}`}
        >
          <LayoutDashboard size={20} className={isHome ? "fill-primary/20" : ""} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <div className="w-10" /> {/* Spacer for FAB */}
        <Link 
          href="/expenses" 
          className={`flex flex-col items-center gap-1 transition-colors ${isExpenses ? "text-primary" : "text-muted-foreground"}`}
        >
          <ReceiptText size={20} className={isExpenses ? "fill-primary/20" : ""} />
          <span className="text-[10px] font-medium">History</span>
        </Link>
      </nav>

      {/* Global Add FAB */}
      <AddExpenseDrawer />
    </div>
  );
}

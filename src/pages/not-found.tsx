import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md border-border/80 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-3">
            <AlertCircle className="h-8 w-8 shrink-0 text-destructive" />
            <h1 className="text-2xl font-bold font-display text-foreground">Page not found</h1>
          </div>

          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            This link doesn&apos;t match any screen in the app. Try going back to the dashboard.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-95"
          >
            Back to dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time failures so a single broken page never takes the whole
 * application down with a blank screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // A real deployment forwards this to an error tracker.
    console.error("Eroare neinterceptată în interfață", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4 rounded-card border border-border bg-surface p-6 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-xl border border-danger-border bg-danger-muted">
            <TriangleAlert className="size-5 text-danger" aria-hidden />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold">Această pagină nu mai răspunde</h1>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              O eroare neașteptată a întrerupt randarea. De obicei reîncărcarea
              o rezolvă; detaliile sunt în consola browserului.
            </p>
          </div>
          <pre className="max-h-28 overflow-auto rounded-lg border border-border bg-canvas p-3 text-left font-mono text-[11px] text-muted-foreground">
            {this.state.error.message}
          </pre>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            <RefreshCw />
            Reîncarcă aplicația
          </Button>
        </div>
      </div>
    );
  }
}

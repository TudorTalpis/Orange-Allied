import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/providers/auth-provider";
import { SettingsProvider } from "@/providers/settings-provider";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { AppRoutes } from "@/routes";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <TooltipProvider delayDuration={250} skipDelayDuration={200}>
              <AppRoutes />
              <Toaster
                position="bottom-right"
                closeButton
                toastOptions={{
                  classNames: {
                    toast:
                      "!bg-surface-overlay !border-border !text-foreground !rounded-xl",
                    description: "!text-muted-foreground",
                    actionButton: "!bg-primary !text-primary-foreground",
                  },
                }}
              />
            </TooltipProvider>
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

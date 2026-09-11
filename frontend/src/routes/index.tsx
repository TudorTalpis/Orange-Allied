import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthLayout } from "@/components/layout/auth-layout";
import { LoadingBlock } from "@/components/common/loading-state";
import { LandingRoute, ProtectedRoute, PublicOnlyRoute } from "./protected-route";

/* Route-level code splitting keeps the initial bundle small. */
const LandingPage = lazy(() => import("@/pages/Landing"));
const LoginPage = lazy(() => import("@/pages/Login"));
const RegisterPage = lazy(() => import("@/pages/Register"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPassword"));
const DashboardPage = lazy(() => import("@/pages/Dashboard"));
const DocumentsPage = lazy(() => import("@/pages/Documents"));
const DocumentDetailsPage = lazy(() => import("@/pages/DocumentDetails"));
const UploadPage = lazy(() => import("@/pages/Upload"));
const SearchPage = lazy(() => import("@/pages/Search"));
const ChatPage = lazy(() => import("@/pages/Chat"));
const CategoriesPage = lazy(() => import("@/pages/Categories"));
const ProcessingPage = lazy(() => import("@/pages/Processing"));
const SettingsPage = lazy(() => import("@/pages/Settings"));
const HelpPage = lazy(() => import("@/pages/Help"));
const NotFoundPage = lazy(() => import("@/pages/NotFound"));

function RouteFallback() {
  return (
    <div className="mx-auto w-full max-w-3xl py-10">
      <LoadingBlock />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/documents/:id" element={<DocumentDetailsPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:conversationId" element={<ChatPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/processing" element={<ProcessingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Route>
        </Route>

        {/* The public page lives at the root; members are sent to the app. */}
        <Route
          path="/"
          element={
            <LandingRoute>
              <LandingPage />
            </LandingRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

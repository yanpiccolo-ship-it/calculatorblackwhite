import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useLicenseCheck } from "@/hooks/useLicenseCheck";
import { AccessDenied } from "@/components/AccessDenied";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminGateway from "./pages/AdminGateway";
import PartnerPanel from "./pages/PartnerPanel";
import Pricing from "./pages/Pricing";
import OrderSuccess from "./pages/OrderSuccess";
import ReportPreview from "./pages/ReportPreview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// License wrapper component
const LicenseGuard = ({ children }: { children: React.ReactNode }) => {
  const { isValid, isLoading, domain } = useLicenseCheck();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isValid) {
    return <AccessDenied domain={domain} />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin-gateway" element={<AdminGateway />} />
            <Route path="/partner-panel" element={<PartnerPanel />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/success" element={<OrderSuccess />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/report-preview/:orderId"
              element={
                <ProtectedRoute requireAdmin>
                  <ReportPreview />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

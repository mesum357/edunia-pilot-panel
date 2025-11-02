import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Layout/Sidebar";
import { mockSummary } from "./lib/mockData";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Shops from "./pages/Shops";
import Hospitals from "./pages/Hospitals";
import Education from "./pages/Education";
import Marketplace from "./pages/Marketplace";
import PaymentSettings from "./pages/PaymentSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>
        <div className="flex min-h-screen w-full">
          <Sidebar counts={{
            shops: mockSummary.totalShops,
            hospitals: mockSummary.totalHospitals,
            education: mockSummary.totalInstitutes,
            marketplace: mockSummary.totalMarketplaceProducts,
            pending: mockSummary.pendingRequests,
          }} />
          <div className="flex-1 lg:ml-64">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/shops" element={<Shops />} />
              <Route path="/hospitals" element={<Hospitals />} />
              <Route path="/education" element={<Education />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/payment-settings" element={<PaymentSettings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

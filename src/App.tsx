import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Layout/Sidebar";
import { useEffect, useState } from "react";
import { apiGet } from "./lib/api";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Shops from "./pages/Shops";
import Hospitals from "./pages/Hospitals";
import Education from "./pages/Education";
import Marketplace from "./pages/Marketplace";
import PaymentSettings from "./pages/PaymentSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [sidebarCounts, setSidebarCounts] = useState({
    shops: 0,
    hospitals: 0,
    education: 0,
    marketplace: 0,
    pending: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await apiGet<any>('/api/admin/stats');
        setSidebarCounts({
          shops: data?.payments?.byEntityType?.shops || 0,
          hospitals: data?.payments?.byEntityType?.hospitals || 0,
          education: data?.payments?.byEntityType?.education || 0,
          marketplace: data?.payments?.byEntityType?.marketplace || 0,
          pending: data?.payments?.pending || 0,
        });
      } catch (e) {
        console.error('Error loading sidebar stats:', e);
      }
    };
    loadStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <div className="flex min-h-screen w-full">
            <Sidebar counts={sidebarCounts} />
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
};

export default App;

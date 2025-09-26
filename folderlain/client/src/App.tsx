import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import StudentAttendancePage from "@/pages/student-attendance";
import AdminDashboardPage from "@/pages/admin-dashboard";
import FloatingOrbs from "@/components/floating-orbs";

function Router() {
  return (
    <Switch>
      <Route path="/" component={StudentAttendancePage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">404 - Halaman tidak ditemukan</h1>
            <a href="/" className="text-primary hover:underline">
              Kembali ke halaman utama
            </a>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FloatingOrbs />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

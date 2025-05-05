
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { RoleProvider } from "@/features/auth/context/RoleContext";
import { ProtectedRoute, PublicOnlyRoute } from "@/features/auth/components/ProtectedRoute";
import { RoleProtectedRoute } from "@/features/auth/components/RoleProtectedRoute";

// Import layouts
import DashboardLayout from "@/components/layout/DashboardLayout";

// Import pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Elections from "./pages/Elections";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import MyVotes from "./pages/MyVotes";
import UsersManagement from "./pages/admin/UsersManagement";
import ElectionsManagement from "./pages/admin/ElectionsManagement";
import CandidatesPage from "./features/candidates/pages/CandidatesPage";
import VotingPage from "./features/elections/pages/VotingPage";
import ResultsPage from "./features/elections/pages/ResultsPage";

/**
 * Main App component that sets up providers and routing
 */
const App = () => {
  // Initialize React Query client inside the component
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <RoleProvider>
            {/* Toast notifications */}
            <Toaster />
            <Sonner />
            
            {/* Application routes */}
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              
              {/* Public routes (only when logged out) */}
              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>
              
              {/* Protected routes (require authentication) */}
              <Route element={<ProtectedRoute />}>
                {/* Dashboard layout for authenticated routes */}
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/elections" element={<Elections />} />
                  <Route path="/elections/:electionId" element={<VotingPage />} />
                  <Route path="/elections/:electionId/results" element={<ResultsPage />} />
                  <Route path="/candidates/:electionId" element={<CandidatesPage />} />
                  <Route path="/my-votes" element={<MyVotes />} />
                  <Route path="/profile" element={<Profile />} />
                  
                  {/* Admin routes */}
                  <Route element={<RoleProtectedRoute requiredRole="admin" />}>
                    <Route path="/admin/users" element={<UsersManagement />} />
                    <Route path="/admin/elections" element={<ElectionsManagement />} />
                  </Route>
                </Route>
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RoleProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

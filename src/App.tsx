
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { RoleProvider } from "@/features/auth/context/RoleContext";
import { ProtectedRoute, PublicOnlyRoute } from "@/features/auth/components/ProtectedRoute";
import { RoleProtectedRoute } from "@/features/auth/components/RoleProtectedRoute";

// Public pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Elections from "./pages/Elections";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Security from "./pages/Security";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

// Protected pages
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MyVotes from "./pages/MyVotes";
import Candidates from "./pages/Candidates";
import Discussions from "./pages/Discussions";

// Election pages
import ElectionDetailPage from "./features/elections/pages/ElectionDetailPage";
import VotingPage from "./features/elections/pages/VotingPage";
import ResultsPage from "./features/elections/pages/ResultsPage";
import CandidatesPage from "./features/candidates/pages/CandidatesPage";
import MyApplicationsPage from "./features/candidates/pages/MyApplicationsPage";

// Admin pages
import ElectionsManagement from "./pages/admin/ElectionsManagement";
import ElectionDetail from "./pages/admin/ElectionDetail";
import UsersManagement from "./pages/admin/UsersManagement";
import Analytics from "./pages/admin/Analytics";
import SystemSettings from "./pages/admin/SystemSettings";
import DevelopersManagement from "./pages/admin/DevelopersManagement";

// Layout components
import DashboardLayout from "./components/layout/DashboardLayout";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <RoleProvider>
              <Routes>
                {/* Public routes that redirect to dashboard if logged in */}
                <Route element={<PublicOnlyRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Route>

                {/* Public routes accessible to everyone */}
                <Route path="/" element={<Index />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/security" element={<Security />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/about" element={<About />} />

                {/* Public elections routes - accessible without authentication */}
                <Route path="/elections" element={<Elections />} />
                <Route path="/elections/:electionId" element={<ElectionDetailPage />} />
                <Route path="/elections/details/:electionId" element={<ElectionDetailPage />} />
                <Route path="/elections/:electionId/vote" element={<VotingPage />} />
                <Route path="/elections/:electionId/results" element={<ResultsPage />} />
                <Route path="/elections/:electionId/candidates" element={<CandidatesPage />} />

                {/* Protected routes with dashboard layout */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/my-votes" element={<MyVotes />} />
                    <Route path="/candidates" element={<Candidates />} />
                    <Route path="/my-applications" element={<MyApplicationsPage />} />
                    <Route path="/discussions" element={<Discussions />} />

                    {/* Protected elections routes - same pages but with sidebar for authenticated users */}
                    <Route path="/dashboard/elections" element={<Elections />} />
                    <Route path="/dashboard/elections/:electionId" element={<ElectionDetailPage />} />
                    <Route path="/dashboard/elections/details/:electionId" element={<ElectionDetailPage />} />
                    <Route path="/dashboard/elections/:electionId/vote" element={<VotingPage />} />
                    <Route path="/dashboard/elections/:electionId/results" element={<ResultsPage />} />
                    <Route path="/dashboard/elections/:electionId/candidates" element={<CandidatesPage />} />

                    {/* Admin-only routes */}
                    <Route element={<RoleProtectedRoute requiredRole="admin" />}>
                      <Route path="/admin/elections" element={<ElectionsManagement />} />
                      <Route path="/admin/elections/:electionId" element={<ElectionDetail />} />
                      <Route path="/admin/users" element={<UsersManagement />} />
                      <Route path="/admin/analytics" element={<Analytics />} />
                      <Route path="/admin/settings" element={<SystemSettings />} />
                      <Route path="/admin/developers" element={<DevelopersManagement />} />
                    </Route>
                  </Route>
                </Route>

                {/* 404 page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </RoleProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

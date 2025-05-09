
import { Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";

// Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Elections from "@/pages/Elections";
import MyVotes from "@/pages/MyVotes";
import MyApplications from "@/pages/MyApplications";
import Profile from "@/pages/Profile";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminElections from "@/pages/admin/AdminElections";
import AnalyticsDashboard from "@/pages/admin/AnalyticsDashboard";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AppRoutes() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // We're only setting loading state here
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // The AuthProvider will handle session changes
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="elections" element={<Elections />} />
        <Route path="my-votes" element={<MyVotes />} />
        <Route path="my-applications" element={<MyApplications />} />
        <Route path="profile" element={<Profile />} />

        {/* Admin Routes */}
        <Route path="admin/users" element={<AdminUsers />} />
        <Route path="admin/elections" element={<AdminElections />} />
        <Route path="admin/analytics" element={<AnalyticsDashboard />} />
      </Route>
    </Routes>
  );
}

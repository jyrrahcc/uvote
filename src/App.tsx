
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./features/auth/context/AuthContext";
import { RoleProvider } from "./features/auth/context/RoleContext";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Elections from "./pages/Elections";
import MyVotes from "./pages/MyVotes";
import MyApplications from "./pages/MyApplications";
import Profile from "./pages/Profile";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminElections from "./pages/admin/AdminElections";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import DashboardLayout from "./components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { Loader } from "@/components/ui/loader";

function App() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // We can't use setSession here since it doesn't exist in our context
      // Relying on the AuthProvider to handle session state
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // We can't use setSession here since it doesn't exist in our context
      // The AuthProvider will handle this
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
    <AuthProvider>
      <RoleProvider>
        <Router>
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
        </Router>
      </RoleProvider>
    </AuthProvider>
  );
}

export default App;

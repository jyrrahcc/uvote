
import { useRole } from "@/features/auth/context/RoleContext";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AdminControls from "@/components/dashboard/AdminControls";

const Dashboard = () => {
  const { isAdmin, userRole } = useRole();

  return (
    <div className="space-y-6">
      <WelcomeHeader userRole={userRole} />
      <DashboardStats />
      {isAdmin && <AdminControls />}
    </div>
  );
};

export default Dashboard;


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminControls = () => {
  return (
    <div className="pt-6">
      <h2 className="text-xl font-semibold mb-4">Admin Controls</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Election Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Create, edit, and manage elections. Monitor ongoing elections and view results.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Manage user accounts, assign roles, and monitor user activity.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminControls;

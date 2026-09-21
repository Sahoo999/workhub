import ProtectedRoute from "@/components/ProtectedRoute";
import WorkspaceDashboard from "@/features/workspaces/WorkspaceDashboard";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <WorkspaceDashboard />
    </ProtectedRoute>
  );
}
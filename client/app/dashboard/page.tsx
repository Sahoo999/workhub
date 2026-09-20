"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <main>
        <h1>Dashboard</h1>

        <p>
          Welcome, {user?.name}
        </p>

        <p>
          Email: {user?.email}
        </p>
      </main>
    </ProtectedRoute>
  );
}
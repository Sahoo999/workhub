"use client";

import { useParams } from "next/navigation";

import ProtectedRoute from "@/components/ProtectedRoute";
import WorkspaceDetail from "@/features/workspaces/WorkspaceDetail";

export default function WorkspacePage() {
  const params = useParams<{
    workspaceId: string;
  }>();

  const workspaceId =
    params.workspaceId;

  return (
    <ProtectedRoute>
      <WorkspaceDetail
        workspaceId={workspaceId}
      />
    </ProtectedRoute>
  );
}
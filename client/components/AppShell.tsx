"use client";

import type { ReactNode } from "react";

import ProtectedRoute from "@/components/ProtectedRoute";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({
  children,
}: AppShellProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />

            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
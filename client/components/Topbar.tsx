"use client";

import Link from "next/link";

import { useAuth } from "@/components/AuthProvider";

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6">
      <div>
        <h1 className="text-sm font-medium text-gray-500">
          Workspace
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/notifications"
          className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          Notifications
        </Link>

        <div className="flex items-center gap-3 border-l pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {user?.name ?? "User"}
            </p>

            <p className="text-xs text-gray-500">
              {user?.email ?? ""}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
"use client";

import Link from "next/link";

import AppShell from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";

const quickActions = [
  {
    title: "Workspaces",
    description:
      "View and manage your workspaces.",
    href: "/workspaces",
  },
  {
    title: "Projects",
    description:
      "Open your projects and manage tasks.",
    href: "/workspaces",
  },
  {
    title: "Notifications",
    description:
      "Check your latest notifications.",
    href: "/notifications",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
        <section>
          <p className="text-sm font-medium text-gray-500">
            Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            Welcome back, {user?.name ?? "User"}!
          </h1>

          <p className="mt-2 max-w-2xl text-gray-500">
            Manage your workspaces, projects, tasks,
            and team collaboration from one place.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-sm font-bold text-white">
                {action.title.charAt(0)}
              </div>

              <h2 className="mt-5 text-lg font-semibold text-gray-900">
                {action.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {action.description}
              </p>

              <p className="mt-5 text-sm font-medium text-gray-900">
                Open →
              </p>
            </Link>
          ))}
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Getting started
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Start building your workspace.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm font-semibold text-gray-900">
                01
              </p>

              <h3 className="mt-2 font-medium">
                Create a workspace
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Set up a workspace for your team.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm font-semibold text-gray-900">
                02
              </p>

              <h3 className="mt-2 font-medium">
                Create a project
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Organize your work into projects.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm font-semibold text-gray-900">
                03
              </p>

              <h3 className="mt-2 font-medium">
                Add tasks
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Break projects into actionable tasks.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
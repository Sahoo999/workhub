"use client";

import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import HeroBackground from "@/components/hero-background";
import LoginForm from "@/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen bg-black text-white">
      <HeroBackground />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* Left side */}
        <section className="hidden p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link
              href="/"
              className="flex items-center gap-3 text-xl font-bold"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-950">
                W
              </div>

              WorkHub
            </Link>
          </div>

          <div className="max-w-lg space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm text-white/75 backdrop-blur-xl">
                <Sparkles className="h-4 w-4 text-blue-400" />
                Team workspace
              </div>

              <h1 className="text-4xl font-bold tracking-tight xl:text-5xl">
                Everything your team needs to{" "}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  get work done.
                </span>
              </h1>

              <p className="text-lg text-white/65">
                Manage projects, tasks, teams, comments,
                and collaboration from one workspace.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                <span className="text-sm">
                  Organize projects and tasks
                </span>
              </div>

              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                <span className="text-sm">
                  Collaborate with your team
                </span>
              </div>

              <div className="flex items-center gap-3 text-white/80">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
                <span className="text-sm">
                  Secure workspace-based access
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-white/40">© 2026 WorkHub</p>
        </section>

        {/* Right side */}
        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-950">
                  W
                </div>

                WorkHub
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-8">
              <div className="mb-8 space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Welcome back
                </h2>

                <p className="text-sm text-white/55">
                  Sign in to continue to your WorkHub workspace.
                </p>
              </div>

              <LoginForm />

              <div className="mt-6 text-center text-sm text-white/50">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-white underline underline-offset-4 hover:text-blue-300"
                >
                  Create one
                  <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
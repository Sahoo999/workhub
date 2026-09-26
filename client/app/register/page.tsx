"use client";

import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import RegisterForm from "@/features/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Product panel */}
        <section className="hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
          <Link
            href="/register"
            className="flex items-center gap-3 text-xl font-bold"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground text-sm font-bold text-primary">
              W
            </div>

            WorkHub
          </Link>

          <div className="max-w-lg space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-sm">
                <Sparkles className="h-4 w-4" />
                Start collaborating
              </div>

              <h1 className="text-4xl font-bold tracking-tight xl:text-5xl">
                Bring your team&apos;s work into one place.
              </h1>

              <p className="text-lg text-primary-foreground/70">
                Create projects, assign tasks, discuss work,
                and keep everyone aligned.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm">
                  Projects and tasks in one workspace
                </span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm">
                  Team collaboration and comments
                </span>
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm">
                  Role-based workspace access
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-primary-foreground/50">
            © 2026 WorkHub
          </p>
        </section>

        {/* Form */}
        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link
                href="/register"
                className="flex items-center gap-2 text-xl font-bold"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                  W
                </div>

                WorkHub
              </Link>
            </div>

            <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
              <div className="mb-8 space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">
                  Create your account
                </h2>

                <p className="text-sm text-muted-foreground">
                  Get your team set up and start managing work.
                </p>
              </div>

              <RegisterForm />

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                >
                  Sign in
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
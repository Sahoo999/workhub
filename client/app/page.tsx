import Link from "next/link";

import {
  ArrowRight,
  CircleCheck,
  FolderKanban,
  ListTodo,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";

import HeroBackground from "@/components/hero-background";

export default function HomePage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-black text-white"
    >
      <HeroBackground />

      {/* =====================================================
          HEADER
          ===================================================== */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-950 shadow-[0_0_30px_rgba(59,130,246,0.18)]">
              W
            </div>

            <span className="text-lg font-semibold tracking-tight text-white">
              WorkHub
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-white/55 transition-colors hover:text-white"
            >
              Features
            </a>

            <a
              href="#workflow"
              className="text-sm font-medium text-white/55 transition-colors hover:text-white"
            >
              Workflow
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-white/55 transition-colors hover:text-white"
            >
              About
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/5 hover:text-white sm:inline-flex"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center rounded-lg border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-950/20 transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-xl"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
          ===================================================== */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pb-28">
          <div className="mx-auto max-w-4xl text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-white/70 shadow-lg shadow-black/20 backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />

              Work management for modern teams
            </div>

            {/* Heading */}
            <h1 className="mt-7 text-5xl font-bold tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
              Plan work.
              <br />

              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Ship together.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/55 sm:text-lg sm:leading-8">
              WorkHub brings projects, tasks, teams, comments,
              and collaboration into one focused workspace.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-slate-950 shadow-[0_10px_40px_rgba(59,130,246,0.16)] transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_15px_50px_rgba(99,102,241,0.22)]"
              >
                Start for free

                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] px-6 text-sm font-medium text-white/85 backdrop-blur-xl transition-all hover:bg-white/[0.09]"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* =================================================
              PRODUCT PREVIEW
              ================================================= */}
          <div className="relative mx-auto mt-16 max-w-6xl">
            {/* glow */}
            <div
              aria-hidden="true"
              className="absolute inset-x-[8%] bottom-[-90px] top-[15%] rounded-full bg-indigo-500/15 blur-[100px]"
            />

            <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.045] shadow-[0_35px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
              {/* Browser bar */}
              <div className="flex h-11 items-center gap-2 border-b border-white/10 bg-white/[0.025] px-4">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                </div>

                <div className="mx-auto hidden h-6 max-w-md flex-1 rounded-md border border-white/10 bg-white/[0.035] sm:block" />
              </div>

              <div className="grid min-h-[420px] lg:grid-cols-[210px_1fr]">
                {/* Preview sidebar */}
                <aside className="hidden border-r border-white/10 bg-black/10 p-4 lg:block">
                  <div className="flex items-center gap-2 px-2 pb-6">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[11px] font-bold text-slate-950">
                      W
                    </div>

                    <span className="text-sm font-semibold text-white">
                      WorkHub
                    </span>
                  </div>

                  <div className="space-y-1">
                    <PreviewNavItem title="Dashboard" />

                    <PreviewNavItem
                      title="Projects"
                      active
                    />

                    <PreviewNavItem title="Tasks" />

                    <PreviewNavItem title="Notifications" />
                  </div>
                </aside>

                {/* Preview content */}
                <div className="bg-gradient-to-br from-blue-500/[0.045] via-indigo-500/[0.03] to-violet-500/[0.05] p-5 sm:p-7">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                        Project
                      </p>

                      <h2 className="mt-1 text-xl font-semibold text-white">
                        Website redesign
                      </h2>

                      <p className="mt-1 text-xs text-white/40">
                        Keep the team focused on the next thing
                        that matters.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <span className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/65">
                        Board
                      </span>

                      <span className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-lg">
                        + Task
                      </span>
                    </div>
                  </div>

                  <div className="mt-7 grid gap-4 md:grid-cols-3">
                    <PreviewColumn
                      title="To do"
                      count={4}
                      tasks={[
                        "Define user flow",
                        "Prepare content",
                        "Create wireframes",
                      ]}
                    />

                    <PreviewColumn
                      title="In progress"
                      count={2}
                      tasks={[
                        "Build navigation",
                        "Design dashboard",
                      ]}
                    />

                    <PreviewColumn
                      title="Done"
                      count={6}
                      tasks={[
                        "Project setup",
                        "Design system",
                        "Authentication",
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURES
          ===================================================== */}
      <section
        id="features"
        className="relative z-10 border-t border-white/10 bg-black/10"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-blue-400">
              Everything in one place
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Built around how teams actually work.
            </h2>

            <p className="mt-4 text-base leading-7 text-white/50">
              Keep planning, execution, and team context connected
              instead of scattered across different tools.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<FolderKanban />}
              title="Projects"
              description="Give every initiative a clear home with its own projects and workflow."
            />

            <FeatureCard
              icon={<ListTodo />}
              title="Tasks"
              description="Create, prioritize, assign, filter, and track work from start to finish."
            />

            <FeatureCard
              icon={<Users />}
              title="Teams"
              description="Work together with workspace-based access and role-aware collaboration."
            />

            <FeatureCard
              icon={<MessageSquare />}
              title="Context"
              description="Keep comments, activity, and task discussions connected to the work."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          WORKFLOW
          ===================================================== */}
      <section
        id="workflow"
        className="relative z-10 border-t border-white/10"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="text-center">
            <p className="text-sm font-semibold text-indigo-400">
              Simple workflow
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              From idea to shipped work.
            </h2>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-0 md:grid-cols-4">
            <WorkflowStep
              number="01"
              title="Workspace"
              description="Create a focused space for your team."
            />

            <WorkflowStep
              number="02"
              title="Projects"
              description="Turn goals into organized projects."
            />

            <WorkflowStep
              number="03"
              title="Tasks"
              description="Break projects into actionable work."
            />

            <WorkflowStep
              number="04"
              title="Ship"
              description="Track progress and keep everyone aligned."
              last
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
          ===================================================== */}
      <section
        id="about"
        className="relative z-10 border-t border-white/10"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-violet-500/15 px-6 py-14 text-center text-white shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:px-12">
            <div
              aria-hidden="true"
              className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-500/15 blur-[100px]"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-28 right-[-40px] h-80 w-80 rounded-full bg-violet-500/15 blur-[110px]"
            />

            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to organize your work?
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
                Create a workspace and start turning your projects
                into clear, actionable work.
              </p>

              <div className="mt-8">
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center rounded-lg bg-white px-6 text-sm font-semibold text-slate-950 shadow-xl transition-all hover:-translate-y-0.5 hover:bg-white/90"
                >
                  Create your workspace

                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
          ===================================================== */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[10px] font-bold text-slate-950">
              W
            </div>

            <span className="font-medium text-white/65">
              WorkHub
            </span>
          </div>

          <p>
            Project and team management platform.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* =========================================================
   PREVIEW NAV ITEM
   ========================================================= */

interface PreviewNavItemProps {
  title: string;
  active?: boolean;
}

function PreviewNavItem({
  title,
  active = false,
}: PreviewNavItemProps) {
  return (
    <div
      className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
        active
          ? "bg-white text-slate-950 shadow-sm"
          : "text-white/45 hover:bg-white/[0.05] hover:text-white/80"
      }`}
    >
      {title}
    </div>
  );
}

/* =========================================================
   FEATURE CARD
   ========================================================= */

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-lg shadow-black/10 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-blue-400/20 hover:bg-white/[0.065] hover:shadow-2xl hover:shadow-blue-950/20">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-400/10 text-blue-400">
        {icon}
      </div>

      <h3 className="mt-5 font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-white/45">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   WORKFLOW STEP
   ========================================================= */

interface WorkflowStepProps {
  number: string;
  title: string;
  description: string;
  last?: boolean;
}

function WorkflowStep({
  number,
  title,
  description,
  last = false,
}: WorkflowStepProps) {
  return (
    <div className="relative px-4 py-4 text-center md:px-6 md:text-left">
      {!last && (
        <div className="absolute left-1/2 top-8 hidden h-px w-full bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-violet-500/30 md:block" />
      )}

      <div className="relative mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-xs font-semibold text-white shadow-lg backdrop-blur-xl md:mx-0">
        {number}
      </div>

      <h3 className="mt-4 font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-white/45">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   PRODUCT PREVIEW COLUMN
   ========================================================= */

interface PreviewColumnProps {
  title: string;
  count: number;
  tasks: string[];
}

function PreviewColumn({
  title,
  count,
  tasks,
}: PreviewColumnProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/10 p-3 shadow-lg backdrop-blur-xl">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <CircleCheck className="h-3.5 w-3.5 text-blue-400" />

          <span className="text-xs font-semibold text-white/80">
            {title}
          </span>
        </div>

        <span className="text-[10px] font-medium text-white/35">
          {count}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {tasks.map((task, index) => (
          <div
            key={task}
            className="rounded-lg border border-white/10 bg-white/[0.045] p-3 shadow-sm"
          >
            <p className="text-xs font-medium text-white/75">
              {task}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex -space-x-1">
                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-950 bg-blue-500/20 text-[8px] font-semibold text-blue-300">
                  A
                </div>

                {index % 2 === 0 && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-950 bg-violet-500/20 text-[8px] font-semibold text-violet-300">
                    D
                  </div>
                )}
              </div>

              <span className="text-[9px] text-white/30">
                Today
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
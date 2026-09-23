"use client";

import Link from "next/link";

import type { Project } from "./project.types";

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({
  projects,
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <section>
        <h2>No projects yet</h2>

        <p>
          Create your first project above.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2>Projects</h2>

      {projects.map((project) => (
        <article key={project.id}>
          <Link
            href={`/projects/${project.id}`}
          >
            <h3>{project.name}</h3>
          </Link>

          {project.description && (
            <p>
              {project.description}
            </p>
          )}
        </article>
      ))}
    </section>
  );
}
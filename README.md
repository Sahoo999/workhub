<div align="center">

<h1>WorkHub</h1>

<h3>A multi-tenant workspace and project management platform</h3>

<p><strong>Plan work. Coordinate teams. Track execution.</strong></p>

<p>Built with <strong>Next.js · TypeScript · Express · PostgreSQL · Docker</strong></p>

<p>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5">
  <img src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white" alt="Node.js 22">
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express 5">
  <img src="https://img.shields.io/badge/PostgreSQL-PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker Compose">
</p>

------------------------------------------------------------------------

</div>

<div align="center">

<h2>Overview</h2>

<p align="center">WorkHub is a full-stack, multi-tenant project and task management
application. It brings workspace membership, projects, tasks, comments,
labels, activity history, and notifications into one place.</p>

<p align="center">The goal is to demonstrate the engineering involved in building a
complete application across the frontend, API, database, authentication,
authorization, and local delivery workflow---not just a collection of
isolated CRUD screens.</p>

<p align="center">A user can work across multiple workspaces. Within a workspace, teams
organize projects and track tasks through a defined workflow. Backend
authorization protects workspace-scoped resources, while the frontend
provides the screens and API integrations needed to work with them.</p>

> **Project status:** Core application flows, Docker Compose, and a
> GitHub Actions CI workflow have been set up.

</div>

## Product model

``` text
User
 └── Workspace
      ├── Members and roles
      └── Projects
           └── Tasks
                ├── Comments
                ├── Labels
                ├── Activity
                └── Assignment notifications
```

## Features

### Identity and sessions

-   Registration and login
-   Password hashing with `bcrypt`
-   Short-lived JWT access tokens
-   Opaque refresh tokens stored as hashes in the database
-   Refresh token delivered through an `HttpOnly` cookie
-   Refresh-token rotation and revocation
-   Logout and cookie clearing
-   Frontend session restoration and access-token refresh handling

### Workspaces and collaboration

-   Create and list workspaces
-   Workspace membership management
-   Workspace roles: `OWNER`, `ADMIN`, `MEMBER`, and `VIEWER`
-   Backend-enforced membership and role checks
-   Protected owner-level membership operations

### Projects and tasks

-   Create, list, retrieve, and update projects
-   Create and retrieve tasks; update task fields
-   Task statuses: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`
-   Task priorities: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
-   Assignee validation against workspace membership
-   Due dates
-   Paginated task listing
-   Filtering by status, priority, and assignee
-   Search by task title
-   Sorting by creation date, due date, or priority

### Task collaboration and visibility

-   Task comments
-   Workspace labels and task-label relationships
-   Task activity timeline
-   In-app notifications, including task-assignment notifications
-   Notification read state

### Application experience

-   Dashboard with workspace, project, and notification summaries
-   Workspace and project pages
-   Task list, filters, pagination, and task details
-   Task status and priority updates
-   Member management interface
-   Comment and activity sections
-   Centralized frontend API client with authentication handling

## Architecture

``` text
┌─────────────────────────────┐
│          Browser            │
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ Next.js / React / TypeScript│
│ Pages · Components · API    │
└──────────────┬──────────────┘
               │ HTTP / JSON
               ▼
┌─────────────────────────────┐
│       Express API           │
│ Routes · Middleware         │
│ Controllers · Services      │
│ Repositories                │
└──────────────┬──────────────┘
               │ SQL
               ▼
┌─────────────────────────────┐
│         PostgreSQL          │
└─────────────────────────────┘
```

### Backend request path

``` text
HTTP request
    → Router
    → Authentication / resource authorization
    → Controller
    → Service
    → Repository
    → PostgreSQL
```

  -----------------------------------------------------------------------
  Layer                               Responsibility
  ----------------------------------- -----------------------------------
  Routes                              Declare endpoints and attach
                                      middleware

  Middleware                          Authenticate requests and enforce
                                      resource access

  Controllers                         Translate HTTP requests into
                                      service calls and responses

  Services                            Apply validation and business
                                      rules; coordinate operations

  Repositories                        Execute parameterized PostgreSQL
                                      queries

  Database                            Persist application state and
                                      enforce relational constraints
  -----------------------------------------------------------------------

This separation keeps transport concerns out of business logic and makes
database access explicit.

## Security and authorization

### Token-based authentication

WorkHub uses separate access and refresh tokens:

-   **Access token:** a short-lived JWT sent in the
    `Authorization: Bearer` header.
-   **Refresh token:** a random opaque token held in an `HttpOnly`
    cookie. The database stores a hash rather than the raw token.

Refresh-token rotation invalidates the previous token and issues a
replacement. The cookie is scoped to the authentication routes, and its
`Secure` setting is enabled in production.

### Resource access

Workspace membership is a key authorization boundary. Middleware and
service-level checks protect workspace, project, and task operations.
Member-management rules also prevent protected owner-role operations.

The frontend controls the user experience; **authorization decisions
belong to the backend**.

## Data model

The PostgreSQL schema is organized around relational entities,
including:

-   `users`
-   `workspaces`
-   `workspace_members`
-   `projects`
-   `project_members`
-   `tasks`
-   `comments`
-   `labels`
-   `task_labels`
-   `activity_logs`
-   `notifications`
-   `refresh_tokens`

Database changes are maintained as SQL migrations in
`server/db/migrations/`. The migration runner records applied migrations
and runs each migration transactionally.

## Tech stack

  Area             Technologies
  ---------------- ----------------------------------------------
  Frontend         Next.js 16, React 19, TypeScript
  Styling / UI     Tailwind CSS, shadcn/ui, Lucide React
  Backend          Node.js, Express 5, TypeScript
  Database         PostgreSQL, `pg`
  Validation       Zod
  Authentication   JSON Web Tokens, `bcryptjs`, `cookie-parser`
  Configuration    dotenv
  Containers       Docker, Docker Compose
  CI               GitHub Actions

## Repository layout

``` text
workhub/
├── client/
│   └── src/
│       ├── app/                 # Next.js routes and pages
│       ├── components/          # Shared UI and auth components
│       ├── features/            # Feature-oriented frontend modules
│       │   ├── activity/
│       │   ├── comments/
│       │   ├── labels/
│       │   ├── notifications/
│       │   ├── projects/
│       │   ├── tasks/
│       │   └── workspaces/
│       └── lib/                 # API client and shared utilities
├── server/
│   ├── src/
│   │   ├── config/              # Environment validation
│   │   ├── db/                  # PostgreSQL pool
│   │   ├── middleware/          # Auth, authorization, errors
│   │   ├── modules/             # Domain modules
│   │   └── utils/               # Shared utilities
│   └── db/
│       ├── migrations/          # Versioned SQL migrations
│       └── migrate.ts           # Migration runner
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
└── README.md
```

## Run with Docker

Docker Compose runs the frontend, API, and PostgreSQL as separate
services.

### Prerequisite

-   Docker Desktop (or Docker Engine with the Compose plugin)

### Start the stack

From the repository root:

``` bash
docker compose up --build -d
```

Check service status:

``` bash
docker compose ps
```

View API logs:

``` bash
docker compose logs -f server
```

Stop the stack:

``` bash
docker compose down
```

Local service addresses:

  Service      Local address
  ------------ -------------------------
  Web app      `http://localhost:3000`
  API          `http://localhost:5000`
  PostgreSQL   `localhost:5433`

Health check:

``` text
http://localhost:5000/api/v1/health
```

Inside the Compose network, the API connects to PostgreSQL using the
database service hostname and container port (for example,
`postgres:5432`). From the host machine, PostgreSQL is exposed on port
`5433`.

> **Configuration:** Set database credentials and JWT secrets through
> environment variables. Do not commit `.env` files or production
> secrets.

## Run locally

### Requirements

-   Node.js 22+
-   npm
-   PostgreSQL, or a running PostgreSQL container

### 1. Backend

``` bash
cd server
npm install
```

Create `server/.env`:

``` dotenv
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/workhub

JWT_ACCESS_SECRET=replace-with-a-random-secret-at-least-32-characters
JWT_REFRESH_SECRET=replace-with-another-random-secret-at-least-32-characters
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000
```

Use credentials that match your PostgreSQL instance. If you use the
Docker Compose database, use the host-mapped port and credentials
configured in Compose.

Run migrations:

``` bash
npm run db:migrate
```

Start the API:

``` bash
npm run dev
```

### 2. Frontend

In a second terminal:

``` bash
cd client
npm install
```

Create `client/.env.local`:

``` dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Start Next.js:

``` bash
npm run dev
```

Open `http://localhost:3000`.

## API overview

All routes are under `/api/v1`.

### Health

  Method   Endpoint    Purpose
  -------- ----------- ------------------
  `GET`    `/health`   API health check

### Authentication

  -----------------------------------------------------------------------
  Method                  Endpoint                Purpose
  ----------------------- ----------------------- -----------------------
  `POST`                  `/auth/register`        Register a user

  `POST`                  `/auth/login`           Log in

  `POST`                  `/auth/refresh`         Rotate refresh token
                                                  and issue an access
                                                  token

  `POST`                  `/auth/logout`          Revoke the refresh
                                                  session and clear its
                                                  cookie
  -----------------------------------------------------------------------

### Workspaces and members

  --------------------------------------------------------------------------------------------
  Method                  Endpoint                                     Purpose
  ----------------------- -------------------------------------------- -----------------------
  `GET`                   `/workspaces`                                List the current user's
                                                                       workspaces

  `POST`                  `/workspaces`                                Create a workspace

  `GET`                   `/workspaces/:workspaceId`                   Retrieve a workspace

  `GET`                   `/workspaces/:workspaceId/members`           List members

  `POST`                  `/workspaces/:workspaceId/members`           Add a member

  `PATCH`                 `/workspaces/:workspaceId/members/:userId`   Change a member's role

  `DELETE`                `/workspaces/:workspaceId/members/:userId`   Remove a member
  --------------------------------------------------------------------------------------------

### Projects

  -------------------------------------------------------------------------------------
  Method                  Endpoint                              Purpose
  ----------------------- ------------------------------------- -----------------------
  `GET`                   `/workspaces/:workspaceId/projects`   List workspace projects

  `POST`                  `/workspaces/:workspaceId/projects`   Create a project

  `GET`                   `/projects/:projectId`                Retrieve a project

  `PATCH`                 `/projects/:projectId`                Update a project
  -------------------------------------------------------------------------------------

### Tasks and task collaboration

  Method    Endpoint                       Purpose
  --------- ------------------------------ ------------------------
  `GET`     `/projects/:projectId/tasks`   List project tasks
  `POST`    `/projects/:projectId/tasks`   Create a task
  `GET`     `/tasks/:taskId`               Retrieve a task
  `PATCH`   `/tasks/:taskId`               Update a task
  `GET`     `/tasks/:taskId/comments`      List task comments
  `POST`    `/tasks/:taskId/comments`      Add a comment
  `GET`     `/tasks/:taskId/labels`        List task labels
  `GET`     `/tasks/:taskId/activity`      Retrieve task activity

### Labels and notifications

  ---------------------------------------------------------------------------------------
  Method                  Endpoint                                Purpose
  ----------------------- --------------------------------------- -----------------------
  `GET`                   `/workspaces/:workspaceId/labels`       List workspace labels

  `POST`                  `/workspaces/:workspaceId/labels`       Create a workspace
                                                                  label

  `GET`                   `/notifications`                        List the current user's
                                                                  notifications

  `PATCH`                 `/notifications/:notificationId/read`   Mark a notification as
                                                                  read
  ---------------------------------------------------------------------------------------

> This is a route overview, not a complete API specification. See the
> route files under `server/src/modules/` for exact request schemas,
> response shapes, and additional endpoints.

## Continuous integration

The GitHub Actions workflow is at `.github/workflows/ci.yml`. It
installs dependencies and runs the configured backend and frontend
checks, including production builds.

## Engineering decisions

-   **Feature-oriented modules:** domain code is grouped by capability
    rather than placed in one large application module.
-   **Layered backend:** controllers, services, and repositories have
    separate responsibilities.
-   **Runtime validation:** Zod validates environment configuration and
    request data.
-   **Parameterized SQL:** repository queries pass values separately
    from SQL text.
-   **Database migrations:** schema changes are versioned and
    repeatable.
-   **Short-lived access tokens:** access credentials are not intended
    to remain valid indefinitely.
-   **Hashed refresh tokens:** the database does not retain usable raw
    refresh tokens.
-   **Backend authorization:** UI visibility is not treated as an
    access-control mechanism.
-   **Containerized local environment:** the application can be started
    as a coordinated stack.
-   **Automated CI:** changes can be checked consistently.

## Roadmap

Potential next steps:

-   Broader integration and end-to-end test coverage
-   Production deployment and environment-specific configuration
-   File attachments and upload handling
-   Richer task-board interactions
-   Background processing for notifications
-   Structured logging, metrics, and tracing
-   Additional security and concurrency testing

## Author

**Debangsu Sahoo**

Full-stack engineering project focused on TypeScript, backend
architecture, API design, PostgreSQL, authentication, and application
delivery.

------------------------------------------------------------------------

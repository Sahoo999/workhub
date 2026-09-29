"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Loader2,
  MailPlus,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";

import { ApiError } from "@/lib/api";

import { useAuth } from "@/components/AuthProvider";

import {
  addMember,
  getMembers,
  removeMember,
  updateMemberRole,
} from "./members.api";

import type {
  WorkspaceMember,
  WorkspaceMemberRole,
} from "./member.types";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Input,
} from "@/components/ui/input";

interface MemberManagerProps {
  workspaceId: string;
}

type EditableRole = Exclude<
  WorkspaceMemberRole,
  "OWNER"
>;

const ROLE_OPTIONS: EditableRole[] = [
  "ADMIN",
  "MEMBER",
  "VIEWER",
];

const roleLabel: Record<
  WorkspaceMemberRole,
  string
> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

export default function MemberManager({
  workspaceId,
}: MemberManagerProps) {
  const {
    accessToken,
    user,
  } = useAuth();

  const [members, setMembers] =
    useState<WorkspaceMember[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [email, setEmail] =
    useState("");

  const [role, setRole] =
    useState<EditableRole>("MEMBER");

  const [adding, setAdding] =
    useState(false);

  const [actionUserId, setActionUserId] =
    useState<string | null>(null);

  const [formError, setFormError] =
    useState<string | null>(null);

  const [reloadKey, setReloadKey] =
    useState(0);

  useEffect(() => {
    if (!accessToken || !workspaceId) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const data =
          await getMembers(
            accessToken,
            workspaceId,
          );

        if (cancelled) {
          return;
        }

        setMembers(data);
        setError(null);
      } catch (error: unknown) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError(
            "Unable to load workspace members.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    accessToken,
    workspaceId,
    reloadKey,
  ]);

  const currentUserMember =
    useMemo(
      () =>
        members.find(
          (member) =>
            member.user_id === user?.id,
        ),
      [
        members,
        user?.id,
      ],
    );

  const canManageMembers =
    currentUserMember?.role === "OWNER" ||
    currentUserMember?.role === "ADMIN";

  const handleAddMember =
    async () => {
      const trimmedEmail =
        email.trim().toLowerCase();

      if (!trimmedEmail) {
        setFormError(
          "Email address is required.",
        );

        return;
      }

      if (!trimmedEmail.includes("@")) {
        setFormError(
          "Enter a valid email address.",
        );

        return;
      }

      if (!accessToken) {
        setFormError(
          "Your session has expired.",
        );

        return;
      }

      try {
        setAdding(true);
        setFormError(null);

        const newMember =
          await addMember(
            accessToken,
            workspaceId,
            {
              email: trimmedEmail,
              role,
            },
          );

        setMembers((current) => {
          const exists =
            current.some(
              (member) =>
                member.user_id ===
                newMember.user_id,
            );

          if (exists) {
            return current;
          }

          return [
            ...current,
            newMember,
          ];
        });

        setEmail("");
        setRole("MEMBER");
      } catch (error: unknown) {
        if (error instanceof ApiError) {
          setFormError(
            error.message,
          );
        } else {
          setFormError(
            "Unable to add this member.",
          );
        }
      } finally {
        setAdding(false);
      }
    };

  const handleRoleChange =
    async (
      member: WorkspaceMember,
      newRole: EditableRole,
    ) => {
      if (!accessToken) {
        return;
      }

      if (member.role === newRole) {
        return;
      }

      try {
        setActionUserId(member.user_id);
        setError(null);

        const updatedMember =
          await updateMemberRole(
            accessToken,
            workspaceId,
            member.user_id,
            newRole,
          );

        setMembers((current) =>
          current.map(
            (currentMember) =>
              currentMember.user_id ===
              updatedMember.user_id
                ? updatedMember
                : currentMember,
          ),
        );
      } catch (error: unknown) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError(
            "Unable to update member role.",
          );
        }
      } finally {
        setActionUserId(null);
      }
    };

  const handleRemoveMember =
    async (
      member: WorkspaceMember,
    ) => {
      if (!accessToken) {
        return;
      }

      const confirmed =
        window.confirm(
          `Remove ${member.name} from this workspace?`,
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionUserId(member.user_id);
        setError(null);

        await removeMember(
          accessToken,
          workspaceId,
          member.user_id,
        );

        setMembers((current) =>
          current.filter(
            (currentMember) =>
              currentMember.user_id !==
              member.user_id,
          ),
        );
      } catch (error: unknown) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError(
            "Unable to remove this member.",
          );
        }
      } finally {
        setActionUserId(null);
      }
    };

  const handleRetry = () => {
    setLoading(true);
    setError(null);

    setReloadKey(
      (current) => current + 1,
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex min-h-[280px] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading members...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />

            <h2 className="text-xl font-semibold tracking-tight">
              Members
            </h2>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            People who have access to this workspace.
          </p>
        </div>

        <Badge variant="secondary">
          {members.length}{" "}
          {members.length === 1
            ? "member"
            : "members"}
        </Badge>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p
            role="alert"
            className="text-sm text-destructive"
          >
            {error}
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRetry}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Add member */}
      {canManageMembers && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Add a member
            </CardTitle>

            <CardDescription>
              Add an existing WorkHub user to this
              workspace.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
              <Input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(
                    event.target.value,
                  );
                  setFormError(null);
                }}
                placeholder="teammate@example.com"
                disabled={adding}
              />

              <select
                value={role}
                disabled={adding}
                onChange={(event) => {
                  setRole(
                    event.target.value as EditableRole,
                  );
                  setFormError(null);
                }}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {ROLE_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {roleLabel[option]}
                    </option>
                  ),
                )}
              </select>

              <Button
                type="button"
                disabled={
                  adding ||
                  !email.trim()
                }
                onClick={() => {
                  void handleAddMember();
                }}
              >
                {adding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <MailPlus className="mr-2 h-4 w-4" />
                    Add member
                  </>
                )}
              </Button>
            </div>

            {formError && (
              <p
                role="alert"
                className="mt-3 text-sm text-destructive"
              >
                {formError}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Member list */}
      <Card>
        <CardContent className="p-0">
          {members.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>

              <p className="mt-4 font-medium">
                No members found
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Add a teammate to collaborate in
                this workspace.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {members.map(
                (member) => {
                  const isCurrentUser =
                    member.user_id ===
                    user?.id;

                  const isOwner =
                    member.role ===
                    "OWNER";

                  const busy =
                    actionUserId ===
                    member.user_id;

                  return (
                    <div
                      key={member.user_id}
                      className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                          {member.name
                            .trim()
                            .charAt(0)
                            .toUpperCase() ||
                            "U"}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-medium">
                              {member.name}
                            </p>

                            {isCurrentUser && (
                              <Badge
                                variant="outline"
                                className="text-[10px]"
                              >
                                You
                              </Badge>
                            )}
                          </div>

                          <p className="truncate text-sm text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Badge
                          variant={
                            isOwner
                              ? "default"
                              : "secondary"
                          }
                        >
                          {
                            roleLabel[
                              member.role
                            ]
                          }
                        </Badge>

                        {canManageMembers &&
                          !isOwner &&
                          !isCurrentUser && (
                            <>
                              <select
                                value={
                                  member.role
                                }
                                disabled={busy}
                                onChange={(
                                  event,
                                ) => {
                                  void handleRoleChange(
                                    member,
                                    event
                                      .target
                                      .value as EditableRole,
                                  );
                                }}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                              >
                                {ROLE_OPTIONS.map(
                                  (
                                    option,
                                  ) => (
                                    <option
                                      key={
                                        option
                                      }
                                      value={
                                        option
                                      }
                                    >
                                      {
                                        roleLabel[
                                          option
                                        ]
                                      }
                                    </option>
                                  ),
                                )}
                              </select>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={busy}
                                onClick={() => {
                                  void handleRemoveMember(
                                    member,
                                  );
                                }}
                                aria-label={`Remove ${member.name}`}
                              >
                                {busy ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                )}
                              </Button>
                            </>
                          )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
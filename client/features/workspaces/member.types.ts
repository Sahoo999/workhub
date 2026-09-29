export type WorkspaceMemberRole =
  | "OWNER"
  | "ADMIN"
  | "MEMBER"
  | "VIEWER";

export interface WorkspaceMember {
  user_id: string;
  name: string;
  email: string;
  role: WorkspaceMemberRole;
  joined_at: string;
}
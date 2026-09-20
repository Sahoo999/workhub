"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const {
    user,
    loading,
  } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return <p>Loading session...</p>;
  }

  if (!user) {
    return null;
  }

  return children;
}
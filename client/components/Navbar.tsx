"use client";

import Link from "next/link";

import { useAuth } from "@/components/AuthProvider";

export default function Navbar() {
  const {
    user,
    logout,
  } = useAuth();

  return (
    <nav>
      <Link href="/">
        WorkHub
      </Link>

      <div>
        {user ? (
          <>
            <Link href="/dashboard">
              Dashboard
            </Link>

            <button onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">
              Login
            </Link>

            <Link href="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
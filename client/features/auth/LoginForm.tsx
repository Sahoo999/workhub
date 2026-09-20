"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  loginFormSchema
} from "./auth.schema";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

export default function LoginForm() {
  const router = useRouter();

  const { login } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    const result =
      loginFormSchema.safeParse({
        email,
        password,
      });

    if (!result.success) {
      setError(
        result.error.issues[0]?.message ??
          "Invalid login data",
      );

      return;
    }

    try {
      setLoading(true);

      await login(
        result.data.email,
        result.data.password,
      );

      router.push("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError(
          "Unable to login. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">
          Email
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          required
        />
      </div>

      <div>
        <label htmlFor="password">
          Password
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          required
        />
      </div>

      {error && (
        <p role="alert">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
      >
        {loading
          ? "Logging in..."
          : "Login"}
      </button>
    </form>
  );
}
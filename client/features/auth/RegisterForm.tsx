"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  registerFormSchema,
} from "./auth.schema";

import {
  ApiError,
} from "@/lib/api";

import { useAuth } from "@/components/AuthProvider";

export default function RegisterForm() {
  const router = useRouter();

  const { register } = useAuth();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
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
      registerFormSchema.safeParse({
        name,
        email,
        password,
        confirmPassword,
      });

    if (!result.success) {
      setError(
        result.error.issues[0]?.message ??
          "Invalid form data",
      );

      return;
    }

    try {
      setLoading(true);

      await register(
        result.data.name,
        result.data.email,
        result.data.password,
      );

      router.push("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError(
          "Something went wrong. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">
          Name
        </label>

        <input
          id="name"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          required
        />
      </div>

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

      <div>
        <label htmlFor="confirmPassword">
          Confirm Password
        </label>

        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) =>
            setConfirmPassword(
              event.target.value,
            )
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
          ? "Creating account..."
          : "Create account"}
      </button>
    </form>
  );
}
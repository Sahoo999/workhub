"use client";

import { useState } from "react";

import type { FormEvent } from "react";

import { useRouter } from "next/navigation";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
  Loader2,
  Check,
  X,
} from "lucide-react";

import { registerFormSchema } from "./auth.schema";

import { ApiError } from "@/lib/api";

import { useAuth } from "@/components/AuthProvider";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

export default function RegisterForm() {
  const router = useRouter();

  const { register } = useAuth();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const passwordMismatch =
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = registerFormSchema.safeParse({
      name,
      email,
      password,
    });

    if (!result.success) {
      setError(
        result.error.issues[0]?.message ??
          "Please check your registration details.",
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
          "Unable to create your account. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="name"
          className="text-sm font-medium"
        >
          Full name
        </label>

        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="name"
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            disabled={loading}
            autoComplete="name"
            autoFocus
            className="h-11 pl-10"
            aria-label="Full name"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium"
        >
          Email address
        </label>

        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
            disabled={loading}
            autoComplete="email"
            className="h-11 pl-10"
            aria-label="Email address"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium"
        >
          Password
        </label>

        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="password"
            type={
              showPassword ? "text" : "password"
            }
            placeholder="Create a password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            disabled={loading}
            autoComplete="new-password"
            className="h-11 pl-10 pr-10"
            aria-label="Password"
            required
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (current) => !current,
              )
            }
            disabled={loading}
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium"
        >
          Confirm password
        </label>

        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="confirmPassword"
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(
                event.target.value,
              );
              setError("");
            }}
            disabled={loading}
            autoComplete="new-password"
            className="h-11 pl-10 pr-10"
            aria-label="Confirm password"
            aria-invalid={passwordMismatch}
            required
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(
                (current) => !current,
              )
            }
            disabled={loading}
            aria-label={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {confirmPassword.length > 0 && (
          <div
            className={`flex items-center gap-1.5 text-xs ${
              passwordsMatch
                ? "text-green-600"
                : "text-destructive"
            }`}
          >
            {passwordsMatch ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}

            {passwordsMatch
              ? "Passwords match"
              : "Passwords do not match"}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={
          loading ||
          !name.trim() ||
          !email.trim() ||
          !password ||
          !confirmPassword ||
          password !== confirmPassword
        }
        className="h-11 w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Your account is protected by WorkHub
        authentication.
      </p>
    </form>
  );
}
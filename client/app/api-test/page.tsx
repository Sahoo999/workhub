"use client";

import {
  useEffect,
  useState,
} from "react";

import { ApiError, api } from "@/lib/api";

type HealthResponse = {
  success: boolean;
  message: string;
};

export default function ApiTestPage() {
  const [data, setData] =
    useState<HealthResponse | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    const testBackend = async () => {
      try {
        const response =
          await api.get<HealthResponse>(
            "/health",
          );

        if (cancelled) {
          return;
        }

        setData(response.data);
        setError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError(
            "Unable to connect to backend.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void testBackend();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">
        Backend Connection
      </h1>

      {loading && (
        <p className="mt-4">
          Checking backend...
        </p>
      )}

      {error && (
        <p
          className="mt-4 text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      {data && (
        <div className="mt-4">
          <p>
            Success:{" "}
            {data.success
              ? "Yes"
              : "No"}
          </p>

          <p>
            Message: {data.message}
          </p>
        </div>
      )}
    </main>
  );
}
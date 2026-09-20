"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { api, setUnauthorizedHandler, } from "@/lib/api";

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;

  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;

  login: (
    email: string,
    password: string,
  ) => Promise<void>;

  refreshSession: () => Promise<void>;

  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [accessToken, setAccessToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const loadCurrentUser = useCallback(
  async (token: string) => {
    const response = await api.get<AuthUser>(
      "/users/me",
      token,
    );

    setUser(response.data);
  },
  [],
);

  const register = async (
    name: string,
    email: string,
    password: string,
  ) => {
    const response = await api.post<{
      user: AuthUser;
      accessToken: string;
    }>("/auth/register", {
      name,
      email,
      password,
    });

    setUser(response.data.user);
    setAccessToken(
      response.data.accessToken,
    );
  };

  const login = async (
    email: string,
    password: string,
  ) => {
    const response = await api.post<{
      user: AuthUser;
      accessToken: string;
    }>("/auth/login", {
      email,
      password,
    });

    setUser(response.data.user);
    setAccessToken(
      response.data.accessToken,
    );
  };

  const refreshSession = useCallback(async () => {
  try {
    const response =
      await api.post<{
        accessToken: string;
      }>(
        "/auth/refresh",
        {},
        undefined,
        false,
      );

    const token =
      response.data.accessToken;

    setAccessToken(token);

    await loadCurrentUser(token);
  } catch {
    setAccessToken(null);
    setUser(null);
  }
}, [loadCurrentUser]);

  const logout = async () => {
    try {
      await api.post("/auth/logout", {});
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      await refreshSession();
      setLoading(false);
    };

    void initializeAuth();
  }, [refreshSession]);

  useEffect(() => {
  setUnauthorizedHandler(
    async () => {
      try {
        const response =
  await api.post<{
    accessToken: string;
  }>(
    "/auth/refresh",
    {},
    undefined,
    false,
  );

        const token =
          response.data.accessToken;

        setAccessToken(token);

        await loadCurrentUser(token);

        return token;
      } catch {
        setUser(null);
        setAccessToken(null);

        return null;
      }
    },
  );
}, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        register,
        login,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
};

 // gloal auth handler in client
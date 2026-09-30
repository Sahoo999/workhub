import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import request from "supertest";

import app from "./app.js";

vi.mock(
  "./modules/auth/auth.service.js",
  () => ({
    login: vi.fn(),
    register: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
  }),
);

import * as authService from "./modules/auth/auth.service.js";

describe("GET /api/v1/health", () => {
  it("returns a healthy API response", async () => {
    const response =
      await request(app)
        .get("/api/v1/health")
        .expect(200);

    expect(response.body).toEqual({
      success: true,
      message: "WorkHub API is healthy",
    });
  });
});

describe("GET /api/v1/notifications", () => {
  it("rejects requests without authentication", async () => {
    const response =
      await request(app)
        .get("/api/v1/notifications")
        .expect(401);

    expect(response.body.success).toBe(false);
  });
});

describe("POST /api/v1/auth/login", () => {
  it("logs in and returns an access token with a refresh cookie", async () => {
    vi.mocked(
      authService.login,
    ).mockResolvedValue({
      user: {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
      },
      accessToken: "test-access-token",
      refreshToken: "test-refresh-token",
    });

    const response =
      await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        })
        .expect(200);

    expect(response.body).toEqual({
      success: true,
      data: {
        user: {
          id: "user-1",
          name: "Test User",
          email: "test@example.com",
        },
        accessToken: "test-access-token",
      },
    });

      
    const setCookies =
  response.headers["set-cookie"];

if (
  typeof setCookies !== "string" &&
  !Array.isArray(setCookies)
) {
  throw new Error(
    "Expected refresh token cookie",
  );
}

const cookies = Array.isArray(setCookies)
  ? setCookies
  : [setCookies];

expect(
  cookies.some((cookie) =>
    cookie.startsWith(
      "refreshToken=test-refresh-token",
    ),
  ),
).toBe(true);

    expect(
      authService.login,
    ).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });
});

describe("POST /api/v1/auth/refresh", () => {
  it("refreshes the session when a refresh token cookie is provided", async () => {
    vi.mocked(
      authService.refresh,
    ).mockResolvedValue({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });

    const response =
      await request(app)
        .post("/api/v1/auth/refresh")
        .set(
          "Cookie",
          "refreshToken=old-refresh-token",
        )
        .expect(200);

    expect(response.body).toEqual({
      success: true,
      data: {
        accessToken: "new-access-token",
      },
    });

    const setCookies =
      response.headers["set-cookie"];

    if (
      typeof setCookies !== "string" &&
      !Array.isArray(setCookies)
    ) {
      throw new Error(
        "Expected refresh token cookie",
      );
    }

    const cookies = Array.isArray(
      setCookies,
    )
      ? setCookies
      : [setCookies];

    expect(
      cookies.some((cookie) =>
        cookie.startsWith(
          "refreshToken=new-refresh-token",
        ),
      ),
    ).toBe(true);

    expect(
      authService.refresh,
    ).toHaveBeenCalledWith(
      "old-refresh-token",
    );
  });

  it("rejects refresh when the cookie is missing", async () => {
    const response =
      await request(app)
        .post("/api/v1/auth/refresh")
        .expect(401);

    expect(response.body.success).toBe(false);

    expect(
      authService.refresh,
    ).not.toHaveBeenCalled();
  });
});
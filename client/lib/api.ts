const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not configured",
  );
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

const request = async <T>(
  path: string,
  options: RequestOptions = {},
  accessToken?: string,
): Promise<ApiSuccess<T>> => {
  const headers = new Headers(options.headers);

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set(
      "Authorization",
      `Bearer ${accessToken}`,
    );
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
      credentials: "include",  // tells the browser to automatically attach security cookies
                            //  and session tokens whenever you communicate with your backend server
      body:
        options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
    },
  );

  const json = await response.json();

  if (!response.ok) {
    const error = json as ApiErrorResponse;

    throw new ApiError(
      response.status,
      error.error?.code ?? "UNKNOWN_ERROR",
      error.error?.message ?? "Request failed",
      error.error?.details,
    );
  }

  return json as ApiSuccess<T>;
};

export const api = {
  get: <T>(
    path: string,
    accessToken?: string,
  ) =>
    request<T>(
      path,
      {
        method: "GET",
      },
      accessToken,
    ),

  post: <T>(
    path: string,
    body: unknown,
    accessToken?: string,
  ) =>
    request<T>(
      path,
      {
        method: "POST",
        body,
      },
      accessToken,
    ),

  patch: <T>(
    path: string,
    body: unknown,
    accessToken?: string,
  ) =>
    request<T>(
      path,
      {
        method: "PATCH",
        body,
      },
      accessToken,
    ),
};
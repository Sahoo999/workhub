const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not configured",
  );
}

// fetching data
export const api = {
  get: async <T>(path: string): Promise<T> => {
    const response = await fetch(
      `${API_URL}${path}`,
    );

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status}`,
      );
    }

    return response.json() as Promise<T>;
  },


// sending data
  post: async <T>(
    path: string,
    body: unknown,
  ): Promise<T> => {
    const response = await fetch(
      `${API_URL}${path}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        credentials: "include",     // tells the browser to automatically attach security cookies
                                  //  and session tokens whenever you communicate with your backend server
      },
    );

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status}`,
      );
    }

    return response.json() as Promise<T>;
  },
};
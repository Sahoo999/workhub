import { api } from "@/lib/api";

type HealthResponse = {
  success: boolean;
  message: string;
};

export default async function ApiTestPage() {
  const data =
    await api.get<HealthResponse>("/health");

  return (
    <main>
      <h1>Backend Connection</h1>
      <p>{data.success}</p>
    </main>
  );
} 
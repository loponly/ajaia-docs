export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

// JSON in/out; a FormData body is sent as multipart. Non-2xx throws ApiError with the server's message.
export async function api<T = unknown>(path: string, method = "GET", body?: unknown): Promise<T> {
  const isForm = body instanceof FormData;
  const res = await fetch(path, {
    method,
    headers: body === undefined || isForm ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? res.statusText, res.status);
  return data as T;
}

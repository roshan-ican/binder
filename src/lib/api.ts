const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

/** Shared transport; feature modules own endpoint contracts and response handling. */
export function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`${apiUrl}${path}`, options);
}

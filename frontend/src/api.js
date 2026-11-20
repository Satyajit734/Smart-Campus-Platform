const API_URL = "http://localhost:5000/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("campus_token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export function saveSession(token, user) {
  localStorage.setItem("campus_token", token);
  localStorage.setItem("campus_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("campus_token");
  localStorage.removeItem("campus_user");
}

export function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("campus_user") || "null");
  } catch {
    return null;
  }
}

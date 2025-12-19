const ACCESS_KEY = "auth:access";
const REFRESH_KEY = "auth:refresh";

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function tryRefreshToken() {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) return null;

  // Try the common refresh endpoints (your backend will match one of them)
  const candidates = [
    { url: "/api/auth/refresh/", body: { refresh } },
    { url: "/api/token/refresh/", body: { refresh } },
    { url: "/api/auth/refresh/", body: { refresh_token: refresh } },
    { url: "/api/token/refresh/", body: { refresh_token: refresh } },
  ];

  for (const c of candidates) {
    const res = await fetch(c.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c.body),
    });

    const data = await safeJson(res);

    if (res.ok) {
      const newAccess = data?.access || data?.accessToken || data?.token;
      if (newAccess) {
        localStorage.setItem(ACCESS_KEY, newAccess);
        return newAccess;
      }
    }
  }

  return null;
}

export async function authFetch(url, options = {}) {
  const token = localStorage.getItem(ACCESS_KEY);

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res = await fetch(url, { ...options, headers });

  // If access expired, refresh and retry once
  if (res.status === 401) {
    const newAccess = await tryRefreshToken();

    if (!newAccess) {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      throw new Error("Session expired. Please login again.");
    }

    const retryHeaders = {
      ...(options.headers || {}),
      Authorization: `Bearer ${newAccess}`,
    };

    res = await fetch(url, { ...options, headers: retryHeaders });
  }

  return res;
}

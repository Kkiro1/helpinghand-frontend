// src/utils/authFetch.js

function safeJson(res) {
  return res.json().catch(() => null);
}

function extractErrorMessage(data, fallback = "Request failed") {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.message) return data.message;

  // DRF validation errors: {field: ["msg"]}
  if (typeof data === "object") {
    return Object.entries(data)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
      .join(" | ");
  }

  return fallback;
}

async function tryRefreshToken(refreshUrl, refreshToken) {
  // Attempt #1: SimpleJWT common format { refresh: "..." }
  let res = await fetch(refreshUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  let data = await safeJson(res);

  // Attempt #2: some backends use refresh_token
  if (!res.ok) {
    res = await fetch(refreshUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    data = await safeJson(res);
  }

  if (!res.ok) return { ok: false, data };

  // Accept multiple response shapes:
  // - { access: "..." }
  // - { tokens: { access, refresh } }
  const newAccess = data?.access || data?.tokens?.access;
  const newRefresh = data?.refresh || data?.tokens?.refresh;

  if (newAccess) localStorage.setItem("auth:access", newAccess);
  if (newRefresh) localStorage.setItem("auth:refresh", newRefresh);

  return { ok: !!newAccess, data };
}

/**
 * authFetch(url, options, config?)
 * - Automatically adds Authorization header (Bearer access)
 * - On 401 tries refresh and retries once
 * - If refresh fails -> clears tokens + throws error with status=401
 */
export default async function authFetch(
  url,
  options = {},
  config = { refreshUrl: "/api/auth/refresh/" }
) {
  const access = localStorage.getItem("auth:access");
  const refresh = localStorage.getItem("auth:refresh");

  const headers = new Headers(options.headers || {});
  if (access && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${access}`);
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status !== 401) return res;

  // 401: try refresh once
  if (!refresh) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }

  const refreshUrl = config?.refreshUrl || "/api/auth/refresh/";
  const refreshResult = await tryRefreshToken(refreshUrl, refresh);

  if (!refreshResult.ok) {
    // refresh failed -> clear session
    localStorage.removeItem("auth:access");
    localStorage.removeItem("auth:refresh");
    localStorage.removeItem("auth:user");
    localStorage.removeItem("userData");

    const err = new Error(
      extractErrorMessage(
        refreshResult.data,
        "Session expired. Please login again."
      )
    );
    err.status = 401;
    throw err;
  }

  // retry request with new access
  const newAccess = localStorage.getItem("auth:access");
  const retryHeaders = new Headers(options.headers || {});
  if (newAccess) retryHeaders.set("Authorization", `Bearer ${newAccess}`);

  return fetch(url, { ...options, headers: retryHeaders });
}

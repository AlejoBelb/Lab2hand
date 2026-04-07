// client/src/lib/api/http.js

const BASE_URL = import.meta.env.VITE_API_BASE || "http://127.0.0.1:4001";

const LS_ACCESS  = 'lab2hand_at';
const LS_REFRESH = 'lab2hand_rt';

let accessToken  = localStorage.getItem(LS_ACCESS)  || null;
let refreshToken = localStorage.getItem(LS_REFRESH) || null;
let isRefreshing = false;
let refreshPromise = null;

export const http = {
  BASE_URL,

  async request(method, url, body, _isRetry = false) {
    const headers = { "Content-Type": "application/json" };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await fetch(`${BASE_URL}${url}`, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });

    // Si recibimos 401 y tenemos refresh token, intentar renovar una vez
    if (res.status === 401 && !_isRetry && refreshToken) {
      const refreshed = await this._tryRefresh();
      if (refreshed) {
        // Reintentar la petición original con el nuevo token
        return this.request(method, url, body, true);
      }
    }

    return res;
  },

  // Intenta renovar el access token usando el refresh token
  async _tryRefresh() {
    // Si ya hay un refresh en curso, esperar a que termine
    if (isRefreshing) {
      return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) {
          this.clearTokens();
          return false;
        }

        const data = await res.json();
        this.setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || refreshToken,
        });
        return true;
      } catch {
        this.clearTokens();
        return false;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  get(url)         { return this.request("GET",    url);       },
  post(url, body)  { return this.request("POST",   url, body); },
  patch(url, body) { return this.request("PATCH",  url, body); },
  delete(url)      { return this.request("DELETE", url);       },

  setTokens({ accessToken: at, refreshToken: rt }) {
    accessToken  = at;
    refreshToken = rt;
    if (at) localStorage.setItem(LS_ACCESS,  at);
    else    localStorage.removeItem(LS_ACCESS);
    if (rt) localStorage.setItem(LS_REFRESH, rt);
    else    localStorage.removeItem(LS_REFRESH);
  },

  clearTokens() {
    accessToken  = null;
    refreshToken = null;
    localStorage.removeItem(LS_ACCESS);
    localStorage.removeItem(LS_REFRESH);
  },

  getAccessToken()  { return accessToken;  },
  getRefreshToken() { return refreshToken; },
};
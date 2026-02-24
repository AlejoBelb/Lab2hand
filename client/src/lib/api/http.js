// client/src/lib/api/http.js

const BASE_URL = import.meta.env.VITE_API_BASE || "http://127.0.0.1:4001";

const LS_ACCESS  = 'lab2hand_at';
const LS_REFRESH = 'lab2hand_rt';

let accessToken  = localStorage.getItem(LS_ACCESS)  || null;
let refreshToken = localStorage.getItem(LS_REFRESH) || null;

export const http = {
  BASE_URL,

  async request(method, url, body) {
    const headers = { "Content-Type": "application/json" };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await fetch(`${BASE_URL}${url}`, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });

    return res;
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
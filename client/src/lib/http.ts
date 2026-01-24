// client/src/lib/http.ts
// Instancia de Axios para consumir el API con envío de cookies y baseURL.

import axios from 'axios';
import { ENV } from '../config/env';

export const http = axios.create({
  baseURL: ENV.API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

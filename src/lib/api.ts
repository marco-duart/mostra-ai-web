import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "https://mostraai-api.com.br",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});
import axios from 'axios';

// Em dev, usa caminho relativo (o Vite faz proxy de /api para o backend).
// Em producao (front e back em dominios separados), defina VITE_API_URL
// com a URL completa da API, ex: https://quadra-backend.onrender.com/api
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

const STORAGE_KEY = 'quadra.auth';

export function carregarAuth() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

export function salvarAuth(auth) {
  if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  else localStorage.removeItem(STORAGE_KEY);
}

// Injeta o token em toda requisicao.
api.interceptors.request.use((config) => {
  const auth = carregarAuth();
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// Extrai uma mensagem de erro amigavel da resposta da API.
export function mensagemErro(err, fallback = 'Algo deu errado. Tente novamente.') {
  return err?.response?.data?.error || fallback;
}

import axios from 'axios';

// Usa caminho relativo: o Vite faz proxy de /api para o backend (porta 3333).
export const api = axios.create({
  baseURL: '/api',
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

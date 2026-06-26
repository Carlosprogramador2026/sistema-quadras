import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { api, carregarAuth, salvarAuth } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => carregarAuth());

  const persistir = useCallback((novo) => {
    salvarAuth(novo);
    setAuth(novo);
  }, []);

  const loginCliente = useCallback(
    async (credenciais) => {
      const { data } = await api.post('/clientes/login', credenciais);
      persistir({ ...data, role: 'CLIENTE' });
      return data;
    },
    [persistir]
  );

  const cadastrar = useCallback(
    async (dados) => {
      const { data } = await api.post('/clientes', dados);
      persistir({ ...data, role: 'CLIENTE' });
      return data;
    },
    [persistir]
  );

  const loginGestor = useCallback(
    async (credenciais) => {
      const { data } = await api.post('/gestores/login', credenciais);
      persistir({ ...data, role: 'GESTOR' });
      return data;
    },
    [persistir]
  );

  const logout = useCallback(() => persistir(null), [persistir]);

  const value = useMemo(
    () => ({
      auth,
      usuario: auth?.usuario || null,
      role: auth?.role || null,
      isCliente: auth?.role === 'CLIENTE',
      isGestor: auth?.role === 'GESTOR',
      loginCliente,
      cadastrar,
      loginGestor,
      logout,
    }),
    [auth, loginCliente, cadastrar, loginGestor, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}

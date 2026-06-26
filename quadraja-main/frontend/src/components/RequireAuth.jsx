import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';

// Protege rotas por papel. Redireciona para o login correto se nao autorizado.
export function RequireAuth({ role, children }) {
  const { auth } = useAuth();
  const location = useLocation();

  const loginPath = role === 'GESTOR' ? '/admin/login' : '/login';

  if (!auth?.token) {
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }
  if (role && auth.role !== role) {
    // Logado com papel errado: manda para a area correta.
    return <Navigate to={auth.role === 'GESTOR' ? '/admin' : '/'} replace />;
  }
  return children;
}

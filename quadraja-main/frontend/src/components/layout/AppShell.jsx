import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo.jsx';
import { Container } from './Container.jsx';
import { useAuth } from '../../lib/auth.jsx';

const navItens = [
  { to: '/', label: 'Reservar', end: true },
  { to: '/minhas-reservas', label: 'Minhas reservas' },
];

// Shell do cliente: navbar no topo (sem sidebar), conteudo centralizado.
export function AppShell({ children }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function sair() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link to="/">
            <Logo />
          </Link>

          <nav className="flex items-center gap-1">
            {navItens.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-slate-600 sm:inline">
              {usuario?.nome?.split(' ')[0]}
            </span>
            <button
              onClick={sair}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              Sair
            </button>
          </div>
        </Container>
      </header>

      <main className="flex-1 py-6 sm:py-8">
        <Container>{children}</Container>
      </main>
    </div>
  );
}

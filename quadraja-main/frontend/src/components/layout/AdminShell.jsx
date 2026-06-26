import { NavLink, useNavigate } from 'react-router-dom';
import { Logo } from './Logo.jsx';
import { useAuth } from '../../lib/auth.jsx';

const Icon = ({ path }) => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d={path} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const navItens = [
  { to: '/admin', label: 'Painel', end: true, icon: 'M3 12l9-9 9 9M5 10v10h14V10' },
  { to: '/admin/pendencias', label: 'Pendências', icon: 'M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { to: '/admin/visao-geral', label: 'Agenda', icon: 'M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z' },
  { to: '/admin/quadras', label: 'Quadras', icon: 'M4 5h16v14H4zM12 5v14M4 9h4M4 15h4M16 9h4M16 15h4' },
];

function ItemLink({ item, mobile }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        mobile
          ? `flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
              isActive ? 'text-primary-600' : 'text-slate-400'
            }`
          : `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-primary-500/15 text-primary-300'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`
      }
    >
      <Icon path={item.icon} />
      {item.label}
    </NavLink>
  );
}

// Shell do gestor: sidebar fixa no desktop, bottom-nav no mobile.
export function AdminShell({ children }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function sair() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-pitch-950 p-4 lg:flex">
        <div className="px-2 py-3">
          <Logo light />
        </div>
        <nav className="mt-4 flex flex-1 flex-col gap-1">
          {navItens.map((item) => (
            <ItemLink key={item.to} item={item} />
          ))}
        </nav>
        <div className="border-t border-white/10 pt-4">
          <p className="px-3 text-xs text-slate-400">Conectado como</p>
          <p className="px-3 text-sm font-semibold text-white">{usuario?.nome}</p>
          <button
            onClick={sair}
            className="mt-2 w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Topbar mobile */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-pitch-950 px-4 lg:hidden">
        <Logo light />
        <button
          onClick={sair}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10"
        >
          Sair
        </button>
      </header>

      {/* Conteudo */}
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-24 sm:px-6 lg:pb-10">{children}</main>
      </div>

      {/* Bottom-nav mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white lg:hidden">
        {navItens.map((item) => (
          <ItemLink key={item.to} item={item} mobile />
        ))}
      </nav>
    </div>
  );
}

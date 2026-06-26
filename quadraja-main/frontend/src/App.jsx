import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth.jsx';
import { AppShell } from './components/layout/AppShell.jsx';
import { AdminShell } from './components/layout/AdminShell.jsx';

import { LoginCliente } from './features/auth/LoginCliente.jsx';
import { Cadastro } from './features/auth/Cadastro.jsx';
import { LoginGestor } from './features/auth/LoginGestor.jsx';

import { Horarios } from './features/cliente/Horarios.jsx';
import { MinhasReservas } from './features/cliente/MinhasReservas.jsx';

import { Dashboard } from './features/admin/Dashboard.jsx';
import { Pendencias } from './features/admin/Pendencias.jsx';
import { VisaoGeral } from './features/admin/VisaoGeral.jsx';
import { Quadras } from './features/admin/Quadras.jsx';

const cliente = (el) => (
  <RequireAuth role="CLIENTE">
    <AppShell>{el}</AppShell>
  </RequireAuth>
);

const gestor = (el) => (
  <RequireAuth role="GESTOR">
    <AdminShell>{el}</AdminShell>
  </RequireAuth>
);

export default function App() {
  return (
    <Routes>
      {/* Autenticacao */}
      <Route path="/login" element={<LoginCliente />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/admin/login" element={<LoginGestor />} />

      {/* Cliente */}
      <Route path="/" element={cliente(<Horarios />)} />
      <Route path="/minhas-reservas" element={cliente(<MinhasReservas />)} />

      {/* Gestor */}
      <Route path="/admin" element={gestor(<Dashboard />)} />
      <Route path="/admin/pendencias" element={gestor(<Pendencias />)} />
      <Route path="/admin/visao-geral" element={gestor(<VisaoGeral />)} />
      <Route path="/admin/quadras" element={gestor(<Quadras />)} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

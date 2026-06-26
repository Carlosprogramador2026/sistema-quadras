import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Field } from '../../components/ui/Input.jsx';
import { useAuth } from '../../lib/auth.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { mensagemErro } from '../../lib/api.js';

export function LoginGestor() {
  const { loginGestor } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await loginGestor(form);
      navigate('/admin');
    } catch (err) {
      toast(mensagemErro(err, 'Não foi possível entrar.'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Painel do gestor"
      subtitle="Acesso restrito à administração da quadra."
      footer={
        <Link to="/login" className="text-xs text-slate-400 hover:text-slate-600">
          Sou cliente
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="E-mail" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={onChange} placeholder="gestor@quadra.com" />
        </Field>
        <Field label="Senha" htmlFor="senha">
          <Input id="senha" name="senha" type="password" autoComplete="current-password" required value={form.senha} onChange={onChange} placeholder="••••••••" />
        </Field>
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Entrar no painel
        </Button>
      </form>
    </AuthLayout>
  );
}

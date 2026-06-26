import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Field } from '../../components/ui/Input.jsx';
import { useAuth } from '../../lib/auth.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { mensagemErro } from '../../lib/api.js';

export function LoginCliente() {
  const { loginCliente } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await loginCliente(form);
      navigate('/');
    } catch (err) {
      toast(mensagemErro(err, 'Não foi possível entrar.'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse para reservar seus horários."
      footer={
        <>
          Não tem conta?{' '}
          <Link to="/cadastro" className="font-semibold text-primary-600 hover:underline">
            Cadastre-se
          </Link>
          <div className="mt-2">
            <Link to="/admin/login" className="text-xs text-slate-400 hover:text-slate-600">
              Sou o gestor da quadra
            </Link>
          </div>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="E-mail" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={onChange} placeholder="voce@email.com" />
        </Field>
        <Field label="Senha" htmlFor="senha">
          <Input id="senha" name="senha" type="password" autoComplete="current-password" required value={form.senha} onChange={onChange} placeholder="••••••••" />
        </Field>
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Entrar
        </Button>
      </form>
    </AuthLayout>
  );
}

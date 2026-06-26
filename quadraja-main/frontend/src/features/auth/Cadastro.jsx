import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Field } from '../../components/ui/Input.jsx';
import { useAuth } from '../../lib/auth.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { mensagemErro } from '../../lib/api.js';

export function Cadastro() {
  const { cadastrar } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', senha: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await cadastrar(form);
      toast('Cadastro realizado! Bem-vindo 👋', 'success');
      navigate('/');
    } catch (err) {
      toast(mensagemErro(err, 'Não foi possível cadastrar.'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Leva menos de um minuto."
      footer={
        <>
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Nome completo" htmlFor="nome">
          <Input id="nome" name="nome" required value={form.nome} onChange={onChange} placeholder="Seu nome" />
        </Field>
        <Field label="Telefone (WhatsApp)" htmlFor="telefone">
          <Input id="telefone" name="telefone" inputMode="tel" required value={form.telefone} onChange={onChange} placeholder="5511999998888" />
        </Field>
        <Field label="E-mail" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={onChange} placeholder="voce@email.com" />
        </Field>
        <Field label="Senha" htmlFor="senha">
          <Input id="senha" name="senha" type="password" autoComplete="new-password" required minLength={6} value={form.senha} onChange={onChange} placeholder="mínimo 6 caracteres" />
        </Field>
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Criar conta
        </Button>
      </form>
    </AuthLayout>
  );
}

import { useEffect, useState } from 'react';
import { api, mensagemErro } from '../../lib/api.js';
import { Card, CardBody, CardHeader } from '../../components/ui/Card.jsx';
import { Input, Select } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

const VAZIO = { codigo: '', tipo: 'PERCENTUAL', valor: '', validoAte: '', usosMaximos: '' };

export function Cupons() {
  const toast = useToast();
  const [cupons, setCupons] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState(VAZIO);
  const [criando, setCriando] = useState(false);
  const [alternandoId, setAlternandoId] = useState(null);

  function carregar() {
    setCarregando(true);
    api
      .get('/cupons')
      .then(({ data }) => setCupons(data))
      .catch((err) => toast(mensagemErro(err), 'error'))
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, [toast]);

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function criar(e) {
    e.preventDefault();
    if (!form.codigo.trim() || !form.valor) return;
    setCriando(true);
    try {
      const { data } = await api.post('/cupons', {
        codigo: form.codigo.trim(),
        tipo: form.tipo,
        valor: Number(form.valor),
        validoAte: form.validoAte || undefined,
        usosMaximos: form.usosMaximos ? Number(form.usosMaximos) : undefined,
      });
      setCupons((prev) => [data, ...prev]);
      setForm(VAZIO);
      toast('Cupom criado ✅', 'success');
    } catch (err) {
      toast(mensagemErro(err), 'error');
    } finally {
      setCriando(false);
    }
  }

  async function alternarAtivo(c) {
    setAlternandoId(c.id);
    try {
      const { data } = await api.patch(`/cupons/${c.id}`, { ativo: !c.ativo });
      setCupons((prev) => prev.map((item) => (item.id === c.id ? data : item)));
    } catch (err) {
      toast(mensagemErro(err), 'error');
    } finally {
      setAlternandoId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Cupons</h1>
        <p className="mt-1 text-sm text-slate-500">Crie códigos de desconto para atrair clientes.</p>
      </div>

      <Card>
        <CardHeader title="Novo cupom" subtitle="Vale para reservas avulsas (não vale para mensalista)." />
        <CardBody>
          <form onSubmit={criar} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Input name="codigo" placeholder="Código (ex: BEMVINDO10)" value={form.codigo} onChange={onChange} />
            <Select name="tipo" value={form.tipo} onChange={onChange}>
              <option value="PERCENTUAL">Percentual (%)</option>
              <option value="FIXO">Valor fixo (R$)</option>
            </Select>
            <Input
              name="valor"
              type="number"
              min="0"
              step="0.01"
              placeholder="Valor"
              value={form.valor}
              onChange={onChange}
            />
            <Input name="validoAte" type="date" value={form.validoAte} onChange={onChange} />
            <Input
              name="usosMaximos"
              type="number"
              min="1"
              placeholder="Usos máx. (opcional)"
              value={form.usosMaximos}
              onChange={onChange}
            />
            <Button type="submit" loading={criando} className="sm:col-span-2 lg:col-span-5">
              Criar cupom
            </Button>
          </form>
        </CardBody>
      </Card>

      {carregando ? (
        <div className="flex justify-center py-12 text-primary-600">
          <Spinner className="h-7 w-7" />
        </div>
      ) : (
        <div className="space-y-3">
          {cupons.map((c) => (
            <Card key={c.id}>
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎟️</span>
                  <div>
                    <p className="font-bold text-slate-900">{c.codigo}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <Badge color={c.ativo ? 'green' : 'gray'}>{c.ativo ? 'Ativo' : 'Inativo'}</Badge>
                      <span>{c.tipo === 'PERCENTUAL' ? `${c.valor}%` : `R$ ${c.valor}`} de desconto</span>
                      <span>
                        {c.usosCount}/{c.usosMaximos ?? '∞'} usos
                      </span>
                      {c.validoAte && <span>válido até {c.validoAte}</span>}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  loading={alternandoId === c.id}
                  onClick={() => alternarAtivo(c)}
                >
                  {c.ativo ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

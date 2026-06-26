import { useEffect, useState } from 'react';
import { api, mensagemErro } from '../../lib/api.js';
import { Card, CardBody, CardHeader } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

export function Quadras() {
  const toast = useToast();
  const [quadras, setQuadras] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState('');
  const [criando, setCriando] = useState(false);

  function carregar() {
    setCarregando(true);
    api
      .get('/quadras', { params: { todas: true } })
      .then(({ data }) => setQuadras(data))
      .catch((err) => toast(mensagemErro(err), 'error'))
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, [toast]);

  async function criar(e) {
    e.preventDefault();
    if (!nome.trim()) return;
    setCriando(true);
    try {
      const { data } = await api.post('/quadras', { nome: nome.trim() });
      setQuadras((prev) => [...prev, data]);
      setNome('');
      toast('Quadra cadastrada ✅', 'success');
    } catch (err) {
      toast(mensagemErro(err), 'error');
    } finally {
      setCriando(false);
    }
  }

  async function alternarAtiva(q) {
    try {
      const { data } = await api.patch(`/quadras/${q.id}`, { ativa: !q.ativa });
      setQuadras((prev) => prev.map((item) => (item.id === q.id ? data : item)));
    } catch (err) {
      toast(mensagemErro(err), 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Quadras</h1>
        <p className="mt-1 text-sm text-slate-500">Cadastre e ative/desative suas quadras.</p>
      </div>

      <Card>
        <CardHeader title="Nova quadra" subtitle="Adicione uma quadra ao sistema." />
        <CardBody>
          <form onSubmit={criar} className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Ex: Quadra Society 3"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" loading={criando}>
              Adicionar
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
          {quadras.map((q) => (
            <Card key={q.id}>
              <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🥅</span>
                  <div>
                    <p className="font-bold text-slate-900">{q.nome}</p>
                    <Badge color={q.ativa ? 'green' : 'gray'}>{q.ativa ? 'Ativa' : 'Inativa'}</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => alternarAtiva(q)}>
                  {q.ativa ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

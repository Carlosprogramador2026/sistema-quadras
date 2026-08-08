import { useEffect, useState } from 'react';
import { api, mensagemErro } from '../../lib/api.js';
import { formatarMoeda } from '../../lib/format.js';
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
  const [valorHora, setValorHora] = useState('');
  const [criando, setCriando] = useState(false);
  const [edicaoValor, setEdicaoValor] = useState({});
  const [salvandoValorId, setSalvandoValorId] = useState(null);

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
      const { data } = await api.post('/quadras', {
        nome: nome.trim(),
        valorHora: valorHora === '' ? undefined : Number(valorHora),
      });
      setQuadras((prev) => [...prev, data]);
      setNome('');
      setValorHora('');
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

  async function salvarValorHora(q) {
    const novoValor = Number(edicaoValor[q.id]);
    if (Number.isNaN(novoValor) || novoValor < 0) {
      toast('Informe um valor válido.', 'error');
      return;
    }
    setSalvandoValorId(q.id);
    try {
      const { data } = await api.patch(`/quadras/${q.id}`, { valorHora: novoValor });
      setQuadras((prev) => prev.map((item) => (item.id === q.id ? data : item)));
      setEdicaoValor((prev) => ({ ...prev, [q.id]: undefined }));
      toast('Valor atualizado ✅', 'success');
    } catch (err) {
      toast(mensagemErro(err), 'error');
    } finally {
      setSalvandoValorId(null);
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
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Valor por hora (R$)"
              value={valorHora}
              onChange={(e) => setValorHora(e.target.value)}
              className="sm:w-48"
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
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🥅</span>
                  <div>
                    <p className="font-bold text-slate-900">{q.nome}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge color={q.ativa ? 'green' : 'gray'}>{q.ativa ? 'Ativa' : 'Inativa'}</Badge>
                      <span className="text-xs text-slate-500">{formatarMoeda(q.valorHora)}/h</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={String(q.valorHora)}
                    value={edicaoValor[q.id] ?? ''}
                    onChange={(e) => setEdicaoValor((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    className="w-28"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    loading={salvandoValorId === q.id}
                    disabled={!edicaoValor[q.id]}
                    onClick={() => salvarValorHora(q)}
                  >
                    Salvar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => alternarAtiva(q)}>
                    {q.ativa ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

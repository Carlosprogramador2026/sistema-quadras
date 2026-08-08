import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, mensagemErro } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { formatarDataLonga, formatarMoeda, statusMeta } from '../../lib/format.js';
import { Card, CardBody, CardHeader } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

export function ReservaDetalhe() {
  const { id } = useParams();
  const { usuario, role } = useAuth();
  const toast = useToast();

  const [carregando, setCarregando] = useState(true);
  const [reserva, setReserva] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [rateio, setRateio] = useState(null);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [adicionando, setAdicionando] = useState(false);
  const [acaoId, setAcaoId] = useState(null);
  const [sorteando, setSorteando] = useState(false);

  function carregar() {
    setCarregando(true);
    api
      .get(`/reservas/${id}`)
      .then(({ data }) => {
        setReserva(data.reserva);
        setParticipantes(data.participantes);
        setRateio(data.rateio);
      })
      .catch((err) => toast(mensagemErro(err), 'error'))
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, [id, toast]);

  const souDono = role === 'CLIENTE' && reserva?.clienteId === usuario?.id;

  async function adicionar(e) {
    e.preventDefault();
    if (!nome.trim()) return;
    setAdicionando(true);
    try {
      const { data } = await api.post('/participantes', {
        reservaId: Number(id),
        nome: nome.trim(),
        telefone: telefone.trim() || undefined,
      });
      setParticipantes((prev) => [...prev, data]);
      setNome('');
      setTelefone('');
    } catch (err) {
      toast(mensagemErro(err), 'error');
    } finally {
      setAdicionando(false);
    }
  }

  async function alternar(p, campo) {
    setAcaoId(p.id + campo);
    try {
      const { data } = await api.patch(`/participantes/${p.id}`, { [campo]: !p[campo] });
      setParticipantes((prev) => prev.map((item) => (item.id === p.id ? data : item)));
    } catch (err) {
      toast(mensagemErro(err), 'error');
    } finally {
      setAcaoId(null);
    }
  }

  async function remover(p) {
    setAcaoId(p.id + 'remover');
    try {
      await api.delete(`/participantes/${p.id}`);
      setParticipantes((prev) => prev.filter((item) => item.id !== p.id));
    } catch (err) {
      toast(mensagemErro(err), 'error');
    } finally {
      setAcaoId(null);
    }
  }

  async function sortear() {
    setSorteando(true);
    try {
      const { data } = await api.post(`/reservas/${id}/sorteio`);
      setParticipantes(data);
      toast('Times sorteados! 🎲', 'success');
    } catch (err) {
      toast(mensagemErro(err), 'error');
    } finally {
      setSorteando(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center py-16 text-primary-600">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  if (!reserva) return null;

  const meta = statusMeta(reserva.status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">{reserva.quadra?.nome}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {formatarDataLonga(reserva.data)} · {reserva.horaInicio}–{reserva.horaFim}
        </p>
        <Badge color={meta.badge} className="mt-2">
          {meta.label}
        </Badge>
      </div>

      <Card>
        <CardHeader title="Valor e rateio" />
        <CardBody className="grid gap-3 sm:grid-cols-3">
          <Info label="Valor total" valor={formatarMoeda(rateio.valorTotal)} />
          <Info label="Confirmados" valor={String(rateio.confirmados)} />
          <Info label="Valor por pessoa" valor={formatarMoeda(rateio.valorPorPessoa)} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Participantes" subtitle="Confirme presença e pagamento de cada um." />
        <CardBody className="space-y-3">
          {participantes.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum participante adicionado ainda.</p>
          ) : (
            participantes.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
              >
                <div>
                  <p className="font-semibold text-slate-900">{p.nome}</p>
                  {p.telefone && <p className="text-xs text-slate-500">{p.telefone}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={p.confirmado ? 'subtle' : 'outline'}
                    size="sm"
                    loading={acaoId === p.id + 'confirmado'}
                    onClick={() => alternar(p, 'confirmado')}
                  >
                    {p.confirmado ? 'Confirmado ✅' : 'Confirmar'}
                  </Button>
                  <Button
                    variant={p.pago ? 'subtle' : 'outline'}
                    size="sm"
                    loading={acaoId === p.id + 'pago'}
                    onClick={() => alternar(p, 'pago')}
                  >
                    {p.pago ? 'Pago ✅' : 'Marcar pago'}
                  </Button>
                  {souDono && (
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={acaoId === p.id + 'remover'}
                      onClick={() => remover(p)}
                    >
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}

          {souDono && (
            <form onSubmit={adicionar} className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Input
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Telefone (opcional)"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="sm:w-48"
              />
              <Button type="submit" loading={adicionando}>
                Adicionar
              </Button>
            </form>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Sorteio de times"
          action={
            <Button
              variant="subtle"
              size="sm"
              loading={sorteando}
              disabled={participantes.filter((p) => p.confirmado).length < 2}
              onClick={sortear}
            >
              Sortear times
            </Button>
          }
        />
        <CardBody>
          {participantes.some((p) => p.time) ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <TimeColuna titulo="Time 1" jogadores={participantes.filter((p) => p.time === 1)} />
              <TimeColuna titulo="Time 2" jogadores={participantes.filter((p) => p.time === 2)} />
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Confirme ao menos 2 participantes e clique em "Sortear times".
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function TimeColuna({ titulo, jogadores }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <p className="mb-2 text-sm font-bold text-slate-900">{titulo}</p>
      <ul className="space-y-1 text-sm text-slate-600">
        {jogadores.map((j) => (
          <li key={j.id}>{j.nome}</li>
        ))}
      </ul>
    </div>
  );
}

function Info({ label, valor }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-slate-400">{label}</p>
      <p className="text-lg font-bold text-slate-900">{valor}</p>
    </div>
  );
}

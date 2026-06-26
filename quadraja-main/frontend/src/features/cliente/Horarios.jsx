import { useEffect, useMemo, useState, useCallback } from 'react';
import { api, mensagemErro } from '../../lib/api.js';
import { dayjs, hoje } from '../../lib/format.js';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { Select } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { SlotGrid } from './SlotGrid.jsx';
import { ConfirmarReservaModal } from './ConfirmarReservaModal.jsx';

// Proximos 7 dias para o seletor horizontal de datas.
function proximosDias(qtd = 7) {
  return Array.from({ length: qtd }, (_, i) => dayjs().add(i, 'day'));
}

export function Horarios() {
  const toast = useToast();
  const dias = useMemo(() => proximosDias(), []);

  const [quadras, setQuadras] = useState([]);
  const [quadraId, setQuadraId] = useState('');
  const [data, setData] = useState(hoje());
  const [slots, setSlots] = useState([]);
  const [carregandoSlots, setCarregandoSlots] = useState(false);
  const [selecionado, setSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [enviandoEspera, setEnviandoEspera] = useState(false);

  // Carrega quadras uma vez.
  useEffect(() => {
    api
      .get('/quadras')
      .then(({ data }) => {
        setQuadras(data);
        if (data[0]) setQuadraId(String(data[0].id));
      })
      .catch((err) => toast(mensagemErro(err), 'error'));
  }, [toast]);

  // Busca a disponibilidade da quadra/data atuais. Reutilizado pelo efeito
  // (ao trocar quadra/data) e apos confirmar uma reserva.
  const carregarSlots = useCallback(() => {
    if (!quadraId) return;
    setCarregandoSlots(true);
    api
      .get('/disponibilidade', { params: { quadraId, data } })
      .then(({ data }) => setSlots(data.slots))
      .catch((err) => toast(mensagemErro(err), 'error'))
      .finally(() => setCarregandoSlots(false));
  }, [quadraId, data, toast]);

  useEffect(() => {
    setSelecionado(null);
    carregarSlots();
  }, [carregarSlots]);

  async function entrarNaEspera() {
    setEnviandoEspera(true);
    try {
      await api.post('/lista-espera', {
        quadraId: Number(quadraId),
        data,
        horaInicio: selecionado.horaInicio,
        horaFim: selecionado.horaFim,
      });
      toast('Você entrou na lista de espera! Avisaremos se vagar. ✅', 'success');
      setSelecionado(null);
    } catch (err) {
      toast(mensagemErro(err), 'error');
    } finally {
      setEnviandoEspera(false);
    }
  }

  const quadraNome = quadras.find((q) => String(q.id) === String(quadraId))?.nome;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Reservar horário</h1>
        <p className="mt-1 text-sm text-slate-500">Escolha a quadra, o dia e um horário livre.</p>
      </div>

      <Card>
        <CardBody className="space-y-5">
          {/* Seletor de quadra */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="text-sm font-semibold text-slate-700 sm:w-24">Quadra</label>
            <Select value={quadraId} onChange={(e) => setQuadraId(e.target.value)} className="sm:max-w-xs">
              {quadras.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.nome}
                </option>
              ))}
            </Select>
          </div>

          {/* Seletor de dia (chips horizontais com scroll no mobile) */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Dia</label>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {dias.map((d) => {
                const valor = d.format('YYYY-MM-DD');
                const ativo = valor === data;
                return (
                  <button
                    key={valor}
                    onClick={() => setData(valor)}
                    className={`flex min-w-[64px] flex-col items-center rounded-xl border-2 px-3 py-2 transition-colors ${
                      ativo
                        ? 'border-primary-500 bg-primary-600 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-primary-300'
                    }`}
                  >
                    <span className="text-[11px] font-semibold uppercase">{d.format('ddd')}</span>
                    <span className="text-lg font-bold leading-none">{d.format('DD')}</span>
                    <span className="text-[10px] opacity-80">{d.format('MMM')}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Grade de horarios */}
      <Card>
        <CardBody>
          {carregandoSlots ? (
            <div className="flex items-center justify-center py-16 text-primary-600">
              <Spinner className="h-7 w-7" />
            </div>
          ) : (
            <SlotGrid slots={slots} selecionado={selecionado} onSelecionar={setSelecionado} />
          )}

          {/* Legenda */}
          <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500">
            <Legenda cor="bg-primary-400" txt="Livre" />
            <Legenda cor="bg-amber-400" txt="Em análise" />
            <Legenda cor="bg-red-400" txt="Ocupado" />
          </div>
        </CardBody>
      </Card>

      {/* Barra de acao fixa quando ha selecao */}
      {selecionado && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-0 sm:px-2">
            <div className="text-sm">
              <p className="font-bold text-slate-900">
                {selecionado.horaInicio}–{selecionado.horaFim}
              </p>
              <p className="text-slate-500">{quadraNome}</p>
            </div>
            {selecionado.disponivel ? (
              <Button onClick={() => setModalAberto(true)}>Reservar este horário</Button>
            ) : (
              <Button variant="outline" loading={enviandoEspera} onClick={entrarNaEspera}>
                Entrar na lista de espera
              </Button>
            )}
          </div>
        </div>
      )}

      <ConfirmarReservaModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        quadraId={quadraId}
        quadraNome={quadraNome}
        data={data}
        slot={selecionado}
        onConfirmado={() => {
          setModalAberto(false);
          setSelecionado(null);
          carregarSlots();
        }}
      />
    </div>
  );
}

function Legenda({ cor, txt }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${cor}`} />
      {txt}
    </span>
  );
}

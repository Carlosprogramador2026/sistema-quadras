import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, mensagemErro } from '../../lib/api.js';
import { formatarDataLonga, statusMeta } from '../../lib/format.js';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

export function MinhasReservas() {
  const toast = useToast();
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api
      .get('/reservas')
      .then(({ data }) => setReservas(data))
      .catch((err) => toast(mensagemErro(err), 'error'))
      .finally(() => setCarregando(false));
  }, [toast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Minhas reservas</h1>
        <p className="mt-1 text-sm text-slate-500">Acompanhe o status das suas solicitações.</p>
      </div>

      {carregando ? (
        <div className="flex justify-center py-16 text-primary-600">
          <Spinner className="h-7 w-7" />
        </div>
      ) : reservas.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Nenhuma reserva ainda"
          description="Que tal reservar um horário para o seu próximo jogo?"
          action={
            <Link to="/">
              <Button>Ver horários</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {reservas.map((r) => {
            const meta = statusMeta(r.status);
            return (
              <Card key={r.id}>
                <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
                  <div>
                    <p className="font-bold text-slate-900">{r.quadra?.nome}</p>
                    <p className="text-sm text-slate-500">
                      {formatarDataLonga(r.data)} · {r.horaInicio}–{r.horaFim}
                    </p>
                  </div>
                  <Badge color={meta.badge}>{meta.label}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

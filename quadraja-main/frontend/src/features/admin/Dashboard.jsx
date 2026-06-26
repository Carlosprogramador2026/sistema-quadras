import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, mensagemErro } from '../../lib/api.js';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

const CARDS = [
  { key: 'PENDENTE', label: 'Pendentes', cor: 'text-amber-600', bg: 'bg-amber-50', icon: '⏳' },
  { key: 'CONFIRMADA', label: 'Confirmadas', cor: 'text-primary-700', bg: 'bg-primary-50', icon: '✅' },
  { key: 'CANCELADA', label: 'Canceladas', cor: 'text-slate-500', bg: 'bg-slate-100', icon: '🚫' },
];

export function Dashboard() {
  const toast = useToast();
  const [resumo, setResumo] = useState(null);
  const [esperas, setEsperas] = useState(0);

  useEffect(() => {
    Promise.all([api.get('/reservas/resumo'), api.get('/lista-espera')])
      .then(([r1, r2]) => {
        setResumo(r1.data);
        setEsperas(r2.data.length);
      })
      .catch((err) => toast(mensagemErro(err), 'error'));
  }, [toast]);

  if (!resumo) {
    return (
      <div className="flex justify-center py-20 text-primary-600">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Painel</h1>
        <p className="mt-1 text-sm text-slate-500">Visão geral das reservas da quadra.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {CARDS.map((c) => (
          <Card key={c.key}>
            <CardBody className="flex items-center gap-4">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${c.bg}`}>
                {c.icon}
              </span>
              <div>
                <p className={`text-2xl font-extrabold ${c.cor}`}>{resumo[c.key] ?? 0}</p>
                <p className="text-xs font-medium text-slate-500">{c.label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
        <Card>
          <CardBody className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
              👥
            </span>
            <div>
              <p className="text-2xl font-extrabold text-blue-600">{esperas}</p>
              <p className="text-xs font-medium text-slate-500">Na lista de espera</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-bold text-slate-900">
              {resumo.PENDENTE > 0
                ? `Você tem ${resumo.PENDENTE} solicitação(ões) aguardando`
                : 'Tudo em dia! Nenhuma pendência.'}
            </p>
            <p className="text-sm text-slate-500">Confirme ou recuse as solicitações dos clientes.</p>
          </div>
          <Link to="/admin/pendencias">
            <Button variant={resumo.PENDENTE > 0 ? 'primary' : 'outline'}>Ver pendências</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}

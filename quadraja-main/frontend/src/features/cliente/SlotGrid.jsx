// Estilos por status do slot. LIVRE e selecionavel para reserva;
// PENDENTE/CONFIRMADA sao ocupados (clicaveis para lista de espera);
// INDISPONIVEL (horario passado) fica desabilitado.
const ESTILO = {
  LIVRE: 'border-primary-200 bg-primary-50 text-primary-800 hover:border-primary-400 hover:bg-primary-100',
  PENDENTE: 'border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-400',
  CONFIRMADA: 'border-red-200 bg-red-50 text-red-700 hover:border-red-400',
  INDISPONIVEL: 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed',
};

const ROTULO = {
  LIVRE: 'Livre',
  PENDENTE: 'Em análise',
  CONFIRMADA: 'Ocupado',
  INDISPONIVEL: '—',
};

export function SlotGrid({ slots, selecionado, onSelecionar }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
      {slots.map((slot) => {
        const ativo = selecionado?.horaInicio === slot.horaInicio;
        const desabilitado = slot.status === 'INDISPONIVEL';
        return (
          <button
            key={slot.horaInicio}
            type="button"
            disabled={desabilitado}
            aria-pressed={ativo}
            onClick={() => onSelecionar(slot)}
            className={`flex flex-col items-start rounded-xl border-2 p-3 text-left transition-all ${
              ESTILO[slot.status]
            } ${ativo ? 'ring-2 ring-primary-500 ring-offset-1' : ''}`}
          >
            <span className="text-base font-bold tabular-nums">{slot.horaInicio}</span>
            <span className="text-[11px] font-medium opacity-80">
              {slot.horaInicio}–{slot.horaFim}
            </span>
            <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide">
              {ROTULO[slot.status]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

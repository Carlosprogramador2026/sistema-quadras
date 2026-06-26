const CORES = {
  green: 'bg-primary-100 text-primary-800 ring-primary-600/20',
  amber: 'bg-amber-100 text-amber-800 ring-amber-600/20',
  red: 'bg-red-100 text-red-800 ring-red-600/20',
  blue: 'bg-blue-100 text-blue-800 ring-blue-600/20',
  gray: 'bg-slate-100 text-slate-700 ring-slate-500/20',
};

export function Badge({ color = 'gray', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${CORES[color]} ${className}`}
    >
      {children}
    </span>
  );
}

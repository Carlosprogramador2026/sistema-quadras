export function Logo({ className = '', light = false }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${
          light ? 'bg-primary-500/20 text-primary-300' : 'bg-primary-600 text-white'
        }`}
      >
        ⚽
      </span>
      <span className={`text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
        Quadra<span className="text-primary-500">Já</span>
      </span>
    </div>
  );
}

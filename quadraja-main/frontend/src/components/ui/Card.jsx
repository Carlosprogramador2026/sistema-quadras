export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ className = '', children }) {
  return <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

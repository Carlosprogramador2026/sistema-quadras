import { Logo } from '../../components/layout/Logo.jsx';

// Layout das telas de autenticacao: painel "de campo" a esquerda (desktop)
// e formulario a direita. No mobile vira so o formulario centralizado.
export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="bg-field relative hidden flex-col justify-between p-12 text-white lg:flex lg:w-1/2">
        <Logo light />
        <div>
          <h1 className="max-w-md text-4xl font-extrabold leading-tight">
            Reserve sua quadra em segundos.
          </h1>
          <p className="mt-4 max-w-sm text-primary-100/80">
            Veja os horários livres, escolha o seu e confirme. Lotou? Entre na lista de espera e
            seja avisado quando vagar.
          </p>
        </div>
        <p className="text-sm text-primary-100/60">⚽ Bom jogo!</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

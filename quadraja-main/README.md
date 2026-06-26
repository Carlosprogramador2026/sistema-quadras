# QuadraJá — Agendamento de Quadra de Futebol ⚽

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)
![JWT](https://img.shields.io/badge/auth-JWT-000000?logo=jsonwebtokens)
![Testes](https://img.shields.io/badge/testes-23%20✓-success)
![Licença](https://img.shields.io/badge/licença-MIT-green)

Sistema web full-stack para reserva de horários de quadra, com **layout moderno
e responsivo** (tema "clean esportivo" verde/escuro). Cliente reserva horários e
o gestor administra tudo por um painel.

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node + Express em camadas (Controller → Service → Repository)
- **ORM/Banco:** Prisma + SQLite (dev) — pronto para trocar por PostgreSQL
- **Auth:** JWT + bcrypt · **Validação:** Zod · **Datas:** dayjs

## Como rodar

Pré-requisito: Node 18+.

```bash
# 1) Backend
cd backend
npm install
npx prisma migrate dev      # cria o banco SQLite
npm run seed                # gestor + cliente demo + quadras
npm run dev                 # http://localhost:3333

# 2) Frontend (em outro terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

O Vite faz proxy de `/api` para o backend (porta 3333).

### Credenciais de demonstração (do seed)

- **Gestor:** `gestor@quadra.com` / `admin123` → painel em `/admin/login`
- **Cliente:** `cliente@teste.com` / `cliente123` → app em `/login`

## Fluxo

**Cliente:** cadastra/loga → escolhe quadra + dia → vê a grade de horários →
reserva um horário livre (a solicitação vai pro WhatsApp do gestor via link
`wa.me`) ou entra na **lista de espera** de um horário ocupado.

**Gestor:** vê o resumo no painel → confirma/recusa pendências → cancela
reservas. Ao cancelar uma reserva ocupada, o sistema identifica o 1º da lista de
espera e gera um link de WhatsApp para avisá-lo da vaga.

### Status da reserva

`PENDENTE` (aguardando o gestor) · `CONFIRMADA` · `CANCELADA` · `EM_ESPERA`.

## Testes

O backend tem testes de integração (Express + Prisma reais, banco SQLite
separado `test.db`) usando o **test runner nativo do Node** + `supertest` —
sem framework extra, para servir de material de estudo.

```bash
cd backend
npm test
```

Cobrem: autenticação (cadastro/login/duplicado/senha errada), reservas
(criar/conflito/confirmar/recusar/cancelar), disponibilidade, **lista de espera
+ promoção no cancelamento** e tratamento de erros (422 Zod, 400 JSON
malformado, 413 payload grande, 401/403/404). São **23 testes** em
`backend/tests/`.

## Estrutura

```
backend/   Express em camadas + Prisma (src/{controllers,services,repositories,routes,middlewares,validators,utils})
frontend/  React + Tailwind (src/{components/ui, components/layout, features, lib})
```

## WhatsApp

Começa com link `wa.me` pré-preenchido (gratuito, sem API). Configure o número
do gestor em `backend/.env` → `GESTOR_WHATSAPP` (apenas dígitos, DDI+DDD, ex:
`5511999998888`). Para automação total depois, dá para evoluir para a WhatsApp
Business API ou Twilio no `backend/src/utils/whatsapp.js`.

## Migrar para PostgreSQL (opcional)

1. Suba um Postgres (ex: Docker) e ajuste `DATABASE_URL` no `backend/.env`.
2. Em `backend/prisma/schema.prisma`, troque `provider = "sqlite"` por
   `"postgresql"`.
3. Rode `npx prisma migrate dev`. (O campo `status` já é String validada por
   Zod; opcionalmente, no Postgres, dá para promovê-lo a `enum` nativo.)
```

-- CreateTable
CREATE TABLE "Participante" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reservaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "confirmado" BOOLEAN NOT NULL DEFAULT false,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "time" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Participante_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cupom" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "validoAte" TEXT,
    "usosMaximos" INTEGER,
    "usosCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ReservaRecorrente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clienteId" INTEGER NOT NULL,
    "quadraId" INTEGER NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReservaRecorrente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReservaRecorrente_quadraId_fkey" FOREIGN KEY ("quadraId") REFERENCES "Quadra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Quadra" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "valorHora" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Quadra" ("ativa", "createdAt", "id", "nome") SELECT "ativa", "createdAt", "id", "nome" FROM "Quadra";
DROP TABLE "Quadra";
ALTER TABLE "new_Quadra" RENAME TO "Quadra";
CREATE TABLE "new_Reserva" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clienteId" INTEGER NOT NULL,
    "quadraId" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "valor" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cupomId" INTEGER,
    "reservaRecorrenteId" INTEGER,
    CONSTRAINT "Reserva_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reserva_quadraId_fkey" FOREIGN KEY ("quadraId") REFERENCES "Quadra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reserva_cupomId_fkey" FOREIGN KEY ("cupomId") REFERENCES "Cupom" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Reserva_reservaRecorrenteId_fkey" FOREIGN KEY ("reservaRecorrenteId") REFERENCES "ReservaRecorrente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Reserva" ("clienteId", "createdAt", "data", "horaFim", "horaInicio", "id", "quadraId", "status") SELECT "clienteId", "createdAt", "data", "horaFim", "horaInicio", "id", "quadraId", "status" FROM "Reserva";
DROP TABLE "Reserva";
ALTER TABLE "new_Reserva" RENAME TO "Reserva";
CREATE INDEX "Reserva_quadraId_data_idx" ON "Reserva"("quadraId", "data");
CREATE INDEX "Reserva_status_idx" ON "Reserva"("status");
CREATE INDEX "Reserva_clienteId_idx" ON "Reserva"("clienteId");
CREATE INDEX "Reserva_reservaRecorrenteId_idx" ON "Reserva"("reservaRecorrenteId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Participante_reservaId_idx" ON "Participante"("reservaId");

-- CreateIndex
CREATE UNIQUE INDEX "Cupom_codigo_key" ON "Cupom"("codigo");

-- CreateIndex
CREATE INDEX "ReservaRecorrente_clienteId_idx" ON "ReservaRecorrente"("clienteId");

-- CreateIndex
CREATE INDEX "ReservaRecorrente_quadraId_idx" ON "ReservaRecorrente"("quadraId");

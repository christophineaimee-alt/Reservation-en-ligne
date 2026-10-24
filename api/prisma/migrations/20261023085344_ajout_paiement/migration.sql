-- CreateEnum
CREATE TYPE "OperateurPaiement" AS ENUM ('MVOLA', 'ORANGE_MONEY', 'AIRTEL_MONEY', 'SIMULATEUR');

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('EN_ATTENTE', 'REUSSI', 'ECHOUE', 'EXPIRE');

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "montantTotal" DECIMAL(12,2);

-- CreateTable
CREATE TABLE "Paiement" (
    "idPaiement" SERIAL NOT NULL,
    "montant" DECIMAL(12,2) NOT NULL,
    "devise" TEXT NOT NULL DEFAULT 'MGA',
    "operateur" "OperateurPaiement" NOT NULL,
    "telephonePayeur" TEXT NOT NULL,
    "statut" "StatutPaiement" NOT NULL DEFAULT 'EN_ATTENTE',
    "referenceInterne" TEXT NOT NULL,
    "referenceOperateur" TEXT,
    "messageErreur" TEXT,
    "datePaiement" TIMESTAMP(3),
    "idReservation" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paiement_pkey" PRIMARY KEY ("idPaiement")
);

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_referenceInterne_key" ON "Paiement"("referenceInterne");

-- CreateIndex
CREATE INDEX "Paiement_idReservation_idx" ON "Paiement"("idReservation");

-- CreateIndex
CREATE INDEX "Paiement_statut_idx" ON "Paiement"("statut");

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_idReservation_fkey" FOREIGN KEY ("idReservation") REFERENCES "Reservation"("idReservation") ON DELETE RESTRICT ON UPDATE CASCADE;

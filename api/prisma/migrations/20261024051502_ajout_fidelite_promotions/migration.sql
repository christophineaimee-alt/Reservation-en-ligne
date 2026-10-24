-- CreateEnum
CREATE TYPE "TypeRemise" AS ENUM ('POURCENTAGE', 'MONTANT');

-- CreateEnum
CREATE TYPE "TypeMouvementPoints" AS ENUM ('GAIN', 'UTILISATION', 'REMBOURSEMENT');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "pointsCumules" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsFidelite" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "idPromotion" INTEGER,
ADD COLUMN     "montantInitial" DECIMAL(12,2),
ADD COLUMN     "pointsUtilises" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "remise" DECIMAL(12,2);

-- CreateTable
CREATE TABLE "Promotion" (
    "idPromotion" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "typeRemise" "TypeRemise" NOT NULL,
    "valeur" DECIMAL(12,2) NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "idBoutique" INTEGER NOT NULL,
    "idProduitService" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("idPromotion")
);

-- CreateTable
CREATE TABLE "MouvementPoints" (
    "idMouvement" SERIAL NOT NULL,
    "points" INTEGER NOT NULL,
    "type" "TypeMouvementPoints" NOT NULL,
    "description" TEXT NOT NULL,
    "idClient" INTEGER NOT NULL,
    "idReservation" INTEGER,
    "idPaiement" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MouvementPoints_pkey" PRIMARY KEY ("idMouvement")
);

-- CreateIndex
CREATE INDEX "Promotion_idBoutique_idx" ON "Promotion"("idBoutique");

-- CreateIndex
CREATE INDEX "Promotion_dateDebut_dateFin_idx" ON "Promotion"("dateDebut", "dateFin");

-- CreateIndex
CREATE UNIQUE INDEX "MouvementPoints_idPaiement_key" ON "MouvementPoints"("idPaiement");

-- CreateIndex
CREATE INDEX "MouvementPoints_idClient_idx" ON "MouvementPoints"("idClient");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_idPromotion_fkey" FOREIGN KEY ("idPromotion") REFERENCES "Promotion"("idPromotion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_idBoutique_fkey" FOREIGN KEY ("idBoutique") REFERENCES "Boutique"("idBoutique") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_idProduitService_fkey" FOREIGN KEY ("idProduitService") REFERENCES "ProduitService"("idProduitService") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MouvementPoints" ADD CONSTRAINT "MouvementPoints_idClient_fkey" FOREIGN KEY ("idClient") REFERENCES "Client"("idClient") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MouvementPoints" ADD CONSTRAINT "MouvementPoints_idReservation_fkey" FOREIGN KEY ("idReservation") REFERENCES "Reservation"("idReservation") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MouvementPoints" ADD CONSTRAINT "MouvementPoints_idPaiement_fkey" FOREIGN KEY ("idPaiement") REFERENCES "Paiement"("idPaiement") ON DELETE SET NULL ON UPDATE CASCADE;

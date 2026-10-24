-- AlterTable
ALTER TABLE "Boutique" ADD COLUMN     "nombreAvis" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "noteMoyenne" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Avis" (
    "idAvis" SERIAL NOT NULL,
    "note" INTEGER NOT NULL,
    "commentaire" TEXT,
    "reponse" TEXT,
    "dateReponse" TIMESTAMP(3),
    "idReservation" INTEGER NOT NULL,
    "idClient" INTEGER NOT NULL,
    "idBoutique" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Avis_pkey" PRIMARY KEY ("idAvis")
);

-- CreateIndex
CREATE UNIQUE INDEX "Avis_idReservation_key" ON "Avis"("idReservation");

-- CreateIndex
CREATE INDEX "Avis_idBoutique_idx" ON "Avis"("idBoutique");

-- CreateIndex
CREATE INDEX "Avis_idClient_idx" ON "Avis"("idClient");

-- AddForeignKey
ALTER TABLE "Avis" ADD CONSTRAINT "Avis_idReservation_fkey" FOREIGN KEY ("idReservation") REFERENCES "Reservation"("idReservation") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avis" ADD CONSTRAINT "Avis_idClient_fkey" FOREIGN KEY ("idClient") REFERENCES "Client"("idClient") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avis" ADD CONSTRAINT "Avis_idBoutique_fkey" FOREIGN KEY ("idBoutique") REFERENCES "Boutique"("idBoutique") ON DELETE CASCADE ON UPDATE CASCADE;

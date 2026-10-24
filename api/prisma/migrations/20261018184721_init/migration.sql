-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CLIENT', 'COMMERCANT');

-- CreateEnum
CREATE TYPE "StatutCompte" AS ENUM ('ACTIF', 'SUSPENDU', 'BLOQUE');

-- CreateEnum
CREATE TYPE "StatutBoutique" AS ENUM ('EN_ATTENTE', 'VALIDEE', 'REJETEE');

-- CreateEnum
CREATE TYPE "StatutReservation" AS ENUM ('EN_ATTENTE', 'ACCEPTEE', 'REFUSEE', 'ANNULEE', 'EXPIREE');

-- CreateEnum
CREATE TYPE "TypeProduitService" AS ENUM ('PRODUIT', 'SERVICE');

-- CreateTable
CREATE TABLE "Utilisateur" (
    "idUser" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "statutCompte" "StatutCompte" NOT NULL DEFAULT 'ACTIF',
    "nbEchecs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("idUser")
);

-- CreateTable
CREATE TABLE "Client" (
    "idClient" SERIAL NOT NULL,
    "adresse" TEXT,
    "idUser" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("idClient")
);

-- CreateTable
CREATE TABLE "Commercant" (
    "idCommercant" SERIAL NOT NULL,
    "nomCommercial" TEXT,
    "idUser" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commercant_pkey" PRIMARY KEY ("idCommercant")
);

-- CreateTable
CREATE TABLE "Admin" (
    "idAdmin" SERIAL NOT NULL,
    "idUser" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("idAdmin")
);

-- CreateTable
CREATE TABLE "Categorie" (
    "idCategorie" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "idAdmin" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Categorie_pkey" PRIMARY KEY ("idCategorie")
);

-- CreateTable
CREATE TABLE "Boutique" (
    "idBoutique" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "adresse" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "logo" TEXT,
    "telephone" TEXT,
    "statut" "StatutBoutique" NOT NULL DEFAULT 'EN_ATTENTE',
    "motifRejet" TEXT,
    "idCommercant" INTEGER NOT NULL,
    "idCategorie" INTEGER NOT NULL,
    "idAdminValidateur" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Boutique_pkey" PRIMARY KEY ("idBoutique")
);

-- CreateTable
CREATE TABLE "ProduitService" (
    "idProduitService" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "prix" DECIMAL(12,2) NOT NULL,
    "photo" TEXT,
    "type" "TypeProduitService" NOT NULL,
    "dureeMinutes" INTEGER,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "idBoutique" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProduitService_pkey" PRIMARY KEY ("idProduitService")
);

-- CreateTable
CREATE TABLE "Stock" (
    "idStock" SERIAL NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 0,
    "seuilAlerte" INTEGER NOT NULL DEFAULT 0,
    "idProduitService" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("idStock")
);

-- CreateTable
CREATE TABLE "Horaire" (
    "idHoraire" SERIAL NOT NULL,
    "jour" INTEGER NOT NULL,
    "heureOuverture" TEXT,
    "heureFermeture" TEXT,
    "ferme" BOOLEAN NOT NULL DEFAULT false,
    "idBoutique" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Horaire_pkey" PRIMARY KEY ("idHoraire")
);

-- CreateTable
CREATE TABLE "Disponibilite" (
    "idDisponibilite" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "heureDebut" TEXT NOT NULL,
    "heureFin" TEXT NOT NULL,
    "capacite" INTEGER NOT NULL DEFAULT 1,
    "bloque" BOOLEAN NOT NULL DEFAULT false,
    "idBoutique" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Disponibilite_pkey" PRIMARY KEY ("idDisponibilite")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "idReservation" SERIAL NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 1,
    "remarque" TEXT,
    "dateHeure" TIMESTAMP(3) NOT NULL,
    "statut" "StatutReservation" NOT NULL DEFAULT 'EN_ATTENTE',
    "motifRefus" TEXT,
    "dateExpiration" TIMESTAMP(3),
    "idClient" INTEGER NOT NULL,
    "idProduitService" INTEGER NOT NULL,
    "idDisponibilite" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("idReservation")
);

-- CreateTable
CREATE TABLE "Notification" (
    "idNotification" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "typeNotification" TEXT NOT NULL,
    "lue" BOOLEAN NOT NULL DEFAULT false,
    "dateEnvoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idUser" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("idNotification")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_telephone_key" ON "Utilisateur"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "Client_idUser_key" ON "Client"("idUser");

-- CreateIndex
CREATE UNIQUE INDEX "Commercant_idUser_key" ON "Commercant"("idUser");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_idUser_key" ON "Admin"("idUser");

-- CreateIndex
CREATE UNIQUE INDEX "Categorie_nom_key" ON "Categorie"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Boutique_idCommercant_key" ON "Boutique"("idCommercant");

-- CreateIndex
CREATE INDEX "Boutique_ville_idx" ON "Boutique"("ville");

-- CreateIndex
CREATE INDEX "Boutique_statut_idx" ON "Boutique"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_idProduitService_key" ON "Stock"("idProduitService");

-- CreateIndex
CREATE UNIQUE INDEX "Horaire_idBoutique_jour_key" ON "Horaire"("idBoutique", "jour");

-- CreateIndex
CREATE INDEX "Disponibilite_idBoutique_date_idx" ON "Disponibilite"("idBoutique", "date");

-- CreateIndex
CREATE INDEX "Reservation_statut_idx" ON "Reservation"("statut");

-- CreateIndex
CREATE INDEX "Reservation_idClient_idx" ON "Reservation"("idClient");

-- CreateIndex
CREATE INDEX "Notification_idUser_lue_idx" ON "Notification"("idUser", "lue");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "Utilisateur"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commercant" ADD CONSTRAINT "Commercant_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "Utilisateur"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "Utilisateur"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categorie" ADD CONSTRAINT "Categorie_idAdmin_fkey" FOREIGN KEY ("idAdmin") REFERENCES "Admin"("idAdmin") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boutique" ADD CONSTRAINT "Boutique_idCommercant_fkey" FOREIGN KEY ("idCommercant") REFERENCES "Commercant"("idCommercant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boutique" ADD CONSTRAINT "Boutique_idCategorie_fkey" FOREIGN KEY ("idCategorie") REFERENCES "Categorie"("idCategorie") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boutique" ADD CONSTRAINT "Boutique_idAdminValidateur_fkey" FOREIGN KEY ("idAdminValidateur") REFERENCES "Admin"("idAdmin") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduitService" ADD CONSTRAINT "ProduitService_idBoutique_fkey" FOREIGN KEY ("idBoutique") REFERENCES "Boutique"("idBoutique") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_idProduitService_fkey" FOREIGN KEY ("idProduitService") REFERENCES "ProduitService"("idProduitService") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Horaire" ADD CONSTRAINT "Horaire_idBoutique_fkey" FOREIGN KEY ("idBoutique") REFERENCES "Boutique"("idBoutique") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disponibilite" ADD CONSTRAINT "Disponibilite_idBoutique_fkey" FOREIGN KEY ("idBoutique") REFERENCES "Boutique"("idBoutique") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_idClient_fkey" FOREIGN KEY ("idClient") REFERENCES "Client"("idClient") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_idProduitService_fkey" FOREIGN KEY ("idProduitService") REFERENCES "ProduitService"("idProduitService") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_idDisponibilite_fkey" FOREIGN KEY ("idDisponibilite") REFERENCES "Disponibilite"("idDisponibilite") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "Utilisateur"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;

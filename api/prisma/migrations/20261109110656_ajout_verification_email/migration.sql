-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "codeEnvoyeLe" TIMESTAMP(3),
ADD COLUMN     "codeEssais" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "codeExpire" TIMESTAMP(3),
ADD COLUMN     "codeHash" TEXT,
ADD COLUMN     "emailVerifie" BOOLEAN NOT NULL DEFAULT true;

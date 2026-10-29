-- CreateTable
CREATE TABLE "MessageContact" (
    "idMessage" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sujet" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageContact_pkey" PRIMARY KEY ("idMessage")
);

-- CreateIndex
CREATE INDEX "MessageContact_lu_idx" ON "MessageContact"("lu");

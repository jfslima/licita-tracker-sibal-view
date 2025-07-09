
-- CreateTable
CREATE TABLE "licitations" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "object" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "licitations_pkey" PRIMARY KEY ("id")
);

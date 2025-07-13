-- CreateTable
CREATE TABLE "licitations" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "publishDate" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "value" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'active',
    "organ" TEXT,
    "modality" TEXT,
    "object" TEXT,
    "requirements" TEXT,
    "openingDate" TIMESTAMP(3),
    "deliveryLocation" TEXT,

    CONSTRAINT "licitations_pkey" PRIMARY KEY ("id")
);
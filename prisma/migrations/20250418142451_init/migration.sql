/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "managementType" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "clinicName" TEXT NOT NULL,
    "clinicType" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "establishmentYear" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "departments" TEXT NOT NULL,
    "doctorsCount" TEXT NOT NULL,
    "communicationMode" TEXT NOT NULL,
    "governmentIdPath" TEXT,
    "governmentIdOriginalName" TEXT,
    "registrationCertificatePath" TEXT,
    "registrationCertificateOriginalName" TEXT,
    "accreditationPath" TEXT,
    "accreditationOriginalName" TEXT,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

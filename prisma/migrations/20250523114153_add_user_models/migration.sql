/*
  Warnings:

  - You are about to drop the `DemographicData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LifestyleData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MedicalData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DemographicData" DROP CONSTRAINT "DemographicData_userId_fkey";

-- DropForeignKey
ALTER TABLE "LifestyleData" DROP CONSTRAINT "LifestyleData_userId_fkey";

-- DropForeignKey
ALTER TABLE "MedicalData" DROP CONSTRAINT "MedicalData_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activityLevel" TEXT,
ADD COLUMN     "alcoholConsumption" TEXT,
ADD COLUMN     "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "alternateNumber" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "chronicDiseases" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "dietHabit" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "injuries" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "maritalStatus" TEXT,
ADD COLUMN     "medications" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "name" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "smokingHabit" TEXT,
ADD COLUMN     "surgeries" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "title" TEXT,
ADD COLUMN     "weight" INTEGER;

-- DropTable
DROP TABLE "DemographicData";

-- DropTable
DROP TABLE "LifestyleData";

-- DropTable
DROP TABLE "MedicalData";

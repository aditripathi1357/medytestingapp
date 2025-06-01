-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "supabaseUid" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemographicData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "bloodGroup" TEXT,
    "height" INTEGER,
    "weight" INTEGER,
    "maritalStatus" TEXT,
    "contactNumber" TEXT NOT NULL,
    "alternateNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemographicData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifestyleData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "smokingHabit" TEXT,
    "alcoholConsumption" TEXT,
    "activityLevel" TEXT,
    "dietHabit" TEXT,
    "occupation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LifestyleData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "medications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "chronicDiseases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "injuries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "surgeries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseUid_key" ON "User"("supabaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "DemographicData_userId_key" ON "DemographicData"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LifestyleData_userId_key" ON "LifestyleData"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalData_userId_key" ON "MedicalData"("userId");

-- AddForeignKey
ALTER TABLE "DemographicData" ADD CONSTRAINT "DemographicData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifestyleData" ADD CONSTRAINT "LifestyleData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalData" ADD CONSTRAINT "MedicalData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

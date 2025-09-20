-- CreateTable
CREATE TABLE "public"."Plant" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Operation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VolumeTier" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "minKg" INTEGER NOT NULL,
    "maxKg" INTEGER,
    "order" INTEGER NOT NULL,

    CONSTRAINT "VolumeTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IndirectCost" (
    "id" SERIAL NOT NULL,
    "plantId" INTEGER NOT NULL,
    "operationId" INTEGER NOT NULL,
    "volumeTierId" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PEN',
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndirectCost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plant_code_key" ON "public"."Plant"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Operation_name_key" ON "public"."Operation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VolumeTier_label_key" ON "public"."VolumeTier"("label");

-- CreateIndex
CREATE UNIQUE INDEX "IndirectCost_plantId_operationId_volumeTierId_key" ON "public"."IndirectCost"("plantId", "operationId", "volumeTierId");

-- AddForeignKey
ALTER TABLE "public"."IndirectCost" ADD CONSTRAINT "IndirectCost_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "public"."Plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IndirectCost" ADD CONSTRAINT "IndirectCost_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "public"."Operation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IndirectCost" ADD CONSTRAINT "IndirectCost_volumeTierId_fkey" FOREIGN KEY ("volumeTierId") REFERENCES "public"."VolumeTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

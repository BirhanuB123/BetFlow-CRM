-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accountType" TEXT,
    "industry" TEXT,
    "rating" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "billingStreet" TEXT,
    "billingCity" TEXT,
    "billingState" TEXT,
    "billingCountry" TEXT,
    "billingZip" TEXT,
    "shippingStreet" TEXT,
    "shippingCity" TEXT,
    "shippingState" TEXT,
    "shippingCountry" TEXT,
    "shippingZip" TEXT,
    "annualRevenue" DECIMAL(18,2),
    "employees" INTEGER,
    "description" TEXT,
    "parentAccountId" TEXT,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "accountId" TEXT;
ALTER TABLE "Customer" ADD COLUMN "title" TEXT;

-- AlterTable
ALTER TABLE "Deal" ADD COLUMN "accountId" TEXT;

-- CreateIndex
CREATE INDEX "Account_tenantId_name_idx" ON "Account"("tenantId", "name");
CREATE INDEX "Account_tenantId_accountType_idx" ON "Account"("tenantId", "accountType");
CREATE INDEX "Account_tenantId_ownerId_idx" ON "Account"("tenantId", "ownerId");
CREATE INDEX "Customer_tenantId_accountId_idx" ON "Customer"("tenantId", "accountId");
CREATE INDEX "Deal_tenantId_accountId_idx" ON "Deal"("tenantId", "accountId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

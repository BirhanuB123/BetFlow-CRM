-- CreateTable
CREATE TABLE "SmsOutbox" (
    "id" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'SMS',
    "triggerType" TEXT NOT NULL DEFAULT 'MANUAL_BROADCAST',
    "status" TEXT NOT NULL DEFAULT 'DELIVERED',
    "costEthioBirr" DECIMAL(10,2),
    "gatewayUsed" TEXT,
    "attemptsCount" INTEGER NOT NULL DEFAULT 1,
    "encoding" TEXT,
    "segmentCount" INTEGER NOT NULL DEFAULT 1,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SmsOutbox_phone_idx" ON "SmsOutbox"("phone");

-- CreateIndex
CREATE INDEX "SmsOutbox_status_idx" ON "SmsOutbox"("status");

-- CreateIndex
CREATE INDEX "SmsOutbox_sentAt_idx" ON "SmsOutbox"("sentAt");

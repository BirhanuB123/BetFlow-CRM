DROP INDEX IF EXISTS "Permission_name_key";

CREATE UNIQUE INDEX "Permission_tenantId_name_key" ON "Permission"("tenantId", "name");

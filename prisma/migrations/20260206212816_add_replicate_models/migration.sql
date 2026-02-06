-- CreateTable
CREATE TABLE "replicate_models" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "replicateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerColor" TEXT NOT NULL DEFAULT '#888888',
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL,
    "capabilities" TEXT NOT NULL DEFAULT '[]',
    "badge" TEXT,
    "inputSchema" TEXT NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" DATETIME,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "replicate_models_replicateId_key" ON "replicate_models"("replicateId");

-- CreateIndex
CREATE INDEX "replicate_models_category_idx" ON "replicate_models"("category");

-- CreateIndex
CREATE INDEX "replicate_models_isActive_category_idx" ON "replicate_models"("isActive", "category");

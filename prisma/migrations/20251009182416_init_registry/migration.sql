-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "lastUsedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alias" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "driver" TEXT NOT NULL DEFAULT 'postgresql',
    "description" TEXT,
    "encryptedUrl" BLOB NOT NULL,
    "salt" BLOB NOT NULL,
    "iv" BLOB NOT NULL,
    "keyVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastUsedAt" DATETIME,
    "isArchived" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "SessionConnection" (
    "sessionId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "attachedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("sessionId", "connectionId"),
    CONSTRAINT "SessionConnection_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionConnection_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "Connection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConnectionStats" (
    "connectionId" TEXT NOT NULL PRIMARY KEY,
    "lastHealthCheckAt" DATETIME,
    "lastLatencyMs" INTEGER,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ConnectionStats_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "Connection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Session_createdAt_idx" ON "Session"("createdAt");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_alias_key" ON "Connection"("alias");

-- CreateIndex
CREATE INDEX "Connection_environment_role_idx" ON "Connection"("environment", "role");

-- CreateIndex
CREATE INDEX "Connection_isArchived_idx" ON "Connection"("isArchived");

-- CreateIndex
CREATE INDEX "Connection_lastUsedAt_idx" ON "Connection"("lastUsedAt");

-- CreateIndex
CREATE INDEX "SessionConnection_connectionId_idx" ON "SessionConnection"("connectionId");

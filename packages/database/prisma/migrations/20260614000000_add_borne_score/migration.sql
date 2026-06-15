-- CreateTable
CREATE TABLE "borne_score" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "cabinetId" TEXT NOT NULL,
    "mapId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "maxCombo" INTEGER,
    "maxMultiplier" INTEGER,
    "counters" JSONB,
    "durationS" INTEGER,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "pseudo" TEXT,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "borne_score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "borne_score_code_key" ON "borne_score"("code");

-- CreateIndex
CREATE INDEX "borne_score_mapId_score_idx" ON "borne_score"("mapId", "score" DESC);

-- CreateIndex
CREATE INDEX "borne_score_code_idx" ON "borne_score"("code");


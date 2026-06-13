-- AlterTable
ALTER TABLE "borne_score" ADD COLUMN     "gameId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "borne_score_gameId_key" ON "borne_score"("gameId");


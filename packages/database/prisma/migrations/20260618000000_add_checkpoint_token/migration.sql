-- AlterTable
ALTER TABLE "checkpoint" ADD COLUMN     "tokenHash" TEXT;
ALTER TABLE "checkpoint" ADD COLUMN     "tokenCreatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "checkpoint_tokenHash_key" ON "checkpoint"("tokenHash");

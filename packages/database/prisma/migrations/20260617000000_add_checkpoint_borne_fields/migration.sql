-- AlterTable
ALTER TABLE "checkpoint" ADD COLUMN     "cabinetId" TEXT;
ALTER TABLE "checkpoint" ADD COLUMN     "ownerUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "checkpoint_cabinetId_key" ON "checkpoint"("cabinetId");

-- AddForeignKey
ALTER TABLE "checkpoint" ADD CONSTRAINT "checkpoint_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

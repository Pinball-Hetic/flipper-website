-- AlterTable
ALTER TABLE "user" ADD COLUMN "pseudo" TEXT,
                   ADD COLUMN "pseudoLower" TEXT,
                   ADD COLUMN "pseudoUpdatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "user_pseudo_key" ON "user"("pseudo");

-- CreateIndex
CREATE UNIQUE INDEX "user_pseudoLower_key" ON "user"("pseudoLower");

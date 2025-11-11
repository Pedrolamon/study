-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "userPointsId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userPointsId_badgeId_key" ON "user_badges"("userPointsId", "badgeId");

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userPointsId_fkey" FOREIGN KEY ("userPointsId") REFERENCES "user_points"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

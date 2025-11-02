-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

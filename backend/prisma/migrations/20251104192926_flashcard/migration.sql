-- AddForeignKey
ALTER TABLE "spaced_repetitions" ADD CONSTRAINT "spaced_repetitions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaced_repetitions" ADD CONSTRAINT "spaced_repetitions_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

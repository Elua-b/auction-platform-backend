-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "seller_id" TEXT;

-- CreateIndex
CREATE INDEX "Event_seller_id_idx" ON "Event"("seller_id");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

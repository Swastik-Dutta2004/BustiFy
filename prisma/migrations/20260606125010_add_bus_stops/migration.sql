/*
  Warnings:

  - You are about to drop the column `razorepayOrderId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `razorepayPaymentId` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "razorepayOrderId",
DROP COLUMN "razorepayPaymentId",
ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "razorpayPaymentId" TEXT;

-- AlterTable
ALTER TABLE "Bus" ADD COLUMN     "stops" TEXT[],
ALTER COLUMN "departureTime" DROP NOT NULL,
ALTER COLUMN "arrivalTime" DROP NOT NULL;

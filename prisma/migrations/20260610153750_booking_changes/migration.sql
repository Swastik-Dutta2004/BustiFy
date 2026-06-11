/*
  Warnings:

  - You are about to drop the column `busId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `seatId` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `fare` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromCity` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toCity` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_busId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "busId",
DROP COLUMN "seatId",
ADD COLUMN     "fare" INTEGER NOT NULL,
ADD COLUMN     "fromCity" TEXT NOT NULL,
ADD COLUMN     "toCity" TEXT NOT NULL;

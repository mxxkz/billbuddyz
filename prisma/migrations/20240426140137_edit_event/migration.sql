/*
  Warnings:

  - You are about to drop the column `start_date` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `stop_date` on the `event` table. All the data in the column will be lost.
  - Added the required column `date` to the `event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "event" DROP COLUMN "start_date";
ALTER TABLE "event" DROP COLUMN "stop_date";
ALTER TABLE "event" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

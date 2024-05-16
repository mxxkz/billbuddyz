-- AlterTable
ALTER TABLE "billing_participants" ADD COLUMN     "discount" FLOAT8 DEFAULT 0;
ALTER TABLE "billing_participants" ADD COLUMN     "service_charge" FLOAT8 DEFAULT 0;
ALTER TABLE "billing_participants" ADD COLUMN     "vat" FLOAT8 DEFAULT 0;

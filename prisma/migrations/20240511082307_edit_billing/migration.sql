-- AlterTable
ALTER TABLE "billing" ALTER COLUMN "service_charge" SET DEFAULT 0;
ALTER TABLE "billing" ALTER COLUMN "vat" SET DEFAULT 0;
ALTER TABLE "billing" ALTER COLUMN "discount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "billing_participants" ALTER COLUMN "payment_slip" DROP NOT NULL;

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('unpaid', 'verifying', 'paid');

-- CreateTable
CREATE TABLE "account" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" STRING NOT NULL,
    "provider" STRING NOT NULL,
    "provider_account_id" STRING NOT NULL,
    "refresh_token" STRING,
    "access_token" STRING,
    "expires_at" INT4,
    "token_type" STRING,
    "scope" STRING,
    "id_token" STRING,
    "session_state" STRING,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "name" STRING NOT NULL,
    "email" STRING,
    "email_verified" TIMESTAMP(3),
    "image" STRING,
    "qrcode" STRING,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" UUID NOT NULL,
    "name" STRING NOT NULL,
    "location" STRING,
    "start_date" TIMESTAMP(3) NOT NULL,
    "stop_date" TIMESTAMP(3) NOT NULL,
    "description" STRING,
    "notification" STRING NOT NULL,
    "join_id" STRING,
    "organizer_id" UUID NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_participants" (
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "event_participants_pkey" PRIMARY KEY ("event_id","user_id")
);

-- CreateTable
CREATE TABLE "billing" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "total_amount" FLOAT8 NOT NULL,
    "service_charge" FLOAT8,
    "vat" FLOAT8,
    "discount" FLOAT8,

    CONSTRAINT "billing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_participants" (
    "billing_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "total_amount" FLOAT8 NOT NULL,
    "payment_slip" STRING NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'unpaid',

    CONSTRAINT "billing_participants_pkey" PRIMARY KEY ("billing_id","user_id")
);

-- CreateTable
CREATE TABLE "item" (
    "id" UUID NOT NULL,
    "billing_id" UUID NOT NULL,
    "name" STRING NOT NULL,
    "price" FLOAT8 NOT NULL,

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_participants" (
    "item_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "price" FLOAT8 NOT NULL,

    CONSTRAINT "item_participants_pkey" PRIMARY KEY ("item_id","user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_provider_provider_account_id_key" ON "account"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "event_join_id_key" ON "event"("join_id");

-- CreateIndex
CREATE UNIQUE INDEX "billing_event_id_key" ON "billing"("event_id");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing" ADD CONSTRAINT "billing_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_participants" ADD CONSTRAINT "billing_participants_billing_id_fkey" FOREIGN KEY ("billing_id") REFERENCES "billing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_participants" ADD CONSTRAINT "billing_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_billing_id_fkey" FOREIGN KEY ("billing_id") REFERENCES "billing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_participants" ADD CONSTRAINT "item_participants_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_participants" ADD CONSTRAINT "item_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

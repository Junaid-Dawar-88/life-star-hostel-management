-- CreateTable
CREATE TABLE "fee_payment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fee_payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fee_payment_organization_id_idx" ON "fee_payment"("organization_id");

-- CreateIndex
CREATE INDEX "fee_payment_student_id_idx" ON "fee_payment"("student_id");

-- CreateIndex
CREATE INDEX "fee_payment_org_month_year_idx" ON "fee_payment"("organization_id", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "fee_payment_student_month_year_idx" ON "fee_payment"("student_id", "month", "year");

-- AddForeignKey
ALTER TABLE "fee_payment" ADD CONSTRAINT "fee_payment_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_payment" ADD CONSTRAINT "fee_payment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

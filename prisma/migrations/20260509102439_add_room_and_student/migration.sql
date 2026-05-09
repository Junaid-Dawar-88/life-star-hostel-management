-- CreateTable
CREATE TABLE "room" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "seat_type" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "father_name" TEXT NOT NULL,
    "nic" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "guardian_phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "fee" INTEGER NOT NULL DEFAULT 0,
    "remaining_fee" INTEGER NOT NULL DEFAULT 0,
    "picture" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "room_organization_id_idx" ON "room"("organization_id");

-- CreateIndex
CREATE INDEX "room_floor_idx" ON "room"("floor");

-- CreateIndex
CREATE INDEX "room_org_floor_idx" ON "room"("organization_id", "floor");

-- CreateIndex
CREATE INDEX "student_organization_id_idx" ON "student"("organization_id");

-- CreateIndex
CREATE INDEX "student_room_id_idx" ON "student"("room_id");

-- CreateIndex
CREATE INDEX "student_nic_idx" ON "student"("nic");

-- CreateIndex
CREATE INDEX "student_org_room_idx" ON "student"("organization_id", "room_id");

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

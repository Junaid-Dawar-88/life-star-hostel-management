-- AlterTable: add day_of_week column with default 0 (Monday)
ALTER TABLE "food_menu" ADD COLUMN "day_of_week" INTEGER NOT NULL DEFAULT 0;

-- DropIndex: remove old unique constraint (org + meal_type)
DROP INDEX IF EXISTS "food_menu_org_meal_type_idx";

-- CreateIndex: new unique constraint (org + day + meal_type)
CREATE UNIQUE INDEX "food_menu_org_day_meal_type_idx" ON "food_menu"("organization_id", "day_of_week", "meal_type");

-- CreateIndex: index for org + day lookups
CREATE INDEX "food_menu_organization_day_idx" ON "food_menu"("organization_id", "day_of_week");

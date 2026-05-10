-- Change meal_type from MealType enum to plain TEXT
ALTER TABLE "food_menu" ALTER COLUMN "meal_type" TYPE TEXT USING "meal_type"::TEXT;

-- Drop the MealType enum type (no longer needed)
DROP TYPE IF EXISTS "MealType";

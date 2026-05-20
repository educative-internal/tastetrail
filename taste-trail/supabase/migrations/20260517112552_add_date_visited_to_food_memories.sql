/*
  # Add date_visited column to food_memories

  1. Modified Tables
    - `food_memories`
      - Added `date_visited` (date, nullable) - The date the food experience occurred

  2. Important Notes
    - Column is nullable to maintain compatibility with existing rows
    - Existing rows will have NULL for date_visited
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'food_memories' AND column_name = 'date_visited'
  ) THEN
    ALTER TABLE food_memories ADD COLUMN date_visited date;
  END IF;
END $$;

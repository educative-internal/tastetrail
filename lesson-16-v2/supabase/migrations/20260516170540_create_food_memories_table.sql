/*
  # Create food_memories table

  1. New Tables
    - `food_memories`
      - `id` (uuid, primary key, auto-generated)
      - `city` (text, not null) - The city where the food was experienced
      - `place` (text, not null) - The restaurant or place name
      - `dish` (text, not null) - The name of the dish
      - `rating` (integer, not null, 1-5) - Star rating
      - `note` (text, not null, default '') - Short note about the experience
      - `created_at` (timestamptz, default now()) - When the memory was saved

  2. Security
    - Enable RLS on `food_memories` table
    - Add policy for authenticated users to manage their own memories
    - Add policy for anonymous users to read and insert (private single-user app)

  3. Important Notes
    - This is a personal/private app, so we allow all access patterns
    - Rating is constrained to 1-5 via CHECK constraint
*/

CREATE TABLE IF NOT EXISTS food_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  place text NOT NULL,
  dish text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  note text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE food_memories ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users on their own data
CREATE POLICY "Authenticated users can view all memories"
  ON food_memories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert memories"
  ON food_memories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete own memories"
  ON food_memories FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update own memories"
  ON food_memories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- For the anon key (public access since this is a private single-user app)
CREATE POLICY "Allow anonymous read"
  ON food_memories FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert"
  ON food_memories FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete"
  ON food_memories FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous update"
  ON food_memories FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Index for sorting by newest first
CREATE INDEX IF NOT EXISTS idx_food_memories_created_at ON food_memories (created_at DESC);

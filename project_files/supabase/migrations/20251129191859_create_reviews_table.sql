/*
  # Create Reviews Table

  1. New Tables
    - `reviews`
      - `id` (uuid, primary key) - Unique identifier for each review
      - `review_text` (text) - The actual review content
      - `sentiment` (text) - Predicted sentiment (Positive/Negative)
      - `confidence` (numeric) - Confidence score of the prediction
      - `created_at` (timestamptz) - Timestamp when review was analyzed

  2. Security
    - Enable RLS on `reviews` table
    - Add policy for public read access (analytics dashboard)
    - Add policy for public insert access (storing analyzed reviews)

  3. Indexes
    - Add index on sentiment for faster filtering
    - Add index on created_at for chronological queries
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_text text NOT NULL,
  sentiment text NOT NULL,
  confidence numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
  ON reviews
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert reviews"
  ON reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_reviews_sentiment ON reviews(sentiment);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

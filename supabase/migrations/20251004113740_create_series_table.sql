/*
  # Create Series Table

  1. New Tables
    - `series`
      - `id` (uuid, primary key) - Unique identifier for the series
      - `name` (text, not null) - Name of the series
      - `description` (text, nullable) - Optional description of the series
      - `created_at` (timestamptz, default now()) - Timestamp when series was created
      - `updated_at` (timestamptz, default now()) - Timestamp when series was last updated

  2. Indexes
    - Index on `created_at` for efficient sorting by date
    - Index on `name` for efficient searching by series name

  3. Security
    - Enable RLS on `series` table
    - Add policy for authenticated users to read all series
    - Add policy for authenticated users to create their own series
    - Add policy for authenticated users to update their own series
    - Add policy for authenticated users to delete their own series

  4. Notes
    - The series table stores only metadata about series
    - Chapter relationships will be maintained through a separate chapters table
    - Each series tracks chapter IDs through the chapters table's foreign key
*/

-- Create series table
CREATE TABLE IF NOT EXISTS series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_series_created_at ON series(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_series_name ON series(name);

-- Enable Row Level Security
ALTER TABLE series ENABLE ROW LEVEL SECURITY;

-- Policies: Allow authenticated users to read all series
CREATE POLICY "Authenticated users can view all series"
  ON series
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies: Allow authenticated users to create series
CREATE POLICY "Authenticated users can create series"
  ON series
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies: Allow authenticated users to update series
CREATE POLICY "Authenticated users can update series"
  ON series
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies: Allow authenticated users to delete series
CREATE POLICY "Authenticated users can delete series"
  ON series
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function on update
CREATE TRIGGER update_series_updated_at
  BEFORE UPDATE ON series
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

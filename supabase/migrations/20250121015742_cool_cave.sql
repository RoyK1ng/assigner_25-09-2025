/*
  # Initial Schema Setup

  1. Tables
    - users: Stores user information and status
    - cases: Stores case information and assignments
  
  2. Security
    - Enable RLS on both tables
    - Add policies for user access control
    - Add policies for case management
  
  3. Initial Data
    - Create admin user
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  is_admin boolean DEFAULT false,
  status text DEFAULT 'FREE',
  last_free_time timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES users(id),
  status text DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Create admin user
INSERT INTO users (username, password, is_admin)
VALUES ('admin', 'admin123456', true)
ON CONFLICT (username) DO NOTHING;

-- Policies for users table
CREATE POLICY "Users can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own status"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies for cases table
CREATE POLICY "Users can read all cases"
  ON cases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can update cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can delete cases"
  ON cases FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND is_admin = true
  ));
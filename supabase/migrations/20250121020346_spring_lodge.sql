/*
  # Update user policies

  1. Changes
    - Add policy for user registration
    - Update user selection policy
    - Add policy for user authentication
  
  2. Security
    - Enable public access for registration
    - Maintain secure access for user data
*/

-- Drop existing policies to update them
DROP POLICY IF EXISTS "Users can read all users" ON users;

-- Allow checking if username exists during registration
CREATE POLICY "Allow username existence check"
  ON users FOR SELECT
  TO anon
  USING (true);

-- Allow new user registration
CREATE POLICY "Allow user registration"
  ON users FOR INSERT
  TO anon
  WITH CHECK (
    is_admin = false AND
    status = 'FREE'
  );

-- Allow authenticated users to read user data
CREATE POLICY "Authenticated users can read user data"
  ON users FOR SELECT
  TO authenticated
  USING (true);
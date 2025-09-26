import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { KeyRound, UserPlus, LogIn } from 'lucide-react';
import { UserContext } from '../context/userContext';

export function LoginForm() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
  const reason = localStorage.getItem('logoutReason');
  if (reason === 'idle') {
    setError('Sesión cerrada por inactividad.');
    localStorage.removeItem('logoutReason');
  }
}, []);

  const validateForm = () => {
    if (!username || !password) {
      setError('Please fill in all fields');
      return false;
    }
    if (isRegistering) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }
    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    try {
      if (isRegistering) {
        // Check if username already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('username')
          .eq('username', username)
          .single();

        if (existingUser) {
          setError('Username already exists');
          return;
        }

        // Create user in users table
        const { error: userError } = await supabase
          .from('users')
          .insert([
            {
              username,
              password,
              is_admin: false,
              status: 'FREE',
              user_type: 'OE'
            }
          ]);

        if (userError) {
          setError(userError.message);
          return;
        }

        // Sign up with Supabase Auth
        const { error: authError } = await supabase.auth.signUp({
          email: `${username}@temp.com`,
          password: password
        });

        if (authError) {
          setError(authError.message);
          return;
        }

        setSuccess('Registration successful! You can now login.');
        setIsRegistering(false);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        return;
      }

      // Login
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (userError || !user) {
        setError('Invalid username or password');
        return;
      }

      // Sign in with Supabase Auth
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: `${username}@temp.com`,
        password: password
      });

      if (authError) {
        setError(authError.message);
        return;
      }
      
// Actualizar availability a ON_SITE
      const { error: updateError } = await supabase
        .from('users')
        .update({ availability: 'ON_SITE' })
        .eq('id', user.id);
      
      if (updateError) {
        setError('Error updating availability: ' + updateError.message);
        return;
      }
// Fin Update
      
      if (user.is_admin) {
      navigate('/oeadmin' );
      //setUserType(user.user_type);

    } else {
      navigate('/oedashboard');
    }
      
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="flex items-center justify-center mb-8">
         <img 
                  src="https://s3-media0.fl.yelpcdn.com/bphoto/hjP-WvOROtjHRLDv6kralQ/l.jpg" 
                  alt="Logo" 
                  className="h-12 w-auto ml-50" 
                />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">
          {isRegistering ? 'Register' : 'Login'}
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {isRegistering && (
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200 flex items-center justify-center"
          >
            {isRegistering ? (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Register
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Login
              </>
            )}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={toggleMode}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isRegistering
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
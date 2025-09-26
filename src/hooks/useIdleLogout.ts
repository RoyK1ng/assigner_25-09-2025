import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function useIdleLogout(timeout = 4 * 60 * 60 * 1000) { // 4 hours in ms
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const logout = async () => {
    try {
      // Get the current session to retrieve the user's email
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const email = session.user.email;
        const username = email?.split('@')[0];

        // Update the user's availability to 'OFF' in the users table
        const { error: updateError } = await supabase
          .from('users')
          .update({ availability: 'OFF', status:"BUSY" })
          .eq('username', username);

        if (updateError) {
          console.error('Error updating user availability:', updateError.message);
        }
      }

      // Proceed with signing out
      await supabase.auth.signOut();
      localStorage.setItem('logoutReason', 'idle');
      window.location.reload();
      navigate('/login');
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      console.log('User logged out due to inactivity');
    } catch (err) {
      console.error('Unexpected error during idle logout:', err);
    }
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(logout, timeout);
  };
}
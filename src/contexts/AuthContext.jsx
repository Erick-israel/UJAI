
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle email confirmation redirect
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at && !session?.user?.last_sign_in_at) {
          // This condition might need adjustment based on how Supabase handles the first sign-in after confirmation.
          // The goal is to redirect only once after the email is confirmed and it's the first effective sign-in.
          const params = new URLSearchParams(window.location.hash.substring(1)); // Supabase uses hash for recovery
          const type = params.get('type');
          if (type === 'recovery') { // Supabase email confirmation links might be treated as 'recovery' type
             // window.location.replace('/login'); // Redirect to login page
          }
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    loading,
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signUp: (data) => {
      const redirectTo = `${window.location.origin}/login`;
      return supabase.auth.signUp({
        ...data,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
    },
    signOut: () => supabase.auth.signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

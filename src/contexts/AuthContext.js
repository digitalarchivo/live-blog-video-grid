import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { 
  startAuthentication, 
  startRegistration
} from '@simplewebauthn/browser';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const registerPasskey = async (username) => {
    try {
      // Get registration options from server
      const response = await fetch('/api/auth/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      
      const options = await response.json();
      
      // Start registration
      const attResp = await startRegistration(options);
      
      // Send registration result to server
      const verificationResponse = await fetch('/api/auth/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          response: attResp
        })
      });
      
      const verification = await verificationResponse.json();
      
      if (verification.verified) {
        // Create Supabase user
        const { data, error } = await supabase.auth.signUp({
          email: `${username}@passkey.local`,
          password: crypto.randomUUID(), // Random password for passkey auth
          options: {
            data: {
              username,
              passkey_registered: true
            }
          }
        });
        
        if (error) throw error;
        return { success: true, user: data.user };
      } else {
        throw new Error('Passkey registration failed');
      }
    } catch (error) {
      console.error('Passkey registration error:', error);
      throw error;
    }
  };

  const authenticatePasskey = async () => {
    try {
      // Get authentication options from server
      const response = await fetch('/api/auth/authenticate/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const options = await response.json();
      
      // Start authentication
      const authResp = await startAuthentication(options);
      
      // Send authentication result to server
      const verificationResponse = await fetch('/api/auth/authenticate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: authResp })
      });
      
      const verification = await verificationResponse.json();
      
      if (verification.verified) {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: `${verification.username}@passkey.local`,
          password: verification.password
        });
        
        if (error) throw error;
        return { success: true, user: data.user };
      } else {
        throw new Error('Passkey authentication failed');
      }
    } catch (error) {
      console.error('Passkey authentication error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    registerPasskey,
    authenticatePasskey,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../services/api/client.ts';
import { signInWithGoogle, signOut, syncUserProfile } from '../services/api.ts';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from 'types';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAuthLoading: boolean;
  isProfileLoading: boolean;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const mountedRef = useRef(true);
  const loadingProfileRef = useRef(false);

  /**
   * 🔹 Carga de perfil segura (sin forzar logout)
   */
  const loadProfile = async (user: User) => {
    if (loadingProfileRef.current) return;

    try {
      loadingProfileRef.current = true;
      setIsProfileLoading(true);

      const profileData = await syncUserProfile(user);

      if (mountedRef.current && profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Profile sync error:', error);

    } finally {
      if (mountedRef.current) {
        setIsProfileLoading(false);
      }
      loadingProfileRef.current = false;
    }
  };

  /**
   * 🔹 Inicialización + Listener de auth
   */
  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (!mountedRef.current) return;

        setSession(data.session);

        if (data.session?.user) {
          await loadProfile(data.session.user);
        }
      } catch (error) {
        console.error('Initial session error:', error);
      } finally {
        if (mountedRef.current) {
          setIsAuthLoading(false);
        }
      }
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mountedRef.current) return;

        setSession(session);

        switch (event) {
          case 'SIGNED_IN':
          case 'INITIAL_SESSION':
            if (session?.user) {
              loadProfile(session.user);
            }
            break;

          case 'SIGNED_OUT':
            setProfile(null);
            break;

          // TOKEN_REFRESHED no necesita recargar perfil
          default:
            break;
        }
      }
    );

    return () => {
      mountedRef.current = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  /**
   * 🔹 Logout controlado
   */
  const logout = async () => {
    try {
      await signOut();
      setProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    session,
    user: session?.user ?? null,
    profile,
    isAuthLoading,
    isProfileLoading,
    isAuthenticated: !!session,
    signIn: signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * 🔹 Hook seguro
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
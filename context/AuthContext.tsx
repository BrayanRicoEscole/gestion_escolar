import React, { createContext, useContext, useEffect, useState } from 'react';
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

  // 🔹 Inicialización
  useEffect(() => {
  let mounted = true;
  console.log("Auth loaded ")
  const init = async () => {
    const { data } = await supabase.auth.getSession();

    if (!mounted) return;

    setSession(data.session);
    console.log(data.session)
    if (data.session?.user) {
      await loadProfile(data.session.user);
    }

    setIsAuthLoading(false);
  };

  init();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_, session) => {
    if (!mounted) return;

    setSession(session);

    if (session?.user) {
      console.log(session)
      await loadProfile(session.user);
    } else {
      setProfile(null);
    }
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

 const loadProfile = async (user: User) => {
  try {
    setIsProfileLoading(true);

    const profile = await syncUserProfile(user);

    if (!profile) {
      throw new Error("Profile not found");
    }

    setProfile(profile);
  } catch (err) {
    console.error('Profile sync error:', err);
    await supabase.auth.signOut();
  } finally {
    setIsProfileLoading(false);
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
    logout: async () => {
      await signOut();
      setProfile(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
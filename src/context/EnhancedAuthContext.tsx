import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Profile, authService } from '../services/enhancedAuthService';

interface AuthContextType {
  user: User | null;
  session: any | null;
  profile: Profile | null;
  role: string | null;
  loading: boolean;
  isAdmin: boolean;
  isClient: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (data: any) => Promise<{ error: string | null }>;
  adminSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Prevent auth initialization from getting stuck forever due to network/db issues.
  const withTimeout = async <T,>(
    promise: Promise<T>,
    ms: number,
    timeoutErrorMessage: string
  ): Promise<T> => {
    let timeoutId: number | undefined;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = window.setTimeout(() => reject(new Error(timeoutErrorMessage)), ms);
    });
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
    }
  };

  // Computed states
  const isAdmin = role === 'admin';
  const isClient = role === 'client';
  const isAuthenticated = !!user && !!profile;

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      const { profile: userProfile, error } = await withTimeout(
        authService.getProfile(userId),
        6000,
        'Profile fetch timed out'
      );
      
      if (error) {
        console.error('❌ Profile fetch error:', error);
        setProfile(null);
        setRole(null);
        
        // Try to create profile if it doesn't exist.
        // Supabase error messages vary depending on query shape, so keep this permissive.
        if (
          error.includes('No rows returned') ||
          error.includes('not found') ||
          error.includes('0 rows') ||
          error.includes('Results contain 0 rows') ||
          error.includes('Row not found')
        ) {
          console.log('📝 Profile not found, attempting to create...');
          await createFallbackProfile(userId);
        }
      } else if (userProfile) {
        console.log('✅ Profile fetched successfully:', userProfile);
        setProfile(userProfile);
        setRole(userProfile.role);
        
        // Validate role is either 'client' or 'admin'
        if (!['client', 'admin'].includes(userProfile.role)) {
          console.warn('⚠️ Invalid role detected, defaulting to client');
          setRole('client');
        }
      } else {
        console.warn('⚠️ Profile is null, attempting to create...');
        await createFallbackProfile(userId);
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      setProfile(null);
      setRole(null);
    }
  };

  const createFallbackProfile = async (userId: string) => {
    try {
      console.log('🔧 Creating fallback profile for user:', userId);
      const userResponse = await withTimeout(
        supabase.auth.getUser(),
        6000,
        'Fallback profile fetch timed out'
      );
      
      if (userResponse.data?.user) {
        const insertResult = supabase
          .from('profiles')
          .insert([
            {
              id: userResponse.data.user.id,
              full_name: userResponse.data.user.user_metadata?.full_name || 'Unknown User',
              email: userResponse.data.user.email || '',
              role: userResponse.data.user.user_metadata?.role || 'client',
            }
          ]);
        
        const { error: createError } = await withTimeout(
          insertResult,
          6000,
          'Fallback profile insert timed out'
        );

        if (!createError) {
          console.log('✅ Profile created successfully in fallback');
          // Fetch the newly created profile
          await fetchProfile(userId);
        } else {
          console.error('❌ Failed to create profile in fallback:', createError);
        }
      }
    } catch (fallbackError) {
      console.error('❌ Fallback profile creation failed:', fallbackError);
    }
  };

  useEffect(() => {
    if (initialized) return;
    
    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing authentication...');
        
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('📱 Initial session:', session ? 'Found' : 'Not found');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 User found, fetching profile...');
          await fetchProfile(session.user.id);
        } else {
          console.log('👤 No user in session');
          setProfile(null);
          setRole(null);
        }
        
        setInitialized(true);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 User authenticated, fetching profile...');
          await fetchProfile(session.user.id);
          // Add a small delay to ensure profile state is updated
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          console.log('👤 User signed out');
          setProfile(null);
          setRole(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await authService.signIn(email, password);
      
      if (error) {
        console.error('❌ Sign in failed:', error);
        return { error };
      }
      
      console.log('✅ Sign in successful');
      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected sign in error:', error);
      return { error: 'An unexpected error occurred during sign in' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: any) => {
    try {
      setLoading(true);
      const { error } = await authService.signUp(data);
      
      if (error) {
        console.error('❌ Sign up failed:', error);
        return { error };
      }
      
      console.log('✅ Sign up successful');
      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected sign up error:', error);
      return { error: 'An unexpected error occurred during sign up' };
    } finally {
      setLoading(false);
    }
  };

  const adminSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user: adminUser, profile: adminProfile, error } = await authService.adminSignIn(email, password);
      
      if (error) {
        console.error('❌ Admin sign in failed:', error);
        return { error };
      }

      // The database already confirmed role === 'admin'. Set it right away so the
      // admin route guard doesn't have to wait for the auth listener.
      if (adminUser && adminProfile) {
        setUser(adminUser);
        setProfile(adminProfile);
        setRole(adminProfile.role);
      }
      
      console.log('✅ Admin sign in successful');
      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected admin sign in error:', error);
      return { error: 'An unexpected error occurred during admin sign in' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole(null);
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      console.log('🔄 Refreshing profile...');
      await fetchProfile(user.id);
    }
  };

  const value = {
    user,
    session,
    profile,
    role,
    loading,
    isAdmin,
    isClient,
    isAuthenticated,
    signOut,
    refreshProfile,
    signIn,
    signUp,
    adminSignIn,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Profile, authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  session: any | null;
  profile: Profile | null;
  role: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
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

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      const { profile: userProfile, error } = await authService.getProfile(userId);
      
      if (error) {
        console.error('❌ Profile fetch error:', error);
        setProfile(null);
        setRole(null);
        
        // Try to create profile if it doesn't exist
        if (error.includes('No rows returned') || error.includes('not found')) {
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
      const userResponse = await supabase.auth.getUser();
      
      if (userResponse.data?.user) {
        const { error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userResponse.data.user.id,
              full_name: userResponse.data.user.user_metadata?.full_name || 'Unknown User',
              email: userResponse.data.user.email || '',
              role: userResponse.data.user.user_metadata?.role || 'client',
            }
          ]);

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
    signOut,
    refreshProfile,
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

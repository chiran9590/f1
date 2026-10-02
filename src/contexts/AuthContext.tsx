import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: any;
  role: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, fullName: string, username: string, golf_course?: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
        setRole(null);
      } else {
        setProfile(data);
        setRole(data?.role || null);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setProfile(null);
      setRole(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        if (!supabase) {
          console.warn('Supabase client not initialized');
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          setUser(session?.user ?? null);
          
          // Fetch user profile and role if user exists
          if (session?.user) {
            fetchUserProfile(session.user.id);
          } else {
            setProfile(null);
            setRole(null);
          }
          
          setLoading(false);
        }
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event: string, session: Session | null) => {
            if (mounted) {
              setUser(session?.user ?? null);
              
              // Fetch user profile and role if user exists
              if (session?.user) {
                fetchUserProfile(session.user.id);
              } else {
                setProfile(null);
                setRole(null);
              }
              
              setLoading(false);
            }
          }
        );

        return () => {
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      if (!supabase) {
        return { error: new Error('Supabase client not initialized') };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Login error:', error);
        return { error };
      }
      
      if (data.user && !data.user.email_confirmed_at) {
        return { error: new Error('Please verify your email before logging in. Check your inbox for the verification link.') };
      }
      
      // Fetch user profile after successful login
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
      
      // Don't navigate here - let the calling component handle navigation
      return { error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { error };
    }
  };

  const register = async (email: string, password: string, fullName: string, username: string, golf_course?: string) => {
    try {
      if (!supabase) {
        return { error: new Error('Supabase client not initialized') };
      }
      
      console.log('Starting registration for:', email);
      
      // Register user with Supabase Auth with email confirmation
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: fullName,
            username: username,
            golf_course: golf_course,
          },
        },
      });

      if (error) {
        console.error('Supabase Auth registration error:', error);
        return { error };
      }

      console.log('User created in Supabase Auth:', user?.id);
      
      // Store additional user details in custom users table
      if (user) {
        console.log('Creating user profile in custom table...');
        
        try {
          // Try direct insert first
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || email,
              full_name: fullName,
              username: username,
              golf_course: golf_course,
              role: 'client',
              created_at: new Date().toISOString(),
            });
          
          if (profileError) {
            console.error('Profile creation error:', profileError);
            console.warn('User created in auth but profile creation failed');
            console.log('Profile error details:', profileError);
          } else {
            console.log('User profile created successfully in database');
          }
        } catch (profileError) {
          console.error('Profile creation exception:', profileError);
          console.warn('User created in auth but profile creation failed');
        }
      }

      console.log('Registration process completed for user:', user?.id);
      return { error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { error };
    }
  };

  const logout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    profile,
    role,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  role: 'admin' | 'client';
  created_at: string;
  updated_at: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  username: string;
}

export interface AuthResponse {
  user: User | null;
  profile: Profile | null;
  error: string | null;
}

class AuthService {
  async signUp({ email, password, fullName, username }: SignUpData): Promise<AuthResponse> {
    try {
      console.log('Starting signup for:', email);
      
      // Step 1: Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { full_name: fullName, username }
        }
      });

      if (error) {
        console.error('Auth signup error:', error);
        return { user: null, profile: null, error: error.message };
      }

      if (!data.user) {
        console.error('No user created');
        return { user: null, profile: null, error: 'Failed to create user account' };
      }

      console.log('User created successfully:', data.user.id);

      // Step 2: Create profile record with only required columns
      const profileData: any = {
        id: data.user.id,
        full_name: fullName,
        username: username,
        email: data.user.email || null,
        role: 'client',
      };

      // Check what columns actually exist and add them dynamically
      try {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);

        if (existingProfile && existingProfile.length > 0) {
          const existingColumns = Object.keys(existingProfile[0]);
          
          // Only add columns that exist in the table
          if (existingColumns.includes('created_at')) {
            profileData.created_at = new Date().toISOString();
          }
          
          if (existingColumns.includes('updated_at')) {
            profileData.updated_at = new Date().toISOString();
          }
          
          if (existingColumns.includes('email_confirmed_at')) {
            profileData.email_confirmed_at = new Date().toISOString();
          }
        }
      } catch (columnCheckError) {
        console.log('Could not check columns, using minimal profile data');
      }

      console.log('Creating profile with data:', profileData);

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([profileData]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        
        // Try to clean up the auth user
        try {
          await supabase.auth.admin.deleteUser(data.user.id);
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user:', cleanupError);
        }
        
        return { 
          user: null, 
          profile: null, 
          error: `Failed to create user profile: ${profileError.message}` 
        };
      }

      console.log('Profile created successfully');

      return { 
        user: data.user, 
        profile: {
          id: data.user.id,
          full_name: fullName,
          username: username,
          email: data.user.email || null,
          avatar_url: null,
          role: 'client',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, 
        error: null 
      };

    } catch (error) {
      console.error('Signup error:', error);
      return { 
        user: null, 
        profile: null, 
        error: `An unexpected error occurred during signup: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, profile: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, profile: null, error: 'Invalid login credentials' };
      }

      // EMAIL VERIFICATION DISABLED - Allow login without email confirmation
      // if (!data.user.email_confirmed_at) {
      //   await supabase.auth.signOut();
      //   return { 
      //     user: null, 
      //     profile: null, 
      //     error: 'Please verify your email before logging in. Check your inbox for the verification link.' 
      //   };
      // }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        // Don't fail login if profile fetch fails, just return user without profile
      }

      return { user: data.user, profile: profile || null, error: null };
    } catch (error) {
      console.error('Signin error:', error);
      return { user: null, profile: null, error: 'An unexpected error occurred during login' };
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error) {
      console.error('Signout error:', error);
      return { error: 'An unexpected error occurred during signout' };
    }
  }

  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      return { error: error?.message || null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: 'An unexpected error occurred during password reset' };
    }
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<{ error: string | null }> {
    try {
      const updateData = { ...updates };
      
      // Add updated_at if it exists in the table
      try {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('updated_at')
          .limit(1);

        if (existingProfile && existingProfile.length > 0) {
          const existingColumns = Object.keys(existingProfile[0]);
          
          if (existingColumns.includes('updated_at')) {
            updateData.updated_at = new Date().toISOString();
          }
        }
      } catch (columnCheckError) {
        console.log('Could not check updated_at column');
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      return { error: error?.message || null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: 'An unexpected error occurred during profile update' };
    }
  }

  async getProfile(userId: string): Promise<{ profile: Profile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return { profile: data || null, error: error?.message || null };
    } catch (error) {
      console.error('Get profile error:', error);
      return { profile: null, error: 'An unexpected error occurred while fetching profile' };
    }
  }
}

export const authService = new AuthService();

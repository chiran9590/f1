import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  created_at: string;
  role: 'admin' | 'client';
  password: string;
  confirm_password: string | null;
  email_confirmed_at: string | null;
  username: string | null;
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
      
      // Step 1: Create profile record directly in your custom profiles table
      const profileData = {
        id: crypto.randomUUID(), // Generate UUID for profile
        full_name: fullName,
        email: email,
        password: password, // Store password in your custom table
        confirm_password: password, // Store confirm password
        username: username,
        role: 'client',
        email_confirmed_at: new Date().toISOString(), // Auto-verify
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Creating profile with data:', { ...profileData, password: '[HIDDEN]' });

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { 
          user: null, 
          profile: null, 
          error: `Failed to create user profile: ${profileError.message}` 
        };
      }

      console.log('Profile created successfully:', profile.id);

      // Step 2: Create auth user (without storing password in auth.users)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { 
            full_name: fullName, 
            username,
            profile_id: profile.id // Link to your custom profile
          }
        }
      });

      if (error) {
        console.error('Auth signup error:', error);
        // Clean up profile if auth creation fails
        await supabase.from('profiles').delete().eq('id', profile.id);
        return { user: null, profile: null, error: error.message };
      }

      if (!data.user) {
        console.error('No auth user created');
        // Clean up profile if auth creation fails
        await supabase.from('profiles').delete().eq('id', profile.id);
        return { user: null, profile: null, error: 'Failed to create auth user account' };
      }

      console.log('Auth user created successfully:', data.user.id);

      return { 
        user: data.user, 
        profile: profile, 
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
      // Step 1: Check if user exists in your custom profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        return { user: null, profile: null, error: 'User not found' };
      }

      // Step 2: Verify password (you might want to add proper hashing)
      if (profile.password !== password) {
        return { user: null, profile: null, error: 'Invalid password' };
      }

      // Step 3: Sign in with Supabase auth
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

      return { user: data.user, profile: profile, error: null };
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
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
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

  async getProfileByEmail(email: string): Promise<{ profile: Profile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      return { profile: data || null, error: error?.message || null };
    } catch (error) {
      console.error('Get profile by email error:', error);
      return { profile: null, error: 'An unexpected error occurred while fetching profile' };
    }
  }
}

export const authService = new AuthService();

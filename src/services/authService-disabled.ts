import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  role: 'admin' | 'client';
  email_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { full_name: fullName, username }
        }
      });

      if (error) {
        return { user: null, profile: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, profile: null, error: 'Failed to create user account' };
      }

      // Create profile record (EMAIL VERIFICATION DISABLED)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            full_name: fullName,
            username: username,
            email: data.user.email || null,
            role: 'client', // Default role for new users
            email_confirmed_at: new Date().toISOString(), // AUTO-VERIFIED
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ]);

      if (profileError) {
        // If profile creation fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(data.user.id);
        return { user: null, profile: null, error: 'Failed to create user profile' };
      }

      return { 
        user: data.user, 
        profile: {
          id: data.user.id,
          full_name: fullName,
          username: username,
          email: data.user.email || null,
          avatar_url: null,
          role: 'client',
          email_confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, 
        error: null 
      };

    } catch (error) {
      console.error('Signup error:', error);
      return { user: null, profile: null, error: 'An unexpected error occurred during signup' };
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
}

export const authService = new AuthService();

import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  golf_course?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role?: string;
  golf_course?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User | null;
  profile: Profile | null;
  error: string | null;
}

class AuthService {
  async signUp({ email, password, fullName, role = 'client', golf_course, phone }: SignUpData): Promise<AuthResponse> {
    try {
      console.log('Starting client registration...');
      console.log('Registration data:', { email, fullName, role, golf_course, phone });
      
      // Step 1: Sign up user with email confirmation and store all details in metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: fullName,
            role: role,
            golf_course: golf_course,
            phone: phone,
          }
        }
      });

      if (error) {
        console.error('Auth signup error:', error);
        
        // Handle specific rate limit error
        if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
          return { 
            user: null, 
            profile: null, 
            error: 'Too many sign-up attempts. Please wait a few minutes before trying again, or use a different email address.' 
          };
        }
        
        // Handle database relation errors
        if (error.message.includes('relation') || error.message.includes('does not exist')) {
          return { 
            user: null, 
            profile: null, 
            error: 'Database setup issue. Please contact support or try again later.' 
          };
        }
        
        // Handle email already in use
        if (error.message.includes('already registered') || error.message.includes('duplicate')) {
          return { 
            user: null, 
            profile: null, 
            error: 'This email is already registered. Please try logging in instead.' 
          };
        }
        
        // Handle user already exists
        if (error.message.includes('user_already_exists')) {
          return { 
            user: null, 
            profile: null, 
            error: 'An account with this email already exists. Please try logging in or use a different email.' 
          };
        }
        
        return { user: null, profile: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, profile: null, error: 'Failed to create user account' };
      }

      console.log('User created successfully, ID:', data.user.id);

      // Step 2: Verify profile was created by trigger
      console.log('Checking if profile was created in database...');
      
      // Wait a moment for the trigger to execute
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if profile was created by trigger
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileCheckError && profileCheckError.code !== 'PGRST116') {
        console.error('Profile check error:', profileCheckError);
      }

      if (!existingProfile) {
        console.log('Profile not found in database, creating manually...');
        // Manual profile creation as fallback - matching exact table structure
        const { error: manualProfileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: fullName,
              email: data.user.email,
              phone: phone,
              golf_course: golf_course,
              role: role,
            }
          ]);

        if (manualProfileError) {
          console.error('Manual profile creation failed:', manualProfileError);
          return { 
            user: data.user, 
            profile: null, 
            error: 'Account created but profile setup failed. Please contact support.' 
          };
        } else {
          console.log('Profile created manually');
        }
      } else {
        console.log('Profile created successfully by trigger with all details:', existingProfile);
      }

      // Step 3: Return success with profile data
      const finalProfile = existingProfile || {
        id: data.user.id,
        full_name: fullName,
        email: data.user.email || '',
        role: role,
        golf_course: golf_course,
        phone: phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Registration completed successfully');
      return { 
        user: data.user, 
        profile: finalProfile, 
        error: null 
      };

    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle network or other errors
      if (error.message?.includes('rate limit') || error.message?.includes('too many requests')) {
        return { 
          user: null, 
          profile: null, 
          error: 'Service temporarily unavailable due to high demand. Please try again in a few minutes.' 
        };
      }
      
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
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          return { user: null, profile: null, error: 'Invalid email or password. Please check your credentials and try again.' };
        }
        if (error.message.includes('Email not confirmed')) {
          return { user: null, profile: null, error: 'Please verify your email before logging in. Check your inbox for the verification link.' };
        }
        return { user: null, profile: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, profile: null, error: 'Invalid login credentials' };
      }

      // Check if email is verified
      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        return { 
          user: null, 
          profile: null, 
          error: 'Please verify your email before logging in. Check your inbox for the verification link. If you did not receive the email, please check your spam folder or request a new verification email.' 
        };
      }

      // CRITICAL: Verify user exists in profiles table (registered client)
      let profile = null;
      let profileError = null;
      
      try {
        const { data: profileData, error: fetchError } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, golf_course, role, created_at, updated_at')
          .eq('id', data.user.id)
          .single();
        
        if (fetchError) {
          profileError = fetchError;
        } else if (!profileData) {
          // User not found in profiles table - not a registered client
          await supabase.auth.signOut();
          return { 
            user: null, 
            profile: null, 
            error: 'Account not found in our client database. Please register first to access the dashboard.' 
          };
        } else {
          // Transform data to match frontend interface
          profile = {
            id: profileData.id,
            full_name: profileData.full_name || '',
            email: profileData.email || '',
            role: profileData.role || 'client',
            golf_course: profileData.golf_course || undefined,
            phone: profileData.phone || undefined,
            created_at: profileData.created_at || new Date().toISOString(),
            updated_at: profileData.updated_at || new Date().toISOString(),
          };
        }
      } catch (err) {
        console.error('Profile fetch exception:', err);
        profileError = err;
      }

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        await supabase.auth.signOut();
        return { 
          user: null, 
          profile: null, 
          error: 'Failed to verify client account. Please contact support.' 
        };
      }

      // Verify user role is 'client'
      if (profile && profile.role !== 'client') {
        await supabase.auth.signOut();
        return { 
          user: null, 
          profile: null, 
          error: 'Access denied. Only registered clients can access the dashboard.' 
        };
      }

      return { 
        user: data.user, 
        profile: profile, 
        error: null 
      };

    } catch (error) {
      console.error('Signin error:', error);
      return { user: null, profile: null, error: 'An unexpected error occurred during login. Please try again.' };
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
      return { error: 'An unexpected error occurred while sending reset email' };
    }
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      return { error: error?.message || null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: 'An unexpected error occurred while updating profile' };
    }
  }

  async getProfile(userId: string): Promise<{ profile: Profile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, golf_course, role, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        return { profile: null, error: error.message };
      }

      // Transform data to match frontend interface
      const profile: Profile = {
        id: data.id,
        full_name: data.full_name || '',
        email: data.email || '',
        role: data.role || 'client',
        golf_course: data.golf_course || undefined,
        phone: data.phone || undefined,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
      };

      return { profile, error: null };
    } catch (error) {
      console.error('Get profile error:', error);
      return { profile: null, error: 'An unexpected error occurred while fetching profile' };
    }
  }
}

export const authService = new AuthService();

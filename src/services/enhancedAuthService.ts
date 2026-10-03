import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  club_id?: string;
  created_at: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role?: string;
}

export interface AuthResponse {
  user: User | null;
  profile: Profile | null;
  error: string | null;
}

export interface AdminAuthResponse {
  user: User | null;
  profile: Profile | null;
  error: string | null;
}

class AuthService {
  async signUp({ email, password, fullName, role = 'client' }: SignUpData): Promise<AuthResponse> {
    try {
      console.log('🚀 Starting user registration...');
      console.log('📝 Registration data:', { email, fullName, role });
      
      // Validate password strength
      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.isValid) {
        return { 
          user: null, 
          profile: null, 
          error: passwordValidation.message 
        };
      }
      
      // Step 1: Sign up user with email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });

      if (error) {
        console.error('❌ Auth signup error:', error);
        
        // Handle specific rate limit error
        if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
          return { 
            user: null, 
            profile: null, 
            error: 'Too many sign-up attempts. Please wait a few minutes before trying again, or use a different email address.' 
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
        
        return { user: null, profile: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, profile: null, error: 'Failed to create user account' };
      }

      console.log('✅ User created successfully, ID:', data.user.id);

      // Email confirmation is on, so there is no session yet and the browser cannot read or
      // write `profiles` (RLS). The database trigger already created the profile; we're done.
      if (!data.session) {
        return { user: data.user, profile: null, error: null };
      }

      // Step 2: Wait for trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 3: Verify profile was created
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError || !profileData) {
        console.log('⚠️ Profile not found, creating manually...');
        console.log('⚠️ Profile error:', profileError);
        
        // Manual profile creation as fallback using RPC to bypass RLS
        const { error: rpcError } = await supabase.rpc('create_profile_fallback', {
          user_id: data.user.id,
          p_name: fullName,
          p_email: data.user.email,
          p_role: role
        });

        if (rpcError) {
          console.error('❌ RPC profile creation failed:', rpcError);
          // Try direct insert as last resort
          const { error: manualError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                name: fullName,
                email: data.user.email,
                club_id: null,
                role: role,
              }
            ]);

          if (manualError) {
            console.error('❌ Manual profile creation failed:', manualError);
            return { 
              user: data.user, 
              profile: null, 
              error: 'Account created but profile setup failed. Please contact support.' 
            };
          }
        }
        
        // Fetch the created profile
        const { data: newProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        console.log('✅ Registration completed successfully');
        return { 
          user: data.user, 
          profile: newProfile, 
          error: null 
        };
      }

      console.log('✅ Registration completed successfully');
      return { 
        user: data.user, 
        profile: profileData, 
        error: null 
      };

    } catch (error: any) {
      console.error('❌ Signup error:', error);
      return { user: null, profile: null, error: 'An unexpected error occurred during signup' };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔑 Starting user login...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
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
          error: 'Please verify your email before logging in. Check your inbox for the verification link.' 
        };
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
        await supabase.auth.signOut();
        return { 
          user: null, 
          profile: null, 
          error: `Profile lookup failed: ${profileError.message}. Please contact support.` 
        };
      }

      if (!profileData) {
        console.log('⚠️ Profile not found during login, creating...');
        // Try to create profile on the fly
        const { error: createError } = await supabase.rpc('create_profile_fallback', {
          user_id: data.user.id,
          p_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          p_email: data.user.email || '',
          p_role: 'client'
        });

        if (createError) {
          console.error('❌ Profile creation failed during login:', createError);
          await supabase.auth.signOut();
          return { 
            user: null, 
            profile: null, 
            error: 'Profile not found and could not be created. Please contact support.' 
          };
        }

        // Fetch the newly created profile
        const { data: newProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        console.log('✅ Login successful with newly created profile');
        return { 
          user: data.user, 
          profile: newProfile, 
          error: null 
        };
      }

      console.log('✅ Login successful for:', profileData.role);
      return { 
        user: data.user, 
        profile: profileData, 
        error: null 
      };

    } catch (error) {
      console.error('❌ Signin error:', error);
      return { user: null, profile: null, error: 'An unexpected error occurred during login' };
    }
  }

  async adminSignIn(email: string, password: string): Promise<AdminAuthResponse> {
    try {
      console.log('🔐 Starting admin login...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { user: null, profile: null, error: 'Invalid admin credentials. Please check your email and password.' };
        }
        return { user: null, profile: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, profile: null, error: 'Invalid admin credentials' };
      }

      // Fetch user profile and verify admin role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profileData) {
        await supabase.auth.signOut();
        return { 
          user: null, 
          profile: null, 
          error: 'Admin account not found. Contact system administrator.' 
        };
      }

      // Verify user has admin role
      if (profileData.role !== 'admin') {
        await supabase.auth.signOut();
        return { 
          user: null, 
          profile: null, 
          error: 'Access denied. This account does not have admin privileges.' 
        };
      }

      console.log('✅ Admin login successful');
      return { 
        user: data.user, 
        profile: profileData, 
        error: null 
      };

    } catch (error) {
      console.error('❌ Admin signin error:', error);
      return { user: null, profile: null, error: 'An unexpected error occurred during admin login' };
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error) {
      console.error('❌ Signout error:', error);
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
      console.error('❌ Reset password error:', error);
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
      console.error('❌ Update profile error:', error);
      return { error: 'An unexpected error occurred while updating profile' };
    }
  }

  async getProfile(userId: string): Promise<{ profile: Profile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Profile fetch error:', error);
        return { profile: null, error: error.message };
      }

      return { profile: data, error: null };
    } catch (error) {
      console.error('❌ Get profile error:', error);
      return { profile: null, error: 'An unexpected error occurred while fetching profile' };
    }
  }

  async getAllUsers(): Promise<{ users: Profile[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Fetch users error:', error);
        return { users: [], error: error.message };
      }

      return { users: data || [], error: null };
    } catch (error) {
      console.error('❌ Get all users error:', error);
      return { users: [], error: 'An unexpected error occurred while fetching users' };
    }
  }

  async deleteUser(userId: string): Promise<{ error: string | null }> {
    try {
      // First delete from profiles (this will cascade to related tables)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        return { error: profileError.message };
      }

      // Then delete from auth.users
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        console.error('❌ Auth user deletion error:', authError);
        return { error: 'Failed to delete user from authentication system' };
      }

      return { error: null };
    } catch (error) {
      console.error('❌ Delete user error:', error);
      return { error: 'An unexpected error occurred while deleting user' };
    }
  }

  async updateUserRole(userId: string, newRole: string): Promise<{ error: string | null }> {
    try {
      if (!['client', 'admin'].includes(newRole)) {
        return { error: 'Invalid role. Must be either client or admin.' };
      }

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      return { error: error?.message || null };
    } catch (error) {
      console.error('❌ Update user role error:', error);
      return { error: 'An unexpected error occurred while updating user role' };
    }
  }

  private validatePassword(password: string): { isValid: boolean; message: string } {
    if (password.length < 8) {
      return { 
        isValid: false, 
        message: 'Password must be at least 8 characters long.' 
      };
    }

    if (!/[A-Z]/.test(password)) {
      return { 
        isValid: false, 
        message: 'Password must contain at least one uppercase letter.' 
      };
    }

    if (!/[a-z]/.test(password)) {
      return { 
        isValid: false, 
        message: 'Password must contain at least one lowercase letter.' 
      };
    }

    if (!/\d/.test(password)) {
      return { 
        isValid: false, 
        message: 'Password must contain at least one number.' 
      };
    }

    return { isValid: true, message: '' };
  }

  getPasswordStrength(password: string): { score: number; message: string; color: string } {
    let score = 0;
    const checks = [
      { test: password.length >= 8, message: '8+ characters' },
      { test: /[A-Z]/.test(password), message: 'Uppercase' },
      { test: /[a-z]/.test(password), message: 'Lowercase' },
      { test: /\d/.test(password), message: 'Number' },
      { test: /[!@#$%^&*(),.?":{}|<>]/.test(password), message: 'Special character' },
    ];

    checks.forEach(check => {
      if (check.test) score++;
    });

    const strengthLevels = [
      { score: 0-2, message: 'Very Weak', color: 'bg-red-500' },
      { score: 3, message: 'Weak', color: 'bg-orange-500' },
      { score: 4, message: 'Good', color: 'bg-yellow-500' },
      { score: 5, message: 'Strong', color: 'bg-green-500' },
    ];

    const strength = strengthLevels.find(level => score <= level.score) || strengthLevels[3];
    
    return {
      score: (score / 5) * 100,
      message: strength.message,
      color: strength.color,
    };
  }
}

export const authService = new AuthService();

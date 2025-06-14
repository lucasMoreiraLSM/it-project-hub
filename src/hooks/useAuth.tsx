
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface AuthUser extends User {
  profile?: {
    password_set: boolean;
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserWithProfile = async (userToFetch: User | null) => {
      if (!userToFetch) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('password_set')
          .eq('id', userToFetch.id)
          .single();
        
        const userWithProfile: AuthUser = {
          ...userToFetch,
          profile: data || undefined,
        };
        setUser(userWithProfile);

        if (error) {
          console.warn('Could not fetch user profile:', error.message);
        }
      } catch (e) {
        console.error('Error fetching profile', e);
        setUser(userToFetch);
      } finally {
        setLoading(false);
      }
    };
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setTimeout(() => {
        fetchUserWithProfile(currentUser);
      }, 0);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    loading,
    signOut,
  };
};

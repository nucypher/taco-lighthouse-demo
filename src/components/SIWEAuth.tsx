import { useState } from 'react';
import { SiweMessage } from 'siwe';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SIWEAuthProps {
  address: string;
  onSuccess?: () => void;
}

export const SIWEAuth = ({ address, onSuccess }: SIWEAuthProps) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async () => {
    try {
      setIsAuthenticating(true);

      // Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in with Ethereum to D-Sound',
        uri: window.location.origin,
        version: '1',
        chainId: 1,
        nonce: Math.random().toString(36).slice(2),
      });

      const messageToSign = message.prepareMessage();

      // Request signature from wallet
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [messageToSign, address],
      });

      // Verify signature with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: `${address.toLowerCase()}@ethereum.org`,
        password: signature,
      });

      if (authError) {
        // If user doesn't exist, create one
        if (authError.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: `${address.toLowerCase()}@ethereum.org`,
            password: signature,
            options: {
              data: {
                wallet_address: address,
              },
            },
          });

          if (signUpError) throw signUpError;
          if (!signUpData.user) throw new Error('Failed to create user');
        } else {
          throw authError;
        }
      }

      toast({
        title: 'Success',
        description: 'Successfully signed in with Ethereum',
      });

      onSuccess?.();
    } catch (error) {
      console.error('SIWE error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in with Ethereum',
        variant: 'destructive',
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <Button 
      onClick={handleSignIn} 
      disabled={isAuthenticating}
      className="rounded-sm font-medium"
    >
      {isAuthenticating ? 'Signing in...' : 'Sign in with Ethereum'}
    </Button>
  );
};
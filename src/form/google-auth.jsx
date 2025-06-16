// google-auth.js - Google Authentication utilities
import { useAuth } from '../context/authContext';
import { useToast } from '../hooks/use-toast';

// Google Client Configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Initialize Google Sign-In
export const initializeGoogleSignIn = () => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: resolve,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      resolve();
    } else {
      // Load Google Identity Services script if not already loaded
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: resolve,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    }
  });
};

// Custom hook for Google authentication functions
export const useGoogleAuth = () => {
  const { googleLogin, linkGoogleAccount } = useAuth();
  const { toast } = useToast();

  // Handle Google Sign-In response
  const handleGoogleResponse = async (response, isLinking = false) => {
    try {
      if (response.credential) {
        if (isLinking) {
          await linkGoogleAccount(response.credential);
        } else {
          await googleLogin(response.credential);
        }
        return { success: true };
      }
    } catch (error) {
      console.error('Google auth error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Google authentication failed',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  // Trigger Google One Tap sign-in
  const triggerGoogleOneTap = async () => {
    try {
      await initializeGoogleSignIn();
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google One Tap not displayed or skipped');
        }
      });
    } catch (error) {
      console.error('Failed to initialize Google One Tap:', error);
    }
  };

  // Trigger Google Sign-In popup
  const triggerGoogleSignIn = async (isLinking = false) => {
    try {
      return new Promise((resolve, reject) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (response) => {
            if (response.error) {
              reject(new Error(response.error));
              return;
            }

            // Convert the token to credential format your backend expects
            const result = await handleGoogleResponse(
              {
                credential: response.access_token,
              },
              isLinking
            );

            if (result.success) {
              resolve(result);
            } else {
              reject(result.error);
            }
          },
        });

        client.requestAccessToken();
      });
    } catch (error) {
      console.error('Google popup sign-in failed:', error);
      throw error;
    }
  };

  return {
    triggerGoogleSignIn,
    triggerGoogleOneTap,
    handleGoogleResponse,
  };
};

// GoogleLoginButton Component
import React from 'react';
import { Button } from '../components/ui/button';
import { GoogleCircleFilled, GoogleOutlined } from '@ant-design/icons';

export const GoogleLoginButton = ({
  isLinking = false,
  disabled = false,
  className = '',
  children,
  variant = 'outline',
  size = 'default',
}) => {
  const { triggerGoogleSignIn } = useGoogleAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await triggerGoogleSignIn(isLinking);
    } catch (error) {
      console.error('Google sign-in failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type='button'
      variant='outline'
      className='w-full'
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2'></span>
          {isLinking ? 'Linking...' : 'Signing in...'}
        </>
      ) : (
        <>
          <GoogleCircleFilled className='size-3' />
          <span className='text-xs'>
            {children ||
              (isLinking ? 'Link Google Account' : 'Continue with Google')}
          </span>
        </>
      )}
    </Button>
  );
};

// Alternative Google Sign-In Button with Google's official styling
export const GoogleOfficialButton = ({
  isLinking = false,
  onSuccess,
  onError,
  className = '',
}) => {
  const buttonRef = React.useRef(null);
  const { handleGoogleResponse } = useGoogleAuth();

  React.useEffect(() => {
    const initButton = async () => {
      try {
        await initializeGoogleSignIn();

        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            text: isLinking ? 'continue_with' : 'signin_with',
            logo_alignment: 'left',
            width: '100%',
            callback: async (response) => {
              const result = await handleGoogleResponse(response, isLinking);
              if (result.success && onSuccess) {
                onSuccess(result);
              } else if (!result.success && onError) {
                onError(result.error);
              }
            },
          });
        }
      } catch (error) {
        console.error('Failed to initialize Google button:', error);
        if (onError) onError(error);
      }
    };

    initButton();
  }, [isLinking, onSuccess, onError, handleGoogleResponse]);

  return <div ref={buttonRef} className={`w-full ${className}`} />;
};

// Usage example in Login component:
/*
import { GoogleLoginButton, GoogleOfficialButton } from './google-auth';

// In your Login component JSX:
<GoogleLoginButton 
  disabled={isLoading}
  className="mb-4"
/>

// Or using the official Google button:
<GoogleOfficialButton 
  onSuccess={(result) => {
    console.log('Google login successful:', result);
    // Handle successful login
  }}
  onError={(error) => {
    console.error('Google login failed:', error);
    // Handle error
  }}
/>
*/

// google-auth.js - Google Authentication utilities
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/use-toast";

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
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
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
      console.error("Google auth error:", error);
      toast({
        title: "Error",
        description: error.message || "Google authentication failed",
        variant: "destructive",
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
          console.log("Google One Tap not displayed or skipped");
        }
      });
    } catch (error) {
      console.error("Failed to initialize Google One Tap:", error);
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
          const result = await handleGoogleResponse({
            credential: response.access_token
          }, isLinking);
          
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
    console.error("Google popup sign-in failed:", error);
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
import React from "react";
import { Button } from "../components/ui/button";

export const GoogleLoginButton = ({
  isLinking = false,
  disabled = false,
  className = "",
  children,
  variant = "outline",
  size = "default",
}) => {
  const { triggerGoogleSignIn } = useGoogleAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await triggerGoogleSignIn(isLinking);
    } catch (error) {
      console.error("Google sign-in failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></span>
          {isLinking ? "Linking..." : "Signing in..."}
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {children ||
            (isLinking ? "Link Google Account" : "Continue with Google")}
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
  className = "",
}) => {
  const buttonRef = React.useRef(null);
  const { handleGoogleResponse } = useGoogleAuth();

  React.useEffect(() => {
    const initButton = async () => {
      try {
        await initializeGoogleSignIn();

        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: "outline",
            size: "large",
            type: "standard",
            shape: "rectangular",
            text: isLinking ? "continue_with" : "signin_with",
            logo_alignment: "left",
            width: "100%",
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
        console.error("Failed to initialize Google button:", error);
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

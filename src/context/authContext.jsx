import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../api/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { LogIn, User } from 'lucide-react';
import LoginModal from '../form/Login';

// Create Auth Context
export const AuthContext = createContext({
  isAuthenticated: false,
  userProfile: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  googleLogin: () => {},
  linkGoogleAccount: () => {},
  unlinkGoogleAccount: () => {},
});

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: AuthService.isAuthenticated(),
    userProfile: null,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (AuthService.isAuthenticated()) {
          const currentUser = AuthService.getCurrentUser();
          if (currentUser) {
            setAuthState({
              isAuthenticated: true,
              userProfile: {
                userId: currentUser.id,
                firstName: currentUser.firstName || '',
                lastName: currentUser.lastName || '',
                email: currentUser.email || '',
                avatarUrl: currentUser.avatarUrl || '',
                role: currentUser.role || 'user',
                authProvider: currentUser.authProvider || 'local',
                googleId: currentUser.googleId || null,
              },
            });
          }
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Listen for token expiration events
  useEffect(() => {
    const handleTokenExpiration = () => {
      console.log('Token expired, clearing auth state...');

      setAuthState({
        isAuthenticated: false,
        userProfile: null,
      });

      toast({
        title: 'Session Expired',
        description: 'Your session has expired. Please sign in again.',
        variant: 'destructive',
      });
    };

    // Listen for the custom token expiration event
    window.addEventListener('auth:expired', handleTokenExpiration);

    // Cleanup listener
    return () => {
      window.removeEventListener('auth:expired', handleTokenExpiration);
    };
  }, [toast]);

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await AuthService.login(email, password);

      if (response.success) {
        const currentUser = AuthService.getCurrentUser();
        setAuthState({
          isAuthenticated: true,
          userProfile: {
            userId: currentUser.id,
            firstName: currentUser.firstName || '',
            lastName: currentUser.lastName || '',
            email: currentUser.email || '',
            avatarUrl: currentUser.avatarUrl || '',
            role: currentUser.role || 'user',
            authProvider: currentUser.authProvider || 'local',
            googleId: currentUser.googleId || null,
          },
        });
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const googleLogin = async (credential) => {
    try {
      const response = await AuthService.googleAuth(credential);

      if (response.success) {
        const currentUser = AuthService.getCurrentUser();
        setAuthState({
          isAuthenticated: true,
          userProfile: {
            userId: currentUser.id,
            firstName: currentUser.firstName || '',
            lastName: currentUser.lastName || '',
            email: currentUser.email || '',
            avatarUrl: currentUser.avatarUrl || '',
            role: currentUser.role || 'user',
            authProvider: currentUser.authProvider || 'google',
            googleId: currentUser.googleId || null,
          },
        });

        toast({
          title: 'Success',
          description: response.message || 'Google sign-in successful',
        });
      }
      return response;
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Google sign-in failed',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const linkGoogleAccount = async (credential) => {
    try {
      const response = await AuthService.linkGoogleAccount(credential);

      if (response.success) {
        // Update the current user profile with Google info
        const currentUser = AuthService.getCurrentUser();
        const updatedProfile = {
          ...authState.userProfile,
          authProvider: 'both',
          googleId: currentUser.googleId,
        };

        setAuthState((prev) => ({
          ...prev,
          userProfile: updatedProfile,
        }));

        toast({
          title: 'Success',
          description: 'Google account linked successfully',
        });
      }
      return response;
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to link Google account',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const unlinkGoogleAccount = async () => {
    try {
      const response = await AuthService.unlinkGoogleAccount();

      if (response.success) {
        // Update the current user profile to remove Google info
        const updatedProfile = {
          ...authState.userProfile,
          authProvider: 'local',
          googleId: null,
        };

        setAuthState((prev) => ({
          ...prev,
          userProfile: updatedProfile,
        }));

        toast({
          title: 'Success',
          description: 'Google account unlinked successfully',
        });
      }
      return response;
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to unlink Google account',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setAuthState({
      isAuthenticated: false,
      userProfile: null,
    });
    toast({
      title: 'Success',
      description: 'Signed out successfully',
    });
  };

  const updateUser = (userData) => {
    setAuthState((prev) => ({
      ...prev,
      userProfile: { ...prev.userProfile, ...userData },
    }));

    // Update in localStorage
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateUser,
        googleLogin,
        linkGoogleAccount,
        unlinkGoogleAccount,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Updated UserAuthButton component that integrates with the LoginModal
export const UserAuthButton = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated, userProfile, logout, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      logout();
      toast({
        title: 'Success',
        description: 'Signed out successfully',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Button variant='outline' className='flex items-center gap-2' disabled>
        <span className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent'></span>
        Loading...
      </Button>
    );
  }

  if (!isAuthenticated || !userProfile) {
    return (
      <>
        <Button
          variant='ghost'
          className='rounded-full'
          onClick={() => setIsLoginModalOpen(true)}
          size='icon'
        >
          <LogIn className='h-4 w-4' />
        </Button>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='focus:outline-none rounded-full'>
          <img
            src={
              userProfile.avatarUrl ||
              `https://ui-avatars.com/api/?name=${
                userProfile.firstName || ''
              }+${userProfile.lastName || ''}`
            }
            alt={userProfile.firstName || 'User'}
            className='rounded-full size-8'
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>
              {`${userProfile.firstName} ${userProfile.lastName}`}
            </p>
            <p className='text-xs leading-none text-muted-foreground'>
              {userProfile.role}
            </p>
            <p className='text-xs leading-none text-muted-foreground'>
              {userProfile.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/account')}>
          Profile
        </DropdownMenuItem>
        {userProfile.role === 'admin' && (
          <DropdownMenuItem
            onClick={() => {
              navigate('/manageproducts');
              // Optional: Add loading state feedback
              toast({
                title: 'Loading',
                description: 'Opening product management panel...',
              });
            }}
          >
            Manage Products
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className='text-red-600 hover:text-red-400'
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAuthButton;
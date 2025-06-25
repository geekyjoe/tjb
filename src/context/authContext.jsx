import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../api/client'; // Updated import
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import {
  LogIn,
  User,
  ChevronDown,
  Settings,
  LogOut,
  MoveUpRight,
  Package,
} from 'lucide-react';
import { HiOutlineViewGridAdd } from 'react-icons/hi';
import LoginModal from '../form/Login';

// Create Auth Context
export const AuthContext = createContext({
  isAuthenticated: false,
  userProfile: null,
  login: () => {},
  register: () => {},
  logout: () => {},
  updateUser: () => {},
  googleLogin: () => {},
  linkGoogleAccount: () => {},
  unlinkGoogleAccount: () => {},
  refreshToken: () => {},
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
        // Clear invalid tokens on initialization error
        AuthService.logout();
        setAuthState({
          isAuthenticated: false,
          userProfile: null,
        });
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

  // Periodic token refresh check
  useEffect(() => {
    let refreshInterval;

    if (authState.isAuthenticated) {
      // Check and refresh token every 10 minutes
      refreshInterval = setInterval(async () => {
        try {
          const accessToken = AuthService.getAccessToken();
          if (accessToken) {
            // Decode token to check expiry (basic check)
            const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
            const currentTime = Date.now() / 1000;

            // If token expires in next 2 minutes, refresh it
            if (tokenPayload.exp - currentTime < 120) {
              console.log('Proactively refreshing token...');
              await AuthService.refreshToken();
            }
          }
        } catch (error) {
          console.error('Error in token refresh check:', error);
        }
      }, 10 * 60 * 1000); // 10 minutes
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [authState.isAuthenticated]);

  const register = async (userData) => {
    try {
      const response = await AuthService.register(userData);

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

        toast({
          title: 'Success',
          description: 'Account created and signed in successfully',
        });
      }

      return response;
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Registration failed',
        variant: 'destructive',
      });
      throw error;
    }
  };

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

        toast({
          title: 'Success',
          description: 'Signed in successfully',
        });
      }
      return response;
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Sign in failed',
        variant: 'destructive',
      });
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

  const refreshToken = async () => {
    try {
      const newAccessToken = await AuthService.refreshToken();
      console.log('Token refreshed successfully');
      return newAccessToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // On refresh failure, logout user
      logout();
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
        register,
        login,
        logout,
        updateUser,
        googleLogin,
        linkGoogleAccount,
        unlinkGoogleAccount,
        refreshToken,
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
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, userProfile, logout, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      logout();
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
          className='rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:bg-neutral-300 dark:focus:bg-neutral-700 hover:ring hover:ring-stone-300 dark:hover:ring-stone-700 focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-700 outline-none focus:underline focus:underline-offset-4'
          onClick={() => setIsLoginModalOpen(true)}
        >
          <LogIn className='size-3 md:size-4' />
          <span>Login</span>
        </Button>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </>
    );
  }

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <button className='inline-flex gap-1 p-0.5 items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:ring hover:ring-stone-300 dark:hover:ring-stone-700 outline-none'>
          {userProfile.avatarUrl ? (
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.firstName || 'User'}
              className='rounded-full size-8 select-none'
            />
          ) : (
            <div className='rounded-full size-8 select-none bg-amber-100/50 flex items-center justify-center text-black text-xs font-semibold'>
              {(userProfile.firstName?.[0] || '') +
                (userProfile.lastName?.[0] || '')}
            </div>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isOpen ? 'sm:rotate-180' : 'rotate-180 sm:rotate-0'
            }`}
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className='min-w-[220px] bg-white dark:bg-[#1F2421] rounded-md p-1 shadow-lg border border-gray-200 dark:border-white/10 z-50'
          sideOffset={6}
          alignOffset={-5}
          align='end'
        >
          <DropdownMenu.Label className='px-2 py-1.5 text-sm text-neutral-800 dark:text-white/90'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none'>
                {`${userProfile.firstName} ${userProfile.lastName}`}
              </p>
              <p className='text-xs leading-none text-muted-foreground'>
                {userProfile.role}
              </p>
            </div>
          </DropdownMenu.Label>

          <DropdownMenu.Separator className='h-px bg-gray-200 dark:bg-white/20 m-1' />

          <DropdownMenu.Item
            onClick={() => navigate('/account')}
            className='group text-sm rounded-sm flex gap-2 items-center h-8 px-2 relative select-none outline-none text-black/75 hover:text-black dark:text-white/75 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-white/10 focus:bg-stone-200 cursor-pointer'
          >
            <User className='h-4 w-4' />
            <span>Profile</span>
            <MoveUpRight className='size-4 hidden group-hover:block ml-auto' />
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onClick={() => navigate('/orders')}
            className='group text-sm rounded-sm flex gap-2 items-center h-8 px-2 relative select-none outline-none text-black/75 hover:text-black dark:text-white/75 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-white/10 focus:bg-stone-200 cursor-pointer'
          >
            <Package className='h-4 w-4' />
            <span>Orders</span>
            <MoveUpRight className='size-4 hidden group-hover:block ml-auto' />
          </DropdownMenu.Item>

          {userProfile.role === 'admin' && (
            <DropdownMenu.Item
              onClick={() => {
                navigate('/manageproducts');
                toast({
                  title: 'Loading',
                  description: 'Opening product management panel...',
                });
              }}
              className='group text-sm rounded-sm flex gap-2 items-center h-8 px-2 relative select-none outline-none text-black/75 hover:text-black dark:text-white/75 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-white/10 focus:bg-stone-200 cursor-pointer'
            >
              <HiOutlineViewGridAdd className='h-4 w-4' />
              Manage Products
              <MoveUpRight className='size-4 hidden group-hover:block ml-auto' />
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Item className='group text-sm rounded-sm flex gap-2 items-center h-8 px-2 relative select-none outline-none text-black/75 hover:text-black dark:text-white/75 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-white/10 focus:bg-stone-200 cursor-pointer'>
            <Settings className='h-4 w-4' />
            <span>Settings</span>
            <MoveUpRight className='size-4 hidden group-hover:block ml-auto' />
          </DropdownMenu.Item>

          <DropdownMenu.Separator className='h-px bg-gray-200 dark:bg-white/20 m-1' />

          <DropdownMenu.Item
            onClick={handleSignOut}
            className='group text-sm rounded-sm flex gap-2 items-center h-8 px-2 relative select-none outline-none hover:bg-red-100 focus:bg-red-200 text-red-600 dark:text-red-500  dark:hover:text-white dark:hover:bg-red-500 cursor-pointer'
          >
            <LogOut className='h-4 w-4' />
            <span>Log out</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default UserAuthButton;

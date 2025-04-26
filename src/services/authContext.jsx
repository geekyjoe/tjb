import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../api/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { LogIn, User } from "lucide-react";

// Create Auth Context
export const AuthContext = createContext({
  isAuthenticated: false,
  userProfile: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
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
                firstName: currentUser.firstName || "",
                lastName: currentUser.lastName || "",
                email: currentUser.email || "",
                avatarUrl: currentUser.avatarUrl || "",
                role: currentUser.role || "user",
              },
            });
          }
        }
      } catch (error) {
        console.error("Error initializing auth state:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await AuthService.login(email, password);

      if (response.success) {
        const currentUser = AuthService.getCurrentUser();
        setAuthState({
          isAuthenticated: true,
          userProfile: {
            userId: currentUser.id,
            firstName: currentUser.firstName || "",
            lastName: currentUser.lastName || "",
            email: currentUser.email || "",
            avatarUrl: currentUser.avatarUrl || "",
            role: currentUser.role || "user",
          },
        });
      }
      return response;
    } catch (error) {
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
      title: "Success",
      description: "Signed out successfully",
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
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Updated UserAuthButton Component
export const UserAuthButton = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, userProfile, logout, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      logout();
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Button variant="outline" className="flex items-center gap-2" disabled>
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
        Loading...
      </Button>
    );
  }

  if (!isAuthenticated || !userProfile) {
    return (
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => navigate("/login")}
        size="icon"
      >
        <LogIn className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={
                userProfile.avatarUrl ||
                `https://ui-avatars.com/api/?name=${
                  userProfile.firstName || "User"
                }`
              }
              alt={userProfile.firstName}
            />
            <AvatarFallback>
              {userProfile.firstName?.charAt(0) || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {`${userProfile.firstName} ${userProfile.lastName}`}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userProfile.role}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userProfile.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          Profile
        </DropdownMenuItem>
        {userProfile.role === "admin" &&
        (
          <DropdownMenuItem onClick={() => navigate("/pp")}>
            Manage Products
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

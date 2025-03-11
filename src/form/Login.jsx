import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../api/auth";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "../components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { useToast } from "../hooks/use-toast";
import { Eye, EyeOff, Github, LogIn, LucideLoader, User } from "lucide-react";
import Tooltip from "../components/ui/Tooltip";
import { ThemeToggle } from "../ThemeToggle";
import Footer from "../components/Footer";

export const UserAuthButton = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        if (AuthService.isAuthenticated()) {
          const currentUser = AuthService.getCurrentUser();
          if (currentUser) {
            setUserProfile({
              userId: currentUser.id,
              firstName: currentUser.firstName || '',
              email: currentUser.email || '',
              avatarUrl: currentUser.avatarUrl || '',
              role: currentUser.role || 'user',
            });
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      AuthService.logout();
      setUserProfile(null);
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
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

  if (!userProfile) {
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
                `https://ui-avatars.com/api/?name=${userProfile.firstName || "User"}`
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
              {userProfile.firstName || "User"}
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
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const UserLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertContent, setAlertContent] = useState({
    title: "",
    description: "",
    status: "success",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if already logged in
    if (AuthService.isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.id]: value,
    });
  };

  const showLoginAlert = (success, message) => {
    setAlertContent({
      title: success ? "Login Successful" : "Login Failed",
      description: message,
      status: success ? "success" : "error",
    });
    setShowAlert(true);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await AuthService.login(formData.email, formData.password);
      
      if (response.success) {
        const userData = response.data.user;
        
        if (!formData.rememberMe) {
          // If remember me is not checked, set token to expire in session
          // This would require backend support or a custom implementation
          // For now, we'll just log the preference
          console.log("Session-only login requested");
        }

        toast({
          title: "Welcome back!",
          description: `Logged in as ${userData.email}`,
        });

        setShowAlert(false);
        navigate("/");
      } else {
        showLoginAlert(false, response.message || "Login failed");
        
        toast({
          title: "Error",
          description: response.message || "Login failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error.message || "An unexpected error occurred";

      showLoginAlert(false, errorMessage);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Note: For social login, we would need to adapt to whatever authentication flow the API supports
  // The current implementation assumes there would be OAuth endpoints for these providers
  
  const handleGoogleLogin = async () => {
    // This would need to be implemented based on how the backend handles OAuth
    toast({
      title: "Not Implemented",
      description: "Google login is not yet implemented with the new API",
      variant: "destructive",
    });
  };

  const handleGithubLogin = async () => {
    // This would need to be implemented based on how the backend handles OAuth
    toast({
      title: "Not Implemented",
      description: "Github login is not yet implemented with the new API",
      variant: "destructive",
    });
  };

  return (
    <div className="md:min-h-dvh bg-cornsilk dark:bg-[#211915]">
      <header className="z-10 flex justify-between items-center font-inter w-full p-2">
        <a
          href="/"
          className="py-1 focus:outline-none font-karla font-bold dark:text-neutral-100"
        >
          <h2 className="max-xl:text-xl max-md:text-sm p-2 pl-4">
            The Jeweller Bee Store
          </h2>
        </a>
        <ThemeToggle />
      </header>
      <div className="py-10 flex items-center justify-center">
        <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
          <AlertDialogContent className="sm:w-full w-fit max-w-lg dark:bg-neutral-800 rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle
                className={
                  alertContent.status === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {alertContent.title}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {alertContent.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Close</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Card className="w-9/10 md:w-full max-w-md bg-white dark:bg-zinc-800 shadow-md rounded-xl border dark:border-neutral-700 dark:hover:border-neutral-700">
          <CardHeader>
            <CardTitle className="leading-6">Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <img src="/google.svg" alt="Google" className="w-5 h-5 mr-2" />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGithubLogin}
                disabled={isLoading}
              >
                <Github className="w-5 h-5 mr-2" />
                Github
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-zinc-800 px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin}>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-1/2 -translate-y-1/2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <Tooltip
                        content={
                          showPassword ? "Hide password" : "Show password"
                        }
                        placement="right"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Tooltip>
                    </Button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, rememberMe: checked })
                    }
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2 ">
                      <LucideLoader className="animate-spin" />
                      Logging in...
                    </div>
                  ) : (
                    "Login with Email"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-sm text-center text-zinc-700 dark:text-zinc-300">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default UserLogin;
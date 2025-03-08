import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { getDatabase, ref as dbRef, get } from "firebase/database";
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
import { useToast } from "../hooks/use-toast";
import { Eye, EyeOff, Github, LogIn, User } from "lucide-react";
import Tooltip from "../components/ui/Tooltip";
import {
  loginUser,
  signInWithGoogle,
  signInWithGithub,
} from "../services/auth-service";
import { ThemeToggle } from "../ThemeToggle";
import Footer from "../components/Footer";

export const UserAuthButton = () => {
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const refreshUserData = async (userId) => {
    try {
      const database = getDatabase();
      const userRef = dbRef(database, `users/${userId}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  const initializeUserProfile = async (authUser) => {
    if (!authUser) return;

    try {
      // Get additional user data from database
      const userData = await refreshUserData(authUser.uid);

      if (!userData) return;

      // Combine auth user data with database data - updated to match auth-service.js schema
      const combinedProfile = {
        userId: authUser.uid,
        name:
          `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
          authUser.displayName ||
          "",
        email: userData.email || authUser.email || "",
        phone: userData.phoneNumber || authUser.phoneNumber || "",
        avatarUrl: userData.avatarUrl || authUser.photoURL || "",
        role: userData.role || "user",
      };

      setUserProfile(combinedProfile);
    } catch (error) {
      console.error("Error initializing user profile:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        await initializeUserProfile(authUser);
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (!userProfile) {
    return (
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => navigate("/login")}
      >
        <LogIn className="h-4 w-4" />
        Login
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
                `https://ui-avatars.com/api/?name=${userProfile.name || "User"}`
              }
              alt={userProfile.name}
            />
            <AvatarFallback>
              {userProfile.name?.charAt(0) || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userProfile.name || "User"}
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
        <DropdownMenuItem onClick={() => navigate("/adminpanel")}>
          Settings
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
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
      const userData = await loginUser(formData.email, formData.password);

      toast({
        title: "Welcome back!",
        description: `Logged in as ${userData.email}`,
      });

      setShowAlert(false);
      navigate("/");
    } catch (error) {
      // Error handling updated to work with the new auth-service implementation
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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();

      toast({
        title: "Success!",
        description: "Logged in with Google successfully.",
      });

      navigate("/");
    } catch (error) {
      const errorMessage = error.message || "Failed to login with Google";

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

  const handleGithubLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGithub();

      toast({
        title: "Success!",
        description: "Logged in with Github successfully.",
      });

      navigate("/");
    } catch (error) {
      const errorMessage = error.message || "Failed to login with Github";

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

  return (
    <div className="md:min-h-dvh bg-cornsilk dark:bg-zinc-900">
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
      <div className="py-5 flex items-center justify-center">
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

        <Card className="w-full max-w-md bg-white dark:bg-zinc-800 shadow-md rounded-xl border dark:border-neutral-700 dark:hover:border-neutral-700">
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login with Email"}
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/authContext"; // Update with correct path
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { useToast } from "../hooks/use-toast";
import { Eye, EyeOff, Github, LucideLoader } from "lucide-react";
import Tooltip from "../components/ui/Tooltip";
import { ThemeToggle } from "../ThemeToggle";
import Footer from "../components/Footer";

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
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if already logged in
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

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
      const response = await login(
        formData.email,
        formData.password,
        formData.rememberMe
      );

      if (response.success) {
        const userData = response.data.user;

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

  const handleGoogleLogin = async () => {
    toast({
      title: "Not Implemented",
      description: "Google login is not yet implemented with the new API",
      variant: "destructive",
    });
  };

  const handleGithubLogin = async () => {
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
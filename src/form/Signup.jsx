import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useToast } from "../hooks/use-toast";
import { AlertCircle, Eye, EyeOff, Github } from "lucide-react";
import Tooltip from "../components/ui/Tooltip";
import {
  registerUser,
  signInWithGoogle,
  signInWithGithub,
} from "../services/auth-service";
import { ThemeToggle } from "../ThemeToggle";
import Footer from "../components/Footer";

const UserSignup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const validate = () => {
    const newErrors = {};

    // Basic validations
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Phone validation (if provided)
    if (
      formData.phoneNumber &&
      !/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ""))
    ) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });

    // Clear error when field is edited
    if (errors[id]) {
      setErrors({
        ...errors,
        [id]: undefined,
      });
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      await registerUser(formData);
      toast({
        title: "Success!",
        description: "Account created successfully.",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Account Creation Failed",
        description:
          error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider) => {
    setSocialLoading(provider);

    try {
      if (provider === "google") {
        await signInWithGoogle();
      } else if (provider === "github") {
        await signInWithGithub();
      }

      toast({
        title: "Success!",
        description: `Signed up with ${provider} successfully.`,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error(`${provider} signup error:`, error);
      toast({
        title: "Authentication Failed",
        description: error.message || `Failed to sign up with ${provider}.`,
        variant: "destructive",
      });
    } finally {
      setSocialLoading("");
    }
  };

  // Format phone number as user types
  const formatPhoneNumber = (e) => {
    const input = e.target.value.replace(/\D/g, "").substring(0, 10);
    setFormData({
      ...formData,
      phoneNumber: input,
    });
  };

  return (
    <div className="bg-cornsilk dark:bg-zinc-900">
      <header className="z-10 flex justify-between items-center font-inter w-full p-2">
        <a
          href="/"
          className="py-1 focus:outline-hidden font-karla font-bold dark:text-neutral-100"
        >
          <h2 className="max-xl:text-xl max-md:text-sm p-2 pl-4">
            The Jeweller Bee Store
          </h2>
        </a>
        <div className="">
          <ThemeToggle />
        </div>
      </header>
      <div className="flex items-center justify-center min-h-100vh p-4">
        <Card className="w-full max-w-md bg-white dark:bg-zinc-800 shadow-md rounded-xl dark:hover:border-neutral-600">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Sign up to start shopping</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleSocialSignup("google")}
                disabled={!!socialLoading}
              >
                {socialLoading === "google" ? (
                  <span className="animate-spin mr-2">⟳</span>
                ) : (
                  <img
                    src="/google.svg"
                    alt="Google"
                    className="w-5 h-5 mr-2"
                  />
                )}
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleSocialSignup("github")}
                disabled={!!socialLoading}
              >
                {socialLoading === "github" ? (
                  <span className="animate-spin mr-2">⟳</span>
                ) : (
                  <Github className="w-5 h-5 mr-2" />
                )}
                Github
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-zinc-800 px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailSignup} noValidate>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-2">
                    <Label
                      htmlFor="firstName"
                      className={errors.firstName ? "text-red-500" : ""}
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={errors.firstName ? "border-red-500" : ""}
                      aria-invalid={errors.firstName ? "true" : "false"}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-500 flex items-center mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label
                      htmlFor="lastName"
                      className={errors.lastName ? "text-red-500" : ""}
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={errors.lastName ? "border-red-500" : ""}
                      aria-invalid={errors.lastName ? "true" : "false"}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-500 flex items-center mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <Label
                    htmlFor="username"
                    className={errors.username ? "text-red-500" : ""}
                  >
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    className={errors.username ? "border-red-500" : ""}
                    aria-invalid={errors.username ? "true" : "false"}
                  />
                  {errors.username && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.username}
                    </p>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <Label
                    htmlFor="email"
                    className={errors.email ? "text-red-500" : ""}
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "border-red-500" : ""}
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <Label
                    htmlFor="phoneNumber"
                    className={errors.phoneNumber ? "text-red-500" : ""}
                  >
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChange={formatPhoneNumber}
                    className={errors.phoneNumber ? "border-red-500" : ""}
                    aria-invalid={errors.phoneNumber ? "true" : "false"}
                  />
                  {errors.phoneNumber && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <Label
                    htmlFor="password"
                    className={errors.password ? "text-red-500" : ""}
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      className={
                        errors.password ? "border-red-500 pr-10" : "pr-10"
                      }
                      aria-invalid={errors.password ? "true" : "false"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-1/2 -translate-y-1/2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
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
                  {errors.password && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className={errors.confirmPassword ? "text-red-500" : ""}
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={
                        errors.confirmPassword
                          ? "border-red-500 pr-10"
                          : "pr-10"
                      }
                      aria-invalid={errors.confirmPassword ? "true" : "false"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-1/2 -translate-y-1/2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      tabIndex="-1"
                    >
                      <Tooltip
                        content={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        placement="right"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Tooltip>
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !!socialLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      Creating Account...
                    </>
                  ) : (
                    "Sign Up with Email"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-sm text-center text-zinc-700 dark:text-zinc-300">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default UserSignup;

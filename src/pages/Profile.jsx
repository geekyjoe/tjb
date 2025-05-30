import React, { lazy, useState, useEffect, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Moon,
  Sun,
  User,
  Package,
  Settings,
  LogOut,
  Pencil,
  Save,
  X,
  Cookie,
  Check,
  Laptop,
  Shield,
  EditIcon,
  AlertTriangle,
  Upload,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangleIcon,
} from "lucide-react";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Toaster } from "../components/ui/toaster";
import { useToast } from "../hooks/use-toast";
import { useTheme } from "../ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { AuthService, UserService } from "../api/client";

const UserManagement = lazy(() => import("../services/UM"));

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("user");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  const [editingField, setEditingField] = useState(null);
  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    username: "",
    dob: "",
  });
  const [tempProfile, setTempProfile] = useState({ ...userProfile });
  const [notifications, setNotifications] = useState({
    communication: true,
    marketing: false,
    security: true,
  });
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    performance: false,
    analytics: false,
    marketing: false,
  });
  const [showUserManagement, setShowUserManagement] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Avatar preview state
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);

  useEffect(() => {
    document.title = "Profile - TJB Store"; // Set the document title
  }, []);

  useEffect(() => {
    // Check if user is authenticated
    if (!AuthService.isAuthenticated()) {
      navigate("/");
      return;
    }

    const fetchUserData = async () => {
      try {
        // Get current user from localStorage
        const currentUser = AuthService.getCurrentUser();

        if (!currentUser) {
          navigate("/");
          return;
        }

        setUser(currentUser);

        // Fetch user profile from API
        const response = await UserService.getUserProfile(currentUser.id);

        if (response.success) {
          const userData = response.data;

          // Set user role
          setUserRole(userData.role || "user");

          // Set user profile data
          setUserProfile({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || currentUser.email || "",
            phoneNumber: userData.phoneNumber || "",
            username: userData.username || userData.email?.split("@")[0] || "",
            dob: userData.dob || "",
          });

          setTempProfile({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || currentUser.email || "",
            phoneNumber: userData.phoneNumber || "",
            username: userData.username || userData.email?.split("@")[0] || "",
            dob: userData.dob || "",
          });
        } else {
          // Fallback to auth user data if API doesn't return profile
          const names = currentUser.displayName
            ? currentUser.displayName.split(" ")
            : ["", ""];
          const firstName = names[0] || "";
          const lastName = names.slice(1).join(" ") || "";

          setUserProfile({
            firstName,
            lastName,
            email: currentUser.email || "",
            phoneNumber: currentUser.phoneNumber || "",
            username: currentUser.email?.split("@")[0] || "",
            dob: userData.dob || "",
          });

          setTempProfile({
            firstName,
            lastName,
            email: currentUser.email || "",
            phoneNumber: currentUser.phoneNumber || "",
            username: currentUser.email?.split("@")[0] || "",
            dob: userData.dob || "",
          });

          setUserRole(currentUser.role || "user");
        }

        // Load cookie preferences
        const savedPreferences = getCookie("cookiePreferences");
        if (savedPreferences) {
          setCookiePreferences(savedPreferences);
        }
      } catch (error) {
        showToast(
          "Error Loading Profile",
          error.message || "Failed to load user profile data",
          "destructive"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const getCookie = (name) => {
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return JSON.parse(parts.pop().split(";").shift());
      }
    } catch (error) {
      return null;
    }
    return null;
  };

  const setCookie = (name, value, days = 365) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${JSON.stringify(
      value
    )};expires=${date.toUTCString()};path=/;SameSite=Strict`;
  };

  const showToast = (title, description, variant = "default") => {
    toast({
      variant,
      title: title,
      description: description,
    });
  };

  const handleFieldEdit = (field, value) => {
    setTempProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleFieldSave = async (field) => {
    try {
      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }

      // Create update data object with only the changed field
      const updateData = { [field]: tempProfile[field] };

      // Update the user profile using the API
      const response = await UserService.updateUserProfile(user.id, updateData);

      if (response.success) {
        // Update the local state after successful API update
        setUserProfile((prev) => ({ ...prev, [field]: tempProfile[field] }));
        setEditingField(null);

        // Update the user in localStorage if needed
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.id === user.id) {
          const updatedUser = { ...currentUser, [field]: tempProfile[field] };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        showToast(
          "Profile Updated",
          `Your ${field} has been updated successfully`,
          "success"
        );
      } else {
        throw new Error(response.message || `Failed to update ${field}`);
      }
    } catch (error) {
      console.error("Error updating field:", error);
      showToast(
        "Update Failed",
        error.message || `Failed to update ${field}`,
        "destructive"
      );
    }
  };

  const handleCookieChange = (key, value) => {
    const newPreferences = { ...cookiePreferences, [key]: value };
    setCookiePreferences(newPreferences);
    setCookie("cookiePreferences", newPreferences);
    showToast(
      "Cookie Preferences Updated",
      `${key.charAt(0).toUpperCase() + key.slice(1)} cookies ${
        value ? "enabled" : "disabled"
      }`,
      value ? "success" : "default"
    );
  };

  const handleNotificationChange = async (key, value) => {
    try {
      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }

      // Create notification preferences object
      const newNotifications = { ...notifications, [key]: value };

      // Update notification preferences via API
      const response = await UserService.updateUserProfile(user.id, {
        notificationPreferences: newNotifications,
      });

      if (response.success) {
        setNotifications(newNotifications);
        showToast(
          "Notification Settings Updated",
          `${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${
            value ? "enabled" : "disabled"
          }`,
          value ? "success" : "default"
        );
      } else {
        throw new Error(
          response.message || "Failed to update notification settings"
        );
      }
    } catch (error) {
      console.error("Error updating notifications:", error);
      showToast(
        "Update Failed",
        error.message || "Failed to update notification settings",
        "destructive"
      );
    }
  };

  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    showToast("Theme Updated", `Theme switched to ${newTheme} mode`, "success");
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate("/login");
  };

  // Handle password change
  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    setPasswordError("");
  };

  const submitPasswordChange = async (closeDialog) => {
    try {
      // Validation
      if (!passwordData.currentPassword) {
        setPasswordError("Current password is required");
        return;
      }

      if (!passwordData.newPassword) {
        setPasswordError("New password is required");
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError("New passwords do not match");
        return;
      }

      if (passwordData.newPassword.length < 8) {
        setPasswordError("Password must be at least 8 characters long");
        return;
      }

      // Submit password change
      const response = await UserService.changePassword(
        user.id,
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (response.success) {
        showToast(
          "Password Updated",
          "Your password has been changed successfully",
          "success"
        );

        // Reset form
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        closeDialog();
      } else {
        throw new Error(response.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError(error.message || "Failed to update password");
    }
  };

  // Handle avatar preview
  const handleAvatarSelect = (e) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      setSelectedAvatarFile(file);

      // Create URL for preview
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
    }
  };

  const handleAvatarUpload = async (closeDialog) => {
    try {
      if (!selectedAvatarFile) {
        throw new Error("No avatar file selected");
      }

      const response = await UserService.uploadAvatar(
        user.id,
        selectedAvatarFile
      );

      if (response.success) {
        // Update user in state
        setUser((prev) => ({
          ...prev,
          avatarUrl: response.data.avatarUrl,
        }));

        showToast(
          "Avatar Updated",
          "Your profile picture has been updated successfully",
          "success"
        );

        // Reset preview
        setAvatarPreview(null);
        setSelectedAvatarFile(null);
        closeDialog();
      } else {
        throw new Error(response.message || "Failed to upload avatar");
      }
    } catch (error) {
      showToast(
        "Upload Failed",
        error.message || "Failed to upload avatar",
        "destructive"
      );
    }
  };

  const handleAvatarDelete = async (closeDialog) => {
    try {
      const response = await UserService.deleteAvatar(user.id);

      if (response.success) {
        // Update user in state
        setUser((prev) => ({
          ...prev,
          avatarUrl: null,
        }));

        showToast(
          "Avatar Removed",
          "Your profile picture has been removed",
          "success"
        );

        closeDialog();
      } else {
        throw new Error(response.message || "Failed to delete avatar");
      }
    } catch (error) {
      showToast(
        "Removal Failed",
        error.message || "Failed to delete avatar",
        "destructive"
      );
    }
  };

  const ThemeSelector = () => (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label className="sm:text-base">Theme</Label>
        <div className="sm:text-sm text-xs text-muted-foreground">
          Choose your preferred theme
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {theme === "light" && "Light"}
            {theme === "dark" && "Dark"}
            {theme === "system" && "System"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className={`${
              theme === "light"
                ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
                : ""
            }`}
            onClick={() => handleThemeChange("light")}
          >
            <Sun className="mr-2 h-4 w-4" />
            <span>Light</span>
            {theme === "light" && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={`${
              theme === "dark"
                ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                : ""
            }`}
            onClick={() => handleThemeChange("dark")}
          >
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
            {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={`${
              theme === "system"
                ? "text-green-600 bg-green-50 dark:bg-green-900/20"
                : ""
            }`}
            onClick={() => handleThemeChange("system")}
          >
            <Laptop className="mr-2 h-4 w-4" />
            <span>System</span>
            {theme === "system" && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Please log in to view your profile settings.</p>
          <Button className="mt-4" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const fullName = `${userProfile.firstName} ${userProfile.lastName}`.trim();

  // Define tabs with their icons
  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: <User className="h-4 w-4 mr-2" />,
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: <Sun className="h-4 w-4 mr-2" />,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="h-4 w-4 mr-2" />,
    },
    {
      id: "cookies",
      label: "Cookies",
      icon: <Cookie className="h-4 w-4 mr-2" />,
    },
    {
      id: "account",
      label: "Account",
      icon: <Settings className="h-4 w-4 mr-2" />,
    },
  ];

  // Add admin tab if user has admin role
  if (userRole === "admin") {
    tabs.push({
      id: "admin",
      label: "Admin",
      icon: <Shield className="h-4 w-4 mr-2" />,
    });
  }

  return (
    <section className="bg-cornsilk dark:bg-cornsilk-d1">
      <Toaster />

      {/* Header section */}
      <div className="p-6 border-b border-black/10 dark:border-white/20 flex items-center gap-4">
        <img
          src={
            user.avatarUrl ||
            `https://ui-avatars.com/api/?name=${
              userProfile.firstName || "User"
            }`
          }
          alt={userProfile.firstName || "User"}
          className="rounded-full w-12 h-12"
        />
        <div>
          <h2 className="sm:text-xl font-bold">Hi! {fullName || "User"}</h2>
          <div className="flex items-center bg-stone-200 dark:bg-cornsilk-d1 dark:text-cornsilk w-fit p-0.5 px-1 rounded-md text-sm text-muted-foreground">
            <Shield className="h-3 w-3 mr-1" />
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </div>
        </div>
      </div>

      {/* Main content with sidebar and content area */}
      <div className="flex flex-row">
        {/* Left sidebar with tabs */}
        <div className="md:w-64 sm:w-45 w-fit border-r border-black/10 dark:border-white/10 p-4 bg-cornsilk dark:bg-cornsilk-d1">
          <h3 className="font-medium sm:text-lg mb-4">Profile Settings</h3>
          <nav className="space-y-2 min-h-svh">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 sm:text-sm text-xs rounded-md
                  ${
                    activeTab === tab.id
                      ? "bg-stone-200 dark:bg-stone-700 font-semibold"
                      : "hover:bg-cornsilk-d1/5 dark:hover:bg-cornsilk-d1/50"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main content area */}
        <div className="flex-1 p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="sm:text-lg font-medium mb-4">
                  Personal Information
                </h3>
                <div className="space-y-4 max-w-2xl">
                  {Object.entries({
                    firstName: "First Name",
                    lastName: "Last Name",
                    phoneNumber: "Phone Number",
                    username: "Username",
                  }).map(([field, label]) => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={field}>{label}</Label>
                      <div className="flex gap-2">
                        <Input
                          id={field}
                          value={
                            editingField === field
                              ? tempProfile[field]
                              : userProfile[field]
                          }
                          onChange={(e) =>
                            handleFieldEdit(field, e.target.value)
                          }
                          disabled={editingField !== field}
                          className="flex-1"
                          placeholder={`Enter your ${label.toLowerCase()}`}
                        />
                        {editingField === field ? (
                          <div className="space-x-2">
                            <Button
                              onClick={() => handleFieldSave(field)}
                              size="sm"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => setEditingField(null)}
                              size="sm"
                              variant="secondary"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setEditingField(field)}
                            size="sm"
                            variant="ghost"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Date of Birth with Date Picker */}
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date Of Birth</Label>
                    <div className="flex gap-2">
                      <Input
                        id="dob"
                        type={editingField === "dob" ? "date" : "text"}
                        value={
                          editingField === "dob"
                            ? tempProfile.dob
                            : userProfile.dob
                        }
                        onChange={(e) => handleFieldEdit("dob", e.target.value)}
                        disabled={editingField !== "dob"}
                        className="flex-1"
                        placeholder="Select your date of birth"
                        max={new Date().toISOString().split("T")[0]} // Prevent future dates
                      />
                      {editingField === "dob" ? (
                        <div className="space-x-2">
                          <Button
                            onClick={() => handleFieldSave("dob")}
                            size="sm"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => setEditingField(null)}
                            size="sm"
                            variant="secondary"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setEditingField("dob")}
                          size="sm"
                          variant="ghost"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userProfile.email}
                      disabled={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h3 className="sm:text-lg font-medium mb-4">
                  Appearance Settings
                </h3>
                <div className="max-w-2xl">
                  <ThemeSelector />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="sm:text-lg font-medium mb-4">
                  Notification Preferences
                </h3>
                <div className="space-y-6 max-w-2xl">
                  {Object.entries({
                    communication: "Communication Emails",
                    marketing: "Marketing Emails",
                    security: "Security Emails",
                  }).map(([key, title]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <Label className="sm:text-base">{title}</Label>
                        <div className="sm:text-sm text-xs text-muted-foreground">
                          Receive emails about{" "}
                          {key === "communication"
                            ? "your account activity"
                            : key === "marketing"
                            ? "new products and features"
                            : "your account security"}
                        </div>
                      </div>
                      <Switch
                        checked={notifications[key]}
                        onCheckedChange={(checked) =>
                          handleNotificationChange(key, checked)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Cookies Tab */}
          {activeTab === "cookies" && (
            <div className="space-y-6">
              <div>
                <h3 className="sm:text-lg font-medium mb-4">Cookie Settings</h3>
                <div className="space-y-6 max-w-2xl">
                  {Object.entries({
                    essential: "Essential Cookies",
                    performance: "Performance Cookies",
                    analytics: "Analytics Cookies",
                    marketing: "Marketing Cookies",
                  }).map(([key, title]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <Label className="sm:text-base">{title}</Label>
                        <div className="sm:text-sm text-xs text-muted-foreground">
                          {key === "essential"
                            ? "Required for the website to function properly"
                            : key === "performance"
                            ? "Help us improve site speed and user experience"
                            : key === "analytics"
                            ? "Help us understand how visitors interact with our website"
                            : "Used to deliver relevant advertisements"}
                        </div>
                      </div>
                      <Switch
                        checked={cookiePreferences[key]}
                        onCheckedChange={(checked) =>
                          handleCookieChange(key, checked)
                        }
                        disabled={key === "essential"}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Account Settings</h3>
                <div className="flex flex-wrap gap-4 md:flex md:flex-wrap grid max-w-2xl">
                  {/* Password Change Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <EditIcon className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm sm:max-w-md rounded-md">
                      <DialogHeader className="space-y-2">
                        <DialogTitle className="text-base sm:text-lg">
                          Change Password
                        </DialogTitle>
                        <DialogDescription className="text-sm space-y-2 text-stone-500">
                          Update your account password
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">
                            Current Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="current-password"
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) =>
                                handlePasswordChange(
                                  "currentPassword",
                                  e.target.value
                                )
                              }
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <div className="relative">
                            <Input
                              id="new-password"
                              type={showNewPassword ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) =>
                                handlePasswordChange(
                                  "newPassword",
                                  e.target.value
                                )
                              }
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">
                            Confirm New Password
                          </Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              handlePasswordChange(
                                "confirmPassword",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        {passwordError && (
                          <div className="text-sm font-medium text-red-500">
                            {passwordError}
                          </div>
                        )}
                      </div>
                      <DialogFooter className="sm:flex grid grid-cols-2 justify-items-center sm:justify-between">
                        <DialogClose asChild>
                          <Button
                            variant="outline"
                            className="w-fit text-xs sm:text-sm"
                          >
                            Cancel
                          </Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              const closeBtn = document.querySelector(
                                "[data-close-dialog]"
                              );
                              submitPasswordChange(() => closeBtn?.click());
                            }}
                            className="w-fit text-xs sm:text-sm"
                          >
                            Update Password
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Avatar Management Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <User className="h-4 w-4 mr-2" />
                        Manage Avatar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm sm:max-w-md rounded-md">
                      <DialogHeader className="space-y-2">
                        <DialogTitle className="text-base sm:text-lg">
                          Profile Avatar
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm space-y-2 text-stone-500">
                          Upload or update your profile picture
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-center justify-center py-4 space-y-4">
                        <div className="relative sm:w-32 sm:h-32 w-25 h-25 rounded-full overflow-hidden border-2 border-gray-200">
                          <img
                            src={
                              avatarPreview ||
                              user.avatarUrl ||
                              `https://ui-avatars.com/api/?name=${
                                userProfile.firstName || "User"
                              }&size=128`
                            }
                            alt="Avatar Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarSelect}
                        />
                        <Label
                          htmlFor="avatar-upload"
                          className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Select New Avatar
                        </Label>

                        {avatarPreview && (
                          <div className="text-sm text-center text-gray-500">
                            Preview shown - click save to confirm changes
                          </div>
                        )}
                      </div>
                      <DialogFooter className="sm:flex grid grid-cols-2 justify-items-start  sm:justify-between">
                        <Button
                          variant="destructive"
                          onClick={(e) => {
                            e.preventDefault();
                            const closeBtn = document.querySelector(
                              "[data-close-dialog]"
                            );
                            handleAvatarDelete(() => closeBtn?.click());
                          }}
                          disabled={!user.avatarUrl && !avatarPreview}
                          className="w-fit text-xs sm:text-sm"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Avatar
                        </Button>
                        <div className="space-x-2 grid grid-cols-2 gap-2 justify-items-center">
                          <DialogClose asChild>
                            <Button
                              variant="outline"
                              className="w-fit text-xs sm:text-sm"
                            >
                              Cancel
                            </Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                if (selectedAvatarFile) {
                                  const closeBtn = document.querySelector(
                                    "[data-close-dialog]"
                                  );
                                  handleAvatarUpload(() => closeBtn?.click());
                                }
                              }}
                              disabled={!selectedAvatarFile}
                              className="w-fit text-xs sm:text-sm"
                            >
                              Save Avatar
                            </Button>
                          </DialogClose>
                        </div>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  {/* Delete Account Alert Dialog */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full sm:w-auto"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-xs sm:max-w-md rounded-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Account Deletion Request
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs sm:text-sm space-y-2 text-stone-500 mt-2">
                          <div className="flex items-start">
                            <AlertTriangleIcon className="h-6 w-6 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>
                              To delete your account, please contact your system
                              administrator. For security and data management
                              purposes, account deletion requires administrative
                              approval.
                            </span>
                          </div>
                          <div className="pl-8 sm:text-sm text-xs">
                            <p className="font-medium mb-1">
                              Contact Information:
                            </p>
                            <p>
                              Email:{" "}
                              <span className="text-blue-600">
                                admin@yourcompany.com
                              </span>
                            </p>
                            <p>
                              Support Ticket:{" "}
                              <span className="text-blue-600">
                                helpdesk.yourcompany.com
                              </span>
                            </p>
                          </div>
                          <div className="pl-8 sm:text-sm text-xs">
                            <p className="italic">
                              Please note that account deletion is permanent and
                              will remove all associated data from our systems.
                            </p>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-3 flex-col gap-2 sm:flex-row">
                        <AlertDialogCancel asChild className="mt-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs sm:text-sm"
                          >
                            Cancel
                          </Button>
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            // handleLogout();
                          }}
                          className="w-full text-xs sm:text-sm"
                        >
                          Understood
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          )}
          {activeTab === "admin" && (
            <div value="admin" className="space-y-4">
              <div className="p-4 border rounded-md bg-yellow-50 dark:bg-yellow-900/20 space-y-2">
                <h3 className="font-medium sm:text-base text-sm text-yellow-800 dark:text-yellow-200">
                  Admin Panel
                </h3>
                <p className="sm:text-sm text-xs text-yellow-700 dark:text-yellow-300">
                  You have administrative privileges. Use this section to manage
                  user roles and system settings.
                </p>
              </div>
              <div className="space-y-4 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowUserManagement(!showUserManagement)}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {showUserManagement ? "Hide Users" : "Manage Users"}
                </Button>
                <Link to="/adminpanel" className="text-blue-600">
                  Go to Admin Panel
                </Link>
              </div>
              {showUserManagement && (
                <Suspense fallback={<p>Loading...</p>}>
                  <UserManagement />
                </Suspense>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
export default Profile;

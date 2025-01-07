import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Toaster } from "../components/ui/toaster";
import { useToast } from "../hooks/use-toast";
import { useTheme, ThemeIcon } from "../ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [editingField, setEditingField] = useState(null);
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    phone: "",
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

  useEffect(() => {
    if (isAuthenticated && user) {
      setUserProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone_number || "",
      });
      setTempProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone_number || "",
      });
      // Load cookie preferences
      const savedPreferences = getCookie("cookiePreferences");
      if (savedPreferences) {
        setCookiePreferences(savedPreferences);
      }
    }
  }, [isAuthenticated, user]);

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
    document.cookie = `${name}=${JSON.stringify(value)};expires=${date.toUTCString()};path=/;SameSite=Strict`;
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

  const handleFieldSave = (field) => {
    setUserProfile((prev) => ({ ...prev, [field]: tempProfile[field] }));
    setEditingField(null);
    showToast(
      "Profile Updated",
      `Your ${field} has been updated successfully`,
      "success"
    );
  };

  const handleCookieChange = (key, value) => {
    const newPreferences = { ...cookiePreferences, [key]: value };
    setCookiePreferences(newPreferences);
    setCookie("cookiePreferences", newPreferences);
    showToast(
      "Cookie Preferences Updated",
      `${key.charAt(0).toUpperCase() + key.slice(1)} cookies ${value ? "enabled" : "disabled"}`,
      value ? "success" : "default"
    );
  };

  const handleNotificationChange = (key, value) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    showToast(
      "Notification Settings Updated",
      `${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${value ? "enabled" : "disabled"}`,
      value ? "success" : "default"
    );
  };

  const { theme, setTheme } = useTheme();

  // Update the theme handler
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    showToast("Theme Updated", `Theme switched to ${newTheme} mode`, "success");
  };

  const ThemeSelector = () => (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label className="text-base">Theme</Label>
        <div className="text-sm text-muted-foreground">
          Choose your preferred theme
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {theme === "light" && "Light"}
            {theme === "dark" && "Dark"}
            {theme === "system" && "System"}
            {/* <ThemeIcon /> */}
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
            className={`${theme === "dark" ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : ""}`}
            onClick={() => handleThemeChange("dark")}
          >
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
            {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={`${theme === "system" ? "text-green-600 bg-green-50 dark:bg-green-900/20" : ""}`}
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Please log in to view your profile settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-8">
      <div className="pb-5 p-6 flex items-center gap-2 space-x-2 border-b">
        <img
          src={user.picture}
          alt={user.name}
          className="rounded-full w-12 h-12"
        />
        <h2 className="text-xl font-bold mt-2">Hi!! {user.name}</h2>
      </div>
      <Toaster richColors/>
      <Card className="border-none dark:bg-transparent">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="cookies">Cookies</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="space-y-4">
                {Object.entries({
                  name: "Name",
                  phone: "Phone Number",
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
                        onChange={(e) => handleFieldEdit(field, e.target.value)}
                        disabled={editingField !== field}
                        className="flex-1"
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
            </TabsContent>

            <TabsContent value="appearance">
              <ThemeSelector />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              {Object.entries({
                communication: "Communication Emails",
                marketing: "Marketing Emails",
                security: "Security Emails",
              }).map(([key, title]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">{title}</Label>
                    <div className="text-sm text-muted-foreground">
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
            </TabsContent>

            <TabsContent value="cookies" className="space-y-4">
              {Object.entries({
                essential: "Essential Cookies",
                performance: "Performance Cookies",
                analytics: "Analytics Cookies",
                marketing: "Marketing Cookies",
              }).map(([key, title]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">{title}</Label>
                    <div className="text-sm text-muted-foreground">
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;

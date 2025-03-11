import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { User, Pencil, Trash2, Loader2, UploadCloud, History, X } from "lucide-react";
import { AuthService, UserService, AdminService } from "../api/auth";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoginHistory, setUserLoginHistory] = useState([]);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    // Check if user is authenticated
    if (!AuthService.isAuthenticated()) {
      navigate("/login");
      return;
    }

    // Get current user from localStorage
    const user = AuthService.getCurrentUser();
    if (!user) {
      navigate("/login");
      return;
    }

    setCurrentUser(user);

    // Check if user is admin - if not, redirect
    if (user.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You need administrator privileges to access this page.",
        variant: "destructive",
      });
      // navigate("/dashboard");
    }
  }, [navigate, toast]);

  // Fetch all users
  useEffect(() => {
    // Only fetch users if user is authenticated and has admin role
    if (!currentUser || currentUser.role !== "admin") return;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await AdminService.getAllUsers();
        if (response.success) {
          setUsers(response.data);
          console.log("Users fetched successfully!");
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to fetch users",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch users",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser, toast]);

  // Format the last login timestamp to a relative time string
  const formatLastActive = (timestamp) => {
    if (!timestamp || timestamp === "Never") return "Never";

    const lastLogin = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastLogin) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;

    return lastLogin.toLocaleDateString();
  };

  // Update a user's role
  const handleUpdateRole = async (userId, newRole) => {
    if (!currentUser) return;

    setIsUpdating(true);
    try {
      const response = await AdminService.updateUserRole(userId, newRole);
      
      if (response.success) {
        // Update local state
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );

        toast({
          title: "Success",
          description: "User role updated successfully",
        });

        setSelectedUser(null);
      } else {
        throw new Error(response.message || "Failed to update user role");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete a user
  const handleDeleteUser = async (userId) => {
    setIsUpdating(true);
    try {
      const response = await UserService.deleteUserAccount(userId);
      
      if (response.success) {
        // Remove user from local state
        setUsers(users.filter(user => user.id !== userId));
        
        toast({
          title: "Success",
          description: "User deleted successfully",
        });

        setDeleteUser(null);
      } else {
        throw new Error(response.message || "Failed to delete user");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // View user login history
  const handleViewLoginHistory = async (userId) => {
    try {
      setIsLoading(true);
      const response = await UserService.getUserProfile(userId);
      
      if (response.success) {
        setUserLoginHistory(response.data.loginHistory || []);
        setSelectedUser(users.find(user => user.id === userId));
        setIsHistoryDialogOpen(true);
      } else {
        throw new Error(response.message || "Failed to fetch user login history");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch user login history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete login history entries
  const handleDeleteLoginHistoryEntries = async (userId, entryIndexes) => {
    setIsUpdating(true);
    try {
      const response = await AdminService.deleteLoginHistoryEntries(userId, entryIndexes);
      
      if (response.success) {
        // Update local state
        setUserLoginHistory(userLoginHistory.filter((_, index) => !entryIndexes.includes(index)));
        
        toast({
          title: "Success",
          description: "Login history entries deleted successfully",
        });
      } else {
        throw new Error(response.message || "Failed to delete login history entries");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete login history entries",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Clear all login history
  const handleClearLoginHistory = async (userId) => {
    setIsUpdating(true);
    try {
      const response = await AdminService.clearLoginHistory(userId);
      
      if (response.success) {
        // Update local state
        setUserLoginHistory([]);
        
        toast({
          title: "Success",
          description: "Login history cleared successfully",
        });
      } else {
        throw new Error(response.message || "Failed to clear login history");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear login history",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle avatar upload
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleAvatarUpload = async (userId) => {
    if (!avatarFile) return;

    setIsUploadingAvatar(true);
    try {
      const response = await UserService.uploadAvatar(userId, avatarFile);
      
      if (response.success) {
        // Update user's avatar URL in the users array
        setUsers(
          users.map((user) =>
            user.id === userId 
              ? { ...user, avatarUrl: response.data.avatarUrl } 
              : user
          )
        );
        
        toast({
          title: "Success",
          description: "Avatar uploaded successfully",
        });

        setAvatarFile(null);
      } else {
        throw new Error(response.message || "Failed to upload avatar");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Delete avatar
  const handleDeleteAvatar = async (userId) => {
    setIsUpdating(true);
    try {
      const response = await UserService.deleteAvatar(userId);
      
      if (response.success) {
        // Update user's avatar URL in the users array
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, avatarUrl: null } : user
          )
        );
        
        toast({
          title: "Success",
          description: "Avatar deleted successfully",
        });
      } else {
        throw new Error(response.message || "Failed to delete avatar");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete avatar",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Loading state while checking authentication and role
  if (isLoading && !currentUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading User Management</CardTitle>
          <CardDescription>
            Please wait while we verify your access...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Access denied if not admin
  if (currentUser && currentUser.role !== "admin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You need administrator privileges to access this page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage users, roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No users found</div>
          ) : (
            <div className="rounded-md border">
              <div className="grid w-full divide-y">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="grid grid-cols-5 items-center p-4 gap-0"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Avatar>
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback>
                          {user.name?.charAt(0) || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-sm text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                        ${
                          user.role === "admin"
                            ? "bg-blue-100 text-blue-700"
                            : user.role === "moderator"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Last active: {formatLastActive(user.lastLogin)}
                    </div>
                    <div className="text-sm text-gray-500">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewLoginHistory(user.id)}
                        className="flex items-center text-xs"
                      >
                        <History className="h-3 w-3 mr-1" />
                        Login History
                      </Button>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedUser(user)}
                        title="Edit User Role"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          document.getElementById('avatar-upload').click();
                        }}
                        title="Upload Avatar"
                      >
                        <UploadCloud className="h-4 w-4" />
                      </Button>
                      {user.id !== currentUser?.id && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => setDeleteUser(user)}
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Hidden file input for avatar upload */}
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog
        open={!!selectedUser && !isHistoryDialogOpen && !avatarFile}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change role for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Select
              defaultValue={selectedUser?.role}
              onValueChange={(value) =>
                handleUpdateRole(selectedUser?.id, value)
              }
              disabled={isUpdating}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedUser(null)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Avatar Upload Dialog */}
      <Dialog
        open={!!avatarFile}
        onOpenChange={(open) => !open && setAvatarFile(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Avatar</DialogTitle>
            <DialogDescription>
              Upload a new avatar for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex flex-col gap-4">
            <div className="flex justify-center">
              <img
                src={avatarFile ? URL.createObjectURL(avatarFile) : ""}
                alt="Avatar Preview"
                className="w-32 h-32 rounded-full object-cover border"
              />
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setAvatarFile(null)}
                disabled={isUploadingAvatar}
              >
                Cancel
              </Button>
              <div className="flex gap-2">
                {selectedUser?.avatarUrl && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDeleteAvatar(selectedUser.id);
                      setAvatarFile(null);
                    }}
                    disabled={isUploadingAvatar}
                  >
                    Delete Current Avatar
                  </Button>
                )}
                <Button
                  onClick={() => handleAvatarUpload(selectedUser?.id)}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Avatar"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Login History Dialog */}
      <Dialog
        open={isHistoryDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsHistoryDialogOpen(false);
            setUserLoginHistory([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login History</DialogTitle>
            <DialogDescription>
              View login history for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-96 overflow-y-auto">
            {userLoginHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No login history available</div>
            ) : (
              <div className="space-y-4">
                {userLoginHistory.map((entry, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded-md">
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        IP: {entry.ip} | Device: {entry.device}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-red-500"
                      onClick={() => handleDeleteLoginHistoryEntries(selectedUser?.id, [index])}
                      disabled={isUpdating}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between items-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleClearLoginHistory(selectedUser?.id)}
              disabled={isUpdating || userLoginHistory.length === 0}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Clearing...
                </>
              ) : (
                "Clear All History"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsHistoryDialogOpen(false);
                setUserLoginHistory([]);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-bold">{deleteUser?.name}</span>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteUser(null)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteUser(deleteUser?.id)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import {
  User,
  Pencil,
  Trash2,
  Loader2,
  UploadCloud,
  History,
  X,
  MoreVertical,
  UserCircle,
} from "lucide-react";
import { AuthService, UserService, AdminService } from "../api/auth";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false); // New state for edit role dialog
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

  // Handle opening the edit role dialog
  const handleOpenEditRoleDialog = (user) => {
    setSelectedUser(user);
    setEditRoleDialogOpen(true);
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

        setEditRoleDialogOpen(false);
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
        setUsers(users.filter((user) => user.id !== userId));

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
        setSelectedUser(users.find((user) => user.id === userId));
        setIsHistoryDialogOpen(true);
      } else {
        throw new Error(
          response.message || "Failed to fetch user login history"
        );
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
      const response = await AdminService.deleteLoginHistoryEntries(
        userId,
        entryIndexes
      );

      if (response.success) {
        // Update local state
        setUserLoginHistory(
          userLoginHistory.filter((_, index) => !entryIndexes.includes(index))
        );

        toast({
          title: "Success",
          description: "Login history entries deleted successfully",
        });
      } else {
        throw new Error(
          response.message || "Failed to delete login history entries"
        );
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

  // Handle avatar upload selection
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
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

  // User card component for mobile view
  const UserCard = ({ user }) => (
    <div className="border rounded-lg p-4 my-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback>
              {user.firstName?.charAt(0) || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col w-fit">
            <p className="font-medium">{`${user.firstName} ${user.lastName}`}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenEditRoleDialog(user)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Role
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleViewLoginHistory(user.id)}>
              <History className="mr-2 h-4 w-4" />
              Login History
            </DropdownMenuItem>
            {user.id !== currentUser?.id && (
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onClick={() => setDeleteUser(user)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 items-center gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Role:</span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium self-start
            ${
              user.role === "admin"
                ? "bg-red-100 text-red-700"
                : user.role === "moderator"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {user.role}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Last active:</span>
          <span>{formatLastActive(user.lastLogin)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage users, roles and permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No users found</div>
          ) : (
            <>
              {/* Mobile view (card layout) */}
              <div className="md:hidden">
                {users.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>

              {/* Desktop view (table layout) */}
              <div className="hidden md:block rounded-md border">
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
                            {user.firstName?.charAt(0) || (
                              <User className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{`${user.firstName} ${user.lastName}`}</p>
                          <p className="sm:text-sm text-xs text-gray-500">
                            {user.email}
                          </p>
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
                          onClick={() => handleOpenEditRoleDialog(user)}
                          title="Edit User Role"
                        >
                          <Pencil className="h-4 w-4" />
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog
        open={editRoleDialogOpen}
        onOpenChange={(open) => !open && setEditRoleDialogOpen(false)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change role for {selectedUser?.firstName}
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
              onClick={() => setEditRoleDialogOpen(false)}
              disabled={isUpdating}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </DialogFooter>
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
        <DialogContent className="sm:max-w-md w-sm rounded-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Login History</DialogTitle>
            <DialogDescription>
              View login history for {selectedUser?.firstName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex-1 overflow-y-auto">
            {userLoginHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No login history available
              </div>
            ) : (
              <div className="space-y-4">
                {userLoginHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 border rounded-md"
                  >
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        IP: {entry.ip} | Device: {entry.device}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-red-500 ml-2 flex-shrink-0"
                      onClick={() =>
                        handleDeleteLoginHistoryEntries(selectedUser?.id, [
                          index,
                        ])
                      }
                      disabled={isUpdating}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleClearLoginHistory(selectedUser?.id)}
              disabled={isUpdating || userLoginHistory.length === 0}
              className="w-full sm:w-auto"
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
              className="w-full sm:w-auto"
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-bold">{deleteUser?.firstName} {deleteUser?.lastName}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteUser(null)}
              disabled={isUpdating}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteUser(deleteUser?.id)}
              disabled={isUpdating}
              className="w-full sm:w-auto"
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
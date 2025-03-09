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
import { useToast } from "../hooks/use-toast";
import { User, Pencil, Trash2, Loader2 } from "lucide-react";
import { getDatabase, ref, get, remove, onValue } from "firebase/database";
import { database } from "../firebase";
import { updateUserRole } from "../services/auth-service";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication and get user role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        try {
          // Fetch the user data from the database directly
          const userRef = ref(database, `users/${user.uid}`);
          const userSnapshot = await get(userRef);

          if (userSnapshot.exists()) {
            // Get the user data from the database
            const userData = userSnapshot.val();

            // Get user role
            setUserRole(userData.role || "user");
          } else {
            // If no database record exists, default to regular user
            setUserRole("user");
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          toast({
            title: "Error",
            description: "Failed to load user profile data",
            variant: "destructive",
          });
          setUserRole("user"); // Default to regular user on error
        }
      } else {
        // Not authenticated, redirect to login
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate, toast]);

  // Fetch all users from the database once we know the user is an admin
  useEffect(() => {
    // Only fetch users if user is authenticated and has admin role
    if (!currentUser || userRole !== "admin") return;

    const fetchUsers = () => {
      const usersRef = ref(database, "users");

      // Use onValue to listen for changes in real-time
      const unsubscribe = onValue(
        usersRef,
        (snapshot) => {
          setIsLoading(true);
          if (snapshot.exists()) {
            const usersData = [];
            snapshot.forEach((childSnapshot) => {
              const userData = childSnapshot.val();
              usersData.push({
                id: userData.id,
                name: `${userData.firstName || ""} ${
                  userData.lastName || ""
                }`.trim(),
                email: userData.email,
                role: userData.role || "user",
                avatarUrl: userData.avatarUrl || "",
                lastLogin: userData.lastLogin || "Never",
              });
            });
            setUsers(usersData);
          } else {
            setUsers([]);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("Error fetching users:", error);
          toast({
            title: "Error",
            description: "Failed to fetch users",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    };

    fetchUsers();
  }, [currentUser, userRole, toast]);

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
      // Call the auth service function to update the role
      await updateUserRole(userId, newRole, currentUser.uid);

      // Update is handled by the onValue listener, but we'll update locally too for immediate UI feedback
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
      // Delete user from the database
      const userRef = ref(database, `users/${userId}`);
      await remove(userRef);

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      setDeleteUser(null);
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

  // Loading state while checking authentication and role
  if (isLoading && !userRole) {
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
  if (userRole !== "admin") {
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
          <CardDescription>Manage user roles and permissions</CardDescription>
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
                    className="grid grid-cols-4 items-center p-4 gap-0"
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
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {user.id !== currentUser?.uid && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => setDeleteUser(user)}
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
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog
        open={!!selectedUser}
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

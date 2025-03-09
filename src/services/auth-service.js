// auth-service.js
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { getDatabase, ref, set, get, update } from "firebase/database";
import { auth, database } from "../firebase";
import Cookies from "js-cookie";

// Cookie configuration
const COOKIE_NAME = "auth_session";
const DEFAULT_COOKIE_EXPIRY = 7; // 7 days

// Map Firebase error codes to user-friendly messages
const ERROR_MESSAGES = {
  "auth/email-already-in-use": "Email is already registered",
  "auth/invalid-email": "Invalid email address",
  "auth/weak-password": "Password should be at least 6 characters",
  "auth/user-not-found": "No account found with this email",
  "auth/wrong-password": "Incorrect password",
  "auth/too-many-requests":
    "Too many failed login attempts. Please try again later",
  "auth/network-request-failed": "Network error. Please check your connection",
};

// Helper function to handle Firebase errors
const handleFirebaseError = (error) => {
  const message =
    ERROR_MESSAGES[error.code] ||
    `An unexpected error occurred: ${error.message}`;
  throw new Error(message);
};

// Set cookie with user session data
const setSessionCookie = (userData, rememberMe = false) => {
  const cookieData = {
    uid: userData.uid,
    email: userData.email,
    lastLogin: new Date().toISOString(),
  };

  // Set cookie expiration based on "remember me" preference
  const expires = rememberMe ? DEFAULT_COOKIE_EXPIRY : null; // null = session cookie

  // Set the cookie with proper security settings
  Cookies.set(COOKIE_NAME, JSON.stringify(cookieData), {
    expires: expires
      ? new Date(new Date().getTime() + expires * 24 * 60 * 60 * 1000)
      : undefined,
    secure: window.location.protocol === "https:",
    sameSite: "strict",
  });

  // Also set Firebase persistence level based on remember me setting
  setPersistence(
    auth,
    rememberMe ? browserLocalPersistence : browserSessionPersistence
  ).catch((error) => console.error("Error setting persistence:", error));
};

// Clear session cookie on logout
const clearSessionCookie = () => {
  Cookies.remove(COOKIE_NAME);
};

// Get current user data from cookie (for quick loading)
export const getUserFromCookie = () => {
  const cookieData = Cookies.get(COOKIE_NAME);
  if (!cookieData) return null;

  try {
    return JSON.parse(cookieData);
  } catch (error) {
    console.error("Error parsing auth cookie:", error);
    clearSessionCookie();
    return null;
  }
};

// Get current user data
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    // First check cookie for quick loading
    const cookieUser = getUserFromCookie();
    if (cookieUser) {
      // Verify the cookie data by fetching from database
      get(ref(database, `users/${cookieUser.uid}`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            resolve({ ...snapshot.val(), uid: cookieUser.uid });
          } else {
            // User exists in cookie but not in database - fall back to Firebase auth
            proceedWithFirebaseAuth();
          }
        })
        .catch(() => proceedWithFirebaseAuth());
    } else {
      proceedWithFirebaseAuth();
    }

    function proceedWithFirebaseAuth() {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        if (user) {
          // User is signed in, get their profile data
          get(ref(database, `users/${user.uid}`))
            .then((snapshot) => {
              if (snapshot.exists()) {
                const userData = { ...snapshot.val(), uid: user.uid };
                // Update cookie with fresh data
                setSessionCookie(userData);
                resolve(userData);
              } else {
                // User exists in auth but not in database
                resolve({ uid: user.uid });
              }
            })
            .catch((error) => reject(handleFirebaseError(error)));
        } else {
          // No user is signed in
          clearSessionCookie();
          resolve(null);
        }
      }, reject);
    }
  });
};

// Helper function to create/update user profile in database
const saveUserProfile = async (user, additionalData = {}) => {
  if (!user || !user.uid) throw new Error("User data is required");

  const userRef = ref(database, `users/${user.uid}`);
  const snapshot = await get(userRef);
  const now = new Date().toISOString();

  if (!snapshot.exists()) {
    // Create new user profile
    const names = user.displayName ? user.displayName.split(" ") : ["", ""];
    const firstName = additionalData.firstName || names[0] || "";
    const lastName = additionalData.lastName || names.slice(1).join(" ") || "";

    const userProfile = {
      id: user.uid,
      firstName,
      lastName,
      username: additionalData.username || user.email?.split("@")[0] || "",
      email: user.email || "",
      phoneNumber: additionalData.phoneNumber || user.phoneNumber || "",
      role: "user",
      createdAt: now,
      lastLogin: now,
    };

    await set(userRef, userProfile);
  } else {
    // Just update login time for existing users
    await update(userRef, { lastLogin: now });
  }

  // Get updated user data
  const updatedSnapshot = await get(userRef);
  return updatedSnapshot.val();
};

// Validate required fields
const validateUserData = (data, requiredFields) => {
  const missingFields = requiredFields.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }
};

// Register new user with email and password
export const registerUser = async (userData) => {
  try {
    validateUserData(userData, ["email", "password"]);

    const { email, password, rememberMe } = userData;
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    const userProfile = await saveUserProfile(user, userData);
    const result = { ...userProfile, uid: user.uid };

    // Set cookie if rememberMe is true
    setSessionCookie(result, rememberMe);

    return result;
  } catch (error) {
    handleFirebaseError(error);
  }
};

// Login with email/password
export const loginUser = async (email, password, rememberMe = false) => {
  try {
    validateUserData({ email, password }, ["email", "password"]);

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    const userProfile = await saveUserProfile(user);
    const result = { ...userProfile, uid: user.uid };

    // Set cookie with remember me preference
    setSessionCookie(result, rememberMe);

    return result;
  } catch (error) {
    handleFirebaseError(error);
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    clearSessionCookie();
    await signOut(auth);
    return true;
  } catch (error) {
    handleFirebaseError(error);
  }
};

// Generic social sign-in handler
const handleSocialSignIn = async (provider, rememberMe = false) => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userProfile = await saveUserProfile(user);
    const userData = { ...userProfile, uid: user.uid };

    // Set cookie with remember me preference
    setSessionCookie(userData, rememberMe);

    return userData;
  } catch (error) {
    handleFirebaseError(error);
  }
};

// Sign in with Google
export const signInWithGoogle = async (rememberMe = false) => {
  return handleSocialSignIn(new GoogleAuthProvider(), rememberMe);
};

// Sign in with Github
export const signInWithGithub = async (rememberMe = false) => {
  return handleSocialSignIn(new GithubAuthProvider(), rememberMe);
};

// Get user role
export const getUserRole = async (uid) => {
  try {
    if (!uid) throw new Error("User ID is required");

    const snapshot = await get(ref(database, `users/${uid}`));
    if (snapshot.exists()) {
      return snapshot.val().role || "user";
    }
    return null;
  } catch (error) {
    handleFirebaseError(error);
  }
};

// Update user role (admin only)
export const updateUserRole = async (uid, newRole, currentUserUid) => {
  try {
    if (!uid || !newRole) throw new Error("User ID and new role are required");

    // Verify the current user is an admin
    if (currentUserUid) {
      const adminSnapshot = await get(ref(database, `users/${currentUserUid}`));
      if (!adminSnapshot.exists() || adminSnapshot.val().role !== "admin") {
        throw new Error("Unauthorized: Only admins can update user roles");
      }
    }

    // Validate the role is one of the allowed values
    const validRoles = ["user", "admin", "moderator"];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    await update(ref(database, `users/${uid}`), { role: newRole });
    return true;
  } catch (error) {
    handleFirebaseError(error);
  }
};
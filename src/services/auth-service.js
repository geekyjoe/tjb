// auth-service.js
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider 
} from 'firebase/auth';
import { 
  getDatabase, 
  ref, 
  set, 
  get,
  update 
} from 'firebase/database';
import { auth, database } from '../firebase';

// Map Firebase error codes to user-friendly messages
const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'Email is already registered',
  'auth/invalid-email': 'Invalid email address',
  'auth/weak-password': 'Password should be at least 6 characters',
  'auth/user-not-found': 'No account found with this email',
  'auth/wrong-password': 'Incorrect password',
  'auth/too-many-requests': 'Too many failed login attempts. Please try again later',
  'auth/network-request-failed': 'Network error. Please check your connection'
};

// Helper function to handle Firebase errors
const handleFirebaseError = (error) => {
  const message = ERROR_MESSAGES[error.code] || `An unexpected error occurred: ${error.message}`;
  throw new Error(message);
};

// Helper function to create/update user profile in database
const saveUserProfile = async (user, additionalData = {}) => {
  if (!user || !user.uid) throw new Error('User data is required');
  
  const userRef = ref(database, `users/${user.uid}`);
  const snapshot = await get(userRef);
  const now = new Date().toISOString();
  
  if (!snapshot.exists()) {
    // Create new user profile
    const names = user.displayName ? user.displayName.split(' ') : ['', ''];
    const firstName = additionalData.firstName || names[0] || '';
    const lastName = additionalData.lastName || names.slice(1).join(' ') || '';
    
    const userProfile = {
      id: user.uid,
      firstName,
      lastName,
      username: additionalData.username || user.email?.split('@')[0] || '',
      email: user.email || '',
      phoneNumber: additionalData.phoneNumber || user.phoneNumber || '',
      role: 'user',
      createdAt: now,
      lastLogin: now
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
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
};

// Register new user with email and password
export const registerUser = async (userData) => {
  try {
    validateUserData(userData, ['email', 'password']);
    
    const { email, password } = userData;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userProfile = await saveUserProfile(user, userData);
    return { ...userProfile, uid: user.uid };
  } catch (error) {
    // Critical fix: don't return the error, throw it
    handleFirebaseError(error);
  }
};

// Login with email/password
export const loginUser = async (email, password) => {
  try {
    validateUserData({ email, password }, ['email', 'password']);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userProfile = await saveUserProfile(user);
    return { ...userProfile, uid: user.uid };
  } catch (error) {
    // Critical fix: don't return the error, throw it
    handleFirebaseError(error);
  }
};

// Generic social sign-in handler
const handleSocialSignIn = async (provider) => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    const userProfile = await saveUserProfile(user);
    return { ...userProfile, uid: user.uid };
  } catch (error) {
    // Critical fix: don't return the error, throw it
    handleFirebaseError(error);
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  return handleSocialSignIn(new GoogleAuthProvider());
};

// Sign in with Github
export const signInWithGithub = async () => {
  return handleSocialSignIn(new GithubAuthProvider());
};

// Get user role
export const getUserRole = async (uid) => {
  try {
    if (!uid) throw new Error('User ID is required');
    
    const snapshot = await get(ref(database, `users/${uid}`));
    if (snapshot.exists()) {
      return snapshot.val().role || 'user';
    }
    return null;
  } catch (error) {
    // Critical fix: don't return the error, throw it
    handleFirebaseError(error);
  }
};

// Update user role (admin only)
export const updateUserRole = async (uid, newRole, currentUserUid) => {
  try {
    if (!uid || !newRole) throw new Error('User ID and new role are required');
    
    // Verify the current user is an admin
    if (currentUserUid) {
      const adminSnapshot = await get(ref(database, `users/${currentUserUid}`));
      if (!adminSnapshot.exists() || adminSnapshot.val().role !== 'admin') {
        throw new Error('Unauthorized: Only admins can update user roles');
      }
    }
    
    // Validate the role is one of the allowed values
    const validRoles = ['user', 'admin', 'moderator'];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }
    
    await update(ref(database, `users/${uid}`), { role: newRole });
    return true;
  } catch (error) {
    // Critical fix: don't return the error, throw it
    handleFirebaseError(error);
  }
};
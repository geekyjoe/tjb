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

// Create new user with email/password
export const registerUser = async (userData) => {
  const { email, password, firstName, lastName, username, phoneNumber } = userData;
  
  try {
    // Create authentication record
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile in Realtime Database
    await set(ref(database, `users/${user.uid}`), {
      id: user.uid,
      firstName: firstName,
      lastName: lastName,
      username: username,
      email: email,
      phoneNumber: phoneNumber,
      role: 'user', // Default role
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });
    
    return user;
  } catch (error) {
    throw error;
  }
};

// Login with email/password
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update last login time
    await update(ref(database, `users/${user.uid}`), {
      lastLogin: new Date().toISOString()
    });
    
    // Get user data from database
    const snapshot = await get(ref(database, `users/${user.uid}`));
    return { ...snapshot.val(), uid: user.uid };
  } catch (error) {
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user exists in database
    const snapshot = await get(ref(database, `users/${user.uid}`));
    
    if (!snapshot.exists()) {
      // Create new user profile if first time
      await set(ref(database, `users/${user.uid}`), {
        id: user.uid,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        username: user.email?.split('@')[0] || '',
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        role: 'user',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
    } else {
      // Update last login
      await update(ref(database, `users/${user.uid}`), {
        lastLogin: new Date().toISOString()
      });
    }
    
    return user;
  } catch (error) {
    throw error;
  }
};

// Sign in with Github
export const signInWithGithub = async () => {
  try {
    const provider = new GithubAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user exists in database
    const snapshot = await get(ref(database, `users/${user.uid}`));
    
    if (!snapshot.exists()) {
      // Create new user profile if first time
      await set(ref(database, `users/${user.uid}`), {
        id: user.uid,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        username: user.email?.split('@')[0] || '',
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        role: 'user',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
    } else {
      // Update last login
      await update(ref(database, `users/${user.uid}`), {
        lastLogin: new Date().toISOString()
      });
    }
    
    return user;
  } catch (error) {
    throw error;
  }
};

// Get user role
export const getUserRole = async (uid) => {
  try {
    const snapshot = await get(ref(database, `users/${uid}`));
    if (snapshot.exists()) {
      return snapshot.val().role;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Update user role (admin only)
export const updateUserRole = async (uid, newRole) => {
  try {
    // You might want to add admin validation here
    await update(ref(database, `users/${uid}`), {
      role: newRole
    });
  } catch (error) {
    throw error;
  }
};
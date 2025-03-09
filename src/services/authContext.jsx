// AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { getCurrentUser } from './auth-service';
import Cookies from 'js-cookie';
import { auth } from '../firebase';

const AuthContext = createContext();

// Constants
const USER_COOKIE_NAME = 'user_session';
const USER_COOKIE_VERSION = 'v1';
const COOKIE_EXPIRY = 7; // Days
const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

const encryptUserData = (data) => {
  if (!data) return null;
  const dataStr = JSON.stringify(data);
  return btoa(dataStr);
};

const decryptUserData = (encryptedData) => {
  if (!encryptedData) return null;
  try {
    const dataStr = atob(encryptedData);
    return JSON.parse(dataStr);
  } catch (e) {
    console.error("Failed to decrypt user data", e);
    return null;
  }
};

const sanitizeUserForCookie = (user) => {
  if (!user) return null;
  
  return {
    uid: user.uid,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    username: user.username || '',
    email: user.email || '',
    role: user.role || 'user',
    lastLogin: user.lastLogin,
    cookieCreatedAt: new Date().toISOString(),
    version: USER_COOKIE_VERSION
  };
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [authError, setAuthError] = useState(null);
  
  // Use refs to track state without triggering effects
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;
  
  // Save user data to cookie whenever it changes
  // This won't cause infinite loops because it doesn't depend on state that changes inside other effects
  useEffect(() => {
    if (currentUser) {
      const sanitizedUser = sanitizeUserForCookie(currentUser);
      const encryptedData = encryptUserData(sanitizedUser);
      
      Cookies.set(USER_COOKIE_NAME, encryptedData, { 
        expires: COOKIE_EXPIRY, 
        secure: window.location.protocol === 'https:',
        sameSite: 'strict',
        path: '/'
      });
    }
  }, [currentUser]); // Only depends on currentUser
  
  // Logout function
  const logout = useCallback(async () => {
    try {
      await auth.signOut();
      Cookies.remove(USER_COOKIE_NAME, { path: '/' });
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      setAuthError("Failed to logout. Please try again.");
    }
  }, []); // No dependencies
  
  // Function to refresh user data from Firebase
  const refreshUserData = useCallback(async (silent = true) => {
    if (!silent) setLoading(true);
    
    try {
      const freshUserData = await getCurrentUser();
      
      if (freshUserData) {
        setCurrentUser(freshUserData);
      } else {
        // User is no longer authenticated in Firebase
        setCurrentUser(null);
        Cookies.remove(USER_COOKIE_NAME, { path: '/' });
      }
      
      setAuthError(null);
    } catch (error) {
      console.error("User data refresh error:", error);
      setAuthError("Failed to refresh user data. Please try logging in again.");
      
      // If there's an auth error, clear the cookie
      if (error.message?.includes('auth')) {
        Cookies.remove(USER_COOKIE_NAME, { path: '/' });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []); // No dependencies
  
  // Initial load - only runs once
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      
      try {
        // First try cookie for instant load
        const cookieData = Cookies.get(USER_COOKIE_NAME);
        
        if (cookieData) {
          try {
            const decryptedData = decryptUserData(cookieData);
            
            // Validate cookie data
            if (
              decryptedData && 
              decryptedData.uid && 
              decryptedData.version === USER_COOKIE_VERSION
            ) {
              // Use cookie data for immediate render
              setCurrentUser(decryptedData);
              setLoading(false);
              
              // Verify with Firebase in background
              refreshUserData(true);
            } else {
              // Invalid or old version cookie
              Cookies.remove(USER_COOKIE_NAME, { path: '/' });
              await refreshUserData(false);
            }
          } catch (e) {
            console.error("Cookie parsing error:", e);
            Cookies.remove(USER_COOKIE_NAME, { path: '/' });
            await refreshUserData(false);
          }
        } else {
          // No cookie, load directly from Firebase
          await refreshUserData(false);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setAuthError("Authentication error. Please try again later.");
        setLoading(false);
      } finally {
        setInitialLoadComplete(true);
      }
    };
    
    loadUserData();
    
    // Listen for auth state changes (logout from another tab, token expiry)
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      // Use the ref to access latest state without adding a dependency
      const userState = currentUserRef.current;
      
      if (!user && userState) {
        // User logged out in another tab/window
        setCurrentUser(null);
        Cookies.remove(USER_COOKIE_NAME, { path: '/' });
      } else if (user && (!userState || user.uid !== userState.uid)) {
        // User logged in from another tab or token refreshed
        await refreshUserData(true);
      }
    });
    
    return () => unsubscribe();
  }, [refreshUserData]); // Only depends on refreshUserData which never changes
  
  // Periodic background refresh - no state dependencies
  useEffect(() => {
    if (!currentUser) return;
    
    const intervalId = setInterval(() => {
      refreshUserData(true);
    }, REFRESH_INTERVAL);
    
    return () => clearInterval(intervalId);
  }, [currentUser, refreshUserData]);
  
  // Context value
  const value = {
    currentUser,
    setCurrentUser,
    loading,
    initialLoadComplete,
    authError,
    logout,
    refreshUserData: () => refreshUserData(false),
    isAdmin: currentUser?.role === 'admin',
    isModerator: ['admin', 'moderator'].includes(currentUser?.role)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
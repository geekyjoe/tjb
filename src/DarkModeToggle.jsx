import React, { createContext, useState, useEffect, useContext } from "react";
import { Moon, Sun } from "lucide-react";

// Create a context for dark mode
const DarkModeContext = createContext();

// Dark Mode Provider Component
export const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize dark mode from cookies, defaulting to light mode
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? savedMode === "true" : false;
  });

  // Apply dark mode class to html element
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (darkMode) {
      htmlElement.classList.add("dark");
      htmlElement.style.colorScheme = "dark";
      localStorage.setItem("darkMode", "true");
    } else {
      htmlElement.classList.remove("dark");
      htmlElement.style.colorScheme = "light";
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

// Dark Mode Toggle Button Component
export const DarkModeToggle = ({ onClick }) => {
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

  // Handle click - allows for additional onClick logic if passed
  const handleClick = () => {
    toggleDarkMode();
    onClick?.();
  };

  return (
    <>
      {/* Mobile/Small Screen - NavLink Style */}
      <li 
        className="md:hidden flex items-center justify-between cursor-pointer focus:outline-none focus:underline focus:decoration-solid focus:underline-offset-4 text-neutral-600 dark:text-neutral-300 dark:hover:text-neutral-100 hover:text-neutral-900 hover:underline hover:decoration-solid hover:underline-offset-4"
        onClick={handleClick}
        aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {darkMode ? (
          <Sun className="ml-2 h-5 w-5" />
        ) : (
          <Moon className="ml-2 h-5 w-5" />
        )}
        {darkMode ? "Toggle Light Mode" : "Toggle Dark Mode"}
      </li>

      {/* Desktop/Large Screen - Button Style */}
      <button 
        className="hidden md:inline-flex hover:ring hover:ring-2 ring-neutral-200 p-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
        onClick={handleClick}
        aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </>
  );
};
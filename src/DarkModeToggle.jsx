import React, { createContext, useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";

// Create a context for dark mode
const DarkModeContext = createContext();

// Dark Mode Provider Component
export const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize dark mode from cookies or system preference
    const savedMode = Cookies.get("darkMode");
    if (savedMode) {
      return savedMode === "true";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Apply dark mode class to html element
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (darkMode) {
      htmlElement.classList.add("dark");
      htmlElement.style.colorScheme = "dark";
      Cookies.set("darkMode", "true", { expires: 365 }); // Save for a year
    } else {
      htmlElement.classList.remove("dark");
      htmlElement.style.colorScheme = "light";
      Cookies.set("darkMode", "false", { expires: 365 });
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
          <SunOutlined className="ml-2" style={{ fontSize: "20px" }} />
        ) : (
          <MoonOutlined className="ml-2" style={{ fontSize: "20px" }} />
        )}
        {darkMode ? "Toggle Light Mode" : "Toggle Dark Mode" }
      </li>

      {/* Desktop/Large Screen - Button Style */}
      <button 
        className="hidden md:inline-flex p-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
        onClick={handleClick}
        style={{ fontSize: "20px" }}
        aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {darkMode ? <SunOutlined /> : <MoonOutlined />}
      </button>
    </>
  );
};

import React, { createContext, useState, useEffect, useContext } from "react";
import { Moon, Sun, Check, MonitorSmartphone } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { Button } from "./components/ui/button";
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "system";
    }
    return "system";
  });

  useEffect(() => {
    const htmlElement = document.documentElement;

    const applyTheme = (selectedTheme) => {
      let effectiveTheme = selectedTheme;

      if (selectedTheme === "system") {
        effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
      }

      if (effectiveTheme === "dark") {
        htmlElement.classList.add("dark");
        htmlElement.style.colorScheme = "dark";
      } else {
        htmlElement.classList.remove("dark");
        htmlElement.style.colorScheme = "light";
      }
    };

    applyTheme(theme);
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system");
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const setThemeValue = (newTheme) => {
    setTheme(newTheme);
  };

  const isDarkMode = () => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return theme === "dark";
  };

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme: setThemeValue, isDarkMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeToggle = ({ className }) => {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="rounded-full ml-2 focus:outline-none focus-visible:ring-0 bg-transparent border-none shadow-none" size="icon">
          <ThemeIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className={`${
            theme === "light"
              ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
              : ""
          }`}
          onClick={() => setTheme('light')}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === "light" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={`${theme === "dark" ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : ""}`}
          onClick={() => setTheme('dark')}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={`${theme === "system" ? "text-green-600 bg-green-50 dark:bg-green-900/20" : ""}`}
          onClick={() => setTheme('system')}
        >
          <MonitorSmartphone className="mr-2 h-4 w-4" />
          <span>System</span>
          {theme === "system" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const ThemeIcon = () => {
  const { theme } = useTheme();

  if (theme === "dark") return <Moon className="h-5 w-5" />;
  if (theme === "light") return <Sun className="h-5 w-5 text-yellow-600" />;
  return <MonitorSmartphone className="h-5 w-5" />;
};

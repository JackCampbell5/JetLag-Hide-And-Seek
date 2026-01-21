import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    // Otherwise check device preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    // Update document body class for global styles
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      // Only auto-update if user hasn't set a preference
      const savedTheme = localStorage.getItem("theme");
      if (!savedTheme) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = {
    colors: {
      // Background colors
      background: isDarkMode ? "#1a1a1a" : "#ffffff",
      backgroundAlt: isDarkMode ? "#2d2d2d" : "#f5f5f5",
      backgroundCard: isDarkMode ? "#2d2d2d" : "#ffffff",

      // Text colors
      text: isDarkMode ? "#e0e0e0" : "#333333",
      textSecondary: isDarkMode ? "#b0b0b0" : "#666666",
      textMuted: isDarkMode ? "#888888" : "#999999",

      // Border colors
      border: isDarkMode ? "#444444" : "#dddddd",
      borderLight: isDarkMode ? "#333333" : "#e0e0e0",

      // Button colors
      primary: "#4CAF50",
      primaryHover: "#45a049",
      secondary: "#2196F3",
      secondaryHover: "#0b7dda",
      danger: "#f44336",
      dangerHover: "#da190b",

      // Info/Status colors
      info: isDarkMode ? "#1e3a5f" : "#e3f2fd",
      warning: isDarkMode ? "#4a3f1f" : "#fff3cd",
      success: isDarkMode ? "#1f3d1f" : "#d4edda",
      error: isDarkMode ? "#4a1f1f" : "#f8d7da",

      // Special colors
      curse: isDarkMode ? "#2d1a2d" : "#f3e5f5",
      curseText: isDarkMode ? "#d19fd1" : "#8B008B",

      // Header
      header: isDarkMode ? "#2d2d2d" : "#f5f5f5",

      // Modal
      modalOverlay: isDarkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.5)",
      modalBackground: isDarkMode ? "#2d2d2d" : "#ffffff",

      // Input
      input: isDarkMode ? "#3a3a3a" : "#ffffff",
      inputBorder: isDarkMode ? "#555555" : "#dddddd",
      inputFocus: isDarkMode ? "#666666" : "#4CAF50",

      // Card colors (kept consistent for game mechanics)
      cardRed: "#ff4444",
      cardOrange: "#ff8c00",
      cardYellow: "#ffd700",
      cardBlue: "#4169e1",
      cardGreen: "#32cd32",
      cardPurple: "#9370db",
      cardPink: "#ff69b4",
      cardGray: "#808080",
      cardSpecial: "#ff00ff",
      cardCurse: "#8B008B",
    },
    isDarkMode,
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Utility function to get card background color by card type and color
export const getCardBackgroundColor = (theme, card) => {
  if (!card) return theme.colors.backgroundAlt;

  // if (card.Type === "Action") {
  //   return theme.colors.cardAction;
  // }

  // if (card.Type === "Curse") {
  //   return theme.colors.cardCurse;
  // }

  // Map card color string to theme color
  const colorMap = {
    Red: theme.colors.cardRed,
    Orange: theme.colors.cardOrange,
    Yellow: theme.colors.cardYellow,
    Blue: theme.colors.cardBlue,
    Green: theme.colors.cardGreen,
    Purple: theme.colors.cardPurple,
    Pink: theme.colors.cardPink,
    Gray: theme.colors.cardGray,
  };
  console.log("Card Color:", card.color, "Mapped Color:", colorMap[card.color]);
  return colorMap[card.color] || theme.colors.backgroundAlt;
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
      borderHighlight: "#FFD700",

      // Button colors
      primary: "#4CAF50",
      primaryHover: "#45a049",
      secondary: isDarkMode ? "#003e70ff" : "#addaffff",
      secondaryHover: "#0b7dda",
      secondaryDark: "#1976D2",
      danger: isDarkMode ? "#922119ff" : "#ff968fff",
      dangerHover: "#da190b",

      // Info/Status colors
      info: isDarkMode ? "#1e3a5f" : "#e3f2fd",
      warning: isDarkMode ? "#4a3f1f" : "#fff3cd",
      success: isDarkMode ? "#1f3d1f" : "#d4edda",
      error: isDarkMode ? "#4a1f1f" : "#f8d7da",

      // Special colors
      curse: isDarkMode ? "#2d1a2d" : "#f3e5f5",
      curseText: isDarkMode ? "#d19fd1" : "#8B008B",
      highlight: "rgba(255, 215, 0, 0.8)",

      // Header
      header: isDarkMode ? "#2d2d2d" : "#f5f5f5",

      // Modal
      modalOverlay: isDarkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.5)",
      modalBackground: isDarkMode ? "#2d2d2d" : "#ffffff",
      curseModalBg: isDarkMode ? "#170044ff" : "#e2d4ffff",

      // Input
      input: isDarkMode ? "#3a3a3a" : "#ffffff",
      inputBorder: isDarkMode ? "#555555" : "#dddddd",
      inputFocus: isDarkMode ? "#666666" : "#4CAF50",

      // Card colors (kept consistent for game mechanics)
      cardRed: isDarkMode ? "#a40000ff" : "#ff9e9eff",
      cardOrange: isDarkMode ? "#613f00ff" : "#ffd6a3ff",
      cardYellow: isDarkMode ? "#525400ff" : "#fff1a4ff",
      cardGreen: isDarkMode ? "#006900ff" : "#abffabff",
      cardBlue: isDarkMode ? "#002593ff" : "#8aa8ffff",
      cardPurple: isDarkMode ? "#2f008cff" : "#c7abffff",
      cardPink: isDarkMode ? "#78003cff" : "#ffb4daff",
      cardGray: isDarkMode ? "#474747ff" : "#bababaff",

      // Semi-transparent overlays
      overlayLight: "rgba(255, 255, 255, 0.3)",
      overlayDark: "rgba(0, 0, 0, 0.3)",
      overlayBorder: "rgba(255, 255, 255, 0.4)",
      overlayWhite: "rgba(255, 255, 255, 0.5)",

      // Common UI colors
      borderActive: "#4CAF50",
      borderDefault: "#ccc",
      borderCard: "rgba(255, 255, 255, 0.5)",
      buttonDanger: "rgba(255, 100, 100, 0.5)",
    },
    isDarkMode,
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      <div
        style={{
          backgroundColor: theme.colors.backgroundAlt,
          color: theme.colors.text,
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

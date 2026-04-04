import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { THEMES, type ThemeConfig, type ThemeKey } from "../types";

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (key: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES.burgundy,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeKey, setThemeKey] = useState<ThemeKey>(() => {
    return (localStorage.getItem("taxcore_theme") as ThemeKey) || "burgundy";
  });

  useEffect(() => {
    const t = THEMES[themeKey];
    document.documentElement.style.setProperty("--theme-primary", t.primary);
    document.documentElement.style.setProperty(
      "--theme-primary-light",
      t.primaryLight,
    );
    document.documentElement.style.setProperty("--theme-gold", t.gold);
  }, [themeKey]);

  const setTheme = (key: ThemeKey) => {
    localStorage.setItem("taxcore_theme", key);
    setThemeKey(key);
  };

  return (
    <ThemeContext.Provider value={{ theme: THEMES[themeKey], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

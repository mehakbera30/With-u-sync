import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="w-12 h-12 bg-white dark:bg-slate-900 border border-teal-100 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-slate-800 transition shadow-sm"
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;

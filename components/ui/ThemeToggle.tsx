"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;

    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const initialTheme: Theme =
      savedTheme || (systemPrefersDark ? "dark" : "light");

    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }

  if (!mounted) {
    return (
      <div className="h-11 w-11 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/10" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
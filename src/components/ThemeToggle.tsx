import { useEffect, useState, useRef } from "react";

const themes = [
  "default",
  "blue",
  "yale-blue",
  "ocean-blue",
  "red",
  "molten-red",
  "racing-red",
  "texas",
  "texas-classic",
  "texas-coastal",
  "texas-plum",
] as const;

type ThemeName = (typeof themes)[number];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>("default");
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // pretty-print theme id for display
  const pretty = (t: string) =>
    t === "default"
      ? "Default"
      : t
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ");

  // apply theme attributes on <html>
  const applyTheme = (newTheme: string, isDark: boolean) => {
    const html = document.documentElement;
    if (newTheme && newTheme !== "default") html.setAttribute("data-theme", newTheme);
    else html.removeAttribute("data-theme");

    if (isDark) html.setAttribute("data-dark", "true");
    else html.removeAttribute("data-dark");
  };

  // Initialize from localStorage
  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") || "default") as string;
    const savedDark = localStorage.getItem("dark") === "true";

    // only accept known themes, fallback to default
    const validTheme = (themes as readonly string[]).includes(savedTheme) ? (savedTheme as ThemeName) : "default";

    setTheme(validTheme);
    setDark(savedDark);
    applyTheme(validTheme, savedDark);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme, dark);
    setOpen(false); // close dropdown after selection
  };

  const handleDarkToggle = () => {
    setDark((prev) => {
      const newDark = !prev;
      localStorage.setItem("dark", newDark.toString());
      applyTheme(theme, newDark);
      return newDark;
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1 rounded border border-border bg-surface text-text hover:bg-surface/80 transition"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {pretty(theme)}
        <span className="ml-1 text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown */}
      <div
        role="menu"
        className={`absolute right-0 mt-2 w-44 rounded-lg border border-border bg-surface shadow-lg overflow-hidden transition-all transform origin-top ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        {themes.map((t) => (
          <button
            key={t}
            onClick={() => handleThemeChange(t)}
            role="menuitem"
            className={`block w-full text-left px-4 py-2 text-text hover:bg-accent/20 transition ${
              theme === t ? "font-semibold" : "font-normal"
            }`}
          >
            {pretty(t)}
          </button>
        ))}

        <hr className="border-t border-border my-1" />

        {/* Dark mode toggle inside dropdown */}
        <button
          onClick={handleDarkToggle}
          className="block w-full text-left px-4 py-2 text-text hover:bg-accent/20 transition"
        >
          {dark ? "Dark Mode" : "Light Mode"}
        </button>
      </div>
    </div>
  );
}
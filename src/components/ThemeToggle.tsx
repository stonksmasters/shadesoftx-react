import { useEffect, useState, useRef } from "react";

const themes = ["default", "blue", "red", "texas"] as const;

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>("default");
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "default";
    const savedDark = localStorage.getItem("dark") === "true";
    setTheme(savedTheme);
    setDark(savedDark);
    applyTheme(savedTheme, savedDark);
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

  const applyTheme = (theme: string, dark: boolean) => {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
    if (dark) html.setAttribute("data-dark", "true");
    else html.removeAttribute("data-dark");
  };

  const handleThemeChange = (newTheme: string) => {
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
      >
        {theme.charAt(0).toUpperCase() + theme.slice(1)}
        <span className="ml-1 text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown */}
      <div
        className={`absolute right-0 mt-2 w-36 rounded-lg border border-border bg-surface shadow-lg overflow-hidden transition-all transform origin-top ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        {themes.map((t) => (
          <button
            key={t}
            onClick={() => handleThemeChange(t)}
            className={`block w-full text-left px-4 py-2 text-text hover:bg-accent/20 transition ${
              theme === t ? "font-semibold" : "font-normal"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
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

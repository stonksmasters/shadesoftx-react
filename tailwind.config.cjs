module.exports = {
  darkMode: "class", // important!
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#ffffff",
        surface: "#F3F4F6",
        border: "#E5E7EB",
        muted: "#6B7280",
        rgb: "#111827",
        primary: "#1E40AF",
        "primary-content": "#fff",
        accent: "#F59E0B",
      },
    },
  },
};

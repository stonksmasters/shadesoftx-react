module.exports = {
  darkMode: "class", // important!
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        muted: "var(--color-muted)",
        rgb: "var(--color-text)",
        primary: "var(--color-primary)",
        "primary-content": "var(--color-primary-content)",
        accent: "var(--color-accent)",
      },
    },
  },
};

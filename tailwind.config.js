// Create tailwind.config.js
module.exports = {
    content: [
      "./app/**/*.{js,jsx,ts,tsx}",
      "./components/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: '#0284C7',
          background: '#111827',
          card: '#1F2937',
          destructive: '#EF4444',
        },
      },
    },
    plugins: [],
  };
  
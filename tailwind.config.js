module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        phase: {
          red: '#E31837',      // Primary Phase 10 red
          yellow: '#FFD700',   // Card accent color
          white: '#FFFFFF',    // Card background
          blue: '#007ACC',     // Secondary accent
          gray: '#2C3E50',     // Text and borders
        }
      },
    },
  },
  plugins: [],
}

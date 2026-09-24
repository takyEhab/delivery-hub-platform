/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand is mapped to luxurious oceanic cyan & teal
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4', // Vibrant sea cyan
          600: '#0891b2', // Deep marine cyan
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        // Deep marine navy palette
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#0a2540',
          950: '#031326',
        },
        // Fresh seafood accent (prawn / cooked crab / citrus garnish)
        coral: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        sans: ['Cairo', 'Outfit', 'Inter', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.12)',
        'card-hover': '0 8px 16px -2px rgba(6, 182, 212, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        'ocean-glow': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'coral-glow': '0 0 25px -5px rgba(249, 115, 22, 0.35)',
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(135deg, #031326 0%, #0a2540 50%, #0e3b5e 100%)',
        'marine-card': 'linear-gradient(180deg, rgba(14, 41, 84, 0.4) 0%, rgba(3, 19, 38, 0.7) 100%)',
      }
    },
  },
  plugins: [],
}

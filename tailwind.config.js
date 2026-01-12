/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Common text colors
    'text-red-500', 'text-blue-500', 'text-green-500', 'text-yellow-500',
    'text-purple-500', 'text-pink-500', 'text-gray-500', 'text-gray-700',
    // Common background colors
    'bg-red-100', 'bg-blue-100', 'bg-green-100', 'bg-yellow-100',
    'bg-purple-100', 'bg-pink-100', 'bg-gray-100', 'bg-white',
    // Common padding/margin
    'p-2', 'p-4', 'p-6', 'p-8', 'px-2', 'px-4', 'py-2', 'py-4',
    'm-2', 'm-4', 'mx-2', 'mx-4', 'my-2', 'my-4',
    // Common layout
    'flex', 'grid', 'block', 'inline-block', 'hidden',
    'flex-col', 'flex-row', 'items-center', 'justify-center',
    // Common borders
    'border', 'border-2', 'border-gray-300', 'rounded', 'rounded-lg',
    // Common widths
    'w-full', 'w-1/2', 'w-1/3', 'w-2/3',
    // Common font weights
    'font-bold', 'font-semibold', 'font-normal',
    // Common text sizes
    'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
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
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

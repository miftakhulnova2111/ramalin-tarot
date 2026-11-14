import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        tarot: {
          canvas: '#150F21',
          surface: '#22162B',
          surfaceElevated: '#2B1D36',
          plum: '#733B73',
          teal: '#427C80',
          tealSurface: '#1A3033',
          gold: '#FFD58C',
          amber: '#F99551',
          coral: '#F55654',
          sage: '#91B87C',
          text: '#F7EEDD',
          muted: '#9B98A6',
          border: 'rgba(255, 213, 140, 0.16)',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Cinzel', 'serif'],
        sans: ['Plus Jakarta Sans', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#09142B',
          navyDark: '#061023',
          navyMuted: '#132B5C',
          slate: '#123A73',
          slateLight: '#3465A4',
          sky: '#9CC5FF',
          sand: '#F5F0EB',
          sandDeep: '#E4D9CE',
          charcoal: '#1C1E24',
          charcoalMuted: '#2A3142',
          leaf: '#4CAF7A',
          amber: '#F29B38'
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #09142B 0%, #123A73 40%, #0B1E3F 100%)'
      }
    }
  },
  plugins: []
};

export default config;

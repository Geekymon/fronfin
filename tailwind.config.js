/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
        },
        content: {
          100: '#71717a',
          200: '#52525b',
          300: '#3f3f46',
          400: '#27272a',
        }
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0, 0, 0, 0.05)',
        card: '0 4px 12px rgba(0, 0, 0, 0.05)',
        subtle: '0 1px 3px rgba(0, 0, 0, 0.08)',
        float: '0 8px 30px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in': 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#3f3f46', // tailwind content-300
            a: { color: '#1d4ed8', textDecoration: 'underline' },
            strong: { color: '#27272a' }, // content-400
            h1: { color: '#27272a' },
            h2: { color: '#27272a' },
            h3: { color: '#27272a' },
            code: { color: '#52525b', backgroundColor: '#f4f4f5', padding: '2px 4px', borderRadius: '4px' },
            blockquote: { color: '#52525b', borderLeftColor: '#e4e4e7' },
          }
        }
      }
    },
    fontSize: (() => {
      const baseSize = 1; // rem
      return {
        xs: [`${baseSize * 0.65}rem`, { lineHeight: '1rem' }],
        xsm: [`${baseSize * 0.75}rem`, { lineHeight: '1rem' }],
        sm: [`${baseSize * 0.875}rem`, { lineHeight: '1.25rem' }],
        base: [`${baseSize}rem`, { lineHeight: '1.5rem' }],
        lg: [`${baseSize * 1.125}rem`, { lineHeight: '1.75rem' }],
        xl: [`${baseSize * 1.25}rem`, { lineHeight: '1.75rem' }],
        '2xl': [`${baseSize * 1.5}rem`, { lineHeight: '2rem' }],
        '3xl': [`${baseSize * 1.875}rem`, { lineHeight: '2.25rem' }],
        '4xl': [`${baseSize * 2.25}rem`, { lineHeight: '2.5rem' }],
        '5xl': [`${baseSize * 3}rem`, { lineHeight: '1' }],
      };
    })(),
  },
  plugins: [require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ],
};

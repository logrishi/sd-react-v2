const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: ["class"], // or 'media' or 'class'
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontSize: {
        xs: ['0.75rem', '1rem'],        // 12px
        sm: ['0.875rem', '1.25rem'],     // 14px
        base: ['1rem', '1.5rem'],        // 16px
        lg: ['1.125rem', '1.75rem'],     // 18px
        xl: ['1.25rem', '1.75rem'],      // 20px
        '2xl': ['1.5rem', '2rem'],       // 24px
        '3xl': ['1.875rem', '2.25rem'],  // 30px
      },
      spacing: {
        sidebar: "var(--sidebar-width)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background) / 1)",
        foreground: "hsl(var(--foreground) / 1)",
        card: {
          DEFAULT: "hsl(var(--card) / 1)",
          foreground: "hsl(var(--card-foreground) / 1)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / 1)",
          foreground: "hsl(var(--popover-foreground) / 1)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / 1)",
          foreground: "hsl(var(--primary-foreground) / 1)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / 1)",
          foreground: "hsl(var(--secondary-foreground) / 1)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / 1)",
          foreground: "hsl(var(--muted-foreground) / 1)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / 1)",
          foreground: "hsl(var(--accent-foreground) / 1)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / 1)",
          foreground: "hsl(var(--destructive-foreground) / 1)",
        },
        success: {
          DEFAULT: "hsl(var(--success) / 1)",
          foreground: "hsl(var(--success-foreground) / 1)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning) / 1)",
          foreground: "hsl(var(--warning-foreground) / 1)",
        },
        info: {
          DEFAULT: "hsl(var(--info) / 1)",
          foreground: "hsl(var(--info-foreground) / 1)",
        },
        gray: {
          300: "hsl(var(--gray-300) / 1)",
          400: "hsl(var(--gray-400) / 1)",
          500: "hsl(var(--gray-500) / 1)",
          600: "hsl(var(--gray-600) / 1)",
          700: "hsl(var(--gray-700) / 1)",
          800: "hsl(var(--gray-800) / 1)",
          900: "hsl(var(--gray-900) / 1)",
        },
        amber: {
          500: "hsl(var(--amber-500) / 1)",
          600: "hsl(var(--amber-600) / 1)",
        },
        red: {
          500: "hsl(var(--red-500) / 1)",
        },
        green: {
          100: "hsl(var(--green-100) / 1)",
          500: "hsl(var(--green-500) / 1)",
          600: "hsl(var(--green-600) / 1)",
          800: "hsl(var(--green-800) / 1)",
        },
        blue: {
          100: "hsl(var(--blue-100) / 1)",
          600: "hsl(var(--blue-600) / 1)",
        },
        yellow: {
          400: "hsl(var(--yellow-400) / 1)",
        },
        orange: {
          500: "hsl(var(--orange-500) / 1)",
          600: "hsl(var(--orange-600) / 1)",
        },
        border: "hsl(var(--border) / 1)",
        input: "hsl(var(--input) / 1)",
        ring: "hsl(var(--ring) / 1)",
        chart: {
          1: "hsl(var(--chart-1) / 1)",
          2: "hsl(var(--chart-2) / 1)",
          3: "hsl(var(--chart-3) / 1)",
          4: "hsl(var(--chart-4) / 1)",
          5: "hsl(var(--chart-5) / 1)",
        },
        "header-background": "hsl(var(--background) / 0.8)",
        "tab-active-background": "hsl(var(--secondary) / 1)",
        "tab-hover-background": "hsl(var(--muted) / 1)",
        "active-tab-color": "hsl(var(--primary) / 1)",
        "icon-inactive": "hsl(var(--muted-foreground) / 1)",
        "sidebar-background": "hsl(var(--background) / 1)",
        "navigation-background": "hsl(var(--background) / 1)",
        "link-color": "hsl(var(--primary) / 1)",
        "link-hover-color": "hsl(var(--primary-foreground) / 1)",
        "switch-background": "hsl(var(--primary) / 1)",
        "border-light": "hsl(var(--foreground) / 0.2)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["dark"],
      textColor: ["dark"],
    },
  },
  plugins: [heroui(), require("tailwindcss-animate"), require("tailwindcss-motion")],
};

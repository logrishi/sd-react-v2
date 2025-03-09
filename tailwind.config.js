const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: ["class", "class"], // or 'media' or 'class'
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		spacing: {
  			sidebar: 'var(--sidebar-width)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background) / 1)',
  			foreground: 'hsl(var(--foreground) / 1)',
  			card: {
  				DEFAULT: 'hsl(var(--card) / 1)',
  				foreground: 'hsl(var(--card-foreground) / 1)'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover) / 1)',
  				foreground: 'hsl(var(--popover-foreground) / 1)'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary) / 1)',
  				foreground: 'hsl(var(--primary-foreground) / 1)'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary) / 1)',
  				foreground: 'hsl(var(--secondary-foreground) / 1)'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted) / 1)',
  				foreground: 'hsl(var(--muted-foreground) / 1)'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent) / 1)',
  				foreground: 'hsl(var(--accent-foreground) / 1)'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive) / 1)',
  				foreground: 'hsl(var(--destructive-foreground) / 1)'
  			},
  			border: 'hsl(var(--border) / 1)',
  			input: 'hsl(var(--input) / 1)',
  			ring: 'hsl(var(--ring) / 1)',
  			chart: {
  				'1': 'hsl(var(--chart-1) / 1)',
  				'2': 'hsl(var(--chart-2) / 1)',
  				'3': 'hsl(var(--chart-3) / 1)',
  				'4': 'hsl(var(--chart-4) / 1)',
  				'5': 'hsl(var(--chart-5) / 1)'
  			},
  			'header-background': 'hsl(var(--background) / 0.8)',
  			'tab-active-background': 'hsl(var(--secondary) / 1)',
  			'tab-hover-background': 'hsl(var(--muted) / 1)',
  			'active-tab-color': 'hsl(var(--primary) / 1)',
  			'icon-inactive': 'hsl(var(--muted-foreground) / 1)',
  			'sidebar-background': 'hsl(var(--background) / 1)',
  			'navigation-background': 'hsl(var(--background) / 1)',
  			'link-color': 'hsl(var(--primary) / 1)',
  			'link-hover-color': 'hsl(var(--primary-foreground) / 1)',
  			'switch-background': 'hsl(var(--primary) / 1)',
  			'border-light': 'hsl(var(--foreground) / 0.2)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  variants: {
    extend: {
      backgroundColor: ["dark"],
      textColor: ["dark"],
    },
  },
  plugins: [
    heroui(),
    require("tailwindcss-animate"), 
    require("tailwindcss-motion")],
};

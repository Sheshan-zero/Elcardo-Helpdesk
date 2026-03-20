import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // Enable class-based dark mode
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Dark theme colors
                primary: {
                    950: '#020617', // Very dark blue/black
                    900: '#0f172a', // Slate 900
                    800: '#1e293b', // Slate 800
                    700: '#334155', // Slate 700
                    600: '#475569', // Slate 600
                },
                // Light theme colors - REDESIGNED for calmness
                light: {
                    50: '#fafbfc',  // Very light neutral
                    100: '#f5f7fa', // Soft background
                    200: '#e4e9f2', // Subtle borders
                    300: '#c5cee0', // Medium gray-blue
                    400: '#8792a8', // Darker gray-blue
                    bg: '#f8fafc',  // Main background (very soft blue-gray)
                    card: '#ffffff', // Card background (pure white)
                    border: '#e2e8f0', // Border color (soft gray)
                    sidebar: '#fcfdfe', // Sidebar background (almost white with hint of warmth)
                },
                accent: {
                    blue: '#3b82f6',
                    cyan: '#06b6d4',
                    purple: '#8b5cf6',
                },
                glass: {
                    light: 'rgba(255, 255, 255, 0.05)',
                    medium: 'rgba(255, 255, 255, 0.10)',
                    dark: 'rgba(0, 0, 0, 0.3)',
                    border: 'rgba(255, 255, 255, 0.1)',
                },
            },
            backgroundImage: {
                // Dark theme gradients
                'gradient-body': 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
                'gradient-sidebar': 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.4) 100%)',
                'gradient-card': 'linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)',
                'gradient-accent': 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 50%, #8b5cf6 100%)',
                'gradient-accent-hover': 'linear-gradient(90deg, #60a5fa 0%, #22d3ee 50%, #a78bfa 100%)',
                'gradient-glow': 'radial-gradient(circle at center, rgba(6, 182, 212, 0.2) 0%, transparent 70%)',
                // Light theme gradients - REDESIGNED
                'gradient-body-light': 'linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%)',
                'gradient-sidebar-light': 'linear-gradient(to bottom, #ffffff 0%, #fafbfc 100%)',
                'gradient-card-light': 'linear-gradient(to bottom, #ffffff 0%, #fcfdfe 100%)',
            },
            boxShadow: {
                // Dark theme shadows
                'glow': '0 0 20px rgba(59, 130, 246, 0.4)',
                'glow-lg': '0 0 40px rgba(59, 130, 246, 0.5)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'glass-lg': '0 12px 48px 0 rgba(0, 0, 0, 0.5)',
                'card': '0px 3.5px 5.5px rgba(0, 0, 0, 0.02)',
                // Light theme shadows - REDESIGNED (softer, more elegant)
                'soft': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'soft-md': '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
                'soft-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                'soft-xl': '0 8px 12px -2px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
            },
            backdropBlur: {
                'glass': '12px',
                'glass-lg': '20px',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
        },
    },

    plugins: [forms],
};

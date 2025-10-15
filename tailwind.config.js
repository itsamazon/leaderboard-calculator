/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'studio-forest': '#153F2A',
                'studio-lime': '#C9E960',
                'studio-charcoal': '#1E1E1E',
            },
            fontFamily: {
                'jakarta': ['"Plus Jakarta Sans"', 'sans-serif'],
            },
            letterSpacing: {
                'tighter-2': '-0.02em',
                'tighter-1': '-0.01em',
            },
            lineHeight: {
                '166': '1.66',
            },
        },
    },
    plugins: [],
}


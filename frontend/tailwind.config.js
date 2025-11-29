/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'arabic': ['Cairo', 'Tajawal', 'Arial', 'sans-serif'],
                'madani': ['Cairo', 'Tajawal', 'Arial', 'sans-serif'],
            },
        },
    },
    plugins: [],
}

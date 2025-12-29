export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                spaceDark: "#050510",
                spaceBlue: "#151530",
                spacelight: "#2a2a4a",
                neonBlue: "#00F0FF",
                neonPurple: "#BC13FE",
                techGreen: "#00FF9D",
                techRed: "#FF3864",
                techOrange: "#FF9F1C",
            },
            animation: {
                "spin-slow": "spin 20s linear infinite",
                "float": "float 6s ease-in-out infinite",
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-20px)" },
                },
            },
        },
    },
    plugins: [],
}

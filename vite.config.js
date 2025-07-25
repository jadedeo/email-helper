// vite.config.js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    define: {
        global: {},
        "process.env": {},
    },
    plugins: [vue(), tailwindcss()],
    build: {
        target: "esnext",
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, "index.html"),
            },
            output: {
                globals: {
                    chrome: "chrome",
                },
            },
        },
    },
});

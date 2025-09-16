import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ command }) => {
  const isProduction = command === 'build';
  const base = isProduction && process.env.VITE_APP_BASE_PATH 
    ? process.env.VITE_APP_BASE_PATH 
    : '/';

  return {
    base: base, // Conditionally set the base path
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  // Относительные пути ассетов — корректно работают на GitHub Pages при любом имени репозитория.
  base: "./",
  // Уважаем PORT из окружения (для дев-превью), иначе порт Vite по умолчанию.
  server: process.env.PORT ? { port: Number(process.env.PORT) } : undefined,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  // Относительные пути ассетов — корректно работают на GitHub Pages при любом имени репозитория.
  base: "./",
  // Уважаем PORT из окружения (для дев-превью), иначе порт Vite по умолчанию.
  server: process.env.PORT ? { port: Number(process.env.PORT) } : undefined,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon-180x180.png", "icon.svg"],
      manifest: {
        name: "Рассрочка + депозит",
        short_name: "Рассрочка",
        description:
          "Калькулятор: сравнивает доход с депозита при выплате беспроцентной рассрочки с разовым бонусом за оплату сразу.",
        theme_color: "#2d2d2d",
        background_color: "#2d2d2d",
        display: "standalone",
        orientation: "portrait",
        lang: "ru",
        // scope и start_url относительные — работают на любом subpath GitHub Pages
        scope: "./",
        start_url: "./",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // woff2 обязателен: @fontsource-variable/* кладёт шрифты в dist/assets/*.woff2
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

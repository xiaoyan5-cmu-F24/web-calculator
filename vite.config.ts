import { defineConfig } from 'vitest/config'; // Config function supporting both Vite and Vitest
import { viteSingleFile } from 'vite-plugin-singlefile'; // Plugin to bundle everything into one HTML file
import { VitePWA } from 'vite-plugin-pwa'; // Plugin to make app work offline (PWA)

export default defineConfig({
    base: '/web-calculator/', // URL path for GitHub Pages deployment
    root: 'src', // Source files location
    build: {
        outDir: '../dist', // Where to put built files
        emptyOutDir: true, // Clean output folder before building
    },
    test: {
        environment: 'jsdom', // Use browser-like environment for DOM testing
        setupFiles: './test/setup.ts', // Run this file before each test
        css: true, // Process CSS imports in tests
        coverage: {
            provider: 'v8', // Use V8 engine for coverage analysis
            reporter: ['text', 'html'], // Show coverage in terminal and generate HTML report
        },
    },
    plugins: [
        viteSingleFile(), // Bundle everything into one HTML file
        VitePWA({
            registerType: 'autoUpdate', // Automatically update when new version available
            injectRegister: 'inline', // Add service worker code directly in HTML
            manifest: {
                name: 'Web Calculator', // Full app name
                short_name: 'Calculator', // Short name for home screen
                description: 'A fast, offline calculator', // App description
                start_url: '/web-calculator/', // Starting page when opened
                scope: '/web-calculator/', // Which URLs this PWA controls
                display: 'standalone', // Look like a native app
                background_color: '#ffffff', // Background color while loading
                theme_color: '#ffffff', // Browser theme color
                orientation: 'portrait', // Preferred screen orientation
                icons: [
                    { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' }, // Small icon
                    { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' }, // Large icon
                    {
                        src: 'pwa-512-maskable.png', // Icon that adapts to different shapes
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{html,js,css,ico,png,svg}'], // Files to cache for offline use
                runtimeCaching: [
                    // Cache external resources
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i, // Google Fonts CSS
                        handler: 'StaleWhileRevalidate', // Use cache first, update in background
                        options: { cacheName: 'google-fonts-stylesheets' },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i, // Google Fonts files
                        handler: 'CacheFirst', // Use cache, only fetch if not cached
                        options: {
                            cacheName: 'google-fonts-webfonts',
                            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }, // Keep for 1 year
                        },
                    },
                ],
            },
        }),
    ],
});

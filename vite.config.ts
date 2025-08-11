import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    // You deploy to GitHub Pages under a subpath: /web-calculator/
    base: '/web-calculator/',
    root: 'src',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
    },
    plugins: [
        viteSingleFile(), // keep if you like the "one HTML file" output
        VitePWA({
            registerType: 'autoUpdate',
            // Safer with single-file builds: inject the SW registration inline
            injectRegister: 'inline',
            manifest: {
                name: 'Web Calculator',
                short_name: 'Calculator',
                description: 'A fast, offline calculator',
                start_url: '/web-calculator/',
                scope: '/web-calculator/',
                display: 'standalone',
                background_color: '#ffffff',
                theme_color: '#111827',
                orientation: 'portrait',
                icons: [
                    { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
                    {
                        src: 'pwa-512-maskable.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{html,js,css,ico,png,svg}'],
                // Cache Google Fonts / Material Symbols for offline
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'StaleWhileRevalidate',
                        options: { cacheName: 'google-fonts-stylesheets' },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-webfonts',
                            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
                        },
                    },
                ],
            },
        }),
    ],
});

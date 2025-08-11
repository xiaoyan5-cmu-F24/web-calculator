import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile'; // <- optional

export default defineConfig({
    // You deploy to GitHub Pages under a subpath: /web-calculator/
    // IMPORTANT: change this if you move to a custom domain or a user site.
    base: '/web-calculator/',
    root: 'src',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
    },
    plugins: [viteSingleFile()], // <- enable if you want ONE html file output
});

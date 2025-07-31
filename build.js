const fs = require('fs');
const path = require('path');

// Paths
const srcDir = path.join(__dirname, 'src');
const cmpDir = path.join(__dirname, 'cmp');
const distDir = path.join(__dirname, 'dist');
const htmlFile = path.join(srcDir, 'index.html');
const cssFile = path.join(srcDir, 'index.css');
// index.ts is compiled to index.js in the cmp directory
const jsFile = path.join(cmpDir, 'index.js');
const outputFile = path.join(distDir, 'index.html');

const createDistDir = () => {
    if (fs.existsSync(distDir)) {
        // Clean existing dist directory
        fs.rmSync(distDir, { recursive: true, force: true });
        console.log('🧹 Cleaned existing dist directory');
    }

    fs.mkdirSync(distDir, { recursive: true });
    console.log('📁 Created dist directory');
}

const readFileIfExists = (filePath) => {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.warn(`⚠️  Warning: Could not read ${filePath}`);
        return '';
    }
}

const bundleFiles = () => {
    console.log('🚀 Starting build process...');

    // Create dist directory
    createDistDir();

    // Read source files
    let htmlContent = readFileIfExists(htmlFile);
    const cssContent = readFileIfExists(cssFile);
    const jsContent = readFileIfExists(jsFile);

    if (!htmlContent) {
        console.error('❌ Error: index.html not found in src directory');
        process.exit(1);
    }

    // Inject CSS into HTML
    if (cssContent) {
        const cssTag = `<style>\n${cssContent}\n</style>`;

        // Try to replace existing link tag or add to head
        if (htmlContent.includes('<link') && htmlContent.includes('index.css')) {
            htmlContent = htmlContent.replace(/<link[^>]*index\.css[^>]*>/gi, cssTag);
            console.log('✅ CSS inlined (replaced link tag)');
        } else if (htmlContent.includes('</head>')) {
            htmlContent = htmlContent.replace('</head>', `  ${cssTag}\n</head>`);
            console.log('✅ CSS inlined (added to head)');
        } else {
            console.warn('⚠️  Warning: Could not find </head> tag, CSS not inlined');
        }
    }

    // Inject JavaScript into HTML
    if (jsContent) {
        const jsTag = `<script>\n${jsContent}\n</script>`;

        // Try to replace existing script tag or add before closing body
        if (htmlContent.includes('<script') && htmlContent.includes('index.js')) {
            htmlContent = htmlContent.replace(/<script[^>]*src[^>]*index\.js[^>]*><\/script>/gi, jsTag);
            console.log('✅ JavaScript inlined (replaced script tag)');
        } else if (htmlContent.includes('</body>')) {
            htmlContent = htmlContent.replace('</body>', `  ${jsTag}\n</body>`);
            console.log('✅ JavaScript inlined (added to body)');
        } else {
            // Fallback: add at the end
            htmlContent += `\n${jsTag}`;
            console.log('✅ JavaScript inlined (added at end)');
        }
    }

    // Write bundled file
    fs.writeFileSync(outputFile, htmlContent, 'utf8');

    // Get file size
    const stats = fs.statSync(outputFile);
    const fileSizeKB = (stats.size / 1024).toFixed(2);

    console.log('🎉 Build completed successfully!');
    console.log(`📝 Output: ${outputFile}`);
    console.log(`📦 Size: ${fileSizeKB} KB`);
}

// Run the build
try {
    bundleFiles();
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}
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

// Remove export statements from code
const removeExports = (content) => {
    // Remove export statements but keep the declarations
    let modifiedContent = content;

    // Remove 'export default' but keep the declaration
    modifiedContent = modifiedContent.replace(/export\s+default\s+/g, '');

    // Remove 'export' from variable declarations: export const/let/var
    modifiedContent = modifiedContent.replace(/export\s+(const|let|var)\s+/g, '$1 ');

    // Remove 'export' from function declarations: export function
    modifiedContent = modifiedContent.replace(/export\s+function\s+/g, 'function ');

    // Remove 'export' from class declarations: export class
    modifiedContent = modifiedContent.replace(/export\s+class\s+/g, 'class ');

    // Remove named exports like: export { something }
    modifiedContent = modifiedContent.replace(/export\s*\{[^}]+\}\s*;?/g, '');

    // Remove export expressions like: export { something as default }
    modifiedContent = modifiedContent.replace(/export\s*\{[^}]+\}\s*from\s*['"][^'"]+['"]\s*;?/g, '');

    // Remove re-exports like: export * from './module'
    modifiedContent = modifiedContent.replace(/export\s*\*\s*(as\s+\w+\s+)?from\s*['"][^'"]+['"]\s*;?/g, '');

    return modifiedContent;
}

// Bundle JavaScript with import resolution
const bundleJavaScript = (entryFile, processedFiles = new Set()) => {
    // Avoid circular dependencies
    if (processedFiles.has(entryFile)) {
        console.warn(`⚠️  Circular dependency detected: ${entryFile}`);
        return '';
    }

    processedFiles.add(entryFile);

    // Read the file content
    let content = readFileIfExists(entryFile);
    if (!content) {
        console.warn(`⚠️  Could not read JavaScript file: ${entryFile}`);
        return '';
    }

    // Regular expressions to match different import styles
    const importRegexes = [
        // import { Something } from './module'
        /import\s*\{[^}]+\}\s*from\s*['"]([^'"]+)['"]\s*;?/g,
        // import Something from './module'
        /import\s+(\w+)\s+from\s*['"]([^'"]+)['"]\s*;?/g,
        // import * as Something from './module'
        /import\s*\*\s*as\s+(\w+)\s+from\s*['"]([^'"]+)['"]\s*;?/g,
        // import './module'
        /import\s*['"]([^'"]+)['"]\s*;?/g
    ];

    // Process imports
    const processedImports = new Set();
    let bundledContent = '';

    // Extract all imports first
    const imports = [];

    // Match named imports: import { Something } from './module'
    content.replace(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]\s*;?/g, (match, names, filePath) => {
        imports.push({ match, names: names.trim(), filePath, type: 'named' });
        return match;
    });

    // Match default imports: import Something from './module'
    content.replace(/import\s+(\w+)\s+from\s*['"]([^'"]+)['"]\s*;?/g, (match, name, filePath) => {
        if (!match.includes('{')) { // Avoid matching named imports
            imports.push({ match, name, filePath, type: 'default' });
        }
        return match;
    });

    // Match namespace imports: import * as Something from './module'
    content.replace(/import\s*\*\s*as\s+(\w+)\s+from\s*['"]([^'"]+)['"]\s*;?/g, (match, name, filePath) => {
        imports.push({ match, name, filePath, type: 'namespace' });
        return match;
    });

    // Match side-effect imports: import './module'
    content.replace(/import\s*['"]([^'"]+)['"]\s*;?/g, (match, filePath) => {
        if (!match.includes('from')) { // Avoid matching other import types
            imports.push({ match, filePath, type: 'side-effect' });
        }
        return match;
    });

    // Process each import
    for (const importInfo of imports) {
        const { match, filePath } = importInfo;

        // Skip if already processed
        if (processedImports.has(filePath)) {
            content = content.replace(match, '');
            continue;
        }

        processedImports.add(filePath);

        // Resolve the import path
        const baseDir = path.dirname(entryFile);
        let resolvedPath = path.resolve(baseDir, filePath);

        // Add .js extension if not present
        if (!path.extname(resolvedPath)) {
            resolvedPath += '.js';
        }

        console.log(`📦 Bundling import: ${filePath} from ${path.basename(entryFile)}`);

        // Recursively bundle the imported file
        const importedContent = bundleJavaScript(resolvedPath, processedFiles);

        if (importedContent) {
            // Wrap imported content in an IIFE to avoid variable conflicts
            bundledContent += `\n// Imported from: ${filePath}\n`;

            if (importInfo.type === 'named') {
                // For named imports, we'll just include the content
                // In a real bundler, we'd need to parse exports
                bundledContent += removeExports(importedContent) + '\n';
            } else if (importInfo.type === 'default' || importInfo.type === 'namespace') {
                // For default/namespace imports, wrap in IIFE
                bundledContent += removeExports(importedContent) + '\n';
            } else {
                // Side-effect imports
                bundledContent += removeExports(importedContent) + '\n';
            }
        }

        // Remove the import statement
        content = content.replace(match, '');
    }

    // Add the main content after all imports
    bundledContent += '\n// Main content from: ' + path.basename(entryFile) + '\n';
    bundledContent += removeExports(content);

    return bundledContent;
}

const bundleFiles = () => {
    console.log('🚀 Starting build process...');

    // Create dist directory
    createDistDir();

    // Read source files
    let htmlContent = readFileIfExists(htmlFile);
    const cssContent = readFileIfExists(cssFile);

    if (!htmlContent) {
        console.error('❌ Error: index.html not found in src directory');
        process.exit(1);
    }

    // Bundle JavaScript with import resolution
    console.log('📦 Bundling JavaScript...');
    const jsContent = bundleJavaScript(jsFile);

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
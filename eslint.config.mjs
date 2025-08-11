import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
    // 1) Ignore build output & vendor
    { ignores: [
        'dist', 
        'node_modules',
        'evolution-history'
    ] },

    // 2) App source: TypeScript and JavaScript in browser
    { 
        files: ['src/**/*.{js,ts,jsx,tsx}'],
        languageOptions: {
            // typescript-eslint will auto-set its parser
            parserOptions: {
                project: ['./tsconfig.json'], // enables type-aware rules
            },
            // Specify global variables
            globals: {
                ...globals.browser,
            },
        },
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommendedTypeChecked, // type-aware rules
            prettier
        ],
        rules: {
            // custom rules here (kept minimal to avoid fighting Prettier)
            // 'no-console': ['warn', { allow: ['warn', 'error'] }],
        },
    },

    // 3) Config files / Node env (vite config, scripts if any)
    {
        files: ['vite.config.*', 'tsconfig.node.json', '*.cjs', '*.mjs'],
        languageOptions: {
            globals: { ...globals.node },
        },
        extends: [js.configs.recommended, prettier],
    }
);
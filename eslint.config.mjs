import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    // This single line safely handles Core Web Vitals, TypeScript, and Prettier
    ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
    
    // This object replaces the `globalIgnores` function
    {
        ignores: [
            '.next/**',
            'out/**',
            'build/**',
            'next-env.d.ts',
        ]
    }
];

export default eslintConfig;
// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default tseslint.config(
  { ignores: ['dist/**', '.astro/**', 'node_modules/**', 'docs/concepts/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    rules: {
      // The site is a work sample: an unused symbol is a reader's dead end.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Build-time scripts run in Node, not in the browser. Declared explicitly
    // rather than pulling in a globals package for two names.
    files: ['**/*.mjs', 'eslint.config.js', 'astro.config.mjs'],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly' },
    },
  },
);

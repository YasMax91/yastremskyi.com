// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

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
    // Build scripts, the contact endpoint and its tests all run in Node, not in
    // a browser. Taking the whole set rather than naming globals one at a time:
    // the alternative is discovering each missing name through a failing lint.
    files: ['**/*.mjs', 'eslint.config.js', 'astro.config.mjs'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
);

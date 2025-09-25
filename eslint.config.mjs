import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  {
    files: ['**/*.ts', '**/*.js'], // Includes test files
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node, // Backend and tests run in Node.js
        ...globals.browser, // Frontend runs in browser
        ...globals.jest, // Test files use Jest
        // MagicMirror-specific globals (mark as readonly)
        Module: 'readonly',
        Log: 'readonly',
        config: 'readonly',
        moment: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier: prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...typescript.configs.recommended.rules,
      ...prettier.configs.recommended.rules,
    },
  },
  {
    ignores: ['MMM-Fuel-NSW.js', 'node_helper.js', 'node_modules/**', '.git/**', 'data'],
  },
];

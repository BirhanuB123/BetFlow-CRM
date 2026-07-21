// @ts-check
// ESLint config for NestJS apps in the BetFlow CRM monorepo.
// apps/api/eslint.config.mjs extends this.

import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { baseRules } from './base.mjs';

/** @param {string} tsconfigRootDir - absolute path to the app root (pass import.meta.dirname) */
export function createNestConfig(tsconfigRootDir) {
  return tseslint.config(
    { ignores: ['eslint.config.mjs', 'dist/**'] },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest,
        },
        sourceType: 'commonjs',
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
    },
    ...baseRules,
    {
      rules: {
        // NestJS-specific overrides
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
        'prettier/prettier': ['error', { endOfLine: 'auto' }],
      },
    },
  );
}

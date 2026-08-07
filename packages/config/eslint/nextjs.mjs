// @ts-check
// ESLint config for Next.js apps in the BetFlow CRM monorepo.
// apps/web/eslint.config.mjs extends this.

import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { baseRules } from './base.mjs';

export function createNextConfig() {
  return defineConfig([
    ...nextVitals,
    ...nextTs,
    globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
    ...baseRules,
    {
      rules: {
        // Next.js-specific overrides
        '@next/next/no-html-link-for-pages': 'off',
        'react-compiler/react-compiler': 'off',
        'react-hooks/rules-of-hooks': 'warn',
        'react-hooks/exhaustive-deps': 'warn',
        'react-hooks/set-state-in-effect': 'off',
        'react-hooks/refs': 'warn',
        'react-hooks/preserve-manual-memoization': 'warn',
        'react/no-unescaped-entities': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
      },
    },
  ]);
}

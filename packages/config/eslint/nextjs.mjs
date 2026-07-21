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
        '@next/next/no-html-link-for-pages': 'error',
      },
    },
  ]);
}

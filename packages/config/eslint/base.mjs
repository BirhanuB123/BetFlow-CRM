// @ts-check
// Base ESLint rules shared across all apps in the BetFlow CRM monorepo.
// App-specific configs spread this and add their own rules.

/** @type {import('typescript-eslint').ConfigArray} */
export const baseRules = [
  {
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-duplicate-imports': 'error',
    },
  },
];

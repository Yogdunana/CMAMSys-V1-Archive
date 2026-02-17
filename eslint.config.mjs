import nextTs from 'eslint-config-next/typescript';
import nextVitals from 'eslint-config-next/core-web-vitals';
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    rules: {
      // Temporarily allow 'any' type for migration
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow require() in .js files for legacy scripts
      '@typescript-eslint/no-require-imports': 'off',
      // Turn off unused vars warnings for now
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      // Allow Function type for now
      '@typescript-eslint/no-unsafe-function-type': 'off',
      // Allow let instead of const for flexibility
      'prefer-const': 'off',
      // Allow unescaped entities in JSX
      'react/no-unescaped-entities': 'off',
      // Allow missing dependencies in useEffect (will fix later)
      'react-hooks/exhaustive-deps': 'off',
      // Allow setState in effect (legacy pattern)
      'react-hooks/set-state-in-effect': 'off',
      // Allow immability issues temporarily
      'react-hooks/immutability': 'off',
      // Allow img element instead of Next.js Image
      '@next/next/no-img-element': 'off',
    },
  },
]);

export default eslintConfig;

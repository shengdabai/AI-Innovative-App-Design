module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended'],
  env: { node: true, jest: true, es2021: true },
  ignorePatterns: ['dist/', 'node_modules/'],
  rules: {
    // TypeScript handles symbol resolution; declarations use TS syntax.
    'no-undef': 'off',
    'no-unused-vars': 'off',
  },
};

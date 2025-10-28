import eslintConfigPrettier from 'eslint-config-prettier';
import pluginImport from 'eslint-plugin-import';
import pluginN from 'eslint-plugin-n';
import pluginPromise from 'eslint-plugin-promise';

export default [
  {
    ignores: ['server/**', 'docs/**', 'coverage/**'],
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...Object.fromEntries(
          [
            'setTimeout',
            'clearTimeout',
            'setInterval',
            'clearInterval',
            'setImmediate',
            'clearImmediate',
            'queueMicrotask',
          ].map((name) => [name, 'readonly'])
        ),
      },
    },
    plugins: {
      import: pluginImport,
      n: pluginN,
      promise: pluginPromise,
    },
    rules: {
      ...pluginImport.configs.recommended.rules,
      ...pluginN.configs.recommended.rules,
      ...pluginPromise.configs.recommended.rules,
      ...eslintConfigPrettier.rules,
      'import/order': 'off',
      'import/no-named-as-default': 'off',
      'n/no-process-exit': 'off',
      'n/hashbang': 'off',
      'n/no-unpublished-import': 'off',
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js'],
        },
      },
    },
  },
  {
    files: ['tests/**/*.js'],
    rules: {
      'n/no-extraneous-import': 'off',
    },
  },
  {
    files: ['eslint.config.js'],
    rules: {
      'n/no-unpublished-import': 'off',
    },
  },
];

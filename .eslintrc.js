module.exports = {
  'env': {
    'node': true,
    'mocha': true,
    'es6': true, // Required for root `Promise`
  },
  'parserOptions': {
    'ecmaVersion': 2017 // Required for async/await
  },
  'extends': 'eslint:recommended',
  'rules': {
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'never'
    ],
    'no-console': [
      'off',
    ],
    'prefer-arrow-callback': [
      'error',
    ],
    'object-curly-spacing': [
      'error',
      'always'
    ],
    'no-unused-vars': [
      'error',
      {
        'argsIgnorePattern': '^_'
      }
    ]
  }
}

module.exports = {
  'env': {
    'browser': true,
    'es6': true,
    'node': true,
  },
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  'installedESLint': true,
  'parser': 'babel-eslint',
  'plugins': [
    'import',
    'react',
  ],
  'globals': {
    'html2canvas': false,
  },
  'rules': {
    'comma-dangle': ['error', 'always-multiline'],
    'indent': ['warn', 2],
    'linebreak-style': ['error', 'unix'],
    'no-console': ['warn', {'allow': ['warn', 'error']}],
    'no-var': 'error',
    'no-unused-vars': ['warn', {'args': 'none'}],
    'semi': ['error', 'never'],
    'unicode-bom': 'error',
    'react/prop-types': 'off',
  },
  'settings': {
    'import/resolver': {
      'node': {
        'extensions': ['.js', '.jsx', '.es', '.coffee', '.cjsx'],
        'paths': [__dirname],
      },
    },
    'import/core-modules': [
      'bluebird',
      'electron',
      'react',
      'react-redux',
      'redux-observers',
      'reselect',
      'react-bootstrap',
      'react-fontawesome',
      'path-extra',
      'fs-extra',
      'lodash',
      'cson',
    ],
  },
}

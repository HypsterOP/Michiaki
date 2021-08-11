module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  extends: ["eslint:recommended", "@wildpeaks/eslint-config-commonjs"],
  parserOptions: {
    ecmaVersion: 12
  },
  plugins: ["sort-requires"],
  rules: {
    indent: ["error", 2],
    "linebreak-style": ["error", "windows"],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    strict: "off",
    "sort-requires/sort-requires": 2,
    "line-comment-position": "off",
    "max-statements-per-line": "off",
    "new-cap": "off",
    "no-unused-expressions": "off",
    "no-unused-vars": "off",
    "no-useless-escape": "off",
    "no-shadow": "off",
    "no-undef": "off",
    "no-cond-assign": "off",
    "no-empty-function": "off",
    "no-multi-assign": "off",
    "no-extend-native": "off",
    "no-prototype-builtins": "off",
    "no-async-promise-executor": "off",
    "require-unicode-regexp": "off",
    "consistent-return": "off",
    "max-len": "off"
  }
};

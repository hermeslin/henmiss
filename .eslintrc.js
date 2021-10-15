module.exports = {
  "parser": "@babel/eslint-parser",
  "env": {
    "es6": true,
    "mocha": true
  },
  "extends": [
    "airbnb-base",
    "plugin:jest/all"
  ],
  "plugins": [
    "jest",
  ],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "rules": {
    "jest/require-hook": "off",
    "no-plusplus": [
      "error",
      {
        "allowForLoopAfterthoughts": true
      }
    ],
    "quotes": [
      "error",
      "single",
      {
        "allowTemplateLiterals": true
      }
    ],
    "import/no-named-as-default": 0,
    "no-console": "off",
    "indent": [
      "error",
      2,
      {
        "SwitchCase": 1
      }
    ],
  }
}
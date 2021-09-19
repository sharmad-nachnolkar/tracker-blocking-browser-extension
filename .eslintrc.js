module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["airbnb-base", "prettier"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    "no-underscore-dangle": "off",
    "consistent-return": "off",
    "default-case": "off",
    "import/prefer-default-export": "off",
    "no-restricted-syntax": "off",
    "no-continue": "off",
    "no-param-reassign": "off",
    "class-methods-use-this": "off",
    "radix": "off",
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
  },
};

module.exports = {
  moduleFileExtensions: ["js", "module"],
  transformIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/*.test.js"],
  transform: {
    "^.+\\.[t|j]s?$": "babel-jest",
  },
};

module.exports = {
    "moduleFileExtensions": [
    "js",
    "json",
    "vue"
  ],
  "transform": {
    "^.+\\.jsx?$": "babel-jest",
    ".*\\.(vue)$": "vue-jest",
    "^.+\\.js$": "babel-jest"
  },
  "transformIgnorePatterns": [
    "/node_modules/(?!(bootstrap-vue)/)"
  ],
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  "testRegex":["\\.spec\\.js$","\\.ispec\\.js$"],

  "collectCoverage": false,
  "collectCoverageFrom": [
    "src/store/**/*.{js,vue}",
    "src/assets/js/**/*.{js,vue}",
    "src/components/**/*.{js,vue}",
    "!**/node_modules/**",
    "!src/assets/js/antlrSource/*"
  ]
}